# [ES] How to check Elasticsearch heap size
> date - 2019.09.01  
> keyworkd - elastic search, jvm heap  
> Elasticsearch에 설정된 JVM heap size를 확인하는 방법 정리  


<br>

## Using cat nodes API
* cluster의 node들에 대한 정보 중 heap 관련 정보를 확인
```
GET _cat/nodes?v&h=heap*

heap.current heap.percent heap.max
      15.5gb           50   30.8gb
```


<br>

## Using nodes stats API
* cluster의 node들에 대한 통계 정보 중 jvm 관련 통계 정보를 확인
```json
GET _nodes/stats/jvm

{
  ...
  "nodes": {
    "LqlQbByASHaGTCen0FE4kg": {
      "jvm": {
        "mem": {
          "heap_max_in_bytes": 33172619264,  # here
          ...
        }
      }
    }
  }
}
```


<br><br>

> #### Reference
> * [How to check ES_HEAP_SIZE](https://discuss.elastic.co/t/how-to-check-es-heap-size/36613/6)
> * [cat nodes API - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html)
> * [Nodes Stats - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html)