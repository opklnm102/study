# [MySQL] Select Insert
> select insert절에 대해 알아본걸 정리


## Select Insert란?
```sql
INSERT INTO <target table name> 
SELECT <column> FROM <source table name>
```
* select으로 가져온걸 insert


### select한 내용 전체 insert
* table schema가 동일할 때 사용
```sql
INSERT INTO <target table name>
SELECT * FROM <source table name>
WHERE <condition>
```

### 원하는 column select insert
* table schema가 다를 때 사용
* 일부 column만 필요할 때 사용
```sql
INSERT INTO <target table name> (column1, column2, ...)
SELECT <column1>, <column2>, ... FROM <source table name>
WHERE <condition>

-- example
INSERT INTO TEST.product (name, price, created_at, register)
SELECT T2.name, T2.price, now(), 'ethan' FROM TEST2.product AS T2
WHERE T2.product_id > 4;
```


#### 참고
* [Select 한 내용 Insert 시키는 방법](http://blog.freezner.com/archives/477)
