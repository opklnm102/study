# [k8s] Best practices for Kubernetes
> date - 2022.08.10  
> keyworkd - k8s, anti pattern, best practices  
> kubernetes 사용시 best pratices를 정리  

<br>

## resource request/limit 설정
* request, limit 설정의 정답은 없지만 CPU limit 설정은 anti pattern으로 아래와 같이 설정하는 것을 권장
```
- Always set memory limit == request
- Never set CPU limit
```
* CPU는 compressible resource로 여러 Pod가 CPU를 나눠서 사용하고, 부족하면 throttling 되어 처리 시간이 길어지지만 memory는 incompressible resource로 memory가 부족하면 OOM(Out Of Memory)으로 Pod restart 발생
* 최적의 리소스 사용량을 찾는 것은 쉽지 않다
* 평균적으로 10% 미만의 낮은 사용률을 보이는데 리소스 사용량을 설정하는데 많은 시간을 보내고 있다면 serverless를 고려해보자
  * 리소스 사용량에 따른 과금 모델
  * AWS Fargate, virtual kubelet을 지원하는 제품 등

<br>

### CPU Limit에 관하여
* 충분히 높은 limit는 좋으나 낮은 limit는 throttling이 발생하므로 대부분의 경우 CPU limit는 안좋은 점이 더 많다
* 아래와 같이 cpu request가 설정되어 있지 않거나 너무 낮게 설정되어 있으면 overcommited 상태가 되어 CPU를 많이 사용하게 되는 경우 CPU throttling 발생
```yaml
## 설정이 없거나
resources: {} 

## 너무 낮게 설정
resources:
  requests:
    cpu : "1m"
```
* **모든 Pod에 적절한 CPU request가 설정**되면 CPU limit가 제거되도 Pod 당 request만큼의 CPU는 보장된다

| all pods have... | cpu limits | no cpu limits |
|:--:|:--:|:--:|
| cpu requests | request ~ limit 만큼 사용 보장 | request 만큼 사용 보장<br>여유 cpu 사용 |
| no cpu requests | limit 만큼 사용 보장 | cpu 사용이 보장되지 않음 |

#### CPU throttling 발생시
CPU idle 대신 여유 CPU를 자유롭게 사용하도록 개선
1. cpu limit 제거
2. 적절한 cpu request 설정
3. cpu throttling이 계속 있다면 cpu request를 올린다


<br>

## 절절한 start/readiness/liveness probe 설정하기
* startProbe, livenessProbe, livenessProbe를 이해한 후 적절한 설정 필요
  * startProbe
    * application boot 확인
    * 1번만 실행
  * readinessProbe
    * application이 traffic에 응답할 수 있는지 확인
    * 항상 실행
    * 실패시 traffic routing 중지
  * livenessProbe
    * application이 정상적으로 실행중인지 확인
    * 항상 실행
    * 실패하면 application이 중단된 것으로 판단하여 restart
  * e.g. [Spring Boot Production-ready Features](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready-kubernetes-probes)
* readinessProbe에서 DB 등 외부 서비스 고려
* readiness/liveness probe에서 동일한 endpoint 사용
  * traffic 과부하로 readinessProbe가 실패할 경우 livenessProbe도 실패하여 Pod restart되어 비효율적
    * Pod가 일을 많이 한다고해서 restart하는게 맞을까?
* dependency가 있는 다른 서비스가 죽는다고 하더라도 livenessProbe, readinessProbe에 영향이 없도록 설정
  * cascading failures(연쇄적 실패)가 발생할 수도 있다
  * liveness와 response를 분리할 수 있도록 circuit breaker 사용ㄴ


<br>

## 모든 서비스를 `type: LoadBalancer`로 만들어서 LoadBalancer를 생성하지 않는다
* LoadBalancer 비용 발생하므로 비용 비효율
* ingress-controller를 활용하여 1개의 endpoint를 사용해 L7 layer에서 라우팅
* cluster 내부 통신일 경우 `type: ClusterIP` 와 내부 DNS 사용


<br>

