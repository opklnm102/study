# [TDD] Ch6. Unitils 단위 테스트 지원 라이브러리
> date - 2018.10.09  
> keyword - tdd  
> 테스트 주도 개발: 고품질 쾌속개발을 위한 TDD 실천번과 도구를 읽으며 공부했던 내용을 정리  
> 테스트 코드 작성시 어떤 어려움이 발생하는지 배울 수 있다

<br>

## 객체 동치성 비교
* `동치성과 동등성은 구분`해서 테스트해야 한다
* 동등성
  * 같은 객체인지 판단
* 동치성
  * 객체가 표현하고자 하는 상태가 같은지 판단
  * 같은 값을 가지고 있는지

```java
@Test
public void testBook() throw Exception {
  Book aBook = new Book("a Book", "a", 9000);
  Book otherBook = new Book("a Book", "a", 9000);

  assertEquals(aBook, otherBook);  // 서로 다르다고 판정
}

@Test
public void testBook() throw Exception {
  Book aBook = new Book("a Book", "a", 9000);
  Book otherBook = new Book("a Book", "a", 9000);

  assertEquals(aBook.getName(), otherBook.getName());  // 필드를 비교해야 한다
  assertEquals(aBook.getPrice(), otherBook.getPrice());
}
```
* 일일이 필드를 비교하면 필드가 많아지면 불편하다
* `Reflection Assertion`은 객체의 필드를 알아서 비교해준다

```java
@Test
public void testBook() throw Exception {
  Book aBook = new Book("a Book", "a", 9000);
  Book otherBook = new Book("a Book", "a", 9000);

  assertReflectionEquals(aBook, otherBook);
}
```

<br>

## Property Assertions
* 필드에 예상하는 값이 제대로 할당됐는지 getter로 확인
  * `getter가 없는 필드`를 비교할 경우
  * `테스트에서만 getter가 필요`한 경우

```java
public class Player {
  private String name;
  private int age;
  private int experienceYear;

  public int getAbilityPoint() {
    return (30 - age) + experienceYear;
  }
}

@Test
public void test() throw Exception {
  Player player = new Player("player a", 31, 15);
    
  assertPropertyLenienEquals("age", 31, player);  // reflection으로 내부의 필드값을 비교해 준다
}
```
* private field는 reflection으로도 가능
```java
Field contactNumberField = person.getClass().getDeclaredField("contactNumber");
contactNumberField.setAccessible(true);

long contactNumber = contactNumberField.getLong(person);
Assertions.assertEquals(123456789L, contactNumber);
```

<br>

## 트랜잭션 처리
* 업무 로직상 `트랜잭션 기능 자체`를 테스트해야 하는 경우
* 테스트시 변경된 데이터가 종료 후에 롤백하는 경우
* `SELECT FOR UPDATE`처럼 트랜잭션처리를 해야 제대로 동작하는 기능을 사용할 경우
* immediate auto-commit으로 운영하기 어려운 제품을 사용하는 경우
  * hibernate, JPA

```java
@Runwith(SpringRunner.class)
@Transactional(TransactionMode.ROLLBACK)  // 이런거
public class ProductRepositoryTest {
    ...
}
```
> 요즘은 spring starter test에서 지원해주는 듯?

<br>

## DBMaintainer: DB를 자동으로 유지보수해주는 DB 유지보수 관리자
* DB 스키마를 SQL Script를 이용해 자동으로 유지시켜 주는 기능
  * 프로젝트 내에 폴더를 만들어 SQL Script 저장
  * 숫자형식의 version number를 `_`로 구분하여 네이밍
    * 001_DROP_ALL_TABLES.sql, 002_CREATE_TABLES.sql
  * Unitils의 DataSource를 이용하는 테스트 클래스 실행
  * DBMaintainer는 지정된 Script 폴더를 모니터링해서 변경된 내용이 있으면 반영
* DB 구조를 SQL Script로 관리하고, 추가 내용을 덧붙여 반영하도록 만들 때 매우 유용
  * 새로운 Script 추가면 추가된 부분만 실행
  * 기존 Script 변경이면 스키마 전체를 리셋하고, 처음부터 실행

> [81. Database Initialization - Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/howto-database-initialization.html)
를 보면 요즘엔 이런 기능을 하는 tool로 [Flyway](https://flywaydb.org/), [Liquibase](http://www.liquibase.org/)를 사용하는듯

---

<br>

> #### Reference
> * [6장 - Unitils 단위 테스트 지원 라이브러리](https://repo.yona.io/doortts/blog/issue/6)
