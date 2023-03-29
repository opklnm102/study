# [Container] ctr vs crictl vs nerdctl
> date - 2022.03.29  
> keyworkd - container, cri, ctr, crictl, nerdctl  
> kubernetes 1.20부터 CRI(Container Runtime Interface) 사용되며, Amazon EKS에서는 containerd를 기본 CRI로 선택  
> 그에 따라 containerd를 조작하기 위한 tool에 대해 정리  

<br>

## ctr
* containerd cli로 containerd에서 기본으로 제공

### namespace 조회
```sh
$ ctr namespaces list  # or ctr ns ls

NAME   LABELS
k8s.io
```

<br>

### container 조회
* docker ps와 동일
```sh
$ ctr -n k8s.io container list  # ctr -n k8s.io c ls
```

<br>

### image 조회
* docker image ls와 동일
```sh
$ ctr -n k8s.io image list  # or ctr -n k8s.io i ls
```


<br>

## crictl
* `ctr`은 docker cli와는 다른 인터페이스라 익숙하지 않을 수 있다
* docker, ctr과 달리 CRI(Container Runtime Interface)를 준수하는 container runtime에서 사용 가능
  * [containerd](https://containerd.io), [CRI-O](https://cri-o.io)

<br>

### Install
```sh
VERSION="v1.26.0" # check latest version in /releases page
curl -L https://github.com/kubernetes-sigs/cri-tools/releases/download/$VERSION/crictl-${VERSION}-linux-amd64.tar.gz --output crictl-${VERSION}-linux-amd64.tar.gz
sudo tar zxvf crictl-$VERSION-linux-amd64.tar.gz -C /usr/local/bin
rm -f crictl-$VERSION-linux-amd64.tar.gz
```

<br>

### Usage
```sh
$ crictl  [global options] command [command options] [arguments...]
```

* container 조회
```sh
$ crictl ps
```

* image 조회
```sh
$ crictl image
```

* pod 조회
```sh
$ crictl pods
```


<br>

## nerdctl
* ctr과 다르게 docker CLI 명령어에 대한 호환성을 유지하는 containerd CLI

<br>

### Install
* macOS or linux
```sh
$ brew install nerdctl
```

<br>

### Usage
* docker 명령어와 같다


<br>

## nerdctl vs crictl
* containerd cli로 crictl, nerdctl이 있는데 nerdctl은 containerd를 지원하지만 crictl은 CRI를 지원하므로 container runtime을 CRI-O 등으로 변경할 때의 일관성 있는 경험 유지를 위해 crictl 사용하는걸 추천


<br><br>

> #### Reference
> * [Client CLI](https://github.com/projectatomic/containerd/blob/master/docs/cli.md)
> * [crictl](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)
> * [Debugging Kubernetes nodes with crictl](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl)
> * [nerdctl: Docker-compatible CLI for containerd](https://github.com/containerd/nerdctl)
