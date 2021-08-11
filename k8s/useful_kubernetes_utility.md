# [k8s] Useful kubernetes utility
> date - 2021.04.23  
> keyworkd - kubernetes, kubectl, k8s, krew, kubectx, kubens  
> kubernetes cluster 사용시(deploy, secure, monitor...)에 유용한 tool 정리  

<br>

## Toc
* [krew](#krew)
* [kubectx + kubens](#kubectx-+-kubens)
* [kube-ps1](#kube-ps1)
* [kubectl-aliases](#kubectl-aliases)
* [kubectl-neat](#kubectl-neat)
* [Kubetail](#kubetail)
* [Kube No Trouble - kubent](#kube-no-trouble---kubent)


<br>

## krew
* [krew](./krew.md) 참고


<br>

## kubectx + kubens
* `kubectl config(kubectl config current-context)` command를 사용하여 context, namespace를 전환하는 것은 귀찮음이 따르지만 `kubectx`, `kubens`를 사용하면 편리하다
* kubectx - kubectl context를 관리하고 전환하는 tool
* kubens - Kubernetes namespace를 전환하는 tool

<br>

### Install
* kubectl plugins
```sh
$ kubectl krew install ctx
$ kubectl krew install ns
```
> shell completion script는 설치되지 않으니 필요하다면 다른 방법 이용

<br>

* Homebrew
```sh
$ brew install kubectx
```

<br>

### Usage
* kubectx
```sh
USAGE:
  kubectx                   : list the contexts
  kubectx <NAME>            : switch to context <NAME>
  kubectx -                 : switch to the previous context
  kubectx -c, --current     : show the current context name
  kubectx <NEW_NAME>=<NAME> : rename context <NAME> to <NEW_NAME>
  kubectx <NEW_NAME>=.      : rename current-context to <NEW_NAME>
  kubectx -d <NAME>         : delete context <NAME> ('.' for current-context)
                              (this command won't delete the user/cluster entry
                              that is used by the context)
  kubectx -u, --unset       : unset the current context

## example
$ kubectx 
oregon
minikube

$ kubectx minikube
Switched to context "minikube".

$ kubectx -
Switched to context "oregon".

$ kubectx dublin=gke_ahmetb_europe-west1-b_dublin
Context "dublin" set.
Aliased "gke_ahmetb_europe-west1-b_dublin" as "dublin".
```

<br>

* kubens
```sh
USAGE:
  kubens                    : list the namespaces
  kubens <NAME>             : change the active namespace
  kubens -                  : switch to the previous namespace
  kubens -c, --current      : show the current namespace

## example
$ kubens
default
kube-public
kube-system

$ kubens kube-system        
Context "oregon" modified.
Active namespace is "kube-system".
```

<br>

### Interactive mode
* [fzf](https://github.com/junegunn/fzf) 사용
* `fzf`를 사용하지 않으려면 `KUBECTX_IGNORE_FZF=1` environment variable을 설정
* `fzf`를 이용한 interactive mode를 유지하며 display만 필요한 경우 아래처럼 사용
```sh
$ kubectx | cat
```


<br>

## kube-ps1
* kubectl에 구성된 Kubernetes context, namespace를 prompt에 추가할 수 있는 script
* 여러 cluster 사용시 prompt에서 현재 context를 직관적으로 확인할 수 있어서 유용
```sh
$ (⎈ |minikube:default) 
```

<br>

### Install
```sh
$ brew install kube-ps1

$ cat >> ~/.zshrc << EOF
source "/usr/local/opt/kube-ps1/share/kube-ps1.sh"
PS1='$(kube_ps1)'$PS1
EOF
```


<br>

## kubectl-aliases
* kubectl에 대한 `alias`를 생성하는 script

<br>

### Install
```sh
$ curl -O https://raw.githubusercontent.com/ahmetb/kubectl-alias/master/.kubectl_aliases

$ cat >> ~/.zshrc << EOF
[ -f ~/.kubectl_aliases ] && source ~/.kubectl_aliases   
EOF
```

<br>

### Syntax explanation
| Category | Keyword | Description |
|:--|:--|:--|
| | k | kubectl |
| | sys | --namespace kube-system |
| commands | g | get |
| | d | describe |
| | rm | delete |
| | a | apply -f |
| | ak | apply -k |
| | k | kustomize |
| | ex | exec -i -t |
| | lo | logs -f |
| resources | po | pod |
| | dep | deployment |
| | ing | ingress |
| | svc | service |
| | cm | configmap |
| | sec | secret |
| | ns | namespace |
| | no | node |
| flags | oyaml | -o yaml |
| | ojson | -o json |
| | owide | -o wide |
| | all | --all or --all-namespaces depending on the command |
| | sl | --show-labels |
| | w | -w/--watch |
| value flags<br>(should be at the end) | n | -n/--namespace |
| | f | -f/--filename |
| | l | -l/--selector |

<br>

### Examples
```sh
alias k='kubectl'
alias kg='kubectl get'
alias kgpo='kubectl get pod'

alias ksysgpo='kubectl --namespace=kube-system get pod'

alias krm='kubectl delete'
alias krmf='kubectl delete -f'
alias krming='kubectl delete ingress'
alias krmingl='kubectl delete ingress -l'
alias krmingall='kubectl delete ingress --all-namespaces'

alias kgsvcoyaml='kubectl get service -o=yaml'
alias kgsvcwn='watch kubectl get service --namespace'
alias kgsvcslwn='watch kubectl get service --show-labels --namespace'

alias kgwf='watch kubectl get -f'
...
```


<br>

## kubectl-neat
* Kubernetes manifests에서 일부 정보를 제거해 readability를 향상시켜주는 tool

<br>

### Install
```sh
$ kubectl krew install neat
```

<br>

### Examples
```sh
$ kubectl get pod [pod name] -o yaml | kubectl neat

$ kubectl get pod [pod name] -o yaml | kubectl neat -o json

$ kubectl neat get -- pod [pod name] -o yaml

$ kubectl neat get -- svc -n default [service name] -o json
```


<br>

## Kubetail
* 여러 Pod의 log를 하나의 stream으로 aggregate(tail/follow)할 수 있는 script
* `kubectl logs -f`를 실행하는 것과 동일하지만 여러 Pod에 적용된다

<br>

### Install
```sh
$ brew tap johanhaleby/kubetail && brew install kubetail
```

<br>

### Examples
```sh
$ kubetail app1

$ kubetail app1 -c container1

$ kubetail app1,app2

$ kubetail "^app1|.*my-demo.*" --regex

$ kubetail app2 -c container1 -n namespace1
```


<br>

## Kube No Trouble - kubent
* Easily check your cluster for use of deprecated APIs
* cluster upgrade 전에 API version 확인하여 조치하기에 유용하다
* 리소스 배포 방법에 따라 사용되지 않는 deprecated API를 감지
  * file - local manifests(yaml, json)
  * kubectl - `kubectl.kubernetes.io/last-applied-configuration` annotation
  * Helm v2 - `Tiller` manifests(Secret, ConfigMap)
  * Helm v3 - `Helm` manifests(Secret, ConfigMap)

<br>

### Install
```sh
$ sh -c "$(curl -sSL https://git.io/install-kubent)"

>>> kubent installation script <<<
> Detecting latest version
> Downloading version 0.4.0
> Done. kubent was installed to /usr/local/bin/..
```

<br>

### Usage
* kubectl의 current-context에 대하여 `kubent`가 동작
```sh
$ ./kubent

10:58AM INF >>> Kube No Trouble `kubent` <<<
10:58AM INF version 0.4.0 (git sha 3d82a3f0714c97035c27374854703256b3d69125)
10:58AM INF Initializing collectors and retrieving data
10:58AM INF Retrieved 199 resources from collector name=Cluster
10:58AM INF Retrieved 0 resources from collector name="Helm v2"
10:58AM INF Retrieved 0 resources from collector name="Helm v3"
10:58AM INF Loaded ruleset name=custom.rego.tmpl
10:58AM INF Loaded ruleset name=deprecated-1-16.rego
10:58AM INF Loaded ruleset name=deprecated-1-22.rego
...
```

#### Use in CI
* CI에서 아래의 script로 실행
```sh
if ! OUTPUT="$(kubent)"; then       # check for non-zero return code first
  echo "kubent failed to run!"
elif [ -n "${OUTPUT}" ]; then       # check for empty stdout
  echo "Deprecated resources found"
fi
```


<br>

## kubectl-view-secret
* easy secret decoding

secret 확인시 다음의 번거로운 절차가 필요 없다
1. `kubectl get secret <secret> -o yaml`
2. Copy base64 encoded secret
3. `echo "b64string" | base64 -d `

<br>

### Install
```sh
$ kubectl krew install view-secret
```

<br>

### Usage
* print secret keys
```sh
$ kubectl view-secret <secret>

## example
$ kubectl view-secret cry-panda-mariadb

Multiple sub keys found. Specify another argument, one of:
-> mariadb-password
-> mariadb-root-password
```

* decode specific entry
```sh
$ kubectl view-secret <secret> <key>

## example
$ kubectl view-secret cry-panda-mariadb mariadb-password

8NnXey6nED
```

* decode all contents
```sh
$ kubectl view-secret <secret> -a/--all

## example
$ kubectl view-secret cry-panda-mariadb -a

mariadb-password=8NnXey6nED
mariadb-root-password=6CvYS8fqzc
```

* 다른 namespace 사용
```sh
$ kubectl view-secret <secret> -n/--namespace <namespace>
```

* 다른 context 사용
```sh
$ kubectl view-secret <secret> -c/--context <context>
```

*  다른 kubeconfig 사용
```sh
$ kubectl view-secret <secret> -k/--kubeconfig <kubeconfig>
```

* suppress info output
```sh
$ kubectl view-secret <secret> -q/--quit
```


<br>

## kubectl-whoami
* show the subject that's currently authenticated as
* OIDC provider를 통해 인증시에 subject 확인시에 유용

<br>

### Install
```sh
$ kubectl krew install whoami
```

<br>

### Usage
```sh
$ kubectl whoami

kubecfg:certauth:admin
```

* 다른 context에서 확인
```sh
$ kubectl whoami --context <context>

## example
$ kubectl whoami --context docker-desktop

kubecfg:certauth:admin
```

* service account token 사용
```sh
$ kubectl whoami --token <token>
```


<br><br>

> #### Reference
> * [Useful Tools for Better Kubernetes Development](https://blog.usejournal.com/useful-tools-for-better-kubernetes-development-87820c2b9435)
> * [ahmetb/kubectx - GitHub](https://github.com/ahmetb/kubectx)
> * [jonmosco/kube-ps1 - GitHub](https://github.com/jonmosco/kube-ps1)
> * [ahmetb/kubectl-aliases - GitHub](https://github.com/ahmetb/kubectl-aliases)
> * [itaysk/kubectl-neat - GitHub](https://github.com/itaysk/kubectl-neat)
> * [johanhaleby/kubetail - GitHub](https://github.com/johanhaleby/kubetail)
> * [doitintl/kube-no-trouble - GitHub](https://github.com/doitintl/kube-no-trouble)
> * [elsesiy/kubectl-view-secret - GitHub](https://github.com/elsesiy/kubectl-view-secret)
> * [rajatjindal/kubectl-whoami - GitHub](https://github.com/rajatjindal/kubectl-whoami)
