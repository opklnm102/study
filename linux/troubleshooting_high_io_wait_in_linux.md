# [Linux] Troubleshooting High I/O Wait in Linux
> [Troubleshooting High I/O Wait in Linux](http://bencane.com/2012/08/06/troubleshooting-high-io-wait-in-linux/)에서 I/O Wait를 해결하는 과정을 요약


## I/O wait 문제를 해결하기 어려운 이유
* 시스템이 I/O bound에 있다고 알려주는 tool은 많지만 문제를 특정 프로세스로 좁힐 수 없기 때문


> #### I/O wait
> * CPU가 idle이지만 I/O가 완료되기를 기다리는 시간
> * 빠른 CPU를 사용하게 되면 I/O wait이 증가할 수 있다
>    * 100%지만 정상 시스템
>    * 0%지만 disk 병목현상을 보이는 시스템
> * I/O wait이 높다고 무작정 I/O 성능에 문제가 있다고 볼 수 없다
>    * CPU가 disk가 처리할 수 있는 IOPS 이상으로 요청하는 경우  


## I/O로 인해 시스템 속도가 느려지는지 진단하기
* 가장 쉬운 방법은 `top` 사용
* CPU 라인에서 I/O 대기 상태의 현재 CPU 백분률을 볼 수 있다
   * 96.0%wa
   * `wa` - iowait
* 숫자가 높을수록 I/O Access를 기다리는 CPU 리소스가 많다는 뜻

```sh
$ top
top - 14:31:20 up 35 min, 4 users, load average: 2.25, 1.74, 1.68
Tasks: 71 total, 1 running, 70 sleeping, 0 stopped, 0 zombie
Cpu(s): 2.3%us, 1.7%sy, 0.0%ni, 0.0%id, 96.0%wa, 0.0%hi, 0.0%si, 0.0%st
Mem: 245440k total, 241004k used, 4436k free, 496k buffers
Swap: 409596k total, 5436k used, 404160k free, 182812k cached
```


## write 중인 disk 찾기
* `top`은 시스템 전체에서 I/O Wait를 표시하지만, 어떤 disk가 영향을 받고 있는지는 알려주지 않는다
* `iostat` 사용

```sh
# basic usage
$ iostat
Linux 4.4.0-71-generic (dong-WA50SBQ)     2018년 05월 11일     _x86_64_    (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.14    0.60    0.79   11.58    0.00   84.89

Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               0.25         8.54         0.00       6264          0
sdb              50.24      1269.21       503.48     930867     369260

$ iostat -x 2 5
avg-cpu: %user %nice %system %iowait %steal %idle
  3.66 0.00 47.64 48.69 0.00 0.00

Device: rrqm/s wrqm/s r/s w/s rkB/s wkB/s avgrq-sz avgqu-sz await r_await w_await svctm %util
# %utilized -> 111.41% sda에 write하는 프로세스에 문제가 있다는 것을 나타내는 좋은 지표
# rrqm/s & wrqm/s, r/s & w/s 등을 보았을 때 무언가를 read하여 write하는 걸로 보인다 -> 문제가 되는 프로세스 식별시 사용할 지표
sda 44.50 39.27 117.28 29.32 11220.94 13126.70 332.17 65.77 462.79 9.80 2274.71 7.60 111.41
dm-0 0.00 0.00 83.25 9.95 10515.18 4295.29 317.84 57.01 648.54 16.73 5935.79 11.48 107.02
dm-1 0.00 0.00 57.07 40.84 228.27 163.35 8.00 93.84 979.61 13.94 2329.08 10.93 107.02
```
* iostat 2 5
   * 5초 간격으로 2초마다 출력
* iostat -x
   * 확장된 report 출력
* iostat -x 2 5
   * 5초 간격으로 2초마다 확장된 report 출력
* 1번째 report는 시스템이 마지막으로 부팅된 시간을 기반으로 통계 인쇄
   * 대부분의 상황에서 1번째 보고서 무시
* 1번째 후 보고서는 이전 간격이후 시간을 기반으로 report
   * ex. 2번째 보고서는 1번째 보고서 출력 후 수집된 디스크 통계
* 시스템에 `disk가 여러개일 경우` 유용
* 어떤 프로세스가 I/O를 사용하는지 범위를 좁힐 수 있다

> * rrqm/s & wrqm/s - read and write requests per millisecond
> * r/s & w/s - reads and writes per second


## High I/O를 일으키는 process 찾기

```sh
# iotop
Total DISK READ: 8.00 M/s | Total DISK WRITE: 20.36 M/s
 TID PRIO USER DISK READ DISK WRITE SWAPIN IO> COMMAND
15758 be/4 root 7.99 M/s 8.01 M/s 0.00 % 61.97 % bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
...
```

* `iotop`
* storage를 가장 많이 이용하는 프로세스를 찾는 가장 간단한 방법
* 통계를 살펴본 후 bonnie++가 가장 많은 I/O 사용률을 유발하는 프로세스임을 쉽게 식별할 수 있다
* 모든 linux 배포판에 기본으로 설치되어 있지 않다
   * 기본 명령어가 아닌것에 의존하지 말자


## iotop을 사용할 수 없는 경우에 high I/O process 찾기

### 1. ps
* 메모리 및 CPU 통계는 있지만 disk I/O 통계는 없지만 프로세스 상태로 I/O를 가다리는지 알 수 있다

```
PROCESS STATE CODES
 D uninterruptible sleep (usually IO)  // 일반적으로 I/O를 기다리는 상태
 R running or runnable (on run queue)
 S interruptible sleep (waiting for an event to complete)
 T stopped, either by a job control signal or because it is being traced.
 W paging (not valid since the 2.6.xx kernel)
 X dead (should never be seen)
 Z defunct ("zombie") process, terminated but not reaped by its parent.
```

* 10초 간격으로 5초마다 D 상태의 프로세스를 출력
```sh
$ for x in `seq 1 1 10`; do ps -eo state,pid,cmd | grep "^D"; echo "----"; sleep 5; done
D 248 [jbd2/dm-0-8]
D 16528 bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
----
D 22 [kswapd0]
D 16528 bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
----
D 22 [kswapd0]
D 16528 bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
----
D 22 [kswapd0]
D 16528 bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
----
D 16528 bonnie++ -n 0 -u 0 -r 239 -s 478 -f -b -d /tmp
----
```
* bonnie++ 프로세스(pid 16528)는 다른 프로세스보다 I/O를 더 자주 기다리고 있다
* I/O 대기를 유발할 수 있지만, 상태가 D(uninterruptible sleep)기 때문에 I/O wait의 원인이라고 말할 수는 없다
   
   
### 2. /proc/{pid}/io 파일
* 의심스러운 점을 확인하기 위해 `/proc 파일 시스템`을 이용
* 각 프로세스 directory에는 iotop과 동일한 I/O 통계를 저장하는 `io`파일이 존재

```
# cat /proc/16528/io
rchar: 48752567
wchar: 549961789
syscr: 5967
syscw: 67138
read_bytes: 49020928
write_bytes: 549961728
cancelled_write_bytes: 0
```

* `read_bytes`, `write_bytes`
   * 프로세스가 storage에서 읽고 쓴 byte
* 46MB를 읽고, 542MB를 disk에 썼다
* 일부 프로세스의 경우 작업이 많지 않을 수 있지만 충분한 R/W만으로 시스템 대기 시간이 길어질 수 있다


## 어떤 파일에 너무 많이 쓰고 있는지 찾기

### `lsof`(list open files)
* 시스템에 열린 모든 파일 정보 출력(사용중인 프로세스, 디바이스 정보, 파일 종류 등)를 표시
* 파일의 크기와 `/proc 내의 io 파일`에 있는 정보를 기준으로 어떤 파일에 write되는지 추측

* 범위를 좁히기 위해 `-p <pid>`로 특정 프로세스 ID로 열린 파일만 출력
```sh
# lsof -p 16528
COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
bonnie++ 16528 root cwd DIR 252,0 4096 130597 /tmp
<truncated>
bonnie++ 16528 root 8u REG 252,0 501219328 131869 /tmp/Bonnie.16528
bonnie++ 16528 root 9u REG 252,0 501219328 131869 /tmp/Bonnie.16528
bonnie++ 16528 root 10u REG 252,0 501219328 131869 /tmp/Bonnie.16528
bonnie++ 16528 root 11u REG 252,0 501219328 131869 /tmp/Bonnie.16528
bonnie++ 16528 root 12u REG 252,0 501219328 131869 <strong>/tmp/Bonnie.16528</strong>
```

### df
* 위의 파일들이 쓰여지는지 확인하기 위해 `/tmp`가 sda의 일부인지 확인
```sh
# df /tmp
Filesystem 1K-blocks Used Available Use% Mounted on
/dev/mapper/workstation-root 7667140 2628608 4653920 37% /
```
* /tmp가 workstation volume group의 root 논리 volume의 일부임을 판별할 수 있다

### pvdisplay
```sh
# pvdisplay
--- Physical volume ---
PV Name /dev/sda5
VG Name workstation
PV Size 7.76 GiB / not usable 2.00 MiB
Allocatable yes
PE Size 4.00 MiB
Total PE 1986
Free PE 8
Allocated PE 1978
PV UUID CLbABb-GcLB-l5z3-TCj3-IOK3-SQ2p-RDPW5S
```
* /tmp가 있는 workstation volume group의 파티션은 sda의 /dev/sda5 파티션이다
* 위 정보들을 종합하면 `lsof에 나열된 대용량 파일`이 자주 R/W되는 파일일 가능성이 높다고 할 수 있다


> #### 참고
> * [Troubleshooting High I/O Wait in Linux](http://bencane.com/2012/08/06/troubleshooting-high-io-wait-in-linux/)
> * [%iowait에 대한 이해](http://seaking.tistory.com/28)
