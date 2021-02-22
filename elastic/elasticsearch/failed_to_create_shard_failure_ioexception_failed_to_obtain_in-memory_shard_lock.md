# [ES] failed to create shard, failure IOException[failed to obtain in-memory shard lock]
> date - 2021.02.22  
> keyworkd - elasticsearch, shard  
> failed to create shard, failure IOException[failed to obtain in-memory shard lock]에 대한 troubleshooting 정리

<br>

## Requirement

### Dependency
* Elasticsearch 6.7


<br>

## Issue
* `failed to obtain in-memory shard lock` IOException으로 특정 data node에 shard assign 실패

* data node log
```java
[WARN], 2021-01-19 19:56:08, [[test_idx_2][2]] marking and sending shard failed due to [failed to create shard]
java.io.IOException: failed to obtain in-memory shard lock
	at org.elasticsearch.index.IndexService.createShard(IndexService.java:416) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.IndicesService.createShard(IndicesService.java:623) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.IndicesService.createShard(IndicesService.java:158) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.createShard(IndicesClusterStateService.java:597) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.createOrUpdateShards(IndicesClusterStateService.java:573) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.applyClusterState(IndicesClusterStateService.java:270) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.lambda$callClusterStateAppliers$6(ClusterApplierService.java:484) [elasticsearch-6.7.2.jar:6.7.2]
	at java.lang.Iterable.forEach(Iterable.java:75) [?:?]
	at org.elasticsearch.cluster.service.ClusterApplierService.callClusterStateAppliers(ClusterApplierService.java:481) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.applyChanges(ClusterApplierService.java:468) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.runTask(ClusterApplierService.java:419) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService$UpdateTask.run(ClusterApplierService.java:163) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.ThreadContext$ContextPreservingRunnable.run(ThreadContext.java:681) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.PrioritizedEsThreadPoolExecutor$TieBreakingPrioritizedRunnable.runAndClean(PrioritizedEsThreadPoolExecutor.java:252) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.PrioritizedEsThreadPoolExecutor$TieBreakingPrioritizedRunnable.run(PrioritizedEsThreadPoolExecutor.java:215) [elasticsearch-6.7.2.jar:6.7.2]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) [?:?]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) [?:?]
	at java.lang.Thread.run(Thread.java:835) [?:?]
Caused by: org.elasticsearch.env.ShardLockObtainFailedException: [test_idx_2][2]: obtaining shard lock timed out after 5000ms
	at org.elasticsearch.env.NodeEnvironment$InternalShardLock.acquire(NodeEnvironment.java:753) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.env.NodeEnvironment.shardLock(NodeEnvironment.java:672) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.index.IndexService.createShard(IndexService.java:336) ~[elasticsearch-6.7.2.jar:6.7.2]
	... 17 more
[INFO], 2021-01-19 19:56:13, [test_idx_2][2]: failed to obtain shard lock
org.elasticsearch.env.ShardLockObtainFailedException: [test_idx_2][2]: obtaining shard lock timed out after 5000ms
	at org.elasticsearch.env.NodeEnvironment$InternalShardLock.acquire(NodeEnvironment.java:753) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.env.NodeEnvironment.shardLock(NodeEnvironment.java:672) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.index.store.Store.readMetadataSnapshot(Store.java:440) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.store.TransportNodesListShardStoreMetaData.listStoreMetaData(TransportNodesListShardStoreMetaData.java:155) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.store.TransportNodesListShardStoreMetaData.nodeOperation(TransportNodesListShardStoreMetaData.java:113) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.store.TransportNodesListShardStoreMetaData.nodeOperation(TransportNodesListShardStoreMetaData.java:61) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.action.support.nodes.TransportNodesAction.nodeOperation(TransportNodesAction.java:138) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.action.support.nodes.TransportNodesAction$NodeTransportHandler.messageReceived(TransportNodesAction.java:259) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.action.support.nodes.TransportNodesAction$NodeTransportHandler.messageReceived(TransportNodesAction.java:255) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.xpack.security.transport.SecurityServerTransportInterceptor$ProfileSecuredRequestHandler$1.doRun(SecurityServerTransportInterceptor.java:250) [x-pack-security-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:37) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.xpack.security.transport.SecurityServerTransportInterceptor$ProfileSecuredRequestHandler.messageReceived(SecurityServerTransportInterceptor.java:308) [x-pack-security-6.7.2.jar:6.7.2]
	at org.elasticsearch.transport.RequestHandlerRegistry.processMessageReceived(RequestHandlerRegistry.java:66) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.transport.TcpTransport$RequestHandler.doRun(TcpTransport.java:1087) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:751) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:37) [elasticsearch-6.7.2.jar:6.7.2]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) [?:?]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) [?:?]
	at java.lang.Thread.run(Thread.java:835) [?:?]
```

