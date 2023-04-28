# [k8s] ALB settings overwrite when creating a new cluster issue
> date - 2023.04.28  
> keyworkd - kubernetes, k8s, aws alb, ingress  
> 신규 cluster 생성시 ALB 설정이 overwrite되었던 이슈 정리

<br>

## Requirement

### Dependency
* [Amazon EKS](https://aws.amazon.com/eks) 1.24
* [kubernetes-sigs/aws-load-balancer-controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller)


<br>

## Issue
* 신규 EKS cluster에 생성한 Ingress가 기존 cluster에서 생성한 ALB를 공유하게 되어 new cluster의 Ingress 설정으로 ALB가 overwrite 발생했고, new cluster Ingress 제거시 ALB도 제거된다
```sh
## new cluster
default test-ingress  alb  new-test.example.com  test-1307917301.ap-northeast-2.elb.amazonaws.com  80  36m

## old cluster
default test-ingress  alb  old-test.example.com  test-1307917301.ap-northeast-2.elb.amazonaws.com  80  2y40d
```

<br>

### Why?
* aws-load-balancer-controller의 cluster.name을 수정하지 않아서 발생한 현상
* aws-load-balancer-controller는 Ingress 설정을 기반으로 규칙을 생성하여 ALB에 tagging하고 tag를 기반으로 관리하기 때문
* Tag

| Key | Value |
|:--|:--|
| elbv2.k8s.aws/cluster | old-cluster |
| ingress.k8s.aws/resource | LoadBalancer |
| ingress.k8s.aws/stack | default/test-ingress |


<br>

## Resolve
* Ingress마다 별도의 ALB를 사용하도록 하거나 같은 ALB를 사용하더라도 Listener rule을 overwrite되지 않도록 해야한다
* cluster.name을 수정
  * `elbv2.k8s.aws/cluster` tag가 달라지므로 ALB가 생성된다

| Key | Value |
|:--|:--|
| elbv2.k8s.aws/cluster | new-cluster |
| ingress.k8s.aws/resource | LoadBalancer |
| ingress.k8s.aws/stack | default/test-ingress |
* `alb.ingress.kubernetes.io/group.name`을 사용
  * `ingress.k8s.aws/stack` tag가 달라지므로 ALB가 생성된다

| Key | Value |
|:--|:--|
| elbv2.k8s.aws/cluster | old-cluster |
| ingress.k8s.aws/resource | LoadBalancer |
| ingress.k8s.aws/stack | test-old-cluster |


<br>

## Conclusion
* AWS 리소스를 조작하는 addon들은 AWS 리소스의 tag를 기반으로 동작하므로 설정에 주의가 필요하다


<br><br>

> #### Reference
> * [IngressGroup - AWS Load Balancer Controller Docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.5/guide/ingress/annotations/#ingressgroup)
