# [Spring Data Jpa] entity uses both @NotFound(action = NotFoundAction.IGNORE) and FetchType.LAZY issue
> date - 2023.07.23  
> keyworkd - jpa, hibernate  
> entity uses both @NotFound(action = NotFoundAction.IGNORE) and FetchType.LAZY. The NotFoundAction.IGNORE @ManyToOne and @OneToOne associations are always fetched eagerly에 대해 정리  

<br>

## Issue
* EntityNotFoundException이 발생하여 `@NotFound(action = NotFoundAction.IGNORE)`를 추가했는데 새로운 warning이 발생
```java
public class Post {
  ...
  @JoinColumn(name = "writer")
  @ManyToOne(fetch = FetchType.LAZY)
  @NotFound(action = NotFoundAction.IGNORE)
  private User writer;
}
```
```java
2023-07-23 13:30:42.582  WARN 55367 --- [main] org.hibernate.cfg.AnnotationBinder : HHH000491: The [writer] association in the [com.xx.Post] entity uses both @NotFound(action = NotFoundAction.IGNORE) and FetchType.LAZY. The NotFoundAction.IGNORE @ManyToOne and @OneToOne associations are always fetched eagerly.
```


<br>

## Why?
* EntityNotFoundException이가 발생하는 것은 Foreign Key는 가지고 있는데 실제 데이터가 없는 Integrity Fault 상황
* `@NotFound`는 끊어진 FK를 무시(NotFoundAction.IGNORE)할지 exception을 던질지(NotFoundAction.EXCEPTION, default) 정의
* FetchType.LAZY로 설정하더라도 entity를 참조하는 경우에만 entity를 초기화하도록 보장하기 위해서 FetchType.EAGER로 동작하기 때문에 **성능에 영향을 줄 수 있다**
* trad off를 고려하여 eager로 동작하도록 사용하거나 비즈니스 로직으로 옮겨야한다


<br>

## Resolve
* `@JoinColumn(foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))`로 FK 참조를 비활성화하여 EntityNotFoundException을 발생시키지 않고, 비즈니스 로직에서 예외처리를 한다
```java
public class Post {
  ...
  @JoinColumn(name = "writer", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
  @ManyToOne(fetch = FetchType.LAZY)
  private User writer;
}
```
* lazy loading 후 예외 처리
```java
if (post.getWriter() == null) {
  // 예외 처리
}
...
```

* [QueryDSL](http://querydsl.com), [JOOQ](https://www.jooq.org) 등을 사용해 비연관관계 join을 사용
```java
@Override
public Post findPost() {
  return query.from(post)
              .leftJoin(post.writer, user)
              .on(user.id.eq(post.writerId))
              .fetch();
}
```

<br><br>

> #### Reference
> * [Hibernate’s @NotFound Annotation – How to use it and a better alternative](https://thorben-janssen.com/hibernates-notfound)
