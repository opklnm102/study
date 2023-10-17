# [k8s] Cases where kubernetes 5xx error occurs and solutions
> date - 2023.10.16  
> keyworkd - kubernetes, alb  
> k8s application에서 5xx error가 발생하는 case에 대해 정리  

<br>

## health check 미설정
* 502는 application이 traffic을 처리할 수 없는 상태에서 traffic을 받아서 발생하는게 대부분으로 health check가 제대로 설정되지 않았을 가능성이 높다

<br>

### Solutions
* liveness/readiness/startup probe의 initialDelaySeconds 등을 적절하게 설정


<br>

## external service 연결 장애
* [Spring actuator health](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)는 DB 등 external service의 connection을 health check
* 여기서 발생할 수 있는 issue
```
auto scaling으로 인한 Pod 증가 -> external service connection 증가 -> connection limit 도달 -> external service connection health check 실패 -> Pod health check 실패 -> 전체 Pod의 재시작으로 일시적으로 downtime 발생
```

<br>

### Solutions
* auto scaling 가능한 Pod 개수를 미리 산정하여 limit를 설정
* 2가지 group을 분류하여 health check 설정을 다르게 가져가 전체 Pod가 동시에 내려가지 않게 설정
* health check에서 external service 제외


<br>

## ELB health check 트래픽의 증폭
* [AWS LBC(Load Balancer Controller)](https://kubernetes-sigs.github.io/aws-load-balancer-controller)는 NodePort Service를 이용해 Pod를 ELB(ALB/NLB)에 연결
* NodePort의 `externalTrafficPolicy: Cluster(default)`, `alb.ingress.kubernetes.io/target-type: instance(default)`일 경우 health check가 증폭되는 이슈가 발생
* Node가 100개, Pod가 3개일 경우 target group은 100개의 Node이므로 ELB health check는 100개가 발생하고 3개의 Pod가 나눠서 수신
  * auto scaling으로 인해 Node가 증가할수록 health check는 더욱 증폭되고, health check traffic으로 인한 부하로 Pod는 먹통이 된다
  * HPA를 설정했어도 신규 Pod가 scaling되는 타이밍이 늦으면 순차적으로 Pod가 down되어 service downtime이 발생

<br>

### Solutions
* `externalTrafficPolicy: Local`을 사용하여 kube-proxy가 Pod가 존재하는 Node의 port만 오픈하여 health check가 다른 Node로 routing되지 않도록 설정
* `alb.ingress.kubernetes.io/target-type: ip`를 사용하여 Pod가 target group이 되도록 설정
* `alb.ingress.kubernetes.io/target-node-labels`를 사용하여 특정 label이 있는 Node만 target group에 등록하여 target group을 제한


<br>

## CPU credit 소진
* CPU credit이 있는 EC2 instance T type을 사용할 경우 CPU를 많이 사용하는 application(e.g. spring application)은 주의 필요
* 여기서 발생할 수 있는 issue
```
application 배포 -> CPU credit 고갈 -> application 초기화 지연 -> liveness probe 실패로 인한 Pod restart -> CPU credit 고갈
```

<br>

### Solutions
* CPU credit 고갈이 발생하지 않도록 소비량보다 충전량이 큰 type 사용
* CPU credit이 없는 m type 사용
