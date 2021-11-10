# [k8s] Helmfile
> date - 2021.11.08  
> keyworkd - kubernetes, k8s, helm  
> Kubernetes에서 IaC(Infrastructure as Code)를 잘하기 위해서는 yaml 파일을 잘 관리해야하고, Git으로 관리하면 환경을 backup할 필요도 없다  
> 그러나 helm을 사용하면 values.yaml은 관리가 가능하나 helm chart에 대해서는 관리하기 어렵다  
> helm은 설치하는 환경마다 변수와 CRD/CR 관리가 필요하고, Chart의 dependency가 있어서 설치 순서가 필요할 수 있으나 code로 관리하기 어렵다  
> 이런 문제에 도움이되는 helmfile에 대해 알아보자  

<br>

## Helmfile - Deploy Kubernetes Helm Charts
* helm chart를 배포하기 위한 declarative spec
* helm chart를 사용하면 resource spec을 직접 관리하지 않아도 되고, upstream 반영이 쉽다는 장점이 있지만 한 번에 여러 chart 동시 배포와 helm release를 관리하기 어렵다는 단점을 해결할 수 있다
* [helm-diff](https://github.com/databus23/helm-diff) plugin이 필요하고, 그외 다양한 helm plugin과 함께 사용할 수 있다
* environment 별로 변수를 code로 관리 가능
* hook을 통해 chart 설치 전 CRD 설치 등 진행 가능
* 여러 chart를 한번에 관리 가능


<br>

## Install
* macOS
```sh
$ brew install helmfile

## install helm diff for helmfile diff
$ helm plugin install https://github.com/databus23/helm-diff

## install helm-secret for helmfile secrets
$ helm plugin install https://github.com/jkroepke/helm-secrets
```

* run as container
```sh
$ docker run --rm --net=host -v "${HOME}/.kube:/root/kube" -v "${HOME}/.config/helm:/root/.config/helm" -v "${PWD}:/wd" --workdir /wd quay.io/roboll/helmfile:helm3-v0.142.0 helmfile sync
```


<br>

## Usage
```sh
$ helmfile [command] [flags]
```

<br>

### Getting Started
* `helm release`를 표현하는 `helmfile.yaml`을 작성
```yaml
releases:
- name: prom-norbac-ubuntu
  namespace: prometheus
  chart: stable/prometheus
  set:
  - name: rbac.create
    value: false
```

* cluster에 동기화
```sh
$ helmfile apply
```

<br>

### sync
```sh
$ helmfile sync
```
* cluster state를 동기화
  * `helm upgrade --install` 실행
  * chart repository update
* `--file path/to/your/yaml/file`로 모든 yaml 전달 가능

<br>

### diff
```sh
$ helmfile diff
```
* manifest에 정의된 모든 chart/release에 대하여 [helm-diff](https://github.com/databus23/helm-diff)을 실행

<br>

### apply
```sh
$ helmfile apply
```
* diff를 실행하여 변경 사항이 있으면 `helmfile sync` 실행
* `--interactive`로 `helmfile sync` 전에 질의한다
* 주기적으로 실행하여 cluster의 왜곡을 자동 수정하는데 사용

<br>

### Repository
* `helm add repo`로 배포 전 repository를 추가/갱신
```yaml
repositories:
- name: stable
  url: https://charts.helm.sh/stable
- name: incubator
  url: https://charts.helm.sh/incubator
```

<br>

### Environment
* 공통 설정 사용
```sh
.
├── helmfiles.yaml
├── environments
│   ├── default.yaml
│   ├── deployment.yaml
│   ├── production.yaml
├── releases
│   ├── my-app.yaml
│   ├── my-app.yaml.gotmpl
```
```yaml
environments:  # gotmpl에 사용, 모든 release에 공유
  production:
    values:
    - ./environments/production.yaml
  development:
    values:
    - ./environments/development.yaml

releases:
- name: my-app
  namespace: my-app
  chart: my-app/my-app
  version: 1.0.0
  values:
  - ./release/my-app.yaml.gotmpl
```

* 파일 지정
```sh
.
├── helmfiles.yaml
├── environments
│   ├── default.yaml
│   ├── deployment.yaml
│   ├── production.yaml
├── releases
│   ├── my-app
│       ├── deployment.yaml
│       ├── production.yaml
```
```yaml
releases:
- name: my-app
  namespace: my-app
  chart: my-app/my-app
  version: 1.0.0
  values:
  - ./releases/my-app/{{ .Environment.Name }}.yaml
```

```sh
## ./releases/my-app/production.yaml 사용
$ helmfile -e production apply
```

<br>

### Condition
* `releases.condition` 사용
```yaml
environments:
  production:
    values:
    - dev-app:
        enabled: false

releases:
- name:
  chart: my-app/dev-app
  condition: dev-app.enabled
```

<br>

### Dependency
* `releases.needs` 사용하여 release를 위한 dependency를 표현할 수 있다
```yaml
releases:
- name: my-app
  needs:
  - my-mysql
```

<br>

### Hooks
```yaml
releases:
- name: my-app
  hooks:
  - events: ["presync"]
    showlogs: true
    command: "/bin/sh"
    args:
    - -c
    - kubectl apply --validate=false -f https://raw.githubxxxx.yaml
  values:
    - values.yaml.gotmpl
```

<br>

## Conclusion
* 모든 resource를 Helm chart로 관리하지 않으면 완전 대체는 힘들다
  * [helmify-kustomize](https://gist.github.com/mumoshu/f9d0bd98e0eb77f636f79fc2fb130690)로 kustomize -> Helm chart로 변환 가능
* helmfile의 큰 장점은 선언적 Helm chart 관리
* chart의 dependency는 `helmfile`을 통해서도 관리할수 있지만 object 간의 순서를 명시하는 것 자체가 kubernetes native하지 않다고 보인다
  * control loops를 통해 application의 init container([kubernetes-entrypoint](https://github.com/airshipit/kubernetes-entrypoint) 활용)에서 dependency check 후 실행되도록 관리하는게 더 kubernetes native 스러움


<br><br>

> #### Reference
> * [roboll/helmfile - GitHub](https://github.com/roboll/helmfile)
> * [databus23/helm-diff - GitHub](https://github.com/databus23/helm-diff)

<br>

> #### Further reading
> * [The Helmfile Best Practices Guide - GitHub](https://github.com/roboll/helmfile/blob/master/docs/writing-helmfile.md)
> * [Kubernetes Korea Group feed](https://www.facebook.com/groups/k8skr/permalink/2651428451805478/)
