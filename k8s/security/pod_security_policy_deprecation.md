# [k8s] PodSecurityPolicy Deprecation
> date - 2022.06.26  
> keyworkd - kubernetes, k8s, security, psp  
> PodSecurityPolicy Deprecation에 대해 정리

<br>

## What is PodSecurityPolicy?
* Pod spec의 security-sensitive 측면을 제어할 수 있는 built-in [admission controller](https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/)
  * PSP 생성 -> RBAC에 PSP 부여 -> PSP를 충족하는 Pod만 실행
  * privileged container가 실행되는 것을 방지할 수 있다
* Pod의 보안 설정을 지정하는 [PodSecurityContext](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#security-context)와 다르다
  * Pod의 보안 설정을 kubelet, container runtime에 지시하여 설정하는 역할
* PSP는 `PodSecurityContext`에 설정할 수 있는 값을 제한


<br>

## 왜 deprecated되는가?
* 많은 사람들이 PSP가 Pod에 적용되는 방식에 혼란을 겪었다
* 의도한 것보다 더 권한을 실수로 부여하기 쉽고, 어떤 PSP가 적용되는지 확인하기 어렵다
* `dry run`, audit mode가 없이 PSP를 활성화하기 어렵다

<br>

### PSP loadmap
* v1.21 - deprecated
* v1.25 - removed


<br>

## Migration
* [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/)
  * Migrate from PodSecurityPolicy to the Built-In PodSecurity Admission Controller
* 3rd party admission plugin
  * [kyverno - Kubernetes Native Policy Management](https://github.com/kyverno/kyverno)
  * [OPA/Gatekeeper - Policy Controller for Kubernetes](https://github.com/open-policy-agent/gatekeeper)
    * [Using Gatekeeper as a drop-in Pod Security Policy replacement in Amazon EKS](https://aws.amazon.com/ko/blogs/containers/using-gatekeeper-as-a-drop-in-pod-security-policy-replacement-in-amazon-eks/)


<br>

## Conclusion
PSP를 처음 사용할 때 동작 방식을 이해하고, best practice를 찾아 privileged, permissive, restricted를 정의하는데 고생했던 기억이 나는데 감회가 새롭다  
더 나은 experience을 제공할 수 있는 다양한 시도를 해보는 것이 중요하다는 것을 다시 생각하게 되는 계기가 되었다


<br><br>

> #### Reference
> * [Using Gatekeeper as a drop-in Pod Security Policy replacement in Amazon EKS](https://aws.amazon.com/ko/blogs/containers/using-gatekeeper-as-a-drop-in-pod-security-policy-replacement-in-amazon-eks/)
> * [Pod Security Policies](https://kubernetes.io/docs/concepts/security/pod-security-policy/)
> * [PodSecurityPolicy Deprecation: Past, Present, and Future](https://kubernetes.io/blog/2021/04/06/podsecuritypolicy-deprecation-past-present-and-future/)
