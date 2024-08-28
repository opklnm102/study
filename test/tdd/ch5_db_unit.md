# [TDD] Ch5. 데이터베이스 테스트: DbUnit
> date - 2018.10.03  
> keyword - tdd  
> 테스트 주도 개발: 고품질 쾌속개발을 위한 TDD 실천번과 도구를 읽으며 공부했던 내용을 정리  
> DB와 연동되는 TDD에 대한 내용 요약  

<br>

* DB를 사용하는 부분은 프로그래밍 언어 외적인 부분이 상당 부분 포함되기 때문에 TDD를 적용하기 쉽지 않다
* DB의 상태를 일정하게 유지하면서 테스트, 테스트 전후 DB 상태 비교하는게 쉽지 않기 때문

<br>

## [DbUnit](http://www.dbunit.org/)
* 독립적인 DB 연결 지원
  * JDBC, DataSource, JNDI
* DB의 특정 시점 상태를 쉽게 import/export  가능
  * xml, csv, xls(only import)
* Table이나 DataSet을 서로 쉽게 비교할 수 있다
* JUnit과 같은 Test Framework와 함께 사용

<br>

## DataSet
* DB, Table의 전부 혹은 일부를 xml, csv 파일로 나타낸 모습

* 판매자 테이블

| id | name | email |
|:--|:--|:--|
| kim | 김 | aa@ex.com |
| lee | 이 | bb@ex.com |
| min | 민 | cc@ex.com |

* DbUnit의 `FlatXmlDataSet`으로 표현
```xml
<!-- seller.xml -->
<?xml version='1.0' encoding='UTF-8'>
<dataset>
  <seller id="kim" name="김" email="aa@ex.com"/>
  <seller id="lee" name="이" email="bb@ex.com"/>
  <seller id="min" name="민" email="cc@ex.com"/>
</dataset>
```

DB가 아닌 파일이나 다른 매체에 저장될 수도 있겠다..!
인터페이스 구현
```java
public interface Repository {
  public Seller findById(String id);
  public void add(Seller seller);
  public void update(Seller seller);
  public void remove(Seller seller);
}
```

Test용 DB의 상태가 한결같이 유지되면 좋겠다
    테스트 관련 테이블 초기화 -> 테스트 케이스 실행

```java
@Before
public void setUp() throws Exception {
  // dataset 초기화
}

@Test
public void findById() throws Exception {
  Seller newSeller = new Seller("aaa", "kim", "kim@ex.com");
}
```
* CRUD 구현시 우선 조회 기능을 제일먼저 구현하고, 추가/수정/삭제는 조회 기능을 활용해 검증하도록 작성
* 조회 기능에 오류가 있거나 수정해야할 때 다른 테스트 케이스까지 깨지는 경우가 발생
* 하나의 테스트 케이스는 다른 부분에서 영향받는 부분이 최소화되어 있어야 한다
```java
// before - 추가 기능이 조회 기능에 의존
@Test
public void addNewSeller() throws Exception {
  // given
  Seller newSeller = new Seller("aaa", "kim", "kim@ex.com");
  Repository repository = new DatabaseRepository();

  // when
  repository.add(newSeller);

  // then
  Seller sellerFromRepository = repository.findById("aaa");
  assertEquals(newSeller.getId(), sellerFromRepository.getId());
}

// after - 조회 기능 의존성 제거
@Test
public void addNewSeller() throws Exception {
  // given
  Seller newSeller = new Seller("aaa", "kim", "kim@ex.com");
  Repository repository = new DatabaseRepository();

  // when
  repository.add(newSeller);

  // then
  IDataSet currentDBdataSet = databaseTester.getConnection().createDataSet();
  ITable actualTable = currentDBdataSet.getTable("seller");
  IDataSet expectedDataSet = new FlatXmlDataSetBuilder().build(new File("expected_seller.xml"));
  ITable expectedTable = expectedDataSet.getTable("seller");

  assertEquals(expectedTable, actualTable);
}
```

## DbUnit 데이터셋의 종류
생략

<br>

## DbUnit의 DB 지원 기능
생략

<br>

## DbUnit 권장 사용법
* 개발자마다 DB 인스턴스/스키마를 하나씩 사용할 수 있게 하자
* tearDown할 필요 없도록 setUp 처리를 잘하자
* DataSet은 작은 크기로 여러개 생성
  * 필요한 테스트 데이터 위주로만
  * 너무 많이 만들면 유지보수가 힘들다
  * 테스트 클래스 기반으로 생성, 다른 테스트 클래스와 공유 X
* Test용 DB에서는 foreign key, not null constraint를 꺼놓으면 편리


<br>

## [Database Rider](https://github.com/database-rider/database-rider)
* DbUnit을 JUnit test에 더 쉽게 사용할 수 있는 project
* yaml로 DataSet을 표현할 수 있어서 직관적이다

### Jooq + DbRider로 test case 작성
```java
import static com.example.Tables.STUDENT;

@JooqTest
@DBRider
@DataSet(value = {"/datasets/com/example/DbRiderTest.yaml"}, cleanBefore = true, cleanAfter = true)
public class DbRiderTest {

  @Autowired
  private DSLContext dslContext;

  @Test
  void test() {
    // given
    var id = 1L;

    // when
    var result = dslContext.selectFrom(STUDENT)
                .where(STUDENT.ID.eq(id))
                .fetchOne();

    // then
    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(1);
    assertThat(result.getName()).isEqualTo("mike");
    assertThat(result.getEmail()).isEqualTo("mike@example.com");
  }
}
```
```sql
CREATE TABLE IF NOT EXISTS stduent
(
  id               bigint          NOT NULL AUTO_INCREMENT,
  name             varchar(128)    NOT NULL,
  email            varchar(256)    NOT NULL,
  created_at       datetime        NOT NULL,
  updated_at       datetime        NOT NULL
  PRIMARY KEY (id)
);
```

```yaml
stduent:
  - id: 1
    name: mike
    email: mike@example.com
    created_at: 2024-09-01 00:00:00 +0900
    updated_at: 2024-09-01 00:00:00 +0900
  - id: 2
    name: jason
    email: jaons@example.com
    created_at: 2024-09-01 00:00:00 +0900
    updated_at: 2024-09-01 00:00:00 +0900
```


<br>

## 정리
* DataSet을 만드는 일은 비용이 많이 드는 작업이며, 때때로 ROI가 맞지 않는다
* DB를 사용할 때 DbUnit을 `반드시 써야하는지 고민`해볼 필요가 있다
  * 단순히 SQL Script를 테스트 전후로 실행하는 편이 더 나을 수도 있다

> Spring Boot에서는 SQL Script를 전후에 실행하는 방식 사용

---

<br>

> #### Reference
> * [5장 -  DbUnit](https://repo.yona.io/doortts/blog/issue/5)
> * [Database Rider](https://github.com/database-rider/database-rider)
