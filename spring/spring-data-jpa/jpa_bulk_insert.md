# [Spring Data Jpa] Bulk insert statement
> date - 2018.10.11  
> keyword - spring data jpa  
> spring data jpa에서 bulk insert를 하기 위해서 시도했던 내용을 정리

<br>

## Issue
```sql
INSERT INTO model(id, number) 
VALUES
(?, ?), (?, ?), (?, ?), (?, ?);
```
* 위와 같이 여러개의 entity를 save할 때 1번의 insert만 실행하고 싶었다


<br>

## Try
* [How to do bulk (multi row) inserts with JpaRepository?](https://stackoverflow.com/questions/50772230/how-to-do-bulk-multi-row-inserts-with-jparepository), [The best way to do batch processing with JPA and Hibernate](https://vladmihalcea.com/the-best-way-to-do-batch-processing-with-jpa-and-hibernate/), [Spring JPA Hibernate - JpaRepository Insert (Batch)](https://clarkdo.js.org/spring/jpa/java/2017/09/14/79/)를 보고 시도해봤지만...

* before
```
// before
Hibernate: insert into model2 (number, id) values (?, ?)
Hibernate: insert into model2 (number, id) values (?, ?)
...

// after
Hibernate: insert into model2 (number, id) values (?, ?)
Hibernate: insert into model2 (number, id) values (?, ?)
...
```

<br>

## Result
* 결국 성공하지 못하고 여기서 마무리...

<br>

* [How to do bulk (multi row) inserts with JpaRepository?](https://stackoverflow.com/questions/50772230/how-to-do-bulk-multi-row-inserts-with-jparepository)
* [The best way to do batch processing with JPA and Hibernate](https://vladmihalcea.com/the-best-way-to-do-batch-processing-with-jpa-and-hibernate/)
* [Spring JPA Hibernate - JpaRepository Insert (Batch)](https://clarkdo.js.org/spring/jpa/java/2017/09/14/79/)
