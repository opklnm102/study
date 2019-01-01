# [Network] MTR
> date - 2019.01.01  
> keyword - network, mtr  
> 네트워크 성능 평가를 위한 네트워크 진단 도구인 mtr에 대해 정리  

<br>

## MTR이란?
* `traceroute, ping의 기능을 혼합`하여 만든 network diagnostic tool
  * tracert or traceroute를 사용해 `경로를 찾고`, ping으로 `응답시간을 측정`해 네트워크 장애를 찾아내는 과정을 mtr로 쉽게 할 수 있다
* 시간 경과에 따른 네트워크 성능 변화를 분석할 수 있도록 report를 제공
  * Client와 Target 사이의 network connection에 대한 품질 측정
  * network hop의 주소를 판별한 후 `ICMP echo 요청(ping)`을 각 머신에 전송해 `머신간 network 품질을 판별해 통계`를 낸다


<br>

### 기능
* 출발지에서 목적지까지 거쳐가는 경로 탐색(traceroute)
* 경로상의 Gateway에 대해 응답시간 측정(ping)
* Gateway 응답시간으로 평균, 최적, 최악, 손실 탐색 후 리포트


<br>

## Install
* 대부분의 배포판에 설치되어 있거나 패키지 형태로 제공되고 있다

```sh
## CoreOS - toolbox 사용
$ dnf install -y mtr

## ubuntu
$ apt-get install -y mtr

## CentOS
$ yum install -y mtr
```


<br>

## Usage

### Basic
```sh
$ mtr <ip>

## example
$ mtr www.naver.com

                                   My traceroute  [v0.92]
localhost (10.0.2.15)                                               2019-01-01T08:10:01+0000
Keys:  Help   Display mode   Restart statistics   Order of fields   quit
                                                    Packets               Pings
 Host                                             Loss%   Snt   Last   Avg  Best  Wrst StDev
 1. _gateway                                       0.0%    44    0.3   0.4   0.3   0.5   0.1
 2. 172.30.1.254                                   0.0%    44    4.3   5.2   2.9  10.5   1.3
 3. 211.217.131.1                                  0.0%    44    8.4   8.8   6.2  13.2   1.7
 4. 221.147.105.193                                0.0%    44    7.7   7.0   4.2  12.9   1.6
 5. 112.188.57.33                                  0.0%    44    4.8   5.9   3.0  11.5   1.8
 6. 112.188.53.65                                  0.0%    44    6.6   8.4   2.3  28.6   5.2
 7. ???
 8. 112.174.60.242                                 0.0%    44    7.5   9.5   4.8  16.6   2.2
 9. 112.188.245.26                                 0.0%    43    7.0   8.8   4.6  55.8   8.7
10. 222.122.7.106                                  0.0%    43   19.5  31.3  17.3 150.2  23.8
11. a23-35-221-113.deploy.static.akamaitechnologi  0.0%    43    8.6   6.5   3.6  17.4   2.2
```

* HOST - 목적지까지 가는 Gateway IP
* Loss - 손실율
* Last - 최근 응답 시간
* Avg - 평균 값
* Best - 가장 빠른 응답시간
* Wrst - 제일 느린 응답시간
* StDev - 편차
* Keys
  * H - help menu
  * D - Display mode
  * R - Restart statistics
  * O - Order of fields
  * q - quit


<br>

### 도움말
* mtr 실행 중 h 누르기
```sh
                                   My traceroute  [v0.92]
localhost (10.0.2.15)                                               2019-01-01T08:35:18+0000
Command:
  ?|h     help
  p       pause (SPACE to resume)
  d       switching display mode
  e       toggle MPLS information on/off
  n       toggle DNS on/off
  r       reset all counters
  o str   set the columns to display, default str='LRS N BAWV'
  j       toggle latency(LS NABWV)/jitter(DR AGJMXI) stats
  c <n>   report cycle n, default n=infinite
  i <n>   set the ping interval to n seconds, default n=1
  f <n>   set the initial time-to-live(ttl), default n=1
  m <n>   set the max time-to-live, default n= # of hops
  s <n>   set the packet size to n or random(n<0)
  b <c>   set ping bit pattern to c(0..255) or random(c<0)
  Q <t>   set ping packet's TOS to t
  u	  switch between ICMP ECHO and UDP datagrams
  y	  switching IP info
  z	  toggle ASN info on/off

 press any key to go back...
```


