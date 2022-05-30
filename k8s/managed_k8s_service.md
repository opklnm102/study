# [k8s] Managed Kubernetes Services
> date - 2022.05.30  
> keyworkd - kubernetes, k8s, csp  
> CSP에서 제공하는 managed kubernetes service에 대한 내용 정리

<br>

## Managed Kubernetes Services란?
* AWS, GCP, Azure 같은 CSP(Cloud Service Provider)에서 Kubernetes에 대한 서비스를 hosting 형태로 제공
* **Cluster as a Service**
* CSP(Cloud Service Provider)가 Kubernetes control plane을 관리
  * api-server
  * scheduler
  * controller-manager
  * addon-manager
  * Etcd
* 유저는 workload가 실행되는 Kubernetes data plane(worker node) 관리
  * kubelet
  * kube-proxy
  * container runtime
  * CoreDNS
  * CNI
  * ...
* control plane의 provisioning, upgrade(Kubernetes version에 맞는 OS image 포함), scaling, monitoring 지원
* [AKS(Azure Kubernetes Service)](https://docs.microsoft.com/ko-kr/azure/aks), [GKE(Google Kubernetes Engine)](https://cloud.google.com/kubernetes-engine), [Amazon EKS(Elastic Kubernetes Service)](https://aws.amazon.com/ko/eks) 등이 있다


<br><br>

> #### Reference
> * [AKS(Azure Kubernetes Service)](https://docs.microsoft.com/ko-kr/azure/aks)
> * [GKE(Google Kubernetes Engine)](https://cloud.google.com/kubernetes-engine)
> * [Amazon EKS(Elastic Kubernetes Service)](https://aws.amazon.com/ko/eks)
