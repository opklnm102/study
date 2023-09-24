# [k8s] Cleaning up unnecessary resources in the cluster and optimizing for unnecessary time zones
> date - 2023.09.23  
> keyworkd - Kubernetes, cost optimization, finops  
> cluster의 불필요한 자원 정리 및 불필요한 시간대에 최적화에 대한 내용 정리  

<br>

## TL;DR
* test 등의 용도로 생성한 리소스를 정리 등 불필요한 리소스 정리가 필요할 때는 [kube-janitor](#kube-janitor) 사용
* [CronJob 일시 중지](#cronjob-일시-중지로-최적화)로 불필요한 시간대에 CronJob 리소스 사용 일시 중지
* [kube-green](#kube-green)을 이용해 밤과 같이 불필요한 시간대에 리소스 종료


<br>

## kube-janitor
* TTL(Time To Live) or expiry date(timestamp)에 따라 k8s resource를 정리
* CRD를 포함한 모든 namespace의 리소스를 처리
* 아래 annotation으로 리소스 식별
  * TTL - janitor/ttl
  * expiry date - janitor/expires
* CI/CD pipeline에서 annotation을 추가하는게 좋으며 아래 명령어로 수동 설정 가능
```sh
$ kubectl annotate deploy nginx janitor/ttl=24h
$ kubectl annotate deploy nginx janitor/expires=2020-01-01
```
* rule 파일로 global 옵션 지정
  * unused PVC 정리 - `jmespath: "_context.pvc_is_not_mounted && _context.pvc_is_not_referenced"`

<br>

### Usage
* [코드](https://github.com/opklnm102/eks-demo/tree/main/addons/kube-janitor) 참고
* 제거하려는 리소스에 `janitor/ttl=24h`, `janitor/expires=2020-01-01` 같은 annotation을 설정하거나 아래와 같은 global rule로 설정
```yaml
# example rules configuration to set TTL for arbitrary objects
# see https://codeberg.org/hjacobs/kube-janitor for details
rules:
    # delete all namespaces with a name starting with "test-*"
  - id: temporary-test-namespaces
    resources:
      - "*"
    jmespath: "starts_with(metadata.name, 'test')"
    ttl: 4d

  # delete all PVCs which are not mounted and not referenced by StatefulSets
  - id: remove-unused-pvcs
    resources:
      - persistentvolumeclaims
    jmespath: "_context.pvc_is_not_mounted && _context.pvc_is_not_referenced"
    ttl: 7d
```


<br>

## CronJob 일시 중지로 최적화
* 업무 시간 외에는 CronJob 실행이 필요하지 않은 경우 일시 중지할 수 있다

### CronJob 일시 중지
* `CronJob`을 일시 중지해야할 경우 `.spec.suspend`를 true로 수정
```sh
$ kubectl patch cj <Cronjob> -p '{"spec":{"suspend":true}}'
```

<br>

### 일시 중지 해제
* schedule된 시간 동안 일시 중지되었다면 누락된 job으로 간주되어 `CronJob` 일시 중지 해제시 즉시 실행되므로 주의 필요
* 위와 같이 상황을 피하기 위해서는 `CronJob`을 제거하고 재생성해야한다
```sh
$ kubectl patch cj <Cronjob> -p '{"spec":{"suspend":false}}'
```

<br>

### 모든 namespace에 적용
* CronJob 일시 중지
```sh
#!/usr/bin/env bash

for namespace in $(kubectl get ns -o=jsonpath='{.items[*].metadata.name}'); do
  for cronjob in $(kubectl get cronjob -n "${namespace}" -o name); do
    kubectl patch -n "${namespace}" -p '{"spec":{"suspend":true}}' "${cronjob}"
  done
done
```

* 일시 중지 해제
```sh
#!/usr/bin/env bash

for namespace in $(kubectl get ns -o=jsonpath='{.items[*].metadata.name}'); do
  for cronjob in $(kubectl get cronjob -n "${namespace}" -o name); do
    kubectl patch -n "${namespace}" -p '{"spec":{"suspend":false}}' "${cronjob}"
  done
done
```


<br>

## kube-green
* [CronJob 일시 중지로 최적화](#cronjob-일시-중지로-최적화)보다 더 확장된 방법으로 kube-green을 이용
* 밤과 주말 같이 사용하지 않는 시간에 낭비되는 리소스를 종료하는 add-on
  * `Deplyment`는 sleep시 replicas를 0으로 설정, wake up시에 이전 replicas로 복구
  * `CronJob`은 suspend로 설정
* sleep, wake up이 필요한 namespace에 `SleepInfo` CRD를 설정하면 된다
  * cluster-autoscaler가 동작해야 Node의 scale in/out이 동작하기 때문에 `SleepInfo`에서 cert-manager, kube-green, cluster-autoscaler, coredns 제외 필요
* namespace마다 `sleepinfo-<sleepinfo name>`라는 secret에 wake up/sleep에 관련된 상태 저장
```sh
## wake up일 때
$ kubectl view-secret sleepinfo-working-hours -a 
operation-type='WAKE_UP'
scheduled-at='2023-09-24T06:10:00Z'

## sleep일 때
$ kubectl view-secret sleepinfo-working-hours -a 
cronjobs-info='[{"name":"elastic-curator","suspend":false}]'
deployment-replicas='[{"name":"datadog-cluster-agent","replicas":2},{"name":"datadog-clusterchecks","replicas":2},{"name":"fluent-operator","replicas":2},{"name":"kube-state-metrics","replicas":1}]'
operation-type='SLEEP'
scheduled-at='2023-09-24T06:21:00Z'
```

<br>

### Install
* [cert-manager](https://github.com/cert-manager/cert-manager) 설치
```sh
$ kubectl apply -f https://github.com/jetstack/cert-manager/releases/latest/download/cert-manager.yaml

## check
$ kubectl -n cert-manager get pods
```

* kube-green operator 설치
```sh
$ kubectl apply -f https://github.com/kube-green/kube-green/releases/latest/download/kube-green.yaml
```
* [코드](https://github.com/opklnm102/eks-demo/tree/main/addons/kube-green) 참고

<br>

### Usage
* KST 기준으로 월 ~ 금 20:00에 sleep, 08:00에 wake up되므로 주말에는 sleep
```yaml
apiVersion: kube-green.com/v1alpha1
kind: SleepInfo
metadata:
  name: working-hours
spec:
  weekdays: "1-5"  # *: 매일, 1: 월, 1-5: 월 ~ 금
  sleepAt: "20:00"
  wakeUpAt: "08:00"
  timeZone: "Asia/Seoul"
  suspendCronJobs: true  # cronjob 일시 중지
  excludeRef:  # exclude
    - apiVersion: "apps/v1"
      kind: Deployment
      name: my-deployment
```

* `kube-green.dev/exclude: true` label을 가진 리소스와 do-not-suspend CronJob 제외하고 매일 20:00 sleep, 08:00 wake up
```yaml
apiVersion: kube-green.com/v1alpha1
kind: SleepInfo
metadata:
  name: working-hours
spec:
  weekdays: "*"
  sleepAt: "20:00"
  wakeUpAt: "08:00"
  timeZone: "Asia/Seoul"
  suspendCronJobs: true
  excludeRef:
    - apiVersion: "batch/v1"
      kind: CronJob
      name: do-not-suspend
    - matchLabels: 
        kube-green.dev/exclude: true
```

* 모든 namespace에 적용
```sh
#!/usr/bin/env bash

skip_namespaces=("kube-green" "cert-manager")

for namespace in $(kubectl get ns -o=jsonpath='{.items[*].metadata.name}'); do

  if [[ "${skip_namespaces[*]}" =~ ${namespace} ]]; then
    continue
  fi

  kubectl -n "${namespace}" apply -f - <<EOF
apiVersion: kube-green.com/v1alpha1
kind: SleepInfo
metadata:
  name: working-hours
spec:
  weekdays: "1-5"
  sleepAt: "22:00"
  wakeUpAt: "08:00"
  timeZone: "Asia/Seoul"
  suspendCronJobs: true
  excludeRef:
    - matchLabels:
        kube-green.dev/exclude: "true"
    - apiVersion: "apps/v1"
      kind: Deployment
      name: my-deployment
    - apiVersion: "batch/v1"
      kind: CronJob
      name: do-not-suspend
EOF
done
```


<br>

### Clean up
```sh
## cert-manager
$ kubectl delete -f https://github.com/jetstack/cert-manager/releases/latest/download/cert-manager.yaml

## kube-green operator
$ kubectl delete -f https://github.com/kube-green/kube-green/releases/latest/download/kube-green.yaml
```


<br><br>

> #### Reference
> * [kube-janitor](https://codeberg.org/hjacobs/kube-janitor)
> * [크론잡(CronJob)으로 자동화된 작업 실행](https://kubernetes.io/ko/docs/tasks/job/automated-tasks-with-cron-jobs)
> * [kube-green](https://github.com/kube-green/kube-green)
