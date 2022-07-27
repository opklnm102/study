# [MaxScale] Troubleshooting for Using Amazon Aurora MySQL with MaxScale
> date - 2022.07.27  
> keyworkd - maxscale, mysql, aurora  
> 2020년에 MaxScale - Amazon RDS MySQL에서 MaxScale - Amazon Aurora MySQL로 전환시 겪었던 이슈를 정리

<br>

## Requirement

### Dependency
```
MariaDB MaxScale 2.4
Amazon Aurora MySQL
```


<br>

## Issue 1. Replication lag of 'server-writer' is -1s, which is above the configured limit 20s. 'server-writer' is excluded from query routing
```sh
2020-10-01 09:35:05.733   warning: (399) Replication lag of 'server-writer' is -1s, which is above the configured limit 20s. 'server-writer' is excluded from query routing.
2020-10-01 09:35:05.733   warning: (399) Replication lag of 'server-reader' is -1s, which is above the configured limit 20s. 'server-reader' is excluded from query routing.
2020-10-01 09:35:05.733   error  : (399) [readwritesplit] Could not find valid server for target type TARGET_SLAVE, closing connection.
2020-10-01 09:35:05.733   error  : (399) [mariadbclient] Routing the query failed. Session will be closed
```

<br>

### Why?
* 왜  replication lag을 -1s로 읽어오는지?
* 왜 -1s을 20s보다 크다고 판단하는지?

```cc
// rwbackend.cc L:445 ~ 468

void RWBackend::change_rlag_state(SERVER::RLagState new_state, int max_rlag)
{
    mxb_assert(new_state == SERVER::RLagState::BELOW_LIMIT || new_state == SERVER::RLagState::ABOVE_LIMIT);
    namespace atom = maxbase::atomic;
    auto srv = server();
    auto old_state = atom::load(&srv->rlag_state, atom::RELAXED);
 
    if (new_state != old_state)
    {
        atom::store(&srv->rlag_state, new_state, atom::RELAXED);
        // State has just changed, log warning. Don't log catchup if old state was RLAG_NONE.
        if (new_state == SERVER::RLagState::ABOVE_LIMIT)
        {
            MXS_WARNING("Replication lag of '%s' is %is, which is above the configured limit %is. "
                        "'%s' is excluded from query routing.",
                        srv->name(), srv->rlag, max_rlag, srv->name());  // Issue. 여기서 warn log 발생 후 wirter로 routing 종료
        }
        else if (old_state == SERVER::RLagState::ABOVE_LIMIT)
        {
            MXS_WARNING("Replication lag of '%s' is %is, which is below the configured limit %is. "
                        "'%s' is returned to query routing.",
                        srv->name(), srv->rlag, max_rlag, srv->name());
        }
    }
}
```
`change_rlag_state(SERVER::RLagState new_state, int max_rlag)` 사용처를 보면


```cc
// rwsplit_select_backends.cc L:277 ~ 328
 
RWBackend* RWSplitSession::get_slave_backend(int max_rlag)
{
    ...
        bool rlag_ok = rpl_lag_is_ok(backend, max_rlag);  // here
        ...
        if (max_rlag != SERVER::RLAG_UNDEFINED)
        {
            auto state = rlag_ok ? SERVER::RLagState::BELOW_LIMIT : SERVER::RLagState::ABOVE_LIMIT;  // rlag_ok에 따라 state 결정
            backend->change_rlag_state(state, max_rlag);  // here
        }
    }
 
    // Let the slave selection function pick the best server
    PRWBackends::const_iterator rval = m_config.backend_select_fct(candidates);
    return (rval == candidates.end()) ? nullptr : *rval;
}
```
`rlag_ok`에 따라 state 결정, `rpl_lag_is_ok(backend, max_rlag)`로 rlag_ok 결정되므로 `rpl_lag_is_ok(backend, max_rlag)`를 보면

```cc
// readwritesplit.hh L:473 ~ 485
static inline bool rpl_lag_is_ok(mxs::RWBackend* backend, int max_rlag)
{
    auto rlag = backend->server()->rlag;  // here
    return max_rlag == SERVER::RLAG_UNDEFINED || (rlag != SERVER::RLAG_UNDEFINED && rlag <= max_rlag);
}
```
* max_rlag = max_slave_replication_lag 설정 값, rlag = replication lag이므로 _server()->rlag_에 -1로 넘어오면 max_rlag = 20, SERVER::RLAG_UNDEFINED = -1, rlag = -1이되므로 _rlag != SERVER::RLAG_UNDEFINED_라서 return false, false면 state는 `ABOVE_LIMIT`가 되어 query routing이 중지되는 것  
* Aurora monitor는 `SELECT @@aurora_server_id, server_id FROM information_schema.replica_host_status WHERE session_id = ‘MASTER_SESSION_I_D';` query로 master/slave를 marking 하는 로직만 가지고 있다

