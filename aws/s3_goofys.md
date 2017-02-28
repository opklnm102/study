# [goofys](https://github.com/kahing/goofys)를 이용해 AWS S3 mount하기

## 1. s3, access/secret key 발급

1. 상단 메뉴의 My Security Credentials - User에서 user 생성
   * root 계정의 access key를 사용하지 않기 위해 유저를 생성하는 것
   * Access type은 Programmatic access로 끝까지 진행하면 access/secret key가 나오니 기억!

2. permissions에 들어가서 `AmazonS3FullAccess` policy를 설정
3. S3에 사용할 Bucket 생성

## 2. golang 설치 - ubuntu 기준

### apt-get 이용하기
```sh
# 2017.03.01 기준 v1.6.2임
$ sudo add-apt-repository ppa:ubuntu-lxc/lxd-stable
$ sudo apt-get update
$ sudo apt-get install golang
$ go version  # version 확인
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

$ go version  # version 확인
$ go env  # 환경변수 확인  
```

## 3. goofys 설치
* 소스를 빌드
```sh
$ mkdir -p ~/work
$ export GOPATH=$HOME/work
$ go get github.com/kahing/goofys
$ go install github.com/kahing/goofys
```

## 4. goofys 사용하기
```sh
# key설정 파일의 default path는 ~/.aws/credentials
$ mkdir -p ~/.aws
$ vim ~/.aws/credentials
[default]
aws_access_key_id = XXXXXXXX
aws_secret_access_key = XXXXX

# 확인
$ cat > ~/.aws/credentials

# mount
# $ $GOPATH/bin/goofys <bucket> <mountpoint>
# $ $GOPATH/bin/goofys <bucket:prefix> <mountpoint> # if you only want to mount objects under a prefix
$ mkdir -p ~/storage  # mount할 디렉토리 생성
$ $GOPATH/bin/goofys 9tique /storage

# mount 확인
$ df -h  
```


> 참고  
[go github wiki](https://github.com/golang/go/wiki/Ubuntu) -> 설치, 삭제 다있음  
[goofys를 이용해 AWS S3 mount 해서 사용하기](http://bluese05.tistory.com/23)  
[http://m.blog.naver.com/carrotcarrot/220680500604](http://m.blog.naver.com/carrotcarrot/220680500604)