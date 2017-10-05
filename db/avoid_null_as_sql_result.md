# [RDB] Avoid null as SQL result
> sql의 결과로 null을 회피하는 방법을 정리해보고자 함

## COALESCE(value1, value2, ...)
* parameter 중 1번째로 non-null value를 리턴
* 모두 null이면 null을 리턴
* ANSI 표준
```sql
SELECT COALESCE(null, 3, 5); -- 3

SELECT COALESCE(null, null, 1);  -- 1

SELECT COALESCE(null, null, null); -- null
```


## IFNULL(value1, value2)
* 2개의 parameter 중 non-null value 리턴
* 모두 null이면 null 리턴
```sql
SELECT IFNULL(null, null); -- null

SELECT IFNULL(null, 1); -- 1

SELECT IFNULL(null, 1, 3); -- fail
```


> #### 참고자료
> * [MySQL COALESCE() function](https://www.w3resource.com/mysql/comparision-functions-and-operators/coalesce-function.php)
> * [COALESCE(Transact-SQL)](https://msdn.microsoft.com/ko-kr/library/ms190349(v=sql.120).aspx)
