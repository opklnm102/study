# [AWS] EC2 instance에 ssh 연결이 안될 때
> date - 2018.11.23  
> keyword - aws ec2, ssh, CoreOS  
> k8s cluster의 Node로 사용하던 AWS EC2 instance에 ssh 연결이 안될 경우의 해결 과정을 정리

<br>

## Issue
* k8s의 Node로 사용하고 있는 instance에 ssh 접속이 안돼는 문제 발생
* 유효한 `.pem`파일 사용

<br>

### ssh 연결이 되지 않는 이유?
* 연결하려는 TCP/22에서 수신 대기중인 서비스가 없는 경우
  * SSH daemon이 죽었다
* host shutdown
* 일시적인(임시 라우팅 or DNS 문제) 또는 치명적인(host가 침입자로 판단) 다른 이유


<br>

## Try

### connection log를 확인하기
```sh
$ ssh -i xxx.pem -vvv core@<ip>

OpenSSH_7.6p1, LibreSSL 2.6.2
debug1: Reading configuration data /etc/ssh/ssh_config
debug1: /etc/ssh/ssh_config line 48: Applying options for *
debug2: ssh_connect_direct: needpriv 0
debug1: Connecting to x.x.x.x port 22.
```
* 22 port 연결이 실패함을 알 수 있다

<br>

### Reverse DNS lookup으로 서버의 네트워크 설정 확인
```sh
$ nslookup x.x.x.x

Server:		x.x.x.x
Address:	192.0.0.5#53

Non-authoritative answer:
35.0.0.10.in-addr.arpa	name = ip-192-0-0-5.ap-northeast-1.compute.internal.

Authoritative answers can be found from:

## or use dig - $dig +short [domain]
$ dig +short ip-192-0-0-5.ap-northeast-1.compute.internal
```
* DNS에도 문제가 없음을 알 수 있다

<br>

### ping 확인
* network error일 수 있으니 ping으로 연결 상태 체크
```sh
$ ping <ip>

PING x.x.x.x (x.x.x.x): 56 data bytes
64 bytes from x.x.x.x: icmp_seq=0 ttl=62 time=41.551 ms
64 bytes from x.x.x.x: icmp_seq=1 ttl=62 time=42.003 ms
64 bytes from x.x.x.x: icmp_seq=2 ttl=62 time=42.340 ms
64 bytes from x.x.x.x: icmp_seq=3 ttl=62 time=44.835 ms
64 bytes from x.x.x.x: icmp_seq=4 ttl=62 time=542.074 ms
64 bytes from x.x.x.x: icmp_seq=5 ttl=62 time=40.801 ms
^C
--- x.x.x.x ping statistics ---
7 packets transmitted, 6 packets received, 14.3% packet loss
round-trip min/avg/max/stddev = 40.801/125.601/542.074/186.257 ms
```
* ping은 잘 수행되는걸 볼 수 있다
* 그럼 22 port의 문제인데...
* ping은 ICMP를 사용하기 때문에 port가 없기 때문에 telnet을 사용해보자

<br>

### port 확인
* telnet, curl, nc를 사용하여 확인할 수 있다
* telnet
```sh
$ telnet <host> <port>

## example
$ telnet ip-192-0-0-5.ap-northeast-1.compute.internal 22
Trying ip-192-0-0-5.ap-northeast-1.compute.internal...
...
```

* curl
```sh
$ curl -v telnet://<host>:<port>

## example
$ curl -v telnet://ip-192-0-0-5.ap-northeast-1.compute.internal:22
Trying ip-192-0-0-5.ap-northeast-1.compute.internal:22...
...
```

* nc
```sh
$ nc -zv <host> <port>

## example
$ nc -zv ip-192-0-0-5.ap-northeast-1.compute.internal 22
Connection to ip-192-0-0-5.ap-northeast-1.compute.internal 22 port
...
```
* 뭔가 문제가 있는듯...

<br>

### Security Group, firewall 확인
* Security Group에 22 port가 등록되어 있는지 확인

<br>

### 위에 방법으로 원인을 못찾았다면....
1. 새로운 instance를 생성
2. 문제의 instance가 사용하던 EBS(Elastic Block Store)를 새로운 instance에 연결
3. ssh 관련 log 확인
4. /etc/ssh/sshd_config를 정상 instance와 비교

#### ssh 접속 안돼는 Node의 sshd log
```sh
$ journalctl -u sshd.socket

-- Logs begin at Mon 2018-11-12 08:00:17 UTC, end at Thu 2018-11-22 09:00:10 UTC. --
Nov 21 11:37:40 ip-10-0-2-127.ap-northeast-1.compute.internal systemd[1]: sshd.socket: Failed to queue service startup job (Maybe the service file is missing or not a template unit?): Argument list too long
Nov 21 11:37:40 ip-10-0-2-127.ap-northeast-1.compute.internal systemd[1]: sshd.socket: Failed with result 'resources'.
-- Reboot --
Nov 22 08:22:44 ip-10-0-2-127.ap-northeast-1.compute.internal systemd[1]: Listening on OpenSSH Server Socket.
```
* 딱히 시작 실패한 log는 보이지 않는데…

#### 정상 Node log
```
$ journalctl -u sshd.socket
-- Logs begin at Thu 2018-11-08 23:35:09 UTC, end at Fri 2018-11-23 08:10:39 UTC. --
-- No entries --
```
* [sshd.socket stops working after a while](https://github.com/coreos/bugs/issues/2181)를 보면 systemd의 bump message queue size bug로 추정
  * systemd v239에서 fix

* 현재 Container Linux by CoreOS stable (1745.5.0)에서 `systemd 238` 사용
```sh
$ systemctl --version
systemd 238
```

## 결론
* 뭔가 찝찝하지만… 우선은 reboot할 수 밖에 없는듯?

<br>

> #### Reference
> * [Cannot connect to EC2 server anymore:“Connection refused on port 22”](https://unix.stackexchange.com/questions/369366/cannot-connect-to-ec2-server-anymoreconnection-refused-on-port-22)
> * [ssh Connection refused: how to troubleshoot?](https://unix.stackexchange.com/questions/21302/ssh-connection-refused-how-to-troubleshoot)
> * [sshd.socket stops working after a while](https://github.com/coreos/bugs/issues/2181)
> * [VPC의 퍼블릿 또는 프라이빗 서브넷을 사용하는 Amazon RDS DB 인스턴스에 대한 연결 문제를 해결하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/rds-connectivity-instance-subnet-vpc)
