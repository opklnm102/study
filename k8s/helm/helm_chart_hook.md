# [k8s] Helm Chart hook
> date - 2021.08.15  
> keyworkd - kubernetes, k8s, helm  
> helm chart hook에 대해 정리  

<br>

## Chart Hooks
```yaml
## chart 설치 후 Pod 실행
apiVersion: batch/v1
kind: Job
metadata:
...
  annotations:
    helm.sh/hook: post-install
    helm.sh/hook-weight: "1"
    helm.sh/hook-delete-policy: hook-succeeded
    ...
```
* release의 life cycle에 개입할 수 있도록 hook mechanism 제공
  * 설치 전에 ConfigMap, Secret 로드
  * 설치 후 user 등 구성
  * 업그레이드 전 data backup, 업그레이드 후 restore
  * release 제거시 순서에 따라 안전하게 제거
* 단발성 작업에는 `Job`을 사용
* hook을 구현할 수 있는 다른 리소스의 수에는 제한이 없다
* hook으로 생성하는 리소스는 release로 관리되지 않는다
  * 추후 hook GC 추가를 대비하여 `helm.sh/resource-policy: keep` 설정으로 제거되지 않도록 설정할 수 있다
  * `helm uninstall`로 hook 리소스를 제거할 수 없고, `helm.sh/hook-delete-policy`나 [TTL](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/)을 설정하여 제거해야 한다

<br>

### `pre-install`, `post-install` hook 추가시

#### As-is
1. 유저가 `helm install foo` 실행
2. Helm library install API call
3. library는 몇 가지 확인 후 template rendering
4. library는 결과 리소스를 kubernetes에 로드
5. library는 release object(and other data)를 client에 반환
6. client exits

#### To-be
1. 유저가 `helm install foo` 실행
2. Helm library install API call
3. `crds/`에 CRDs 설치
4. library는 몇 가지 확인 후 template rendering
5. library는 `pre-install` hook을 kubernetes에 로드하여 hook 실행을 준비
6. library는 hook를 weight, kind, name을 기준으로 오름차순으로 정렬
7. library는 가장 낮은 weight를 가진 hook을 로드
8. library는 hook이 `Ready`될 떄까지 기다림
9. library는 결과 리소스를 kubernetes에 로드
  * `--wait`가 설정되면 모든 리소스가 준비될 떄 까지 대기, `post-install`을 실행하지 않는다
10. library는 `post-install` hook을 실행(hook 리소스 로드)
11. library는 hook이 `Ready`될 떄까지 기다림
12. library는 release object(and other data)를 client에 반환
13. client exits

<br>

### hook `Ready`의 의미는?
* hook에 선언된 리소스에 따라 다르다
* kind `Job`, `Pod`라면? 
  * 성공적으로 실행되어 완료될 떄까지 대기
  * hook이 실패하면 release가 실패
  * blocking operation으로 helm client는 pause 상태
* 다른 `kind`라면?
  * kubernetes에 로드 즉시 `Ready` 표시
  * hook에 많은 리소스가 선언되면 리소스가 순차적으로 실행


<br>

## Annotation
| Annotation | Description |
|:--|:--|
| helm.sh/hook | 어떤 시점에 hook을 동작시킬지 지정 <br>`,`로 여러 life cycle 지정 |
| helm.sh/hook-weight | 실행 우선 순위 지정(string) |
| helm.sh/hook-delete-policy | hook 삭제 조건 지정 |

<br>

### The Available Hooks
* `helm.sh/hook`의 종류

| Annotation Value | Description |
|:--|:--|
| pre-install | Executes after templates are rendered, but before any resoruces are created in Kubernetes |
| post-install | Executes after all resources are loaded into Kubernetes |
| pre-delete | Executes on a deletion request before any resources are deleted from Kubernetes |
| post-delete | Executes on a deletion request after all of the release's resources have been deleted |
| pre-upgrade | Executes on an upgrade request after templates are rendered, but before any resources are updated |
| post-upgrade | Executes on an upgrade request after all resources have been upgraded |
| pre-rollback | Executes on a rollback request after templates are rendered, but before any resources are rolled back |
| post-rollback | Executes on a rollback requet after all resources have been modified |
| test | Executes when the Helm test subcommand is invoked ([view test docs](https://helm.sh/docs/topics/chart_tests/)) |

<br>

### Hook deletion policies
* hook을 삭제할 시기를 `helm.sh/hook-delete-policy`로 설정
```yaml
annotations:
  helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
```

| Annotation Value | Description |
|:--|:--|
| before-hook-creation | Delete the previous resource before a new hook is launched(default) |
| hook-succeded | Delete the resource after the hook is successfully executed |
| hook-failed | Delete the resource if the hook failed during execution |


<br>

## Writing a Hook
```yaml
## templates/post-install-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}"
  labels:
    app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
    app.kubernetes.io/instance: {{ .Release.Name | quote }}
    app.kubernetes.io/version: {{ .Chart.AppVersion }}
    helm.sh/chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
  annotations:
    helm.sh/hook: post-install
    helm.sh/hook-weight:  "-5"
    helm.sh/hook-delete-policy: hook-succeeded
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}"
      labels:
        app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
        app.kubernetes.io/instance: {{ .Release.Name | quote }}
        helm.sh/chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
    spec:
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: alpine:3.3
        command: ["/bin/sleep", "{{ default "10" .Values.sleepyTime }}"]
```

* chart upgrade
```sh
$ helm upgrade [release name] [chart name] [flags]

## example
$ tree .
.
├── templates
│   ├── NOTES.txt
│   ├── post-install-job.yaml
...

$ helm upgrade chart-hook-demo . -i -f values.yaml
```

<br>

## Conclusion
* release의 life cycle에서 필요한 작업 선언에는 `helm chart hook`을 유용하게 사용할 수 있다

<br><br>

> #### Reference
> * [Chart Hooks - Helm Docs](https://helm.sh/docs/topics/charts_hooks/)
