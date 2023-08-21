# [CDC] Maxwell
> date - 2021.05.26  
> keyworkd - cdc, mysql, maxwell  
> MySQL CDC(Change Data Capture) solution로 사용할 수 있는 zendesk/maxwell에 대해 정리

<br>

## Maxwell
* MySQL binlog(binary log)를 읽고 row update를 JSON으로 Kafka, Kinesis or other streaming platforms에 쓰는 application
* 운영 overhead가 적기 때문에 MySQL과 쓸곳만 있으면 된다
* Use Case
  * ETL
  * cache building/expiring
  * metrics collection
  * search indexing
  * inter-service communication
* MySQL binlog가 변경되는 것을 확인할 때마다 maxwell.heartbeats에 heartbeats를 보닌다
* [data bootstrap](https://maxwells-daemon.io/bootstrapping)을 통해 `select * from table`의 결과를 stream으로 출력해 전체 dataset을 만들 수 있다
  * binlog의 last offset을 사용하는게 아님
  * where 절 지원
* database, table까지 지정하여 event streaming 가능
  * binlog의 특정 지점(offset)부터 시작 가능
* event data structure는 직관적이고 단순함
* metadata를 maxwell이라는 database에 table로 persistent하게 관리하기 때문에 reliability 보장
  * metadata table - bootstrap, columns, databases, heartbeats, positions, schemas, tables
* kafka producer 사용시 [debezium-connector-mysql](https://github.com/debezium/debezium/tree/main/debezium-connector-mysql)에 비해 구성이 쉽다
  * debezium-connector-mysql - MySQL + Kafka + Kafka Connect 필요
  * maxwell - MySQL + Kafka 필요


<br>

### maxwell 동작
* [mysql-binlog-connector-java](https://github.com/osheroff/mysql-binlog-connector-java)를 MySQL binlog client로 사용해서 binlog를 streaming
```sql
mysql> show processlist;

+----------+---------+-----------+--------+-------------+-------+---------------------------------------------------------------+
| Id       | User    | Host      | db     | Command     | Time  | State                                                         |
+----------+---------+-----------+--------+-------------+-------+---------------------------------------------------------------+
| 55260727 | maxwell | 10.0.0.48 | <null> | Binlog Dump | 89293 | Master has sent all binlog to slave; waiting for more updates |
+----------+---------+-----------+--------+-------------+-------+---------------------------------------------------------------+
```

* `show master status;`로 binlog file, position 조회 후 이정보를 가지고 binlog stream 연결
```sql
mysql> show master status;
+----------------------------+----------+--------------+------------------+-------------------+
| File                       | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+----------------------------+----------+--------------+------------------+-------------------+
| mysql-bin-changelog.042620 | 41784573 |              |                  |                   |
+----------------------------+----------+--------------+------------------+-------------------+ 
```
* [BinlogConnectorEventListener](https://github.com/zendesk/maxwell/blob/master/src/main/java/com/zendesk/maxwell/replication/BinlogConnectorEventListener.java)가 queue에 event 적재
```java
// 아래 코드는 불필요한 부분을 제거한 요약
class BinlogConnectorEventListener implements BinaryLogClient.EventListener {
  ...
  public void onEvent(Event event) {
    ...
		EventType eventType = event.getHeader().getEventType();
		BinlogConnectorEvent ep = new BinlogConnectorEvent(event, client.getBinlogFilename(), client.getGtidSet(), gtid, outputConfig);

		while (mustStop.get() != true) {
      ...
			if ( queue.offer(ep, 100, TimeUnit.MILLISECONDS ) ) {
				break;
			}
		}
  }
}
```

* [BinlogConnectorReplicator](https://github.com/zendesk/maxwell/blob/master/src/main/java/com/zendesk/maxwell/replication/BinlogConnectorReplicator.java)가 binlog event를 처리
```java
public class BinlogConnectorReplicator extends RunLoopProcess implements Replicator, BinaryLogClient.LifecycleListener {
  ...
  public RowMap getRow() throws Exception {
		BinlogConnectorEvent event;

		while (true) {
			event = pollEvent();

			switch (event.getType()) {
				case WRITE_ROWS:
				case EXT_WRITE_ROWS:
				case UPDATE_ROWS:
				case EXT_UPDATE_ROWS:
				case DELETE_ROWS:
				case EXT_DELETE_ROWS:
					queue.offerFirst(event);
					rowBuffer = getTransactionRows(event);
					break;
...  
```

<br>

### [MySQL binlog Connector Java]((https://github.com/osheroff/mysql-binlog-connector-java)
* MySQL binary log를 읽어 query, event를 해석해 다른 시스템에 데이터를 동기화하는데 사용
* DB에서 발생하는 변경 사항을 모니터링하고, 이를 외부 시스템으로 전송하여 복제하거나 분석하는데 활용
  * e.g. DB 복제, data warehouse, 실시간 분석 등

#### 장점
* 실시간 복제 - binary log를 사용해 변경 사항을 거의 실시간(near real time)으로 전송하여 데이터 복제
* 데이터 분석 - event를 분석하여 데이터 변경 내역을 추적(CDC, Change Data Capture)하거나 분석
* 백업 및 복구 - 장애 발생시 binary log를 이용해 데이터 복구

<br>

### binlog rotate시 동작
filtering table이 있어도 다음과 같이 진행
1. rotates log file
2. maxwell은 binlog pointer를 이동
3. maxwell은 현재 binlog file에 heartbeat를 보낸다
4. maxwell은 해당 heartbeat를 선택하고 새 파일에 위치를 설정

<br>

### Example
```sh
mysql> insert into `test`.`maxwell` set id = 1, daemon = 'Stanislaw Lem';

maxwell: {
"database": "test",
"table": "maxwell",
"type": "insert",
"ts": 1449786310,
"xid": 940752,
"commit": true,
"data": { "id":1, "daemon": "Stanislaw Lem" }
}
```

```sh
mysql> update test.maxwell set daemon = 'firebus!  firebus!' where id = 1;

maxwell: {
"database": "test",
"table": "maxwell",
"type": "update",
"ts": 1449786341,
"xid": 940786,
"commit": true,
"data": {"id":1, "daemon": "Firebus!  Firebus!"},
"old":  {"daemon": "Stanislaw Lem"}
}
```


<br>

## Maxwell 사용하기

### Configure MySQL
service_id가 설정되어 있고, row-based replication이 켜져 있는지 확인

```conf
$ vi my.cnf

[mysqld]
server_id=1
log-bin=master
binlog_format=row
```
또는 실행 중인 server에서 아래 명령어 실행
```sh
mysql> set global binlog_format=ROW;
mysql> set global binlog_row_image=FULL;
```
> `binlog_format`은 session-based property  
> row-based replication으로 완전히 변환하려면 모든 active connection을 제거해야 한다

<br>

#### Permissions
* maxwell database의 write 권한과 replica 권한 필요
```sh
mysql> CREATE USER 'maxwell'@'%' IDENTIFIED BY 'XXXXXX';
mysql> GRANT ALL ON maxwell.* TO 'maxwell'@'%';
mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'maxwell'@'%';

# or for running maxwell locally:
mysql> CREATE USER 'maxwell'@'localhost' IDENTIFIED BY 'XXXXXX';
mysql> GRANT ALL ON maxwell.* TO 'maxwell'@'localhost';
mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'maxwell'@'localhost';
```

<br>

### Run Maxwell
* docker 기반으로 설명


#### Stdout
* CDC event를 test할 때 유용한 producer
```sh
$ docker run -it --rm zendesk/maxwell bin/maxwell --user=$MYSQL_USERNAME \
    --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=stdout
```

#### Kafka
```sh
$ docker run -it --rm zendesk/maxwell bin/maxwell --user=$MYSQL_USERNAME \
    --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=kafka \
    --kafka.bootstrap.servers=$KAFKA_HOST:$KAFKA_PORT --kafka_topic=maxwell
```

* binlog event가 producing되는 partition은 hash function과 hash string에 의해 결정
```
HASH_FUNCTION(HASH_STRING) % TOPIC.NUMBER_OF_PARTITIONS
```
* Maxwell 시작시 kafka topic의 partition 수를 검색
  * kafka의 `auto.create.topics.enable`가 false면 topic이 미리 생성되어 있어야하고, true면 필요 없다


#### Kinesis
```sh
$ docker run -it --rm --name maxwell -v `cd && pwd`/.aws:/root/.aws zendesk/maxwell sh -c 'cp /app/kinesis-producer-library.properties.example /app/kinesis-producer-library.properties && echo "Region=$AWS_DEFAULT_REGION" >> /app/kinesis-producer-library.properties && bin/maxwell --user=$MYSQL_USERNAME --password=$MYSQL_PASSWORD --host=$MYSQL_HOST --producer=kinesis --kinesis_stream=$KINESIS_STREAM'
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: maxwell
  labels:
    app: maxwell
spec:
  replicas: 1
  selector:
    matchLabels:
      app: maxwell
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: maxwell
    spec:
      serviceAccountName: maxwell
      containers:
        - name: maxwell
          image: zendesk/maxwell:v1.29.1
          command: ["bin/maxwell"]
          args: [ "--log_level=$(LOG_LEVEL)", "--host=$(HOST)", "--user=$(USER)", "--password=$(PASSWORD)", "--jdbc_options=$(JDBC_OPTIONS)", "--filter=$(FILTER)", "--producer=$(PRODUCER)", "--producer_partition_by=$(PRODUCER_PARTITION_BY)", "--kafka.bootstrap.servers=$(KAFKA_BOOTSTRAP_SERVERS)", "--kafka_topic=$(KAFKA_TOPIC)", "--kafka_version=$(KAFKA_VERSION)", "--ddl_kafka_topic=$(DDL_KAFKA_TOPIC)", "--metrics_prefix=$(METRICS_PREFIX)", "--metrics_type=$(METRICS_TYPE)", "--http_port=$(HTTP_PORT)" ]
          ports:
            - containerPort: 8080
              name: http
          livenessProbe:
            httpGet:
              path: /healthcheck
              port: http
          readinessProbe:
            httpGet:
              path: /healthcheck
              port: http
          env:
            ## general
            - name: LOG_LEVEL
              value: "info"
            ## mysql
            - name: HOST
              value: "my-service-mysql"
            - name: USER
              valueFrom:
                secretKeyRef:
                  name: maxwell
                  key: username
            - name: PASSWORD
              valueFrom:
                secretKeyRef:
                  name: maxwell
                  key: password
            - name: JDBC_OPTIONS
              value: "useSSL=false&connectTimeout=30000&autoReconnect=true"
            ## producer
            - name: PRODUCER
              value: "kafka"
            - name: PRODUCER_PARTITION_BY
              value: "primary_key"
            ## kafka producer
            - name: KAFKA_BOOTSTRAP_SERVERS
              value: "kafka-0.kafka-headless:9092,kafka-1.kafka-headless:9092,kafka-2.kafka-headless:9092"
            - name: KAFKA_TOPIC
              value: "maxwell.%{database}.%{table}"
            - name: KAFKA_VERSION
              value: "1.0.0"
            - name: DDL_KAFKA_TOPIC
              value: "maxwell.ddl"
            ## filtering
            - name: FILTER
              value: "exclude: *.*, include: my-service.order, my-service.account"
            ## monitoring / metrics
            - name: METRICS_PREFIX
              value: "maxwell"
            - name: METRICS_TYPE
              value: "http"
            - name: HTTP_PORT
              value: "8080"
```

<br>

## Metrics
* `/metrics`
```sh
$ curl localhost:8080/metrics

{
   "version":"4.0.0",
   "gauges":{
      "maxwell.replication.lag":{
         "value":685
      }
   },
   "counters":{
      "maxwell.message.publish.age.slo_violation":{
         "count":0
      },
      "maxwell.messages.failed":{
         "count":0
      },
      "maxwell.messages.succeeded":{
         "count":0
      },
      "maxwell.row.count":{
         "count":10
      }
   },
   "histograms":{
      "maxwell.transaction.execution_time":{
         "count":10,
         "max":0,
         "mean":0.0,
         "min":0,
         "p50":0.0,
         "p75":0.0,
         "p95":0.0,
         "p98":0.0,
         "p99":0.0,
         "p999":0.0,
         "stddev":0.0
      },
      "maxwell.transaction.row_count":{
         "count":10,
         "max":1,
         "mean":1.0,
         "min":1,
         "p50":1.0,
         "p75":1.0,
         "p95":1.0,
         "p98":1.0,
         "p99":1.0,
         "p999":1.0,
         "stddev":0.0
      }
   },
   "meters":{
      "maxwell.messages.failed.meter":{
         "count":0,
         "m15_rate":0.0,
         "m1_rate":0.0,
         "m5_rate":0.0,
         "mean_rate":0.0,
         "units":"events/second"
      },
      "maxwell.messages.succeeded.meter":{
         "count":0,
         "m15_rate":0.0,
         "m1_rate":0.0,
         "m5_rate":0.0,
         "mean_rate":0.0,
         "units":"events/second"
      },
      "maxwell.row.meter":{
         "count":10,
         "m15_rate":0.19465229225711553,
         "m1_rate":0.15087839270088274,
         "m5_rate":0.18511664359741642,
         "mean_rate":0.1289459262129553,
         "units":"events/second"
      }
   },
   "timers":{
      "maxwell.message.publish.age":{
         "count":0,
         "max":0.0,
         "mean":0.0,
         "min":0.0,
         "p50":0.0,
         "p75":0.0,
         "p95":0.0,
         "p98":0.0,
         "p99":0.0,
         "p999":0.0,
         "stddev":0.0,
         "m15_rate":0.0,
         "m1_rate":0.0,
         "m5_rate":0.0,
         "mean_rate":0.0,
         "duration_units":"seconds",
         "rate_units":"calls/second"
      },
      "maxwell.message.publish.time":{
         "count":0,
         "max":0.0,
         "mean":0.0,
         "min":0.0,
         "p50":0.0,
         "p75":0.0,
         "p95":0.0,
         "p98":0.0,
         "p99":0.0,
         "p999":0.0,
         "stddev":0.0,
         "m15_rate":0.0,
         "m1_rate":0.0,
         "m5_rate":0.0,
         "mean_rate":0.0,
         "duration_units":"seconds",
         "rate_units":"calls/second"
      },
      "maxwell.replication.queue.time":{
         "count":36,
         "max":0.0,
         "mean":0.0,
         "min":0.0,
         "p50":0.0,
         "p75":0.0,
         "p95":0.0,
         "p98":0.0,
         "p99":0.0,
         "p999":0.0,
         "stddev":0.0,
         "m15_rate":0.7743355736923151,
         "m1_rate":0.5578188514567581,
         "m5_rate":0.7285355475904361,
         "mean_rate":0.4647582700459352,
         "duration_units":"seconds",
         "rate_units":"calls/second"
      }
   }
}
```

* `/prometheus`
```sh
$ curl localhost:8080/prometheus

# HELP maxwell_replication_lag Generated from Dropwizard metric import (metric=maxwell.replication.lag, type=com.zendesk.maxwell.replication.BinlogConnectorEventListener$$Lambda$160/0x00000001002c1840)
# TYPE maxwell_replication_lag gauge
maxwell_replication_lag 724.0
# HELP maxwell_message_publish_age_slo_violation Generated from Dropwizard metric import (metric=maxwell.message.publish.age.slo_violation, type=com.codahale.metrics.Counter)
# TYPE maxwell_message_publish_age_slo_violation gauge
maxwell_message_publish_age_slo_violation 0.0
# HELP maxwell_messages_failed Generated from Dropwizard metric import (metric=maxwell.messages.failed, type=com.codahale.metrics.Counter)
# TYPE maxwell_messages_failed gauge
maxwell_messages_failed 0.0
# HELP maxwell_messages_succeeded Generated from Dropwizard metric import (metric=maxwell.messages.succeeded, type=com.codahale.metrics.Counter)
# TYPE maxwell_messages_succeeded gauge
maxwell_messages_succeeded 0.0
# HELP maxwell_row_count Generated from Dropwizard metric import (metric=maxwell.row.count, type=com.codahale.metrics.Counter)
# TYPE maxwell_row_count gauge
maxwell_row_count 13.0
# HELP maxwell_transaction_execution_time Generated from Dropwizard metric import (metric=maxwell.transaction.execution_time, type=com.codahale.metrics.Histogram)
# TYPE maxwell_transaction_execution_time summary
maxwell_transaction_execution_time{quantile="0.5",} 0.0
maxwell_transaction_execution_time{quantile="0.75",} 0.0
maxwell_transaction_execution_time{quantile="0.95",} 0.0
maxwell_transaction_execution_time{quantile="0.98",} 0.0
maxwell_transaction_execution_time{quantile="0.99",} 0.0
maxwell_transaction_execution_time{quantile="0.999",} 0.0
maxwell_transaction_execution_time_count 13.0
# HELP maxwell_transaction_row_count Generated from Dropwizard metric import (metric=maxwell.transaction.row_count, type=com.codahale.metrics.Histogram)
# TYPE maxwell_transaction_row_count summary
maxwell_transaction_row_count{quantile="0.5",} 1.0
maxwell_transaction_row_count{quantile="0.75",} 1.0
maxwell_transaction_row_count{quantile="0.95",} 1.0
maxwell_transaction_row_count{quantile="0.98",} 1.0
maxwell_transaction_row_count{quantile="0.99",} 1.0
maxwell_transaction_row_count{quantile="0.999",} 1.0
maxwell_transaction_row_count_count 13.0
# HELP maxwell_message_publish_age Generated from Dropwizard metric import (metric=maxwell.message.publish.age, type=com.codahale.metrics.Timer)
# TYPE maxwell_message_publish_age summary
maxwell_message_publish_age{quantile="0.5",} 0.0
maxwell_message_publish_age{quantile="0.75",} 0.0
maxwell_message_publish_age{quantile="0.95",} 0.0
maxwell_message_publish_age{quantile="0.98",} 0.0
maxwell_message_publish_age{quantile="0.99",} 0.0
maxwell_message_publish_age{quantile="0.999",} 0.0
maxwell_message_publish_age_count 0.0
# HELP maxwell_message_publish_time Generated from Dropwizard metric import (metric=maxwell.message.publish.time, type=com.codahale.metrics.Timer)
# TYPE maxwell_message_publish_time summary
maxwell_message_publish_time{quantile="0.5",} 0.0
maxwell_message_publish_time{quantile="0.75",} 0.0
maxwell_message_publish_time{quantile="0.95",} 0.0
maxwell_message_publish_time{quantile="0.98",} 0.0
maxwell_message_publish_time{quantile="0.99",} 0.0
maxwell_message_publish_time{quantile="0.999",} 0.0
maxwell_message_publish_time_count 0.0
# HELP maxwell_replication_queue_time Generated from Dropwizard metric import (metric=maxwell.replication.queue.time, type=com.codahale.metrics.Timer)
# TYPE maxwell_replication_queue_time summary
maxwell_replication_queue_time{quantile="0.5",} 0.0
maxwell_replication_queue_time{quantile="0.75",} 0.0
maxwell_replication_queue_time{quantile="0.95",} 0.0
maxwell_replication_queue_time{quantile="0.98",} 0.0
maxwell_replication_queue_time{quantile="0.99",} 0.0
maxwell_replication_queue_time{quantile="0.999",} 0.0
maxwell_replication_queue_time_count 41.0
# HELP maxwell_messages_failed_meter_total Generated from Dropwizard metric import (metric=maxwell.messages.failed.meter, type=com.codahale.metrics.Meter)
# TYPE maxwell_messages_failed_meter_total counter
maxwell_messages_failed_meter_total 0.0
# HELP maxwell_messages_succeeded_meter_total Generated from Dropwizard metric import (metric=maxwell.messages.succeeded.meter, type=com.codahale.metrics.Meter)
# TYPE maxwell_messages_succeeded_meter_total counter
maxwell_messages_succeeded_meter_total 0.0
# HELP maxwell_row_meter_total Generated from Dropwizard metric import (metric=maxwell.row.meter, type=com.codahale.metrics.Meter)
# TYPE maxwell_row_meter_total counter
maxwell_row_meter_total 13.0
```

## docker compose로 구성
* MySQL + Kafka + Maxwell
```yaml
version: "3.9"
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
   volumes:
     - ./src/test/resources/data:/docker-entrypoint-initdb.d/
    restart: always
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: root!@
      MYSQL_DATABASE: sample
      MYSQL_USER: test
      MYSQL_PASSWORD: test1234!

  kafka:
    container_name: kafka_local
    image: confluentinc/cp-kafka:7.3.2
    ports:
      - "9092:9092"
      - "9997:9997"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9997
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
      KAFKA_LISTENERS: PLAINTEXT://kafka:29092,CONTROLLER://kafka:29093,PLAINTEXT_HOST://0.0.0.0:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
    volumes:
      - ./kafka/kafka-update-run.sh:/tmp/kafka-update-run.sh
    command: "bash -c 'if [ ! -f /tmp/kafka-update-run.sh ]; then echo \"ERROR: Did you forget the update_run.sh file?\" && exit 1 ; else /tmp/kafka-update-run.sh && /etc/confluent/docker/run ; fi'"
    healthcheck:
      test: [ "CMD", "kafka-topics", "--bootstrap-server", "localhost:9092", "--list" ]
      interval: 30s
      timeout: 10s
      retries: 3

  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8010:8080"
    depends_on:
      - kafka
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_METRICS_PORT: 9997
      DYNAMIC_CONFIG_ENABLED: "true"

  maxwell:
    container_name: maxwell
    image: zendesk/maxwell:v1.40.2
    ports:
      - "8080:8080"
    depends_on:
      - kafka
      - mysql
    environment:
      MYSQL_HOST: mysql
      MYSQL_USERNAME: maxwell
      MYSQL_PASSWORD: password
      MAXWELL_PRODUCER: stdout
      KAFKA_BROKERS: kafka:29092
      MAXWELL_OPTIONS: |
        --log_level=info
        --jdbc_options=useSSL=false&connectTimeout=30000&autoReconnect=true
        --filter=exclude:*.*,include:sample.*
        --producer_partition_by=primary_key
        --kafka_topic=maxwell.%{database}.%{table}
        --kafka_version=3.4.0
        --ddl_kafka_topic=maxwell.ddl
        --metrics_prefix=maxwell
        --metrics_type=http
        --http_port=8080
        --binlog_heartbeat=true
```


<br><br>

> #### Reference
> * [zendesk/maxwell - GitHub](https://github.com/zendesk/maxwell)
> * [Maxwell Docs](https://maxwells-daemon.io)
> * [zendesk/maxwell - Docker Hub](https://hub.docker.com/r/zendesk/maxwell)
