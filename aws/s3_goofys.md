# [goofys](https://github.com/kahing/goofys)를 이용해 AWS S3 mount하기

## 1. s3, access/secret key 발급

1. 상단 메뉴의 My Security Credentials - User에서 user 생성
   * root 계정의 access key를 사용하지 않기 위해 유저를 생성하는 것
   * Access type은 Programmatic access로 끝까지 진행하면 access/secret key가 나오니 기억!

2. permissions에 들어가서 `AmazonS3FullAccess` policy를 설정
3. S3에 사용할 Bucket 생성
   * `Any authenticated AWS user`에 access permissions 설정

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

# 특정 유저, 그룹 권한으로 mount
$ $GOPATH/bin/goofys --uid <uid> --gid <gid> <bucket> <mountpoint>

# mount 확인
# mount 안될 때 S3 Bucket Any Authenticated AWS에 권한 설정하고 다시 시도
$ df -h  
```

### 웹브라우저에서 이미지를 보려면
* allow_other, acl 설정
* 안하면 `Access Denied`라고 뜬다
```sh
$ $GOPATH/bin/goofys -o allow_other <bucket> <mountpoint>

# invalid argument라고 뜰 때
# fuse에 allow_other 옵션 활성화
$ sudo vim /etc/fuse.conf
# user_allow_other 옵션에 주석 제거 후 acl option 추가
# $ $GOPATH/bin/goofys -o allow_other --acl <option> <bucket> <mountpoint>
$ $GOPATH/bin/goofys -o allow_other --acl public-read <bucket> <mountpoint>
```

### Un mount
```sh
$ fusermount -u <mountpoint>
```

### 자동 마운트
```sh
$ vi /etc/fstab

# 아래 내용 추가
<goofys path>#<bucket> <mountpoint> fuse _netdev,allow_other,--file-mode=0666 0 0
```

> 참고  
[go github wiki](https://github.com/golang/go/wiki/Ubuntu) -> 설치, 삭제 다있음  
[goofys를 이용해 AWS S3 mount 해서 사용하기](http://bluese05.tistory.com/23)  
[S3를 EC2에 마운트하기 with goofys](http://m.blog.naver.com/carrotcarrot/220680500604)  
<br/>
> 더보면 좋을 것  
[goofys가 계속 종료되서 s3 연결 끊길 때...](http://m.blog.naver.com/carrotcarrot/220822213764#)  