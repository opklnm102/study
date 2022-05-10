# [Spring Data Jpa] fetch join query
> date - 2018.07.31  
> keyword - spring data jpa, querydsl  
> QueryDSL에서 `leftJoin()` 등으로 join시 N+1 이슈를 피하기 위해 사용하는 fetch join시 SQL이 어떻게 달라지는지 정리


<br>

## Not fetch join
* target entity의 data만 조회한다

```java
...
from(Q_TARGET)
    .leftJoin(Q_TARGET.target, Q_REFERENCE)
    .where(Q_TARGET.createdAt.gt(LocalDateTime.now().minusDays(1))
    .fetch();
```
```sql
SELECT target.id 
       ...
FROM target
LEFT OUTER JOIN ref 
  ON target.ref_id = ref.id
WHERE target.created_at > ?
```


<br>

## fetch join
* `SELECT` 절에 연관 entity의 data도 함께 조회되는 것을 확인할 수 있다
```java
...
from(Q_TARGET)
    .leftJoin(Q_TARGET.target, Q_REFERENCE)
    .fetchJoin()
    .where(Q_TARGET.createdAt.gt(LocalDateTime.now().minusDays(1))
    .fetch();
```
```sql
SELECT target.id 
       ...
       ref.id
       ...
FROM target
LEFT OUTER JOIN ref 
  ON target.ref_id = ref.id
WHERE target.created_at > ?
```
