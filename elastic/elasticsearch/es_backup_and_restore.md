# [ES] Elasticsearch backup and restore
> date - 2022.10.18  
> keyword - elasticsearch  
> elasticsearch에서 snapshot을 이용한 backup, restore에 대해 정리  

<br>

## snapshot?
* 실행 중인 Elasticsearch cluster의 backup
* 다음과 같은 작업에 사용할 수 있다
  * downtime 없이 정기적인 cluster backup
  * HW failure에 대한 복구
  * cluster 간 데이터 전송
  * cold, frozen data tier에서 searchable snapshot을 사용하여 storage 비용 절감
  * cluster upgrade
* [Snapshot Lifecycle Management(SLM)](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-take-snapshot.html#automate-snapshots-slm), [Curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/5.8/index.html), REST API로 생성
* snapshot repository로 [Amazon S3](https://www.elastic.co/guide/en/cloud/current/ec-aws-custom-repository.html), [Google Cloud Storage](https://www.elastic.co/guide/en/cloud/current/ec-gcs-snapshotting.html), [Microsoft Azure](https://www.elastic.co/guide/en/cloud/current/ec-azure-snapshotting.html) 등 지원


<br>

## backup and restore 
### 1. snapshot repository 등록
* 여기서는 repository로 Amazon S3를 사용
```json
PUT _snapshot/<repository name>
{
  "type": "s3",
  "settings": {
    "bucket": "<bucket name>",
    "base_path": "/로 시작하지 않는 bucket directory path"  // e.g. base/path/to/data, default. bucket root
  }
}
```

<br>

### 2. snapshot 생성
* `indices`에 지정한 index로 snapshot 생성하고 없으면 모든 index
```json
PUT _snapshot/<repository name>/<snapshot name>
{
  "indices": "<index pattern>",  // e.g. my-index*,-my-index-2022
  "ignore_unavailable": true,
  "include_global_state": false
}
```

* `wait_for_completion`을 사용하면 동기로 처리된다
```json
PUT _snapshot/<repository name>/<snapshot name>?wait_for_completion=true
...
```

<br>

### 3. snapshot 조회
* 전체 snapshot 조회
```json
GET _snapshot
```

* 특정 repository에서 조회
```json
GET _snapshot/<repository name>/*?verbose=false
```

<br>

### 4. snapshot restore
> 하위 버전에서 생성한 snapshot을 동일 or 상위 버전으로만 복구 가능하므로 [compatibility](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html#snapshot-restore-version-compatibility)에서 확인해보자

* snapshot의 전체 index restore
```json
POST _snapshot/<repository name>/<snapshot name>/_restore
{
	"ignore_unavailable": true,
}
```

* snapshot의 특정 index restore
```json
POST _snapshot/<repository name>/<snapshot name>/_restore
{
	"indices": "<index pattern>",  // e.g.my-index-*, my-index-2022*, my-index-2022-10*
	"ignore_unavailable": true,
	"include_global_state": false
}
```

#### open된 index는 restore 불가능하므로 delete or rename 필요
* delete restore
```json
// delete index
DELETE <index pattern>  // e.g. my-index-*

// restore index
POST _snapshot/<repository name>/<snapshot name>/_restore
{
  ...
}
```

* rename resotre
```json
// rename restore index
POST _snapshot/<repository name>/<snapshot name>/_restore
{
  "indices": "my-index,logs-my_app-default",
  // (.+) - target index 전부
  // my-index_(.+) - my-index로 시작하는
  "rename_pattern": "(.+)",
  "rename_replacement": "restored-$1"
}

// delete the original index
DELETE my-index

// 복구한 index를 기존 index name으로 rename
# Reindex the restored index to rename it
POST _reindex
{
  "source": {
    "index": "restored-my-index"
  },
  "dest": {
    "index": "my-index"
  }
}
```

* 다른 cluster로 restore시에는 다른 cluster에 동일한 repository를 read only로 등록하여 snapshot 손상을 방지한다
```json
PUT _snapshot/<repository name>
{
  "type": "s3",
  "settings": {
    "bucket": "<bucket name>",
    "readonly": true
  }
}
```

* new cluster의 용량이 더 적을 경우 replica shard 수를 조정할 수 있다
```json
POST _snapshot/<repository name>/<snapshot name>/_restore
{
  "indices": "my-index,logs-my_app-default",
  "index_settings": {
    "index.number_of_replicas": 1
  }
}
```

<br>

### 5. Monitoring restore
* restore는 [shard recovery process](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-recovery.html)를 사용하여 snapshot에서 primary shard를 가져오는데 primary shard를 restore하는 동안 [cluster status](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html)는 yellow가 되고, 완료된 후 green이 된다
```json
GET _cluster/health
```

* [index recovery API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-recovery.html)로 restore shard monitoring
```json
GET <index name>/_recovery
```

* [cat shard API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-shards.html) unassigned shard를 확인
```json
GET _cat/shards?v=true&h=index,shard,prirep,state,node,unassigned.reason&s=state
```

* [cluster allocation explain API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html)로 unassigned shard의 자세한 이유를 확인
```json
GET _cluster/allocation/explain
{
  "index": "my-index",
  "shard": 0,
  "primary": false,
  "current_node": "my-node"
}
```

<br>

### 6. snapshot 제거(optional)
```json
DELETE _snapshot/<repository name>/<snapshot name>
```

<br>

### 7. repository 제거(optional)
```json
DELETE _snapshot/<repository name>
```


<br>

## cluster status란?
* [cluster health API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html), [cat health API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-health.html)로 확인 가능하며 green, yellow, red 3가지로 구분
```json
// cluster health API
GET _cluster/health

// cat health API
GET _cat/health
```

### green
* 모든 shard가 정상적으로 동작
* 모든 index의 read/write가 정상적으로 동작

<br>

### yellow
* 일부 index의 replica shard가 정상적으로 동작하지 않은 상태
* yellow인 index의 primary shard에 문제가 생기면 data loss 가능성이 있다
* 모든 index의 read/write가 정상적으로 동작
* replica shard가 없기 때문에 검색 성능이 떨어질 수 있다

<br>

### red
* 일부 index의 primary, replica shard가 정상적으로 동작하지 않은 상태
* shard에 문제가 있는 index의 read/write가 정상적으로 동작하지 않으며 data loss 가능성이 있다


<br><br>

> #### Reference
> * [Snapshot and restore - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html)