## Anti Affinity 설정
* anti affinity를 설정하여 Pod가 특정 node에 몰리지 않도록하여 node 장애로 인한 service downtime에 대비
```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - key: "app"
              operator: In
              values:
              - zookeeper
        topologyKey: "kubernetes.io/hostname"
```


<br>

## PodDisruptionBudget 설정
* cluster 전체의 node drain시 Pod의 수를 보장하는 `PodDisruptionBudget`를 설정하여 장애 방지
```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: zk-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: zookeeper
```


<br>

## externalTrafficPolicy: Cluster 대신 Local 사용 고려
<div align="center">
  <img src="./images/external_traffic_policy.png" alt="external traffic policy" width="70%" height="70%" />
</div>

* `externalTrafficPolicy`는 Service가 외부 트래픽을 어떻게 라우팅할지 정의

### externalTrafficPolicy: Cluster
<div align="center">
  <img src="./images/external_traffic_policy_cluster.png" alt="external traffic policy cluster" width="45%" height="45%" />
  <img src="./images/external_traffic_policy_cluster_snat.png" alt="external traffic policy cluster snat" width="45%" height="45%" />
</div>

* 모든 node의 port가 open
  * kube-proxy는 모든 node의 NodePort(30000 ~ 32767) open
* client source ip 유실
  * 패킷이 다른 node의 pod로 라우팅되면 SNAT(source network address translation)되어 proxy node의 IP가 client ip가 된다
  * SNAT가 없으면 source, destination address 불일치로 연결 오류 발생
  * proxy의 original DNAT로 인해 다른쪽 끝의 대상은 Pod IP가 된다
* 다른 Node로의 network hop이 생길 수 있다
* load balancing에 유리

<br>

### externalTrafficPolicy: Local
<div align="center">
  <img src="./images/external_traffic_policy_local.png" alt="external traffic policy local loadbalancing" width="70%" height="70%" />
</div>

* Pod가 존재하는 node의 port만 open되어 라우팅
  * kube-proxy는 node에 Pod가 존재하면 NodePort(30000 ~ 32767) open
* LoadBalancer, NodePort type에서만 설정 가능
* client source ip 유지
  * LoadBalancer는 모든 node를 backend로 추가하지만 LoadBalancer의 health check에 의해 NodePort가 응답하는 node로만 트래픽을 보낸다
  * proxy node에서 SNAT가 발생하지 않으므로 client ip 보존
* 불필요한 network hop을 방지
  * network latency를 줄여야하는 application에 적합

<div align="center">
  <img src="./images/external_traffic_policy_local_loadbalancing.png" alt="external traffic policy local loadbalancing" width="45%" height="45%" />
  <img src="./images/external_traffic_policy_local_loadbalancing2.png" alt="external traffic policy local loadbalancing2" width="45%" height="45%" />
</div>

* 잠재적인 load balancing 불균형 위험이 있다
  * pod anti-affinity를 설정해 node에 고르게 분산 배치되도록 한다


<br>

