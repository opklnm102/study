# [k8s] About Helm
> date - 2021.08.10  
> keyworkd - kubernetes, k8s, helm  
> helm에 대한 기초 정보와 custom chart를 만드는 방법을 정리  

<br>

## Why [Helm](https://helm.sh/)?
* Kubernetes cluster에 application을 배포해야 하는 경우 최소한 아래의 리소스 설정이 필요한데 관리하는게 쉽지 않다
  * `Secret` - DB access 등에 사용할 credentials을 위한 object
  * `ConfigMap` - externalized configuration을 위한 object
  * `Service` - networking을 위한 object
  * `PersistentVolumeClaim` - storage를 위한 object
  * `StatefulSet` - stateful application을 위한 object
  * `Deployment` - stateless application을 위한 object
* kubernetes cluster에 배포하는 방식을 단순화
  * template 기반의 chart를 사용하여 설정 파일의 중복을 제거하여 최소한의 변경으로 모든 환경에서 일관성 유지
  * commcom configuration properties를 `values.yaml`에 사전 정의하고 필요에 따라 배포시 변경
  * kubectl 명령어 사용, manifest 파일 작성에 소요되는 시간이 크게 줄어들어 생상성 향상
* public helm chart는 best practice 기반인 경우가 많아 이런 것에 고민하지 않아도 된다


<br>

## What is [Helm](https://helm.sh/)?
* **Kubernetes package manager**
  * kubernetes cluster의 application packaging & deploying tool
* charts are easy to create, version, share, and publish
  * so start using Helm and stop the copy-and-paste madness
