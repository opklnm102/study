# [ES] Important Elasticsearch configuration
> date - 2019.10.28  
> keyworkd - elasticsearch  
> [Important Elasticsearch configuration - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html)를 읽고 정리  
> Elasticsearch 7.4 기준  

<br>

* Production에 들어가기 전에 고려해야할 설정들이 있다
  * Path settings
  * Cluster name
  * Node name
  * Network host
  * Discovery settings
  * Heap size
  * Heap dump path
  * GC logging
  * Temp directory

 
<br>

## path.data and path.logs
* `.zip`, `.tar.gz`를 사용하는 경우 `data`, `logs`의 default location은 **$ES_HOME의 sub directory**
* 이런 중요한 디렉토리를 default location을 사용하면 새 버전으로 upgrade 중 삭제되는 등의 위험이 있으므로 변경하는게 좋다
```yaml
path:
  logs: /var/log/elasticsearch
  data: /var/data/elasticsearch
```

<br>

### `path.data`는 multiple paths support
* 모든 경로가 데이터 저장에 사용
* 하나의 shard에 속한 파일은 동일한 경로에 저장
```yaml
path:
  data:
    - /mnt/elasticsearch_1
    - /mnt/elasticsearch_2
    - /mnt/elasticsearch_3
```


<br>

## cluster.name
* node는 `cluster.name`을 cluster의 다른 모든 node와 공유할 때 cluster에 join
  * default. elasticsearch
* cluster의 **용도에 맞는 적절한 이름**으로 변경
* network가 분리되어 있지 않은 다른 환경에서 `cluster.name` 재사용시 잘못된 cluster join이 발생할 수 있으므로 가급적 재사용하지 말자
```yaml
cluster.name: logging-prod
```


<br>

## node.name
* 사람이 읽을 수 있는 identifier로 사용하므로 많은 API response에 포함
* default로 `hostname`이지만 `elasticsearch.yml`에 명시적으로 설정 가능
```yaml
node.name: prod-data-2
```


<br>

## network.host
* default로 loopback(e.g. `127.0.0.1`, `[::1]`) address binding
* **다른 서버에 있는 Node와 통신하고 clustering**을 하기 위해서는 non-loopback address에 bind 필요
* 많은 [network setting](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html)이 있지만 일반적으로 `network.host` 필요

```yaml
network.host: 192.168.1.10
```

<br>

### special value 제공
| name | description | example |
|:--|:--|:--|
| `_[networkInterface]_` | network interface의 addresses | `_en0_` |
| `_local_` | loopback address | 127.0.0.1 |
| `_site_` | site-local address | 192.168.0.1 |
| `_global_` | globally-scoped address | 8.8.8.8 |

* special value는 기본적으로 IPv4, IPv6 둘다 적용되지만 제한할 수 있다
  * e.g. `_en0:ipv4_`

<br>

> * loopback address를 사용하면 단일 node의 동일한 $ES_HOME에서 2개 이상의 node를 시작할 수 있다
> * Elasticsearch의 cluster 기능 test에는 유용하나 production에는 권장하지 않는다
> * `network.host` 설정시 `production mode`가 되어 bootstrap check를 수행하고, warn log는 exception으로 업그레이드 된다


<br>

## Discovery and cluster formation settings
* cluster의 node가 서로를 발견하고 master election을 위해 설정해야할 2가지 discovery, cluster configuration이 있다

<br>

### discovery.seed_hosts
* Network configuration이 없으면, Elasticsearch는 `loopback address`에 binding 후 `9300 ~ 9305 port`를 scan하여 동일한 서버에서 실행 중인 다른 Node에 연결 시도
  * **configuration 없이 auto-clustering 제공**
* 다른 host의 node로 clustering을 하려면 `discovery.seed_hosts`로 `master eligible node`의 리스트를 정의
  * `array`, `,`로 구분된 문자열로 정의
  * `host:port` or `host` 형식
    * default. `127.0.0.1`, `[::1]`
    * port가 없다면 `transport.profiles.default.port`를 사용하고, 없으면 `transport.port` 사용

```yaml
discovery.seed_hosts:
  - 192.168.1.10:9300
  - 192.168.1.11
  - seeds.mydomain.com  # hostname이면 resolve된 모든 IP의 node를 찾는다
```

<br>

### cluster.initial_master_nodes
* Elasticsearch cluster를 처음 시작시 처음으로 election을 할 master-eligible node를 결정하는 `cluster bootstrapping` step이 있다
* discovery setting이 없는 `development mode`에서는 node 자체에서 자동으로 수행
* auto-bootstrapping은 [inherently unsafe](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-quorums.html)라서 `production mode`에서는 명시적으로 master-eligible node를 `cluster.initial_master_nodes`에 설정하는게 좋다
* **cluster를 restart**하거나, **new node 추가**시에는 사용하지 말 것


