# [CDC] CDC of maxwell & debezium-connector-mysql does not work in MySQL 8.0
> date - 2023.08.21  
> keyworkd - cdc, mysql, maxwell, aurora  
> MySQL CDC(Change Data Capture) solution로 사용할 수 있는 zendesk/maxwell에 대해 정리

<br>

## TL;DR
* Aurora MySQL v3(MySQL 8.0 호환)에서 `binlog_row_value_options='PARTIAL_JSON'` 사용시 update query가 발생하면 `Update_rows_partial` binlog event가 발생
* maxwell 1.40.2, debezium-connector-mysql 2.3.2에서 `Update_rows_partial` event 처리가 구현되어 있지 않아 CDC가 동작하지 않는다
* `binlog_row_value_options=''`을 사용하면 `Update_rows` binlog event가 발생하여 CDC가 동작하게 된다


<br>

## Issue
* Aurora MySQL v2 -> v3(MySQL 8.0 호환)로 업그레이드 후 maxwell에서 kafka event를 발행하지 못하는 이슈 발생


<br>

## Why?

### binlog가 생성되는지 확인

#### RDS Parameter Group에서 binlog 설정 확인
* 주요 설정인 binlog_format이 ROW로 설정되어 있어 큰 문제는 확인할 수 없었음

| Name | Value |
|:--|:--|
| binlog_format | ROW |
| binlog_row_images | full |
| binlog_checksum | NONE |
| binlog_row_value_options | PARTIAL_JSON |
| ... | ... |

#### binlog status 확인
```sql
mysql> SHOW MASTER STATUS;
+----------------------------+----------+--------------+------------------+-------------------+
| File                       | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+----------------------------+----------+--------------+------------------+-------------------+
| mysql-bin-changelog.042620 | 41784573 |              |                  |                   |
+----------------------------+----------+--------------+------------------+-------------------+

mysql> SHOW BINARY LOGS;
+----------------------------+-----------+-----------+
| Log_name                   | File_size | Encrypted |
+----------------------------+-----------+-----------+
| mysql-bin-changelog.042620 |  41784573 | No        |
+----------------------------+-----------+-----------+
```

