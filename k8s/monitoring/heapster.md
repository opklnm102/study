# [k8s] About heapster
> date - 2019.05.02  
> keyword - kubernetes, k8s, metrics, monitoring  
> heapster에 대해 알아보자  


<br>

## Heapster란?
* Container cluster의 compute resource 사용량 analysis and monitoring
  * compute resource 사용량, lifesycle events 등과 같은 다양한 신호를 수집하고 해석
* 수집된 metrics을 저장하기 위해 다양한 data sink 지원
  * InfluxDB
  * Stackdriver Monitoring and Logging for GCP
  * [Configuring sinks](https://github.com/kubernetes-retired/heapster/blob/master/docs/sink-configuration.md) 참고


<br>

## Heapster는 kubernetes 1.11에 deprecated
* [Heapster Deprecation Timeline](https://github.com/kubernetes-retired/heapster/blob/master/docs/deprecation.md)에서 확인 가능


<br>

### 주요 기능은 다음과 같이 migration할 수 있다
* basic CPU/memory HPA metrics
  * [metrics-server](https://github.com/kubernetes-incubator/metrics-server)로 대체
* general monitoring
  * **Prometheus-formatted metrics을 수집**할 수 있는 third-party monitoring pipeline으로 대체
  * kubelet은 heapster가 prometheus format으로 내보낸 metrics을 노출
  * [Prometheus Operator](https://github.com/coreos/prometheus-operator)로 대체
* event transfer
  * [heptiolabs/eventrouter](https://github.com/heptiolabs/eventrouter)로 대체


<br>

## Heapster의 architecture가 가지고 있는 문제

### 1. data store는 bare time-series database며, direct write path를 허용한다고 가정
* 가장 인기있는 Prometheus은 pull 기반 모델이므로 호환되지 않는다
* kubernetes ecosystem에서 prometheus를 first class support
  * prometheus와 heapster를 사용하면 **heapster를 위해 추가 data store**(e.g. InfluxDB)를 구성

<br>

### 2. sink code가 heapster에 있으므로 vendor dump 발생
* vendor dump - monitoring을 위해 Saas를 제공하는 vendor가 system support를 구현 후 support를 포기하는 것

<br>

### 3. prometheus를 data sink로 구현하지 않지만 prometheus format의 metrics 제공하기 때문에 혼란 발생
* Model API는 Kubernetes API 표준 준수 X
* aggregate 하기 어렵고, 특정 경우에 metric을 표시하지 못하게 하는 경우가 많다

> [k8s.io/metrics](https://github.com/kubernetes/metrics)으로 대체


<br>

## heapster의 문제점을 해결하기 위해 resource metrics API와 custom metrics API 정의

### metrics-server
* resource metrics api의 표준 구현
* cpu, memory를 단순히 수집
* kubelet의 stats API를 통해 cluster의 모든 kubelet에서 수집
  * 수집된 통계는 Pod, Node의 메모리에 유지
* custom metrics API 구현은 backing monitroing system에 따라 다르다
  * [k8s-prometheus-adapter](https://github.com/directXMan12/k8s-prometheus-adapter)


<br>

## 그래서 metrics-server는 heapster의 문제를 해결했는가...?
* resource metrics을 안정적이고 일관적이게 사용 가능
* data sink에 vendor dump가 없고, adapter를 구현하는 사람이 관리
* push 뿐만 아니라 push based monitoring system도 지원 가능
* prometheus 이외에 data store가 필요한 heapster를 유지할 필요가 없다
  * prometheus는 monitoring, alset, autoscale에 사용 가능


<br><br>

> #### Reference
> * [Heapster](https://github.com/kubernetes-retired/heapster)
> * [Prometheus vs Heapster vs Kubernetes Metrics APIs](https://brancz.com/2018/01/05/prometheus-vs-heapster-vs-kubernetes-metrics-apis/)
