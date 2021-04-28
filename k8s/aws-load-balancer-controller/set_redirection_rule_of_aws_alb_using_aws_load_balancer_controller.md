# [k8s] Set redirection rule of AWS ALB using aws-load-balancer-controller
> date - 2021.04.27  
> keyworkd - kubernetes, k8s, aws alb, ingress  
> aws-load-balancer-controller를 이용하여 AWS ALB에 redirect rule을 설정하는 법을 정리

<br>

## Requirement

### Dependency
* [kubernetes-sigs/aws-load-balancer-controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/tag/v1.1.8)


<br>

## Issue
* aws-load-balancer-controller를 이용해 AWS ALB(Application Load Balancer)를 사용 중이고, ALB의 backend에 의존하지 않고 ALB의 `Listener rule`을 이용해 redirection이 필요
* 별도의 backend 운영으로 인한 리소스 낭비를 줄이고자 함


<br>

## Resolve
* 2가지 방법으로 가능하다

### `alb.ingress.kubernetes.io/actions` 사용
```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: test-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:<region>:xxxxxxxxxxx:certificate/xxxxxxxxxxx-xxxxx-xxxxxx
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80,"HTTPS": 443}]'
    alb.ingress.kubernetes.io/actions.ssl-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301"}}
    alb.ingress.kubernetes.io/actions.google-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301", "host": "www.google.com", "path": "/#{path}", "query": "#{query}"}}
spec:
  rules:
    - host: test.opklnm102.me
      http:
        paths:
          - path: /*
            backend:
              serviceName: ssl-redirect
              servicePort: use-annotation
          - path: /*
            backend:
              serviceName: google-redirect
              servicePort: use-annotation
```

<br>

### `alb.ingress.kubernetes.io/actions`, `alb.ingress.kubernetes.io/conditions` 사용
```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: test-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:<region>:xxxxxxxxxxx:certificate/xxxxxxxxxxx-xxxxx-xxxxxx
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80,"HTTPS": 443}]'
    alb.ingress.kubernetes.io/actions.ssl-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301"}}
    alb.ingress.kubernetes.io/actions.google-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301", "host": "www.google.com", "path": "/#{path}", "query": "#{query}"}}
    alb.ingress.kubernetes.io/conditions.google-redirect: >
      [{"field": "host-header", "hostHeaderConfig": {"values": ["test.opklnm102.me"]}}]
spec:
  rules:
    - http:
        paths:
          - path: /*
            backend:
              serviceName: google-redirect
              servicePort: use-annotation
```

<br>

### Listener rule 동작 확인
```sh
$ curl -I -H "Host:test.opklnm102.me" xxxxxxxxxxx-xxxxxxxx.<region>.elb.amazonaws.com/test  # ALB DNS name
HTTP/1.1 301 Moved Permanently
...
Location: https://www.google.com:443/test
```


<br>

## Conclusion
* AWS ALB의 `Listener rule`을 이용하면 별도의 backend 없이도 적절한 수준의 redirection이 가능하므로 활용해보면 좋다


<br><br>

> #### Reference
> * [Application Load Balancer용 리스너 - AWS Docs](https://docs.aws.amazon.com/ko_kr/elasticloadbalancing/latest/application/load-balancer-listeners.html#redirect-actions)
> * [ingress/annotations - AWS LoadBalancer Controller Docs](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/ingress/annotations)
> * [Exposing multiple services with https and ACM is throwing error #1455](https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues/1455)
