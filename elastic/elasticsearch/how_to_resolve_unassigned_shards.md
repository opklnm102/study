# [ES] How to resolve unassigned shards
> date - 2019.10.15  
> keyworkd - elasticsearch, es, unassigned shard troubleshooting  
> [How to resolve unassigned shards in Elasticsearch](https://www.datadoghq.com/blog/elasticsearch-unassigned-shards)를 읽고 정리

<br>

* Elasticsearch는 primary, replica shard가 모든 노드에 분산되어 장애시 durable reliability를 유지
* 만약 shard status가 `UNASSIGNED`라면?
* data를 보존할 필요가 없다면 **shard를 제거하는 것이 간단한 방법**이지만 그럴 수 없을 경우에 대한 해결 방법 소개


<br>

## 문제가 있는 shard 찾기
* `GET _cat/shards` 사용
* index name, shard number, primary/replica 여부 및 unassigned 이유를 확인할 수 있다
```
GET _cat/shards?h=index,shard,prirep,state,unassigned.reason | grep UNASSIGNED

logstash-2019.10.08           2 p UNASSIGNED CLUSTER_RECOVERED
...
```


<br>

### shard allocation issue에 대한 자세한 정보 찾기
* 5.x 이상이라면 `GET _cluster/allocation/explain`을 사용
```
GET _cluster/allocation/explain?pretty

{
  "index": "logstash-2019.10.08",
  "shard": 0,
  "primary": false,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "CLUSTER_RECOVERED",
    "at": "2019-01-16T15:44:54.919Z",
    "last_allocation_status": "no_attempt"
  },
  "can_allocate": "no",
  "allocate_explanation": "cannot allocate because allocation is not permitted to any of the nodes",
  "node_allocation_decisions": [
  ...
    "deciders": [
      {
        "decider": "same_shard",
        "decision": "NO",
        "explanation": "the shard cannot be allocated to the same node on which a copy of the shard already exists"
...
    }
  ]
}
```

<br>

* `shard already exists`이므로 제거하면 cluster status는 green이 된다
```
DELETE logstash-2019.10.08
```


<br>

## 1. Shard allocation is purposefully delayed
* 특정 Node가 cluster를 떠나면 master node는 일정 시간(default. 1m) 내에 복구할 수 있는 경우에 shard rebalancing에 불필요한 리소스를 낭비하지 않도록 shard reallocation을 일시적으로 지연시킨다
```
[TIMESTAMP][INFO][cluster.routing] [MASTER NODE NAME] delaying allocation for [54] unassigned shards, next check in [1m]
```

<br>

* 동적으로 수정 가능
```json
PUT <index name>/_settings
{
    "settings": {
        "index.unassigned.node_left.delayed_timeout": "30s"
    }
}
```
* index name에 `_all`을 사용하면 cluster의 모든 index에 적용
* delay가 지나면 shard allocation이 진행되야 하지만 진행되지 않는다면 다른 문제가 있는 것


<br>

## 2. Too many shards, not enough nodes
* master node는 cluster에 node join/leave시 자동으로 shard를 reassign하여 shard가 동일한 node에 assign되지 않도록 한다
  * primary shard와 replica shard 같은 node에 assign X
  * replica shard를 같은 node에 assign X
* **shard를 분배할 node가 충분하지 않으면** `UNASSIGNED`가 될 수 있다
  * `N >= R + 1`에 따라 cluster의 모든 index가 node 수보다 primary shard 당 replica shard 수가 적도록 초기화해야 한다
    * `N` - node count in cluster
    * `R` - max replica shard count of index in cluster
    * e.g. node 5개면, replica shard는 최대 4개까지 가능
* cluster에 **node를 추가**하거나 **replica shard count를 수정**
 
```json
PUT <index name>/_settings
{
    "index": {
        "number_of_replicas": 2
    }
}
```


<br>

## 3. You need to re-enable shard allocation
* node join 후 shard assign이 안되었을 경우
* shard allocation은 default로 모든 node에서 활성화되어 있지만 **rolling restart 등을 위해 비활성화 후 다시 활성화하는 것을 잊었을** 수도 있다
* [Cluster Settings API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-update-settings.html)로 활성화하면 `UNASSIGNED` shard count가 감소한다
```json
PUT _cluster/settings
{
    "transient": {
        "cluster.routing.allocation.enable": "all"
    }
}
```


<br>

## 4. Shard data no longer exists in th cluster
* Initial indexing process 속도를 위해 replica shard 없이 primary shard만 생성한 경우
  * node가 cluster를 떠나고, master node가 cluster state file에서 shard를 감지했지만 cluster에서 shard를 찾을 수 없다
* Rebooting하는 동안 node에 문제 발생
  * cluster에 rejoin시 on-disk shard에 대한 정보를 master node로 relay 후 `UNASSIGNED`에서 `ASSIGNED/STARTED`로 변경하는데, 어떤 이유로 실패하면 `UNASSIGNED`로 남는다

### 2가지 방법이 있다
1. 원래 node를 recover하고 cluster에 rejoin
2. `Reroute API`를 사용해 shard를 force allocate 후 누락된 data를 reindexing

```json
// force allocated with reroute API
POST _cluster/reroute
{
    "commands": [
        {
            "allocate": {
                "index": "constant-updates",
                "shard": 0,
                "node": "node name",
                "allow_primary": "true"
            }
        }
    ]
}
```
* primary shard를 force assign시 `empty shard` 할당
  * `empty shard`가 최신이므로 기존 data를 덮어쓴다
* missing data를 `reindexing`하거나 `Snapshot and Restore API`를 사용해 snapshot에서 recover한다


<br>

## 5. Low disk watermark
* disk space에 여유가 있어야 shard assign 가능
  * 85% 이상 사용하거나 `low disk watermark`가 되면 shard assign 중지

<br>

### Disk space check
```json
GET _cat/allocation?v

shards disk.indices disk.used disk.avail disk.total disk.percent host           ip             node
  312       40.7gb    112.6gb    400.3gb      512gb           17 10.30.111.211  10.30.111.211  node-1
```

> Node의 disk space가 부족한 경우에는 [this article](https://www.datadoghq.com/blog/elasticsearch-performance-scaling-problems/#toc-problem-2-help-data-nodes-are-running-out-of-disk-space1) 참고(오래된 data 제거 후 cluster 외부에 저장, node 추가, HW upgrade 등)

<br>

### Watermark 수정
* Node의 Disk capacities가 큰 경우 85%는 낮을 수 있으므로 `Cluster Update Settings API`로 수정
* `%`와 `byte` 단위 사용 가능
  * `%` - used disk space
  * byte - free disk space

```json
PUT _cluster/settings
{
    "transient": {
        "cluster.routing.allocation.disk.watermark.log": "90%",
        "cluster.routing.allocation.disk.watermark.high": "95%"
    }
}
```
* cluster restart시에도 유지하고 싶으면 `transient`대신 `persistent`를 사용하거나, configuration file을 수정


<br>

## 6. Multiple Elasticsearch versions
* 2개 이상의 버전을 실행하는 cluster에서만 발생할 수 있다
  * e.g. rolling upgrade
* master node는 replica shard를 이전 버전의 node에 assign하지 않는다
  * e.g. primary shard가 1.4에서 실행 중이면 1.4 이전 버전의 node에는 assign하지 않는다
* 수동으로 routing시 error 발생
  * `[NO(target node version [XXX] is older than source node version [XXX])]`
* Elasticsearch는 이전 버전으로의 rollback을 지원하지 않으며, upgrade만 지원
  * upgrade시 문제가 발생하면 해결해야 한다...
  * 그래서 Elastic Cloud에서 cluster upgrade는 snapshot을 사용해 new cluster로 migration하나 보다


## Finally
* 최후의 방법으로 **original data source에서 reindexing**하거나 **snapshot으로 restoring**


<br>

## Conclusion
* unassigned shard는 **data가 누락되었거나 사용할 수 없거나 cluster의 안정성을 해치기 때문에 최대한 빠르게 수정해야 한다**
* unassigned shard인 이유는 다양하여 assign하기 어려울 수도 있다. 그럴 경우 보존할 필요가 없는 data라면 간단하게 제거하자

<br><br>

> #### Reference
> * [How to resolve unassigned shards in Elasticsearch - Datadog blog](https://www.datadoghq.com/blog/elasticsearch-unassigned-shards)
