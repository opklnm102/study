# [Linux] About nc(netcat)
> date - 2020.12.06  
> keyworkd - nc, netcat  
> telnet 대신 사용하는 nc(netcat)에 대해 정리  

<br>

## nc(netcat)
* **arbitrary TCP and UDP connections and listens**
* TCP, UDP protocol을 사용하는 network 연결에서 data를 read/wirte하는 간단한 utility tool
  * cat이 file에 read/write하듯이 nc는 network connection에 read/write 
* network에 대한 debug, test 용도로 편리하지만, 해킹에도 이용되기도 한다
* IPv4, IPv6에 대하여 아래의 처리 가능
  * open TCP connection
  * send UDP packet
  * listen TCP/UDP port
  * do port scanning
* error message를 stderr로 출력
* telnet 대신 nc(netcat) 사용

<br>

### Common use case
* simple TCP proxies
* shell-script based HTTP clients and servers
* network daemon testing
* a SOCKS or HTTP ProxyCommand for ssh
* etc...

<br>

### Syntax
```sh
$ nc [option] [hostname] [port]
```

| Option | Description |
|:--|:--|
| -n | hostname, ip address, port에서 DNS or service lookup 수행을 하지 않는다 |
| -v | verbose mode |
| -u | UDP 사용 |
| -s | source ip address 지정 |
| -p | source port 지정 |
| -l | listen mode로 port open | 
| -z | data transfer 없이 listening daemon만 scan |
| -w | connection and stdin에 대해 timeout 설정 |


<br>

## Usage

### Client/Server model
* `-l`을 이용해 listen mode로 port open
```sh
$ nc -l 1234
```

* 다른 터미널에서 접속 후 데이터 입력
```sh
$ nc 127.0.0.1 1234
hi

## other terminal
$ nc -l 1234
hi
```

<br>

### Data transfer
* 특정 port를 listen하고, 출력을 file로 캡쳐
```sh
$ nc -l 1234 > filename.out
```

* file을 전송
```sh
$ nc host.example.com 1234 < filename.in
```

<br>

### Talking to servers
* server에 direct access
```sh
$ echo -n "GET / HTTP/1.0\r\n\r\n" | nc host.example.com 80
```

* SMTP server에 direct access
```sh
$ nc 127.0.0.1 25 << EOF
HELO host.example.com
MAIL FROM: <user@host.example.com>
RCPT TO: <user2@host.example.com>
DATA
Body of email.
.
QUIT
EOF
```
* server에 필요한 request format을 알고 있을 경우 더 복잡한 use case에도 사용할 수 있다

<br>

### Port Scanning
* 어떤 port가 열려 있는지 체크
```sh
## scan single port
$ nc -z localhost 8086
Connection to localhost 8086 port [tcp/*] succeeded!

## scan multi port
$ nc -z host.example.com 20-30
Connection to host.example.com 22 port [tcp/ssh] succeeded!
Connection to host.example.com 25 port [tcp/smtp] succeeded!
```

<br>

### 실행 중인 SW 확인
* 연결 후에 연결 끊어야하므로 `-w`를 사용하거나 `QUIT`를 사용
```sh
$ echo "QUIT" | nc host.example.com 20-30
SSH-1.99-OpenSSH_3.6.1p2
Protocol mismatch.
220 host.example.com IMS SMTP Receiver Version 0.84 Ready
```

<br>

### source port 31337, timeout 5s로 host.example.com:42에 TCP 연결
```sh
$ nc -p 31337 -w 5 host.example.com 42
```

<br>

### host.example.com:53에 UDP 연결
```sh
$ nc -u host.example.com 53
```

<br>

### source ip 10.1.2.3로 host.example.com:42에 TCP 연결
```sh
$ nc -s 10.1.2.3 host.example.com 42
```

<br>

### Create and listen on a Unix Domain Socket
```sh
$ nc -lU /var/tmp/dsocket
```

<br>

### 10.2.3.4:8080 HTTP Proxy로 host.example.com:42에 연결
```sh
$ nc -x10.2.3.4:8080 -Xconnect host.example.com 42
```

<br>

> #### Amazon Linux 2(AL2)에서는 별도의 설치 필요
> ```sh
> $ yum install nc
> ```


<br><br>

> #### Reference
> * [nc(1) - Linux man page](https://linux.die.net/man/1/nc)
> * [Amazon Linux 2를 점프 호스트로 실행하는 Amazon EC2 인스턴스를 사용하여 AWS Cloud9 환경에 연결할 수 없는 이유는 무엇입니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/cloud9-ec2-linux-2-jump-host/)