## Service Account
* node에 권한을 할당하기 보다는 ServiceAccount에 권한 할당
* node로 AWS EC2를 사용한다면 [kube2iam](https://github.com/jtblin/kube2iam), [kiam](https://github.com/uswitch/kiam)으로 IAM Role 사용
* Amazon EKS(Elastic Kubernetes Service)라면 [AWS Identity and Access Management (IAM) roles for service accounts(IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 사용
```
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/my-app-role
  name: my-serviceaccount
  namespace: default
```


<br>

## Using latest tag
다양한 문제 발생 가능성이 있는 latest 대신 의미 있는 tag 사용
* [Git hash](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-%EB%A6%AC%EB%B9%84%EC%A0%84-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0)
* [Semantic Versioning 2.0.0](https://semver.org/)
* build number/datetime 같은 연속된 숫자


<br>

## image에 configuration 넣지 않기
<div align="center">
  <img src="./images/external_config.png" alt="external config" width="70%" height="70%" />
</div>

* IP address, other service URL, credentials, environment tags(dev, qa, production) 같은 configuration을 image 내부에 저장하지말고 [ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/), [Secret](https://kubernetes.io/docs/concepts/configuration/secret/), external configuration service 사용하여 외부에서 주입하여 동일한 image를 여러 environment에 사용


<br>

## secret 관리
<div align="center">
  <img src="./images/injecting_secrets.png" alt="injecting secrets" width="70%" height="70%" />
</div>

* bad use case
  * secret 처리를 위한 다양한 방법 사용
  * build, runtime secret 혼용
  * local development, testing을 어렵게, 불가능하게 만드는 복잡한 secret injection mechanisms
* 모든 팀/환경에서 동일한 secret strategy을 사용하는게 중요
* application에서 [HashiCorp Vault](https://www.vaultproject.io/) 같은 tool의 API를 직접 사용하면 안된다
  * 개발자가 local에서 Vault에 관련된 설정을 해야하므로 환경 구성이 복잡해진다


<br>

## deployment models
* 다양한 deployment strategies 사용
  * Blue-Green
  * Rolling
  * Canary
  * A/B Testing
* 기본으로 제공하는 Rolling update는 충분하지 않다


<br>

## templating tool 사용
* yaml을 직접 수정하는게 번거롭고, human fault가 발생할 가능성이 있으므로 [Helm](https://helm.sh), [kustomize](https://kustomize.io) 같은 templating tool을 사용


<br>

## 특정 순서를 가지도록 배포하지 않기
* dependency 순서에 따라 배포하는 방식을 container orchestration에 적용하지 않는게 중요
* 모두 동시에 실행될 수 있으므로 self healing + retry 구현


<br>

## application과 infra 분리
* application은 infra보다 자주 배포되므로 같은 lifecycle에 포함되어 있으면 비효율적
* infra pipeline과 application pipeline을 분리하여 효율화한다


<br>

## dynamic environments 사용
<div align="center">
  <img src="./images/predefined_test_environments.png" alt="predefined test environments" width="45%" height="45%" />
    <img src="./images/dynamic_test_environments.png" alt="dynamic test environments" width="45%" height="45%" />
</div>

* predefined staging 환경보다 dynamic staging 환경을 사용해 필요할 때만 생성하여 비용 효율화하고, feature별로 생성하여 격리한다
* Pull Request open시 생성되고, merge/close시 제거
  * feature-a.staging.company.com or staging.company.com/feature-a가 생겨야한다


<br>

## deployment metrics 사용
<div align="center">
  <img src="./images/automated_rollbacks.png" alt="automated rollbacks" width="70%" height="70%" />
</div>

* logging, tracing, metrics을 기반으로 deployment에 사용할 metrics을 정의하고, automated rollback에 활용


<br><br>
 
> #### Reference
> * [Kubernetes maintainers like Tim Hockin recommend not using limits at all](https://twitter.com/thockin/status/1134193838841401345)
> * [Compressible Resource Guarantees - Resource Quality of Service in Kubernetes](https://github.com/kubernetes/design-proposals-archive/blob/8da1442ea29adccea40693357d04727127e045ed/node/resource-qos.md#compressible-resource-guaranteess)
> * [CPUThrottlingHigh (Prometheus Alert)](https://github.com/robusta-dev/alert-explanations/wiki/CPUThrottlingHigh-(Prometheus-Alert))
> * [파드 및 컨테이너 리소스 관리](https://kubernetes.io/ko/docs/concepts/configuration/manage-resources-containers/)
> * [10 most common mistakes using kubernetes](https://blog.pipetail.io/posts/2020-05-04-most-common-mistakes-k8s/)
> * [Kubernetes anti-patterns: What NOT to do](https://cloudification.io/2022/04/19/kubernetes-anti-patterns/)
> * [Kubernetes Deployment Antipatterns – part 1](https://codefresh.io/blog/kubernetes-antipatterns-1/)
> * [Kubernetes Deployment Antipatterns – part 2](https://codefresh.io/blog/kubernetes-antipatterns-2/)
> * [Kubernetes Deployment Antipatterns – part 3](https://codefresh.io/blog/kubernetes-antipatterns-3/)
> * [A Deep Dive into Kubernetes External Traffic Policies](https://www.asykim.com/blog/deep-dive-into-kubernetes-external-traffic-policies)
