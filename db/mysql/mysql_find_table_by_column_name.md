# [MySQL] Find Table by column name
> MySQL에서 비슷한 column 이름을 가진 table을 찾으며 배운것을 정리


* column 이름이 정확히 같은 table 찾기
```sql
SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'column name';
```


* 비슷한 column 이름을 가진 table 찾기
```sql
SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%column name%';
```


* 특정 schema의 column 이름을 가진 table 찾기
```sql
SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%column name%'
AND TABLE_SCHEMA = 'schema name';
```



> #### 참고
> * [MySQL 컬럼명으로 테이블 찾기](https://zetawiki.com/wiki/MySQL_%EC%BB%AC%EB%9F%BC%EB%AA%85%EC%9C%BC%EB%A1%9C_%ED%85%8C%EC%9D%B4%EB%B8%94_%EC%B0%BE%EA%B8%B0)
