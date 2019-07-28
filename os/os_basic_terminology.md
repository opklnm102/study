# [OS] Basic terminology
> date - 2019.07.28  
> keyword - computer science fundamentals  
> OS 기초 공부시 접할 수 있는 용어에 대해 정리 

<br>

## CPU

### User time
* 일정 시간 동안 User Process(Thread)가 CPU를 사용한 시간

<br>

### Kernel time
* system time
* 일정 시간 동안 Kernel Process(Thread)가 CPU를 사용한 시간

<br>

### CPU time
* user time + kernel time

<br>

### Wait time
* CPU 대기 시간
* CPU에서 running 중인 process가 Disk, Network I/O를 요청했을 경우, 이에 따른 소요 시간
* 높은 wait time은 Disk, Network I/O 성능과 관련되어 있으므로 I/O 병목 현상 가능성이 높다

<br>

### Idle time
* CPU 휴식 시간
* 일정 시간 동안 CPU가 사용되지 않은 시간

<br>

### Run queue
* CPU 자원을 기다리고 있는 Run Queue(Dispatch Queue)상의 kernel thread 수
* CPU 병목 현상을 판단하는 대표적인 지표
* Run Queue는 CPU의 개수와는 무관하게 kernel level에서의 하나의 Queue로 통합되어 관리

<br>

### Wait queue
* CPU 상에서 running 중이던 process가 data의 I/O 요청 후 I/O가 끝나기를 기다리는 곳
* I/O 성능에 따라 대기 시간이 다르다
* 느린 Disk I/O가 병목의 원인일 수 있다

<br>

### Swap queue
* process가 CPU에서 Running 중이지만 physical memory에 위치하지 않고, virtual memory의 swap disk 영역에 위치하고 있는 process 숫자

<br>

### Load average
* run queue에서 대기 중인 process(thread)의 평균 수
* CPU 병목 현상은 run queue에서 대기하고 있는 process의 thread 수보다 cpu에서 running 중인 process의 특징과 성격에 직접적으로 영향을 받는다
* run queue에 대기 중인 process(thread)가 많다는 것은 CPU reuqest에 비해 CPU resource가 부족하다는 것을 의미 -> 병목
* load avg 1, 5, 15 - 최근 1분, 5분, 15분 동안 CPU 자원을 할당받기를 기다리는 process(thread)의 평균 수


<br>

## Memory

### Physical memory
* 실제 physical memory 공간(주기억장치)

<br>

### Virtual memory
* 실행하는 process의 양이 많아질 경우 사용하지 않는 process를 옮겨두는 보조기억장치 내의 영역
* physical memory보다 큰 memory의 process를 실행 가능하게 한다

<br>

### Swap
* memory에서 page, segment 단위의 데이터를 교환하는 것

#### Swaping
* memory보다 큰 데이터를 다룰 수 있는 기술
* process 전체 혹은 일부를 main memory와 swap space간에 이동하는 것
* virtual memory에서는 paging으로 swaping

#### Swap In
* process 전체 혹은 일부를 swap space에서 main memory로 load하는 것
* swap space -> main memory

#### Swap Out
* memory가 부족한 경우, main memory의 여유 공간을 위해 main memory에서 swap space로 이동시키는 것
* main memory -> swap space

<br>

### Page
* virtual memory를 사용하는 시스템에서 swap space에서 main memory로, 또는 그 반대로 1번에 이동할 수 있는 데이터 단위
* paging은 swaping의 한 방식

#### Page scan rate
* 적절량의 free memory를 확보하려는 page daemon의 활동 비율
* 지속적인 scanning은 memory 병목 현상의 시작을 의미할 수 있다
* memory 병목은 Disk I/O 성능에 가장 직접적인 영향을 미친다

#### Page free
* memory에 어떠한 주소 공간도 할당되지 않은 free page 수
* `vmstat`에서 free

#### Page in
* page fault가 발생한 경우 swap space로부터 main memory로 page load 하는 것
* swap space -> main memory

#### Page out
* memory가 부족한 경우, main memory의 여유 공간을 위해 main memory에서 swap space로 page를 이동시키는 것
* main memory -> swap space

#### Page fault
* virtual memory를 사용하는 시스템에서 access하려는 page가 main memory에 없는 경우
* page fault가 발생하면 OS는 page in 수행

#### Major page fault
* physical memory에 page가 없을 때, mapping된 memory의 physical page를 가지고 있지 않은 segment에 의해 maaping된 virtual memory에 access할 때 발생

#### Minor fault
* 무효 page에 대한 참조 횟수
* physical memory에 page가 있고, segment에 있지만, 현재 MMU translation이 physical memory에서 주소 공간으로 이루어지지 않는 virtual memory에 access할 때 발생

#### Reclaim
* cache list에 page가 있을 때, cache list에서 page를 리턴 후 제거하는 것
* `vmstat`의 re

<br>

## Disk I/O