* master node log
```java
[WARN], 2021-01-19 19:56:18, failing shard [failed shard, shard [test_idx_2][2], node[_P6EIP6yRKGAmXIxc504Gg], [R], recovery_source[peer recovery], s[INITIALIZING], a[id=Z1wU8TfpQfOLHiQBqOdRoA], unassigned_info[[reason=ALLOCATION_FAILED], at[2021-01-19T19:56:08.579Z], failed_attempts[4], delayed=false, details[failed shard on node [_P6EIP6yRKGAmXIxc504Gg]: failed to create shard, failure IOException[failed to obtain in-memory shard lock]; nested: ShardLockObtainFailedException[[test_idx_2][2]: obtaining shard lock timed out after 5000ms]; ], allocation_status[no_attempt]], expected_shard_size[2099922], message [failed to create shard], failure [IOException[failed to obtain in-memory shard lock]; nested: ShardLockObtainFailedException[[test_idx_2][2]: obtaining shard lock timed out after 5000ms]; ], markAsStale [true]]
java.io.IOException: failed to obtain in-memory shard lock
	at org.elasticsearch.index.IndexService.createShard(IndexService.java:416) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.IndicesService.createShard(IndicesService.java:623) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.IndicesService.createShard(IndicesService.java:158) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.createShard(IndicesClusterStateService.java:597) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.createOrUpdateShards(IndicesClusterStateService.java:573) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.indices.cluster.IndicesClusterStateService.applyClusterState(IndicesClusterStateService.java:270) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.lambda$callClusterStateAppliers$6(ClusterApplierService.java:484) ~[elasticsearch-6.7.2.jar:6.7.2]
	at java.lang.Iterable.forEach(Iterable.java:75) ~[?:?]
	at org.elasticsearch.cluster.service.ClusterApplierService.callClusterStateAppliers(ClusterApplierService.java:481) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.applyChanges(ClusterApplierService.java:468) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService.runTask(ClusterApplierService.java:419) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.cluster.service.ClusterApplierService$UpdateTask.run(ClusterApplierService.java:163) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.ThreadContext$ContextPreservingRunnable.run(ThreadContext.java:681) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.PrioritizedEsThreadPoolExecutor$TieBreakingPrioritizedRunnable.runAndClean(PrioritizedEsThreadPoolExecutor.java:252) [elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.common.util.concurrent.PrioritizedEsThreadPoolExecutor$TieBreakingPrioritizedRunnable.run(PrioritizedEsThreadPoolExecutor.java:215) [elasticsearch-6.7.2.jar:6.7.2]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) [?:?]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) [?:?]
	at java.lang.Thread.run(Thread.java:835) [?:?]
Caused by: org.elasticsearch.env.ShardLockObtainFailedException: [test_idx_2][2]: obtaining shard lock timed out after 5000ms
	at org.elasticsearch.env.NodeEnvironment$InternalShardLock.acquire(NodeEnvironment.java:753) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.env.NodeEnvironment.shardLock(NodeEnvironment.java:672) ~[elasticsearch-6.7.2.jar:6.7.2]
	at org.elasticsearch.index.IndexService.createShard(IndexService.java:336) ~[elasticsearch-6.7.2.jar:6.7.2]
	... 17 more
```


<br>

## Why?
* 특정 data node가 cluster에서 left, join이 반복된 것을 아래 log를 통해 확인할 수 있다
```java
[INFO], 2021-01-19 17:21:02, removed {{elasticsearch-sonic-data-0}{_P6EIP6yRKGAmXIxc504Gg}{Np9aRvoARI2580lu-yw0Og}{10.18.74.23}{10.18.74.23:9300}{ml.machine_memory=19327352832, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true},}, reason: apply cluster state (from master [master {elasticsearch-test-2}{jMEliMfUTB6QnVDvNSCPjA}{ZX4pM2fTTrmm9XqC4MAj1w}{10.18.70.114}{10.18.70.114:9300}{ml.machine_memory=4294967296, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true} committed version [5706]])
[INFO], 2021-01-19 18:12:37, added {{elasticsearch-test-data-0}{_P6EIP6yRKGAmXIxc504Gg}{Np9aRvoARI2580lu-yw0Og}{10.18.74.23}{10.18.74.23:9300}{ml.machine_memory=19327352832, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true},}, reason: apply cluster state (from master [master {elasticsearch-test-2}{jMEliMfUTB6QnVDvNSCPjA}{ZX4pM2fTTrmm9XqC4MAj1w}{10.18.70.114}{10.18.70.114:9300}{ml.machine_memory=4294967296, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true} committed version [5724]])
[INFO], 2021-01-19 18:20:40, removed {{elasticsearch-test-data-0}{_P6EIP6yRKGAmXIxc504Gg}{Np9aRvoARI2580lu-yw0Og}{10.18.74.23}{10.18.74.23:9300}{ml.machine_memory=19327352832, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true},}, reason: apply cluster state (from master [master {elasticsearch-test-2}{jMEliMfUTB6QnVDvNSCPjA}{ZX4pM2fTTrmm9XqC4MAj1w}{10.18.70.114}{10.18.70.114:9300}{ml.machine_memory=4294967296, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true} committed version [5772]])
[INFO], 2021-01-19 19:51:13, added {{elasticsearch-test-data-0}{_P6EIP6yRKGAmXIxc504Gg}{Np9aRvoARI2580lu-yw0Og}{10.18.74.23}{10.18.74.23:9300}{ml.machine_memory=19327352832, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true},}, reason: apply cluster state (from master [master {elasticsearch-test-2}{jMEliMfUTB6QnVDvNSCPjA}{ZX4pM2fTTrmm9XqC4MAj1w}{10.18.70.114}{10.18.70.114:9300}{ml.machine_memory=4294967296, ml.max_open_jobs=20, xpack.installed=true, ml.enabled=true} committed version [5780]])
```

