# [MySQL] Difference between DISTINCT and GROUP BY
> DISTINCT와 group by를 사용하던 중 어떤것을 사용할지 고민하다가 알아본 것을 정리

```sql
SELECT DISTINCT <field> FROM <table>

SELECT <field> FROM <table> GROUP BY <field>
```
* 결과만 보면 비슷한 DISTINCT, GROUP BY 무슨 차이가 있는지 알아보자


## DISTINCT
```sql
SELECT DISTINCT <field> FROM <table>

SELECT DISTINCT <field1>, <field2> FROM <table>
```
* 그룹핑
* 주로 `unique한 컬럼이나 튜플을 조회`하는 경우 사용
   * 내부적으로 GROUP BY와 같은 코드를 사용하여 grouping 한다고 한다 
* 결과를 `정렬해주지 않는다`
* sub query를 사용하지 않으면 GROUP BY로 작성하기 어려운 것에 DISTINCT 사용
```sql
SELECT COUNT(DISTINCT <field1>) FROM <table name>
```


### DISTINCT 사용시 주의할 점
* DISTINCT에 `()`를 사용하여 function과 같이 사용하기도 하는데. 과연 결과는...?

```sql
SELECT DISTINCT field1, field2 FROM <table name>

-- field1에만 DISTINCT가 적용되고, field2에는 적용하지 않는 것을 기대한 SQL
SELECT DISTINCT(field1), field2 FROM <table name>  
```

#### Test
* account table 

| id | first_name | last_name | age |
|:--|:--|:--|:--|
| 1 | mark | lee | 23 |
| 2 | mark | kim | 21 |
| 3 | ethan | kim | 27 |
| 4 | jack | lee | 25 |
| 5 | jack | kim | 25 |
| 6 | jack | choi | 26 |

```sql
SELECT DISTINCT first_name, age FROM account;
```
| first_name | age |
|:--|:--|
| mark | 23 |
| mark | 21 |
| ethan | 27 |
| jack | 25 |
| jack | 26 |

```sql
SELECT DISTINCT(first_name), age FROM account;
```
| first_name | age |
|:--|:--|
| mark | 23 |
| mark | 21 |
| ethan | 27 |
| jack | 25 |
| jack | 26 |

```sql
SELECT DISTINCT first_name FROM account;
```
| first_name |
|:--|
| mark |
| ethan |
| jack |

* 위의 test를 통해 `DISTINCT는 SELECT의 모든 column에 적용`된다는 것을 알 수 있다


#### DISTINCT 사용시 일부 값은 중복 제거, 일부는 전체 값을 원한다면...?
```sql
SELECT DISTINCT(<field1>), <field2> FROM <table name>
-- -> <field1>은 unique 값, <field2>는 전체값을 원한다면...?
```
* 불가능
   * DISTINCT가 있으면 `SELECT절의 모든 column에 DISTINCT가 적용`된다
* 일부 column만 처리하고 싶으면 GROUP BY로 처리
```sql
SELECT <field1> <field2> FROM GROUP BY <field1>
```


## GROUP BY
```sql
SELECT <field1> FROM <table name> GROUP BY <field1>;

SELECT <field1>, <field2> FROM <table name> GROUP BY <field1>, <field2>;

SELECT <field1>, MIN(<field2>), MAX(<field2>) FROM <table name> GROUP BY <field1>, <field2>;
```
* 그룹핑 + 정렬
   * 정렬을 위한 부가 작업을 더 한다
* 그룹핑해서 결과를 가져오는 경우 사용
* 집계 함수(aggregation)가 필요한 경우 사용


### GROUP BY에서 filesort 제거하는 법
* GROUP BY 사용시 filesort가 발생하는 경우, 결과에 정렬이 필요 없다면 아래의 SQL을 사용해 제거할 수 있다
```sql
SELECT <field1> FROM <table name> GROUP BY <field1> ORDER BY NULL;
```


## 정리
* index가 있는 column이라면 `DISTINCT`와 `GROUP BY`는 속도는 동일하다
* `DISTINCT`는 tmporary table를 만들어서 중복이 제거된 결과를 저장
* `GROUP BY`는 동일한 작업을 수행하지만 `정렬 작업을 추가`로 수행
* index가 없는 column에는 DISTINCT를 사용하자


> #### 참고
> * [DISTINCT 와 GROUP BY의 차이](http://intomysql.blogspot.kr/2011/01/distinct-group-by.html)
> * [What's faster, SELECT DISTINCT or GROUP BY in MySQL?](https://stackoverflow.com/a/595073)
