# [MySQL] Things to keep in mind when using GROUP BY
> GROUP BY를 사용하던 중 만난 error code 1055에 대해 정리 

<br>

## 이슈
* account table

| id | first_name | last_name | age |
|:--|:--|:--|:--|
| 1 | mark | lee | 23 |
| 2 | mark | kim | 21 |
| 3 | ethan | kim | 27 |
| 4 | jack | lee | 25 |
| 5 | jack | kim | 25 |
| 6 | jack | choi | 26 |

* 아래의 SQL 실행시 Error 발생
```sql
SELECT first_name, age FROM account
GROUP BY first_name;

-- error
Error Code: 1055. Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'TEST_PRODUCT.account.age' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by	0.00063 secss
```

<br>

## 이유
* GROUP BY 사용시 SELECT 할 수 있는 column
  * GROUP BY에 사용된 column
  * SUM(), COUNT()와 같은 Aggregation Function
* SELECT 할 수 없는 column이 존재하여 sql_mode의 `ONLY_FULL_GROUP_BY` 때문에 잘못된 GROUP BY가 실행되지 않은 것
  * `ONLY_FULL_GROUP_BY`는 GROUP BY에 ANSI SQL 규칙이 적용된다는 뜻
  * MySQL 5.7에서 `only_full_group_by가 default`로 설정된다
  * 오라클은 이런 SQL을 아에 사용할 수 없다
```sql
SELECT @@sql_mode;
-- SELECT @@GLOBAL.sql_mode;
-- SELECT @@SESSION.sql_mode;

-- result
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION

----------------------------------------------------
-- 또는 아래 커맨드로 조회
show global variables LIKE 'sql_mode';

-- result
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------+
| Variable_name | Value                                                                                                                                     |
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------+
| sql_mode      | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION |
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

<br>

## 해결
* sql_mode의 `ONLY_FULL_GROUP_BY`을 제거한다
  * session(connection) 재연결 필요
```sql
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY', ''));

-- or -> 기존 설정에서 ONLY_FULL_GROUP_BY를 제거한 설정으로 업데이트
SET GLOBAL sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
```
* SELECT에 aggregation function과 GROUP BY 대상 column만 사용한다
  * SUM(), MAX(), MIN()...
* `ANY_VALUE()` 사용
```sql
SELECT first_name, ANY_VALUE(age) FROM account
GROUP BY first_name;
```

> 가능하면 ONLY_FULL_GROUP_BY 모드로 SQL을 작성하는게 `더 예측 가능하고 고정된 결과`를 보여줄 것이므로, 추천

---

<br>

> #### 참고
> * [MySQL GROUP BY 사용 시 주의점](http://jason-heo.github.io/mysql/2014/03/05/char13-mysql-group-by-usage.html)
> * [MySQL 5.7 Reference Manual - 5.1.8 Server SQL Modes](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)
> * [한글매뉴얼 5.1 - 5.2.6. SQL 모드](http://www.mysqlkorea.com/sub.html?mcode=manual&scode=01_1&m_no=22283&cat1=752&cat2=790&cat3=868&lang=k)
> * [SELECT list is not in GROUP BY clause and contains nonaggregated column … incompatible with sql_mode=only_full_group_by](https://stackoverflow.com/a/46825159)
> * [Group by contains nonaggregated column](https://stackoverflow.com/a/40445903)
> * [MySQL 5.7 Reference Manual - 12.19.3 MySQL Handling of GROUP BY](https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html)
