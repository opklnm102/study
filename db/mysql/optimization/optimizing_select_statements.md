# [MySQL] Optimizing SQL Statements
> MySQL Reference에 있는 Optimizing SQL Statements를 정리  

* DB Application의 Core Logic은 interpreter를 통해 직접 발생 or API를 통한 SQL로 인해 수행
   * data R/W를 위한 SQL 작업
   * SQL 작업의 배경이 되는 overhead
   * monitoring 같은 특정 작업


## [Optimizing Select Statements](https://dev.mysql.com/doc/refman/5.7/en/select-optimization.html)


### [WHERE Clause Optimization](https://dev.mysql.com/doc/refman/5.7/en/where-optimization.html)


### [Range Optimization](https://dev.mysql.com/doc/refman/5.7/en/range-optimization.html)


### [Index Merge Optimization](https://dev.mysql.com/doc/refman/5.7/en/index-merge-optimization.html)


### [Engine Condition Pushdown Optimization](https://dev.mysql.com/doc/refman/5.7/en/condition-pushdown-optimization.html)


### [Index Condition Pushdown Optimization](https://dev.mysql.com/doc/refman/5.7/en/index-condition-pushdown-optimization.html)


### [Nested-Loop Join Algorithms](https://dev.mysql.com/doc/refman/5.7/en/nested-loop-joins.html)


### [Nested Join Optimization](https://dev.mysql.com/doc/refman/5.7/en/nested-join-optimization.html)


### [Left Join and Right Join Optimization](https://dev.mysql.com/doc/refman/5.7/en/left-join-optimization.html)


### [Outer Join Simplification](https://dev.mysql.com/doc/refman/5.7/en/outer-join-simplification.html)


### [Multi-Range Read Optimization](https://dev.mysql.com/doc/refman/5.7/en/mrr-optimization.html)


### [Block Nested-Loop and Batched Key Access Joins](https://dev.mysql.com/doc/refman/5.7/en/bnl-bka-optimization.html)


### [IS NULL Optimization](https://dev.mysql.com/doc/refman/5.7/en/is-null-optimization.html)


### [ORDER BY Optimization](https://dev.mysql.com/doc/refman/5.7/en/order-by-optimization.html)


### [GROUP BY Optimization](https://dev.mysql.com/doc/refman/5.7/en/group-by-optimization.html)


### [DISTINCT Optimization](https://dev.mysql.com/doc/refman/5.7/en/distinct-optimization.html)


### [DISTINCT Optimization](https://dev.mysql.com/doc/refman/5.7/en/distinct-optimization.html)

* 대부분의 경우 DISTINCT에 ORDER BY가 있으면 temporary table 필요
* DISTINCT는 GROUP BY를 사용할 수 있기 때문에 MySQL이 선택한 column의 일부가 아닌 ORDER BY 또는 HAVING 절의 column과 함께 작동하는 방법을 학습

```sql
-- 아래 2가지는 동등
SELECT DISTINCT c1, c2, c3 
FROM t1
WHERE c1 > const;

SELECT c1, c2, c3 
FROM t1
WHERE c1 > const 
GROUP BY c1, c2, c3;
```
* 대부분의 경우 DISTINCT는 GROUP BY의 특별한 경우로 생각할 수 있다
   * group by에 적용할 수 있는 최적화를 distinct에도 적용할 수 있다

* `LIMIT row_count` 와 `DISTINCT`를 같이 사용하면, row_count개의 고유한 row를 찾자마자 MySQL은 스캔을 중단한다
* query에 명명된 모든 테이블의 column을 사용하지 않으면 MySQL은 처음으로 일치하는 것을 발견하면 테이블 스캔을 중단한다

```sql
SELECT DISTINCT t1.a 
FROM t1, t2 
WHERE t1.a = t2.a;
```
* t1이 t2 이전에 사용된다고 할 때(explain으로 확인 가능) MySQL은 t2에서 1번째 행을 찾으면 t2에서 읽기를 중단한다


### [LIMIT Query Optimization](https://dev.mysql.com/doc/refman/5.7/en/limit-optimization.html)


### [Function Call Optimization](https://dev.mysql.com/doc/refman/5.7/en/function-optimization.html)


### [Row Constructor Expression Optimization](https://dev.mysql.com/doc/refman/5.7/en/row-constructor-optimization.html)


### [Avoiding Full Table Scans](https://dev.mysql.com/doc/refman/5.7/en/table-scan-avoidance.html)


## [Optimizing Subqueries, Derived Tables, and View References](https://dev.mysql.com/doc/refman/5.7/en/subquery-optimization.html)


### [Optimizing Subqueries, Derived Tables, and View References with Semi-Join Transformations](https://dev.mysql.com/doc/refman/5.7/en/semi-joins.html)


Todo: ing...
### []()




#### 참고
> * [MySQL 5.7 - Optimizing SELECT Statements](https://dev.mysql.comb/doc/refman/5.7/en/select-optimization.html)
