# [Spring Data Jpa] Auditing
> date - 2018.07.31  
> keyword - spring data jpa, auditing  

<br>

* `AuditingEntityListener`를 사용해 생성일시, 수정일시, 생성자, 수정자에 대한 기록을 자동으로 남길 수 있다
* 상속을 통해 Entity에 대한 중복을 제거할 수 있다

* BaseEntity
```java
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedBy
    private User createdBy;

    @LastModifiedBy
    private User updatedBy;

    @CreatedDate
    @Column(name = "created_at", insertable = true, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", insertable = true, updatable = true)
    private LocalDateTime updatedAt;
}
```

* AuditorAware 구현
```java
// with spring security
public class UserAuditorAware implements AuditorAware<Optional<User>> {

    @Override
    public Optional<User> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.isAuthenticated() == false
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        return Optional.of((User) authentication.getPrincipal());
    }
}
```

* JpaAuditing 설정
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
