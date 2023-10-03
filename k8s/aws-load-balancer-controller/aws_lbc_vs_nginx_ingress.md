# [k8s] AWS LBC vs Nginx Ingress Controller
> date - 2023.10.03  
> keyworkd - kubernetes, k8s, ingress, nginx, aws lbc  
> AWS LBC와 Nginx Ingress Controller를 비교  

<br>

## Nginx Ingress vs AWS LBC
| | Nginx Ingress | AWS LBC | 
|:--|:--|:--|
| Pros | Nginx access log 수집 가능<br>인증서 교체 편리 | 다수의 ALB를 사용할 수 있어서 장애 발생시 서비스별로 격리 가능 |
| Cons | 하나의 NLB로 traffic을 처리하므로 NLB가 SPOF | ELB에서 제공하는 access log만 수집 가능<br>다수의 ALB 사용하여 인증서 변경 필요시 어려움이 있다 |


<br>

## Traffic flow

### AWS LBC 사용시 traffic flow

#### ALB
```
ALB(Ingress) -> Service -> Pod
```
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: 2048-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: instance  # or ip
    ...
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
                name: 2048-game
                port:
                  number: 80
```

#### NLB
```
NLB(Service) -> Pod
```
```yaml
apiVersion: v1
kind: Service
metadata:
  name: 2048
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
    ...
spec:
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
  ports:
    - port: 8080
      name: http
      protocol: TCP
  selector:
    app: 2048-game
```

<br>

### Nginx Ingress Controller 사용시 traffic flow
```
NLB -> Ingress Nginx(Ingress) -> Service -> Pod
```
* NLB는 AWS LBC로 구성하거나 Nginx Ingress Controller 등 여러 방법으로 구성할 수 있다
  * NLB의 최신 기능을 사용하려면 AWS LBC로 NLB 구성해야한다

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  labels:
  ...
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
    ...
spec:
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
  ports:
    - port: 80
      name: http
      protocol: TCP
      targetPort: http
    - port: 443
      name: https
      protocol: TCP
      targetPort: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: 2048-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: instance  # or ip
    ...
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - 2048-game.example.com
      secretName: example-tls
  rules:
    - host: 2048-game.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: 2048-game
                port:
                  number: 80
```

<br><br>

> #### Reference
> * [AWS Load Balancer Controller Docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller)
> * [Ingress-Nginx Controller Docs](https://kubernetes.github.io/ingress-nginx)
