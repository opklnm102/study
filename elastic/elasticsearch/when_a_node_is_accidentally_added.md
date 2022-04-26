# [ES] When a node is accidentally added
> date - 2022.04.22  
> keyword - elasticsearch  
> 실수로 새로운 node가 추가되고, shard를 원래 node로 이동시키고 제거해야하는 상황에서의 troubleshooting 정리

<br>

shard를 고려하지 않고 node를 모두 제거하면 cluster status가 red가 될 수 있으므로 2가지 방법으로 접근해볼 수 있다
1. node를 하나씩 cluster에서 제거하며 failover 동작으로 cluster가 복구되기를 기다리는 방법
2. 수동으로 shard를 reroute하는 방법


<br>

## cluster failover를 이용
1. replica 수를 증가시켜 다른 node에 최소 1개의 shard를 생성
```json
PUT {index_name}/_settings
{
  "settings": {
    "number_of_replicas": 1
  }
}
```

2. node를 하나씩 중지하며 cluster status green이 되기를 대기
3. 원하는 cluster 상태가 되기 까지 2를 반복


<br>

## 수동으로 조치
1. 정리할 node에 shard allocation 중지
```json
PUT {node uri}/_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disable_allocation": true
  }
}
```

2. 다른 node로 shard 이동
> index * shard 수만큼 실행해줘야 한다
```json
POST {node uri}/_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "index name",
        "shard": "shard name",
        "from_node": "node id",
        "to_node": "node id"
      }
    }
  ]
}
```


<br><br>

> #### Reference
> * [ElasticSearch: Accidentally starting 2 instances in same server](https://stackoverflow.com/questions/18924134/elasticsearch-accidentally-starting-2-instances-in-same-server)
