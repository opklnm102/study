# [Nginx] Nginx basic

* [특징](#특징)
* [설치](#설치)
* [init](#init)
* [설정](#설정)
* [권장 환경설정](#권장-환경설정)

## 특징
* apache보다 설정이 간단하고 기능이 적어서 성능, 속도에서 뛰어남
* 더 적은 자원으로 더 빠르게 데이터를 서비스할 수 있다
* 별로 많은 연산을 하지않고, 주로 전달자 역할만하여 `Reverse Proxy Tool`이라고도 부른다
* 동시접속 처리를 잘한다

> #### CGI(Common Gateway Interface)
> * 웹서버와 외부 프로그램을 연결해주는 표준화된 프로토콜
> * 정적인 HTML만으로 정보 제공에 한계 발생
> * 웹서버가 처리할 수 없는 정보일 때 처리할 수 있는 외부 프로그램을 호해에 외부 프로그램이 처리한 결과를 받아서 웹브라우저로 전송
> 
> #### FastCGI
> * CGI는 하나의 요청에 하나의 프로세스 생성
>    * 프로세스 생성, 삭제에 오버헤드 발생
>    * FastCGI 등장
> * 만들어진 프로세스가 계속해서 새로운 요청 처리


## 설치
* [Nginx Install](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/) 참고

### Ubuntu

#### from OS Repository
##### 1. update the ununtu repository information
```sh
$ apt-get update
```

##### 2. install the Nginx
```sh
$ apt-get install nginx
```

##### 3. verify the installation
```sh
$ nginx -v
nginx version: nginx/1.6.2
```

#### from Official Nginx Repository
##### 1. 저장소 보안키 다운로드 후 시스템에 등록
* 보안키 정보는 `/etc/apt/trusted.gpg`에 저장
```sh
# nginx 보안키 다운로드 후 적용
$ wget http://nginx.org/keys/nginx_signing.key
$ apt-key add nginx_signing.key
$ rm nginx_signing.key

# 추가된 보안키 목록 보기
$ apt-key list  
```

##### 2. apt source list에 저장소 추가
```sh
$ sudo vi /etc/apt/sources/list

# /etc/apt/sources/list에 아래 내용 추가
deb http://nginx.org/packages/mainline/ubuntu/ <CODENAME> nginx
deb-src http://nginx.org/packages/mainline/ubuntu/ <CODENAME> nginx

# ex. ubuntu 16.04
deb http://nginx.org/packages/mainline/ubuntu/ xenial nginx
deb-src http://nginx.org/packages/mainline/ubuntu/ xenial nginx
```
* `<CODENAME>` - ubuntu version
   * trusty(14.04)
   * xenial(16.04) 

##### 3. install nginx
```sh
$ apt-get remove nginx-common
$ apt-get update
$ apt-get install nginx
```

##### 4. start nginx
```sh
$ sudo nginx
```

##### 5. verify nginx running
```sh
$ curl -I 127.0.0.1
HTTP/1.1 200 OK
Server: nginx/1.13.8

$ ps -ef | grep nginx
root     31262     1  0 06:40 ?        00:00:00 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
nginx    31263 31262  0 06:40 ?        00:00:00 nginx: worker process
nginx    31264 31262  0 06:40 ?        00:00:00 nginx: worker process
ec2-user 31267 31131  0 06:40 pts/0    00:00:00 grep --color=auto nginx
# master도 떠있고 worker도 떠있고, 정상적으로 구동 중

# port check
$ sudo netstat -ntlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN      7459/sshd
tcp        0      0 127.0.0.1:25                0.0.0.0:*                   LISTEN      2747/sendmail
tcp        0      0 0.0.0.0:49319               0.0.0.0:*                   LISTEN      2339/rpc.statd
tcp        0      0 0.0.0.0:111                 0.0.0.0:*                   LISTEN      7581/rpcbind
tcp        0      0 0.0.0.0:80                  0.0.0.0:*                   LISTEN      31262/nginx
tcp        0      0 :::22                       :::*                        LISTEN      7459/sshd
tcp        0      0 :::49382                    :::*                        LISTEN      2339/rpc.statd
tcp        0      0 :::111                      :::*                        LISTEN      7581/rpcbind
tcp        0      0 :::80                       :::*                        LISTEN      31262/nginx
```

<br>

---

### Centos and RHEL

#### from OS Repository
##### 1. install the EPEL repository
```sh
$ yum install epel-release
```

##### 2. update the repository and install Nginx
```sh
$ yum update
```

##### 3. Verify the installation
```sh
$ nginx -v
nginx version: nginx/1.6.3
```

#### from Official Nginx Repository
##### 1. set up yum repository
```sh
$ sudo vi /etc/yum/repos.d/nginx.repo

# nginx.repo에 기술
[nginx]
name=nginx repo
baseurl=https://nginx.org/packages/mainline/<OS>/<OSRELEASE>/$basearch/
gpgcheck=0
enabled=1

# <OS> - rhel or centos
# <OSRELEASE> - 6, 6._x_, 7, 7._x_

# ex. Centos 7
[nginx]
name=nginx repo
baseurl=https://nginx.org/packages/mainline/centos/7/$basearch/
gpgcheck=0
enabled=1
```

##### 2. update the repository and install Nginx
```sh
$ yum update 
```

##### 3. Verify the installation
```sh
$ nginx -v
nginx version: nginx/1.6.3
```

<br>

---

### Amazon Linux AMI
* 접속시 `Welcome to nginx on the Amazon Linux AMI!`라는 화면이 보이는 Amazon Linux AMI의 nginx가 설치된다

#### 1. nginx install
```sh
$ sudo yum update

$ yum install nginx

# install check
$ nginx -v
nginx version: nginx/1.12.1
```

#### 2. nginx service start
```sh
$ sudo service nginx start
Starting nginx:                                            [  OK  ]

$ sudo service nginx status
nginx (pid  31262) is running...
```

<br>

---

## init
* Nginx와 같은 SW를 `Service` or `Background Application`이라고 부른다
* 이들은 표준화된 인터페이스를 가지고 있다
   * `service nginx start` - 시작
   * `service nginx stop` - 정지
   * `service nginx restart` - 재시작
   * `service nginx reload` - 설정 파일을 재로딩
   * `service nginx status` - 현재 상태
* nginx를 실행하고, 부팅시 자동 동작하도록 하려면 `/etc/init.d에 init 스크립트`를 위치
   * [ubuntu용 init 스크립트](https://github.com/JasonGiedymin/nginx-init-ubuntu)
   * `$ sudo update-rc.d -f nginx defaults` - nginx 자동 실행
* [OS별 init 스크립트](https://www.nginx.com/resources/wiki/start/topics/examples/initscripts/)

<br>

---

## 설정
* 파일에 설정 값을 기술하여 nginx가 어떻게 동작해야 하는가를 지정하는 기능
* `/etc/nginx/nginx.conf` - nginx 설정파일
   * 업데이트시 설정파일이 덮어쓰여질 위험이 있다
   * 내용을 보면 `include /etc/nginx/conf.d/*.conf;`란 부분 존재
      * `/etc/nginx/conf.d`디렉토리에 있는 모든 설정 파일을 불러오는 구문
* `/etc/nginx/conf.d/default.conf` - 기본 설정 파일
   * 업데이트시 덮어쓰여질 위험이 있으므로 **복사**해서 사용
   * **알파벳순으로 로드** - a로해서 우선순위를 높게
      * `$ cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/a.conf`

> #### 설정파일 찾기
> ```sh
> $ sudo find / -name nginx.conf
> ```

### 설정 파일의 반영
```sh
# restart도 되지만 서비스가 중단되기 때문에 reload 권장
$ sudo service nginx reload
```

### 설정파일의 역할
* nginx.conf - 메인 설정파일
* fcgi.conf - FastCGI 환경설정 파일
* sites-enabled - 활성화된 사이트들의 설정 파일들이 위치. Apache에서 Vitual host의 설정에 해당. 기본적으로 없을수도 있다. 
* sites-available - 비활성화된 사이트의 설정 파일들이 위치

### 기본설정의 구분
```sh
# Core 모듈 설정
# 파일최상단에 위치, nginx의 기본적인 동작방식 정의
worker_processes 1;

# 주로 네트워크의 동작방법과 관련된 설정
events {
	worker_connections 1024;
}

# server, location 블록의 root
# 블록의 설정은 하위 블록에 상속
# http 블록은 여러개 사용가능하지만 관리상의 이슈로 1번만 사용하는 것을 권장
http {
	include mine.types;

	# 하나의 웹사이트를 선언하는데 사용. Virtual Host 개념
	# 하나의 서버로 2개의 웹사이트를 운영할 수 있게 한다
	sever {
		listen 80;  # Listen Port 설정
		server_name localhost;  # 서버 이름

		 #charset koi8-r;  # charset 설정
		 #access_log  logs/host.access.log  main;  # log 위치

		  # 에러페이지 설정
		  error_page 404 /error_401.html;
		  error_page 500 /error_500.html;

		# 특정 url을 처리하는 방법을 정의
		# `/products/2`와 `/sellers/2`로 접근하는 요청을 다르게 처리 
		location / {
			root html;   # Document Root 지정, 원하는 디렉토리로 수정
			index index.html index.htm;  # index파일 설정, 없을 경우 403 Forbidden error
		}

		# proxy_pass 설정
		# 특정 확장자 요청을 넘기는 설정.
		# 뒷단에 WAS가 존재하는 경우
		# *.do에 대하여 http://localhost:8080로 넘김
		location ~ \.do$ {
			proxy_pass http://localhost:8080;
		}
	}

	# Sub Domain 추가1(Virtual Host)
	server {
		listen 80;
		server_name nginx1.aaa.com;
		
		access_log logs/nginx1.access.log;  # 설정하지 않으면 하나의 log파일로 쌓임
		
		location / {
			root /home/nginx1;
			index index.html index.htm;
			}
	}
	
	# Sub Domain 추가2
	server {
		listen 80;
		server_name nginx2.aaa.com;
		
		location / {
			root /home/nginx2;
			index index.html index.htm;
		}
	}
}
```

#### Example
```sh
server {
	listen 80 default_server;  # HOST 헤더가 없거나, server블럭 중 대응하는 것이 없을 때 여기로 온다
	server_name _;  # `_`은 nothing. 아무것도 대응하지 않도록 할 때 사용

	index index.html;
	root /var/www/default;

	# `/forum`으로 요청이 오면 새로운 서브 도메인으로 보낸다
	location /forum {
		rewrite forum(.*) http://forum.domain.com$1 permanent;
	}
}
```

```sh
# 정적 자원은 nginx, 동적처리는 뒷단의 WAS에게 넘길 경우
http {
	upstream backend {
		server localhost:8080
	}

	server {
		listen 80;
		server_name localhost;

		location / {
			root html;
			index index.html index.htm;
		}

		location /servlet {
			proxy_pass http://backend/servlet;
			index index.jsp
		}

		location /manager {
			proxy_pass http://backend/manager;
			index index.jsp;
		}
	}
}
```

> #### Document Root
> * 웹서버상의 루트 디렉토리
>    * default - `/usr/share/nginx/html/`
> * `root지시자`로 설정
> * 요청이 들어오면 웹서버는 해당하는 파일을 읽어서 응답
>    * URL울 통해 전달된 path를 기준으로 파일을 찾는다
>    * URL의 root는 웹서버상의 Root 디렉토리부터 시작
> ```
> # 요청 - aaa.com/index.html
> # 응답 - /var/www/aaa.com/index.html
> server {
> 	server_name aaa.com  # 호스트명(도메인)
> 	root /var/www/aaa.com
> }
> ```
>
> #### 로그파일
> * `/var/log/nginx`에 위치

<br>

---

## 권장 환경설정

### nginx.conf

#### user 지시어
* Worker Process의 권한 지정
* nginx는 Master Process와 Worker Process로 동작
   * Worker Process가 `실질적인 웹서버 역할 수행`
* `user값이 root로 되어 있다면 일반계정으로 변경`
   * user의 값이 root면 root권한으로 원격제어가 되기 때문에 보안상 위험
* `www-data`, `nginx`처럼 계정이 하는일에 대한 대표성 있는 이름을 사용, 일반 유저의 권한으로 쉘에 접속할수 없어야 안전
```sh
# www-data권한으로 쉘 접속X, 오직 nginx구동하는데만 사용
$ useradd --shell /usr/sbin/nologin www-data  
$ vi /etc/nginx/nginx.conf

# /etc/nginx/nginx.conf
user www-data;  # 사용자 계정
```

#### worker_process 지시어
* Worker Process를 몇개 생성할 것인지 설정
   * 1이라면 모든 요청을 하나의 프로세스로 실행
   * 여러개의 CPU 코어가 있는 시스템이라면 코어의 숫자만큼 지정하는 것을 권장

#### worker_connections
* 몇개의 접속을 동시에 처리할 것인지 지정
* 하나의 머신이 처리할 수 있는 커넥션 양
   * `worker_process x worker_connections`
   * ex. 1 x 1024 = 1024개의 커넥션을 처리
* 퍼포먼스 테스트하면서 값을 조정
   * [ngrinder](https://opentutorials.org/module/351/3334)참고

#### log_not_found
* 존재하지 않는 파일에 대한 요청이 있을 때 404에러를 에러로그 파일에 기록할 것인지 여부(on/off)

#### client_max_body_size
업로드할 수 있는 용량의 크기 지정(default. 1MB)
```sh
client_max_body_size 10M;
```

## Virtual Host - server 블록
* 한대의 컴퓨터로 여러대의 컴퓨터가 존재하는 것처럼 동작
* http://aaa.net은 `32.0.2.3`을 가리키고 http://bbbb.com도 `32.0.2.3`을 가리키면 2개의 웹사이트를 하나의 컴퓨터로 처리
```sh
server {
	server_name aaa.net  # 호스트명(도메인)
	root /var/www/aaa.net
}

server {
	server_name bbb.com
	root /var/www/bbb.com
}
```

### 사용법
* nginx.conf파일에 server블록 사용
   * 하나의 호스트에서 복수의 서비스를 운영한다면 `include` 방식 권장
```sh
o2.org
   o2.org

o2.org o2.com
   o2.org, o2.com

*.o2.org
```

### include
별도의 파일에 설정을 기록해서 설정의 그룹핑, 재활용성을 높이는 방법
* sites-enabled 디렉토리에 있는 모든 파일을 자동으로 가져오기
   * sites-enabled를 가상호스트마다 만들어 위치시키면 nginx가 가져와서 사용함
```
http {
	includes sites-enabled/*;  # 상대경로 - sites-enabled는 conf 하위에 존재해야함
}
```

## 재작성(rewrite)

### URL을 통한 요청
URL의 path에서 요청하는 파일을 Document Root에서 찾아서 전달해주는 것

### rewirte
* 요청을 통해서 주어진 URL의 규칙을 변경해 웹서비스를 보다 유연하게 만드는 방법
   * Apache에서는 `mod_rewrite모듈`로, Nginx에서는 `rewrite모듈` 사용

#### semantic url(의미론적 url)
* 장점
   * 깔끔
   * 정보 예측
   * 검색엔진 - 검색엔진은 URL의 정보를 중요한 검색조건으로 사용
```
rewrite ^/wiki/(.*)$ /wiki/index.php?title=$1?;

# before
http://aaa.com/wiki/index.php?title=AAA

# after
http://aaa.com/wiki/AAA
```

#### 확장자 치환
* 사용 기술을 숨길 수 있다
   * 보안 향상
* ex. 네이버 무비 url
   * http://movie.naver.com/movie/bi/mi/basic.nhn?code=102638
   * .nhn은 존재하지 않는 언어 

#### 외부 리다이렉션
* 웹브라우저에 301, 302 헤더값을 보내 재접속하는 방식
   * 브라우저가 주체
```
# old_aaa.com/sellers/a.html을 aaa.com/sellers/2로 보내기
location ~ /sellers/a.html {
	rewrite ^ http://aaa.com/sellers/2;
}
```

#### 내부 리다이렉션
* nginx내부에서 일어나는 리다이렉션
* 외부 리다이렉션보다 `빠르고` 웹브라우저에게 리다이렉션 자체를 `숨길 수 있다`
* 리다이렉션할 URL에 http://가 포함되어 있으면 nginx rewrite 모듈은 자동으로 외부 리다이렉션 사용
```
# aaa.com/images/3의 실제 파일은 aaa.com/file/images/3에 존재한다면
location /images/ {
	rewrite ^/images/(.*)$ /file/images/$1;
}
```

#### 리다이렉션 디버깅
* error_log 지시자를 server나 location 블록 아래에 위치
   * server - 해당 Virtual host의 에러메시지 출력
   * location - 해당 경로에 대한 에러메시지 출력 
* rewrite에 대한 에러를 출력하려면 debug 레벨 사용
```
server {
	server_name aaa.com
	error_log /var/log/aaa.com.error debug;
	location ~ /.php$ {
		error_log /var/log/aaa.com.php.error debug;
	}
}
```

### 사례

#### www 제거
* URL에 www가 포함되어 있으면 제거한 url로 이동
```
if($host ~* ^www\.(.*)) {
	set $host_without_www $1;
	rewrite ^/(.*)$ $scheme://$host_without_www/$1 permanent;
}
```

#### favicon.ico 무시
* 브라우저는 웹사이트에 접근시 자동으로 favicon.ico 파일 요청
```
# favicon.ico파일을 제공하지 않는 경우 무시
location = /favicon.ico {
	return 204;  # no content. 정상 수신, 응답 데이터X
}
```

## Upstream
* 웹 서버
   * 정적인 데이터(이미지 등)를 서비스
   * `적은 자원으로 많은 요청 처리`
* PHP, Python등으로 만든 애플리케이션 서버
   * 많은 연산을 하기 때문에 `웹서버보다 많은 자원 필요`
* FastCGI를 사용하면 웹 서버와 애플리케이션 서버를 별도의 서버로 분리

Client ------ Nginx(Web Server) ----- Application Server
				Downstream 서버          Upstream 서버

### Upstream
* Upstream 서버(Origin 서버)
   * 여러대의 컴퓨터가 순차적으로 어던일을 처리할 대 어떤 서비스를 받는 서버

### Upstream Module
* nginx에 내장된 모듈
* 부하분산, 속도 개선과 같은 역할을 할 수 있게 한다

### Upstream 설정
* upstream 블록 이용

#### 형식
```
upstream 이름 {
	[ip_hash;]
	server host 주소:포트[옵션];
	...
}
```

#### 옵션
* ip_hash - 같은 방문자로부터 도착한 요청은 항상 같은 업스트림 서버가 처리할 수 있게 한다
* weight=n - 업스트림 서버의 비중, 2로 설정하면 다른 서버에 비해 2배 더 자주 선택
* max_fails=n - n으로 지정한 횟수만큼 실패가 일어나면 서버가 죽은 것으로 간주
* fail_timeout=n - max_fails가 지정된 상태에서 이 값이 설정만큼 서버가 응답하지 않으면 죽은것으로 간주
* down - 해당 서버를 사용하지 않게 지정, `ip_hash;`가 설정된 상태에서만 유효
* backup - 모든 서버가 동작하지 않을 때 backup으로 표시된 서버가 사용되고 그 전까지는 사용되지 않는다

#### 예제
```
server {
	location ~ \.php$ {
		fastcgi_pass backend;  # upstream설정 backend에 전달
		fastcgi_index index.php;
	}
}

upstream backend {
	ip_hash;  # 같은 ip는 같은 upstream서버에 접속
	server 192.168.125.142:9000 weight=3;  # 다른 서버보다 3배 자주 사용
	server 192.168.125.143:9000;
	server 192.168.125.144:9000; max_fails=5 fail_timeout=30s;  # 30초동안 응답하지 않는 상태가 5번 지속되면 죽은 것으로 간주 -> 더이상 요청X
	server unix:/var/run/php5-fpm.sock backup;  # 같은 호스트에 설치되서 소켓으로 통신하는 FastCGI 애플리케이션은 백업 용도, 나머지 서버가 사용불능일 때 자동으로 활성화
}
```

[변수](https://opentutorials.org/module/384/4508)
* $host
   * 현재 요청의 호스트명, ip나 도메인 
   * opentutorials.org
* $uri
   * 현재 요청의 URI, 호스트명, 파라미터 제외
   * /production/module/index.php
* $args - 
   * URL의 질의문자열
   * type=module&id=12
* server_addr
   * 서버 주소
   * 115.68.24.88
* server_name
   * 서버 이름
   * localhost
* server_port
   * 포트
   * 80
* server_protocol
   * HTTP 요청 프로토콜(HTTP/1.0, HTTP/1.1)
   * HTTP/1.1
* $arg_PARAMETER
   * $arg_type = module
   * $arg_id = 12
* $request_uri
/production/module/index.php?type=module&id=12
* $request_filename
/usr/local/nginx/html/production/module/index.php

> #### 참고
> * [생활코딩 nginx](https://opentutorials.org/module/384/3462)  
> * [Nginx Doc](https://www.nginx.com/resources/wiki/start/)  
> * [NginX 주요 설정 (nginx.conf)](http://sarc.io/index.php/nginx/61-nginx-nginx-conf) - Nginx 카테고리 포스팅 참고하면 좋을듯  
> * [리눅스에서 웹서비스를 위한 웹서버 nginx 설치 - yum이용](https://www.conory.com/note_linux/42847)  
> * [NginX 주요 설정](http://whiteship.me/?p=13014)  
> * [tomcat + nginx 연동하기](http://misoin.tistory.com/7)  
> * [Nginx 설정](https://brunch.co.kr/@elijah17/19) - 정리 잘되있음  

> #### 더보면 좋을 자료
> * [Nginx HTTP Server](http://ohgyun.com/477) - Nginx HTTP Server 책 정리  
> * [HTTP loadbalancing springboot servers with Nginx](http://christoph-burmeister.eu/?p=2951)  
> * [nginx 공부자료](http://knight76.tistory.com/entry/Nginx-%EA%B3%B5%EB%B6%80-%EC%9E%90%EB%A3%8C-Nginx-References)  
> * [nginx upstream 성능 최적화](https://brunch.co.kr/@alden/11)  
