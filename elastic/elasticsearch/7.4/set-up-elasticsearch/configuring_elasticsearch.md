# [ES] Configuring Elasticsearch
> date - 2019.10.29  
> keyworkd - elasticsearch  
> [Configuring Elasticsearch - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html)를 읽고 정리  
> Elasticsearch 7.4 기준  

<br>

* [Cluster update setting API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-update-settings.html)로 실행중인 cluster에서 대부분의 설정을 변경할 수 있다
* Configuration file에는 Node별 설정(node.name, paths)과 cluster joind을 위한 설정(cluster.name, network.host)이 포함

<br>

### Config files location
* 3개의 config file 제공
  * `elasticsearch.yml` - configuring **Elasticsearch**
  * `jvm.options` - configuring Elasticsearch **JVM settings**
  * `log4j2.properties` - configuring Elasticsearch **logging**
* default location은 `$ES_HOME/config` or `/etc/elasticsearch`, `/etc/default/elasticsearch`, `/etc/sysconfig/elasticsearch`
  * `ES_PATH_CONF` 환경 변수로 수정 가능

```sh
$ ES_PATH_CONF=/path/to/my/config ./bin/elasticsearch

## or export environment variable
$ export ES_PATH_CONF=/path/to/my/config
$ ./bin/elasticsearch
```

<br>