<br>

### Network 진단 리포트
```sh
$ mtr -r -c 10 <ip>

## example
$ mtr -r -c 10 www.naver.com

Start: 2019-01-01T08:42:07+0000
HOST: localhost                   Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- _gateway                   0.0%    10    0.4   0.4   0.3   0.5   0.1
  2.|-- 172.30.1.254               0.0%    10    5.6   4.9   4.0   6.1   0.7
  3.|-- 211.217.131.1              0.0%    10    7.0   8.5   6.1  10.2   1.3
  4.|-- 221.147.105.193            0.0%    10    6.6   6.3   3.5   8.0   1.3
  5.|-- 112.188.57.33              0.0%    10    4.7   5.2   4.0   7.4   1.1
  6.|-- 112.188.52.61              0.0%    10    6.6   9.0   4.7  19.1   4.7
  7.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
  8.|-- 112.174.21.78              0.0%    10    6.8   9.2   6.8  14.4   2.2
  9.|-- 112.188.246.174            0.0%    10    4.5   5.9   4.5   8.0   1.1
 10.|-- 61.78.53.198               0.0%    10   26.4 2284.  25.1 6304. 2368.1
 11.|-- a23-212-13-94.deploy.stat  0.0%    10    5.1   7.6   5.1  12.1   2.0
```
* `-r` - `--report`, report mode
* `-c 10` - `--report-cycles`, 10회 실행


<br>

```sh
$ mtr -r -T -P 443 www.naver.com

Start: 2019-01-01T08:54:40+0000
HOST: localhost                   Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- _gateway                   0.0%    10    0.5   0.5   0.4   0.6   0.1
  2.|-- a23-212-13-94.deploy.stat  0.0%    10    9.1  17.6   6.3  94.9  27.2
```
* `-T` - `--tcp`, ICMP echo 대신 TCP 사용
* `-P 443` - `--port`, 443 port 사용


<br>

```sh
$ mtr www.naver.com -rn

Start: 2019-01-01T08:57:47+0000
HOST: localhost                   Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- 10.0.2.2                   0.0%    10    0.5   0.3   0.3   0.5   0.1
  2.|-- 172.30.1.254               0.0%    10    5.8   4.4   2.7   8.0   1.6
  3.|-- 211.217.131.1              0.0%    10    7.5   8.9   6.6  11.9   1.6
  4.|-- 221.147.105.193            0.0%    10    6.6   5.9   4.3   7.3   1.0
  5.|-- 112.188.57.33              0.0%    10    6.1   5.7   4.0   6.6   0.9
  6.|-- 112.188.52.61              0.0%    10   15.9   9.6   3.3  31.5   8.5
  7.|-- ???                       100.0    10    0.0   0.0   0.0   0.0   0.0
  8.|-- 112.174.21.78              0.0%    10    6.9   7.7   3.3  10.3   2.0
  9.|-- 112.188.246.174            0.0%    10    9.0   6.4   4.1   9.0   1.9
 10.|-- 61.78.53.198              40.0%    10  7844. 6859. 1600. 9687. 2847.9
 11.|-- 23.212.13.94               0.0%    10    4.7   7.0   3.4  13.4   2.7
```
* `-n` - `--no-dns`, DNS query를 하지 않는다


<br><br>

> #### Reference
> * [MTR](http://www.bitwizard.nl/mtr/index.html)
> * [mtr : traceroute + ping 네트워크 진단도구(TUI, GUI)](https://www.linux.co.kr/home2/board/subbs/board.php?bo_table=lecture&wr_id=1811)
