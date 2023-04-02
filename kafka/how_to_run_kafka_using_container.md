# [Kafka] How to run Kafka using container
> date - 2023.04.02  
> keyworkd - kafka, container  
> Apache Kafka를 어떻게 container로 실행할지에 대해 정리  

<br>

## Pros & Cons

### Pros
* container에 익숙하다면 배포하기 쉽다
* container image로 표준화된 배포 환경 사용
* kafka cluster 구성이 빨라지고(10분도 걸리지 않음) scale up이 쉬워진다

<br>

### Cons
* resource 효율화
  * container라는 추상화 레이어로 인해 어느 정도는 성능 저하 발생
  * kernel parameter tuning 후 Kafka 설치
  * Kafka는 network에 영향을 많이 받는데, container에 올리면 변덕스러운 network 영향을 더 많이 받을 수 있다
* monitoring 어려움
  * kafka는 부하가 발생하는 지점이 실시간으로 바뀐다
  * MySQL cluster라면 node를 추가하면 부하가 분산되어 줄어들지만 Kafka는 그렇지 않기 때문에 모니터링이 어렵다


<br>

## 어려움
* official image가 없기 때문에 직접 만들어야한다
* Kafka는 stateful application이기 때문에 stateless application보다 사용하기 어렵다
* Not-interchangeable(교환 불가능한 시스템)
  * broker별로 가지고 있는 topic, partition, partition leader/follower이 다르기 때문에 각 broker는 완전히 다르다
  * client는 원하는 topic, partition의 leader partition을 가진 broker와만 직접 통신한다
  * MySQL은 앞단의 proxy server(e.g. nginx)에 붙어도 괜찮지만, broker에 직접 붙어야한다
