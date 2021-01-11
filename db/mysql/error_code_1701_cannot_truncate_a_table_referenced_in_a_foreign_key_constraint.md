# [MySQL] Error Code: 1701. Cannot truncate a table referenced in a foreign key constraint
> date - 2021.01.11  
> keyworkd - mysql, truncate, foreign key  
> data cleaning 작업이 필요해 truncate 중에 만난 MySQL Error에 대해 정리

<br>

## Requirement

### Dependency
```
MySQL 5.7
```


<br>

## Issue
* foreign key를 사용하던 table에 `TRUNCATE`를 하니 `Error Code: 1701. Cannot truncate a table referenced in a foreign key constraint...`가 발생
```sql
TRUNCATE TABLE xxx;

Error Code: 1701. Cannot truncate a table referenced in a foreign key constraint...
```


<br>

## Resolve
* 2가지 방법으로 진행할 수 있다

### 1. Remove foreign key constraint
1. foreign key constraint 제거
2. `TRUNCATE` 수행
3. foreign key references를 가진 row를 수동으로 제거
4. foreign key constraint 생성

<br>

### 2. FOREIGN_KEY_CHECKS 사용
```sql
SET FOREIGN_KEY_CHECKS = 0;  -- Disable foreign key checking
TRUNCATE TABLE xxx;
SET FOREIGN_KEY_CHECKS = 1;  -- Enable foreign key checking
```
* 위 방법은 foreign key constraint를 무시하고 insert시에도 사용할 수 있다


<br><br>

> #### Reference
> * [How to truncate a foreign key constrained table? - Stack overflow](https://stackoverflow.com/questions/5452760/how-to-truncate-a-foreign-key-constrained-table)
