# [k8s] kubefwd
> date - 2022.09.02  
> keyworkd - kubernetes, port forwarding  
> kubefwd에 대해 정리  

<br>

## kubefwd?
* local 개발 환경에서 여러 서비스를 대량으로 port forwarding하여 cluster의 서비스에 쉽게 접근할 수 있게 도와주는 tool
* 서비스가 노출하는 port와 동일한 port를 local 환경의 loopback IP address(127.0.0.1)에 전달
* `/etc/hosts`를 임시로 수정해 service name을 domain으로 사용할 수 있게 한다
  * `ExternalName` Service는 port forward를 할 Pod가 존재하지 않아 port forwarding이 불가능하므로 제외
* namespace의 `Service`, `Pod` 추가/제거시 자동으로 port forwarding 시작/중지


<br>

## Install
* MacOS
```sh
$ brew install txn2/tap/kubefwd
```

* Container
```sh
$ docker run -it --rm --privileged --name the-project \
             -v "$(echo $HOME)/.kube/":/root/.kube/ \
             txn2/kubefwd services -n the-project

## check
$ docker exec the-project curl -s elasticsearch:9200
```


<br>

## Usage
* `sudo` 권한 필요

<br>

### 하나의 namespace의 service port forwarding
```sh
$ sudo kubefwd svc -n [namespace]
```

<br>

### 2개의 namespace의 service port forwarding
```sh
$ sudo kubefwd svc -n [namespace 1] [namespace 2]
```


<br><br>

> #### Reference
> * [txn2/kubefwd - Bulk port forwarding Kubernetes services for local development](https://github.com/txn2/kubefwd)
> * [Kubernetes Port Forwarding for Local Development](https://imti.co/kubernetes-port-forwarding/)
> * [포트 포워딩을 사용해서 클러스터 내 애플리케이션에 접근하기](https://kubernetes.io/ko/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
