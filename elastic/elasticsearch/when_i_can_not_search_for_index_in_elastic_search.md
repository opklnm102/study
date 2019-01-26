# [ES] When i can not search for index in Elastic search
> date - 2019.01.25  
> keyword - elasticsearch  
> ES에서 특정 index로 검색이 안돼는 이슈의 원인을 파악하는 과정을 정리  

<br>

## 1. index 정보 조회
* 1월의 product index 조회
```sh
GET _cat/indices/product-2019.01.*?v&s=index

health status index               uuid                   pri rep docs.count docs.deleted store.size pri.store.size
       close  product-2019.01.03 tPmcuXsuT7aPQwuGUFx1UQ                                                 
...
yellow open   product-2019.01.21 ZEI4F1YiTA2tj34ezZYsdw   5   1    1435964            0      1.4gb          1.4gb
```
* index status가 close라서 검색이 안되는듯...

> #### GET _cat/indices/{index name}?v&s=index
>   * `v` - show fields
>   * `s=index` - index로 sorting

<br>

## 2. index open
* status가 close니깐 open해준다

```sh
POST /product-2019.01.03/_open

// status check
GET _cat/indices/product-2019.01.*?v&s=index

health status index               uuid                   pri rep docs.count docs.deleted store.size pri.store.size
red    close  product-2019.01.03 tPmcuXsuT7aPQwuGUFx1UQ   5   1                                                    
...
yellow open   product-2019.01.21 ZEI4F1YiTA2tj34ezZYsdw   5   1    1435964            0      1.4gb          1.4gb
```
* health status가 red에서 올라오질 않는다...!!
* docs.count, store.size에 아무것도 안보이는게 이상하다

> #### index open/close
> * index open
> ```
> POST {index name}/_open
> ```
> 
> * index close
> ```
> POST {index name}/_close
> ```

<br>

> #### index health status red, yellow, green???
> * red
>   * `primary/replica shard가 unassign이라 비정상` 상태
> * yellow
>   * primary shard는 assign `replica shard는 unassign이라 불안정`한 상태
>   * 1 Node고 `cluster.routing.allocation.same_shard.host: true`면 primary shard와 replica shard가 같은 Node에 assign될 수 없으므로 yellow가 된다
> * green
>   * `primary & replica shard가 assign되서 안정`적인 상태
> <br>
> 요약하면...
>
> | health status | primary shard | replica shard |
> |:--:|:--:|:--:|
> | gree | O| O |
> | yellow | O | X | 
> | red | X | X |


<br>

## 3. shard 정보 조회
* `GET _cat_shards`로 unassigned reason을 확인
* 어떤 Node에 어떤 shard가 assign되었는지에 대한 상세정보
  * primary/replica 여부, docs 수, shards의 byte 및 assign된 Node

```
GET _cat/shards?v&h=index,shard,prirep,state,unassigned.reason

index                     shard   prirep   state      unassigned.reason
product-2019.01.03            2     p      UNASSIGNED INDEX_REOPENED
product-2019.01.03            2     r      UNASSIGNED INDEX_REOPENED
product-2019.01.03            1     p      UNASSIGNED INDEX_REOPENED
product-2019.01.03            1     r      UNASSIGNED INDEX_REOPENED
product-2019.01.03            3     p      UNASSIGNED INDEX_REOPENED
product-2019.01.03            3     r      UNASSIGNED INDEX_REOPENED
product-2019.01.03            4     p      UNASSIGNED INDEX_REOPENED
product-2019.01.03            4     r      UNASSIGNED INDEX_REOPENED
product-2019.01.03            0     p      UNASSIGNED INDEX_REOPENED
product-2019.01.03            0     r      UNASSIGNED INDEX_REOPENED
```
* index reopen될 때 unassign되었다고 나오고 자세한건 알 수 없다

> reason의 의미는 [Reasons for unassigned shard](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-shards.html#reason-unassigned)에서 확인


<br>

## 4. cluster topology 조회
* 아래 정보를 통해 cluster에 부하가 걸려 shard가 늦게 assign되는지 파악할 수 있다
* Node가 어디에 있는지, 성능 통계 정보
  * ip
  * heap.percent
  * ram.percent
  * cpu
  * load_*
* cluster 구성을 파악할 때 유용한 정보
  * node.role
  * master

```
GET _cat/nodes?v

ip           heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
192.10.55.100          55          34  12    2.94    3.25     3.36 mdi       *      instance-0000000013
```

> 더 자세한 field 정보는 [cat nodes Columns](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html#_columns_2)에서 확인


<br>

## 5. Cluster Allocation Explain API 사용하기
* cluster의 shard allocation에 대한 설명을 조회할 수 있다
* shard의 unassign or 다른 Node로 이동하지 않는 이유를 진단할 때 유용
  * unassigned shard라면 `unassign된 이유`를 볼 수 있다
  * assigned shard라면 `shard가 현재 Node에 남아 있고 다른 Node를 이동하거나 rebalanced하지 않은 이유`를 볼 수 있다

```
GET _cluster/allocation/explain
{
    "index": "{index name}",
    "shard": {shard number},
    "primary": {true/false}
}
```

* replica의 assign 이유를 확인
```
GET _cluster/allocation/explain
{
  "index": "product-2019.01.03",
  "shard": 0,
  "primary": false  // true(primary), false(replica)
}

{  
  "index":"product-2019.01.03",
  "shard":0,
  "primary":false,
  "current_state":"unassigned",
  "unassigned_info":{  
    "reason":"INDEX_REOPENED",
    "at":"2019-01-21T01:47:44.114Z",
    "last_allocation_status":"no_attempt"
  },
  "can_allocate":"no",
  "allocate_explanation":"cannot allocate because allocation is not permitted to any of the nodes",
  "node_allocation_decisions":[  
    {  
      ...
      "deciders":[  
        {  
          "decider":"replica_after_primary_active",
          "decision":"NO",
          "explanation":"primary shard for this replica is not yet active"
        },
        {  
          "decider":"throttling",
          "decision":"NO",
          "explanation":"primary shard for this replica is not yet active"
        }
      ]
    }
  ]
}
```

* primary shard가 active하지 않아서 replica가 assign되지 않았다니까 primary의 assign 이유를 확인해보자
```
GET _cluster/allocation/explain
{
  "index": "product-2019.01.03",
  "shard": 0,
  "primary": true  // true(primary), false(replica)
}

{  
  "index":"product-2019.01.03",
  "shard":0,
  "primary":true,
  "current_state":"unassigned",
  "unassigned_info":{  
    "reason":"INDEX_REOPENED",
    "at":"2019-01-21T09:17:04.039Z",
    "last_allocation_status":"no_valid_shard_copy"
  },
  "can_allocate":"no_valid_shard_copy",
  "allocate_explanation":"cannot allocate because a previous copy of the primary shard existed but can no longer be found on the nodes in the cluster",
  "node_allocation_decisions":[  
    {  
      ...  
      "node_decision":"no",
      "store":{  
        "found":false
      }
    }
  ]
}
```
* index가 delete되서 assign되지 않았음을 알 수 있다

<br><br>

> #### Reference
> * [ElasticSearch: What does it mean if an index's health is 'red'?](https://stackoverflow.com/questions/38656854/elasticsearch-what-does-it-mean-if-an-indexs-health-is-red)
> * [cat shards - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-shards.html)
> * [cat nodes - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html)
> * [Cluster Allocation Explain API - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/cluster-allocation-explain.html)
