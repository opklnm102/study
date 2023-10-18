# [k8s] Implementing zero downtime deployment of Pods on Amazon EKS
> date - 2023.10.16  
> keyworkd - kubernetes, eks, alb  
> [AWS LBC(Load Balancer Controller)](https://kubernetes-sigs.github.io/aws-load-balancer-controller)에서 Pod rolling update시 5xx error 발생  
> instance mode보다 ip mode에서 더 많은 500/502/503 error가 발생하는데 이에 대응하기 위한 내용 정리  

<br>

## TL;DR
* zero downtime deployment를 위해 readiness gate + preStop + graceful shutdown 설정 필요
* 신규 request 처리를 위해 readiness/liveness probe + pod readiness gate 설정
* in-flight request 처리를 위한 graceful shutdown + preStop 설정


<br>

## readiness/liveness probe 설정
* container의 health check를 위한 liveness/readiness probe를 설정은 필수
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      ...
          ports:
            - name: http
              containerPort: 8080
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: http
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: http
          startupProbe:
            httpGet:
              path: /actuator/health/liveness
              port: http
            initialDelaySeconds: 70
            failureThreshold: 30
```
* Kubernetes의 application은 대부분 liveness/readiness probe를 사용해 트래픽 보존 가능
* liveness/readiness probe를 설정할 수 없을 때는 Pod readiness gates 사용


<br>

## Pod readiness gate?
* [Pod readiness gates](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-readiness-gate)는 traffic을 수신할 수 있는 상태임을 나타내기 위한 기능
* Pod의 모든 container가 ready가 되면 Pod가 ready가 된다
* PodScheduled, Initialzed와 같은 custom status를 만들 수 있다

<br>

### AWS LBC + Pod readiness gate
* AWS LBC는 Pod가 ALB/NLB에 등독되어 있고 traffic을 수신할 수 있는 상태임을 나타내기 위한 [Pod readiness gates](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-readiness-gate)를 지원
* 새로운 Pod는 traffic을 처리 가능한 상태일 때 Ready 상태가 되어 **target group은 항상 replica 만큼의 healthy target을 확보할 수 있다**
  * Pod 생성 중 mutating webhook을 이용해 readiness gate 설정을 pod sepc에 injtect -> Pod가 ready가 되면 target group에 register, 기존 Pod deregister
* target-type: ip에서만 작동
  * target-type: instance에서는 backend가 node이므로 ALB가 pod, podReadiness를 인식하지 못한다

#### zero downtime rolling upgrade를 하려면 아래 상황에서 pod readiness gate가 필요
* replicas의 수가 적은 deployment 사용시
  * startup time이 긴 경우 한순간 traffic을 수신할 Pod가 존재하지 않을 수 있다
* 새로운 Pod의 rollout 시간이 AWS LBC가 새로운 Pod를 등록하고, target group이 healthy로 전환되는데 걸리는 시간보다 짧을 때
* rolling update 중 target group에는 inital.draining인 target만 남아 있을 수 있어서 서비스 중단이 발생

<br>

### Configuration
* namespace에 `elbv2.k8s.aws/pod-readiness-gate-inject=enabled` label 추가
```sh
$ kubectl label namespace <namespace> elbv2.k8s.aws/pod-readiness-gate-inject=enabled

apiVersion: v1
kind: Namespace
metadata:
  name: test
  labels:
    elbv2.k8s.aws/pod-readiness-gate-inject: enabled
```

* aws-load-balcner-controller에 `enable-pod-readiness-gate-inject` 옵션 활성화
```sh
—enable-pod-readiness-gate-inject=true(default. true)
```

* 위의 설정 후 다음 조건을 만족하는 Pod에 pod readiness gate를 추가
  * 같은 namespace에 Pod label과 일치하는 Service가 존재
  * 일치하는 Service를 참조하는 target group binding이 존재
  * target type ip 사용
* `target-health.elbv2.k8s.aws`를 prefix로 사용하며 Pod 생성 중에만 설정
  * `namespace label -> Ingress, Service -> Pod` 순서로 생성해야한다


<br>

## in-flight request 처리를 위해 graceful shutdown 설정

### graceful shutdown

#### 이상적인 동작
1. ReplicaSet은 Pod를 제거하기로 결정
2. Pod의 endpoint가 LB에서 제거되며 traffic이 Pod로 전달되지 않는다
3. preStop hook과 SIGTERM 발생
4. Pod는 gracefully shutdown을 진행하며 새로운 request 수신 중지
5. 처리중인 모든 request가 완료되면 shutdown이 완료되고 Pod가 종료

불행히도 위처럼 동작하지 않고 거의 동시에 일어나며, external load balancer까지의 반응이 느려서 endpoint가 변경되기 전에 Pod가 종료처리되며 5xx error가 발생하게 된다

#### 실제
1. ReplicaSet은 Pod를 제거하기로 결정
2. Pod의 endpoint 제거가 진행되며 traffic은 계속 Pod 전달
3. preStop hook과 SIGTERM 발생
4. Pod는 gracefully shutdown을 진행하며 새로운 request 수신 중지 및 client가 가능하면 새로운 Pod로 연결될 수 있게 정보 전달(e.g. HTTP - `Connection: close` response header, web socket - GOAWAY message)
5. Pod는 terminationGracePeriodSeconds가 초과되고 SIGKILL을 수신한 경우에만 종료
6. `terminationGracePeriodSeconds`은 LB에 새로운 Pod가 등록되는데 필요한 시간보다 길게 설정

<br>

### Client가 새로운 연결을 사용할 수 있게 전달
* [예시](https://github.com/M00nF1sh/ReInvent2019CON310R/blob/master/src/server.py#L26)처럼
  * http - `Connection: cloase` header 응답
  * websocket - GOAWAY message 

<br>

### preStop
* deregister target 후(draining 상태) 유입되는 traffic 처리를 위해 delay 설정
* Spring Boot application은 [graceful shutdown](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes#graceful-shutdown) 사용하면 되지만 application의 동작을 변경할 수 없는 경우 preStop hook에 sleep 설정  
* `preStop + application shutdown time < terminationGracePeriodSeconds`를 지켜야한다

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
...
  template:
    spec:
      terminationGracePeriodSeconds: 75
      containers:
        ...
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 10"]
          env:
            ...
            - name: SPRING_LIFECYCLE_TIMEOUT-PER-SHUTDOWN-PHASE
              value: "60s"
```
* Pod마다 preStop hook을 설정하는게 번거롭다면 [Pod Graceful Drain](https://github.com/foriequal0/pod-graceful-drain)를 고려

<br>

### Connection draining(or deregistration delay)
* LB에서 열려 있는 connection이 있다면 설정된 시간 동안 자연스럽게 종료되도록 대기
* 시간이 초과되면 connection을 강제 종료한 후 LB에서 제거
* `preStop + application shutdown time < terminationGracePeriodSeconds < deregistration delay`를 지켜야한다
```yaml
...
  annotations:
   alb.ingress.kubernetes.io/target-group-attributes: |
     deregistration_delay.timeout_seconds=30
```


<br>

## Test
### Sample
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: test
  labels:
    elbv2.k8s.aws/pod-readiness-gate-inject: enabled
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: 2048-game
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-2:<account id>:certificate/xxxxxxxxxx-xxxxxxxxx
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80,"HTTPS": 443}]'
    alb.ingress.kubernetes.io/actions.ssl-redirect: >
      {"type": "redirect", "redirectConfig": { "protocol": "HTTPS", "port": "443", "statusCode": "HTTP_301"}}
    alb.ingress.kubernetes.io/scheme: internal
    alb.ingress.kubernetes.io/group.name: 2048-game
    alb.ingress.kubernetes.io/tags: |-
      service=2048-game,
      environment=dev
