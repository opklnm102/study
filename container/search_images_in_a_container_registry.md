# [Container] Search images in a container registry like registry.k8s.io
> date - 2024.07.30  
> keyword - container registry
> Docker Hub 같이 Web UI를 제공하지 않는 registry.k8s.io 등 에서 image 검색하는 방법 정리  

<br>

* [Registry Explorer](https://explore.ggcr.dev/), [crane](https://github.com/google/go-containerregistry/blob/main/cmd/crane/README.md), [gcrane](https://github.com/google/go-containerregistry/blob/main/cmd/gcrane/README.md)을 사용

## crane
* remote image, registries와 상호작용하기 위한 tool로 gcr.io의 명령어가 추가된 [gcrane](https://github.com/google/go-containerregistry/blob/main/cmd/gcrane/README.md)도 있다

<br>

## Install
* brew
```sh
$ brew install crane
```

* container image
```sh
## crane
$ docker run --rm gcr.io/go-containerregistry/crane ls ubuntu

## gcrane
$ docker run --rm gcr.io/go-containerregistry/gcrane ls --json registry.k8s.io/e2e-test-images/jessie-dnsutils

## usage shell - crane
$ docker run --rm -it --entrypoint "/busybox/sh" gcr.io/go-containerregistry/crane:debug

## usage shell - gcrane
$ docker run --rm -it --entrypoint "/busybox/sh" gcr.io/go-containerregistry/gcrane:debug
```


<br>

## Usage
* `registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3`를 찾아보자

### [search repository](https://explore.ggcr.dev/?repo=registry.k8s.io)
```sh
$ curl -sL "https://registry.k8s.io/v2/tags/list" | jq .
{
  "name": "k8s-artifacts-prod/images",
  "child": [
    "addon-builder",
    "addon-manager",
    "addon-resizer",
    "addon-resizer-amd64",
    "addon-resizer-arm",
    ...
  ]
}
```

<br>

### [search image](https://explore.ggcr.dev/?repo=registry.k8s.io%2Fe2e-test-images)
```sh
$ gcrane ls --json registry.k8s.io/e2e-test-images | jq .

{
  "name": "k8s-artifacts-prod/images/e2e-test-images",
  "child": [
    "agnhost",
    "apparmor-loader",
    ...
  ],
  ...
}
```

<br>

### [search version](https://explore.ggcr.dev/?repo=registry.k8s.io%2Fe2e-test-images%2Fjessie-dnsutils)
```sh
$ gcrane ls --json registry.k8s.io/e2e-test-images/jessie-dnsutils | jq .

{
  "name": "k8s-artifacts-prod/images/e2e-test-images/jessie-dnsutils",
  "tags": [
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.7",
    "sha256-24aaf2626d6b27864c29de2097e8bbb840b3a414271bf7c8995e431e47d8408e.sig"
  ]
}
```


<br><br>

> #### Reference
> * [Registry Explorer](https://explore.ggcr.dev/)
> * [crane](https://github.com/google/go-containerregistry/blob/main/cmd/crane/README.md)
> * [gcrane](https://github.com/google/go-containerregistry/blob/main/cmd/gcrane/README.md)
