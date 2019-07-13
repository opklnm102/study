# [ES] Elastic Search thread pool
> date - 2019.07.14  
> keyword - elasticsearch  
> Elastic Search 5.6의 Thread Pool에 대해 정리  


<br>

## Thread Pool
| name | type | expression | max thread | queue | description |
|:-:|:-:|:-:|:-:|:-:|:-:|
| generic | scaling | - | - | - | generic operation(e.g. background node discovery) |
| index | fixed | n + 1 | - | 200 | index / delete operation |
| search | fixed | int((n * 3) / 2) + 1 | - | 1000 | count / search / suggest operation |
| get | fixed | n | - | 1000 | get operation |
| bulk | fixed | n + 1 | - | 200 | bulk operation |
| snapshot | scaling | - | min(5, n / 2) | - | snapshot / restore operation. keep-alive 5m |
| warmer | scaling | - | min(5, n / 2) | - | segment warm-up operation. keep-alive 5m |
| refersh | scaling | - | min(10, n / 2) | - | refresh operation |
| listener | scaling | - | min(10, n / 2) | - | java client executing | 


<br>

## Thread Pool Count
* processors 수에 따른 thread pool count 비교

| processor | index | search | get | bulk | snapshot | warmer | refresh | listener |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 4 | 5 | 7 | 4 | 5| 2 | 2 | 2 | 2 |
| 8 | 9 | 13 | 8 | 9 | 4 | 4 | 4 | 4 |


<br>

## Thread pool types

### fixed
* fixed number of threads
* 여유 thread가 없을 경우 queue 사용
* 설정
```
thread_pool:
  index:
    size: 30
    queue_size: 1000  # -1: infinity
```

### scaling
* dynamic number of threads
* thread 갯수는 core ~ max 사이로 유지
* keep_alive - 여유 상태에서 유지할 시간
* 설정
```
thread_pool:
  warmer:
    core: 1
    max: 8
    keep_alive: 2m
```


<br>

## Processor setting
* processor count를 auto detect 후 thread pool을 setting 한다
* 명시적으로 설정하여 detecting된 processor 수를 무시할 수 있다
```yaml
# elasticsearch.yaml
...
processors: 2
```

### 다음과 같은 use case에서 사용

#### 같은 host에서 여러 ES 인스턴스를 사용할 때 CPU의 일부만 있는것처럼 thread pool size를 조정할 때
* e.g. 16 core instance에 8 processor
* GC thread 수 설정 등과 같은 고려 사항이 있기 때문에 전문가 수준의 use case

#### processor는 기본적으로 32로 제한
* 64 core instance에서도 32 core인 것처럼 동작
* process의 limit인 `ulimit`를 적절히 조정하지 않은 시스템에서 너무 많은 thread를 생성하게 하지 않기 위해 추가
* `ulimit`를 수정한 경우, processors를 명시적으로 설정하면 limit를 넘어갈 수 있다

#### processor가 잘못 감지될 때
* [GET _nodes/os](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-info.html) 로 확인할 수 있다
* 4 core instance에 processors 2로 설정
```json
// GET _nodes/os

"os": {
    ...
    "available_processors": 4,
    "allocated_processors": 2
}
```


<br><br>

> #### Reference
> * [Thread Pool - Elasticsearch 5.6 Docs](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/modules-threadpool.html#processors)
> * [Cluster APIs Nodes Info - Elasticsearch 5.6 Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-info.html)
