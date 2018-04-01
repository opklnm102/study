# [MySQL] Difference between TRUNCATE TABLE and DELETE
> MySQL에서 data 삭제시 사용하는 command인 TRUNCATE TABLE과 DELETE의 차이가 궁금해 알아본걸 정리


## 공통점
```sql
-- 아래 쿼리의 실행 결과는 같다
DELETE FROM <table name>

TRUNCATE TABLE <table name>
```
* table의 data가 삭제된다


## 차이점

### 1. 조건절의 차이
```sql
-- table의 특정 row만 삭제
DELETE FROM <table name> WHERE id = 2;

-- table의 모든 data 삭제
TRUNCATE TABLE <table name>
```
* DELETE는 `WHERE절을 통해 조건을 부여`할 수 있다
   * 모든 data를 삭제하거나 일부 data를 삭제 
* TRUNCATE는 조건절의 없이 table의 모든 data를 삭제


### 2. 삭제하는 방식의 차이
* DELETE
   * data를 한줄씩 순차적으로 삭제
* TRUNCATE
   * DROP TABLE 후 CREATE 수행
* 목적 차이로 발생
   * delete는 해당 data를 삭제하고 삭제한 공간을 재사용하기 위함
   * truncate는 table 명세만을 남기고 data가 존재하는 공간마저 제거하기 위함
   * 속도는 truncate가 더 빠르지만 복구가 불가능 제한사항 존재
   
> Oracle의 경우 HWM(Hign Water Mark)도 영향을 받는다  
> -> [Oracle - Segment HWM 이해하기](https://m.blog.naver.com/PostView.nhn?blogId=itperson&logNo=220878447705&proxyReferer=https%3A%2F%2Fwww.google.co.kr%2F)를 참고하자



## DELETE, TRUNCATE TABLE의 특징

### DELETE
* DML
* data만 삭제
* data를 한나씩 순차적으로 삭제
* commit 이전에는 rollback 가능
* data를 모두 DELETE해도 사용했던 storage는 release되지 않음
* transaction 발생, transaction log 기록


### TRUNCATE TABLE
* table이 사용했던 storage 중 최초 table 생성시 할당된 storage만 남기고 release
* `DELETE와 유사`하지만 DML보다는 `DDL로 분류`
* 처리 방식이 `DROP TABLE 후 RE-CRATE`라서 큰 table의 경우 하나씩 삭제하는것보다 `훨씬 빠르다`
* rollback 불가능
   * implicit commit이 발생하기 때문
   * [13.3.3 Statements That Cause an Implicit Commit](https://dev.mysql.com/doc/refman/5.5/en/implicit-commit.html) 참고
* table lock을 보유한 session이 존재할 경우 수행 불가
* FK 제약이 존재하는 InnoDB 테이블일 경우 
   * 다른 테이블, 동일 테이블 사이에 FK 조건에 위배될 경우 수행 불가
* 삭제된 행수에 대해 의미있는 값을 반환하지 않는다
   * 0 rows affected -> no information 으로 해석
* data, index가 손상된 경우에도 `<table name>.frm`이 유효하면 빈 table로 재생성 가능
* AUTO_INCREMENT 값이 초기화
   * sequence 값을 재사용하지 않는 MyISAM, InnoDB에서도 마찬가지
* partition된 table일 경우 partition 정보 유지
   * `.par(partition 정의 파일)`은 영향받지 않지만 data, index 파일은 삭제되고 재작성
* `ON DELETE` Trigger를 호출하지 않는다
* HANDLER OPEN으로 열린 table에 대한 모든 handler를 닫는다
* `큰 InnoDB buffer pool` 및 `innodb_adaptive_hash_index`를 허용한 시스템에서는 TRUNCATE TABLE로 인해 innoDB table의 adaptive hash index entry를 삭제할 경우 발생하는 LRU scan에 의해 system performance가 저하할 가능성이 있다
   * truncate table의 know issue


> #### TRUNCATE TABLE이 DROP TABLE -> CREATE로 동작하는 이유
> * 고성능을 위해 data를 삭제하는 DML대신 DDL 사용
> * binary logging과 replication 때문
>    * 트랜잭션 격리 수준에서 명령문 기반 logging(READ COMMITTED, READ UNCOMMITTED)을 허용하지 않는 Transaction Storage Engine(InnoDB 등)을 사용할 때 `STATEMENT 또는 MIXED logging mode`를 사용할 경우 명령문이 기록 및 복제되지 않기 때문
>    * 그러나 InnoDB를 사용한 replication slaves에는 여전히 발생하는 문제


> #### DROP TABLE 특징
> * table의 정의 자체를 완전히 삭제함
> * rollback 불가능
>    * implicit commit이 발생하기 때문
> * table이 사용했던 storage를 모두 release
    

> #### 참고
> * [13.1.33 TRUNCATE TABLE Syntax](https://dev.mysql.com/doc/refman/5.5/en/truncate-table.html)
> * [delete와 truncate의 차이점이 뭔가여](https://community.oracle.com/thread/422792)
> * [Oracle - Segment HWM 이해하기](https://m.blog.naver.com/PostView.nhn?blogId=itperson&logNo=220878447705&proxyReferer=https%3A%2F%2Fwww.google.co.kr%2F)
