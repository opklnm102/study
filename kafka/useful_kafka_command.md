# [Kafka] Useful Kafka command
> date - 2022.09.04  
> keyworkd - kafka, command  
> kafka 사용시 유용한 command 정리  
> Kafka 버전에 따라 `--zookeeper`, `--bootstrap-server`, `--broker-list`를 적절히 사용해야한다

<br>

## Kafka CLI Configuration
* container image를 사용하기 때문에 $HOME/.zshrc에 아래와 같이 추가
```sh
kafka-cli() {
  docker run -it --rm --entrypoint=sh bitnami/kafka:${TAG} /opt/bitnami/kafka/bin/"$@"
}
```

* 아니면 아래와 같이 세분화해서 추가해도 무방하다
```sh
kafka-cli-topic() {
  docker run -it --rm --entrypoint=sh bitnami/kafka /opt/bitnami/kafka/bin/kafka-topics.sh "$@"
}

kafka-cli-consumer-groups() {
  docker run -it --rm --entrypoint=sh bitnami/kafka /opt/bitnami/kafka/bin/kafka-consumer-groups.sh "$@"
}

kafka-cli-reassign-partitions() {
  docker run -it --rm --entrypoint=sh bitnami/kafka /opt/bitnami/kafka/bin/kafka-reassign-partitions.sh "$@"
}
```


<br>

## Topic

### Create topics
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --create \
                            --topic [topic] \
                            --partitions [partition] \
                            --replication-factor [replication factor]

## example
$ kafka-cli kafka-topics.sh --zookeeper zookeeper:2181 \
                            --create \
                            --topic test \
                            --partitions 6 \
                            --replication-factor 3
```

<br>

### List topics
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --list

## example
$ kafka-cli kafka-topics.sh --zookeeper zookeeper:2181 \
                            --list
```

<br>

### Describe topics
현재 partition 할당 등의 topic 정보 조회
* 전체 topic 조회
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --describe
```

* 특정 topic 조회
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --topic [topic] \
                            --describe

## example
$ kafka-cli kafka-topics.sh --zookeeper zookeeper:2181 \
                            --topic test \
                            --describe

Topic: test   PartitionCount: 10      ReplicationFactor: 3    Configs: min.insync.replicas=2,message.format.version=2.6-IV0,unclean.leader.election.enable=true
        Topic: test   Partition: 0    Leader: 3       Replicas: 3,1,2 Isr: 3,1,2
        Topic: test   Partition: 1    Leader: 1       Replicas: 1,2,3 Isr: 1,2,3
        Topic: test   Partition: 2    Leader: 2       Replicas: 2,3,1 Isr: 2,3,1
...
```

<br>

### Delete topics
* `delete.topic.enable=true` 필요
* delete marked된 후 일정 시간 후 cluster에서 topic 제거되나 exception 발생시 복구된다
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --topic [topic] \
                            --delete
```


* 복구 동작 없이 topic 제거
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --topic [topic] \
                            --delete \
                            --force
```

<br>

### Set topic retention - time based
* cluster의 default retention으로 생성되어 더 짧게 or 길게 변경하기 위해 topic level에서 재정의
```sh
$ kafka-cli kafka-configs.sh --zookeeper [zookeeper endpoint] \
                             --alter \
                             --entity-name [topic] \
                             --entity-type topics \
                             --add-config retention.ms=60000  # 60s

## 확인
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --topic [topic] \
                            --describe
Topic:test	PartitionCount:6	ReplicationFactor:3	Configs:retention.ms=60000
	Topic: test	Partition: 0	Leader: 1003	Replicas: 1003,1001,1002	Isr: 1003,1001,1002
...
```


<br>

## Simple producer & consumer
* start console producer
```sh
$ kafka-cli kafka-console-producer.sh --broker-list [broker endpoint] \
                                      --topic [topic]

## example
$ kafka-cli kafka-console-producer.sh --broker-list my-kafka:9092 \
                                      --topic test
```

* start console consumer
```sh
$ kafka-cli kafka-console-consumer.sh --bootstrap-server [broker endpoint] \
                                      --topic [topic] \
                                      --from-beginning  # offset의 처음부터 읽기

## example
$ kafka-cli kafka-console-consumer.sh --bootstrap-server my-kafka:9092 \
                                      --topic test \
                                      --from-beginning
```


<br>

## Consumer

### Consumer list
```sh
$ kafka-cli kafka-consumer-groups.sh --bootstrap-server [broker endpoint] \
                                     --list
```

<br>

### Consumer offset 확인
```sh
$ kafka-cli kafka-consumer-groups.sh --bootstrap-server [broker endpoint] \
                                     --group [consumer group] \
                                     --describe
```

<br>

