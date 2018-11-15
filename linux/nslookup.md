# [Linux] nslookup
> date - 2018.11.15  
> keyword - nslookup, dns  
> nslookup에 대해 알아본걸 정리 

<br>

## nslookup이란?
* DNS에 관련된 정보를 조회 할 수 있는 명령어
* 주로 네트워크가 제대로 설정되었는지 확인하는 용도로 사용
  * 도메인들이 제대로 설정되어 있는지 여부


<br>

## DNS(Domain Name Server)란?
* 인터넷 서버들은 유일하게 구분할 수 있는 값으로 IP를 사용하는데 사람이 기억하기에는 무리가 있다
* DNS를 사용해 IP를 사람이 기억하기 편한 언어 체계로 변환하는 과정 수행


<br>

## Usage nslookup

### DNS lookup
```sh
$ nslookup <domain>

# example
$ nslookup google.com
Server:		168.126.63.1
Address:	168.126.63.1#53

Non-authoritative answer:
Name:	google.com
Address: 172.217.24.142
```

<br>

### DNS 중 MX(Mail Record) 확인
```sh
$ nslookup -query=mx <domain>

# example
$ nslookup -query=mx google.com

Server:		2001:2d8:eb51:988f::c
Address:	2001:2d8:eb51:988f::c#53

Non-authoritative answer:
google.com	mail exchanger = 10 aspmx.l.google.com.
google.com	mail exchanger = 50 alt4.aspmx.l.google.com.
google.com	mail exchanger = 20 alt1.aspmx.l.google.com.
google.com	mail exchanger = 30 alt2.aspmx.l.google.com.
google.com	mail exchanger = 40 alt3.aspmx.l.google.com.

Authoritative answers can be found from:
```

<br>

### NS 레코드로 DNS 목록 확인
```sh
$ nslookup -type=ns <domain>

# example
$ nslookup -type=ns google.com

Server:		2001:2d8:eb51:988f::c
Address:	2001:2d8:eb51:988f::c#53

Non-authoritative answer:
google.com	nameserver = ns1.google.com.
google.com	nameserver = ns2.google.com.
google.com	nameserver = ns4.google.com.
google.com	nameserver = ns3.google.com.

Authoritative answers can be found from:
```

| DNS 레코드 종류 | |
|:--|:--|
| A | Address. 호스트에 여러 IP 주소를 정의시 사용 |
| PTR | Pointer. IP에 대해 도메인명 매핑시 사용 |
| NS | Name Server. 도메인에 적어도 1개 이상 설정 필수. DNS 서버를 나타냄  |
| MX | Mail Exchanger. 도메인 이름으로 보낸 메일을 받는 호스트 목록을 지정 |
| CNAME | Canonical Name. 호스트의 다른 이름을 정의하는데 사용 |
| SOA | Start of Authority. 호스트에 대한 권한이 있는 서버 표시 |
| HINFO | HW info. 호스트의 HW 사양 표시 |
| ANY(ALL) | 모든 DNS 레코드 표시 |

<br>

### Reverse DNS lookup
* IP로 Name Server을 찾는 기능
* `-type=ptr`과 동일
* IP를 주면 자동으로 Reverse DNS lookup이 된다

```sh
$ nslookup <ip>

# example
$ nslookup 172.217.24.142
Server:		168.126.63.1
Address:	168.126.63.1#53

Non-authoritative answer:
142.24.217.172.in-addr.arpa	name = nrt20s01-in-f142.1e100.net.
142.24.217.172.in-addr.arpa	name = syd09s06-in-f14.1e100.net.
142.24.217.172.in-addr.arpa	name = nrt20s01-in-f14.1e100.net.

Authoritative answers can be found from:
217.172.in-addr.arpa	nameserver = ns2.google.com.
217.172.in-addr.arpa	nameserver = ns1.google.com.
217.172.in-addr.arpa	nameserver = ns3.google.com.
217.172.in-addr.arpa	nameserver = ns4.google.com.
ns1.google.com	internet address = 216.239.32.10
ns2.google.com	internet address = 216.239.34.10
ns3.google.com	internet address = 216.239.36.10
ns4.google.com	internet address = 216.239.38.10
ns1.google.com	has AAAA address 2001:4860:4802:32::a
ns2.google.com	has AAAA address 2001:4860:4802:34::a
ns3.google.com	has AAAA address 2001:4860:4802:36::a
ns4.google.com	has AAAA address 2001:4860:4802:38::a
```

<br>

### 특정 DNS 사용하여 조회
* 기본 설정 DNS가 아닌 `외부 DNS 사용`
```sh
$ nslookup <domain> <external DNS>

# example
$ nslookup google.com 8.8.8.8

server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	google.com
Address: 172.217.25.78
```

<br>

## Non-authoritative?
* DNS는 `authoritative DNS`와 `cached DNS`로 구분
  * authoritative DNS - 도메인에 레코드를 설정한 DNS
  * cached DNS - authoritative DNS에서 받은 응답을 `cache한 뒤에 요청자애게 보내는 역할` 수행


### cached DNS는 처음 들어보는 도메인이 어디에 있는지 어떻게 알아볼까?
* 모든 도메인은 zone으로 구성
* `example.com`도 하나의 zone, `.com`도 zone
* zone의 정의는 SOA(Start of Authority) 레코드에서 관리
* 모든 zone은 자신에 대한 NS 레코드를 가지고 있어 자신의 주소가 어딘지 알 수 있도록 한다

```sh
$ nslookup -type=soa google.com
Server:		168.126.63.1
Address:	168.126.63.1#53

Non-authoritative answer:
google.com
	origin = ns1.google.com  # zone의 name server
	mail addr = dns-admin.google.com  # zone의 관리자 메일 주소
	serial = 221575125
	serial = 221598045
	refresh = 900
	retry = 900
	expire = 1800
	minimum = 60

Authoritative answers can be found from:
google.com	nameserver = ns1.google.com. 
google.com	nameserver = ns3.google.com.
google.com	nameserver = ns4.google.com.
google.com	nameserver = ns2.google.com.
ns1.google.com	internet address = 216.239.32.10
...
```


### 도메인 해석하는 법
* 도메인은 가장 뒤에서부터 해석
* 어떤 도메인이 자신의 하위 도메인을 관리하는 주소는 NS 레코드에 의해서 관리
* .com을 관리하는 DNS 주소는 root DNS에게

```
$ nslookup -type=soa .
Server:		2001:2d8:21b:98d7::28
Address:	2001:2d8:21b:98d7::28#53

Non-authoritative answer:
.
	origin = a.root-servers.net
	mail addr = nstld.verisign-grs.com
	serial = 2018111402
	refresh = 1800
	retry = 900
	expire = 604800
	minimum = 86400

Authoritative answers can be found from:
```

#### ex) google.com
1. .com을 관리하는 DNS를 찾아보고
2. google.com을 관리하는 DNS 서버를 찾고
3. google.com의 IP를 물어본다


> 도메인에 대한 IP가 변경될시 DNS에 전파에 시간이 걸린다는 사실을 유념하자  
> B DNS에 변경정보가 있다면 A DNS에 전파되기까지 시간이 걸린다


<br>

> #### Reference
> * [nslookup 명령어 사용법 및 예제 정리](https://www.lesstif.com/pages/viewpage.action?pageId=20775988)
> * [DNS가 어떻게 작동하는지 알아봅시다: 1. DNS 질의 절차 따라가 보기](https://studyforus.com/study/323795)
