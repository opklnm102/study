# [MySQL] Derived Tables
> 사내 첫 프로젝트에서 Derived Table이란 용어를 듣고 알아본 내용을 정리  


## Drived Table이란?
* subquery in FROM classe
   * `FROM절에 subquery`로 만들어진 temporary table
   * query 실행시 내부 작업으로 인해 임시적으로 생성되는 query
```sql
SELECT * FROM (SELECT * FROM table where id > 5) AS T1;
```
* View(Named Derived Table)
   * Drived Table을 View로 변경하는게 가능해서

> MySQL 5.7부터 Derived Table과 View에 대한 성능 개선이 많이 이루어짐 


## 처리 방식
* 같은 일을 하는 2개의 쿼리
```sql
-- 1
CREATE view v1 AS SELECT * FROM t1;
SELECT * FROM v1 JOIN t2 USING (a);

-- 2
SELECT * FROM (SELECT * FROM t1) AS dt1 JOIN t2 USING(a);
```

### MySQL 5.6까지 처리 방식

#### View
* outer query와 병합되어 처리 가능

#### Derived Table
* 구체화되어 outer query안에 temporary table을 사용하듯이 처리
* 2가지 이유로 비용이 많이 든다
   1. materialized temporary table을 만들고 읽는데 많은 시간 필요
   2. outer query와 derived table 사이에 조건을 미리 공유하여 필요한 데이터만 필터링 하는 것이 힘들다(push down condition)


### MySQL 5.7에서 변경된 처리 방식
* query 실행 중에 resolve 과정에서 outer table과 derived table을 `병합할지 구체화할지 결정`함
* 병합되어 처리되지 않고 기존 방식으로 처리되는 경우
   * UNION
   * GROUP BY
   * DISTINCT
   * Aggregation
   * LIMIT, OFFSET
   * 사용자가 생성한 변수 포함

> #### resolve란?
> 딕셔너리에서 table과 column 정보를 찾고, query가 정확한지 찾는 일련의 과정


#### View
* 5.6부터 View 생성시 ALGORITHM 값을 선택하여 query 실행 방식 결정 가능
```sql
CREATE
   [OR REPLACE]
   [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
   [DEFINER = {user | CURRENT_USER}]
   [SQL SECURITY { DEFINER | INVOKER }]
VIEW view_name [(column_list)]
AS select_statement
   [WITH [CASCADED | LOCAL] CHECK OPTION]
```
* ALGORITHM
   * UNDEFINED(defalut) - MySQL이 선택한 알고리즘 사용
   * MERGE - outer query와 View를 병합한 후, 데이터 추출
   * TEMPTABLE - outer query와 병합하지 않고 temporary table을 만들어 데이터 추출


#### Derived Table
* View 와는 다르게 쿼리 작성시 어떤 알고리즘을 사용할지 선택할 수 없다
   * 쿼리 단위로 알고리즘 선택 불가
* optimizer가 어떻게 동작할지 지정

```sql
-- 병합하여 처리
SET optimizer_switch='derived_merge=on'

-- 구체화하여 처리
SET optimizer_switch='derived_merge=off'
```
* `optimizer_switch derived_merge` 변수는 Derived Table과 UNDEFINED ALGORITHM으로 설정된 View에 적용된다



> #### 참고
> * [Derived Tables in MySQL 5.7](http://mysqlserverteam.com/derived-tables-in-mysql-5-7/)
> * [Derived Tables in MySQL 5.7 - 번역](http://mysqldba.tistory.com/274)
> * [MySQL Ver. 5.7에서 Derived Tables 동작 방식](http://mysqldba.tistory.com/275)
