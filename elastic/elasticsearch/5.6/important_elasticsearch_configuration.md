# [ES] Important Elasticsearch configuration
> date - 2019.07.24  
> keyword - elasticsearch  
> Elasticsearch를 Production에 들어가기 전에 반드시 설정해야 하는 것들을 살펴보자  

<br>

> ### Env
> * Elasticsearch 5.6


<br>

## path.data and path.logs
* `.zip`, `.tar.gz`를 사용하는 경우 data, logs의 default location은 **$ES_HOME의 sub directory**
* 이런 중요한 디렉토리를 default location을 사용하면 새 버전으로 upgrade 중 삭제되는 등의 위험이 있으므로 변경하는게 좋다
```yaml
path:
  logs: /var/log/elasticsearch
  data: /var/data/elasticsearch
```

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
* default로 **Random UUID의 첫 7자리인 Node ID**를 사용
* Node ID는 재시작해도 변경되지 않으므로 node name도 변경되지 않는다
* `node.name`에 의미 있는 이름으로 설정할 수 있다
```yaml
node.name: prod-data-2
```

* host name으로 설정 가능
```yaml
node.name: ${HOSTNAME}
```


<br>

## bootstrap.memory_lock
* JVM이 disk로 swap out되지 않도록 true로 설정
  * system 설정이 먼저 필요 - [Enable bootstrap.memory_lock](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/setup-configuration-memory.html#mlockall)

```yaml
bootstrap.memory_lock: true
```


<br>

## network.host
* default로 loopback address bind
  * 127.0.0.1, [::1]

* **다른 서버에 있는 Node와 통신하고 clustering**을 하기 위해서는 non-loopback address에 bind 필요
  * 많은 [network setting](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/important-settings.html#path-settings)이 있지만 일반적으로 `network.host` 필요

```yaml
network.host: 192.168.1.10
```

<br>

> * loopback address를 사용하면 단일 node의 동일한 $ES_HOME에서 2개 이상의 node를 시작할 수 있다
> * Elasticsearch의 cluster 기능 test에는 유용하나 production에는 권장하지 않는다

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

## discovery.zen.ping_unicast.hosts
* network configuration이 없는 Elasticsearch는 사용 가능한 **loopback address에 bind하고 9300 ~ 9305 port를 scan**하여 동일한 서버에서 실행중인 다른 Node에 연결을 시도
  * 어떤 configuration 없이 auto-clustering을 제공한다
* 다른 서버에 있는 Node와 clustering을 하려면 seed list 제공 필요
  * `network.host`에 non-loopback address를 설정하면 제공하지 않아도 된다
* port가 없으면 default로 `transport.profiles.default.port`를 사용하고 없다면 `transport.tcp.port` 사용
* hostname은 resolve된 모든 IP 사용
```yaml
discovery.zen.ping.unicast.hosts:
  - 192.168.1.10:9300
  - 192.168.1.11
  - seeds.mydomain.com
```


<br>

## discovery.zen.minimum_master_nodes
* Data loss 방지를 위해 각 master eligible node가 clustering을 위한 minimum master eligible node를 알고 있도록 `discovery.zen.minimum_master_nodes`를 설정하는게 중요
* 이 설정이 없다면 network 장애를 겪고 있는 cluster는 **split brain**(2개의 독립적인 cluster로 분할되는 현상)으로 인해 data loss 발생
* 자세한 설명은 [Avoiding split brain with minimum_master_nodes](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/modules-node.html#split-brain) 참고

### Split brain을 피하기 위해서
* master eligible node의 quorum으로 설정해야 한다
```
(master eligible nodes / 2) + 1
```

#### e.g. eligible master node가 3개인 경우 
```yaml
# (3 / 2) + 1 = 2로 설정
discovery.zen.minimum_master_nodes: 2
```


<br><br>

> #### Reference
> * [Important Elasticsearch configuration - Elasticsearch 5.6 Docs](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/important-settings.html#minimum_master_nodes)
