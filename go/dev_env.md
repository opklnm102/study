# [Go] go 개발 환경 구축하기
> date - 2017.05.14  
> keyword - go, develop environment  
> Go 개발 환경 구축하는 법을 정리

<br>

## Install go

### Ubuntu

#### apt-get
```sh
$ sudo apt-get install golang-go

# 안돼면 다시 시도
$ sudo apt-get install golang-1.8-go

# ubuntu 16.04 LTS고 위의 방법으로 설치할 수 없는 경우
$ sudo add-apt-repository ppa:longsleep/golang-backports
$ sudo apt-get update
$ sudo apt-get install golang-go

$ go version  # version check
```

#### 최신 버전은 직접 설치!
```sh
$ sudo apt-get update
$ sudo apt-get -y upgrade

# Download the package
$ wget https://storage.googleapis.com/golang/go1.7.1.linux-amd64.tar.gz

# extract the package
$ sudo tar -zxvf go1.7.1.linux-amd64.tar.gz -C /usr/local/

# Added by Go Path
$ echo 'export GOROOT=/usr/local/go' >> ~/.bashrc
$ echo 'export GOPATH=$HOME/go' >> ~/.bashrc
$ echo 'export PATH=$PATH:$GOROOT/bin:$GOPATH/bin' >> ~/.bashrc
$ exec SHELL

$ go version  # version check
$ go env  # 환경변수 확인
```

<br>

### macOS
```sh
$ brew install go
```

<br>

## Go workspace
* Go는 **단일 workspace**를 사용
* 하나의 workspace에서 다수의 VCS(e.g. git) repository를 포함
* 각 repository는 하나 이상의 package로 구성
* 각 package는 단일 디렉토리 내에 하나 이상의 `.go`로 구성
* package의 디렉토리 경로 자체가 `import` 경로를 결정
* project마다 별도의 workspace가 있고, workspace가 VCS repository에 밀접하게 연결된 다른 언어들과는 다르다

<br>

### GOROOT
* go binary에 default GOROOT가 지정되어 있다
* brew로 설치한 경우
```sh
$ go env GOROOT
/usr/local/opt/go/libexec
```

* 설치 디렉토리를 변경하는 경우 GOROOT 수정 필요
* `$GOROOT/bin`에 go, godoc, gofmt 등 binary가 있으므로 편의를 위해 `$PATH`에 추가

<br>

### GOPATH
* Go code를 관리할 **단일 workspace의 경로를 지정**
* 어디든 상관 없지만 GOROOT는 불가
* 반드시 설정 필요
```sh
export GOPATH=$HOME/dev  # or GOPATH=$HOME
export PATH=$PATH:$GOPATH/bin  # go로 만든 CLI tool이 위치하므로 편의상 추가
```

#### GOPATH 살펴보기
```sh
$ tree $GOPATH

/Users/huekim/dev
├── bin  # command executable
│   ├── gocode
│   └── ...
├── pkg
│   ├── darwin_amd64
│   ├── dep
│   └── mod
└── src  # go source code
    ├── cloud.google.com
    │   └── go
    └── github.com
        └── kubernetes
```

<br>

### go get
* git 등 source code repository를 직접 참조하여 **외부 패키지를 GOPATH에 설치**
```
$ go get github.com/kubernetes/kubernetes
```
* `.git` 등의 VCS(Version Control System) 버전 관리 이력도 함께 설치된다
* git repository의 경우 `git clone`과 동일
* repository 생성시 `$GOPATH/src/{Repository FQDN}/{Repository Path}`의 규칙을 지켜야 한다


<br>

## Hello world 찍어보기

### 1. main.go 작성
```sh
$ mkdir hello
$ cd hello
$ vi main.go
```

```go
// main.go
package main

import "fmt"

func main() {
    fmt.Println("hello, 안녕")
}
```

### 2. build
```sh
$ go build
$ ./hello  # run

# result
hello, 안녕
```


<br><br>

> #### Reference
> * [go github wiki](https://github.com/golang/go/wiki/Ubuntu)  
> * [Getting Started](https://golang.org/doc/install)
> * [Go With Peter Bourgon](http://howistart.org/posts/go/1/)