* `kubeconfig` 파일을 기반으로 kubernetes cluster에 access
* `revision`으로 변경 사항 관리
* `Release`, `Chart`, `Values` 등 [Built-in Objects](https://helm.sh/docs/chart_template_guide/builtin_objects/) 사용 가능

<br>

## 3 Big Concepts
> Kubernetes에 `chart`를 install, installation 마다 `release`를 생성한다.
> 그리고 helm chart `repository`에서 새로운 `chart`를 찾는다

<br>

### Chart
* helm package
* kubernetes cluster에서 application을 실행하기 위한 모든 리소스를 정의
* homebrew formula, apt dpkg, yum rpm file과 같다
* `go template` 문법을 사용하여 chart를 정의한다

### Repository
* chart를 모으고(collected) 및 공유(shared)할 수 있는 저장소
* Perl의 CPAN archive, Fedora Package Database와 비슷하지만 Kubernetes package 용도

### Release
* kubernetes cluster에서 실행되는 chart의 instance
* 하나의 chart를 동일한 cluster에 여러번 설치할 수 있다
  * chart를 `helm install`할 때 마다 새로운 release 생성
  * 각각은 독립적으로 관리되고 upgrade된다


<br>

## [Installing Helm](https://helm.sh/docs/intro/install/)

### Script
* 최신 Helm을 자동으로 설치하는 script 사용
```sh
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

<br>

### Homebrew
* macOS의 package manager인 [HomeBrew](https://brew.sh/index_ko) 사용
```sh
$ brew install helm

$ helm version
```

<br>

### Helm Version Support Policy
* [Helm Version Support Policy](https://helm.sh/docs/topics/version_skew/)에서 사용하는 Kubernetes version에 적합한 Helm version을 확인하여 사용
* Helm은 이전 version과의 호환성을 보장하지 않으므로 맞추어 사용하는 것을 권장
* Helm 3부터 Kubernetes의 `n-3` version과 호환
  * e.g. Helm 3.0.0은 Kubernetes 1.16.2 client로 kubernetes와 통신하므로 Kubernetes 1.16.x ~ 1.13.x와 호환

| Helm Version | Supported Kubernete Versions |
|:--|:--|
| 3.6.x | 1.21.x ~ 1.18.x |
| 3.5.x | 1.20.x ~ 1.17.x |
| ... | ... |
| 3.0.x | 1.16.x - 1.13.x |


<br>

## Using Helm

### Finding Charts

#### helm search hub
* [Artifact Hub](https://artifacthub.io/)에서 public chart repository를 검색
```sh
$ helm search hub [keyword]

## example
$ helm search hub kafka

URL                                               	CHART VERSION	APP VERSION    	DESCRIPTION
https://artifacthub.io/packages/helm/bitnami/kafka	14.0.1       	2.8.0          	Apache Kafka is a distributed streaming platform.
https://artifacthub.io/packages/helm/bitnami-ak...	14.0.1       	2.8.0          	Apache Kafka is a distributed streaming platform.
...
```

#### helm search repo
* `helm repo add`로 추가한 repository를 검색
```sh
$ helm search repo [keyword]

## example
$ helm search repo bitnami

NAME                                        	CHART VERSION	APP VERSION  	DESCRIPTION
bitnami/bitnami-common                      	0.0.9        	0.0.9        	DEPRECATED Chart with custom templates used in ...
...
```
> `helm search`는 fuzzy string matching algorithm 사용하므로 keyword 검색 가능

<br>

### Initialize a Helm Chart Repository
#### helm repo add
* Add repository
```sh
$ helm repo add [repository name] [URI]

## example
### bitnami
$ helm repo add bitnami https://charts.bitnami.com/bitnami

### stable and force update
$ helm repo add stable https://charts.helm.sh/stable --force-update
```

#### List repository
```sh
$ helm repo list  # or repo ls

NAME   	URL
bitnami	https://charts.bitnami.com/bitnami
...
```

#### Update repository
```sh
$ helm repo update

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "stable" chart repository
...Successfully got an update from the "bitnami" chart repository
Update Complete. ⎈Happy Helming!⎈
```

#### Remove a repository
```sh
$ helm repo remove bitnami
```

<br>

### Installing a package

#### chart 정보 확인하기
```sh
$ helm show all [chart name]
$ helm show chart [chart name]
$ helm show readme [chart name]
$ helm show values [chart name]

## example
$ helm show all bitnami/mysql
```

* helm pull로 chart download를 통해 확인
```sh
$ helm pull [chart URL | chart name]

## example
$ helm pull bitnami/redis

$ ls -lrt
total 152
-rw-r--r--  1 huekim  staff  77694 Aug 10 17:53 redis-14.8.8.tgz

$ tar xvfz redis-14.8.8.tgz
x redis/Chart.yaml
x redis/Chart.lock
x redis/values.yaml
...
```

#### Install a chart
```sh
$ helm install [release name] [chart name]

## example
$ helm install happy-panda bitnami/wordpress
NAME: happy-panda
LAST DEPLOYED: Tue Jan 26 10:27:17 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
** Please be patient while the chart is being deployed **
...
```
> Helm chart를 찾고 설치하는 다양한 방법 중 `bitnami chart`를 사용하는게 가장 쉽다

* release name 자동 생성
```sh
$ helm install [chart name] --generate-name

## example
$ helm install bitnami/wordpress --generate-name
```

#### Check release status
```sh
$ helm status [release name]

## example
$ helm status happy-panda
NAME: happy-panda
LAST DEPLOYED: Fri Aug  6 00:39:56 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
...
```

#### List release
* `deployed`인 release 조회
```sh
$ helm list  # or helm ls

## example
NAME       	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART           	APP VERSION
happy-panda	default  	1       	2021-08-06 00:39:56.691864 +0900 KST	deployed	wordpress-12.0.2	5.8.0
```

* 모든 release 조회
```sh
$ helm list --all

## example
NAME       	NAMESPACE	REVISION	UPDATED                             	STATUS     	CHART           	APP VERSION
cry-panda  	default  	1       	2021-08-06 00:51:15.357296 +0900 KST	deployed   	wordpress-12.0.2	5.8.0
happy-panda	default  	1       	2021-08-06 00:48:14.921788 +0900 KST	uninstalled	wordpress-12.0.2	5.8.0
```

* `uninstalled` release 조회
```sh
$ helm list --uninstalled

## example
NAME       	NAMESPACE	REVISION	UPDATED                             	STATUS     	CHART           	APP VERSION
happy-panda	default  	1       	2021-08-06 00:48:14.921788 +0900 KST	uninstalled	wordpress-12.0.2	5.8.0
```

#### Uninstall a Release
```sh
$ helm uninstall [release name]

## example
$ helm uninstall happy-panda
```

* `--keep-history`를 사용하면 relase가 남으므로 `helm rollback`으로 제거를 취소할 수 있다
```sh
$ helm uninstall [release name] --keep-history
$ helm list --uninstalled
$ helm rollback [release name] [revision]

## example
$ helm uninstall happy-panda --keep-history

$ helm list --uninstalled
NAME       	NAMESPACE	REVISION	UPDATED                             	STATUS     	CHART           	APP VERSION
happy-panda	default  	1       	2021-08-06 00:48:14.921788 +0900 KST	uninstalled	wordpress-12.0.2	5.8.0

$ helm rollback happy-panda 1
Rollback was a success! Happy Helming!

$ helm list
NAME       	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART           	APP VERSION
happy-panda	default  	2       	2021-08-06 00:54:57.158697 +0900 KST	deployed	wordpress-12.0.2	5.8.0
```

<br>

### Customizing the Chart before installing
#### 1. chart에서 설정 가능한 값 확인
```sh
$ helm show values [chart name]

## example
$ helm show values bitnami/wordpress
```

#### 2. chart의 설정을 override하여 helm install
* `--values` or `-f`로 `yaml` file을 사용
```sh
$ helm install -f [yaml file] [chart name]

## example
$ echo '{maridb.auth.database" user0db, mariadb.auth.username: user0}' > values.yaml
$ helm install -f values.yaml bitnami/wordpress --generate-name
```

* `--set`으로 CLI argument 사용
> 다양한 case를 표현할 수 없으므로 `-f` 사용 추천
```yaml
# helm install --set name=value
name: value

# helm install --set a=b,c=d
key1: value1
key2: value2

# helm install --set outer.inner=value
outer:
  inner: value

# helm install --set name={a, b, c}
name:
  - a
  - b
  - c

# helm install --set servers[0].port=80,servers[0].host=example
servers:
  - port: 80
    host: example

# helm install --set name=value1\,value2
name: "value1,value2"

# helm install --set nodeSelector."kubernetes\.io/role"=master
nodeSelector:
  kubernetes.io/role: master
```

#### 3. 적용된 설정 확인
```sh
$ helm get values [release name]

## example
$ helm get values happy-panda
USER-SUPPLIED VALUES:
mariadb.auth.username: user1
...
```

<br>

### Upgrading a Release, and Recovering on Failure

#### helm upgrade
* chart의 new version 적용 or release의 configuration 변경시 사용
* 이전 release에서 변경된 부분만 적용한다
```sh
$ helm upgrade [release name] [chart name] -f [yaml file]

## example
$ helm upgrade happy-panda bitnami/wordpress -f values.yaml
```

* 변경 사항을 `dry-run`을 통해 미리 확인 후 upgrade 하자!
```sh
$ helm upgrade [release name] [chart name] --dry-run --debug

## example
$ helm upgrade helm-demo ./helm-demo -i --dry-run --debug
...
```
* `-i`, `--install` - upgrade 대상이 없으면 install


#### helm rollback
* `revision` 확인
```sh
$ helm history [release name]

## example
$ helm history happy-panda

REVISION	UPDATED                 	STATUS     	CHART           	APP VERSION	DESCRIPTION
1       	Fri Aug  6 00:48:14 2021	uninstalled	wordpress-12.0.2	5.8.0      	Uninstallation complete
2       	Fri Aug  6 00:54:57 2021	superseded 	wordpress-12.0.2	5.8.0      	Rollback to 1
3       	Fri Aug  6 12:49:51 2021	deployed   	wordpress-12.0.2	5.8.0      	Upgrade complete
```

* rollback
```sh
$ helm rollback [release name] [revision]

## example
$ helm rollback happy-panda 2
```

<br>

### Create a custom helm chart
* chart에서 사용되는 초기 구성 및 chart direcotry 생성
```sh
$ helm create [chart name]

## example
$ helm create helm-demo
```

#### chart directory structure
```
.
├── .helmignore  # chart packaging에서 제외할 파일 패턴
├── Chart.yaml  # chart의 정보(name, version...)
├── charts  # chart의 의존성 정의(e.g. MySQL chart repo link 등)
├── templates  # kubernetes manifest template file
│   ├── NOTES.txt  # chart 배포 후 print할 내용
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── service.yaml
│   ├── serviceaccount.yaml
│   └── tests  # test files
│       └── test-connection.yaml
└── values.yaml  # template에서 사용할 default values
```
* [templates](https://helm.sh/docs/chart_best_practices/templates/)
  * `go template` 문법을 사용해 `values.yaml`의 값을 읽어 주입하여 실행할 수 있다


### Edit chart
```yaml
## deployments.yaml
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "helm-demo.selectorLabels" . | nindent 6 }}

