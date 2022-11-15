# [AWS] Amazon EKS Upgrade 1.20 to 1.21 Journey
> date - 2022.11.03  
> keyworkd - aws, eks, kubernetes  
> upgrade 방법은 [Amazon EKS Upgrade Journey](./eks_upgrade_journey.md)를 참고하고, 여기서는 1.20 -> 1.21의 변경 사항을 다룬다  

<br>

## Kubernetes 1.21의 주요 변경 사항
* container runtime으로 containerd(default. Docker) 사용 가능
* BoundServiceAccountTokenVolume

<br>

### container runtime으로 containerd(default. Docker) 사용 가능
* Amazon Linux 2 EKS optimized AMI에서 `--container-runtime containerd` 사용
* Amazon EKS 1.24부터 [containerd](https://containerd.io)만 지원
* Kubernetes만 사용하면(docker API를 직접 사용하지 않는다면) 간단하게 변경 가능

#### [containerd runtime bootstrap flag 사용](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/eks-optimized-ami.html#containerd-bootstrap)하여 test
* self managed node group이라면 `BootstrapArguments`에 옵션 추가
```sh
--container-runtime containerd
```
* managed node group이라면 launch template에 아래 내용 설정
```yaml
/etc/eks/bootstrap.sh my-cluster \
  --container-runtime containerd
```

<br>

### BoundServiceAccountTokenVolume
* service account token 1시간 만료
* [Kubernetes Client SDK](https://kubernetes.io/docs/reference/using-api/client-libraries)는 자동으로 refresh
  * Go v0.15.7 이상
  * Python v12.0.0 이상
  * Java v9.0.0 이상
  * token 발급 90일 이후 API가 거부되므로 이전 버전을 사용하는 경우 업데이트 필요
* Kubernetes API를 사용하는 workload에 영향

| workload |kubernetes client| description |
|:--|:--|:--|
|aws-load-balancer-controller 2.4.1|k8s.io/client-go v0.21.2|이슈 없음|
|external-dns 0.11.0|k8s.io/client-go v0.23.1|이슈 없음|
|datadog 7.31.1|k8s.io/client-go v0.20.5|이슈 없음|
|cluster-autoscaler 1.20.2| ? | cluster minor version에 맞추어 업그레이드 되므로 이슈 없음 |
|kube-state-metrics 2.2.4|k8s.io/client-go v0.22.0|이슈 없음|
|metrics-server - 0.6.1|k8s.io/client-go v0.23.2|이슈 없음|
| fluent-plugin-kubernetes_metadata_filter 2.6.0 | ? | [Refresh k8s client on 'Unathorized' exceptions #337](https://github.com/fabric8io/fluent-plugin-kubernetes_metadata_filter/pull/337)<br>fluent-plugin-kubernetes_metadata_filter gem: 2.11.1 에서 fix<br>fluentd image: v1.14.6-debian-1.1|
| spring-cloud-dataflow-server 2.9.4 | io.fabric8:kubernetes-client 사용 버전은?<br>-> spring-cloud-deployer-kubernetes에 dependency 명시<br>-> spring-cloud-dataflow-platform-kubernetes<br>-> org.springframework.cloud:spring-cloud-deployer-kubernetes:2.7.4<br>-> io.fabric8:kubernetes-client:4.13.3(2021-04-22 release v4 최신) |  [Kubernetes Compatibility Matrix](https://github.com/fabric8io/kubernetes-client#compatibility-matrix)에 따라 spring cloud dataflow가 사용하는 fabric8.io:kubernetes-client가 업그레이드 되지 않는 이상 호환성을 보장할 수 없다<br>2022-08-19 기준 v5.12.3, v6.0.0이 최신 버전<br>io.fabric8:kubernetes-client:5.4.0 이상을 사용하는 spring cloud dataflow가 공식적으로 지원되지 않음<br>[#3097](https://github.com/fabric8io/kubernetes-client/issues/3097), [#3105](https://github.com/fabric8io/kubernetes-client/pull/3105)에서 401 받으면 refresh 구현되어 2021-05-14 merged, 5.4.0에 포함되어 5.4.0부터 kubernetes 1.21.1 호환<br>[#4264](https://github.com/fabric8io/kubernetes-client/pull/4264)에서 1분마다 refresh 구현되어 2022-07-22 merged, 6.1.0에 포함 예정으로 아직 릴리즈되지 않음 |


<br>

## Etc

### [[EKS] [request]: Managed Node Groups - Add ability to set the underlying ASG name #1304](https://github.com/aws/containers-roadmap/issues/1304)
* [cluster autoscaler priority based expander](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/expander/priority/readme.md) 사용을 위해 Auto Scaling Group name format 변경
```
eks-<managed node group name>-<uuid>
```
* use case - on-demand 보다 spot node group 확장을 선호

<br>

### [Immutable Secrets](https://kubernetes.io/docs/concepts/configuration/secret/#secret-immutable) & [Immutable ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/#configmap-immutable)
```yaml
apiVersion: v1
kind: Secret
...
immutable: true
```
```yaml
apiVersion: v1
kind: ConfigMap
...
immutable: true
```
* 의도치 않게 application을 중단시킬 수 있는 업데이트로부터 cluster를 보호
* immutable이면 kubelet이 변경 사항을 watch/polling하지 않으므로 kube-apiserver로의 부하 감소

<br>

### [Graceful Node shutdown](https://kubernetes.io/blog/2021/04/21/graceful-node-shutdown-beta/) beta
* kubelet이 node shutdown을 인식하여 pod를 정상적으로 종료
* kubelet은 systemd를 통해 시스템 종료를 감지하여 Pod에게 알려 Pod를 정상 종료시킨다
  * lifecycle hook을 통해 cordon, drain을 안해도 된다
* managed node group에는 이미 node terminations을 위한 lifecycle hook이 있다
* multi container pod에 `kubectl.kubernetes.io/default-container` annotation을 추가해 kubectl 명령을 받을 default container를 지정 가능

<br><br>

> #### Reference
> * [Updating a cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
> * [Amazon EKS Kubernetes versions - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html)
