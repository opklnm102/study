# [Fluentd] fluent-plugin-kafka version issue
> date - 2018.12.10  
> keyword - fluentd, fluent/fluent-plugin-kafka  
> 사내에서 fluentd를 사용하여 data pipeline을 구축 중 만난 kafka, fluentd version issue와 해결과정에 대해 정리


<br>

## Issue
* Dev에서 잘되던 kafka connect가 Prod에선 안된다...!?
  * Fluentd Docker image: fluent/fluentd:v1.3.1-debian-onbuild
  * Dev Kafka: 1.0.xx
  * Prod Kafka: 0.10.xx

### Dockerfile
```yaml
FROM fluent/fluentd:v1.3.1-debian-onbuild

LABEL maintainer="opklnm102@gmail.com"

RUN buildDeps="make gcc g++ libc-dev ruby-dev" \
 && apt-get update \
 && apt-get install -y --no-install-recommends $buildDeps \
 && gem install \
        fluent-plugin-kafka \
        fluent-plugin-s3 \
 && gem sources --clear-all \
 && SUDO_FORCE_REMOVE=yes \
    apt-get purge -y --auto-remove \
                  -o APT::AutoRemove::RecommendsImportant=false \
                  $buildDeps \
 && rm -rf /var/lib/apt/lists/* \
           /home/fluent/.gem/ruby/2.3.0/cache/*.gem
```

<br>

* Fluentd error log
```
2018-12-10 11:29:05 +0900 [info]: #0 New topics added to target list: search
2018-12-10 11:29:05 +0900 [info]: #0 Fetching cluster metadata from kafka://kafka-2.broker.default:9092
2018-12-10 11:29:05 +0900 [info]: #0 Discovered cluster metadata; nodes: kafka-2.broker.default.svc.cluster.local:9092 (node_id=2), kafka-4.broker.default.svc.cluster.local:9092 (node_id=4), kafka-1.broker.default.svc.cluster.local:9092 (node_id=1), kafka-3.broker.default.svc.cluster.local:9092 (node_id=3), kafka-0.broker.default.svc.cluster.local:9092 (node_id=0)
2018-12-10 11:29:05 +0900 [warn]: #0 Re-starting consumer 2018-12-10 11:29:05 +0900
2018-12-10 11:29:05 +0900 [info]: #0 Joining group `fluentd-s3-search-group`
2018-12-10 11:29:05 +0900 [info]: #0 Will fetch at most 1048576 bytes at a time per partition from search
2018-12-10 11:29:05 +0900 [info]: #0 Fetching cluster metadata from kafka://kafka-2.broker.default:9092
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-2.broker.default.svc.cluster.local:9092 (node_id=2): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [info]: #0 Discovered cluster metadata; nodes: kafka-2.broker.default.svc.cluster.local:9092 (node_id=2), kafka-4.broker.default.svc.cluster.local:9092 (node_id=4), kafka-1.broker.default.svc.cluster.local:9092 (node_id=1), kafka-3.broker.default.svc.cluster.local:9092 (node_id=3), kafka-0.broker.default.svc.cluster.local:9092 (node_id=0)
2018-12-10 11:29:05 +0900 [info]: #0 There are no partitions to fetch from, sleeping for 1s
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-4.broker.default.svc.cluster.local:9092 (node_id=4): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-1.broker.default.svc.cluster.local:9092 (node_id=1): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-3.broker.default.svc.cluster.local:9092 (node_id=3): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-0.broker.default.svc.cluster.local:9092 (node_id=0): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [info]: #0 Leaving group `fluentd-s3-search-group`
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-2.broker.default.svc.cluster.local:9092 (node_id=2): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-4.broker.default.svc.cluster.local:9092 (node_id=4): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-1.broker.default.svc.cluster.local:9092 (node_id=1): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-3.broker.default.svc.cluster.local:9092 (node_id=3): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 Failed to get coordinator info from kafka-0.broker.default.svc.cluster.local:9092 (node_id=0): Connection error EOFError: EOFError
2018-12-10 11:29:05 +0900 [error]: #0 unexpected error during consuming events from kafka. Re-fetch events. error="Failed to find coordinator"
2018-12-10 11:29:05 +0900 [error]: #0 suppressed same stacktrace
2018-12-10 11:29:05 +0900 [warn]: #0 Stopping Consumer
2018-12-10 11:29:05 +0900 [info]: #0 Disconnecting broker 2
2018-12-10 11:29:05 +0900 [info]: #0 Disconnecting broker 4
2018-12-10 11:29:05 +0900 [info]: #0 Disconnecting broker 1
2018-12-10 11:29:05 +0900 [info]: #0 Disconnecting broker 3
2018-12-10 11:29:05 +0900 [info]: #0 Disconnecting broker 0
2018-12-10 11:29:05 +0900 [warn]: #0 Could not connect to broker. retry_time:0. Next retry will be in 30 seconds
2018-12-10 11:29:06 +0900 [info]: #0 Fetcher thread exited.
```