+

## values.yaml
replicaCount: 1
autoscaling:
  enabled: false

+

## _helpers.tpl
{{/*
Selector labels
*/}}
{{- define "helm-demo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "helm-demo.name" . }}
{{- end }}

## Result
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: helm-demo
```
* `{{}}`로 값을 치환
  * `{{ .Values.replicaCount }}`는 values.yaml의 replicaCount로 치환하라는 의미
* `{{- include "helm-demo.selectorLabels" . | nindent 6 }}`
  * `templates/_helpers.tpl`에 정의된 template을 include
* `{{/* comment */}}` - 주석
* `define`으로 template 정의
* `{{-`
  * `{{}}`가 차지하는 공백을 제거
  * `.` - values.yaml의 모든 값을 argument로 사용
  * `|` - pipeline
  * `nindent 6` - 결과 print시 indent 6 적용

#### Condition
* `{{- if}}`, `{{- if not}}`, `{{end}}`으로 조건에 따라 설정 가능
```yaml
{{- if not .Values.autoscaling.enabled }}
...
{{- end }}
```

* 하나의 template을 사용하고, 필요에 따라 별도의 `values.yaml` 사용

```yaml
## values.yaml
environment: production

## staging.values.yaml
environment: staging

## development.values.yaml
environment: development

---
{{- if or (eq .Values.environment "production") (eq .Values.environment "staging") }}
  enable_tracing: true
{{- end }}
```

#### with
* 해당 key 아래의 값들을 사용
```yaml
...
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```
* `{{- toYaml key}}` 그대로 yaml로 출력

<br>

### helm template
* template rendering 결과 확인
```sh
$ helm template [NAME] [CHART] [flags]

## example
$ helm template bitnami/redis | more
---
# Source: redis/templates/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
automountServiceAccountToken: true
metadata:
  name: RELEASE-NAME-redis
  namespace: "default"
  labels:
    app.kubernetes.io/name: redis
    helm.sh/chart: redis-14.8.8
    app.kubernetes.io/instance: RELEASE-NAME
    app.kubernetes.io/managed-by: Helm
...
```

<br>

### helm lint
* 작성한 chart를 검증
```sh
$ helm lint [path]

## example
$ helm lint
==> Linting .
[INFO] Chart.yaml: icon is recommended

1 chart(s) linted, 0 chart(s) failed
```

<br>

### helm package
* 배포를 위해 chart packaging
```sh
$ helm package [path]

## example
$ helm package .
Successfully packaged chart and saved it to: /.../helm-demo/helm-demo-0.1.0.tgz
```


<br>

## [Helm Plugins](https://helm.sh/docs/community/related/#helm-plugins)
helm과 함께 사용하면 유용한 plugin들이 있다

* [helm-diff](https://github.com/databus23/helm-diff)
  * preview `helm upgrade` as a coloured diff
  * 배포 전 CI에서 실행하여 변경 사항 파악에 용이
* [helm-monitor](https://github.com/ContainerSolutions/helm-monitor)
  * Prometheus/Elasticsearch query 기반의 release/rollback monitoring
* [helm-unittest](https://github.com/quintush/helm-unittest)
  * `yaml`을 사용하여 local에서 chart unit testing
* [hc-unit](https://github.com/xchapter7x/hcunit)
  * `OPA(Open Policy Agent)`와 `Rego`를 사용하여 local에서 chart unit testing


<br>

## Conclusion
* kubernetes cluster에 application 배포를 `helm`을 사용하여 단순화할 수 있어서 사용해보기를 추천한다


<br><br>

> #### Reference
> * [Quickstart Guide - Helm Docs](https://helm.sh/docs/intro/quickstart/)
> * [Using Helm - Helm Docs](https://helm.sh/docs/intro/using_helm/)
> * [How to create your first custom Helm Chart](https://devops4solutions.com/how-to-create-your-first-custom-helm-chart/)

<br>

> #### Further reading
> * [Deploy Kubernetes resources and packages using Amazon EKS and a Helm chart repository in Amazon S3 - AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-kubernetes-resources-and-packages-using-amazon-eks-and-a-helm-chart-repository-in-amazon-s3.html)
> * [Deploy a Go Application on Kubernetes with Helm](https://docs.bitnami.com/tutorials/deploy-go-application-kubernetes-helm/)
> * [Best Practices - Helm Docs](https://helm.sh/docs/chart_best_practices/conventions/)
