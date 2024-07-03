# [k8s] Using multiple versions of kubectl
> date - 2023.10.25  
> keyworkd - kubernetes, kubectl  
> 여러 버전의 Kubernetes cluster를 관리할 때 [Version Skew Policy](https://kubernetes.io/releases/version-skew-policy) 때문에 여러 버전의 kubectl이 필요하기 때문에 여러 버전의 kubectl을 사용하는 방법을 정리  

<br>

## kuberlr
* [kuberlr(kube-ruler)](https://github.com/flavio/kuberlr)는 kubectl을 위한 simple wrapper

<br>

### Install
* [GitHub Release](https://github.com/flavio/kuberlr/releases)에서 binary download 후 `kubectl`이라는 symlink 생성하면 cluster에 맞는 kubectl을 가져와서 사용
```sh
$ cat <<'EOF' > install_kuberlr
#!/usr/bin/env bash

# init_arch discovers the architecture for this system.
init_arch() {
  ARCH=$(uname -m)
  case $ARCH in
    armv5*) ARCH="armv5";;
    armv6*) ARCH="armv6";;
    armv7*) ARCH="arm";;
    aarch64) ARCH="arm64";;
    x86) ARCH="386";;
    x86_64) ARCH="amd64";;
    i686) ARCH="386";;
    i386) ARCH="386";;
  esac
}

# init_os discovers the operating system for this system.
init_os() {
  OS=$(echo `uname`|tr '[:upper:]' '[:lower:]')

  case "$OS" in
    # Minimalist GNU for Windows
    mingw*|cygwin*) OS='windows';;
  esac
}

download_binary() {
  curl -L -o kuberlr.tar.gz https://github.com/flavio/kuberlr/releases/download/v${VERSION}/kuberlr_${VERSION}_${OS}_${ARCH}.tar.gz \
  && tar xzvf kuberlr.tar.gz \
  && cp kuberlr_${VERSION}_${OS}_${ARCH}/kuberlr /usr/local/bin/ \
  && mv /usr/local/bin/kubectl /usr/local/bin/kubectl.tmp \
  && ln -s /usr/local/bin/kuberlr /usr/local/bin/kubectl
}

VERSION="0.4.5"  # modify version
init_os
init_arch
download_binary
EOF

$ chmod +x ./install_kuberlr
$ sudo ./install_kuberlr
```

<br>

### Usage
* check kuberlr binaries
```sh
$ kuberlr bins
system-wide kubectl binaries
No binaries found.

local kubectl binaries
+---+---------+-----------------------------------------------------+
| # | VERSION | BINARY                                              |
+---+---------+-----------------------------------------------------+
| 2 | 1.27.4  | /xxx/.kuberlr/darwin-amd64/kubectl1.27.4            |
| 3 | 1.28.8  | /xxx/.kuberlr/darwin-amd64/kubectl1.28.8            |
+---+---------+-----------------------------------------------------+
```

<br>

### Delete
* `$HOME/.kuberlr/`의 각 버전별 kubectl을 제거하면 된다
```
$ rm /xxx/.kuberlr/darwin-amd64/kubectl1.28.8
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
