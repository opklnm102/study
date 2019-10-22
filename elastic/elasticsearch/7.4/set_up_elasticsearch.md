# [ES] Set up Elasticsearch
> date - 2019.10.19  
> keyworkd - elasticsearch  
> [Set up Elasticsearch - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/master/setup.html)를 읽고 정리  
> Elasticsearch 7.4 기준  

<br>

## Installing Elasticsearch
TODO:

<br>

## Configuring Elasticsearch
TODO:


<br>

## Important Elasticsearch configuration
TODO:


<br>

## Important System Configuration
* 이상적으로 Elasticsearch는 서버에서 단독으로 실행되어 사용 가능한 모든 리소스를 사용해야 한다
* 기본적으로 허용되는 리소스보다 더 많은 리소스에 엑세스할 수 있도록 OS를 설정해야 한다

<br>

### Production 운영 전 필수 설정
* Disable **swapping**
* Increase **file descriptors**
* Ensure sufficient **threads**
* **JVM DNS cache** settings
* **Temporary directory** not mounted with `noexec`

<br>

### Development mode vs production mode
* `development mode`
  * default
  * 필수 설정을 하지 않아도 warn log만 출력되고, 실행 가능
* `production mode`
  * `network.host` 같은 network 설정시 `production mode`가 된다
  * 필수 설정을 하지 않으면 exception이 발생하여 실행할 수 없다

<br>

### Configuration system settings
* system setting은 설치 방법과 OS에 따라 다르다

<br>

#### ulimit
* 일시적으로 resource limit 변경
* `.zip`, `.tag.gz` package를 사용했을 때 system setting 방법
* `ulimit -n` - open files
  * current session부터 바로 적용된다

```sh
## change max number of open files
$ sudo ulimit -n 65535  

## check currently applied limits
$ ulimit -a
...
max memory size         (kbytes, -m) unlimited
open files                      (-n) 106553524
...
```

<br>

#### `/etc/security/limits.conf`
* 영구적으로 resource limit 변경
  * 파일 수정 후 new session부터 적용된다
* `.zip`, `.tag.gz` package를 사용했을 때 system setting 방법
* e.g. elasticsearch user의 open files limit를 변경
```sh
## add below content to /etc/security/limits.conf
elasticsearch - nofile 65535
```

<br>

#### system configuration 
* `RPM`, `Debian` package인 경우 system setting 방법
  * `systmed`를 사용한다면 `systemd`를 통해 system setting을 수정해야 한다
* system setting 파일을 수정
  * RPM - `/etc/sysconfig/elasticsearch`
  * Debian - `/etc/default/elasticsearch`

<br>

#### systmed
* default limit는 systemd service file(`/usr/lib/systemd/system/elasticsearch.service`)에 정의되어 있다
* override하기 위해 `/etc/systemd/system/elasticsearch.service.d/override.conf` 파일 추가하거나, `sudo systemctl edit elasticsearch` 명령어 사용 후 아래 내용 추가
```
[Service]
LimitMEMLOCK=infinity
```

* 수정한 설정 적용
```sh
$ sudo systemctl daemon-reload
```

<br>

> 요즘은 `init.d`보다 `systemd`를 많이 사용하므로 이 방법으로만 설정하면 통일성을 가지므로 관리에 용이할 듯

<br>

### Disable swapping
* 대부분의 OS는 filesystem cache에 가능한 많은 memory를 사용하려고하며, 되도록이면 사용하지 않는 application memory를 swap out한다
* 이 결과로 JVM heap의 일부 또는 executable page가 disk로 swap out될 수 있다
* swapping은 **performance**와 **node stability**에 좋지 않으므로 사용하지 않아야 한다
  * GC가 milliseconds가 아닌 minutes 동안 지속될 수 있고, node가 느리게 응답하거나, cluster와의 연결이 끊어질 수도 있다
* resilient distribute system에서는 memory가 부족한 경우라면 OS가 node를 강제 종료시키는게 더 효과적
* 3가지 방법으로 swap disable할 수 있고, 권장하는 것은 **완전히 swap을 disable** 하는 것
  * 불가능하다면 swappiness vs memory locking을 최소화할지는 환경에 따라 다르다

<br>

#### 1. Disable all swap files
* Elasticsearch의 memory는 JVM option으로 제어하므로 swap을 활성화할 필요는 없다

<br>

* Linux에서 swap을 일시적으로 비활성화
  * Elasticsearch restart 불필요

```sh
$ sudo swapoff -a
```

<br>

* Linux에서 swap을 영구적으로 비활성화
  * `/etc/fstab`에서 `swap`이라는 단어가 포함된 행을 주석 처리

