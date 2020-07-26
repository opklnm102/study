# [k8s] Kubernetes raise StatefulSet volume size with low impact
> date - 2020.07.26  
> keyworkd - Kubernetes, StatefulSet, PersistentVolumeClaim, PersistentVolume  
> StatefulSet pods의 volume size를 증가시키는 방법을 정리

<br>

## Environment
* Kubernetes v1.15 이하에서 api server의 `--feature-gates` flag에 `ExpandInUsePersistentVolumes` feature가 disable인 경우
  * `ExpandInUsePersistentVolumes`
    * alpha - v1.11 ~ 1.14
    * beta - v1.15 ~
* Kubernetes v1.8 이상에서 `ExpandPersistentVolumes` feature가 enable인 경우
  * `ExpandPersistentVolumes`
    * alpha - v1.8 ~ 1.10
    * beta - v1.11 ~

<br>

> `ExpandPersistentVolumes`, `ExpandInUsePersistentVolumes` feature로 volume size 확장은 가능하나 축소는 불가능  
> volume size 축소는 원하는 size의 volume을 만들고, data migration 필요

<br>

## TL;DR
1. `StorageClass`를 resizing 가능하도록 수정
2. `PersistentVolumeClaim`에서 volume size 증가
3. 모든 `StatefulSet` pods gracefully restart
4. 증가시킨 volume size를 사용하는 `StatefulSet`으로 재생성


<br>

## 1. `StorageClass`를 resizing 가능하도록 수정
* `ExpandPersistentVolumes` feature를 사용하기 위해 `StorageClass`에 `allowVolumeExpansion: true`를 설정
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
...
allowVolumeExpansion: true  # here
```


<br>

## 2. `PersistentVolumeClaim`에서 volume size 증가
```sh
$ kubectl edit pvc [PersistentVolumeClaim name]
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
...
spec:
  resources:
    requests:
      storage: 10Gi  # modify size 20Gi
```

<br>

### volume size 증가 과정
* `PersistentVolumeClaim`의 Condition이 아래와 같이 변경된다
```sh
$ kubectl describe pvc [PersistentVolumeClaim name]
...
Conditions:
  Type       Status  LastProbeTime                     LastTransitionTime                Reason  Message
  ----       ------  -----------------                 ------------------                ------  -------
  Resizing   True    Mon, 01 Jan 0001 00:00:00 +0000   Sun, 26 Jul 2020 21:38:28 +0900
```

* 잠시 후 `PersistentVolume`의 size가 증가한다
```sh
$ kubectl get pv -w

## As-is
pv-0   10Gi      RWO       Retain     Bound   default/pvc-test default-storage-class       0s

## To-be
pv-0   20Gi      RWO       Retain     Bound   default/pvc-test default-storage-class       0s
```

* `PersistentVolumeClaim`의 size에는 변화가 없고, Condition이 아래와 같이 변경된다
```sh
$ kubectl describe pvc [PersistentVolumeClaim name]
...
Capacity:      10Gi
...
Conditions:
  Type                      Status  LastProbeTime                     LastTransitionTime                Reason  Message
  ----                      ------  -----------------                 ------------------                ------  -------
  FileSystemResizePending   True    Mon, 01 Jan 0001 00:00:00 +0000   Thu, 26 Jul 2020 21:45:38 +0900   Waiting for user to (re-)start a pod to finish file system resize of volume on node.
```

* Container의 file system에서 volume size 변경을 확인
```sh
$ kubectl exec -it [Pod name] -- df -h

Filesystem                Size      Used Available Use% Mounted on
/dev/nvme4n1             10.0G    367.2M     9.6G   1% /data
```
* 아직 file system에는 volume size가 반영되지 않음을 확인할 수 있다


<br>

## 3. 모든 `StatefulSet` pods gracefully restart
* `PersistentVolumeClaim`과 Container의 file system에 반영되려면 pod restart가 필요
```sh
## since v1.15
$ kubectl rollout restart sts [StatefulSet name]

## before v1.15
## recreate every pod gracefully after each other
$ kubectl delete pod [StatefulSet pod-0]
$ kubectl delete pod [StatefulSet pod-1]
...

## or scaling down+up real fast but this might cause downtime!
$ kubectl scale sts [StatefulSet name] --replicas 0 && kubectl scale sts [StatefulSet name] -- replicas3
```

* Pod restart 후 `PersistentVolumeClaim`의 변화를 확인할 수 있다
```sh
$ kubectl describe pvc [PersistentVolumeClaim name]
...
Capacity:      20Gi
...
```

* Container의 file system에서 volume size 변경을 확인
```sh
$ kubectl exec -it [Pod name] -- df -h

Filesystem                Size      Used Available Use% Mounted on
/dev/nvme4n1             20.0G    372.4M     19.6G   1% /data
```


<br>

## 4. 증가시킨 volume size를 사용하는 `StatefulSet`으로 재생성
* `StatefulSet`의 `spec.volumeClaimTemplates`을 수정하지 않으면 추후 생성되는 Pod는 잘못된 size의 `PersistentVolumeClaim`이 생성되기 때문에 수정 필요

### volume size 수정
```yaml
apiVersion: apps/v1
kind: StatefulSet
...
  volumeClaimTemplates:
    - spec:
        ...
        resources:
          requests:
            storage: 20Gi  // here
```

```sh
$ kubectl apply -f sts.yaml

The StatefulSet "xxxx" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', and 'updateStrategy' are forbidden
```
* 수정 사항을 반영하면 위와 같은 error message를 확인할 수 있다
* `StatefulSet`에서 수정할 수 있는 필드는 replicas, template, updateStrategy 뿐이라 `spec.volumeClaimTemplates.spec.storageClassName`는 수정 불가하므로 재생성 필요

<br>

### 실행 중인 Pods에 영향 없이 `StatefulSet` 제거 후 반영
* `StatefulSet` delete시 실행 중인 pod가 delete되지 않도록 `--cascade=false` 사용
```sh
## keep pods running
$ kubectl delete sts [StatefulSet name] --cascade=false

$ kubectl apply -f sts.yaml
```


<br>

## Conclusion
* `ExpandPersistentVolumes`가 enable된 Kubernetes v1.8 ~ 1.14에서는 번거로운 절차가 필요
* `ExpandInUsePersistentVolumes`가 enable된 Kubernetes v1.11부터는 편하게 volume size 확장이 가능하다
* volume size 축소는 확장보다 더 번거롭다


<br><br>

> #### Reference
> * [K8s raise StatefulSet volume size with low impact](https://itnext.io/k8s-raise-statefulset-volume-size-with-low-impact-33fe1e2576f6)
> * [Feature Gates - Kubernetes Docs](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates)
