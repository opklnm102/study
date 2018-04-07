# [MySQL] Things to keep in mind when using GROUP BY
> group를 사용하던 중 만난 error code 1055에 대해 정리 

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

## 이유
* GROUP BY 사용시 SELECT 할 수 있는 column
   * GROUP BY에 사용된 column
   * SUM(), COUNT()와 같은 Aggregation Function
* SELECT 할 수 없는 column이 존재하여 sql_mode의 `ONLY_FULL_GROUP_BY` 때문에 잘못된 GROUP BY가 실행되지 않은 것
```sql
SELECT @@sql_mode;
-- SELECT @@GLOBAL.sql_mode;
-- SELECT @@SESSION.sql_mode;

-- result
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```

## 해결
* sql_mode의 `ONLY_FULL_GROUP_BY`을 제거한다
* SELECT에 aggregation function과 GROUP BY 대상 column만 사용한다


> #### 참고
> * [MySQL GROUP BY 사용 시 주의점](http://jason-heo.github.io/mysql/2014/03/05/char13-mysql-group-by-usage.html)
> * [MySQL 5.7 Reference Manual - 5.1.8 Server SQL Modes](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)
> * [한글매뉴얼 5.1 - 5.2.6. SQL 모드](http://www.mysqlkorea.com/sub.html?mcode=manual&scode=01_1&m_no=22283&cat1=752&cat2=790&cat3=868&lang=k)
