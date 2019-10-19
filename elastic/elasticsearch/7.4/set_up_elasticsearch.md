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
TODO:

### Configuration system settings
TODO:

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
