# [Linux] About dig
> date - 2020.12.01  
> keyworkd - dig, nslookup, dns query  
> dig에 대해 정리

<br>

## dig(domain information groper)
* **DNS lookup utility**로 DNS(Domain Name System) name server에 query하기 위한 CLI Tool
* **network troubleshooting에 유용**
* 특정한 name server가 명시되지 않으면 `resolv.conf`에 설정된 resolver를 사용
* 파일 읽기(`-f` option)를 이용한 batch mode 지원
* nslookup과 기능적으로 차이는 크게 없지만, 사용이 간결하고, 출력이 상세하여 shell script에서 주로 사용
* nslookup, host 같은 오래된 tool을 대체


<br>

## Usage

### Syntax
```sh
$ dig [@server] [-b address] [-c class] [-f filename] [-k filename] [-m] [-p port#] [-q name] [-t type] [-v] [-x addr] [-y [hmac:]name:key] [-4] [-6] [name] [type] [class] [queryopt...]
```


<br>

### 특정 record type query
```sh
$ dig [domain] [record type]

## e.g. example.com의 MX record query
$ dig example.com MX

; <<>> DiG 9.10.6 <<>> example.com MX
...
```

<br>

### 특정 class query
```sh
$ dig [domain] [record type] [class]

## e.g. example.com의 MX record, internet class query
$ dig example.com MX in

; <<>> DiG 9.10.6 <<>> example.com MX in
...
```

<br>

### 특정 name server 지정
* 특정 국가의 cache DNS에 query 가능(e.g. 중국 cache DNS)
```sh
$ dig [@server] [domain]

## e.g. Google DNS(8.8.8.8)에 example.com query
$ dig @8.8.8.8 example.com

; <<>> DiG 9.10.6 <<>> @8.8.8.8 example.com
...
```

<br>

### query 결과 요약본 조회
* `+short` 사용
* query 응답만 확인할 수 있다
```sh
$ dig +short [domain]

## e.g.
$ dig +short example.com
93.184.216.34
```

<br>

### DNS query tracing
* `+trace`를 사용
* root name server부터 query한 name server까지의 흐름을 확인할 수 있다
```sh
$ dig +trace [domain]

## e.g.
$ dig +trace example.com

; <<>> DiG 9.10.6 <<>> +trace example.com
;; global options: +cmd
.			84162	IN	NS	a.root-servers.net.
.			84162	IN	NS	b.root-servers.net.
...
```


<br>

### batch mode(read file)
```sh
$ dig -f [file]

## e.g.
$ cat xxx.txt
example.com
www.google.com

$ dig -f xxx.txt
...
```


<br>

## Conclusion
* `dig`와 `nslookup`은 기능적으로 큰 차이가 없기 때문에 무엇을 사용해도 상관없다
* `nslookup`은 window에 default로 설치되어 있고, `dig`는 unix에 default로 설치되어 있으므로 편한 것을 사용하자


<br><br>

> #### Reference
> * [dig - wikipedia](https://ko.wikipedia.org/wiki/Dig)
> * [dig(1) - Linux man page](https://linux.die.net/man/1/dig)
