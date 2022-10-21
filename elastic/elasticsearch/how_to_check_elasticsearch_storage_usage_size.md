# [ES] How to check Elasticsearch storage usage size
> date - 2022.10.21  
> keyworkd - elasticsearch, storage, disk  
> Elasticsearch에서 사용 중인 storage size를 확인하는 방법 정리  

<br>

## cluster의 storage 현황 확인
* cat allocation API 사용
```json
GET _cat/allocation?v&pretty

shards disk.indices disk.used disk.avail disk.total disk.percent host           ip             node
9759   218.1gb      1.6tb     4.8gb      1.6tb      99           10.xxx.xxx.xxx 10.xxx.xxx.xxx instance-1
11579                                                                                          UNASSIGNED
```


<br>

## shard의 storage size
```json
GET _cat/shards/<index name>?v&s=index

// example
GET _cat/shards/test*?v&s=index

index              shard prirep state       docs  store  ip             node
test-2022.10.15t01 2     p      STARTED     78684 67.8mb 10.xxx.xxx.xxx instance-1
test-2022.10.15t01 2     r      UNASSIGNED                                                  
test-2022.10.15t01 4     p      STARTED     78850 68.1mb 10.xxx.xxx.xxx instance-1
...
```


<br>

## node의 storage size 확인 
* cat node API 사용
```json
GET _cat/nodes?v

ip             heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
10.xxx.xxx.xxx 70           99          23  8.05    7.59    7.46     mdi       *      instance-1
```

* storage에 대한 자세한 정보 확인
```json
GET _cat/nodes?v&h=disk.used,disk.avail,disk.total,disk.used_percent,heap.current,ram.current,ram.max,file_desc.current,file_desc.max,cpu,jdk

disk.used disk.avail disk.total disk.used_percent heap.current ram.current ram.max file_desc.current file_desc.max cpu jdk
1.6tb     5gb        1.6tb      99.69             16.3gb       238.2gb     240gb   20336             1048576       20  1.8.0_144
```


<br><br>

> #### Reference
> * [cat nodes API - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html)
> * [cat allocation API - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-allocation.html)
