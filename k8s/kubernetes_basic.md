# [k8s] Kubernetes Basic
> date - 2018.10.18  
> keyword - kubernetes, k8s, container orchestration  
> [2017.11 Oracle meetup kubernetes](https://www.slideshare.net/OracleDeveloperkr/oracle-meetup-kubernetes171118)에서 들었던 내용을 기반으로 k8s에 대해 기초 내용 정리

<br>

## Container
* Legacy 
![Lagacy Architecture](./images/legacy_architecture.png)

* MSA
![Netflix Architecture](./images/netflix_architecture.png)

* MSA & DevOps
* 다양한 runtime을 container로 추상화
  * 동일한 인터페이스를 제공하여 배포 및 관리 단순화

<br>

## Container Orchestration
* 적은 수의 container는 docker만으로 가능하지만 수백~천개가 되면 관리하기 어렵다
* Container Orchestration Tool 등장
  * [Kubernetes(k8s)](https://kubernetes.io/) - Production-Grade Container Orchestration
  * [Docker Swarm](https://github.com/docker/swarm) - Docker-native clustering system
  * [Mesosphere Marathon](https://mesosphere.github.io/marathon/) - Producation-proven Apache Mesos framework for container orchestration
    * [DC/OS](https://dcos.io/) - Marathon을 쉽게 사용할 수 있다
* Developer
  * Core Concepts
    * Cluster
    * Single container
    * Multi container
  * Service Discovery & Load Balancing
  * Persistent Volumes
  * Local development
* Ops
  * Multiple master
  * Scheduler
  * Rules and constraints
  * Monitoring
  * Rolling update
  * Cloud/commercial support

![Container Orchestration Tale](./images/container_orchestration_table.png)
> 반만 지원되는건 ㊀로 표시


<br>

## Kubernetes
* Container Orchestration Tool
  * automating deployment
  * scaling
  * management of containerized application
* 많이 사용되는 tool이라는걸 알 수 있다
![manages containers tool](./images/manages_containers_tool.png)
from CNCF Survey in 2018  

* Packaging
  * Helm(68%)
  * kubernetes offerings(19%)
* Autoscaling
  * stateless application(64%)
  * Java application(45%)
  * task/queue processing application(37%)
* Ingress Providers
  * nginx(64%)
  * HAProxy(29%)
  * F5(15%)
  * Envoy(15%)
* Exposing Cluster External Services
  * 인터넷, VM 같은 클러스터 외부 서비스 노출하는 방법으로는
  * Load Balancer(67%)
  * L7 ingress(39%)
  * 3rd party Load Balancer(33%)
* Separating Kubernetes in an Organization with Multiple Teams
  * 조직의 다양한 팀에서 k8s를 분리하는 방법으로는
  * namespaces(71%)
  * 개별 cluster(51%)
  * label만(15%) 사용
* Separating Kubernetes Applications
  * k8s에서 application을 분리하는 방법으로는
  * namespace(78%)
  * 개별 cluster(50%)
  * label만(21%) 사용


> Kubernetes를 설정, 운영하려면 인프라 지식 필요  
> infrastructure 추상화라고 생각하자  

<br>

![kubernetes architecture v1.1](./images/kubernetes_architecture_v1.1.png)
kubernetes architecture v1.1

<br>

![kubernetes_architecture_overview](./images/kubernetes_architecture_overview.png)
kubernetes architecture overview


<br>

## Node

<img src="./images/kubernetes_node_overview.png" alt="node overview" height="400">

<img >

### Master Node(Cluster control plane)
* 클러스터에 대한 관리 역할
* Rest API로 Client, Worker Node와 통신
* Scheduler, Replication Controller

### Worker Node
* 실제 Container가 실행되어 사용자가 사용할 수 있도록 서비스 제공

### [etcd](https://github.com/etcd-io/etcd) Node
* distributed key value store
* k8s cluster의 모든 상태 저장
* k8s API object 저장

### Kubelet
* Node에서 동작하는 Agent
  * Container Runtime(docker..) 연동
* health check

### kube-Proxy
* 외부의 사용자 요청을 처리, Service들의 Load balancer
* L3(IP) Load balancing 지원
  * iptables 사용

### cAdvisor/Heapster
* Node의 리소스 모니터링

### Ingress Controller
* L7 기반의 Load balancing 지원
  * url 기반


<br>

## Pod
<img src="./images/kubernetes_pod_overview.png" alt="pod overview" height="250">

* 동일한 Lifecycle을 가지는 하나이상의 Container로 구성
* Pod당 하나의 dynamic IP 할당
* Container끼리 localhost 통신 가능
* Block Storage, Secret, Config 공유
  * Container가 재시작하더라도 Pod이 살아있는한 Shared volume 유지
  * Container는 휘발성 리소스
* 1 Container당 1 process

> #### 하나의 pod에 다수의 container를 띄우는 예 
> * nginx, nginx config, supervisor 등이 있을 때

## Scheduler
* Node에 할당되지 않은 pod를 감시하고 실행될 node에 할당하는 master node의 component
* Node의 리소스를 효율적으로 사용할 수 있도록 관리
  * 개별/집단 요구 리소스, HW, SW, 제약 정책, 선호/비선호도, 데이터 지역성, 작업 부하간 간섭 등을 기반으로 scheduling


<br>

## Service
<img src="./images/kubernetes_service_overview.png" alt="kubernetes service overview" height="400">

* 여러개의 Pod을 관리
  * k8s의 모든 component는 Pod으로 등록

<img src="./images/kubernetes_service.png" alt="kubernetes service" height="400">

<!-- ![kubernetes service](./images/kubernetes_service.png) -->
* component communication 관리
  * pod간의 트래픽 라우팅

### Service Discovery
<img src="./images/kubernetes_service_discovery1.png" alt="kubernetes service discovery1" height="250">

<img src="./images/kubernetes_service_discovery2.png" alt="kubernetes service discover2" height="400">

<br>

## Secret

<br>

## ConfigMap

<br>

## PetSet
* stateful application 지원
  * clustering

<br>

## Labels

<img src="./images/kubernetes_service_with_labels.png" alt="kubernetes service with labels" height="400">

* pod, service 등을 동일한 label로 관리 가능

<br>

## Deployments
* rolling update, rollback 등을 지원하는 pod, replica set

<br>

## Namespace

<br>

## Volume
* emptyDir, NFS, iSCSI, GFS, CephFS...

<br>

## PersistentVolume
<img src="./images/kubernetes_volume.png" alt="kubernetes volume" height="200">

* networked storage 개념

<br>

## Kubernetes Tools

### kubectl
* k8s API의 CLI
* kubeconfig 파일에 정의된 정보 사용
  * cluster, context, security...
* example

```sh
# pod 생성
$ kubectl create -f my-pod.yml

# pod 조회
$ kubectl get pods
```

### [kubeadm](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/)
* `kubeadm init`, `kubeadm join`으로 k8s cluster를 생성의 best pratice를 제공하는 tool
* 최소 조건으로 cluster를 구성
* 표준 cluster를 쉽게 구성 가능
* provisioning machine이 아닌 bootstrapping만 고려
  * Kubernetes Dashboard, monitoring solution, cloud-specific addons은 고려 X

### [helm](https://github.com/helm/helm)
* The Kubernetes Package Manager

### [Helm Charts](https://github.com/helm/charts)
* Curated applications for Kubernetes

### [minikube](https://github.com/kubernetes/minikube)
* Run Kubernetes locally
* virtualbox 기반의 single node cluster 제공
* 가장 편하게 k8s 환경에서 개발/테스트 가능

### [CoreOS-Kubernetes-Vagrant](https://github.com/coreos/coreos-kubernetes)
* CoreOS Container Linux+Kubernetes documentation & Vagrant installers

### [Prometheus](https://prometheus.io/)
* metrics
* kubernetes는 logging이 어렵다

<br>

> #### 막간을 이용해 container native application development platform을 살펴보자
> <img src="./images/container_native_application_development_platform.png" alt="container native application development platform" height="350">

<br>

> #### Reference
> * [Oracle meetup kubernetes_171118](https://www.slideshare.net/OracleDeveloperkr/oracle-meetup-kubernetes171118)
> * [Container Orchestration Wars (2017 Edition)](https://www.slideshare.net/KarlIsenberg/container-orchestration-wars-2017-edition)
> * [CNCF Survey: Use of Cloud Native Technologies in Production Has Grown Over 200% - 2018.08.29](https://www.cncf.io/blog/2018/08/29/cncf-survey-use-of-cloud-native-technologies-in-production-has-grown-over-200-percent/)
