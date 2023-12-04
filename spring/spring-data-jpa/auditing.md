# [Spring Data Jpa] Auditing
> date - 2018.07.31  
> keyword - spring data jpa, auditing  

<br>

* `AuditingEntityListener`를 사용해 생성일시, 수정일시, 생성자, 수정자에 대한 기록을 자동으로 남길 수 있다
* 상속을 통해 Entity에 대한 중복을 제거할 수 있다


<br>

## Auditing with Spring Security + LocalDateTime
### BaseEntity
```java
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class BaseEntity {

  @CreatedBy
  @Column(name = "created_by", updatable = false)
  private User createdBy;

  @LastModifiedBy
  @Column(name = "updated_by")
  private User updatedBy;

  @CreatedDate
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
```

### AuditorAware 구현
```java
// with spring security
public class UserAuditorAware implements AuditorAware<Optional<User>> {

  @Override
  public Optional<User> getCurrentAuditor() {
    return Optional.ofNullable(SecurityContextHolder.getContext())
                   .map(SecurityContext::getAuthentication)
                   .filter(Authentication::isAuthenticated)
                   .map(Authentication::getPrincipal)
                   .map(User.class::cast);
  }
}
```

### JpaAuditing 설정
```java
@EnableJpaAuditing(auditorAwareRef = "userAuditorAware")
@Configuration
public class JpaConfiguration {

  @Bean(name = "userAuditorAware")
  public AuditorAware userAuditorAware() {
    return new UserAuditorAware();
  }
}
```


<br>

## Auditing with ZonedDateTime
* @CreatedDate @LasteModifiedDate는 ZoneDateTim을 지원하지 않아 `Invalid date type class ...; Supported types are [java.util.Date, java.lang.Long, long]]...` error가 발생한다
  * [spring-data-jpa #1579](https://github.com/spring-projects/spring-data-jpa/issues/1579) 참고
* 아래의 두가지 방법 중 하나로 해결할 수 있다

### 1. @PrePersist, @PreUpdate 사용
* @CreatedBy, @LastModifiedBy를 사용하지 않고, @PrePersist, @PreUpdate에서 초기화한다
```java
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class BaseEntity {

  @Column(name = "created_by", updatable = false)
  private String createdBy;

  @Column(name = "updated_by")
  private String updatedBy;

  @CreatedDate
  @Column(name = "created_at", updatable = false)
  private ZonedDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private ZonedDateTime updatedAt;
  
  @PrePersist
  public void prePersist() {
  this.createdAt = ZonedDateTime.now();
  this.updatedAt = ZonedDateTime.now();
  }

  @PreUpdate
  public void preUpdate() {
  this.updatedAt = ZonedDateTime.now();
  }
}
```

### 2. dateTimeProvider 구현
* auditing mechanism에서 ZonedDateTime을 사용하도록 dateTimeProvider를 구현해준다
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    protected ZonedDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    protected String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    protected ZonedDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    protected String updatedBy;
}
```

* dateTimeProvider 구현 및 JpaAuditing 설정
```java
@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "zonedDateTimeProvider")
public class JpaConfiguration {

  @Bean
  public DateTimeProvider zonedDateTimeProvider() {
    return () -> Optional.of(ZonedDateTime.now());
  }
}
```


<br>

## Auditing request header
* request header의 값을 createdBy, updatedBy에 사용
```java
@Configuration
@EnableJpaAuditing(auditorAwareRef = "requestedByHeaderAuditorAware")
public class JpaConfiguration {

  @Bean
  public AuditorAware<String> requestedByHeaderAuditorAware() {
    return () -> {
      HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
      var requestedBy = request.getHeader("X-Requested-By");

      if (StringUtils.hasText(requestedBy)) {
        return Optional.of(requestedBy);
      }
      
      return Optional.of("system");
    };
  }
}
```


<br><br>

> #### Reference
> * [Auditing - Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/auditing.html)
> * [spring-data-jpa #1579](https://github.com/spring-projects/spring-data-jpa/issues/1579)
