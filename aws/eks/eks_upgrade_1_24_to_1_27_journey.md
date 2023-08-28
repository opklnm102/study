# [AWS] Amazon EKS Upgrade 1.24 to 1.27 Journey
> date - 2023.08.25  
> keyworkd - aws, eks, kubernetes  
> upgrade 방법은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고하고, 여기서는 1.24 -> 1.27의 변경 사항을 다룬다  

<br>

## Kubernetes 1.25 ~ 1.27의 주요 변경 사항
* [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide)의 검증은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고

<br>

### 1.25
* PSP(PodSecurityPolicy) 제거
  * [PSA + PSS or policy-as-code solution으로 migration](#psppodsecuritypolicy---psskubernetes-pod-security-standards-or-policy-as-code-solution으로-migration)
* APF(API Priority and Fairness) 추가
  * 과부하로부터 API server를 보호하는 역할
  * 우선 순위가 높은 요청이 우선처리되도록하는 동시에 우선 순위가 낮은 요청이 API server에 부담을 주지 않도록 한다
  * [API Priority and Fairness - k8s Docs](https://kubernetes.io/docs/concepts/cluster-administration/flow-control), [API Priority and Fairness - EKS best pratices](https://aws.github.io/aws-eks-best-practices/scalability/docs/control-plane/#api-priority-and-fairness) 참고
  * `list` 요청이 많은 workload에서는 rate limiting(HTTP 429) 발생할 수 있다
    * [Preventing Dropped Requests](https://aws.github.io/aws-eks-best-practices/scalability/docs/control-plane/#preventing-dropped-requests)를 참고하여 `list` 요청을 줄이거나 필수 요청에 더 많은 용량을 할당하도록 APF 설정 수정
* `EndpointSlice`가 discovery.k8s.io/v1beta1 -> discovery.k8s.io/v1로 승격
  * AWS Load Balancer Controller 2.4.6이하가 discovery.k8s.io/v1beta1를 사용하기 때문에 2.4.7 이상을 사용하도록 업그레이드 필요
* API server의 [goway-chance](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/) 활성화
  * 연결을 임의로 닫아 HTTP/2 client 연결에 대한 load balancing
  * [HTTP GOWAY](https://www.rfc-editor.org/rfc/rfc7540#section-6.8)와 호환되는 client 사용 필요

<br>

### 1.26
* CRI v1alpha2 지원 종료
  * container runtime이 CRI v1을 지원히자 않는 경우 kubelet이 node를 등록하지 않는다
  * k8s 1.26으로 upgrade 전에 containerd 1.6.0 이상으로 upgrade 필요
  * Amazon Linux, Bottlerocket AMI에서는 containerd 1.6.6 사용
* k8s 1.26으로 upgrade 전에 Amazon VPC CNI 1.12 이상으로 upgrade 필요

<br>

### 1.27
* seccmp의 `seccomp.security.alpha.kubernetes.io/pod`, `container.seccomp.security.alpha.kubernetes.io` annotation 지원 제거
  * `kubectl get pods --all-namespaces -o json | grep -E 'seccomp.security.alpha.kubernetes.io/pod|container.seccomp.security.alpha.kubernetes.io'`로 확인
  * `securityContext.seccompProfile`를 사용해 seccomp profile 설정
* kubelet에서 `--container-runtime` argument 제거
  * EKS 1.24에서 container runtime으로 containerd만 지원하므로 불필요한 argument로 node bootstrap의 `--kubelet-extra-args`에서 `--container-runtime`을 제거 필요
* kubelet의 `kubeAPIQPS` 50, `kubeAPIBurst` 100으로 증가
  * kubelet은 더 많은 API query를 처리하여 응답 시간, 성능이 개선되어 Pod 실행이 더 빨라지고 cluster 작업에 더 효과적으로 변경
* [fine grained Pod topology](https://kubernetes.io/blog/2023/04/17/fine-grained-pod-topology-spread-features-beta)를 사용 가능
  * `minDomain` - Pod가 분산되어야하는 최소 도메인 수 지정
  * `nodeAffinityPolicy`, `nodeTaintPolicy` - node affinity, node taint, topologySpreadConstraints의 matchLabelsKeys를 따른다
* [StatefulSetAutoDeletePVC](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention)
  * StatefulSet의 persistentVolumeClaimRetentionPolicy로 StatefulSet이 제거되거나 scale in될 때 PVC(PersistentVolumeClaims)를 자동으로 제거할지 유지할지 지정 가능
```yaml
apiVersion: apps/v1
kind: StatefulSet
...
spec:
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain  # default
    whenScaled: Delete
...
```


<br>

## PSP(PodSecurityPolicy) -> [PSS(Kubernetes Pod Security Standards)](https://kubernetes.io/docs/concepts/security/pod-security-standards) or policy-as-code solution으로 migration
* 1.25 upgrade 전 workload 보호를 위해 필요

<br>

### PSP 사용 확인
* PSP 확인
```sh
$ kubectl get pods
```
* PSP에 영향 받는 Pod 확인
```sh
$ kubectl get pod -A -o jsonpath='{range.items[?(@.metadata.annotations.kubernetes\.io/psp)]}{.metadata.name}{"\t"}{.metadata.namespace}{"\t"}{.metadata.annotations.kubernetes\.io/psp}{"\n"}'
```

<br>

### migration PSS
* PSS와 [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission) 사용
* [Pod Security Standards (PSS) and Pod Security Admission (PSA)](https://aws.github.io/aws-eks-best-practices/security/docs/pods/#pod-security-standards-pss-and-pod-security-admission-psa)
* [Implementing Pod Security Standards in Amazon EKS](https://aws.amazon.com/ko/blogs/containers/implementing-pod-security-standards-in-amazon-eks)
* [Migrate from PodSecurityPolicy to the Built-In PodSecurity Admission Controller](https://kubernetes.io/docs/tasks/configure-pod-container/migrate-from-psp)
* [Mapping PodSecurityPolicies to Pod Security Standards](https://kubernetes.io/docs/reference/access-authn-authz/psp-to-pod-security-standards)

### migration PAC(Policy-as-code) solution
* [Policy-as-code (PAC)](https://aws.github.io/aws-eks-best-practices/security/docs/pods/#policy-as-code-pac)
* cluster 사용자에 대한 가드레일 제공
* Admission controller를 사용해 webhook으로 지정된 정책 기반으로 request payload를 변경하고 검증하여 k8s api call을 차단


<br><br>

> #### Reference
> * [Updating a cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
> * [Amazon EKS Kubernetes versions - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html)
> * [Amazon EKS platform versions](https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html)
> * [k8s 1.25 changelog](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.25.md#changelog-since-v1240)
> * [k8s 1.26 changelog](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.26.md)
> * [k8s 1.27 changelog](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.27.md)
> * [Pod security policy (PSP) removal FAQ](https://docs.aws.amazon.com/eks/latest/userguide/pod-security-policy-removal-faq.html)
