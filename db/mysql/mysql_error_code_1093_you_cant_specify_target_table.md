# [MySQL] Error Code: 1093. You can't specify target table 'table name' for update in FROM clause
> MySQL Error Code 1093을 직면한 이유와 해결 과정을 정리


## 이슈
```sql
UPDATE account SET last_name = 'lee' 
WHERE id IN (
	SELECT id
	FROM account 
	WHERE id > 5
);
```
* 위 SQL 실행시 subquery에서 사용한 account table 때문에 `Error Code: 1093. You can't specify target table 'account' for update in FROM clause` 발생
* 동일한 table을 사용해서 update, delete를 할 수 없다


## 해결
* subquery에서 tetemporary table을 만들어 준다
```sql
UPDATE account SET last_name = 'lee' 
WHERE id IN (
    SELECT * FROM (
        SELECT id
	    FROM account 
	    WHERE id > 5) AS T1
);
```
> 2018.04.13 - 전에는 이렇게 해결했는데 지금은 왜 안돼지...


> #### 참고
> * [MySQL Error 1093 - Can't specify target table for update in FROM clause](http://stackoverflow.com/questions/45494/mysql-error-1093-cant-specify-target-table-for-update-in-from-clause)