### Kafka consumer offset 변경
* `dry-run`으로 확인 후 변경하자
```sh
$ kafka-cli kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
                                     --group [consumer group] \
                                     --topic [topic:partition] \
                                     --reset-offsets \
                                     --shift-by [+/- number] \
                                     --execute  # 없으면 dry-run

## example. offset + 10할 경우
$ kafka-cli kafka-consumer-groups.sh --bootstrap-server my-kafka:9092 \
                                     --group test-consumer-group \
                                     --topic test:1,2 \
                                     --reset-offsets \
                                     --shift-by +10

### 위 명령어의 결과가 문제가 없다면 --execute 추가하여 실행
$ kafka-cli kafka-consumer-groups.sh --bootstrap-server my-kafka:9092 \
                                     --group test-consumer-group \
                                     --topic test:1,2 \
                                     --reset-offsets \
                                     --shift-by +10 \
                                     --execute
```

<br>

### consumer group 제거
* old consumer만 제거 가능
* new consumer는 latest commited offset이 만료되면 group이 제거되므로, group metadata를 제거할 필요가 없다
```sh
$ kafka-cli kafka-consumer-groups.sh --zookeeper [zookeeper endpoint] \
                                     --group [consumer group] \
                                     --delete
```


<br>

## Partition

### Add partition
* topic의 partition을 추가
  * topic scale up
  * 각 partition의 부하 분산
  * consumer group의 consumer 수 증가
* message key가 있는 topic에 partition을 추가할 경우 key에 mapping된 partition이 변경될 수 있다
* partition 감소가 필요할 경우 topic 재생성
```sh
$ kafka-cli kafka-topics.sh --zookeeper [zookeeper endpoint] \
                            --create \
                            --topic [topic] \
                            --partitions [추가할 partition 개수] \
                            --if-not-exists
```

<br>

### Reassignment partition
* broker 추가시 new broker에는 partition이 할당되어 있지 않으므로 분배 필요

#### 1. new partition configuration 생성
```sh
$ kafka-cli kafka-reassign-partitions.sh --bootstrap-server [broker endpoint] \
                                         --zookeeper [zookeeper endpoint] \
                                         --topics-to-move-json-file topic-to-move.json \
                                         --broker-list [broker list] \  # partition을 분배할 broker list
                                         --generate

## example
$ kafka-cli kafka-reassign-partitions.sh --bootstrap-server my-kafka:9092 \
                                         --zookeeper my-zookeeper:2181 \
                                         --topics-to-move-json-file topic-to-move.json \
                                         --broker-list "0,1,2" \
                                         --generate 

Current partition replica assignment
{
   "version":1,
   "partitions":[
      {
         "topic":"test",
         "partition":0,
    ...
}

Proposed partition reassignment configuration
{
   "version":1,
   "partitions":[
      {
         "topic":"test",
         "partition":0,
    ...
}
```
* Proposed partition reassignment configuration에서 생성된 json을 `expand-cluster-reassignment.json`로 저장
* Current partition replica assignment의 json은 `original-state.json`로 rollback 용으로 저장

#### 2. Execute the change
* 아래 명령어로 partition reassignment 시작
```sh
$ kafka-cli kafka-reassign-partitions.sh --bootstrap-server [broker endpoint] \
                                         --zookeeper [zookeeper endpoint] \
                                         --reassignment-json-file expand-cluster-reassignment.json \
                                         --execute
...
Successfully started reassignment of partitions.
```

#### 3. monitor the progress
* assignments 진행 확인
```sh
$ kafka-cli kafka-reassign-partitions.sh --bootstrap-server [broker endpoint] \
                                         --zookeeper [zookeeper endpoint] \
                                         --reassignment-json-file expand-cluster-reassignment.json \
                                         --verify

Status of partition reassignment: 
Reassignment of partition test10-8 completed successfully
...
```


#### 4. Rollback
* partition assignment만 rollback되며 cluster의 broker 생성/추가는 rollback되지 않는다
```sh
$ kafka-cli kafka-reassign-partitions.sh --bootstrap-server [broker endpoint] \
                                         --zookeeper [zookeeper endpoint] \
                                         --reassignment-json-file original-state.json \
                                         --execute
```

* 처음과 동일하게 partition leader에 broker 1 ~ 3만 있는 것을 확인
```sh
$ kafka-cli kafka-topics.sh --bootstrap-server [broker endpoint] 
Topic: test10   PartitionCount: 10      ReplicationFactor: 3    Configs: min.insync.replicas=2,message.format.version=2.6-IV0,unclean.leader.election.enable=true
        Topic: test   Partition: 0    Leader: 2       Replicas: 3,1,2 Isr: 1,2,3
        Topic: test   Partition: 1    Leader: 3       Replicas: 1,2,3 Isr: 2,3,1
        Topic: test   Partition: 2    Leader: 2       Replicas: 2,3,1 Isr: 2,3,1
...
```


<br><br>

> #### Reference
> * [APACHE KAFKA QUICKSTART](https://kafka.apache.org/quickstart)