<br>

* window
  * `System Properties → Advanced → Performance → Advanced → Virtual memory`에서 paging file을 비활성화

<br>

#### 2. Configure swappiness
* sysctl의 `vm.swappiness`를 1로 설정하여 kernel의 swap tendency를 감소
* 정상적인 상황에서는 swap으로 이어지진 않지만, 시스템 장애 발생시 swap될 수 있다

<br>

#### 3. Enable bootstrap.memory_lock
* Linux/Unix의 [mlockall](https://pubs.opengroup.org/onlinepubs/007908799/xsh/mlockall.html) 또는 Window의 [VirtualLock](https://docs.microsoft.com/ko-kr/windows/win32/api/memoryapi/nf-memoryapi-virtuallock?redirectedfrom=MSDN)을 사용
* process address space를 Ram에 lock하여 Elasticsearch memory가 swap되지 않도록 하는 것

```yml
## config/elasticsearch.yml

bootstrap.memory_lock: true
```

> mlockall로 인해 사용 가능한 것보다 많은 memory 할당시 JVM 또는 shell session이 종료될 수 있다

* Node Info API에서 설정을 확인할 수 있다
```json
GET _nodes?filter_path=**.mlockall

{
  "nodes": {
    "M8XNNm5-Rf2IbXaVdbpwkg": {
      "process": {
        "mlockall": false  // here
      }
    },
    ...
  }
}
```
* false면 mlockall request가 실패했음을 의미하고, `Unable to lock JVM Memory`라는 log도 출력

<br>

#### Linux에서 가장 가능성 높은 이유는 Elasticsearch를 시작하는 user에게 권한이 없기 때문
* `.zip`, `.tar.gz`라면 Elasticsearch start 전에 `root`로 `ulimit -l unlimited` 실행 or `/etc/security/limits.conf`에서 `memlock`을 `unlimited`로 설정
* `RPM`, `Debian`이라면 `system configuration file(or systemd)`에 아래와 같이 설정
```sh
## RPM - /etc/sysconfig/elasticsearch
## Debian - /etc/default/elasticsearch
MAX_LOCKED_MEMORY=unlimited
```
* `systemd`를 사용하는 System이라면
```sh
$ sudo systemctl edit elasticsearch

## 아래 내용 추가
LimitMEMLOCK=infinity

$ sudo systemctl daemon-reload
```

<br>

#### 또 다른 이유는 JNA temporary directory가 noexec option으로 mount되어서
* `ES_JAVA_OPTS` 환경 변수 또는 `jvm.options` file에서 JNA에 새로운 temporary directory를 지정해서 해결
```sh
$ export ES_JAVA_OPTS="ES_JAVA_OPTS -Djna.tmpdir=<path>"
$ ./bin/elasticsearch
```

<br>

### File Descriptors
> * Linux, macOS에만 설정 필요
> * Windows에서 JVM은 사용 가능한 리소스에서 제한된 [API](https://docs.microsoft.com/ko-kr/windows/win32/api/fileapi/nf-fileapi-createfilea?redirectedfrom=MSDN)를 사용하므로 설정 불필요

<br>

* Elasticsearch는 많은 `file descriptor` or `file handles`를 사용
* `file descriptor`가 부족하면 data loss가 발생할 수 있기 때문에 open files descriptors limit를 65,536 이상으로 설정해야 한다

<br>

#### .zpi, .tar.gz
* `ulimit` 명령어를 사용
```sh
$ ulimit -n 65535
```

* 또는 `/etc/security/limits.conf` 파일 수정
```sh
$ vi /etc/security/limits.conf

## add below content to /etc/security/limits.conf
elasticsearch - nofile 65535
```

<br>

#### macOS
* `-XX:-MaxFDLimit` JVM option 설정

<br>

#### RPM, Debian
* default로 65535가 설정되어 있으므로 추가 설정 불필요

<br>

#### Check file descriptors
* [Nodes Stats API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html)를 사용
```json
GET /_nodes/stats/process?filter_path=**.max_file_descriptors&pretty

{
  "nodes": {
    "M8XNNm5-Rf2IbXaVdbpwkg": {
      "process": {
        "max_file_descriptors": 1048576
      }
    },
    ...
  }
}
```

<br>

### Virtual memory
* Elasticsearch는 default로 [mmapfs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-store.html#mmapfs) directory에 index를 저장
* default mmap count OS limit가 낮아서 out of memory exception이 발생할 수 있기 때문에 증가 필요
```sh
$ sysctl -w vm.max_map_count=262144

## check 
$ sysctl vm.max_map_count
```
* 영구적으로 설정할려면 `/etc/sysctl.conf`에서 설정
* `RPM`, `Debian` package는 설정 불필요

<br>

### number of threads
* Elasticsearch는 **operation별로 thread pool을 사용**
  * 필요할 때마다 thread를 생성할 수 있어야 한다
* Elasticsearch가 생성할 수 있는 **thread는 최소 4096개**

<br>

#### nproc 설정 필요
* `ulimit` 사용
```sh
$ ulimit -u 4096
```

* 또는 `/etc/security/limits.conf` 파일 수정
```sh
$ vi /etc/security/limits.conf

## add below content to /etc/security/limits.conf
elasticsearch - nproc 4096
```
* `systemd`에서 service로 실행했다면 설정 불필요

<br>

### DNS cache settings
* Elasticsearch는 security manager와 함께 실행
* JVM은 기본적으로 DNS를 cacheing
  * positive hostname resolution - **무한정**
  * negative hostname resolution - **10초 동안**

* Elasticsearch는 default positive hostname resolution을 **override하여 60초 동안 caching**
  * DNS resolution이 시간에 따라 변하는 환경을 포함하여 대부분의 환경에도 적합해야 한다
  * 그렇지 않은 경우, JVM option에서 `es.networkaddress.cache.ttl`, `es.networkaddress.cache.negative.ttl`를 수정
* `es.networkaddress.cache.ttl`, `es.networkaddress.cache.negative.ttl`를 제거하지 않으면 Java security policy의 `networkaddress.cache.ttl`, `networkaddress.cache.negative.ttl`이 무시 된다

<br>

### JNA temporary directory not mounted with `noexec`
* Elasticsearch는 platform-dependent native code를 위해 JNA(Java Native Access) library를 사용
* Linux에서 library를 지원하는 native code는 JNA archive에서 runtime시 추출
  * default로 Elasticsearch temporary directory인 `/tmp`에 추출
  * JVM flag `Djna.tmpdir=<path>`로 제어 가능
* native library가 **실행 파일로 JVM virtual address space에 mapping**되는데 code가 추출되는 위치의 mount point는 `noexec`로 mount되면 안된다
  * JVM process가 code를 실행 파일로 mapping할 수 없기 때문
* `noexec`로 mount되면 시작시 `faild to map segment from shared object` 메시지와 `java.lang.UnsatisfiedLinkerError`를 볼 수 있다
  * exception message는 JVM 버전마다 다를 수 있다
* exception 발생시 **JNA에 사용된 temporary directory를 `noexec`가 아니게 remount** 해야 한다

<br>

## Bootstrap Checks
TODO:

### Heap size check
TODO:

### File descriptor check
TODO:

### Memory lock check
* JVM에서 Major GC를 수행하면 heap의 모든 page에 닿는다
* 어떤 page라도 disk로 swap out되었다면 memory로 다시 swap in 필요
* swap 발생시 Elasticsearch가 request를 처리하는데 **훨씬 많은 disk thrashing 발생**
* swapping disable에는 여러 방법이 있다
  * [Disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html) 참고
* `bootstrap.memory_lock`으로 JVM에 `mlockall(Unix)`, `virtual lock(Windows)`을 통해 memory에 heap을 lock하도록 설정
  * elasticsearch를 시작한 user에게 memlock unlimited가 없는 경우처럼 Elasticsearch가 heap을 lock할 수 없을 수 있다
* memory lock check는 `bootstrap.memory_lock`이 enabled인 경우 JVM이 heap을 lock할 수 있는지 확인


<br>

### Maximum number of threads check
TODO:

<br>

### Max file size check
TODO:

<br>

### Maximum size virtual memory check
TODO:

<br>

### Client JVM check
TODO:

<br>

### Use serial collector check
TODO:

<br>

### System call filter check
TODO:

<br>

### OnError and OnOutOfMemoryError checks
TODO:

<br>

### Early-access check
TODO:

<br>

### G1GC check
* JDK 8의 HotSpot JVM은 G1 GC를 사용하면 index corruption 가능성이 있다
* 영향을 받는 JDK 8u40 이전의 JVM은 G1GC check로 감지할 수 있다

<br>

### All permission check
TODO:

<br>

### Discovery configuration check
TODO:

<br>

## Starting Elasticsearch
TODO:

<br>

## Stopping Elasticsearch
TODO:


<br>

## Adding nodes to your cluster
TODO:


<br>

## Set up X-Pack
TODO:


<br>

## Configuring X-Pack Java Clients
TODO:


<br>

## Bootstrap Checks for X-Pack
TODO:



<br><br>

> #### Reference
> * [Set up Elasticsearch - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/master/setup.html)
