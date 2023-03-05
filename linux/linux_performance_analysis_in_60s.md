# [Linux] Linux Performance Analysis in 60s
> date - 2023.03.05  
> keyword - server, troubleshooting  
> [Linux Performance Analysis in 60,000 Milliseconds](https://netflixtechblog.com/linux-performance-analysis-in-60-000-milliseconds-accc10403c55)을 정리  

<br>

## TL;DR
* linux server 성능 이슈가 발생하여 접속시 아래 명령어들을 실행하여 확인해라
* CPU, Memory, Disk 등의 Utilization, Saturation, Error를 측정하여 bottleneck의 원인을 찾는 [USE Method](https://www.brendangregg.com/usemethod.html)의 일부분
```sh
$ uptime
$ dmesg | tail
$ vmstat 1
$ mpstat -P ALL 1
$ pidstat 1
$ iostat -xz 1
$ free -m
$ sar -n DEV 1
$ sar -n TCP,ETCP 1
$ top
```
> sysstat package 설치 필요


<br>

## uptime
```sh
$ uptime

07:14:20 up 278 days, 23:00,  1 user,  load average: 30.09, 25.02, 19.01  # 1분, 5분, 15분
```
* load average를 확인하여 I/O block 등으로 대기 중인 process를 확인
* 1분, 5분, 15분을 보면 load average를 보면 최근 상승했다는 것을 알 수 있다


<br>

## dmesg | tail
```sh
$ dmesg | tail

[1880957.563150] perl invoked oom-killer: gfp_mask=0x280da, order=0, oom_score_adj=0
[...]
[1880957.563400] Out of memory: Kill process 18694 (perl) score 246 or sacrifice child
[1880957.563408] Killed process 18694 (perl) total-vm:1972392kB, anon-rss:1953348kB, file-rss:0kB
[2320864.954447] TCP: Possible SYN flooding on port 7001. Dropping request.  Check SNMP counters.
```
* `dmesg`로 kernel log 확인
* 성능에 영향을 주는 `oom-killer(out of memory)`, `TCP request drop` 등을 확인할 수 있다


<br>

## vmstat 1
```sh
$ vmstat 1
procs ---------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
34  0    0 200889792  73708 591828    0    0     0     5    6   10 96  1  3  0  0
32  0    0 200889920  73708 591860    0    0     0   592 13284 4282 98  1  1  0  0
```
* `vmstat(virtual memory stat) 1`로 1초마다 정보를 보여준다
* 첫라인은 부팅 후 평균 값

| 항목 | 설명 |
|:--|:--|
| r | CPU에서 동작 중인 process count<br>**CPU saturation**(포화)가 발생했는지 알 수 있는 지표<br>r이 CPU보다 큰 경우 **CPU saturation**로 볼 수 있다 |
| free | free memory(KB)<br>|
| si, so | swap-in, swap-out<br>0이 아니라면 **memory가 부족**해 swap이 발생한 것 |
| us, sy, id, wa, st | **평균 CPU time 측정**<br>us - user time<br>sy - system(kerneal) time<br>id - idle<br>wa - wait I/P<br>st - stolen time, hypervisor가 vCPU를 서비스하는 동안 실제 CPU 사용 시간 |


<br>

## mpstat -P ALL 1
```sh
$ mpstat -P ALL 1

07:38:49 PM  CPU   %usr  %nice   %sys %iowait   %irq  %soft  %steal  %guest  %gnice  %idle
07:38:50 PM  all  98.47   0.00   0.75    0.00   0.00   0.00    0.00    0.00    0.00   0.78
07:38:50 PM    0  96.04   0.00   2.97    0.00   0.00   0.00    0.00    0.00    0.00   0.99
07:38:50 PM    1  97.00   0.00   1.00    0.00   0.00   0.00    0.00    0.00    0.00   2.00
```
* 각 CPU의 CPU time을 측정하여 CPU의 불균형한 상태를 확인
* 1개의 CPU만 일하고 있는 것은 application이 single thread로 동작한다는 의미


<br>

## pidstat 1
```sh
$ pidstat 1

07:41:02 PM   UID       PID    %usr %system  %guest    %CPU   CPU  Command
07:41:03 PM     0         9    0.00    0.94    0.00    0.94     1  rcuos/0
07:41:03 PM     0      4214    5.66    5.66    0.00   11.32    15  mesos-slave
07:41:03 PM     0      4354    0.94    0.94    0.00    1.89     8  java
```

* process당 `top`을 수행한 것과 비슷한데 변화를 추적하기 좋다


<br>

## iostat -xz 1
```sh
$ iostat -xz 1

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          73.96    0.00    3.73    0.03    0.06   22.21

Device:   rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
xvda        0.00     0.23    0.21    0.18     4.52     2.08    34.37     0.00    9.98   13.80    5.42   2.44   0.09
```
* block device의 동작을 확인

| 항목 | 설명 |
|:--|:--|
| r/s, w/s, rkB/s, wkB/s | r/s - 초당 read<br>w/s - 초당 write<br>rkB/s - read kB/s<br>wkB/s - write kB/s<br>어떤 요청이 가장 많이 들어오는지 화인할 수 있는 지표<br>과도한 I/O에 의해 성능 이슈가 발생할 수 있다 |
| await | I/O 평균 시간(ms 단위)<br>application이 I/O 요청을 enqueue하고 결과를 받는데 걸리는 시간<br>값이 클 경우 **block device saturation** 또는 block device에 문제가 있음을 알 수 있다 |


<br>

## free -m
```sh
$ free -m
             total       used       free     shared    buffers     cached
Mem:        245998      24545     221453         83         59        541
-/+ buffers/cache:      23944     222053
Swap:            0          0          0
```
* `buffers`, `cached`가 0에 가까우면 높은 Disk I/O가 발생하고 있음을 의미

| 항목 | 설명 |
|:--|:--|
| buffers | block device I/O buffer 사용량 |
| cached | file system page cache 사용량 |
| -/+ buffers/cache | 사용 중인 memory와 여유 memory |


<br>

## sar -n DEV 1
```sh
$ sar -n DEV 1

12:16:49 AM     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s   %ifutil
12:16:50 AM      eth0  19763.00   5101.00  21999.10    482.56      0.00      0.00      0.00      0.00
12:16:50 AM        lo     20.00     20.00      3.25      3.25      0.00      0.00      0.00      0.00
12:16:50 AM   docker0      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
```
* network throughput(Rx, Tx KB/s) 측정
* `eth0`를 보면 rxkB/s(수신량)이 22Mbytes/s(=176Mbits/s)로 한계인 1Gbit/s에 못미치는 값
* `%ifutil`
  * network device 사용률
  * 정확한 값을 가져오기 어렵다
  * [nicstat](https://github.com/scotte/nicstat)로도 측정 가능


<br>

## sar -n TCP,ETCP 1
```sh
$ sar -n TCP,ETCP 1

12:17:20 AM  active/s passive/s    iseg/s    oseg/s
12:17:21 AM      1.00      0.00   8359.00   6039.00

12:17:20 AM  atmptf/s  estres/s retrans/s isegerr/s   orsts/s
12:17:21 AM      0.00      0.00      0.00      0.00      0.00
```
* TCP 통신량 요약

| 항목 | 설명 |
|:--|:--|
| active/s | local에서 요청한 초당 TCP 연결(connection) 수(e.g. connect()를 통한 connection) |
| passive/s | remote에서 요청된 초당 TCP 연결 수(e.g. accept()를 통한 connection) |
| returns/s | 초당 TCP 재연결(retransmits) 수 |

* active, passive는 server의 부하를 대략적으로 측정하는데 편리
* `TCP retransmits`는 network, server가 처리할 수 있는 connection이 붙어서 packet drop이 발생하여 network, server에 이슈가 있음을 의미


<br>

## top
```sh
$ top

top - 00:15:40 up 21:56,  1 user,  load average: 31.09, 29.87, 29.92
Tasks: 871 total,   1 running, 868 sleeping,   0 stopped,   2 zombie
%Cpu(s): 96.8 us,  0.4 sy,  0.0 ni,  2.7 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem:  25190241+total, 24921688 used, 22698073+free,    60448 buffers
KiB Swap:        0 total,        0 used,        0 free.   554208 cached Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 20248 root      20   0  0.227t 0.012t  18748 S  3090  5.2  29812:58 java
```
* 위에서 확인한 다양한 지표를 쉽게 확인 가능하나 실시간이라 패턴을 파악하기에는 어렵다


<br><br>

> #### Reference
> * [Linux Performance Analysis in 60,000 Milliseconds](https://netflixtechblog.com/linux-performance-analysis-in-60-000-milliseconds-accc10403c55)
