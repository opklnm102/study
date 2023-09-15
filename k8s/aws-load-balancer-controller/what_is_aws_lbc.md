# [k8s] What is AWS LBC(Load Balancer Controller)?
> date - 2023.09.14  
> keyworkd - kubernetes, k8s, aws alb, ingress  
> AWS LBC에 대해 정리  

<br>

## AWS LBC(Load Balancer Controller)란?
* Kubernetes cluster의 Service, Ingress로 [AWS ELB](https://aws.amazon.com/elasticloadbalancing)를 관리하는 controller
* [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress)로 [ALB(Application Load Balancer)](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) provisiong
* LoadBalancer type [Service](https://kubernetes.io/docs/concepts/services-networking/service)로 [NLB(Network Load Balancer)](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) provisiong
* ELB에 수동으로 변경한 사항은 원복될 수 있으니 Ingress, Service, annotation, controller command line flags, IngressClassParams로 설정 권장
* Ingress, Service 생성/수정/제거될 때 AWS 리소스도 함께 생성/수정/제거된다

<br>

## How AWS Load Balancer controller works
<div align="center">
  <img src="./images/aws_lbc_design.png" alt="aws_lbc_design" width="70%" height="70%"/>
</div>

1. controller는 API server에서 Ingress event watch하며 Ingress를 찾으면 AWS 리소스 생성 시작
2. Ingress에 대해 ALB(ELBv2)가 AWS에 생성
3. Ingress에 설정된 Service가 target group으로 생성
4. `alb.ingress.kubernetes.io/listen-ports`에 설정된 port에 대해 listener 생성
5. Ingress에 설정된 path에 대해 rule을 생성하여 특정 path에 대한 traffic이 Service로 라우팅된다

<br>

### Lifecycle
* create
```sh
target group -> load balancer -> listener -> listener rule ->  target group binding(register target group)
```

* delete
```sh
target group binding(deregister target group) -> target group -> load balancer
```

#### Ingress Group(alb.ingress.kubernetes.io/group.name)으로 ALB 공유시
* create
```sh
target group -> listener rule -> target group binding(register target group)
```

* delete 
```sh
target group binding(deregister target group) -> target group -> listener rule
```

<br>

### Ingress Traffic
* `alb.ingress.kubernetes.io/target-type`으로 설정 가능한 2가지 traffic mode 지원
  * instance(default)
  * ip - [Amazon VPC CNI](https://github.com/aws/amazon-vpc-cni-k8s) 필요

#### Instance
* traffic flow
```
Client -> ALB -> Node -> iptables(kube-proxy) -> (다른 Node로 라우팅될 수 있음) -> Pod
```
* target group에 cluster에 있는 node의 ip, node port가 등록되고, alb는 **node port로 traffic을 전달**
* node port로 유입된 traffic이 kube-proxy에 의해 설정된 iptables rule에 따라 Pod까지 전달
  * iptables rule의 복잡도로 인한 성능 이슈 발생 가능성이 있고 target-type ip mode or kube-proxy IPVS mode or eBPF 기반 CNI(e.g. Cilium)로 해결 가능
* ELB access log 확인시 node port로 접근하기 때문에 어느 pod로 통신되었는지 찾기 어려움
* network hop은 늘어나지만 kube-proxy가 routing rule을 설정하여 draining시 문제가 없는 pod로 라우팅
* `alb.ingress.kubernetes.io/target-type: instance(default)` + NodePort의 `ExternalTrafficPolicy: cluster(default)`로 설정되면 **ALB health check traffic 증폭 issue** 발생
  * cluster의 모든 node가 target group에 등록되는게 원인으로 100개의 node가 있고 Pod가 3개인 경우라면 ALB는 각 node에 health check를 보내기 때문에 33배 더 발생하며 auto scaling되어 200개의 node가 되고 3개의 Pod가 health check traffic을 받아내질 못하면 Pod는 down
  * Pod에 HPA가 걸려 있어도 신규 Pod가 초기화를 끝내기 전에 기존의 Pod가 down되면 전체 서비스가 down되는 효과가 발생
  * `alb.ingress.kubernetes.io/target-type: ip`를 사용하거나 `alb.ingress.kubernetes.io/target-node-labels: key=value`를 사용해 특정 label이 있는 node만 target group에 등록해 모든 node가 등록되는 것을 방지할 수 있다

<br>

#### IP
* traffic flow
```
Client -> ALB -> Pod
```
* target group에 Pod의 ip, port 등록되어, ALB에서 **Pod에 할당된 ENI를 통해 Pod에 직접 traffic 전달**
* ELB access log 확인시 instance mode보다 직관적
* target draining 시 5xx error 발생 가능성이 있어 아래의 방법으로 회피 필요
  * target group 기반의 weighted load balancing
  * [Pod readiness gate](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.6/deploy/pod_readiness_gate) 설정
    * rolling upgrade시 target group에 등록될 때 healthy가 되는 것을 감지하여 기존 Pod의 terminated 방지
  * Pod lifecycle preStop hook으로 gracefully terminated 설정
    * inflight connection에 대해 request를 처리할 충분한 시간을 제공하고, target deregistration 동안 Pod의 terminated 방지

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
...
  template:
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        ...
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 10"]
```


<br>

## Install

### Subnet tagging
| Key | Value | Description |
|:--|:--|
| kubernetes.io/cluster/<cluster name> | shared or owned | 여러 cluster가 있을 경우 사용하는게 좋다 |
| kubernetes.io/role/internal-elb | 1 | private subnet에 지정, subnet을 명시하지 않았을 경우를 대비 |
| kubernetes.io/role/elb | 1 | public subnet에 지정, subnet을 명시하지 않았을 경우를 대비 |

<br>

### IAM Policy

#### Role Permissions
* AWS LBC는 AWS API를 사용하므로 권한 필요
* AWS LBC의 환경변수에 AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY가 설정되거나 EC2에 role이 설정되어 있어야한다
* EKS라면 IRSA 사용을 권장

#### Setup
* IAM OIDC provider 생성
```sh
$ eksctl utils associate-iam-oidc-provider \
    --region <aws region> \
    --cluster <cluster name> \
    --approve
```
* OIDC 확인
```sh
$ aws eks describe-cluster --name <cluster name> --query "cluster.identity.oidc.issuer" --output text
$ aws iam list-open-id-connect-providers
```

* IAM Policy 생성
```sh
$ curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

$ aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json
```

* IAM Role, ServiceAccount 생성
```sh
$ eksctl create iamserviceaccount \
    --cluster=<cluster name> \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::<account id>:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve
```

<br>

### Helm
* TargetGroupBinding CRDs 설치
```sh
$ kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"
```

* AWS LBC 설치
```sh
$ helm repo add eks https://aws.github.io/eks-charts

$ helm upgrade -i aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=<cluster name> \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller
```

* Pod 확인
```sh
$ kubectl get pods -n kube-system | egrep -o 'aws-load-balancer[a-zA-Z0-9-]+'

aws-load-balancer-controller-865dbbd965-767nf
```

* log 확인
```sh
$ kubectl logs -f --tail=500 -n kube-system $(kubectl get pods -n kube-system | egrep -o 'aws-load-balancer[a-zA-Z0-9-]+')
```


<br>

## Usage
### ALB
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: 2048-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: instance  # or ip
    alb.ingress.kubernetes.io/group.name: 2048-game
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-xxxxxxxxxx:xxxxxxxxxx:certificate/xxxxxxxxxx  # ACM ARN
    alb.ingress.kubernetes.io/security-groups: # ALB에서 사용할 SG, 설정시 EKS가 사용하는 SG에 rule이 추가되지 않는다
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80,"HTTPS": 443}]'
    alb.ingress.kubernetes.io/actions.ssl-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301"}}
    alb.ingress.kubernetes.io/scheme: internal
    alb.ingress.kubernetes.io/subnets: subnet-xxxxxxxxxx,subnet-xxxxxxxxxx
    alb.ingress.kubernetes.io/tags: |-
      team=game,
      service=2048-game,
      environment=dev
    alb.ingress.kubernetes.io/load-balancer-attributes: |-
      idle_timeout.timeout_seconds=60,
      access_logs.s3.enabled=true,
      access_logs.s3.bucket=lb-access-logs
    alb.ingress.kubernetes.io/target-node-labels: team=game
    # 특정 label이 있는 node만 target group에 등록
spec:
  ingressClassName: alb
  rules:
    - host: 2048-game.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ssl-redirect
                port:
                  name: use-annotation
          - path: /
            pathType: Prefix
            backend:
              service:
                name: 2048-game
                port:
                  number: 80
```

### NLB
* LoadBalancer type Service에 spec.loadBalancerClas를 설정하면 AWS LBC를 기본 controller로 사용
* AWS LBC는 LoadBalancer type Service 생성시 spec.loadBalancerClass를 설정하는 mutating webhook 제공
* `enableServiceMutatorWebhook=false`로 설정해야 cloud controller manger(in-tree controller)를 기본으로 사용하며 CLB를 provisioning할 수 있다
```yaml
apiVersion: v1
kind: Service
metadata:
  name: 2048
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
    service.beta.kubernetes.io/aws-load-balancer-scheme: internal
    service.beta.kubernetes.io/aws-load-balancer-security-groups: # NLB에서 사용할 SG, 설정시 EKS가 사용하는 SG에 rule이 추가되지 않는다
    service.beta.kubernetes.io/aws-load-balancer-additional-resource-tags: |-
      team=game,
      service=2048-game,
      environment=dev
    service.beta.kubernetes.io/aws-load-balancer-attributes: |-
      access_logs.s3.enabled=false,
      load_balancing.cross_zone.enabled=true
spec:
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
  ports:
    - port: 8080
      name: http
      protocol: TCP
    - port: 8081
      name: transport
      protocol: TCP
  selector:
    app: 2048-game
```

<br>

## 불필요한 security group 생성 방지
* `alb.ingress.kubernetes.io/inbound-cidrs` 사용
  * ingress별로 security group을 사용
  * ELB 마다 security group이 생성되고, EC2의 security group에 chain으로 설정된다
  * 무분별하게 생성되면 limit에 걸릴 수 있다
* `alb.ingress.kubernetes.io/security-groups` 사용
  * 기존에 생성된 security group을 사용
  * 적절한 관리를 통해 limit를 방지할 수 있다

<br>

## `alb.ingress/kubernetes.io/actions.${action-name}`
* redirection 같은 listener에서 custom action을 구성하는 방법 제공하며 다음과 같은 형태로 사용
```yaml
spec:
  rules:
  ...
    backend:
      serviceName: ${action-name}
      servicePort: use-annotation
```

| action | description |
|:--|:--|
| response-503 | return finxed 503 response |
| redirect-to-eks | redirect to an external url |
| forward-single-tg | forward to an single target group simplified schema |
| forward-multiple-tg | forward to multiple target group with different weights and stickiness config |

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/actions.response-503: >
      {"type":fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"503","messageBody":"503 error text"}}
    alb.ingress.kubernetes.io/actions.redirect-to-eks: >
      {"type":"redirect","redirectConfig":{"host":"aws.amazon.com","path":"/eks/","port":"443","protocol":"HTTPS","query":"k=v","statusCode":"HTTP_302"}}
    alb.ingress.kubernetes.io/actions.forward-single-tg: >
      {"type":"forward","targetGroupARN":"arn-of-your-target-group"}
    alb.ingress.kubernetes.io/actions.forward-multiple-tg: >
      {"type":"forward","forwardConfig":{"targetGroups":[{"serviceName":"service-1","servicePort":"http","weight":20},{"serviceName":"service-2","servicePort":80,"weight":20},{"targetGroupARN":"arn-of-your-non-k8s-target-group","weight":60}],"targetGroupStickinessConfig":{"enabled":true,"durationSeconds":200}}}
spec:
  rules:
    - http:
        paths:
          - path: /503
            backend:
              serviceName: response-503
              servicePort: use-annotation
          - path: /eks
            backend:
              serviceName: redirect-to-eks
              servicePort: use-annotation
          - path: /path1
            backend:
              serviceName: forward-single-tg
              servicePort: use-annotation
          - path: /path2
            backend:
              serviceName: forward-multiple-tg
              servicePort: use-annotation
```

<br>

## `alb.ingress.kubernetes.io/conditions.${conditions-name}`
* ingress spec에서 host/path 외에 condition을 지정
* `${conditions-name}` - ingress rule의 serviceName과 일치해야 하고, servicePort는 use-annotation

### General ALB limitations
* 각 rule은 선택적으로 host-header, http-request-method, path-pattern, source-ip의 각 조건 중 하나를 포함
  * 각 rule은 http-header, query-string 조건 중 하나 이상을 선택적으로 포함
* conditions 당 최대 3개의 match evaluations 지정
* rule당 최대 5개의 match evaluations 지정
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    # rule-path1
    #   Host is www.example.com or anno.example.com
    #   Path is /path1
    alb.ingress.kubernetes.io/actions.rule-path1: >
      {"type": "fixed-response", "fixedResponseConfig": {"contentType": "text/plain", "statusCode": "200", "messageBody": "Host is "}}
    alb.ingress.kubernetes.io/conditions.rule-path1: >
      [{"field":"host-header","hostHeaderConfig":{"values":["anno.example.com"]}}]
    # rule-path2
    #  Host is www.example.com
    #  Path is /path2 or /anno/path2
    alb.ingress.kubernetes.io/actions.rule-path2 : >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","messageBody":"Path is /path2 or /anno/path2"}}
    alb.ingress.kubernetes.io/conditions.rule-path2 : >
      [{"field":"path-pattern","pathPatternConfig":{"values":["/anno/path2"]}}]
    # rule-path3
    #  Host is www.example.com
    #  Path is /path3
    #  Http header HeaderName is HeaderValue1 or HeaderValue2
    alb.ingress.kubernetes.io/actions.rule-path3: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","messageBody":"Http header HeaderName is HeaderValue1 or HeaderValue2"}}
    alb.ingress.kubernetes.io/conditions.rule-path3: >
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName":"HeaderName","values":["HeaderValue1", "HeaderValue2"]}}]
    # rule-path4
    #  Host is www.example.com
    #  Path is /path4
    #  Http request method is GET or HEAD
    alb.ingress.kubernetes.io/actions.rule-path4: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","messageBody":"Http request method is GET or HEAD"}}
    alb.ingress.kubernetes.io/conditions.rule-path4: >
      [{"field":"http-request-method","httpRequestMethodConfig":{"Values":["GET", "HEAD"]}}]
    # rule-path5
    #  Host is www.example.com
    #  Path is /path5
    #  Query string is paramA:valueA1 or paramA:valueA2
    alb.ingress.kubernetes.io/actions.rule-path5: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","messageBody":"Query string is paramA:valueA1 or paramA:valueA2"}}
    alb.ingress.kubernetes.io/conditions.rule-path5: >
      [{"field":"query-string","queryStringConfig":{"values":[{"key":"paramA","value":"valueA1"},{"key":"paramA","value":"valueA2"}]}}]
    # rule-path6
    #  Host is www.example.com
    #  Path is /path6
    #  Source IP is 192.168.0.0./16 or 172.16.0.0/16
    alb.ingress.kubernetes.io/actions.rule-path6: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","messageBody":"Source IP is 192.168.0.0/16 or 172.16.0.0/16"}}
    alb.ingress.kubernetes.io/conditions.rule-path6: >
      [{"field":"source-ip","sourceIpConfig":{"values":["192.168.0.0/16","172.16.0.0/16"]}}]
    # rule-path7
    #  Host is www.example.com
    #  Path is /path7
    #  Http header HeaderName is HeaderValue
    #  Query string is paramA:valueA
    #  Query string is paramB:valueB
    alb.ingress.kubernetes.io/actions.rule-path7: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"200","message"Body":"multiple conditions applies"}}
    alb.ingress.kubernetes.io/conditions.rule-path7: >
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName":"HeaderName","values":["HeaderValue"]}},{"field":"query-string","queryStringConfig":{"values":[{"key":"paramA","value":"valueA"}]}},{"field":"query-string","queryStringConfig":{"values":[{"key":"paramB","value":"valueB"}]}}]
spec:
  rules:
    - host: www.example.com
      http:
        paths:
          - path: /path1
            backend:
              serviceName: rule-path1
              servicePort: use-annotation
          - path: /path2
            backend:
              serviceName: rule-path2
              servicePort: use-annotation
          - path: /path3
            backend:
              serviceName: rule-path3
              servicePort: use-annotation
          - path: /path4
            backend:
              serviceName: rule-path4
              servicePort: use-annotation
          - path: /path5
            backend:
              serviceName: rule-path5
              servicePort: use-annotation
          - path: /path6
            backend:
              serviceName: rule-path6
              servicePort: use-annotation
          - path: /path7
            backend:
              serviceName: rule-path7
              servicePort: use-annotation
```


<br><br>

> #### Reference
> * [AWS Load Balancer Controller Docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller)
> * [AWS Load Balancer Controller Helm Chart](https://github.com/aws/eks-charts/tree/master/stable/aws-load-balancer-controller)
