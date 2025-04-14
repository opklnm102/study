

Kafka producer로 사용할 때 maxwell과 debezium의 차이를 정리






* kafka producer 사용시 [debezium-connector-mysql](https://github.com/debezium/debezium/tree/main/debezium-connector-mysql)에 비해 구성이 쉽다
  * debezium-connector-mysql - MySQL + Kafka + Kafka Connect 필요
  * maxwell - MySQL + Kafka 필요





maxwell
장점
MySQL + maxwell만 있으면 된다


Advantages
RDS, Kinesis 지원을 고려하여 개발되었기 때문에 RDS의 권한 및 설정 문제가 없음.
database, table 까지 지정하여 event streaming, bootstrap 가능하며, bootstrap은 where 절까지 지원함.
이벤트 데이터 구조가 직관적이고 단순함.
maxswell 이라는 데이터베이스를 만들고 그곳에 테이블로서 작업 중인 메타 데이터를 persistent하게 관리하기 때문에 데몬이 죽더라도 작업한 지점부터 회복 가능함.
현재 가지고 있는 binary log의 특정 지점부터 재시작이 가능






debezium

단점
Kafka Connect 구성 필요



