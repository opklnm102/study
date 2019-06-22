# [Linux] ss - Display Linux TCP / UDP Networker Socket Information
> date - 2019.06.22  
> keyword - ss, network  
> socket 정보를 확인할 수 있는 ss에 대해 알아보자  


<br>

## ss란?
* TCP, UDP, DCCP, RAW, Unix domain 등 socket의 통계 정보를 볼 수 있다
* `netstat`와 유사한 정보를 표시
* netstat에 보다 더 많은 TCP와 state를 표시하기 때문에 TCP connection과 socket을 추적하기 유용


<br>

## 확인할 수 있는 정보
* All TCP sockets
* All UDP sockets
* All estabblished ssh / ftp / http / https connections
* All local processes connected to X server
* All the TCP sockets in state FIN-WAIT-1 and much more


<br>

## Usage
```sh
$ ss <options> <FILTER>
```


<br>

### summary
* List currently established, closed, orphaned, waiting TCP socket
```sh
$ ss -s

Total: 396 (kernel 0)
TCP:   324 (estab 11, closed 166, orphaned 0, synrecv 0, timewait 38/0), ports 0

Transport Total     IP        IPv6
*	  0         -         -
RAW	  1         0         1
UDP	  12        7         5
TCP	  158       13        145
INET	  171       20        151
FRAG	  0         0         0
```

<br>

### all open network ports
```sh
$ ss -l
Netid  State     Recv-Q Send-Q    Local Address:Port    Peer Address:Port

tcp    LISTEN     0      128         *:32164                  *:*
...
```

* `open socket`을 사용해 명명된 process 확인
```sh
$ ss -pl

Netid  State     Recv-Q Send-Q    Local Address:Port    Peer Address:Port

tcp    LISTEN     0      128         *:32164                  *:*
...
```

#### Ex. find opening socket / port 32164
```sh
$ ss -lp | grep 32164
tcp    LISTEN     0      128     *:32164                 *:*     users:(("munin-node", 3772, 5))
```
* munin-node가 port 32164를 open하는 역할이므로 pid 3772에 대한 정보를 확인하면 된다

```sh
$ cd /proc/3772
$ ls -l
```

<br>

### Display Socket
* All TCP
```sh
$ ss -t -a

State       Recv-Q Send-Q   Local Address:Port                    Peer Address:Port
LISTEN      0      128          127.0.0.1:9099                               *:*
...
```

* All UDP
```sh
$ ss -u -a

State       Recv-Q Send-Q   Local Address:Port                    Peer Address:Port
UNCONN      0      0                    *:42437                              *:*
...
```

* All RAW
```sh
$ ss -w -a

State       Recv-Q Send-Q   Local Address:Port                    Peer Address:Port
UNCONN      0      0                    *:ipv6-icmp                          *:*
...
```

* All Unix
```sh
$ ss -x -a

Netid State      Recv-Q Send-Q Local Address:Port                  Peer Address:Port
u_str LISTEN     0      128    /var/run/dockershim.sock 31247            * 0
u_str LISTEN     0      128    /run/systemd/private 14361                * 0
...
```

<br>

### Display All Established Connections
* SMTP
```sh
$ ss -o state established '( dport = :smtp or sport = :smtp )'
```

* HTTP
```sh
$ ss -o state established '( dport = :http or sport = :http )'
```

<br>

### List All The Tcp Sockets in State FIN-WAIT-1
* httpd가 `202.54.1/24`에 대해 `FIN-WAIT-1`에 있는 TCP socket 나열
```sh
$ ss -o state fin-wait-1 '( sport = :http or sport = :https )' dst 202.54.1/24
```

<br>

### Filter sockets using TCP states
```sh
## tcp ipv4
$ ss -4 state <filter name>

## tcp ipv6
$ ss -6 state <filter name>
```
* filter name
  * established
  * syn-sent
  * syn-recv
  * fin-wait-1
  * fin-wait-2
  * time-wait
  * closed
  * close-wait
  * last-ack
  * listen
  * closing
  * all
  * connected - `listen`, `closed`를 제외한 state
  * synchronized - `syn-sent`를 제외한 state
  * bucket - minisockes(i.e. `time-wait`, `syn-recv`)으로 유지되는 상태
  * big - `bucket`의 반대


#### Ex.
```sh
$ ss -4 state time-wait

Netid  Recv-Q Send-Q              Local Address:Port                               Peer Address:Port
tcp    0      0                       127.0.0.1:9099                                  127.0.0.1:43886
tcp    0      0                       127.0.0.1:9099                                  127.0.0.1:44056
...
```

<br>

### summarize system resource usage
```sh
$ time ss

...
real	0m0.005s
user	0m0.004s
sys	0m0.001s
```


<br><br>

> #### Reference
> * [ss command: Display Linux TCP / UDP Network/Socket Information](https://www.cyberciti.biz/tips/linux-investigate-sockets-network-connections.html)