### Config file format
* [YAML](https://yaml.org/) 사용
```yaml
path:
  data: /var/lib/elasticsearch
  logs: /var/log/elasticsearch

## flattened
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
```

<br>

### Environment variable substitution
* 설정 파일에서 `${...}`를 사용하면 환경 변수로 대체된다
```yaml
node.name: ${HOSTNAME}
network.host: ${ES_NETWORK_HOST}
```


<br>

## Setting JVM options
* JVM option에서는 거의 heap size를 변경하고 나머지는 거의 변경하지 않아도 된다
* `jvm.options` 파일에 JVM option(system properties & JVM flags) 설정
  * `.zip`, `.tar.gz` - `config/jvm.options`
  * `RPM`, `Debian` - `/etc/elasticsearch/jvm.options`
* JVM option은 line 단위로 정의
  * 공백 라인 무시
  * `#`는 comment로 무시

```sh
# this is a comment - ignore

# `-`로 시작하는 라인은 JVM 버전에 독립적으로 적용
-Xmx2g

# `숫자:`로 시작하는 라인은 특정 JVM 버전에만 적용
8:-Xmx2g

# `숫자-`로 시작하는 라인은 같거나 높은 JVM 버전에 적용
8-:-Xmx2g

# `숫자-숫자:`는 range 사이의 JVM 버전에만 적용
8-9:-Xmx2g
```

<br>

### `jvm.options` 파일 대신 `ES_JAVA_OPTS` 환경 변수를 사용할 수 있다
```sh
export ES_JAVA_OPTS="$ES_JAVA_OPTS -Djava.io.tmpdir=/path/to/temp/dir"
./bin/elasticsearch
```

<br>

### JVM에는 `JVM_TOOL_OPTIONS` 환경 변수를 관찰하기 위한 mechanism이 있다
* 몇몇 OS(e.g. Ubuntu)에서 `JVM_TOOL_OPTIONS`를 통해 agent를 설치하기 때문에 packaging script에서 무시

<br>

### Java program은 `JAVA_OPTS` 환경 변수를 지원
* JVM의 built in mechanism은 아니지만 **ecosystem의 convention이다**
* Elasticsearch는 지원하지 않는다


<br>

## Secure settings
* 민감 정보 보호를 filesystem permission에만 의존하는 것은 충분하지 않다
* Elasticsearch는 **keystore와 keystore 설정**을 관리할 수 있는 `elasticsearch-keystore` 제공
* Elasticsearch를 실행한 user로 모든 command를 실행
* `elasticsearch.yml` 같이 각 node에서 지정해야 한다
* 모든 secure setting은 모든 node에서 동일한 값을 가져야한다

<br>

### 일부 설정만 keystore에서 읽도록 설계
* keystore에서 **지원하지 않는 설정을 검증하지 않는다**
* 지원하지 않는 설정을 추가하면 **Elasticsearch를 시작할 수 없다**

<br>

> * 현재 obfuscation 만 제공, 추후 password protection 추가

<br>

### Creating the keystore
```sh
$ bin/elasticsearch-keystore create
```
* `elasticsearch.keystore` 파일이 `elasticsearch.yml`과 함께 작성된다

<br>

### Listing settings in the keystore
```sh
$ bin/elasticsearch-keystore list
```

<br>

### Adding string settings
* cloud plugin의 authentication credentials 같은 **sensitive string**을 추가
```sh
$ bin/elasticsearch-keystore add the.setting.name.to.set

## stdin
$ cat /file/containing/setting/value | bin/elasticsearch-keystore add --stdin the.setting.name.to.set
```

<br>

### Adding file settings
* cloud plugin의 authentication key file 같은 **sensitive file**을 추가
```sh
$ bin/elasticsearch-keystore add-file the.setting.name.to.set /path/example-file.json
```

<br>

### Removing settings
```sh
$ bin/elasticsearch-keystore remove the.setting.name.to.remove
```

<br>

### Upgrading the keystore
* Node resting 또는 package manager로 Elasticsearch upgrade시 keystore의 internal format이 변경될 수 있기 때문에 keystore가 있는 directory에 write permission 필요
* 수동으로도 가능
```sh
$ bin/elasticsearch-keystore upgrade
```

<br>

### Reloadable secure settings
* `elasticsearch.yml`처럼 keystore 설정을 reload하려면 node restart 필요
* **reloadable** marked secure setting은 실행 중에 reloade 가능
  * [The Azure repository plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.4/repository-azure-client-settings.html)
  * [The EC2 discovery plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.4/discovery-ec2-usage.html#_configuring_ec2_discovery)
  * [The GCS repository plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.4/repository-gcs-client.html)
  * [The S3 repository plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.4/repository-s3-client.html)
* reloadable과 상관 없이 모든 node의 secure setting은 동일해야 한다
```sh
$ bin/elasticsearch-keystore add the.setting.name.to.set

$ curl -X POST "ES_HOST:9200/_nodes/reload_secure_settings?pretty"
```


<br>

## Logging configuration
* logging을 위해 [Log4j 2](https://logging.apache.org/log4j/2.x/) 사용
* 설정 파일은 `log4j2.properties`
* Elasticsearch에서 expose한 `${sys:es.logs.base_path}`, `${sys:es.logs.cluster_name}`, `${sys:es.logs.node_name}`를 이용해 log file의 위치를 결정
  * e.g. `${sys:es.logs.base_path}/${sys:es.logs.cluster_name}-${sys:es.logs.node_name}.log`

```yaml
######## Server JSON ######################

# Use RollingFile appender
appender.rolling.type = RollingFile
appender.rolling.name = rolling

# Log to /var/log/elasticsearch/production.json
appender.rolling.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.json

# Use JSON layout
appender.rolling.layout.type = ESJsonLayout

# 여러 유형의 로그 구문 분석시 사용할 type 필드
appender.rolling.layout.type_name = server

# /var/log/elasticsearch/production-yyyy-MM-dd-i.json
appender.rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.json.gz
appender.rolling.policies.type = Policies

# use time-based roll policy
appender.rolling.policies.time.type = TimeBasedTriggeringPolicy

# roll logs on a daily
appender.rolling.policies.time.interval = 1
appender.rolling.policies.time.modulate = true

# use size-based roll policy
appender.rolling.policies.size.type = SizeBasedTriggeringPolicy
appender.rolling.policies.size.size = 256MB
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.fileIndex = nomax
appender.rolling.strategy.action.type = Delete
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}
appender.rolling.strategy.action.condition.type = IfFileName
appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-*

# 너무 많은 로그가 누적된 경우 삭제
appender.rolling.strategy.action.condition.nested_condition.type = IfAccumulatedFileSize

# log 압축 size 조건 
appender.rolling.strategy.action.condition.nested_condition.exceeds = 2GB
```


### old style
* `*.log`로 저장되고, 아카이브는 `*.log.gz`으로 저장
* 추후 제거 예정
```yaml
######## Server JSON ######################
appender.rolling_old.type = RollingFile
appender.rolling_old.name = rolling_old
appender.rolling_old.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.log
appender.rolling_old.layout.type = PatternLayout
appender.rolling_old.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
appender.rolling_old.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.old_log.gz
```



* .gz를 .zip으로 바꾸면 zip으로 압축할 수 있다
* .gz를 제거하면 rolling시 압축되지 않는다


일정 기간 log file을 유지하려면 delete action과 rollover strategy를 사용
```yaml
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.action.type = Delete
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}

# rollover 조건
appender.rolling.strategy.condition.type = IfFileName
appender.rolling.strategy.condition.glob = ${sys:es.logs.cluster_name}-*
appender.rolling.strategy.condition.nested_condition.type = IfLastModified
appender.rolling.strategy.condition.nested_condition.age = 7D
```




Multiple configuration

Elasticsearch config directory sub directory에 여러 `log4j2.properties` 파일을 사용할 수 있다
    설정들은 merge 된다

logger를 추가로 사용하는 plugin에 유용

logger section - java package, log level
appender section - log 대상이 포함








이름이 log4j2.properties이고 Elasticsearch 구성 디렉토리를 조상으로 사용하는 한 여러 구성 파일을로드 할 수 있습니다 (이 경우 병합됩니다).

추가 로거를 노출시키는 플러그인에 유용합니다.

로거 섹션에는 Java 패키지 및 해당 로그 레벨이 포함됩니다.

appender 섹션에는 로그 대상이 포함되어 있습니다.

로깅 및 지원되는 모든 어 펜더를 사용자 정의하는 방법에 대한 광범위한 정보는 Log4j 문서에서 찾을 수 있습니다.









<br>

## Auditing settings

<br>

## Cross-cluster replication settings

<br>

## Transforms settings

<br>

## Index lifecycle management settings

<br>

## License settings

<br>

## Machine learning settings

<br>

## Monitoring settings

<br>

## Security settings

<br>

## SQL access settings

<br>

## Watcher settings









<br><br>

> #### Reference
> * [Configuring Elasticsearch - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html)
