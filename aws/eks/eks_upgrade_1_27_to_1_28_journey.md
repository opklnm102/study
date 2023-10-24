# [AWS] Amazon EKS Upgrade 1.27 to 1.28 Journey
> date - 2023.10.24  
> keyworkd - aws, eks, kubernetes  
> upgrade 방법은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고하고, 여기서는 1.27 -> 1.28의 변경 사항을 다룬다  

<br>

## Kubernetes 1.28 주요 변경 사항
* [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide)의 검증은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고

<br>

### 1.28(Planternetes)
* recovery non-graceful node shutdown GA
  * 비정상 노드 종료를 복구
  * node가 갑자기 종료되거나 복구할 수 없는 상태로 끝나는 경우(HW failure or system hang) stateful workload를 다른 node로 옮겨 복구
* CRD(CustomResourceDefinition) validation 실패시 사용자가 사용할 수 있는 `reason`, `filePath` optional field 추가
* control plane와 data plane 간에 지원되는 버전 skew `n - 2` -> `n - 3`로 변경
  * [Version Skew Policy](https://kubernetes.io/releases/version-skew-policy) 참고
  * control plane
    * kube-apiserver
    * kube-scheduler
    * kube-controller-manager
    * cloud-controller-manager
  * data plane
    * kubelet
    * kube-proxy
* PersistentVolume Controller 수정
  * storageClassName이 설정되지 않은 unbound PersistentVolumeClaim에 default StorageClass를 자동으로 할당
  * PersistentVolumeClaim admission validation mechanism이 설정되지 않은 상태에서 실제 StorageClass name으로 변경할 수 있도록 수정
* 강제 Pod 제거를 설명하기 위해 Pod GC Controller의 `force_delete_pods_total`, `force_delete_pod_errors_total` metrics에 이유가 추가
  * terminated
  * orphaned
  * terminating with the out-of-service taint
  * terminating and unscheduled
* EKS optimized accelerated Linux AMI는 `NVIDIA 525` 이상 지원
  * p2는 사용 불가능하며 p3 이후로 upgrade
  * `NVIDIA 525`와 동작하도록 application upgrade
* [KEP-3545: Improved multi-numa alignment in Topology Manager](https://github.com/kubernetes/enhancements/issues/3545) beta
  * TopologyManagerPolicyBetaOptions - fine-tuning pod placement를 위해 `node topology` `resource availability` 같은 옵션 제공
  * TopologyManagerPolicyOptions - unique cluster topology에 따라 pod placement를 조정할 수 있는 extra layer 제공
  * 자세한 내용은 [Control Topology Management Policies on a node](https://kubernetes.io/docs/tasks/administer-cluster/topology-manager) 참고

<br><br>

> #### Reference
> * [Updating a cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
> * [Amazon EKS Kubernetes versions - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html)
> * [Amazon EKS platform versions](https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html)
> * [k8s 1.28 changelog](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.28.md)
> * [Amazon EKS now supports Kubernetes version 1.28](https://aws.amazon.com/ko/blogs/containers/amazon-eks-now-supports-kubernetes-version-1-28)

<br>

> #### Further reading
> * [What's new for security in Kubernetes 1.28](https://securitylabs.datadoghq.com/articles/whats-new-for-security-in-kubernetes-128/#authorization-api-for-querying-self-user-attributes)
