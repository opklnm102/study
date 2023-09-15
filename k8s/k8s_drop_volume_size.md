# [k8s] Kubernetes drop StatefulSet volume size with low impact
> date - 2023.09.15  
> keyworkd - Kubernetes, StatefulSet, PersistentVolumeClaim, PersistentVolume
> [Kubernetes raise StatefulSet volume size with low impact](./kubernetes_raise_statefulset_volume_size_with_low_impact.md)의 반대 상황으로 StatefulSet pods의 volume size를 감소시키는 방법을 정리

<br>

## TL;DR
* `ExpandPersistentVolumes`, `ExpandInUsePersistentVolumes` feature로 volume size 확장은 가능하나 축소는 불가능  
* volume size 축소 process
  * 원하는 size volume 생성 -> data migration


## volume size 축소

### PVC volume size 축소 확인
```sh
$ kubectl patch pvc [pvc name] -p '{"spec":{"resources":{"requests":{"storage":"12Gi"}}}}'

The PersistentVolumeClaim "[pvc name]" is invalid: spec.resources.requests.storage: Forbidden: field can not be less than previous value
```
* PVC를 사용한 축소는 불가한 것을 확인

### Snapshot을 이용
TBD
