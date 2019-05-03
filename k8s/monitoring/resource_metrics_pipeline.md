# [k8s] About Resource metrics pipeline
> date - 2019.05.03  
> keyword - kubernetes, k8s, metrics, monitoring  
> kubernetes의 resource metrics pipeline에 대해 알아보자  

<br>

## Resource metrics pipeline
* **Metrics API**와 **Metrics Server**로 구성


<br>

## [Metrics API](https://github.com/kubernetes/metrics)
* Node나 Pod의 리소스(cpu, memory) 사용량을 **실시간으로 확인**할 수 있다
* metrics을 저장하지 않으므로 **과거의 사용량을 조회할 수 없다**
* 다른 API와 동일한 보안 확정성 및 안정성 보장
* `kubectl top`또는 Kubernetes API endpoint로 사용 가능
  * endpoint는 `/apis/metrics.k8s.io/`
  * controller에서 Horizontal Pod Autoscaler 등을 결정하기 위해 사용
* 사용하기 위해 metrics-server deploy 필요
* kubernetes 1.8이상 부터 지원


<br>

### metrics API를 사용하기 위해서는 cluster내에 metrics server 필요
* metrics server가 없을 경우
```sh
$ kubectl top node node1
Error from server (ServiceUnavailable): the server is currently unable to handle the request (get nodes.metrics.k8s.io node1)
```


<br>

### Use cases
* Horizontal Pod Autoscaler
  * 최근 1분동안의 CPU 사용량을 평균으로 집계
* Scheduler
  * Pod schedule을 위해 Node level 리소스 사용량을 평균 1분내에 집계


<br>

## [Metrics Server](https://github.com/kubernetes-incubator/metrics-server)
* cluster의 **resource 사용량 aggregator**
* kubelet에서 summary API를 통해 제공되는 **모든 Node의 metric을 주기적으로 스크랩**하는 cluster level component
  * kubelet summary API - http://Node-IP:10255/stats/summary
  * 10255 - kubelet port
* [kubernetes aggregator](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/apiserver-aggregation/)를 통해 main API server에 등록된다
* aggregate된 metric은 **최신 값만 memory에 저장**되어 [Metrics API format](https://github.com/kubernetes/metrics/blob/master/pkg/apis/metrics/v1alpha1/types.go)으로 제공
* [Kubernetes Monitoring Pipeline](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/instrumentation/monitoring_architecture.md)을 위해 구현
* metrics-server는 3rd party로 전달할 책임은 없다
* heapster의 기능 중 basic CPU/memory HPA metrics의 대체제
* custom metrics API 구현은 backing monitroing system에 따라 다르다
  * [k8s-prometheus-adapter](https://github.com/directXMan12/k8s-prometheus-adapter)
* high metrics volume을 처리하기 위해 [addon-resizer](https://github.com/kubernetes/autoscaler/tree/master/addon-resizer)에 의해 auto scale up된다


<br>

## Usage

### Deployment
* [deploy yaml](https://github.com/kubernetes-incubator/metrics-server/tree/master/deploy)이나 [helm chart](https://github.com/helm/charts/tree/master/stable/metrics-server) 사용


<br>

### 실패시 log
```sh
E0313 07:04:16.253649       1 summary.go:97] error while getting metrics summary from Kubelet ip-172-16-0-143.ap-northeast-1.compute.internal(10.0.0.10:10255): Get http://10.0.0.10:10255/stats/summary/: dial tcp 10.0.0.10:10255: getsockopt: connection timed out
W0313 07:04:16.253684       1 manager.go:102] Failed to get kubelet_summary:10.0.0.10:10255 response in time
```


<br>

### kubelet summary API response
```
{
  "node": {
   "nodeName": "ip-10-0-0-10.ap-northeast-1.compute.internal",
   "systemContainers": [
    {
     "name": "pods",
     "startTime": "2019-03-13T06:03:12Z",
     "cpu": {
      "time": "2019-04-19T04:45:25Z",
      "usageNanoCores": 590334015,
      "usageCoreNanoSeconds": 921661652256725
     },
     "memory": {
      "time": "2019-04-19T04:45:25Z",
      "availableBytes": 10011889664,
      "usageBytes": 8003317760,
      "workingSetBytes": 6808895488,
      "rssBytes": 6657257472,
      "pageFaults": 0,
      "majorPageFaults": 0
     },
     "userDefinedMetrics": null
    },
    {
     "name": "kubelet",
     "startTime": "2019-03-13T06:03:12Z",
     "cpu": {
      "time": "2019-04-19T04:45:21Z",
      "usageNanoCores": 35373639,
      "usageCoreNanoSeconds": 98139718366596
     },
     "memory": {
      "time": "2019-04-19T04:45:21Z",
      "usageBytes": 378429440,
      "workingSetBytes": 147861504,
      "rssBytes": 89051136,
      "pageFaults": 714875572,
      "majorPageFaults": 1
     },
     "userDefinedMetrics": null
    },
    {
     "name": "runtime",
     "startTime": "2019-03-13T06:03:12Z",
     "cpu": {
      "time": "2019-04-19T04:45:21Z",
      "usageNanoCores": 32336679,
      "usageCoreNanoSeconds": 67566239390938
     },
     "memory": {
      "time": "2019-04-19T04:45:21Z",
      "usageBytes": 2891485184,
      "workingSetBytes": 1156956160,
      "rssBytes": 90497024,
      "pageFaults": 147736419,
      "majorPageFaults": 15
     },
     "userDefinedMetrics": null
    }
   ],
...
```


<br><br>

> #### Reference
> * [Resource metrics pipeline - k8s docs](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-metrics-pipeline/)
> * [k8s.io/metrics](https://github.com/kubernetes/metrics)
> * [metrics-server](https://github.com/kubernetes-incubator/metrics-server)
> * [Kubernetes Monitoring Pipeline](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/instrumentation/monitoring_architecture.md)
> * [Metrics API format](https://github.com/kubernetes/metrics/blob/master/pkg/apis/metrics/v1alpha1/types.go)