* `GET /_cluster/allocation/explain`를 이용해 상세한 이유 확인
```json
GET /_cluster/allocation/explain
{
  "index" : "test_idx_2",
  "shard" : 2,
  "primary" : false,
  "current_state" : "unassigned",
  "unassigned_info" : {
    "reason" : "ALLOCATION_FAILED",
    "at" : "2021-01-19T19:56:18.605Z",
    "failed_allocation_attempts" : 5,
    "details" : "failed shard on node [_P6EIP6yRKGAmXIxc504Gg]: failed to create shard, failure IOException[failed to obtain in-memory shard lock]; nested: ShardLockObtainFailedException[[test_idx_2][2]: obtaining shard lock timed out after 5000ms]; ",
    "last_allocation_status" : "no_attempt"
  },
  "can_allocate" : "no",
  "allocate_explanation" : "cannot allocate because allocation is not permitted to any of the nodes",
  "node_allocation_decisions" : [
    {
      "node_id" : "2UCW7QT_RK2TJ34P7Uy9GQ",
      "node_name" : "test-elasticsearch-data-0",
      "transport_address" : "10.18.61.219:9300",
      "node_attributes" : {
        "ml.machine_memory" : "19327352832",
        "ml.max_open_jobs" : "20",
        "xpack.installed" : "true",
        "ml.enabled" : "true"
      },
      "node_decision" : "no",
      "deciders" : [
        {
          "decider" : "max_retry",
          "decision" : "NO",
          "explanation" : "shard has exceeded the maximum number of retries [5] on failed allocation attempts - manually call [/_cluster/reroute?retry_failed=true] to retry, [unassigned_info[[reason=ALLOCATION_FAILED], at[2021-01-19T19:56:18.605Z], failed_attempts[5], delayed=false, details[failed shard on node [_P6EIP6yRKGAmXIxc504Gg]: failed to create shard, failure IOException[failed to obtain in-memory shard lock]; nested: ShardLockObtainFailedException[[test_idx_2][2]: obtaining shard lock timed out after 5000ms]; ], allocation_status[no_attempt]]]"
        },
        {
          "decider" : "same_shard",
          "decision" : "NO",
          "explanation" : "the shard cannot be allocated to the same node on which a copy of the shard already exists [[test_idx_2][2], node[2UCW7QT_RK2TJ34P7Uy9GQ], [R], s[STARTED], a[id=hCs2KK_RS_-URQTBJTUokA]]"
        }
      ]
    },
    ...
  ]
}
```


<br>

## Resolve
* cluster load가 낮아서 replica shard count를 조정하여 reassign
```json
// 할당 안된 shard를 제거
PUT /test_idx_2/_settings
{
    "index" : {
        "number_of_replicas" : 0
    }
}

// 다시 생성
PUT /test_idx_2/_settings
{
    "index" : {
        "number_of_replicas" : 2
    }
}
```

* replica shard를 재생성하지 않고, 아래 방법으로 할당할 수 도 있다
```
POST /_cluster/reroute?retry_failed=true
```

<br><br>

> #### Reference
> * [Red Cluster State: failed to obtain in-memory shard lock #23199 - Elasticsearch](https://github.com/elastic/elasticsearch/issues/23199)
> * [Amazon Elasticsearch Service에서 “메모리 내 샤드 잠금을 얻지 못함(failed to obtain in-memory shard lock)” 예외를 해결하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/es-in-memory-shard-lock/)
