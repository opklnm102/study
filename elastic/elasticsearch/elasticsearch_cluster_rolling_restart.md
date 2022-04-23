# [ES] Elasticsearch cluster rolling restart
> date - 2022.04.22  
> keyword - elasticsearch, kubernetes, rolling restart  
> Kubernetes cluster 환경에서 Elasticsearch cluster rolling restart를 shell script로 자동화 했던 내용 정리

<br>

## TL;DR
* `StatefulSet`을 수정 후 아래 명령어를 실행하면된다
```sh
## StatefulSet 변경 사항 반영
$ kubectl apply -f [elasticsearch StatefulSet manifest file]

## rolling restart script 실행
$ ./rolling-restart-elasticsearch.sh elasticsearch-test
```


<br>

## Requirements
* Elasticsearch 6.7.2
* kubectl
* curl
* jq


<br>

## Rolling restart

### use case
* version upgrade
* plugin install
* `elasticsearch.yml` 수정

<br>

### 1. StatefulSet 수정
* `.spec.updateStrategy: OnDelete`를 사용
  * OnDelete - Pod delete시 변경 사항이 적용
  * [StatefulSets Update strategies - Kubernetes Docs](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#update-strategies)

```yaml
apiVersion: apps/v1
kind: StatefulSet
...
spec:
  updateStrategy:
    type: OnDelete
...
```
* 원하는 설정도 변경한 후 cluster에 반영
```sh
$ kubectl apply -f [elasticsearch StatefulSet manifest file]
```

<br>

### 2. Disable shard allocation
* node shutdown 발생시 failover 동작으로 shard allocation 발생
* rolling restart 과정에서 불필요한 shard allocation으로 인해 overhead(I/O 낭비 등)를 방지한다
  * large shard일수록 overhead(disk I/O, network bandwidth, 소요 시간 등)가 커진다

```
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

> #### cluster.routing.allocation.enable option
> * all(default) - 모든 shard allocation 허용
> * primaries - primary shard만 allocation 허용
> * new_primaries - new index의 primary shard만 allocation 허용
> * none - 모든 shard allocation 불가

<br>

> #### cluster settings order of precedence
> 1. transient setting - node restart에서는 유실되지 않지만, full cluster restart에서는 유실될 수 있다
> 2. persistent setting
> 3. `elasticsearch.yml` configuration file
> 4. default value

<br>

### 3. Stop-non essential indexing and perform a synced flush(optional)
* 필수적이지 않은 indexing을 일시 중지하고 [Synced flush API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-synced-flush-api.html) 실행
  * indexer의 indexing을 일시 중지시키는 것을 권장
* flush 후 shard 마다 unique sync-id를 발급
  * best effort operation으로 필요한 경우 여러번 호출
* shard 비교는 recovery/restart시 가장 cost가 높은 작업으로 sync-id만으로 서로 동일한 shard인지 비교 가능하여 overhead 감소(recovery 속도 증가)

```
POST _flush/synced
```

<br>

### 4. Restart node
* Elasticsearch node(Pod)를 restart시키면서 `StatefulSet`의 변경 사항이 반영되게한다
  * Upgrade `Elasticsearch` & `elasticsearch-plugin`
  * Update `elasticsearch.yml` configuration file
  * ...

```sh
$ kubectl delete pod [Elasticsearch node Pod]
```

<br>

### 5. Check cluster join to single node
* 아래 API로 Elasticsearch node의 cluster join 확인

```sh
GET _cat/nodes
```

<br>

### 6. Reenable shard allocation
* Elasticsearch node의 cluster join이 확인되면 shard allocation 활성화
* persistent 설정을 `null`로 제거하여 cluster settings 우선 순위에 따라 동작하게 하거나 default인 `all`을 명시적으로 설정
```
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": null  // or all(default)
  }
}
```

<br>

### 7. Wait for the node to recover
* shard 유실 방지를 위해 shard allocation을 기다린다
* `_cat/health`로 cluster status green을 확인할 떄 까지 대기
```
GET _cat/health
```
* 만약 [Synced flush API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-synced-flush-api.html)를 실행하지 않았다면 shard recovery가 오래 걸릴 수 있다
  * `_cat/recovery`로 shard status를 확인

```
GET _cat/recovery
```

<br>

### 8. Repeat
* 2 ~ 7을 반복하면 되는데 그 과정을 script로 작성
```sh
#!/usr/bin/env bash
#
# Dependencies:
#   brew install jq curl nc
#
# Setup:
#   chmod 700 ./rolling-restart-elasticsearch.sh
#
# Usage:
#   ./rolling-restart-elasticsearch.sh [elasticsearch cluster name]

