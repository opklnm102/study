# [MySQL] Check the MySQL database capacity
> MySQL에서 용량확인하는 법을 정리해보고자 함


## Database별 용량 확인
```sql
SELECT table_schema, sum((data_length+index_length) / 1024 / 1024) MB
FROM information_schema.tables
GROUP BY table_schema;
```


## 전체 용량 확인
```sql
SELECT sum(data_length + index_length) / 1024 / 1024 used_MB, sum(data_free) / 1024 / 1024 free_MB
FROM information_schema.tables;
```


## 특정 Database 용량 확인
```sql
SELECT table_schema,
       sum(data_length + index_length) / 1024 / 1024 MB
FROM information_schema.TABLES
WHERE table_schema = 'input Database Name'
GROUP BY table_schema;
```


## Table별 용량 확인
```sql
SELECT concat(table_schema, '.', table_name),
       concat(round(table_rows / 1000000, 2), 'M') rows,
       concat(round(data_length / (1024 * 1024 * 1024), 2), 'G') DATA,
       concat(round(index_length / (1024 * 1024 * 1024), 2), 'G') idx,
       concat(round((data_length + index_length) / (1024 * 1024 * 1024), 2), 'G') total_size,
       round(index_length / data_length, 2) idxfrac
FROM information_schema.TABLES; 
```


> #### 참고
> * [MySQL 데이터베이스 용량 확인](https://zetawiki.com/wiki/MySQL_%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4_%EC%9A%A9%EB%9F%89_%ED%99%95%EC%9D%B8)
