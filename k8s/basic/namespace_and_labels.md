# [k8s] Namespace & labels
> date - 2023.02.24  
> keyword - kubernetes, k8s, namespace, labels  
> kubernetes에서 namespace와 labels에 대해 정리  

<br>

## Namespace
* 리소스를 논리적으로 분리할 수 있는 단위
* 단일 cluster 내에서 리소스 그룹 격리 메커니즘을 제공
* 여러개의 팀이나 프로젝트 등 많은 사용자가 있는 환경에서 사용하도록 만들어졌기 때문에 사용자가 수십명 정도가 되는 경우에는 고려할 필요가 없고, namespace가 제공하는 기능이 필요할 때 사용
* cluster resource를 [resource quota](https://kubernetes.io/docs/concepts/policy/resource-quotas)를 사용해 namespace에 나눌 수 있다
* `NamespaceDefaultLabelName` [feature gate](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates) 활성화시 `kubernetes.io/metadata.name: <namespace name>` labels을 자동으로 설정한다
* `Deployments`, `Services`, `PersistentVolumeClaim` 같은 namespace-based object에 적용되며, `StorageClass`, `Nodes`, `PersistentVolumes` 같은 cluster-wide object에는 적용되지 않는다
```sh
## namespace scope resource
$ kubectl api-resources --namespaced=true

## cluster scope resource
$ kubectl api-resources --namespaced=false
```

<br>

### Initial namespaces
* kubernetes는 4개의 initial namespace가 있다

| Namespace | Description |
|:--|:--|
| default | namespace가 없는 object를 위한 namespace<br>cluster 생성 직후 namespace 생성 없이 cluster를 사용할 수 있도록 포함 |
| kube-node-lease | node와 연결된 [Lease](https://kubernetes.io/docs/concepts/architecture/leases/) object를 보유한 namespace<br>node lease를 통해 kubelet은 [heartbeats](https://kubernetes.io/docs/concepts/architecture/nodes/#heartbeats)를 전송하여 control plane이 node failure를 감지할 수 있다 |
| kube-public | 모든 client(인증 되지 않은)에서 접근 가능한 namespace<br>cluster에서 공개해야하는 리소스를 위한 것이며 꼭 사용할 필요는 없다 |
| kube-system | kubernetes system에서 생성한 object를 위한 namespace |


<br>

## Usage

### Namespace 조회
* namespace list 조회
```sh
$ kubectl get ns

NAME              STATUS   AGE
default           Active   1d
kube-node-lease   Active   1d
kube-public       Active   1d
kube-system       Active   1d
```

* 자세한 정보 확인
```sh
$ kubectl describe ns <namespace>

Name:           default
Labels:         <none>
Annotations:    <none>
Status:         Active

No resource quota.

Resource Limits
 Type       Resource    Min Max Default
 ----               --------    --- --- ---
 Container          cpu         -   -   100m
```

<br>

### Namespace 생성
```yaml
# my-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: <namespace name>
```

```sh
$ kubectl apply -f my-namespace.yaml
```

* 아래 명령어로도 생성 가능
```sh
$ kubectl create namespace <namespace name>
```

<br>

### Namespace 제거
> namespace 제거시 namespace의 모든 것이 제거된다
```sh
$ kubectl delete -f my-namespace.yaml
```

* 아래 명령어로도 제거 가능
```sh
$ kubectl delete namespace <namespace name>
```

<br>

### Namespace의 리소스 확인
```sh
$ kubectl -n <namespace> get <resource>

## example
$ kubectl -n kube-system get pod

## all namespace
$ kubectl get pod --all-namespaces
```


<br>

## Namespace는 어떤 단위로 나눠야 좋을까?
* 요구사항에 따라 다르다
* 너무 세분화된 namespace는 관리 복잡도를 증가시키니 주의

| Namespace 단위 | Description |
|:--|:--|
| Single namespace | namespace로 인한 복잡도가 증가를 피하고 싶거나 사용자가 적어 구분이 불필요할 때 사용 |
| Environment | development, staging, production 등으로 환경에 따라 구분<br>소규모 cluster에서 활용 |
| Team | 규모가 있는 조직에서 활용<br>타팀에 의해 리소스가 변경되는 것을 RBAC을 통해 방지할 수 있다<br>ResourceQuota 등을 각팀에 맞춰 관리 필요 |
| Service | 여러팀이 하나의 서비스를 운영하거나, 하나의 팀이 여러 서비스를 운영하는 서비스가 많은 조직에서 활용 |
| Componement | cluster에서 하나의 서비스를 운영시 서비스를 구성하는 component별로 구성<br>e.g. monitoring, service-mesh, etl |


<br>

## Namespace와 DNS
* [Service](https://kubernetes.io/docs/concepts/services-networking/service)를 생성하면 다음과 같은 형식의 [DNS entry](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service)가 생성
```
<service-name>.<namespace-name>.svc.cluster.local
```
* container가 `<service-name>`만 사용하는 경우 같은 namespace의 Service로 연결
* 다른 namespace에 접근하려면 `FQDN(Fully Qualified Domain Name)`을 사용
  * `kube-dns.kube-system`이나 `kube-dns.kube-system.svc.cluster.local`
  * namespace name은 유효한 [RFC 1123 DNS labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names)이어야한다 


<br>

## Labels
* `Pod` 같은 object에 설정하는 key/value 형태의 부가 정보(metadata)
  * annotation도 metadata를 추가하는 방법이지만 label은 **metadata + selector를 사용**이라면 annotation은 **metadata**
* object를 식별하고 선택하는데 사용
  * release: stable, release: canary
  * environment: dev, environment: qa, environment: production
  * tier: frontend, tier: backend, tier: cache
  * partition: customerA, partition: customerB
  * track: daily, track : weekly
* label convetion과 필수 label을 만들어서 관리하면 범용있게 사용할 수 있다
  * `<prefix>/<name>` - example.com/team
  * app, service, team, owner
* password, api credentials 같은 민감 정보는 누구나 확인할 수 있는 label로 설정하면 안된다
* 일관성을 위해 CI/CD pipeline에서 label을 추가하거나 누락된 label이 있으면 담당 팀에 알람을 보내 적절한 label을 지정하도록 한다

<br>

### Recommended Labels
| key | description | example | type |
|:--|:--|:--|:--|
| app.kubernetes.io/name | application name | mysql | string |
| app.kubernetes.io/instance | application instance를 식별하는 unique name | mysql-zyzx | string |
| app.kubernetes.io/version	| application version(e.g. [SemVer](https://semver.org), revision hash) | 8.0.33 | string |
| app.kubernetes.io/component	| 아키텍처 내 구성요소 | db(database) | string |
| app.kubernetes.io/part-of	| application의 일부인 상위 수준 application | wordpress | string |
| app.kubernetes.io/managed-by | application을 관리하는 도구 | helm, kustomize	|string |


<br>

## Usage

### Label 추가
* manifest에 설정하여 추가
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: label-demo
  labels:
    environment: production
    app: nginx
...
```
* command로 label 추가
```sh
$ kubectl label pod <pod name> <label>

## example
$ kubectl label pod my-pod version=1.0.0
```
* command로 label 제거
```sh
$ kubectl label pod <pod name> <label>-

## example
$ kubectl label pod my-pod version-
```

<br>

### Label 조회
* 모든 label 조회
```sh
$ kubectl get <resource> --show-labels

## example
$ kubectl get pods --show-labels
```

* 특정 pod의 label 조회
```sh
$ kubectl get pods my-pod -o json | jq .metadata.labels
```

<br>

### Label로 필터링(selector 사용)
* 조건에 일치하는 pod 조회
```sh
$ kubectl get pods -l environment=production,tier=frontend
```

* 조건을 포함하는 pod 조회
```sh
## environment labels이 production or qa고, tier labels이 frontend인 것 조회
$ kubectl get pods -l 'environment in (production, qa),tier in (frontend)'
```

* `OR` 연산
```sh
## environment labels이 production or qa인 것 조회
$ kubectl get pods -l 'environment in (production, qa)'
```

* `exists` 연산
```sh
## environment labels이 없고, environment가 frontend가 아닌 것 조회
$ kubectl get pods -l 'environment,environment notin (frontend)'
```

<br>

### 특정 label을 가진 리소스 제거
```sh
$ kubectl delete deployment,service,statfulset -l environment=qa
```


<br><br>

> #### Reference
> * [Namespaces - k8s docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces)
> * [Share a Cluster with Namespaces - k8s docs](https://kubernetes.io/docs/tasks/administer-cluster/namespaces)
> * [Labels and Selectors - k8s docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels)
> * [Recommended Labels - k8s docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels)
> * [Kubernetes Labels: Expert Guide with 10 Best Practices](https://cast.ai/blog/kubernetes-labels-expert-guide-with-10-best-practices)
> * [Best Practices Guide for Kubernetes Labels and Annotations](https://komodor.com/blog/best-practices-guide-for-kubernetes-labels-and-annotations)
