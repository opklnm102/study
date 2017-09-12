# [Spring Data Jpa] Modifying update query - Refresh persistence context
> Spring Data JPA의 @Modifying을 사용하여 메소드를 작성하며 찾은 내용에 대해 정리해보고자 한다

## Modifying queries
* Custom Repositoy를 만들어서 처리
* `@Modifying`을 사용하여 오직 파라미터 바인딩만 필요로 하는 update 쿼리를 실행
```java
@Modifying
@Query("UPDATE User u SET u.firstname = ?1 WHERE u.lastname = ?2")
int setFixedFirstnameFor(String firstname, String lastname);
```

### update 후 findXX()를 실행하면?
```java
// transaction1
long userId = 1L;

User user = new User(userId, "first", "last");
userRepository.save(user);

// transaction2 - 위와는 다른 트랜잭션이라고 가정
userRepository.setFixedFirstnameFor("modiFirst", "modiLast");

// update된 내용이 반영되지 않고 기존 데이터가 조회된다
User modiUser = userRepository.findOne(userId);  
assertEquals("modiFirst", modiUser.getFirstname());  // fail
assertEquals("modiLast", modiUser.getLastname());  // fail

assertEquals("first", modiUser.getFirstname());  // success
assertEquals("last", modiUser.getLastname());  // success
```
* update 쿼리를 실행한 후 `EntityManager에 flush되지 않은 데이터가 있을 수 있으므로` 자동으로 clear하지 않는다 - by. Spring Data JPA Document


## update 후 find()시 수정된 데이터를 가져오려면...?

### 1, `@Modifying(clearAutomatically = true)` 사용
```java
@Modifying(clearAutomatically = true)
@Query("UPDATE User u SET u.firstname = ?1 WHERE u.lastname = ?2")
int setFixedFirstnameFor(String firstname, String lastname);
```
* update 쿼리 후 변경 내역이 바로 적용되나, `flush되지 않은 데이터의 손실 가능성의 문제가 있다`
   * `repository.saveAndFlush()`로 변경이 생길 때마다 flush 해준다
      * 성능에 문제가 생길지도...

### 2. `entityManager.flush()` 사용
```java
public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {

}

public interface UserRepositoryCustom {
    int setFixedFirstnameFor(String firstname, String lastname);
}

public class UserRepositoryImpl implements UserRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    public int setFixedFirstnameFor(String firstname, String lastname){
        String jpql = "UPDATE User u SET u.firstname = ?1 WHERE u.lastname = ?2";

        Query query = em.createQuery(jpql);
        query.setParameter(1, firstname);
        query.setParameter(2, lastname);
        
        // update 전에 flush하고 clear
        em.flish();
        int result = query.executeUpdate();
        em.clear();
        return result;
    }
}
```
* update전에 `entityManager.flush()`로 DB에 대한 모든 변경사항을 flush한 뒤 persistence context를 지운다


> #### flush 시점
> * `@Transactional`로 시작된 transaction이 끝날 시점
> * `repository.saveAndFlush()`가 호출되었을 때
> * `entityManager.flush()`가 호출되었을 때


## 정리
* 그다지 나이스하지는 않지만 위 2가지 방법 중 골라서 사용...하거나 위의 방법을 혼합하여 @Modifying을 사용하고 `update 수행 전에 flush`하는 방식 사용
* [add flushAutomatically attribute to @Modifying annotation](https://jira.spring.io/browse/DATAJPA-806)에서 @Modifying에 `flushAutomatically` 속성을 추가하는 PR이 진행 중, merge된다면 저 속성으로 더 간단하게 할 수 있을 듯..! (작성일 2017.09.13)


> Entity가 persistence context에 로드되면 refresh되기 전까지는 findXX()시 로드된 데이터를 사용한다  
> update 쿼리는 persistence context의 entity가 아닌 DB만 업데이트  
> delete()는 persistence context를 갱신하므로 finㅍdXX()시 삭제된 entity는 반환되지 않는다


> #### 참고자료
> [Spring Data JPA - Reference Documentation Version 1.11.7.RELEASE](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
> [Spring Boot Data JPA - Modifying update query - Refresh persistence context](https://stackoverflow.com/questions/32258857/spring-boot-data-jpa-modifying-update-query-refresh-persistence-context)

