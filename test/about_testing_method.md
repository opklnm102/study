# [Test] About Testing method
> date - 2018.09.04  
> keyword - unit test, integration test  
> unit testing은 자주 사용되지만 다른 테스팅 기법들과 자주 혼동되기 때문에 찾아보던 중 [단위 테스팅과 통합, 승인, 기능 테스팅](https://justhackem.wordpress.com/2016/05/23/unit-integration-acceptance-and-functional-testing)를 읽고 정리

<br>

* 이런 코드가 있을 때
```java
public interface ProductRepository {
    void insert(Product product);
    void update(Product product);
}

// Business Layer
public class ProductService {
    private ProductRepository productRepository;

    public void insertProduct(Product product) {
        productRepository.insert(product);
    }

    public void updateProduct(Product product) {
        productRepository.update(product);
    }
}
```


<br>

## Unit Testing(단위 테스팅)
* `가능한 가장 작은 단위`의 코드를 test하는 기법
* OOP(object oriented programming)에서는 주로 `클래스나 메소드`가 test 대상
* 하나의 test 대상에 대해서 `세부적인 논리별로 각각 test case를 작성`
* 이상적으로 unit test case는 `test 대상이 아닌 코드의 결점에 독립적`
* test 대상이 의존하는 모듈은 `다른 test case에 의해 검증된 코드`, `신뢰할 수 있는 라이브러리`, `테스트 대역(test double)`을 사용
  * OOP에서 test double을 사용하기 위해서는 test 대상에 의존성 역전 원리(Dependency Inversion Principal)가 적용되야 한다
* test `범위가 작고 검증 대상이 세부적`이다
  * test case가 실패하면 전체 시스템 중 `어디에서 어떤 문제가 발생했는지 파악하기 쉽다`
  * test case로 동작하는 코드의 크기가 작기 때문에 매우 빠르다
* 피드백의 품질이 높고 빠르기 때문에 단위 테스팅을 장려
* `독립적으로 검증된 모듈이 조립되었을 때` 문제가 없다는 것을 보장하지 못한다
  * 다른 테스팅 기법의 도움을 받아야 한다

```java
// 실제 수행되는 코드가 아니므로 의미만 파악하자
@Mock
ProductRepository repository;

@Test
public void insertProduct() {
    // arrange
    ProductService sut = new ProductService(repository);
    Product product = new Product();

    // act
    sut.insertProduct(product);

    // assert
    verify(repository, times(1)).insert(product);
}
```
> sut - System Under Test

* ProductRepository에 의존하는 ProductService의 기능을 테스트하기 위해 DB서버에 연결되는 구현체를 사용할 경우
  * ProductService 코드에 결함이 없더라도 `네트워크 문제`, `누군가 DB 스키마를 변경`한 경우 단위 테스트는 실패
  * test 대상을 벗어난 시스템의 상태에 테스트 케이스 결과가 종속 -> test double을 사용
* mock은 test double의 유형 중 하나
  * test double로 로컬 DB에 연결된 Repository 인스턴스가 사용될 수 있다


<br>

## Integration Testing(통합 테스팅)
* `둘 이상의 시스템 구성요소가 통합`되었을 때 동작을 검증
* 충분히 단위 테스트된 시스템들이라도 `상호작용에 문제가 발생`할 수 있다
  * 어떤 추상 서비스에 의존하는 개체가 test double을 사용한 모든 단위 테스트는 통과했지만 구현체와 조립되었을 때 기대하지 않은 결과를 얻을 수 있다
  * 이런 오류들을 검출하는것이 목적
* 일반적으로 `unit testing과 functional testing` 사이에서 동작


<br>

## Acceptance Testing(승인 테스팅)
* SW가 `승인 기준을 만족하는지 검사`하는, 구현에 독립적인 `black box testing`
  * 입력에 대해 기대한 출력이 반환되는지, 충분한 성능이 제공되는지 등을 검사
* 이상적으로 acceptance test case는 사용자가 작성
  * 불가능한 경우, 사용자의 의견을 수렴해 비즈니스 분석가나 프로그래머가 대신
* acceptance testing은 운영 환경 또는 운영 환경과 유사한 환경에서 진행
* 내부 디자인이나 시스템 아키텍처 변경에 영향을 거의 받지 않는다
* 단위 테스팅, 통합 테스팅에서 검출하지 못하는 `시스템 수준이나 호스트 환경에서 발생하는 문제`를 검출
* acceptance test case가 실행되면 테스트 대상 기능과 관련된 모든 구성요소(코드, DB, 네트워크, 메시지 큐, OS, ..)가 동작
* 단위 테스팅에 비해 `소요시간이 길고, 실패한 경우 어느 위치에서 어떤 문제가 발생했는지 피드백`되지 않는다
* 승인 테스팅은 자동화가 필수적이지 않다. 경우에 따라 수동으로 수행


<br>

## Functional Testing
* Acceptance Testing과 유사하지만 자동화가 필수적으로 요구된다
* E2E(end-to-end) 테스팅이라고도 부른다

```java
// 실제 수행되는 코드가 아니므로 의미만 파악하자
public void updateProduct() {
    // arrange
    int id = 1;
    String name = "name";
    Product product = new Product(1, name);

    // act
    productService.insertProduct(product);

    // assert
    assertThat(productRepository.findOne(id).getName()).isEqualsTo(name);
    
    // cleanup
    productRepository.deleteAll();
}
```
* application이 배포된 환경에서 실행
* application이 제공하는 인터페이스를 통해 명령을 전달한 후 DB에 기대한 변경이 있었는지 검사
* 기능 테스트가 주는 피드백은 디버깅에 충분하지 않기 때문에 원인 조사 필요
  * 비즈니스 계층 혹은 DataAccess 계층의 버그, DB 연결 문자열 설정, 테이블 스키마, 방화벽 설정 등이 원인일 수 있다


<br>

## 테스팅 기법 선택
* 그럼 어떤 테스팅 기법을 선택해야 할까??
* [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)에서는 Testing Pyramid 모양의 `Unit Test:Integration Test:E2E Test를 7:2:1 비율`로 수행하길 제안

---

<br>

> #### 참고
> * [단위 테스팅과 통합, 승인, 기능 테스팅](https://justhackem.wordpress.com/2016/05/23/unit-integration-acceptance-and-functional-testing)
> * [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
