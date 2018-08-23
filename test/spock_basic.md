# [Test] spock로 test case 작성하기
> date - 2018.08.23  
> keyword - spock, TDD, BDD  
> spring boot에서 spock framework로 간단한 unit test를 작성했던 과정을 정리

<br>

## Spock Framework란?
* Java 및 Groovy Application을 위한 developer testing and specification framework
* [Groovy](http://groovy-lang.org) 문법 사용
* 아름답고 표현력이 풍부한 specification language
* JUnit runner 덕분에 대부분의 IDE, build tools, CI server와 호환
* JUnit, jMock, RSpec, Groovy, Scala, Vulcans 등에서 영감을 받았다고 함
* BDD(Behaviour-Driven Development) 기반
  * `기대하는 동작과 테스트의 의도를 더 명확`하게 드러난다

<br>

## Specification
```groovy
class MyFirstSpecification extends Specification {
    // fields
    // fixture methods
    // feature methods
    // helper methods
}
```

### fields
```groovy
def obj = new ClassUnderSpecification()
def coll = new Collaborator()
```
* 인스턴스 필드는 specification의 fixture에 속한 객체를 저장할 수 있는 좋은 장소
* 선언 시점에 초기화하는 것이 좋다
  * `setup()`에서 초기화하는 것과 같다
* 인스턴스 필드에 저장된 객체는 feature method간에 공유되지 않는다
  * feature method마다 자체 객체를 가져온다
  * feature마다 격리된 상태

```groovy
@Shared res = new VeryExpensiveResource()
```
* feature method간 공유해야할 때 사용
* 객체 생성에 비용이 많이 들거나 feature method간 상호작용이 필요할 경우
* 선언 시점에 초기화하는게 좋다
  * `setupSpec()`에서 초기화하는 것과 같다

```groovy
static final PI = 3.141592654
```
* 정적 필드는 상수에만 사용
* 상수가 아니라면 공유에 대한 의미이미로 `@Shared`를 사용


### feature method
```groovy
def "pushing an element on the stack" () {
    // blocks go here
}
```
* specification의 핵심
* system under specification에서 찾을것으로 예상되는 기능(속성, 측면)을 설명
* String literal을 사용해 명명


### feature method는 4단계로 구성
* feature의 fixture setup
  * optional
* system under specification에 자극 제공
  * required - 2번 이상 발생 가능
* 시스템의 예상 응답 기술
  * required - 2번 이상 발생 가능
* feature의 fixture clean up
  * optional

<br>

## block

![spock block](https://github.com/opklnm102/study/blob/master/test/images/spock_blocks.png)

* `given`, `when`, `then`과 같은 코드 블록
* block은 feature method 내 최소 1개 필수
* given or setup
  * test에 필요한 환경을 설정하는 작업
  * 항상 다른 블록보다 상위에 위치해야 한다
* when
  * simulus
  * test target을 실행
* then
  * response
  * 결과 검증, 예외 및 조건에 대한 결과 확인
  * 작성한 코드 1줄이 assert문
* expect
  * when + then
  * test할 코드 실행 및 검증
* where
  * 다양한 case에 대해 검증시 사용
  * feature method를 파라미터 삼아 실행시킨다
  * 실패한 모든 테스트 케이스를 알려준다

## spock vs JUnit

| Spock | JUnit |
|:------|:------|
| Specification | Test class |
| setup() | @Before |
| cleanup()| @After |
| setupSpec() | @BeforeClass |
| cleanupSpec() | @AfterClass |
| Feature | Test |
| Feature method | Test method |
| Data-driven feature | Theory |
| Condition | Assertion |
| Exception condition | @Test(expected=..) |
| Interaction | Mock expectation(e.g. in Mockito) |


## example
* 소수점 버림 계산기에 대해 TC 작성해보기
```java
public class Calculator {

    public static long calculate(long amount, float rate, RoundingMode roundingMode) {
        if (amount < 0) {
            throw new NegativeNumberNotAllowException();
        }

        return BigDecimal.valueOf(amount * rate * 0.01)
                .setScale(0, roundingMode).longValue();
    }
}
```

### Dependency 추가
```gradle
testCompile('org.spockframework:spock-core:1.1-groovy-2.4')
testCompile('org.spockframework:spock-spring:1.1-groovy-2.4')
```

### basic feature method 작성해보기
```groovy
class CalculatorTest extends Specification {

    RoundingMode roundingMode

    // 1. feature의 fixture setup
    def setup() {
        roundingMode = RoundingMode.DOWN
    }

    def "금액의 퍼센트 계산 결과값의 소수점을 버림을 검증한다"() {
        // 1. feature의 fixture setup
        given:
        def amount = 10000L
        def rate = 0.1f

        // 2. system under specification에 자극 제공
        when:
        def calculate = Calculator.calculate(amount, rate, roundingMode)

        // 3. 시스템의 예상 응답 기술
        then:
        calculate == 10L
    }

    // 4. feature의 fixture clean up
    def cleanup() {
        roundingMode = null
    }
}
```

### where 사용하기
* JUnit 기반
```java
@Test
public void 금액의_퍼센트_계산_결과값의_소수점_버림을_검증한다() throws Exception {
    // given
    RoundingMode roundingMode = RoundingMode.DOWN;

    // when, then
    long result1 =  Calculator.calculate(10000L, 0.1f, roundingMode);
    assertThat(result1, is(10L));

    long result2 =  Calculator.calculate(2799L, 0.2f, roundingMode);
    assertThat(result1, is(5L));
}
```

* `where`로 간단하게 표현 가능..!
```groovy
def "여러 금액의 퍼센트 계산 결과값의 소수점 버림을 검증한다"() {
    given:
    RoundingMode roundingMode = RoundingMode.DOWN

    expect:
    Calculator.calculate(amount, rate, roundingMode) == result

    where:
    amount | rate  | result
    10000L | 0.1f  | 10L
    2799L  | 0.2f  | 5L
    159L   | 0.15f | 0L
    2299L  | 0.15f | 3L
}
```

### 예외 검증하기
* `thrown()`
* 작성한 흐름에 따라 예외를 확인할 수 있다
```groovy
def "음수가 들어오면 예외가 발생하는지 알아보자"() {
    given:
    RoundingMode roundingMode = RoundingMode.DOWN

    when:
    Calculator.calculate(-10000L, 0.1f, roundingMode)

    then:
    def e = thrown(NegativeNumberNotAllowException.class)
    e.message == "음수는 계산할 수 없습니다"
}
```

### Mock
* Mock 생성 2가지 방법
  * def mock = Mock(Calculator)
  * Calculator mockCalculator = Mock()
* value mocking
  * `mocking >> return value`
* exception mocking
  * `mocking >> { throw new NegativeNumberNotAllowException() }`

```java
// java
@Getter
@NoArgsConstructor
public class OrderSheet {
    public static final OrderSheet EMPTY = new OrderSheet();

    private String orderType;

    private long totalOrderAmount;

    @Builder
    public OrderSheet(String orderType, long totalOrderAmount) {
        this.orderType = orderType;
        this.totalOrderAmount = totalOrderAmount;
    }
}
```

```groovy
def "주문금액의 소수점 버림을 검증한다"() {
    given:
    RoundingMode roundingMode = RoundingMode.DOWN
    def orderSheet = Mock(OrderSheet.class)

    when:
    long amount = orderSheet.getTotalOrderAmount()

    then:
    orderSheet.getTotalOrderAmount() >> 10000L
    10L == Calculator.calculate(amount, 0.1f, roundingMode)
}
```

#### 횟수 검증하기
```groovy
def "complex order는 조회가 2번된다"() {
    given:
    def mockOrderRepository = Mock(OrderRepository)
    OrderService orderService = new OrderService(mockOrderRepository)
    OrderSheet orderSheet = OrderSheet.builder()
            .orderType("COMPLEX")
            .totalOrderAmount(100L)
            .build()
    long id = 1L

    when:
    orderService.order(id, orderSheet)

    then:
    2 * mockOrderRepository.findOne(id)  // 2번
    (2.._) * mockOrderRepository.findOne()  // 최소 2번
    (_..2) * mockOrderRepository.findOne()  // 최대 2번
    2 * mockOrderRepository.findOne(_)  // any parameter
}
```


### Unroll
* 메소드 이름에 지정된 템플릿에 따라 테스트 결과를 보여준다
```groovy
def "금액이 주어지면 원단위 반올림 결과가 반환된다 [금액: #amount, 결과: #result]"() {
    given:
    def feeCalculator = FeeCalculateType.WON_UNIT_CUT

    expect:
    feeCalculator.calculate(amount) == result

    where:
    amount | result
    500L   | 500L
    495L   | 490L
}
```

* result
```
// before
me.dong.spocksample.FeeCalculateTypeTest
   FeeCalculateTypeTest.금액이 주어지면 원단위 반올림 결과가 반환된다 [금액: #amount, 결과: #result]

// after
me.dong.spocksample.FeeCalculateTypeTest
   FeeCalculateTypeTest.금액이 주어지면 원단위 반올림 결과가 반환된다 [금액: 500, 결과: 50]
   FeeCalculateTypeTest.금액이 주어지면 원단위 반올림 결과가 반환된다 [금액: 495, 결과: 490]
```



<br>

## 정리
* spock를 사용해 많은 불편이 해소된다
* 테스트 코드의 의도와 내용을 쉽게 파악할 수 있게 테스트를 작성하는게 중요
  * 빡빡한 일정사이에 어렵게 테스트를 작성했는데 나중에 봤을 때 이해하기 어려우면 슬프지아니한가...

---

<br>

> #### Reference
> * [Spock Framework - Github](https://github.com/spockframework/spock/)
> * [spockframework example project - Github](https://github.com/spockframework/spock-example)
> * [Spock 소개 및 튜토리얼](http://jojoldu.tistory.com/228)
