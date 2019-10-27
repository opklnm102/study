# [ES] Bootstrap Checks
> date - 2019.10.19  
> keyworkd - elasticsearch  
> [Bootstrap Checks - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks.html)를 읽고 정리  
> Elasticsearch 7.4 기준  

<br>

* important configuration를 구성하지 않아서 예측하지 못한 문제가 발생하는 경우가 많다
* configuration 중 잘못된 것은 warning level로 logging
* configuration에 주의를 기울일 수 있게 **bootstrap check**를 수행한다
* bootstrap check로 다양한 Elasticsearch setting과 system setting을 검사


<br>

## Development mode vs production mode
* Elasticsearch는 default로 HTTP 및 transport(internal) communication을 위해 loopback address에 binding
* Cluster에 join하려면 transport communication을 통해 node에 도달해야 한다
  * non-loopback address binding
  * single-node discovery 미사용
* `development mode`
  * default
  * 필수 설정을 하지 않아도 warn log만 출력되고, 실행 가능
* `production mode`
  * **non-loopback address**를 통해 cluster join이 가능한 경우
  * `http.host`, `transport.host`로 HTTP와 transport를 독립적으로 설정 가능
  * 필수 설정을 하지 않으면 exception이 발생하여 실행할 수 없다


<br>

## Single-node discovery
* Transport client testing을 위해 external transport에 binding해야 하는 경우 `single-node discovery` 사용
```yml
discovery.type: single-node
...
```
* `single-node discovery`는 자체적으로 master election하고, 다른 node를 cluster에 join 시키지 않는다


<br>

## Forcing the bootstrap check
* Single node를 production에서 사용 중인 경우 bootstrap check skip하는데, 이런 경우 `es.enforce.bootstrap.checks: true`로 bootstrap check 가능
  * external interface를 transport에 binding하지 않거나, `single-node discovery`를 사용하는 경우
  * 환경 변수로 설정하려면 `ES_JAVA_OPTS=Des.enforce.bootstrap.checks=true` 사용


<br>

## Heap size check
* initial heap과 max heap size가 다르게 설정된 경우 JVM heap resizing시에 pause 발생
* pause를 피하기 위해 **initial heap과 max heap size를 동일**하게 시작하는게 좋다
* `bootstrap.memory_lock`을 사용하면 시작시 JVM이 initial heap size를 memory locking
  * 만약 initial heap과 max heap이 같지 않으면 모든 JVM heap이 memory lock되지 않는다
* heap size check를 pass하려면 **heap size를 설정**해야 한다


<br>

## File descriptor check
* File descriptor는 unix에서 open file tracking을 위해 사용
  * unix에서는 모든 것이 file
  * e.g. physical file, virtual file(/prc/loadavg), network socket
* Elasticsearch는 **많은 file descriptor 필요**
  * 모든 shard는 여러 segment 및 기타 파일로 구성되므로, 다른 node와의 connection 등
* file descriptor check는 OS X, Linux에서 수행
* file descriptor check를 pass하려면 **file descriptor 설정**을 해야한다


<br>

## Memory lock check
* JVM에서 Major GC를 수행하면 heap의 모든 page에 닿는다
* 어떤 page라도 disk로 swap out되었다면 memory로 다시 swap in 필요
* swap 발생시 Elasticsearch가 request를 처리하는데 **훨씬 많은 disk thrashing 발생**
* swapping disable에는 여러 방법이 있다
  * [Disable swapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html) 참고
* `bootstrap.memory_lock`으로 JVM에 `mlockall(Unix)`, `virtual lock(Windows)`을 통해 memory에 heap을 lock하도록 설정
  * elasticsearch를 시작한 user에게 memlock unlimited가 없는 경우처럼 Elasticsearch가 heap을 lock할 수 없을 수 있다
* memory lock check는 `bootstrap.memory_lock`이 enabled인 경우 JVM이 heap을 lock할 수 있는지 확인


<br>

## Maximum number of threads check
* Elasticsearch는 request를 여러 stage로 나누고, 각 stage별로 `thread pool executors`를 사용
* 다양한 작업을 위한 `thread pool executors`가 있어서 많은 thread를 생성할 수 있어야 한다
* maximum number of threads check는 충분한 thread를 생성할 수 있는지 검사
  * Linux에서만 수행
  * 최소 4096개의 thread를 생성할 수 있어야 한다
  * `/etc/security/limits.conf`에 `nproc` 설정
  * root user의 limit도 증가시켜야할 수도 있다


<br>

## Max file size check
* shard의 component인 `segment file`과 translog의 component `translog generations`이 GB 이상으로 커질 수 있다
* Elasticsearch process가 생성할 수 있는 max size limit 때문에 file write가 실패할 수 있다
* max file size check로 max file size가 unlimited인지 검사
  * `/etc/security/limits.conf`에 `fsize` 설정
  * root user의 limit도 증가 필요


