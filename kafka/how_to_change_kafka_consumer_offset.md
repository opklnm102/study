# [Kafka] How to change kafka consumer offset
> date - 2021.03.14  
> keyworkd - kafka, offset  
> Kafka consumer에서 data processing 중 오류로 인해 data loss 발생시 offset을 조정하여 troubleshooting하는데  
> ofset 조정하는 방법을 정리  

<br>

## Use case
* development, test시 offset reset이 필요한 경우
* Production에서 예상치 못한 issue로 data loss 발생시 일정 기간 전으로 offset을 rewind해서 사용하고자 하는 경우
  * Kafka broker issue
  * Network issue
  * Consumer application issue

<br>

## Step
* Consumer API를 이용해 programmatic or kafka의 tool로 가능
* Kubernetes에 배포된 kafka cluster에서 진행

<br>

### 1. 작업할 topic의 consumer group shutdown
* consumer group이 실행 중이라면 error가 발생하므로 shutdown 필요

<br>

### 2. kafka broker에 접속
* 어떤 broker든 상관없다
```sh
$ kubectl exec -it kafka-0 -- bash

## example. ns-kafka
$ kubectl -n kafka exec -it kafka-0 -- bash
```

<br>

### 3. dry-run으로 offset 지정 결과 확인
* kafka-consumer-groups shell을 이용해 offset 지정
```sh
$ ./kafka-consumer-groups --bootstrap-server [host:port] \
                          --group [group.id] \
                          --topic [topic:partition] \
                          --reset-offsets \
                          --shift-by [+/- number]

## example. 0, 2번 partition offset + 10할 경우
$ ./kafka-consumer-groups --bootstrap-server localhost:9092 \
                          --group test-consumer-group \
                          --topic 'test.offset.topic:0,2' \
                          --reset-offsets \
                          --shift-by +10

...
TOPIC              PARTITION  NEW-OFFSET
test.offset.topic  3          0
test.offset.topic  4          0
test.offset.topic  2          51878
test.offset.topic  1          0
test.offset.topic  5          0
test.offset.topic  0          0
```
* `--topic` 대신 `--all-topics`를 지정하면 모든 topic에 대해 실행

#### Offset reset option
| offset reset option | Description | Example |
|:--|:--|:--|
| --to-datetime [YYYY-MM-DDTHH:mm:SS.sss±hh:mm] | Reset to datetime, datetime 이후 offset으로 이동 | 2020-03-01 00:00:00(UTC) 이후 offset으로 이동, `--to-datetime 2020-03-01T00:00:00Z` |
| --by-duration [PnDTnHnMnS] | Reset by duration | 1주일 전 offset으로 이동, `--by-duration P7D` |
| --to-earliest | Reset to earliest, 사용 가능한 가장 과거 offset | `--to-earliest` |
| --to-latest | Reset to latest, 사용 가능한 가장 최신 offset | `--to-latest`  |
| --to-offset [Long] | Reset to offset, 원하는 offset으로 이동 | offset 10으로 이동, `--to-offset 10` |
| --shify-by [+/- Long] | Shift offset by 'n' | current offset에서 -10, `--shift-by -10` |
| --from-file [PATH_TO_FILE] | Reset from file, reset plan이 있는 file을 이용해 reset | `--from-file reset-plan.csv` |

<br>

### 4. dry-run으로 확인한 결과에 문제가 없다면 실행
* 마지막에 `--execute` 추가하여 실행
```sh
$ ./kafka-consumer-groups --bootstrap-server [host:port] \
                          --group [group.id] \
                          --topic [topic:partition] \
                          --reset-offsets \
                          --shift-by [+/- number]
                          --execute

## example. offset + 10할 경우
## topic - test.offset.topic
## partition - 0, 2
## consumer group - test-consumer-group
$ ./kafka-consumer-groups --bootstrap-server localhost:9092 \
                          --group test-consumer-group \
                          --topic 'test.offset.topic:0,2' \
                          --reset-offsets \
                          --shift-by +10
                          --execute
```

<br>

### 5. 결과 확인
* consumer group의 topic(partition) status 조회
```sh
$ ./kafka-consumer-groups --bootstrap-server [host:port] \
                          --group [group.id] \
						  --describe

...
TOPIC              PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG        CONSUMER-ID      HOST                         CLIENT-ID
test.offset.topic  0          0               0               0          consumer-xxxxx   /10.0.0.229                  consumer-x
test.offset.topic  1          0               0               0          consumer-xxxxx   /10.0.0.229                  consumer-x
test.offset.topic  2          51888           51888           0          consumer-xxxxx   /10.0.0.229                  consumer-x
test.offset.topic  3          0               0               0          consumer-xxxxx   /10.0.0.229                  consumer-x
test.offset.topic  4          0               0               0          consumer-xxxxx   /10.0.0.229                  consumer-x
test.offset.topic  5          0               0               0          consumer-xxxxx   /10.0.0.229                  consumer-x
```
* TOPIC - topic name
* PARTITION - consumer group의 각 consumer가 할당된 partition number
* CURRENT-OFFSET - consumer가 마지막으로 commit한 offset
* LOG-END-OFFSET - producer가 마지막으로 생성한 record의 offset
* LAG
  * `LOG-END-OFFSET - CURRENT-OFFSET`
  * 일정한 수치를 유지하는게 안정적
  * consumer의 처리량을 판단할 수 있는 지표로 사용할 수 있다

<br>

> #### Lag이 계속 증가한다면?
> * consumer의 처리 속도가 producing을 못따라가는 것
> * consumer를 **scale-out**하거나 consumer의 **logic 최적화**하여 처리량을 증가시켜야한다

<br><br>

> #### Reference
> * [Kafka 운영자가 말하는 Kafka 서버 실전 로그 분석](https://www.popit.kr/%EC%B9%B4%ED%94%84%EC%B9%B4-%EC%9A%B4%EC%98%81%EC%9E%90%EA%B0%80-%EB%A7%90%ED%95%98%EB%8A%94-%EC%B9%B4%ED%94%84%EC%B9%B4-%EC%84%9C%EB%B2%84-%EC%8B%A4%EC%A0%84-%EB%A1%9C%EA%B7%B8-%EB%B6%84%EC%84%9D/)
> * [How to change start offset for topic?](https://stackoverflow.com/questions/29791268/how-to-change-start-offset-for-topic)