```yaml
cluster.initial_master_nodes:
  - master-node-a
  - master-node-b
  - master-node-c
```
* `node.name`을 정의하고, default는 hostname
  * `node.name`이 master-node-a.example.com 같이 domain name일 경우 모두 기술

<br>

> 자세한 내용은 [Bootstrapping a cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-bootstrap-cluster.html)와 [Discovery and cluster formation settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-settings.html)을 참고


<br>

## Setting the heap size 
* Elasticsearch는 default로 min/max가 1GB heap을 사용한다
* production에서 실행시 충분한 heap size를 설정하는게 중요
* `Xms(minimum heap size)`, `Xmx(maximum heap size)`의 jvm.options으로 heap을 설정
  * 2개는 동일해야 한다
* `Xmx`, `Xms`를 실제 RAM의 50% 이하로 설정
  * Elasticsearch에는 JVM heap 이외에도 memory가 필요
    * 효율적인 network 통신을 위한 off-heap buffer
    * 효율적인 파일 엑세스를 위한 OS의 file system cache
    * JVM 자체를 위한 memory
* JVM이 compressed oops(object pointers)를 사용하도록 32GB 이하로 `Xmx`, `Xms`를 설정
  * e.g. `heap size [1.9gb], compressed ordinary object pointers [true]`
* `Xmx`, `Xms`를 `zero-based compressed oops` threshold 이하로 설정하는 것이 이상적
  * 대부분 26GB가 안전하지만, 최대 30GB까지 가능
  * `-XX:+UnlockDiagnosticVMOptions`, `-XX:+PrintCompressedOopsMode` JVM option으로 threshold인지 확인할 수 있다
    * e.g. zero-based compressed oops - `heap address: 0x000000011be00000, size: 27648 MB, zero based Compressed Oops`
    * e.g. non zero-based compressed oops - `heap address: 0x0000000118400000, size: 28672 MB, Compressed Oops with base: 0x00000001183ff000`
* Elasticsearch에서 사용 가능한 heap이 많을수록 **internal cache에 사용할 수 있는 memory**는 많지만 **OS의 file system cache에서 사용할 수 있는 memory**는 줄어든다
* heap size가 클수록 `garbage collection` pause가 길어진다

<br>

### jvm.options로 설정
```
-Xms2g
-Xmx2g
```

<br>

### 환경변수로 설정
```sh
ES_JAVA_OPTS="-Xms2g -Xmx2g" ./bin/elasticsearch
ES_JAVA_OPTS="-Xms4000m -Xmx4000m" ./bin/elasticsearch
```

<br>

> Windows는 [Windows service documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/zip-windows.html#windows-service) 참고


<br>

## JVM heap dump path
* memory exception 발생시 `/data`에 heap dump
  * RPM, Debian - `/var/lib/elasticsearch/data`
  * tar, zip - `$ELASTICSEARCH_HOME/data`
* `-XX:HeapDumpPath=...`로 설정 가능
  * directory 지정 - JVM은 **실행중인 instance의 PID를 기반으로 heap dump file을 생성**
  * file 지정 - JVM이 heap dump시 동일한 filename이 있으면 heap dump 실패


<br>

## GC logging
* Elasticsearch는 default로 GC logs 활성화
  * `jvm.options`로 설정
* Elasticsearch log와 동일한 위치
* 64MB마다 log rotate하여 최대 2GB의 disk space를 소비할 수 있다


<br>

## Temp directory
* Elasticsearch는 startup script가 system temporary directory 하위에 생성한 temporary directory를 사용
* 대부분의 Linux는 최근에 access가 없다면 `/tmp`에서 파일과 디렉토리를 정리
  * **temporary directory가 필요한 기능이 사용되면 문제가 발생**
* `.deb`, `.rpm` package로 설치하고, `systemd`로 실행했다면 temporary directory를 정리하지 않는다
* `.tar.gz`로 설치하면 `$ES_TMPDIR` 환경변수에 temporary directory 설정 필요


<br>

## JVM fatal error logs
* fatal error(e.g. a segmentation fault) log를 default logging directory에 쓴다
  * `RPM`, `Debian` - `/var/log/elasticsearch`
  * `.tar.gz` - `$ELASTICSEARCH_HOME/logsw`
* `-XX:ErrorFile=...`로 설정 가능


<br><br>

> #### Reference
> * [Important Elasticsearch configuration - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html)