<br>

* Kafka error log
```
[2018-12-10 04:37:52,670] ERROR Closing socket for 10.2.145.34:9092-10.2.6.134:51736 because of error (kafka.network.Processor)
org.apache.kafka.common.errors.InvalidRequestException: Error getting request for apiKey: 10 and apiVersion: 1
Caused by: java.lang.IllegalArgumentException: Invalid version for API key 10: 1
	at org.apache.kafka.common.protocol.ProtoUtils.schemaFor(ProtoUtils.java:31)
  ...
```


<br>

## Why
* Kafka의 error log `InvalidRequestException: Error getting request for apiKey: 10 and apiVersion: 1`가 왠지 api version issue를 나타내는 듯하다
* 기존 사용하던 `fluentd:v0.14.19-debian-onbuild`로 build해서 시도해봤으나 failed....
  * fluentd version 문제가 아닌듯...?
* 뭐가 문제일까... 조금 더 찾아보다 [fluent/fluent-plugin-kafka issue #177](https://github.com/fluent/fluent-plugin-kafka/issues/177)에서 내부적으로 ruby-kafka를 사용한다는걸 파악..!
* [ChangeLog - zendesk/ruby-kafka](https://github.com/zendesk/ruby-kafka/blob/master/CHANGELOG.md#070)에서 0.7.0에서 `Kafka 0.10의 지원을 중단`했다는 사실을 발견..!
* [ChangeLog - fluent/fluent-plugin-kafka](https://github.com/fluent/fluent-plugin-kafka/blob/master/ChangeLog)를 보면 ruby-kafka dependency가 변경되는게 보임
```
Release 0.8.0 - 2018/10/18
	* Update ruby-kafka dependency to v0.7 or later

...

Release 0.7.5 - 2018/08/14
  * Limit ruby-kafka version('< 0.7.0') to avoid runtime error

...

Release 0.6.4 - 2017/11/23
	* Relax ruby-kafka version for 0.5 or later
```

<br>

### 현재 사용하고 있는 버전 정보 확인하기
* Docker Image build시 gem을 사용했으므로 container에 접속해서 `gem list`로 확인

#### 이전에 build한 docker image
```sh
$ gem list

fluent-plugin-kafka (0.6.4)
fluentd (0.14.19, 0.12.41)
ruby-kafka (0.5.1)
...
```

#### 오늘 build한 docker image
```sh
$ gem list

fluent-plugin-kafka (0.8.2)
fluentd (0.14.19)
ruby-kafka (0.7.4)
...
```
* 서로 사용하고 있는 version이 다르다..!
* 오늘 build한건 0.10.x를 지원하지 않는 fluent-plugin-kafka 0.8.2를 사용하고 있던게 문제였음이 밝혀졌다
* 이전에 build한 docker image는 dependency를 build 시점에 정하고 freeze되었기 때문에 문제가 발생하지 않았던 것


<br>

## Resolve
* Dockerfile에서 gem install시 Kafka 0.10.x를 지원하는 version을 지정해주자
* `fluent/fluent-plugin-kafka 0.7.5`에서 `Limit ruby-kafka version('< 0.7.0') to avoid runtime error`로 fix되었고, 0.8.0에서 ruby-kafka v0.7 이상의 dependency를 가지기 때문에 `0.8.0 ~ 0.7.5 사이`의 version을 지정

```yaml
...

 && gem install \
        fluent-plugin-kafka:0.7.9 \  # version fix
```


### result
```
...
2018-12-10 16:12:37 +0900 [info]: gem 'fluent-plugin-kafka' version '0.7.9'
2018-12-10 16:12:37 +0900 [info]: gem 'fluent-plugin-s3' version '1.1.7'
2018-12-10 16:12:37 +0900 [info]: gem 'fluentd' version '1.3.1'
2018-12-10 16:12:37 +0900 [info]: adding match pattern="fluentd.**" type="null"
...
```

<br>

## 
* 역시 version 호환성 문제는 골치가 아프다...
* docker image는 build 시점에 dependency가 확보되므로 시간이 지나도 그 때 그 형상을 유지할 수 있다
  * `immutable infrastructure` 특징


<br><br>

> #### Reference
> * [fluent/fluent-plugin-kafka issue #177](https://github.com/fluent/fluent-plugin-kafka/issues/177)
> * [ChangeLog - fluent/fluent-plugin-kafka](https://github.com/fluent/fluent-plugin-kafka/blob/master/ChangeLog)
> * [ChangeLog - zendesk/ruby-kafka](https://github.com/zendesk/ruby-kafka/blob/master/CHANGELOG.md#070)
> * [How to install a specific version of a ruby gem? - stack overflow](https://stackoverflow.com/a/22160327/6389139)
