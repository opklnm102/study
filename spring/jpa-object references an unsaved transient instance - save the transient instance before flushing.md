# [Spring Data Jpa] object references an unsaved transient instance - save the transient instance before flushing Error
> Spring Boot + Spring Data Jpa를 사용하던 도중 만난 Error라 정리하고자 함

## Exception stack trace
```java
org.springframework.dao.InvalidDataAccessApiUsageException: org.hibernate.TransientPropertyValueException: object references an unsaved transient instance - save the transient instance before flushing 
...
at org.hibernate.jpa.internal.QueryImpl.list(QueryImpl.java:606)
at org.hibernate.jpa.internal.QueryImpl.getSingleResult(QueryImpl.java:529)
... 65 more
```

## 문제
* flush 하지 않은 임시 인스턴스에 대해 참조가 일어나서 생김

## 해결법
1. flush하기 전에 저장하여 임시 인스턴스가 아니게 해준다
```java
xxxRepository.saveAndFlush(entity);
```

2. cascade 사용
```java
@Column(cascade = CascadeType.ALL) // or cascade = CascadeType.MERGE
EntityClass
```
