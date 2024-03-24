# [Test] private method testing
> date - 2018.09.05  
> keyword - unit test, private method test  
> 예전에 private method를 테스트하기 위해 public으로 바꾸거나, power mock을 사용해서 테스트한 경험이 있었는데. [비공개 메서드를 테스트 해야하는가?](https://justhackem.wordpress.com/2017/09/29/should-private-methods-be-tested/)를 읽고 정리해보자함


<br>

## PowerMock으로 private method를 테스트하는 법
* gradle dependency 추가
```groovy
testCompile group: 'junit', name: 'junit', version: '4.12'
testCompile group: 'org.powermock', name: 'powermock-api-mockito2', version: '1.7.4'
testCompile group: 'org.powermock', name: 'powermock-module-junit4', version: '1.7.4'    
```

* sample code
```java
public class Product {
    
  private String name;
    
  public Product(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }
}

public class ProductService {
    
  private Product generateProduct(String name) {
    return new Product(name);
  }
}

@RunWith(PowerMockRunner.class)
public class PrivateTest {

  private ProductService sut;
    
  @Before
  public void setUp() throws Exception {
    sut = new ProductService();
  }

  @Test
  public void test() throws Exception {
    // given
    String productName = "name1";

    // when
    ProductService.Product product = Whitebox.invokeMethod(sut, "generateProduct", productName);

    // then
    assertThat(product.getName()).isEqualTo(productName);
  }
}
```
* 간단한 예제이지만 문제점이 존재한다
  * 내부 구현인 generateProduct()이 변경되면 test case도 변경되어야 한다
  * OOP의 은닉화 개념에 위배된다


<br>

## @VisibleForTesting 사용
* private -> package로 변경하고 문서화를 위해 [guava](https://github.com/google/guava)의 `@VisibleForTesting`를 붙여준다
* `@VisibleForTesting`은 test code에서만 사용하라는 의미를 표현하기 위한 문서화 용도일 뿐 강제성은 없으므로 public, protected에서는 사용하지 않아야한다
```java
// gradle dependency 추가
dependencies {
  // Pick one:
  // 1. Use Guava in your implementation only:
  implementation("com.google.guava:guava:33.1.0-jre")

  // 2. Use Guava types in your public API:
  api("com.google.guava:guava:33.1.0-jre")
}
```

```java
public class ProductService {

  @VisibleForTesting
  Product generateProduct(String name) {
    return new Product(name);
  }
}
```



<br>

## 그래서... private method도 테스트해야하는가...?
* private method의 interface는 테스트 하지 않지만 `구현은 테스트 대상`이다

### private method를 만드는 목적은?

#### TDD에서 반복되는 Red-Green-Refactor 과정
1. 구현하고자 하는 아주 작은 기능 하나를 정의 또는 선택한 후 기능을 검증하는 test case를 작성하고 작성된 test case가 대상 기능이 구현되지 않은 이유로 실패하는지 확인
2. 전단계에서 작성된 test case를 비롯해 `모든 test case가 성공`하도록, 그리고 `성공할 만큼`만 기능 코드를 작성
3. 모든 test case가 성공하는 것을 확인하며 `refactoring`

#### OOP는 interface를 노출하고 구현을 숨긴다 -> 은닉화
* test case는 interface(public 멤버)에 의존적이며, 구현에 독립적
  * public 멤버를 통해서만 동작하며, 내부 구현과는 직접 연결되지 않는다
* Green 단계에서 프로그래머는 오로지 모든 test case를 성공시키는 목적으로만 코드를 작성
  * 설계는 고려 대상이 아니다
* 이후 Refactor 단계에서는 test case 코드와 결과에 영향을 주지 않는 범위 내에서 `구현을 다시 설계`
  * 재설계 목적은 `코드 품질을 높이는 것`
  * 가독성을 높이고, 코드의 의도를 명확히 들어내고, 중복 코드를 제거하고, 코드 덩어리를 적당한 크기로 분배
  * test case가 있기 때문에 과감하게 진행 가능
* 따라서 private method에 담긴 코드는 이미 `test case를 통해 완전히 검증된 후 재배치 된 것`
  * test case가 private method의 interface에 대해 전혀 알지 못함에도 불구하고
* test case가 공개 interface에만 의존하기 때문에 내부 구현은 숨겨지고 언제든 더 나은 구조로 변경될 수 있다

#### private method가 구현되는 시나리오
1. public method를 구현
2. 코드 품질을 높이기 위해 refactoring(가독성을 높이고, 의도를 명확히하고, 중복 코드를 제거하고, 적당한 크기로 분해)을 하는 과정에서 private method가 추출된다
3. private method는 OOP에 따라 감추어졌고, public method의 일부로 test된다


<br>

## Conclusion
* private method는 interface에 기반하여 private method에 독립적으로 테스트 하자
* private method는 refactoring 과정에서 생기는 내부 구현이기 때문
  * 기능이 돌아갈 정도만 구현해서 쭈욱 작성하고, refactoring하면서 설계를 가다듬어 가자


<br><br>

> #### Reference
> * [비공개 메서드를 테스트 해야하는가?](https://justhackem.wordpress.com/2017/09/29/should-private-methods-be-tested/)
> * [powermock - GitHub](https://github.com/powermock/powermock)
