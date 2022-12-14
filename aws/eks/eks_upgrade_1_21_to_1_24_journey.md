# [AWS] Amazon EKS Upgrade 1.21 to 1.24 Journey
> date - 2022.12.09  
> keyworkd - aws, eks, kubernetes  
> upgrade 방법은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고하고, 여기서는 1.21 -> 1.24의 변경 사항을 다룬다  

<br>

## Kubernetes 1.22 ~ 1.24의 주요 변경 사항
* [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide)의 검증은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고

<br>

### 1.22
* ingress extensions/v1beta1, networking.k8s.io/v1beta1가 제거되어 networking.k8s.io/v1를 사용해야하고, [aws-load-balancer-controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller)는 2.4.1 이상을 사용해야한다
* `EndpointSlices`에서 종료 상태의 Pod가 포함되는 `EndpointSliceTerminatingCondition` 사용 설정 가능
  * [aws-load-balancer-controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller)는 2.4.1 이상일 때 `enableEndpointSlices=true(default. false)`로 설정
* kube-proxy가 prometheus metrics을 expose
* IRSA(IAM Roles for Service Accounts)에서 AWS STS(Security Token Service) region endpoint를 사용해 latency, reliability 개선
  * [Configuring the AWS Security Token Service endpoint for a service account](https://docs.aws.amazon.com/eks/latest/userguide/configure-sts-endpoint.html)를 참고하여 global endpoint를 사용하게 설정 가능

<br>

### 1.23
* Pod Security Policy(PSP)를 대체하는 [Pod Security Admission(PSA)](https://kubernetes.io/docs/concepts/security/pod-security-admission) beta 전환
  * [Pod Security Standards(PSS)](https://kubernetes.io/docs/concepts/security/pod-security-standards/)와 사용
  * [Implementing Pod Security Standards in Amazon EKS](https://aws.amazon.com/ko/blogs/containers/implementing-pod-security-standards-in-amazon-eks) 참고
* Horizontal Pod Autoscaler(HPA) autoscaling/v2 전환 및 autoscaling/v2beta2 deprecated
* EBS를 위한 [CSI migration](https://kubernetes.io/blog/2019/12/09/kubernetes-1-17-feature-csi-migration-beta) 추가
  * in-tree API를 CSI API로 변환하고, 작업을 CSI driver에 위임
* Kubernetes에서 Pod, Service, Node에 대한 IPv4/IPv6 dual stack networking GA
  * Amazon EKS, Amazon VPC CNI plugin은 지원하지 않아 IPv4/IPv6 중 하나만 할당 가능
* Pod와 동일한 namespace에서 실행되는 ephemeral containers beta 전환
  * 디버깅 유틸리티가 포함된 버전을 제공하는 [distroless image](https://github.com/GoogleContainerTools/distroless#distroless-container-images)가 아닌 image를 사용해 `kubectl exec`로 어려울 경우에 유용
  * [Debugging with an ephemeral debug container](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#ephemeral-container)
* cluster와 함께 배포된 kube-proxy image는 EKS-D(Amazon EKS Distro)에서 관리하는 [minimal base image](https://gallery.ecr.aws/eks-distro-build-tooling/eks-distro-minimal-base-iptables)로 최소 패키지만 포함되며 shell, package manager가 없다

<br>

### 1.24
* container runtime으로 [containerd](https://containerd.io)만 사용
  * `--container-runtime containerd` 같은 관련된 bootstrap script flags 제거 필요
* [KEP-3136: Beta APIs Are Off by Default](https://github.com/kubernetes/enhancements/blob/master/keps/sig-architecture/3136-beta-apis-off-by-default/README.md)에 따라 new beta API는 기본적으로 활성화되지 않는다
* worker node가 여러 AZ(Availability Zone)에 배치될 때 zone에서 트래픽을 유지하기 위해 [Topology Aware Hints](https://kubernetes.io/docs/concepts/services-networking/topology-aware-hints)를 설정하면 zone 내에서 트래픽이 라우팅되므로 비용 절감 및 네트워크 성능을 향상시킬 수 있다

<br><br>

> #### Reference
> * [Updating a cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
> * [Amazon EKS Kubernetes versions - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html)
> * [Amazon EKS platform versions](https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html)
