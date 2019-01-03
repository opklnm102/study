# [Go] About glide
> date - 2018.11.02  
> keyword - go, dependency management  
> [aws-alb-ingress-controller](https://github.com/kubernetes-sigs/aws-alb-ingress-controller) 1.0-alpha.3의 코드를 읽기 위해 
project 설정 중에 glide가 필요해서 설치 및 사용법에 대해 정리  
> repository에도 나와 있듯이 glide -> dep으로 전환을 권장하고, 현재 vgo라는 새로운 dependency management tool이 실험중에 있다  
> aws-alb-ingress-controller도 최신 버전인 1.0-beta.7에서는 vgo를 사용하고 있다

<br>

## Glide란?
* Golang을 위한 Vendor Package Management Tool
  * vendor 및 vendor package를 쉽게 관리할 수 있다
  * vendor package간 종속성 관리
* go 1.5부터 project마다 vendor directory를 가질 수 있다
* [Semantic Versioning 2.0.0](https://semver.org/) 지원
* 성능을 위해 repository caching, data caching 지원


### Project 구조
```
- $GOPATH/src/myProject (Your project)
  |-- glide.yaml
  |-- glide.lock
  |-- main.go (Your main go code can live here)
  |-- mySubpackage (You can create your own subpackages, too)
  |    |-- foo.go
  |-- vendor
       |-- github.com
            |-- Masterminds
                  |-- ... etc.
```

### work flow
* `glide create(or init)`으로 workspace를 생성
  * project scan 후 glide.yaml 생성
* `glide install`로 vendor 디렉토리 생성 및 package download되고 glide.lock 생성

<br>

## Install
```sh
# macOS 기준
$ curl https://glide.sh/get | sh # or brew install glide
```

<br>

## Usage

### dependency management 시작하기
* `glide.yaml`이 생성된다
```sh
$ glide crate

[INFO]  Generating a YAML configuration file and guessing the dependencies
[INFO]  Attempting to import from other package managers (use --skip-import to skip)
[INFO]  Scanning code to look for dependencies
...
```

<br>

### dependency package 설치
* glide.yaml에서 관리되는 dependency package 설치
```sh
$ glide install 

...
[INFO]  --> Fetching updates for golang.org/x/text
[INFO]  --> Setting version for golang.org/x/text to 2910a502d2bf9e43193af9d68ca516529614eed3.
[ERROR] Failed to retrieve a list of dependencies: Error resolving imports
```

> 위와 같은 error가 있는데 [glide get did not fetch recursive dependencies #468](https://github.com/Masterminds/glide/issues/468)를 보면 여전히 해결되지 않았고 포기하고 dep으로 migration하는 분위기인듯...  
> 점점 알 필요가 없어지는듯....

<br>

### dependency package 추가
* `glide.yaml`에 추가된다
```sh
$ glide get <package>

# example
$ glide get github.com/aws/aws-sdk-go/aws
[INFO]  Preparing to install 1 package.
[INFO]  Attempting to get package github.com/aws/aws-sdk-go/aws
...
```


<br><br>

> #### Reference
> * [Glide: Vendor Package Management for Golang](https://github.com/Masterminds/glide)
