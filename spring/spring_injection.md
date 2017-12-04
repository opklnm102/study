# [Spring] fields, setter, constructor injection 
> 아무 생각없이 사용하고 있는 field injection을 권장하지 않는 이유에 좋은 글을 보고 정리해보고자함  


## Injection Types

### Constructor
```java
@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

### Setter(Method)
```java
@Service
public class ProductService {

    private ProductRepository productRepository;

    @Autowired
    public setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

### Fields
```java
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
}
```
* Constructor, Setter가 없어 작성하기도, 보기에도 편하고 간단하다


## fields injection이 과연 좋을까...?

### SRP(Single Responsibility Principle) Violation
* fields injection은 새로운 dependency를 추가하는데 너무 쉽다
   * 6, 10...늘어나도 추가하는데 쉽기 때문에 신경을 안쓸 수 있다
* Constructor를 사용하면 많은 인자를 가지기 때문에 무언가 잘못되었다는 것을 즉시 알게 된다
* 너무 많은 dependency를 가지게되면 SRP에 대해 생각해보자
   * refactoring이 필요하다는 지표


### Dependency Hiding
* DI를 사용하는 것은 class가 자신의 dependency managing에 대한 책임이 없음을 의미
* public interface(method, constructor)로 class를 명확하게 전달
   * constructor - 필수
   * setter - 선택


### DI Container Coupling
* DI Container에 의존하지 않아야 한다
   * 필수 dependency를 전달하면 인스턴스화할 수 있는 POJO여야 한다
   * 다른 DI Container로 전환하기 쉽다
* fields injection은 모든 dependency를 인스턴스화하는 직접적인 방법 제공 X
   * default constructor로 생성하면 필수 dependency가 없어 NPE 발생 유발
   * reflection을 제외하고는 dependency를 제공할 수 없다


### Immutability
* fields injection은 final fields에 할당할 수 없다


## 그래서.. Constructor Vs Setter

### Setter
* dependency를 선택적으로 injection할 경우 사용
* 인스턴스화 후에도 dependency 변경 가능
   * 때로는 immutable 객체가 바람직
   * 때로는 runtime에 변경하는 것이 바람직


### Constructor
* 필수 dependency 관리, immutable object에 좋다
* circular dependency 불가능


> #### 참고
* [Field Dependency Injection Considered Harmful](http://vojtechruzicka.com/field-dependency-injection-considered-harmful/)
