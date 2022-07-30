# [ES] Improving search performance using force merge
> date - 2022.07.30  
> keyworkd - elasticsearch, shard, segment, force merge
> daily index의 검생 성능 향상을 위해 어제의 index에 대해 force merge를 구성했던 내용 정리  

<br>

## Issue
* daily index를 사용하는 환경에서 검색 속도 향상을 위해 어제의 index에 대해 force merge 수행 필요

<br>

## Resolve
* Force merge API를 사용해 수동으로 merge하여 shard의 segment 수를 줄이고 삭제된 document가 사용하는 space 확보
* merge는 일반적으로 자동으로 발생하지만 때로는 수동으로 트리거하는 것이 유용
* **부하가 큰 작업**(I/O 등)이므로 더 이상 indexing이 없는 index에서 수행하고, peak time(indexing, searching이 활발한)을 피해서 수행
* indexing이 끝난 index는 1개의 segment로 merge 추천
  * disk에 shard 당 하나의 segment만 있게 되어, 압축률이 훨씬 향상된다
* segment merge가 끝난 segment는 더 이상 사용하지 않기 때문에 제거한다
* 여러 segment가 있는 [frozen index](https://www.elastic.co/kr/blog/creating-frozen-indices-with-the-elasticsearch-freeze-index-api)에 대해 검색을 실행하면 최대 수백 배의 성능 overhead가 발생할 수 있으므로 force merge 후 frozen index 생성하는 것을 추천
  * frozen index에 대해 집계, 정렬된 검색 요청 실행시 필요한 data structure가 간소화된다

<br>

### Force merge API
```json
POST <index-name>/_forcemerge

// example
POST <index-name>/_forcemerge?max_num_segments=10
```
* max_num_segments
  * merge할 segment 수
  * 완전히 merge하려면 1로 설정
* only_expunge_deletes(default. false)
  * true면 deleted document가 포함된 segment만 제거된다
  * Lucene에서 document는 segment에서 삭제되지 않는다
    * merge되는 동안 deleted document를 포함하지 않는 segment가 생성된다
   
<br>

### check segment count
```json
GET <index-name>/_segments?pretty
```

<br>

#### Before
```json
GET test-index-2021.02.18/_segments?pretty

{
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "indices": {
    "test-index-2021.02.18": {
      "shards": {
        "0": [
          {
            "routing": {
              "state": "STARTED",
              "primary": true,
              "node": "node-0"
            },
            "num_committed_segments": 17,  // here
            "num_search_segments": 17,  // here
            "segments": {
              ...
            }
          },
          ...
        ]
      }
    }
  }
}
```

<br>

#### After
```json
GET test-index-2021.02.18/_segments?pretty

{
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "indices": {
    "test-index-2021.02.18": {
      "shards": {
        "0": [
          {
            "routing": {
              "state": "STARTED",
              "primary": true,
              "node": "node-0"
            },
            "num_committed_segments": 1,  // here
            "num_search_segments": 1,  // here
            "segments": {
              ...
            }
          },
          ...
        ]
      }
    }
  }
}
```


<br>

## Force merge with Elastic Curator
* [Elastic curator](https://www.elastic.co/guide/en/elasticsearch/client/curator/5.8/index.html)를 이용하면 선언적으로 force merge API를 사용할 수 있다
* cronjob + Elastic curator 조합으로 daily index를 target으로 `어제의 index force merge`하는 daily job을 구성할 수 있다

<br>

### Elastic Curator Configuration
```yaml
actions:
  1:
    action: forcemerge
    description: >-
      forceMerge logstash- prefixed indices older than 2 days (based on index creation_date) to 2 segments per shard. 
      Delay 120 seconds between each forceMerge operation to allow the cluster to quiesce. 
      Skip indices that have already been forcemerged to the minimum number of segments to aviod reprocessing.
    options:
      max_num_segments: 1
      delay: 120
      timeout_override:
      continue_if_exception: False
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
      exclude:
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 2
      exclude:
    - filtertype: forcemerged
      max_num_segments: 2
      exclude: True
```


<br><br>

> #### Reference
> * [Forcemerge - Curator Reference](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/forcemerge.html)
> * [Force merge API - Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-forcemerge.html)
