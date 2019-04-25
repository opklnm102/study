# [k8s] About kube-state-metrics
> date - 2019.04.26  
> keyword - kubernetes, k8s, metrics, monitoring  
> kube-state-metrics에 대해 알아보자  

<br>

## kube-state-metrics이란?
* Add-on agent to generate and expose cluster-level metrics
* Kubernetes API server를 Listen해 k8s API object state(Deployments, ReplicaSet 등)에 대한 metrics을 생성
  * cluster의 snapshot을 memory에 저장하고 이를 기반으로 metric 생성
  * Node, Pod, Job의 현재 상태
  * Resource request와 min/max limit
  * 실행 중인 container 수
  * 특정 상태에 있는 container 수
* kubectl은 heuristics을 사용하기 때문에 특정 상황에서 kube-state-metrics와 동일한 값을 표시하지 않을 수도 있다
* k8s API object의 변경 없이 raw data expose하기 때문에 원하는 방식으로 가져가서 사용하면 된다
  * HTTP endpoint(default. 80 port) `/metrics`
  * Prometheus 
  * Promethues client endpoint scraping과 호환되는 scraper
* kubernetes cluster와 통신에 [kubernetes/client-go](https://github.com/kubernetes/client-go) 사용
* 지원하는 kubernetes version은 [compatibility matrix](https://github.com/kubernetes/kube-state-metrics#compatibility-matrix) 참고
* 자체 metric은 telemetry-host, telemetry-port(default. 81)에서 노출
* addon-resizer를 사용해 Node 수에 따라 자동으로 scale up/down
  * cpu limit가 너무 낮으면 internal queue를 충분히 빨리 처리할 수 없으므로 queue size가 늘어남에 따라 memory 소비가 증가하므로 높은 memory issue를 해결하기 위해 cpu limit를 높여라


<br>

> kube-state-metrics와 resource 사용량(CPU, memory, network, storage)을 결합해서 monitoring 하자


<br>

## [Exposed Metrics](https://github.com/kubernetes/kube-state-metrics/blob/master/docs/README.md#exposed-metrics)
kube-state-metrics를 사용해 얻을 수 있는 metrics는 다음과 같다

* CronJob Metrics
* DaemonSet Metrics
* Deployment Metrics
* Job Metrics
* LimistRange Metrics
* Node Metrics
* PersistentVolume Metrics
* PersistentVolumeClaim Metrics
* Pod Metrics
* Pod Disruption Metrics
* ReplicaSet Metrics
* ReplicationController Metrics
* ResourceQuota Metrics
* Service Metrics
* StatefulSet Metrics
* Namespace Metrics
* Horizontal Pod Autoscaler Metrics
* Endpoint Metrics
* Secret Metrics
* ConfigMap Metrics
* Ingress Metrics
* CertificateSigningRequest Metrics


<br>

### metrics 형태
```
# TYPE kube_service_info gauge
kube_service_info{namespace="default",service="order-frontend",cluster_ip="10.3.0.2",external_name="",load_balancer_ip=""} 1
kube_service_info{namespace="default",service="order-backend",cluster_ip="10.3.0.3",external_name="",load_balancer_ip=""} 1
...
```

> TODO: kube-state-metrics가 metric을 어떤 프로세스를 통해 제공하는지 과정을 그림으로 표현한걸 추가  
> kubelet과 어떤 연관이 있는지


<br>

## Join Metrics
* 추가로 label이 필요하면 [Prometheus matching operator](https://prometheus.io/docs/prometheus/latest/querying/operators/#vector-matching)를 사용

### Example
* TODO: 이해가 안간다...
```
kube_pod_status_ready * on (namespace, pod) group_left(label_release) kube_pod_labels
```

* Running phase Pod의 memory usage
```
sum(kube_pod_container_resource_requests_memory_bytes) by (namespace, pod, node) * on (pod) group_left() (sum(kube_pod_status_phase{phase="Running"}) by (pod, namespace) == 1)
```


<br>

<br>

## Usage
* Kubernetes Cluster에 Pod으로 생생하고, service account에 cluster의 read-only role만 부여
* [kube-state-metrics/kubernetes](https://github.com/kubernetes/kube-state-metrics/tree/master/kubernetes) 참고


<br>

### Datadog integration
* [kube-state-metrics manifests](https://github.com/kubernetes/kube-state-metrics/tree/master/kubernetes)를 이용해 kubernetes cluster에 deploy 한 후

#### Datadog Agent v6일 때
* 자동으로 수집된다

#### Datadog Agent v5일때
* Datadog Agent에 `conf.d/kubernetes_state.yaml`을 추가
```yaml
init_config:

instances:

    ## @param kube_state_url - string - required
    ## To enable Kube State metrics you must specify the url exposing the API
    #
  - kube_state_url: http://example.com:8080/metrics

    ## @param labels_mapper - dictionary - optional
    ## Tags are reported as set by kube-state-metrics. If you want to translate
    ## them to other tags, use the labels_mapper dictionary
    #
    # labels_mapper:
    #   namespace: kube_namespace

    ## @param label_joins - custom - optional
    ## Add the tags to join from other KSM metrics.
    ## Example: Joining for deployment metrics. Based on: kube_deployment_labels{deployment="kube-dns",label_addonmanager_kubernetes_io_mode="Reconcile"}
    ## Use the following config to add the value of label_addonmanager_kubernetes_io_mode as a tag to your KSM deployment metrics.
    #
    # label_joins:
    #   kube_deployment_labels:
    #     label_to_match: deployment
    #     labels_to_get:
    #       - label_addonmanager_kubernetes_io_mode

    ## @param hostname_override - boolean - optional - default: false
    ## By default the hostname for metrics containing the node label is
    ## overriden by the value of the label, this can be deactivated (all metrics
    ## will be attached to the host running KSM)
    #
    # hostname_override: false

    ## @param tags  - list of key:value element - optional
    ## List of tags to attach to every metric, event and service check emitted by this integration.
    ##
    ## Learn more about tagging: https://docs.datadoghq.com/tagging/
    #
    # tags:
    #   - <KEY_1>:<VALUE_1>
    #   - <KEY_2>:<VALUE_2>

    ## @param prometheus_timeout - integer - optional - default: 10
    ## Set a timeout for the prometheus query.
    #
    # prometheus_timeout: 10
```


<br>

## kube-state-metrics 1.4.0 & Datadog v5 issue
```sh
E0412 09:03:02.762579       1 main.go:52] [error while sending encoded metrics: write tcp 10.2.103.23:8080->10.2.103.17:48454: write: broken pipe]
E0412 09:07:41.068154       1 main.go:52] [error while sending encoded metrics: write tcp 10.2.103.23:8080->10.2.103.17:50562: write: broken pipe]
...
```
* dd-agent 와 통신 오류
* kube-state-metrics => dd-agent-daemonset
* [error while sending encoded metrics: write: broken pipe #550](https://github.com/kubernetes/kube-state-metrics/issues/550)의 내용에 따라 1.4.0 -> 1.5.0으로 upgrade 후 해결


<br><br>

> #### Reference
> * [kubernetes/kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)
> * [kubernetes/client-go](https://github.com/kubernetes/client-go)
> * [Using Autodiscovery with Kubernetes and Docker - Datadog](https://docs.datadoghq.com/agent/autodiscovery/?tab=docker)
> * [Kubernetes Basic Agent Usage in Agent v5](https://docs.datadoghq.com/agent/guide/agent-5-kubernetes-basic-agent-usage/)