### Service time(ms)
* Disk I/O의 request가 처리되는 시간
* queue에서 지연되는 시간 제외

<br>

### Response time
* Process가 Disk I/O로 request한 data를 반환하는데 걸린 시간

<br>

### Run time
* queue에서 제거 후 완료되기 전까지 실질적인 read/write servie time

<br>

### Wait
* disk service를 기다리는 read/write의 평균 수(queue length)

<br>

### Wait time(%)
* read/write가 disk service를 기다리는 시간
* queue가 비워지지 않은 시간 비율
 
<br>

### Reads
* disk로부터 read를 수행한 횟수

<br>

### Writes
* disk로부터 write를 수행한 횟수

<br>

### Hard error
* kernel level에서 device driver를 통해 HW를 컨트롤하는 과정에서 발생하는 에러
* 지속적으로 증가시 HW의 물리적인 고장을 예상할 수 있다

<br>

### Soft error
* user level에서 os level로 data 또는 system call 전송 과정에서 발생하는 에러
* 잘못된 system call/kernel libary 호출시, HW 오류로 잘못된 data 전송시 발생할 수 있다


<br>

## Network

### Output error rate
* send error rate
* 송신 에러율
* HW interface, data transceiver 불량시 발생할 수 있다

<br>

### Input error rate
* receive error rate
* 수신 에러율
* 논리적/물리적 결함으로 인헤 발생
  * 같은 network의 중복 IP 주소
  * Bad Transceiver
  * Hub, Switch, Router 등의 port 결함

<br>

### Send rate(bytes/sec)
* 송신량
* network interface card를 통해 송신된 byte

<br>

### Receive rate(bytes/sec)
* 수신량
* network interface card를 통해 수신된 byte

<br>

### Collision rate
* 충돌율
* `collision rate = output collisions / total output packet * 100`
* packet collision rate로 시스템의 network 성능 및 오류 여부 판단

<br>

### Unicast
* network에서 1:1 통신
* 단일 송신자와 단일 수신자간의 통신을 의미

<br>

### Physical address
* MAC(Media Access Controll) address
* network card를 구별하는 48bit HW address
  * 제조사에 의해 유일한 값 부여
* 이더넷 주소 또는 토큰링 주소와 동일

<br>

### Hop
* packet이 목적지에 도달하기 위해 통과해야 하는 각각의 router


<br>

## Process

### Command
* process 이름

<br>

### User name
* user id
* process를 실행시킨 사용자 이름

<br>

### tty
* process가 실행된 tty

<br>

### Process ID
* PID
* OS에서 각 process를 식별하기 위해 부여되는 ID

#### PPID
* process를 실행한 Parent Process ID

<br>

### Size
* Process의 `code + data + stack space` size

<br>

### Resident size
* shared binaries, libraries를 포함한 process가 소유하고 있는 physical memory size

<br>

### Shared library size
* 시스템 상의 다른 process들과 library를 공유하는 physical memory size

<br>

### Shared size
* binary와 libary를 포함한 시스템 상의 다른 process와 공유하는 physical memory size

<br>

### Private size
* 다른 process와 공유하지 않는, process에 mapping된 physical memory size

<br>

### Nice
* nice amount
* process의 scheduling priority

<br>

### State
* process는 주변 사항에 따라 상태가 변경된다
* running, waiting, stopped, zombie

#### Running
* CPU에 할당되어 있는 process 상태

#### Active
* CPU 자원을 할당받아 실행되고 있는 상태

#### Waiting
* 대기 상태
* 실행 중이던 process가 I/O 명령을 내거나 synchronizing을 위해 event를 기다릴 때

#### Sleeping
* waiting과 마찬가지로 수행 중이던 process가 CPU를 일시적으로 포기한 상태
* 자원이 사용 가능하게 되는 예상 시간에 따라 짧으면 sleeping, 길면 waiting

#### Zombie
* parent process가 거두어 들이지 못한 child process

<br>

### CPU time
* 특정 process가 CPU를 kernel mode, user mode에서 사용한 시간


<br>

## File System

### Inode
* identification node
* OS에서 파일이 생성될 때 부여되는 **고유번호**
* OS는 파일의 이름이 아닌 **inode로 인식**
* 파일 관리를 위한 정보를 소유
  * 소유자
  * 크기
  * 마지막 접근/수정 시간
  * inode가 관리하는 파일의 block 위치 등
* inode 저장 공간의 사용률이 100%가 되면 disk size가 남아 있어도 더 이상 저장 불가

<br>

### DNLC
* **Directory Name Lookup Cache**
* CPU에서 running 중인 process에 의해 1번 읽혀진 파일의 접근 경로는 memory의 DNLC에 caching

#### DNLC hit rate
* 사용자가 파일에 접근할 때 DNLC에서 찾는 비율

#### DNLC lookup
* DNLC lookup time

<br>

### Mount
* device를 directory처럼 사용하기 위해 `device와 directory를 연결`하는 작업



<br><br>

> #### Reference
> 
