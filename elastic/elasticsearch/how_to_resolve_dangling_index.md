# [ES] How to resolve dangling index
> date - 2019.10.19  
> keyworkd - elasticsearch, dangling index  
> Elasticsearch에서 dangling index를 처리하는 방법에 대해 정리  

<br>

## Dangling index란?
* **master node를 잃어버렸을 때 new master는 모르지만 cluster에 존재하던 기존 index**
* master node를 잃어버렸을 때 index 유실을 대비해 Node가 cluster에 join시 **cluster에는 존재하지 않고, local data directory에 저장된 shard**를 cluster로 가져온다
  * cluster의 기존 index를 모르는 new master node가 시작되고, 기존 node가 join할 때 기존 index를 삭제하지 않고 import


<br>

## Index with same name already exists in cluster metadata issue
* `.kibana` index 같이 이름만 사용하는 index의 경우, 아래의 log를 볼 수 있다
```
[2019-10-17T08:16:50,394][WARN ][o.e.g.DanglingIndicesState] [elasticsearch-data-1] [[.kibana/-6QpPMgqQ5CxfRq3J2QlxQ]] can not be imported as a dangling index, as index with same name already exists in cluster metadata
```


<br>

## Resolve dangling index
* **Disk에서 old index data를 제거**하거나, **Elasticsearch API로 기존 index를 제거**하는 2가지 방법으로 접근할 수 있다

<br>

### 1. Disk에서 old index data 제거
* Node running일 때 data path를 수동으로 변경하는 작업이라 권장하진 않지만, node down시 사용할법한 방법

#### 1. Stop the node
* node를 시작한 방법에 따라 다르게 접근 필요
```sh
$ sudo systemctl stop elasticsearch.service
```

#### 2. `uuid` index listing
```
GET _cat/indices?v

health status index                   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow  open   .kibana                 1Qpf4MPrTdeEDmTvj1siTQ   1   1          2            0     75.9kb         37.9kb
...
```

#### 3. Elasticsearch data directory의 `nodes/0/indices`에서 API에서 조회 안된 uuid를 찾아서 제거
```sh
$ ls /[Elasticsearch home]/data/nodes/0/indices

EGpfZHTRS7-r2OVrtoWXjw  Zp2yd_LnSPmukJhvY_TWlg  kdq9G0T2Rq64rpmKSreTEg

$ rm [directory name]
```

<br>

### 2. Elasticsearch API로 index 제거
* Elasticsearch Delete index API로 new master로 인해 dangling index를 발생시키는 new index를 제거하고, old index를 import하는 방법으로 권장되는 방법


#### 1. Delete index API로 제거
```json
DELETE /{index name}

```

#### 2. 확인
* dangling index를 발생시키던 uuid를 가진 old index가 import되었고, 더 이상 dangling index log를 발생시키지 않는다
```
GET _cat/indices?v

health status index                   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana                 6QpPMgqQ5CxfRq3J2QlxQ   1   1          2            0     75.9kb         37.9kb
...
```


<br>

## Conclusion
* node가 down된 상태더라도 수동으로 조작하는 방식은 위험하므로 안전하게 dangling index import 후 제거하는게 좋은 접근


<br><br>

> #### Reference
> * [How to resolve Dangling indices error on each Index](https://discuss.elastic.co/t/how-to-resolve-dangling-indices-error-on-each-index/130609/9)
> * [Is it possible to delete a dangling index data directory from a running node?](https://discuss.elastic.co/t/is-it-possible-to-delete-a-dangling-index-data-directory-from-a-running-node/203354)
> * [Dangling indices - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/master/modules-gateway-dangling-indices.html)
> * [Delete index API - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/master/indices-delete-index.html)
