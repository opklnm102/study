# [k8s] krew
> date - 2021.04.19  
> keyworkd - kubernetes, kubectl, plugin, krew  
> kubectl plugin manager인 krew에 대해 정리

<br>

## krew란?
* [kubectl](https://kubernetes.io/docs/reference/kubectl/)의 plugin manager
* kubectl plugin의 검색, 설치 등을 지원
  * [Extend kubectl with plugins](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/)
  * [Kubectl plugins available - krew](https://krew.sigs.k8s.io/plugins/)
* kubectl v1.12 이상에서 사용 가능


<br>

## Install
```sh
$ brew install krew

$ echo 'export PATH="${PATH}:${HOME}/.krew/bin"' >> .zshrc
```


<br>

## Usage

### Download the plugin list
```sh
$ kubectl krew update
```

<br>

### Discover plugin
* all plugin list 확인
```sh
$ kubectl krew search
```

* plugin 검색
```sh
$ kubectl krew search [keyword]

## example
$ kubectl krew search pod
NAME                DESCRIPTION                                         INSTALLED
evict-pod           Evicts the given pod                                no
pod-dive            Shows a pod's workload tree and info inside a node  no
...
```

* plugin 상세 정보 확인
```sh
$ kubectl krew info tree
```

<br>

### Install plugin
```sh
$ kubectl krew install [plugin]

## example
$ kubectl krew install access-matrix
```

<br>

### Upgrade plugin
```sh
$ kubectl krew upgrade
```

<br>

### Uninstall plugin
```sh
$ kubectl krew uninstall [plugin]

## example
$ kubectl krew uninstall access-matrix
```

<br>

### Listing install plugin
```sh
$ kubectl krew list

access-matrix  v0.4.7
```

<br>

### Backup & restore plugin
```sh
$ kubectl krew list | tee backup.txt

$ kubectl krew install < backup.txt
```


<br><br>

> #### Reference
> * [krew.sigs.k8s.io](https://krew.sigs.k8s.io/)
> * [kubectl - Kubernetes Docs](https://kubernetes.io/docs/reference/kubectl/)
> * [Extend kubectl with plugins](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/)
> * [Kubectl plugins available - krew](https://krew.sigs.k8s.io/plugins/)
