# [k8s] Separating ALB and Kubernetes cluster lifecycle with TargetGroupBinding
> date - 2023.05.19  
> keyworkd - kubernetes, k8s, aws alb, ingress  
> TargetGroupBinding을 사용해 ALB와 k8s cluster의 lifecycle을 분리하는 내용에 대해 정리  

<br>

## TL;DR
* [AWS Load Balancer Controller TargetGroupBinding](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.5/guide/targetgroupbinding/targetgroupbinding)을 사용하면 [AWS ALB(Application Load Balancer)](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)와 [k8s ingress](https://kubernetes.io/docs/concepts/services-networking/ingress)의 lifecycle을 분리할 수 있다


<br>

## Requirements
* [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller)를 사용시 ingress를 생성하면 ALB가 생성되고, ingress가 제거하면 ALB가 제거되는 k8s cluster와 ALB의 lifecycle이 결합된다
* blue/green deployment 같이 서로 다른 cluster의 ingress가 동일한 ALB를 참조하고 있다면 의도치 않게 ALB가 제거될 수 있고, 복구시 ALB provisioning에 걸리는 시간만큼 downtime이 발생하기 때문에 분리할 수 있는 방법 필요


<br>

## TargetGroupBinding
* Ingress, LoadBalancer Service 생성시 flow
```
Ingress or LoadBalancer Service 생성 -> ALB or NLB 생성 -> TargetGroup 생성 -> TargetGroupBinding 생성
```
* AWS Load Balancer Controller는 TargetGroupBinding을 사용해 k8s Service를 지원

* TargetGroupBinding 조회
```sh
$ kubectl get targetgroupbindings
```
* [Terraform](https://www.terraform.io) 등을 이용해 IaC로 ALB를 관리하고 AWS Load Balancer Controller의 TargetGroupBinding을 통해 사용하면 ALB와 ingress의 lifecycle을 분리할 수 있다

<br>

### 장점
* 기존에 생성된 ALB를 Kubernetes cluster에서 사용할 수 있고, Kubernetes cluster 외부에서 관리 가능
* **Kubernetes cluster lifecycle과 서비스에 중요한 ALB endpoint lifecycle의 의존성을 분리**하여 kubernetes cluster를 새로 생성하거나 2번째 cluster를 추가하는 등의 작업에 ALB의 변화가 없어서 blue/green deployments에 유용
* ALB 관리와 Kubernetes cluster 관리 role 분리 가능
* AWS Load Balancer Controller + TargetGroupBinding만 사용하여 AWS Load Balancer Controller + Ingress를 사용하는 것보다 비용 절감 효과가 있다

<br>

### 제약 사항
* ALB에 등록될 수 있는 TargetGroup의 개수 등 ALB의 hard limit 주의 필요
* 기존에 Ingress로 생성한 ALB가 있다면?
  * ingress를 제거하면 ALB가 제거되기 때문에 migration 필요
  * 신규 ALB를 생성하고, Route53 weighted routing을 이용해 점진적으로 traffic shifting 진행
* 기존의 ALB를 살리려면?
  * aws-load-balancer-controller의 권한에서 ALB 제거 권한을 제거
  * TargetGroupBinding을 사용하기 때문에 aws-load-balancer-controller 제거 불가
  * 신규 생성한 ALB로 migration하는게 깔끔한 결과를 얻을 수 있다


<br>

## Usage
* AWS API, Terraform 등으로 생성한 ALB + target group과 k8s Service를 기반으로 `TargetGroupBinding`을 생성하면 target group에 target이 등록된다
  * ALB 생성 -> Target Group 생성 -> ALB에 Listener 생성 -> Listener rule 생성시 target group으로 traffic 전달 설정
  * k8s Deployment, Service, TargetGroupBinding을 생성하면 `TargetGroupBinding`을 기반으로 Pod를 TargetGroup에 등록해준다

```yaml
kind: Service
name: my-service
spec:
  ports:
  - name: http
    port: 80
  - name: https
    port: 443
---
apiVersion: elbv2.k8s.aws/v1beta1
kind: TargetGroupBinding
metadata:
  name: my-tgb
spec:
  serviceRef:
    name: my-service # route traffic to the my-service
    port: http
  targetGroupARN: <arn-to-targetGroup>  # 미리 생성된 tg의 arn을 넣으면
  # targetType: ip or instance  # 없으면 자동으로 인식
  # networking:
    # ingress:
    # - from:
    #   - securityGroup:
    #       groupID: sg-xxxxxxxxxx
    #   ports:
    #   - protocol: TCP
```

<br>

## Conclusion
* TargetGroupBinding을 사용하면 별도의 cluster에서 blue/green deployment 사용시 유용하므로 고려해볼만한 옵션이 될 수 있다

<br><br>

> #### Reference
> * [TargetGroupBinding - AWS Load Balancer Controller Docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.5/guide/targetgroupbinding/targetgroupbinding/)
> * [TargetGroupBinding - EKS Immersion Workshop](https://catalog.workshops.aws/eks-immersionday/en-US/services-and-ingress/targetgroupbinding)
> * [Quotas for your Application Load Balancers](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-limits.html)
> * [A deeper look at Ingress Sharing and Target Group Binding in AWS Load Balancer Controller](https://aws.amazon.com/ko/blogs/containers/a-deeper-look-at-ingress-sharing-and-target-group-binding-in-aws-load-balancer-controller/)
