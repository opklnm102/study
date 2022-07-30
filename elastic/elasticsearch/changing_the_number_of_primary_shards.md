# [ES] Changing the number of primary shards
> date - 2022.07.30  
> keyworkd - elasticsearch, shard, shink  
> 2020년 10월에 사용했던 Elasticsearch v7 이전 버전에서 shard 수를 변경했던 내용 정리  

<br>

## Requirement

### Dependency
```
Elasticsearch v6
```

<br>

## Issue
* Elasticsearch에서 너무 많은 primary shard는 성능상 overhead가 발생하는데 v7부터 default primary shard가 1로 변경, 이전에는 5개
* primary shard 조정이 필요했고 새로 생성되는 index는 index template으로 기존 index는 shrink index API를 사용하여 조정 가능하였다

### indexing side
* shard는 indexing을 병렬화하는데 사용
* 5개의 primary shard가 있을 때 100개의 documents를 indexing하면 20개씩 병렬로 indexing하고 모든 documents가 완료되면 client로 응답
* data node에 균등하게 분배된 primary shard가 많을수록 indexing이 빨라진다
* primary shard count == data node count로 시작하면 좋다

<br>

### search side

#### search process
1. 검색 요청을 받은 node가 coordinator node가 되어 index에 속한 shard를 찾는다
2. 찾은 shard에게 query를 전달하고, 각 shard는 ㅊ id, scores가 포함된 결과를 로컬에서 계산 -> query phase
3. 각 shard의 결과는 coordinator node가 병합하여 documents를 가져온다 -> fetch phase

data가 많지 않은 경우 query -> fetch phase로 인해 overhead가 발생하므로 검색을 병렬화하는게 효율적일 떄까지 빠른 검색을 위해 1개의 shard가 있어야한다

#### 일반적으로 좋은 shard size
* logging - 10 ~ 50GB
* search - 20 ~ 25GB
* 20 shard per heap GB


<br>

## Resolve

### 신규 index의 primary shard 조정
* index template 생성
```json
PUT _template/<index template name>
{
  "index_patterns": ["te*", "bar*"],
  "settings": {
    "number_of_shards": 1  // 원하는 primary shard count
  },
  "mappings": {
    "_source": {
      "enabled": false
    },
    "properties": {
      "host_name": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date",
        "format": "EEE MMM dd HH:mm:ss Z yyyy"
      }
    }
  }
}
```

<br>

### 기존 index의 primary shard 축소
* [Shrink index API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-shrink-index.html)를 사용해 기존 index를 primary shard가 더 적은 index로 축소

#### Prerequisites
* index는 read-only
* 모든 shard의 복사본은 동일한 node에 있어야 한다
* index는 green health status여야 한다

#### 1. Preparing an index for shrinking
```json
PUT <index name>/_settings

{
  "settings": {
    "index.number_of_replicas": 0,  // replicas를 0으로 만드는게 더 수월
    "index.routing.allocation.require._name": "<shrink node name>",
    "index.blocks.write": true
  }
}
```

#### 2. Shrinking an index
```json
POST <source index>/_shrink/<target index>
{
  "settings": {
    "index.routing.allocation.require._name": null,  // source index에서 복사한 allocation 설정 제거
    "index.blocks.write": null,  // source index에서 복사한 write block 설정 제거
    "index.number_of_replicas": 0,  // 원하는 replica shard count 지정
    "index.number_of_shards": 1,  // 원하는 primary shard count 지정
    "index.codec": "best_compression"
  }
}
```

<br>

### 기존 index의 primary shard 증가
* [Split index API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-split-index.html)
  * source index의 read only 설정 필요
  * 특정 요건 필요
* [Reindex API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html) 선호
  * source index를 read only로 설정할 필요가 없다
  * alias 전환으로도 쉽게 전환 가능
  * source index 삭제 전 마지막 reindexing으로 동기화


<br>

## Conclusion
primary shard의 수를 조정하는 방법을 알아보았다  
shard 수는 Elasticsearch 성능에 큰 영향을 미치므로 적절한 값을 설정하는게 중요하다

<br><br>

> #### Reference
> * [Create or update index template API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-templates-v1.html)
> * [Shrink index API](https://www.elastic.co/guide/en/elasticsearch/reference/master/indices-shrink-index.html)
> * [Split index API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-split-index.html)
> * [Reindex API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html)