spec:
  ingressClassName: alb
  rules:
    - host: 2048-game.dev.example.com
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

---
apiVersion: v1
kind: Service
metadata:
  name: 2048-game
  annotations:
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/target-group-attributes: |
      deregistration_delay.timeout_seconds=70
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  type: NodePort
  selector:
    app.kubernetes.io/name: app-2048
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: 2048-game
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: app-2048
  replicas: 4
  template:
    metadata:
      labels:
        app.kubernetes.io/name: app-2048
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - image: public.ecr.aws/l6m2t8p7/docker-2048:latest
          imagePullPolicy: IfNotPresent
          name: app-2048
          ports:
            - containerPort: 80
              name: http
          readinessProbe:
            httpGet:
              port: http
              path: /health
          livenessProbe:
            httpGet:
              port: http
              path: /health
          startupProbe:
            httpGet:
              port: http
              path: /health
            initialDelaySeconds: 10
            failureThreshold: 30
          lifecycle:
            preStop:
              exec:
                command: ["sleep", "10"]
```

<br>

### curl
* 간단히 `curl` 이용
```sh
$ while true; do curl https://test.example.com/health; echo "\n"; sleep 1; done
```

<br>

### vegeta
* load testing tool [vegeta](https://github.com/tsenart/vegeta)를 이용
* as-is
```sh
$ echo "GET https://test.example.com/health" | vegeta attack -duration=60s -rate=1000 | tee results.bin | vegeta report

Requests      [total, rate, throughput]         12000, 100.01, 94.16
Duration      [total, attack, wait]             2m0s, 2m0s, 20.348ms
Latencies     [min, mean, 50, 90, 95, 99, max]  7.271ms, 589.571ms, 18.941ms, 65.114ms, 10.005s, 10.036s, 10.177s
Bytes In      [total, mean]                     645759, 53.81
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           94.17%
Status Codes  [code:count]                      200:11300  502:27  503:1  504:672
Error Set:
503 Service Unavailable
502 Bad Gateway
504 Gateway Timeout
```

* to-be
```sh
$ echo "GET https://test.example.com/health" | vegeta attack -duration=60s -rate=1000 | tee results.bin | vegeta report

Requests      [total, rate, throughput]         10000, 100.01, 99.99
Duration      [total, attack, wait]             1m40s, 1m40s, 24.59ms
Latencies     [min, mean, 50, 90, 95, 99, max]  9.425ms, 18.498ms, 13.822ms, 24.119ms, 37.336ms, 121.803ms, 276.791ms
Bytes In      [total, mean]                     490000, 49.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:10000
Error Set:
```


<br><br>

> #### Reference
> * [502/503 During deploys and/or pod termination #814](https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues/814)
> * [Kubernetes’ dirty endpoint secret and Ingress](https://syslog.ravelin.com/kubernetes-dirty-endpoint-secret-and-ingress-1abcf752e4dd)
> * [Pod readiness gate - AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.6/deploy/pod_readiness_gate/)
> * [[AWS][EKS] Zero downtime deployment(RollingUpdate) when using AWS Load Balancer Controller on Amazon EKS](https://easoncao.com/zero-downtime-deployment-when-using-alb-ingress-controller-on-amazon-eks-and-prevent-502-error)
> * [Mastering the Challenges of Using ALB Ingress in Kubernetes](https://medium.com/@imprintpayments/mastering-the-challenges-of-using-alb-ingress-in-kubernetes-8c28a8f826c5)
> * [Improving Application Availability with Pod Readiness Gates](https://martinheinz.dev/blog/63)
> * [foriequal0/pod-graceful-drain](https://github.com/foriequal0/pod-graceful-drain)