set -euo pipefail

fail() {
  echo "ERROR: ${*}"
  exit 1
}

usage() {
  cat <<-EOM
Usage:
      ${0##*/} [elasticsearch cluster name]
      e.g. ${0##*/} elasticsearch-test
EOM
  exit 1
}

# Validate the number of command line arguments
if [[ $# -lt 1 ]]; then
  usage
fi

# Validate that this workstation has access to the required executables
ELASTICSEARCH_CLUSTER=${1}

command -v jq >/dev/null || fail "jq is not installed!"
command -v curl >/dev/null || fail "curl is not installed!"
command -v nc >/dev/null || fail "nc is not installed!"

# Connect Elasticsearch cluster with kubectl port-forward
# Usage:
#   connect_elasticsearch_cluster [elasticsearch cluster name]
connect_elasticsearch_cluster() {
  elasticsearch_cluster_name=${1}
  kubectl port-forward "service/${elasticsearch_cluster_name}" 9200:http >/dev/null 2>/dev/null &

  # Wait for the port-forward to exist
  while ! nc -vz localhost 9200 > /dev/null 2>&1 ; do
    sleep 1s
  done
}

# Disconnect Elasticsearch cluster with kubectl port-forward
# Usage:
#   disconnect_elasticsearch_cluster [elasticsearch cluster name]
disconnect_elasticsearch_cluster() {
  # pkill -f "port-forward"
  elasticsearch_cluster_name=${1}
  pkill -f "port-forward service/${elasticsearch_cluster_name}"
}

# Sets the cluster.routing.allocation.enable settings to "primaries".
# Prevents shards from being migrated from an upgrading Data Node to another active Data Node.
# Usage:
#   disable_shard_allocation
disable_shard_allocation() {
  echo "Disable shard allocation..."
  curl -X PUT "localhost:9200/_cluster/settings" \
       -H "Content-Type: application/json" \
       -d '{"persistent":{"cluster.routing.allocation.enable":"primaries"}}'
  echo ""
}

# Disable cluster processes as recommended by the Elasticsearch documentation
# Usage:
#   prepare_for_update
prepare_for_update() {
  disable_shard_allocation

  echo "Stop non-essential indexing and perform a sync flush..."
  curl -X POST "localhost:9200/_flush/synced"
  echo ""
}

# sets the cluster.routing.allocation.enable to the default value ("all")
# Usage:
#   enable_shard_allocation
enable_shard_allocation() {
  echo ""
  curl -X PUT "localhost:9200/_cluster/settings" \
       -H "Content-Type: application/json" \
       -d '{"persistent":{"cluster.routing.allocation.enable":"all"}}'
  echo ""
}

# Checks cluster health in a loop waiting for unassigned to return to 0
# Usage:
#   wait_for_allocations
wait_for_allocations() {
  echo "Checking shard allocations"
  while true; do
    unassigned=$(curl "localhost:9200/_cluster/health" 2>/dev/null \
                 | jq -r '.unassigned_shards')
    if [[ "${unassigned}" == "0" ]]; then
      echo "All shards-reallocated"
      return 0
    else
      echo "Number of unassigned shards: ${unassigned}"
      sleep 3s
    fi
  done
}

# checks the cluster health endpoint and looks for a 'green' status response in a loop
# Usage:
#   wait_for_green [data nodes]
# Where:
#   [data nodes] is the number of replicas defined in the Data Node StatefulSet
wait_for_green() {
  data_nodes=${1}
  echo "Checking cluster status"
  # First, wait for the new data node to join the cluster, wait and loop
  while true; do
    nodes=$(curl "localhost:9200/_cluster/health" 2>/dev/null \
             | jq -r '.number_of_data_nodes')
    if [[ ${nodes} == "${data_nodes}" ]]; then
      # Now that the data node is back, we can re-enable shard allocations
      echo "Elasticsearch cluster status has stabilized"
      enable_shard_allocation

      # Wait for the shards to re-initialize
      wait_for_allocations
      break
    fi
    echo "Data nodes available: ${nodes}, waiting..."
    sleep 20s
  done

  # Now that the data node is joined, wait for its shards to complete initialization
  while true; do
    status=$(curl "localhost:9200/_cluster/health" 2>/dev/null \
             | jq -r '.status')
    if [[ "${status}" == "green" ]]; then
      echo "Cluster health is now ${status}, continuing upgrade...."
      disable_shard_allocation
      return 0
    fi
    echo "Cluster status: ${status}"
    sleep 5s
  done
}

# Update a Statefulset's image tag then upgrade one pod at a time, waiting for the cluster health to return to 'green' before proceeding to the next pod
# Usage:
#   restart_statefulset [StatefulSet name]
# Where:
#   [StatefulSet name] - the name of the StatefulSet
restart_statefulset() {
  name=${1}

  echo "Restarting the ${name} Statefulset to Elasticsearch"

  # For a StatefulSet with 3 replicas, this will loop three times wth the 'ORDINAL' values 2, 1, and 0
  replicas=$(kubectl --namespace default get statefulset "${name}" -o jsonpath='{.spec.replicas}')
  max_ordinal=$(( ${replicas} - 1 ))
  for ordinal in $(seq "${max_ordinal}" 0); do
    current_pod="${name}-${ordinal}"
    echo "Restarting ${current_pod}"

    kubectl --namespace default delete pod "${current_pod}"

    # Give some time for the es java process to terminate and the cluster state to turn 'yellow'
    sleep 3s

    # Now wait for the cluster health to return to 'green'
    wait_for_green "${replicas}"
  done
}

# Re-enable any services disabled prior to the upgrade
post_update_cleanup() {
  enable_shard_allocation
}

restart_master_node() {
  kubectl rollout restart sts "${ELASTICSEARCH_CLUSTER}-master"
}

restart_data_node() {
  prepare_for_update
  restart_statefulset "${ELASTICSEARCH_CLUSTER}-data"
  post_update_cleanup
}

# The restart procedure
echo "Elasticsearch cluster name: ${ELASTICSEARCH_CLUSTER}"

connect_elasticsearch_cluster "${ELASTICSEARCH_CLUSTER}"
restart_master_node
restart_data_node
disconnect_elasticsearch_cluster "${ELASTICSEARCH_CLUSTER}"

echo "Restart complete!"
```

<br>

> #### Rolling upgrade시
> * version upgrade시 version간 data format이 다를 수 있기 때문에 상위 version node의 primary shard는 하위 version의 node에 replica shard가 생성되지 않는다
> * 상위 version node가 1개일 시점에는 replica shard가 존재할 수 없기 때문에 cluster status는 yellow가 되고, 진행됨에 따라 상위 version node에 replica shard가 생성되면서 green이 된다


<br><br>

> #### Reference
> * [Rolling upgrades - Elasticsearch 6.7 Docs](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/rolling-upgrades.html)
> * [Cluster Update Settings - Elasticsearch 6.7 Docs](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/cluster-update-settings.html)