<br>

## Maximum size virtual memory check
* Elasticsearch와 Lucene는 `mmap`을 사용해 index를 Elasticsearch address space에 mapping
* Index data를 JVM heap에서 유지하지만, **빠른 access를 위해 memory에 유지하기 때문에 Elasticsearch는 unlimited address space가 필요**
* maximum size virtual memory check는 Elasticsearch process에 limited address space를 검사
  * Linux에서만 수행
  * `/etc/security/limits.conf`에 `as` 설정
  * root user의 limit도 증가시켜야할 수도 있다


<br>

## Maximum map count check
* `mmap`을 효과적으로 사용하기 위해 Elasticsearch에서 **많은 memory-mapped area를 생성**할 수 있어야한다
* maximum map count check는 **최소 262,144개의 memory-mapped area를 허용**하는지 검사
  * Linux에서만 수행
  * index에 `mmapfs`, `hybridfs`를 [store type](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-store.html)으로 사용하는 경우에만 필요

```sh
$ sysctl vm.max_map_count=262144
```


<br>

## Client JVM check
* OpenJDK는 client JVM과 server JVM, 2가지 JVM을 제공
* Java bytecode에서 executable machine code를 생성하기 위해 다른 compiler를 사용
  * client JVM - startup time 및 memory footprint에 맞게 조정
  * server JVM - performance를 최대화하도록 조정
  * 두 JVM간에 성능차이가 상당할 수 있다
* client JVM check을 pass하려면 **server JVM으로 실행**해야 한다
* modern system과 OS에서는 server JVM이 default


<br>

## Use serial collector check
* OpenJDK는 서로 다른 workload를 대상으로하는 다양한 garbage collector를 제공
* Elasticsearch에 serial collector는 적합하지 않다
  * 성능이 저하될 수 있다
  * single logical CPU 또는 small heap에 적합
* use serial collector check는 `-XX:+UseSerialGC`를 사용했는지 검사
* Elasticsearch는 default로 CMS collector를 사용하도록 설정되어 있다


<br>

## System call filter check
* OS에 따라 다양한 system call filter를 설치
  * e.g. seccomp(Linux)
* Elasticsearch의 `arbitrary code execution attack`에 대한 defense mechanism으로 fork와 관련된 system call을 방지하기 위함
* system call filter check는 system call filter가 enable인 경우 **system call filter가 설치**되었는지 검사
* system call filter check를 pass하려면 system call filter 설치를 막는 오류를 수정하거나 `bootstrap.system_call_filter: false`로 disable


<br>

## OnError and OnOutOfMemoryError check
* JVM option인 `OnError`, `OnOutOfMemoryError`로 faital error(`OnError`)나 OutOfMemoryError(`OnOutOfMemoryError`) 발생시 임의의 명령을 실행할 수 있다
* Elasticsearch는 default로 system call filters(seccomp)는 enable고 forking을 막는다
* `OnError`, `OnOutOfMemoryError` 사용시 system call filter가 호환되지 않는다
* OnError and OnOutOfMemoryError check는 `OnError`, `OnOutOfMemoryError` JVM option이 사용되고, system call filter가 enable인 경우 Elasticsearch start를 막는다
  * 항상 실행
* OnError and OnOutOfMemoryError check를 pass하려면 `OnError`, `OnOutOfMemoryError`를 enable 하지말고, Java 8u92로 업그레이드 후 JVM flag `ExitOnOutOfMemoryError`를 사용


<br>

## Early-access check
* OpenJDK는 다음 release의 early-access snapshot을 제공
* early-access check를 pass하려면 JVM release build를 사용
  * early-access는 production에 적합하지 않기 때문


<br>

## G1GC check
* JDK 8의 HotSpot JVM은 G1 GC를 사용하면 index corruption 가능성이 있다
* 영향을 받는 JDK 8u40 이전의 JVM은 G1GC check로 감지할 수 있다


<br>

## All permission check
* all permission check는 bootstrap에서 사용된 security policy가 java.security.AllPermission을 Elasticsearch에 부여하지 않도록 한다
* all permission으로 start하는 것은 security manager를 disable하는 것과 같다


<br>

## Discovery configuration check
* Elasticsearch는 default로 first start up시 same host에서 다른 node를 찾는다
  * elected master를 찾을 수 없으면 검색된 다른 node와 clustering
  * multiple cluster가 생성되어 data loss가 발생할 수 있으므로 production에 적합하지 않다
 * discovery configuration check를 pass하려면 아래 중 하나 이상을 설정
   * `discovery.seed_hosts`
   * `discovery_seed_providers`
   * `cluster.initial_master_nodes`


<br><br>

> #### Reference
> * [Bootstrap Checks - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/bootstrap-checks.html)
