# [k8s] Using multiple versions of kubectl
> date - 2023.10.25  
> keyworkd - kubernetes, kubectl  
> 여러 버전의 Kubernetes cluster를 관리할 때 [Version Skew Policy](https://kubernetes.io/releases/version-skew-policy) 때문에 여러 버전의 kubectl이 필요하기 때문에 여러 버전의 kubectl을 사용하는 방법을 정리  

<br>

## kuberlr
* [kuberlr(kube-ruler)](https://github.com/flavio/kuberlr)는 kubectl을 위한 simple wrapper
* [GitHub Release](https://github.com/flavio/kuberlr/releases)에서 binary download 후 `kubectl`이라는 symlink 생성하면 cluster에 맞는 kubectl을 가져와서 사용
```sh
$ curl -L -o kuberlr.tar.gz https://github.com/flavio/kuberlr/releases/download/v0.4.4/kuberlr_0.4.4_darwin_all.tar.gz \
  && tar xzvf kuberlr.tar.gz 

$ cp kuberlr /bin/
$ ln -s ~/bin/kuberlr ~/bin/kubectl
```


<br>

## asdf-kubectl
* [asdf-kubectl](https://github.com/asdf-community/asdf-kubectl) 사용하여 특정 directory 마다 여러 버전 사용 가능
* [asdf](../build/asdf.md)가 설치 필요
```sh
# install kubectl plugin for asdf
$ asdf plugin-add kubectl https://github.com/asdf-community/asdf-kubectl.git

# fetch latest kubectl 
$ asdf install kubectl latest
$ asdf global kubectl latest

# test results of latest kubectl 
$ kubectl version --short --client 2> /dev/null
```

<br><br>

> #### Reference
> * [flavio/kuberlr - GitHub](https://github.com/flavio/kuberlr)
> * [asdf-community/asdf-kubectl - GitHub](https://github.com/asdf-community/asdf-kubectl)