#### binlog retention 확인
* [Configuring](https://docs.aws.amazon.com/ko_kr/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html)를 참고해서 설정 확인

```sql 
mysql> CALL mysql.rds_show_configuration;
 
+------------------------+-------+------------------------------------------------------------------------------------------------------+
| name                   | value | description                                                                                          |
+------------------------+-------+------------------------------------------------------------------------------------------------------+
| binlog retention hours | 72    | binlog retention hours specifies the duration in hours before binary logs are automatically deleted. |
+------------------------+-------+------------------------------------------------------------------------------------------------------+
```

#### binlog format 확인
* mysqlbinlog 사용
* download binlog
```sh
$ mysqlbinlog \
    --read-from-remote-server \
    --host=[mysql host] \
    --port=[mysql port] \
    --user [mysql user] \
    --password \
    --raw \
    --verbose \
    --result-file=/tmp/ \
    [binlog file name]
 
## example
$ docker run -it --rm -v $(pwd):/tmp/ mysql:8.0.32-debian mysqlbinlog \
    --read-from-remote-server \
    --host=test.cluster.ap-northeast-2.rds.amazonaws.com \
    --port=3306  \
    --user maxwell \
    --password \
    --raw \
    --verbose \
    --result-file=/tmp/ \
    mysql-bin-changelog.043330
```

* binary로 저장된 binlog의 내용 확인을 위해 decode
```sh
$ mysqlbinlog -vvv --base64-output=DECODE-ROWS [binarylog_file] > [decodedlog_file]
 
## example
$ docker run -it --rm -v $(pwd):/tmp/ -w /tmp mysql:8.0.32-debian mysqlbinlog -vvv --base64-output=DECODE-ROWS mysql-bin-changelog.043330 > mysql-bin-changelog.043330-decoded
```
* binlog format에는 큰 변화가 없다

#### binlog event 비교
```sql
SHOW BINLOG EVENTS
   [IN 'log_name']
   [FROM pos]
   [LIMIT [offset,] row_count]
```

* MySQL 5.7
```sql
mysql> show binlog events in 'mysql-bin-changelog.043330' from 81889813 limit 100;
+----------------------------+----------+----------------+------------+-------------+-----------------------------------------+
| Log_name                   | Pos      | Event_type     | Server_id  | End_log_pos | Info                                    |
+----------------------------+----------+----------------+------------+-------------+-----------------------------------------+
| mysql-bin-changelog.044851 | 81893672 | Anonymous_Gtid | 1875889833 |    81893737 | SET @@SESSION.GTID_NEXT= 'ANONYMOUS'    |
| mysql-bin-changelog.044851 | 81893737 | Query          | 1875889833 |    81893815 | BEGIN                                   |
| mysql-bin-changelog.044851 | 81893815 | Table_map      | 1875889833 |    81893892 | table_id: 48316 (sample.inventory)        |
| mysql-bin-changelog.044851 | 81893892 | Update_rows    | 1875889833 |    81894098 | table_id: 48316 flags: STMT_END_F       |
| mysql-bin-changelog.044851 | 81894098 | Xid            | 1875889833 |    81894129 | COMMIT /* xid=1557773972 */             |
| mysql-bin-changelog.044851 | 81894129 | Anonymous_Gtid | 1875889833 |    81894194 | SET @@SESSION.GTID_NEXT= 'ANONYMOUS'    |
| mysql-bin-changelog.044851 | 81894194 | Query          | 1875889833 |    81894272 | BEGIN                                   |
| mysql-bin-changelog.044851 | 81894272 | Table_map      | 1875889833 |    81894363 | table_id: 48353 (sample.inventory)          |
| mysql-bin-changelog.044851 | 81894363 | Write_rows     | 1875889833 |    81894483 | table_id: 48353 flags: STMT_END_F       |
| mysql-bin-changelog.044851 | 81894483 | Table_map      | 1875889833 |    81894584 | table_id: 48352 (sample.inventory)  |
| mysql-bin-changelog.044851 | 81894584 | Write_rows     | 1875889833 |    81894790 | table_id: 48352 flags: STMT_END_F       |
| mysql-bin-changelog.044851 | 81896193 | Xid            | 1875889833 |    81896224 | COMMIT /* xid=1557797428 */             |
+----------------------------+----------+----------------+------------+-------------+-----------------------------------------+
```

* MySQL 8.0
```sql
mysql> show binlog events in 'mysql-bin-changelog.043330' from 34015152 limit 100;
 
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
| Log_name                   | Pos      | Event_type          | Server_id  | End_log_pos | Info                                          |
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
| mysql-bin-changelog.042620 | 34019262 | Anonymous_Gtid      | 1194755089 |    34019337 | SET @@SESSION.GTID_NEXT= 'ANONYMOUS'          |
| mysql-bin-changelog.042620 | 34019337 | Query               | 1194755089 |    34019426 | BEGIN                                         |
| mysql-bin-changelog.042620 | 34019426 | Table_map           | 1194755089 |    34019526 | table_id: 169 (sample.inventory) |
| mysql-bin-changelog.042620 | 34019526 | Write_rows          | 1194755089 |    34019654 | table_id: 169 flags: STMT_END_F               |
| mysql-bin-changelog.042620 | 34019654 | Xid                 | 1194755089 |    34019681 | COMMIT /* xid=23583311 */                     |
| mysql-bin-changelog.042620 | 34019681 | Anonymous_Gtid      | 1194755089 |    34019756 | SET @@SESSION.GTID_NEXT= 'ANONYMOUS'          |
| mysql-bin-changelog.042620 | 34019756 | Query               | 1194755089 |    34019854 | BEGIN                                         |
| mysql-bin-changelog.042620 | 34019854 | Table_map           | 1194755089 |    34019954 | table_id: 169 (sample.inventory) |
| mysql-bin-changelog.042620 | 34019954 | Update_rows_partial | 1194755089 |    34020180 | table_id: 169 flags: STMT_END_F               |
| mysql-bin-changelog.042620 | 34020180 | Xid                 | 1194755089 |    34020207 | COMMIT /* xid=23587943 */                     |
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
```
* update event가 다른 것을 확인

<br>

### maxwell에서 Update_rows_partial event를 인식하지 못하는걸까?
* maxwell repository의 issue에서 특별히 관련된 이슈를 확인하지 못했고, 로그에서도 특이점을 발견하지 못했음

#### Maxwell 구현 확인
* [maxwell의 binlog event 처리 부분](https://github.com/zendesk/maxwell/blob/master/src/main/java/com/zendesk/maxwell/replication/BinlogConnectorReplicator.java#L565)을 보면 mysql-binlog-connector-java에서 Update_rows_partial event를 처리하는데 이슈가 없지만 Update_rows_partial event에 대한 처리가 maxwell에 구현되어 있지 않기 때문에 update event가 발행되지 못한 것
```java
private RowMapBuffer getTransactionRows(BinlogConnectorEvent beginEvent) throws Exception {
  BinlogConnectorEvent event;
  RowMapBuffer buffer = new RowMapBuffer(MAX_TX_ELEMENTS, this.bufferMemoryUsage);
 
  String currentQuery = null;
 
  while ( true ) {
    event = pollEvent();
 
    if (event == null) {
      ensureReplicatorThread();
      continue;
    }
 
    EventType eventType = event.getEvent().getHeader().getEventType();
    ...
 
    switch(eventType) {
      case WRITE_ROWS:
      case UPDATE_ROWS:
      case DELETE_ROWS:
      case EXT_WRITE_ROWS:
      case EXT_UPDATE_ROWS:
      case EXT_DELETE_ROWS:  // 여기에 PARTIAL_UPDATE_ROWS_EVENT가 있어야 Update_rows_partial binlog event를 처리할 수 있다
        Table table = tableCache.getTable(event.getTableID());
        if ( table != null && shouldOutputEvent(table.getDatabase(), table.getName(), filter, table.getColumnNames()) ) {
        ...
}
```
* 그러면 insert, delete event는? 잘 발행되고 있는 것을 확인
* 즉, MySQL 8.0에서 insert, delete event는 처리되나 update event만 처리되지 못하고 있는 것

<br>

### maxwell이 문제라면 다른 CDC tool을 사용해보자
* [maxwell](https://github.com/zendesk/maxwell), [debezium-connector-mysql](https://github.com/debezium/debezium/tree/main/debezium-connector-mysql)에서 [mysql-binlog-connector-java](https://github.com/osheroff/mysql-binlog-connector-java)를 MySQL binlog client로 사용해서 binlog를 streaming

| CDC | mysql-binlog-connector-java version |
|:--|:--|
| maxwell 1.40.2 | 0.27.4 |
| debezium-connector-mysql 2.3.2 | 0.27.2 |

* debezium-connector-mysql를 테스트
  * 동작하면 Maxwell -> debezium-connector-mysql로 교체
  * 동작안하면 DB 설정 확인
* MySQL 8.0 + Kafka + Kafka Connect + debezium-connector-mysql 구성
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

  kafka-connect:
    container_name: kafka-connect
    image: confluentinc/cp-kafka-connect:7.4.1
    ports:
      - "8083:8083"
    volumes:
      - ./connector:/usr/share/java/plugins
    depends_on:
      - kafka
      - mysql
    environment:
      # https://docs.confluent.io/platform/current/installation/docker/config-reference.html#kconnect-long-configuration
      CONNECT_BOOTSTRAP_SERVERS: kafka:29092
      CONNECT_REST_ADVERTISED_HOST_NAME: localhost
      CONNECT_GROUP_ID: connect
      CONNECT_CONFIG_STORAGE_TOPIC: connect-config
      CONNECT_OFFSET_STORAGE_TOPIC: connect-offsets
      CONNECT_STATUS_STORAGE_TOPIC: connect-status
      CONNECT_KEY_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_VALUE_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_INTERNAL_KEY_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_INTERNAL_VALUE_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_PLUGIN_PATH: /usr/share/java
```
* debezium-connector-mysql에서도 update event를 처리하지 못했고, DB 설정 확인시 MySQL 8.0에 추가된 `binlog_row_value_options`에 대해 테스트
  * [MySQL 8.0 - Partial update of JSON values(Partial Update of LOB) LOB 의 부분 업데이트](https://hoing.io/archives/3940) 참고
```
binlog-row-value-options는 MySQL 데이터베이스 시스템의 설정 옵션 중 하나로, 로깅되는 이진 로그(binlog) 내에서 행 데이터를 어떻게 표시할지를 제어합니다.
이 옵션은 MySQL 서버의 성능 향상과 데이터 일관성을 관리하는 데 도움이 될 수 있습니다.
 
binlog-row-value-options 옵션은 MySQL 8.0.23 버전에서 처음 도입되었습니다.
이전 버전의 MySQL에서는 이러한 유연한 로깅 옵션이 없었기 때문에, 새로운 데이터 변경 형식을 지원하는 데 도움이 됩니다.
 
이 옵션을 사용하면 로그된 행 데이터의 표시 방식을 조정할 수 있습니다.
이진 로그를 읽는 레플리케이션 및 백업 도구는 이 정보를 활용하여 데이터를 복원하거나 동기화하는 데 도움이 됩니다.
 
요약하자면, binlog-row-value-options는 MySQL 8.0.23 버전에서 처음 도입된 옵션으로, 로깅되는 이진 로그 내에서 행 데이터의 표시 방식을 조정할 수 있게 해주는 기능입니다.
 
PARTIAL_JSON으로 설정하면 JSON 문서의 일부만 수정하는 업데이트에 공간 효율적인 바이너리 로그 형식을 사용할 수 있으므로 행 기반 복제가 전체 문서를 기록하는 대신 바이너리 로그의 업데이트에 대한 애프터 이미지에 JSON 문서의 수정된 부분만 기록하게 됩니다(JSON 값의 부분 업데이트 참조).
이 기능은 JSON_SET(), JSON_REPLACE(), JSON_REMOVE() 시퀀스를 사용하여 JSON 열을 수정하는 UPDATE 문에서 작동합니다.
서버가 부분 업데이트를 생성할 수 없는 경우 전체 문서가 대신 사용됩니다.
 
binlog_row_value_options=PARTIAL_JSON은 바이너리 로깅이 활성화되고 binlog_format이 ROW 또는 MIXED로 설정된 경우에만 적용됩니다.
문 기반 복제는 binlog_row_value_options에 설정된 값에 관계없이 항상 JSON 문서의 수정된 부분만 기록합니다.
저장 공간을 최대화하려면 이 옵션과 함께 binlog_row_image=NOBLOB 또는 binlog_row_image=MINIMAL을 사용합니다.
binlog_row_image=FULL은 전체 JSON 문서가 이전 이미지에 저장되고 부분 업데이트는 이후 이미지에만 저장되므로 이 두 옵션보다 공간을 덜 절약합니다.
```

<br>

### binlog_row_value_options에 따른 binlog event 비교
#### binlog_row_value_options=''일 때
```sql
mysql> show binlog events in 'mysql-bin-changelog.044851' from 81889813 limit 100;
 
+----------------------------+----------+----------------+------------+-------------+------------------------------------+
| Log_name                   | Pos      | Event_type     | Server_id  | End_log_pos | Info                               |
+----------------------------+----------+----------------+------------+-------------+------------------------------------+
| mysql-bin-changelog.044851 | 81889813 | Query          | 1875889833 |    81889895 | BEGIN                              |
| mysql-bin-changelog.044851 | 81889895 | Table_map      | 1875889833 |    81890223 | table_id: 48268 (sample.inventory) |
| mysql-bin-changelog.044851 | 81890223 | Update_rows    | 1875889833 |    81891292 | table_id: 48268 flags: STMT_END_F  |
| mysql-bin-changelog.044851 | 81891292 | Xid            | 1875889833 |    81891323 | COMMIT /* xid=1557722037 */        |
+----------------------------+----------+----------------+------------+-------------+------------------------------------+
```
* update시 Update_rows event 발생하고 CDC로 event 발행


#### binlog_row_value_options='PARTIAL_JSON'일 때
```sql
mysql> show binlog events in 'mysql-bin-changelog.044851' from 81889813 limit 100;
 
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
| Log_name                   | Pos      | Event_type          | Server_id  | End_log_pos | Info                                          |
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
| mysql-bin-changelog.042620 | 34024490 | Query               | 1194755089 |    34024588 | BEGIN                                         |
| mysql-bin-changelog.042620 | 34024588 | Table_map           | 1194755089 |    34024688 | table_id: 169 (sample.inventory) |
| mysql-bin-changelog.042620 | 34024688 | Update_rows_partial | 1194755089 |    34024914 | table_id: 169 flags: STMT_END_F               |
| mysql-bin-changelog.042620 | 34024914 | Xid                 | 1194755089 |    34024941 | COMMIT /* xid=23588999 */                     |
+----------------------------+----------+---------------------+------------+-------------+-----------------------------------------------+
```
* update시 Update_rows_partial event 발생하고 CDC로 event 발행되지 않음



<br>

## Resolve
* 아래 두가지 방법 중 하나로 해결 가능

### 1. binlog_row_value_options='' 사용
* RDS Parameter Group에서 `binlog_row_value_options=''`로 수정
* 수정 후 `Update_rows` binlog event가 발행되고 maxwell에서 CDC가 정상 동작하는 것을 확인


### 2. Update_rows_partial 처리하는 maxwell, debezium-connector-mysql 사용
* Update_rows_partial를 처리하도록 구현 필요
* 2023-08-21에는 패치된 버전이 없으므로 1번 방법이 더 간단한 해결 방법


<br><br>

> #### Reference
> * [Configuring MySQL binary logging](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)
> * [Accessing MySQL binary logs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.Binarylog.html)
> * [MySQL을 소스로 사용하면 AWS DMS CDC 작업이 실패하고 1236 오류가 발생하는데 그 이유가 무엇인가요?](https://repost.aws/ko/knowledge-center/dms-cdc-error-1236-msql)
> * [SHOW BINLOG EVENTS Statement](https://dev.mysql.com/doc/refman/8.0/en/show-binlog-events.html)
> * [MySQL 8.0 - Partial update of JSON values(Partial Update of LOB) LOB 의 부분 업데이트](https://hoing.io/archives/3940)