* broker외 [kcat](https://github.com/edenhill/kcat), Schema Registry, Kafka Connect 등 Kafka ecosystem 설치 필요


<br>

## Image 선택
### Zookeeper
| Image | Description |
|:--|:--|
| [zookeeper](https://hub.docker.com/_/zookeeper) | official |
| [bitnami/zookeeper](https://hub.docker.com/r/bitnami/zookeeper) | bitnami에서 지원 |
| [confluentinc/cp-zookeeper](https://hub.docker.com/r/confluentinc/cp-zookeeper) | SaaS Kafka인 Confluent에서 저원하는 Community version image |

<br>

### Kafka
| Image | Description |
|:--|:--|
| [bitnami/kafka](https://hub.docker.com/r/bitnami/kafka) | bitnami에서 지원 |
| [confluentinc/cp-kafka](https://hub.docker.com/r/confluentinc/cp-kafka) | SaaS Kafka인 Confluent에서 저원하는 Community version image |

<br>

#### confluentin kafka
* confluent platform kafka image는 versioning 방식이 다르며 [Confluent Platform and Apache Kafka Compatibility](https://docs.confluent.io/platform/current/installation/versions-interoperability.html#cp-and-apache-ak-compatibility)에서 확인 가능

| Confluent Platform | Apache Kafka |
|:--|:--|
| 7.3.x	| 3.3.x |
| 7.2.x	| 3.2.x |
| 7.1.x	| 3.1.x |
| 7.0.x	| 3.0.x |
| 6.2.x	| 2.8.x |
| 6.1.x	| 2.7.x |
| 6.0.x	| 2.6.x |


<br>

## Docker Compose

### Single broker kafka cluster
kraft mode를 사용한 single broker cluster 생성

#### kafka-update-run.sh
```sh
# This script is required to run kafka cluster (without zookeeper)
#!/bin/sh

# Docker workaround: Remove check for KAFKA_ZOOKEEPER_CONNECT parameter
sed -i '/KAFKA_ZOOKEEPER_CONNECT/d' /etc/confluent/docker/configure

# Docker workaround: Ignore cub zk-ready
sed -i 's/cub zk-ready/echo ignore zk-ready/' /etc/confluent/docker/ensure

# KRaft required step: Format the storage directory with a new cluster ID
echo "kafka-storage format --ignore-formatted -t $(kafka-storage random-uuid) -c /etc/kafka/kafka.properties" >> /etc/confluent/docker/ensure
```

#### docker-compose.yaml
```yaml
version: "3"

services:
  kafka-0:
    container_name: kafka-0
    image: confluentinc/cp-kafka:7.3.2
    ports:
      - "9092:9092"
      - "9997:9997"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-0:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka-0 -Dcom.sun.management.jmxremote.rmi.port=9997
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-0:29093
      KAFKA_LISTENERS: PLAINTEXT://kafka-0:29092,CONTROLLER://kafka-0:29093,PLAINTEXT_HOST://0.0.0.0:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
    volumes:
      - ./kafka-update-run.sh:/tmp/kafka-update-run.sh
    command: "bash -c 'if [ ! -f /tmp/kafka-update-run.sh ]; then echo \"ERROR: Did you forget the update_run.sh file?\" && exit 1 ; else /tmp/kafka-update-run.sh && /etc/confluent/docker/run ; fi'"

  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8010:8080"
    depends_on:
      - kafka-0
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-0:29092
      KAFKA_CLUSTERS_0_METRICS_PORT: 9997
      DYNAMIC_CONFIG_ENABLED: "true"
```
* bridge network를 사용하기 때문에 network 내부에서 사용할 `29092`, `29093` port와 외부에서 사용할 `9092`, `9997` port를 설정

| properties | description |
|:--|:--|
| KAFKA_LISTENER_SECURITY_PROTOCOL_MAP | listener에서 사용할 protocol mapping<br>key/value 형식 |
| KAFKA_LISTENERS | broker에서 사용할 listener 설정 |
| KAFKA_ADVERTISED_LISTENERS | producer, consumer 같은 cluster 외부의 client에게 공개할 listener 설정으로 KAFKA_LISTENERS의 sub set<br>default. KAFKA_LISTENERS<br>내외부 접근을 관리하기 위해 설정 필요 |
| KAFKA_INTER_BROKER_LISTENER_NAME | 내부에서 사용할 listener 이름 설정 |
| KAFKA_CONTROLLER_LISTENER_NAMES | controller가 사용할 listener 이름 설정 |

#### Run docker compose
```sh
$ docker-compose up
```

<br>

### Multiple broker kafka cluster
kraft mode를 사용한 multiple broker cluster 생성

#### kafka-update-cluster-run.sh
```sh
# This script is required to run kafka cluster (without zookeeper)
#!/bin/sh

# Docker workaround: Remove check for KAFKA_ZOOKEEPER_CONNECT parameter
sed -i '/KAFKA_ZOOKEEPER_CONNECT/d' /etc/confluent/docker/configure

# Docker workaround: Ignore cub zk-ready
sed -i 's/cub zk-ready/echo ignore zk-ready/' /etc/confluent/docker/ensure

# KRaft required step: Format the storage directory with a new cluster ID
echo "kafka-storage format --ignore-formatted -t zlFiTJelTOuhnklFwLWixw -c /etc/kafka/kafka.properties" >> /etc/confluent/docker/ensure
```

#### docker-compose.yaml
```yaml
version: "3"

services:
  kafka-1:
    container_name: kafka-1
    image: confluentinc/cp-kafka:7.3.2
    ports:
      - "19092:19092"
      - "19997:9997"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-1:9092,PLAINTEXT_HOST://localhost:19092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka-1 -Dcom.sun.management.jmxremote.rmi.port=9997
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_LISTENERS: PLAINTEXT://kafka-1:9092,CONTROLLER://kafka-1:9093,PLAINTEXT_HOST://0.0.0.0:19092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
    volumes:
      - ./kafka-update-cluster-run.sh:/tmp/kafka-update-cluster-run.sh
    command: "bash -c 'if [ ! -f /tmp/kafka-update-cluster-run.sh ]; then echo \"ERROR: Did you forget the kafka-update-cluster-run.sh file?\" && exit 1 ; else /tmp/kafka-update-cluster-run.sh && /etc/confluent/docker/run ; fi'"

  kafka-2:
    image: confluentinc/cp-kafka:7.3.2
    container_name: kafka-2
    ports:
      - "29092:29092"
      - "29997:9997"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-2:9092,PLAINTEXT_HOST://localhost:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka-1 -Dcom.sun.management.jmxremote.rmi.port=9997
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 2
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_LISTENERS: PLAINTEXT://kafka-2:9092,CONTROLLER://kafka-2:9093,PLAINTEXT_HOST://0.0.0.0:29092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
    volumes:
      - ./kafka-update-cluster-run.sh:/tmp/kafka-update-cluster-run.sh
    command: "bash -c 'if [ ! -f /tmp/kafka-update-cluster-run.sh ]; then echo \"ERROR: Did you forget the kafka-update-cluster-run.sh file?\" && exit 1 ; else /tmp/kafka-update-cluster-run.sh && /etc/confluent/docker/run ; fi'"

  kafka-3:
    image: confluentinc/cp-kafka:7.3.2
    container_name: kafka-3
    ports:
      - "39092:39092"
      - "39997:9997"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-3:9092,PLAINTEXT_HOST://localhost:39092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka-1 -Dcom.sun.management.jmxremote.rmi.port=9997
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 3
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_LISTENERS: PLAINTEXT://kafka-3:9092,CONTROLLER://kafka-3:9093,PLAINTEXT_HOST://0.0.0.0:39092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
    volumes:
      - ./kafka-update-cluster-run.sh:/tmp/kafka-update-cluster-run.sh
    command: "bash -c 'if [ ! -f /tmp/kafka-update-cluster-run.sh ]; then echo \"ERROR: Did you forget the kafka-update-cluster-run.sh file?\" && exit 1 ; else /tmp/kafka-update-cluster-run.sh && /etc/confluent/docker/run ; fi'"

  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8010:8080"
    depends_on:
      - kafka-1
      - kafka-2
      - kafka-3
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-1:9092,kafka-2:9092,kafka-3:9092
      KAFKA_CLUSTERS_0_METRICS_PORT: 9997
      DYNAMIC_CONFIG_ENABLED: "true"
```

#### Run docker compose
```sh
$ docker-compose up
```


<br>

## Kubernetes
Helm or Operator로 배포

* Helm
  * [bitnami/kafka Helm Chart](https://artifacthub.io/packages/helm/bitnami/kafka)
  * [CP-Kafka Helm Chart](https://github.com/confluentinc/cp-helm-charts/blob/master/charts/cp-kafka)
* Operator
  * [strimzi-kafka-operator](https://github.com/strimzi/strimzi-kafka-operator)


### bitnami helm charts
#### Zookeeper
* kafka helm chart는 default로 cluster별로 zookeeper ensemble을 생성하는데, 하나의 zookeeper ensemble을 여러 kafka cluster에서 공유하도록 하기 위해 별도로 zookeeper ensemble 구성
```sh
## add helm repo
$ helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update

## install zookeeper ensemble - node 3
$ helm install test-zookeeper \
  --set replicaCount=3 \
  bitnami/zookeeper

## ls
$ kubectl exec test-zookeeper-0 -- zkCli.sh -server test-zookeeper-0.test-zookeeper-headless:2181 ls /

## create /foo => bar from node 0
$ kubectl exec test-zookeeper-0 -- zkCli.sh -server test-zookeeper-0.test-zookeeper-headless:2181 create /foo bar

## get /foo from node 1
$ kubectl exec test-zookeeper-0 -- zkCli.sh -server test-zookeeper-1.test-zookeeper-headless:2181 get /foo
```

<br>

#### Kafka
```sh
## add helm repo
$ helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update

## external zookeeper ensemble 사용
$ helm install test-kafka \
  --set zookeeper.enabled=false \
  --set externalZookeeper.servers=test-zookeeper-headless:2181 \
  --set replicaCount=3 \
  --set image.tag=3.3.2 \
  bitnami/kafka
```

#### kafka-client
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kafka-client
spec:
  containers:
    - name: kafka-client
      image: confluentinc/cp-kafka:7.3.2
      command:
      - sh
      - -c
      - "exec tail -f /dev/null"
```

* usage
```sh
$ kubectl apply -f kafka-client

$ kubectl exec -it kafka-client -- /bin/bash

## Create the topic
$ kafka-topics --bootstrap-server test-kafka-0.test-kafka-headless:9092,test-kafka-1.test-kafka-headless:9092,test-kafka-2.test-kafka-headless:9092 \
               --topic test-topic \
               --partitions 1 \
               --replication-factor 1 \
               --create \
               --if-not-exists

## topic list
$ kafka-topics --bootstrap-server test-kafka-0.test-kafka-headless:9092,test-kafka-1.test-kafka-headless:9092,test-kafka-2.test-kafka-headless:9092 \
               --list

## Create a message & Produce a test message to the topic
$ echo "$(date -u)" | kafka-console-producer --broker-list test-kafka-headless:9092 --topic test-topic

## Consume a test message from the topic
$ kafka-console-consumer --bootstrap-server test-kafka-headless:9092 --topic test-topic --from-beginning
```


<br><br>

> #### Reference
> * [Confluent Platform and Apache Kafka Compatibility](https://docs.confluent.io/platform/current/installation/versions-interoperability.html#cp-and-apache-ak-compatibility)
> * [Connect to Kafka running in Docker](https://stackoverflow.com/questions/51630260/connect-to-kafka-running-in-docker#51634499)