```cc
// auroramon.cc L:59 ~ 89
 
void AuroraMonitor::update_server_status(MonitorServer* monitored_server)
{
    monitored_server->clear_pending_status(SERVER_MASTER | SERVER_SLAVE);
    MYSQL_RES* result;
 
    /** Connection is OK, query for replica status */
    if (mxs_mysql_query(monitored_server->con,
                        "SELECT @@aurora_server_id, server_id FROM "
                        "information_schema.replica_host_status "
                        "WHERE session_id = 'MASTER_SESSION_ID'") == 0
        && (result = mysql_store_result(monitored_server->con)))
    {
        mxb_assert(mysql_field_count(monitored_server->con) == 2);
        MYSQL_ROW row = mysql_fetch_row(result);
        int status = SERVER_SLAVE;
 
        /** The master will return a row with two identical non-NULL fields */
        if (row && row[0] && row[1] && strcmp(row[0], row[1]) == 0)
        {
            status = SERVER_MASTER;
        }
 
        monitored_server->set_pending_status(status);
        mysql_free_result(result);
    }
    else
    {
        monitored_server->mon_report_query_error();
    }
}
```


* [Aurora Monitor Docs](https://mariadb.com/kb/en/mariadb-maxscale-24-aurora-monitor/#how-aurora-is-monitored)에서는  information_schema.replica_host_status table의 replica_lag_in_milliseconds column_에는 replication lag 정보가 포함되고, detect replication lag에 사용 가능 -> routing module에서 해당 정보를 사용하여 routing한다라고 되어 있지만 source code(MaxScale 2.4.11)에서 해당 쿼리로 구현된 로직이 없다
* MaxScale 2.4.11에 `server()->rlag`를 셋팅해주는 로직이 MariaDB monitor에는 있으나 aurora monitor에는 없어서 _server()->rlag의 default value인 -1이 사용되는 것

```cc
// server.hh L:135
static const int RLAG_UNDEFINED = -1;   // Default replication lag value
 
// server.hh L:200
int           rlag = RLAG_UNDEFINED;/**< Replication Lag for Master/Slave replication */
```

<br>

### Resolve
* Amazon Aurora MySQL architecture를 고려했을 때 reader로의 replication lag은 거의 발생하지 않으므로  `max_slave_replication_lag` 설정 제거하여 해당 이슈를 해소할 수 있었다


<br>

## Issue 2. Amazon Aurora cluster의 instance가 1개일 경우 cluster endpoint를 사용한 readwitesplit router에서 slave를 인식하지 못함
```sh
2020-10-01 02:55:09.809   notice : Server changed state: server-writer[aurora-cluster-xxx.ap-northeast-2.rds.amazonaws.com:3306]: new_master. [Running] -> [Master, Running]
2020-10-01 02:55:09.809   notice : Server changed state: server-reader[aurora-cluster-ro-xxx.ap-northeast-2.rds.amazonaws.com:3306]: new_master. [Running] -> [Master, Running]
```

<br>

### Why?
* Aurora replica는 replication 정보를 `information_schema.replica_host_status` table에 저장하고, table에는 모든 replicas에 대한 정보가 있다

| Name | Description |
|:---|:---|
| server_id | 모든 node의 `@@aurora_server_id` 변수 값 저장 |
| session_id | read-only replicas의 unique string 저장<br>master node면 `MASTER_SESSION_ID`가 저장 |

```sql
-- 현재 node의 @@aurora_server_id와 master node의 @@aurora_server_id를 조회
-- 2개의 field가 동일하면 master node
-- 그외 다른 node는 read-only replicas며 slave로 label 지정
 
SELECT @@aurora_server_id, server_id
FROM information_schema.replica_host_status
WHERE session_id = 'MASTER_SESSION_ID';
```
로 인식하므로 instance가 1개면 위 로직에 의하여 read only cluster endpoint여도 master로 인식하게 됨


<br>

### Resolve
* reader instance를 추가하여 2개의 instance가 되면 read-write/read-only cluster endpoint로도 slave를 인식하게 됨
* 1개의 instance 사용시 read-only endpoint를 master로 인식하여 write traffic이 발생해도 instnace는 read-only mode가 아니기 때문에 write traffic이 처리되므로 instance 개로 구성해도 이슈는 없다
```sh
2020-10-01 06:33:18.831   notice : Server changed state: server-writer[aurora-cluster-xxx.ap-northeast-2.rds.amazonaws.com:3306]: new_master. [Running] -> [Master, Running]
2020-10-01 06:33:18.831   notice : Server changed state: server-reader[aurora-cluster-ro-xxx.ap-northeast-2.rds.amazonaws.com:3306]: new_slave. [Running] -> [Slave, Running]
```


<br>

## Conclusion
* Amazon Aurora MySQL cluster는 자체적으로 read/write query routing이 되므로 MaxScale이 필요 없을 수 있으나 전환 과정에서 side effect를 최소화하기 위해 진행한 방향성으로 인해 겪은 이슈이 대부분이었고, 지금 생각해보면 당시에 MaxScale을 제외하고 진행했으면 훨씬 수월하지 않았을까라는 생각이든다
* MaxScale 2.4.11에서 Aurora monitor는 MariaDB monitor와 다르게 구현되다만 느낌...

<br><br>

> #### Reference
> * [MariaDB MaxScale](https://mariadb.com/kb/en/maxscale/)
