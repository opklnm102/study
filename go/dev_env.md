# go 개발 환경 구축하기

## ubuntu golang install

### apt-get 이용하기
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

### 최신 버전은 직접 설치!
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

## macOS golang install
```sh
$ brew install go
```

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

> #### 참고자료
> [go github wiki](https://github.com/golang/go/wiki/Ubuntu)  
> [Getting Started](https://golang.org/doc/install)
> [Go With Peter Bourgon](http://howistart.org/posts/go/1/)