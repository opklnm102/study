# [k8s] StatefulSet
> date - 2019.03.12  
> keyword - kubernetes, concepts, k8s controller  
> k8s에서 state 유지가 필요한 container를 위해 제공되는 workload인 statefulset에 대해 알아보자  

<br>

## StatefulSet
* **state 유지**가 필요한 application을 관리하는데 사용하는 workload API object
* Pod의 deployment, scaling을 관리하고 순서 및 고유성을 보장
* `Deployment` 같이 container spec을 기반으로 Pod을 관리
* `Deployment`와 달리 Pod에 sticky ID 할당
  * 동일한 spec으로 생성되지만 같은 Pod은 아니다
  * sticky ID는 모든 scheduling에서 영구적으로 유지
* 다른 controller와 동일한 pattern으로 동작
  * Statefulset을 정의하고 업데이트하면 변경된다


<br>

## Using StatefulSets
* 다음 중 하나 이상을 필요로하는 application에 사용
  * Stable unique network identifiers
  * Stable persistent storage
  * Ordered, graceful deployment, scaling
  * Ordered, automated rolling update
* stable identifier 나 ordered deployment, deletion, scaling이 필요하지 않은 경우 stateless replica contaoller인 `Deployment` or `ReplicaSet`을 사용

> Stable - Pod schedule의 지속성을 뜻한다


<br>

## Limitations
* 1.9 이전에는 beta, 1.5 이전에는 사용 불가
* Pod의 storage는 요청된 `storage class`를 기반으로 [PersistentVolume Provisioner](https://github.com/kubernetes/examples/blob/master/staging/persistent-volume-provisioning/README.md)에 의해 provisioning되거나 관리자가 미리 provisioning 해야한다
* StatefulSet delete/scaling시 volume은 삭제되지 않는다
  * data 안정성 보장
* Headless Service를 Pod의 network identifier로 사용
  * Headless Service를 생성 필요
* StatefulSet delete 시 Pod의 termination에 대해 보증하지 않는다
  * Ordered, graceful termination을 위해서는 scale을 0으로 조정 후 StatefulSet을 delete


<br>

## Components
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports: 
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx  # has to match .spec.template.metadata.labels
  serviceName: nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx  # has to match .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: k8s.gcr.io/nginx-slim:0.8
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "my-storage-class"
      resources:
        requests:
          storage: 1Gi
```


<br>

## Pod Selector
* `.spec.selector`와 `.spec.template.metadata.labels`를 같게 설정해야 한다
  * 1.8 이전에는 `.spec.selector`가 생략되었을 때 default로 생성했지만 1.8 이후에는 StatefulSet 생성시 실패한다


<br>

## Pod Identity
* StatefulSet Pod에는 stable network identity, stable storage로 구성된 unique identity가 있으며 Pod에 고정된다

### Ordinal Index
* N개의 replica가 있을 경우 0 ~ N-1까지 할당

### Stable Network ID
* `$(statefulset name)-$(ordinal)` format 사용
  * ex) web-0, web-1, web-2
* Headless Service를 사용해 Pod의 domain을 제어
  * `$(service name).$(namespace).svc.cluster.local`
    * governing service domain이라고 한다
    * `cluster.local`은 cluster domain
  * Pod에는 `$(pod name).$(governing service domain)`의 subdomain 형식으로 matching 된다
    * `$(pod name).$(service name).$(namespace).svc.cluster.local`


| Clutser Domain | Service(ns/name) | StatefulSet(ns/name) | StatefulSet Domain | Pod DNS | Pod Hostname |
|:--|:--|:--|:--|:--|:--|
| cluster.local | default/nginx | default/web | nginx.default.svc.cluster.local | web-{0..N-1}.nginx.default.svc.cluster.local | web-{0..N-1} |
| cluster.local | foo/nginx | foo/web | nginx.foo.svc.cluster.local | web-{0..N-1}.nginx.foo.svc.cluster.local | web-{0..N-1} |
| kube.local | foo/nginx | foo/web | nginx.foo.svc.kube.local | web-{0..N-1}.nginx.foo.svc.kube.local | web-{0..N-1} |


### Stable Storage
* VolumeClaimTemplate에 대해 `PersistentVolume`을 생성

```yaml
...
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "my-storage-class"
      resources:
        requests:
          storage: 1Gi
```
* 각 Pod은 my-storage-class의 `StorageClass`로 1Gi의 PersistentVolume을 할당
* `StorageClass`가 지정되지 않으면 default `StorageClass` 사용
* Pod scheduling시 PersistentVolumeClaim과 연관된 PersistentVolume을 mount
  * Pod, StatefulSet delete시 PersistentVolumeClaim과 연관된 PersistentVolume은 수동 삭제 필요


### Pod Name Label
* `StagefulSet`은 `statefulset.kubernetes.io/pod-name`의 Label을 추가
* Label을 이용해 특정 Pod에 Service를 연결할 수 있다


<br>

## Deployment and Scaling Guarantees
* Pod은 **0~N-1** 순서로 deploy되고, **N-1~0** 순서로 delete 된다
  * scaling in 시에도 **N-1~0** 순으로 진행
* Scaling시 선행 Pod이 Running, Ready여야 한다
  * ex) web-0 Init -> web-0 Running -> web-1 Init
* Pod termination시에는 후행 Pod의 termination 완료 후 진행된다
  * ex) web-1 terminated -> web-0 terminated
* `pod.spec.terminationGracePeriodSeconds: 0`은 안전하지 않으므로 권장하지 않는다
  * [Force Delete StatefulSet Pods](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/) 참고


### Pod Management Policies
* 1.7 아후부터 `spec.podManagementPolicy`로 순서를 보장하면서 unique identity를 보장한다

#### OrderedReady Pod Management
* default
* 위의 spec으로 동작

#### Parallel Pod Management
* StatefulSet controller가 Pod의 launch, terminate를 병렬로 진행


<br>

## Update Strategies
* 1.7 이후부터 `spec.updateStrategy`로 Pod의 containers, labels, resource request/limit, annotation에 대한 automated rolling update 활성화/비활성화를 설정

### On Delete
1.6 이전의 동작 방식
Pod을 수동으로 삭제해야 StatefulSet의 변경사항이 반영

### Rolling Updates
* default
* Pod이 N-1~0 순서로 automated rolling update

### Partition
* `spec.updateStrategy.rollingUpdate.partition`으로 rolling update partition
* 해당 partition보다 크거나 같은 ordinal의 Pod이 업데이트
  * 작으면 업데이트 되지 않는다
* replica보다 크면 모든 Pod이 update되지 않는다
  * update 준비, canary roll out, phased roll out시 유용


<br><br>

> #### Reference
> * [StatefulSets - k8s docs](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
