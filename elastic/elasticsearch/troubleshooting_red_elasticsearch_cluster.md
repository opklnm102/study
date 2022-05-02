# [ES] Troubleshooting Red Elasticsearch cluster
> date - 2022.05.01  
> keyword - elasticsearch, troubleshooting, red cluster  
> shard가 유실된 red status의 elasticsearch cluster를 마주하는 것은 정말 아찔한 경험이다  
> red cluster일 때 대처 방안을 정리  

<br>

## What is shard allocation?
* cluster의 node에 shard를 할당하는 process
* Elasticsearch는 HA를 위해 index의 documents를 shard로 분할하여 저장
* primary shard가 node에 할당되지 않으면 index에 새로운 document를 저장할 수 없다
* traffic이 많은 index의 shard가 느린 node에 할당되는 경우 cluster 성능 저하로 이어질 수 있어 shard allocation은 Elasticsearch에서 매우 중요
* shard allocation은 `alocator`와 `desider`에 의해 처리
  * allocator
    * shard 수만 고려하여 shard를 보유할 최상의 node를 찾으려고 시도
  * decider
    * index allocation filter, disk occupancy threshhold 등을 고려하여 node에 shard 할당 가능 여부를 결정
  * allocator가 shard가 가장 적은 node를 찾아 가중치를 기준으로 오름차순 정렬된 node list를 반환 -> decider가 node들에 대해 shard를 할당할 수 있는지 확인

<br>

> #### Index allocation filter settings
> * index.routing.allocation.include.{attribute}
> * index.routing.allocation.require.{attribute}
> * index.routing.allocation.exclude.{attribute}


<br>

## unassigned shard 진단
* [Cluster allocation explain API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html)를 사용해 이유를 알아낼 수 있다
  * unassigned shard - shard unassigned 이유
  * assigned shard - shard가 특정 node에 할당된 이유

```json
GET _cluster/allocation/explain
{
  "index": "my-index-000001",
  "shard": 0,
  "primary": false,  // true - primary shard, false - replica shard
  "current_node": "my-node"
}
```


<br>


## Red index를 제거하는게 가장 빠른 방법

### Red index를 확인
```json
GET _cat/indices?v

health status index  uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   test1  30h1EiMvS5uAFr2t5CEVoQ   5   0        820            0       14mb           14mb
red    open   test3  BJxfAErbTtu5HBjIXJV_7A   1   0
```

### Red index를 제거할 수 없는 경우
* 할당되지 않은 shard를 rerouting
* snapshot을 복원
* red index를 제거 후 index 재생성


<br><br>

> #### Reference
> * [RED Elasticsearch Cluster? Panic no longer](https://www.elastic.co/blog/red-elasticsearch-cluster-panic-no-longer)
> * [Troubleshooting Amazon OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/handling-errors.html)
> * [Index Shard Allocation - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-allocation.html)
