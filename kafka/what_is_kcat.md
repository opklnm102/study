# [Kafka] What is kcat
> date - 2023.04.04  
> keyworkd - kafka, kcat  
> kafka 사용시 유용한 kcat에 대해 정리  

<br>

## kcat이란?
* kafkacat으로 알려진 Non-JVM Kafka Producer/Consumer tool
* 파워풀한 Produce, Consume, Metadata Listing 기능, schema registry, avro format 지원을 제공하여 kafka의 kafka-console-producer, kafka-console-consume보다 유용
* producer는 stdin에서 메시지를 읽어 producing하고 consumer는 stdout으로 출력


<br>

## Usage
* Docker
```sh
kcat() {
  docker run --rm -it --network=host edenhill/kcat:1.7.1 "$@"
}
```
* Kubernetes
```yaml
image: confluentinc/cp-kafkacat:latest
command:
- -sh
- -c
- exec tail -f /dev/null
```

<br>

### Producer
* `-P` - producer mode, data가 kcat으로 pipe되면 자동으로 producer mode 선택
```sh
$ kcat -b <broker> -t <topic> -p <partition> -P

## example
$ kcat -b localhost:9092 -t test -p 3 -P
```

#### 파일을 cat으로 읽어서 produce
```sh
$ cat test.txt | kcat -b <broker> -t <topic> -P
```

#### 파일을 읽어서 produce
* binary data 전송시 유용
* `-T` - input을 stdout으로 echo
```sh
$ kcat -b <broker> -t <topic> -T -P -l <file>
```

#### message key 지정
```sh
$ kcat -b <broker> -t <topic> -P -K<delim>

## example
$ kcat -b localhot:9092 -t test -P -K:
1:foo
2:bar
```


<br>

### Consumer
* `-C` - consumer mode, stdout으로 pipe되면 자동으로 consumer mode 선택
```sh
$ kcat -b <broker> -t <topic> -C

## example
$ kcat -b localhost:9092 -t test -C
```

#### N개의 message consume
```sh
$ kcat -b <broker> -t <topic> -C -c <num>

## example
$ kcat -b localhost:9092 -t test -C -c2
```

#### message key 보기
```sh
$ kcat -b <broekr> -t <topic> -C -K <delim>

$ kcat -b localhost:9092 -t test -C -K:
```

#### consuming format 지정
```sh
$ kcat -b <broker> -t <topic> -C -f <format>

## example
$ kcat -b localhost:9092 -t test -C -f 'Key: %k\nValue: %s\n'

$ kcat -b localhost:9092 -t test -C -f '\nKey (%K bytes): %k\t\nValue (%S bytes): %s\nTimestamp: %T\tPartition: %p\tOffset: %o\n--\n'
```

#### offset 지정
```sh
$ kcat -b <broker> -t <topic> -C -o <offset>

## example
$ kcat -b localhost:9092 -o beginning -t test -C
```

#### high level consumer mode
```sh
$ kcat -b <broekr> -G <group id> <topic list>

## example
$ kcat -b localhost:9092 -G kcat-group test-1 test-2
```


<br>

### Metadata Listing
* kafka cluster state, topic, partition, replicas, in-sync replicas 표시
```sh
$ kcat -b <broker> -L
```

* json format(`-J`)으로 출력
```sh
$ kcat -b <broker> -L -J
```


<br><br>

> #### Reference
> * [Generic command line non-JVM Apache Kafka producer and consumer](https://github.com/edenhill/kcat)
> * [kcat (formerly kafkacat) Utility](https://docs.confluent.io/platform/current/clients/kafkacat-usage.html)
