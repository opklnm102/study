# Ch2. Creating and Destorying Objects(객체의 생성과 소멸)
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 언제 어떻게 생성해야 하는지, 언제 어떻게 생성을 피해야 하는지 등...


## 규칙 1. Consider static factory methods instead of constrictors(생성자 대신 factory 메소드 사용을 고려하라)

### 생성자를 제공하기 전에 인스턴스 하나를 생성하여 반환하는 public static factory 메소드의 사용을 고려
```java
public static Boolean valueOf(boolean b) {
    return b ? Boolean.TRUE : Boolean.FALSE;
}
```
* Design Patterns에 나오는 `Factory 메소드 패턴과는 다르다`
* 생성자를 대신하거나, 생성자와 static factory 메소드를 같이 사용

### public 생성자 대신 static factory 메소드를 제공할 때 장단점

#### 장점 1. 생성자와 달리 자기 나름의 이름을 가질 수 있다

* 생성자에 전달하는 parameter가 반환 객체를 잘 나타내지 못한다면, 이름을 잘 지은 static factory 메소드가 더 사용하기 쉽고, 이해하기 쉽다
   * ex. `BigInteger(int, int, Random)` -> `BigInteger.probablePrime()`

* Java 클래스는 동일한 시그니처를 갖는 생성자를 하나만 가질 수 있다
   * 타입이 다른 parameter의 순서만 바꾸어 2개의 생성자로 만들어 회피
      * 필요한 생성자를 찾기 어려움
   * static factory 메소드는 자신의 이름을 가질 수 있으므로, 위의 제약에 자유롭다

* 하나의 클래스에 동일한 시그니처를 갖는 여러개의 생성자가 필요한 경우 생성자 대신 static factory 메소드를 사용하되, 메소드 간의 `차이점을 부각시키도록 이름 선정`


#### 장점 2. 생성자와 달리 호출할 때마다 매번 새로운 객체를 생성할 필요가 없다
* immutable 클래스의 경우 이미 생성된 객체를 저장했다가 다시 사용
   * 불필요하게 중복된 인스턴스들이 생성되는 것을 방지
   * ex. `Boolean.valueOf(boolean)`
      * 객체 생성 안함
* 객체 생성시 리소스나 시간이 많이 든다면 `성능 향상` 도움
* static factory 메소드는 여러번 호출되더라도 이미 생성된 동일 객체를 반환
   * 언제든지 인스턴스를 직접 제어할 수 있다
      
> #### 인스턴스 제어(instance-controlled) 클래스를 만드는 이유
> 1. 인스턴스를 제어하면 singleton 또는 noninstantiable(인스턴스 생성 불가) 클래스로 만들 수 있다
> 2. immutable 클래스에서 동일한 인스턴스가 생기지 않도록 해준다

#### 장점 3. 자신이 반환하는 타입의 어떤 subtype 객체도 반환할 수 있다
* 반환되는 객체의 클래스를 선택해야 할 때 `유연성 제공`
* public이 아닌 클래스의 객체를 생성하고 반환
   * 구현 클래스를 감추면 API가 매우 간결해짐
   * 반환되는 객체의 클래스는 `public이 아닐 수 있다`
* return으로 Interface를 사용하는 `interface-based framework에 적합`
   * ex. Java Collection Framework
* 전달되는 parameter에 따라 다양한 클래스의 객체를 반환
   * ex. `java.util.EnumSet`
* static factory 메소드를 갖는 클래스를 작성하는 시점에 그 메소드로 반환되는 객체의 클래스가 존재하지 않아도 된다
   * JDBC와 같은 service provider framework의 근간이 된다

#### service provider framework
* 여러 서비스 제공자(모듈)가 `하나의 서비스를 구현하는 시스템`
* 시스템의 클라이언트가 구현체를 만든다(클라이언트 코드와 내부 구현 코드가 분리될 수 있게끔)

##### 핵심 컴포넌트
1. `service interface`
   * provider가 구현
   * ex. JDBC의 `Connection Interface`
2. `provider registration API`
   * 시스템에서 `클라이언트가 쓸 수 있도록 구현체를 등록`하는데 사용
   * ex. JDBC의 `DirverManager.registerDriver()`
3. `service access API`
   * `서비스 인스턴스를 얻기 위해` 클라이언트가 사용
   * 옵션으로 클라이언트가 provider 선택 조건을 지정하게 한다
   * 없다면 default 구현체를 반환
   * 유연한 static factory로써 `service provider framework의 근간`
   * ex. JDBC의 `DriverManager.getConnection()`
4. `service provider interface`(optional)
   * provider가 자신의 `service 구현체 인스턴스를 생성하기 위해 구현`
      * 없는 경우 클래스 이름으로 등록되고 인스턴스 생성
   * ex. JDBC의 `Driver`
```java
// example. 간단한 service provider framework

// service interface
public interface Service {
    // service 관련 메소드
}

// service provider interface
public interface Provider {
    Service newService();
}

// service 등록, 접근을 위한 인스턴스 생성 불가능 클래스
public class Services {

    private Services(){
    }

    // 서비스명을 Map에 보존
    private static final Map<String, Provider> providers =
            new ConcurrentHashMap<>();

    public static final String DEFAULT_PROVIDER_NAME = "<def>";

    // provicder registration API
    public static void registerDefaultProvider(Provider p) {
        registerProvider(DEFAULT_PROVIDER_NAME, p);
    }

    public static void registerProvider(String name, Provider p){
        providers.put(name, p);
    }

    // service access API
    public static Service newInstance() {
        return newInstance(DEFAULT_PROVIDER_NAME);
    }

    public static Service newInstance(String name) {
        Provider p = providers.get(name);
        if(p == null){
            throw new IllegalArgumentException("No provider registered with name: " + name);
        }
        return p.newService();
    }
}
```

#### 장점 4. parameterized type(매개변수화 타입)의 인스턴스를 생성하는 코드를 간결하게 해준다
* 매개변수화 클래스의 생성자를 호출할 때는 `type parameter를 지정`해야 한다
```java
Map<String, List<String>> m = new HashMap<String, List<String>>();
```
* 타입 parameter가 늘어날 경우 복잡해짐

* factory 메소드로 `컴파일러가 타입 parameter를 해결하도록` 구현
```java
// type inference(타입 추론)
public static <K, V> HashMap<K, V> newInstance() {
    return new HashMap<K, V>();
}

// usage
Map<String, List<String>> m = HashMap.newInstance();
```

#### 단점 1. sub class를 가질 수 없다
* 인스턴스 생성을 위해 static factory 메소드만 갖고 있으면서 public이나 protected 생성자가 없는 클래스의 경우
* public static factory 메소드에서 반환하는 객체가 public이 아닌 경우
* 상속 대신 composition을 사용하게끔 해주니까 장점일 수도 있다

#### 단점 2. 다른 static 메소드와 쉽게 구별할 수 없다
* 공통 네이밍으로 단점을 줄일 수 있다

* `valueOf()`
   * 자신의 매개변수와 같은 값을 갖는 인스턴스 반환(타입을 변환하는 메소드) 
* `of()`
   * valueOf()를 줄인 형태의 이름. EnumSet에서 사용
* `getInstance()`
   * parameter에 나타난 인스턴스 반환
   * parameter와 같은 값을 갖지 않을 수 있다
   * ex. singleton - parameter가 없고 오직 하나의 인스턴스만 반환
* `newInstance()`
   * getInstance()와 유사하나 반환되는 각 인스턴스가 서로 다르다
* `getXX()`
   * getInstance()와 유사하나 factory가 다른 클래스에 있을 때 사용
   * XX는 factory에서 반환되는 객체
* `newXX()`
   * newInstance()와 유사하나 factory가 다른 클래스에 있을 때 사용
   * XX는 factory에서 반환되는 객체


### 정리
* static factory 메소드, public 생성자는 나름의 용도가 있으므로, 상호간의 장점을 알도록 하자
* static factory 메소드가 좋을 때가 많다
* static factory 메소드를 고려하지 않고, public 생성자를 사용하는 습관을 피하자
 
</br>

## 규칙 2. Consider a builder when faced with many constructor(생성자의 매개변수가 많을 때는 builder를 고려하자)
* `static factory 메소드`와 `생성자`는 `선택 가능한 parameter가 많아질 경우 신축성있게 처리하지 못한다는` 공통적인 제약이 존재

### 대안 1. telescoping constructor 패턴
* `여러개의 생성자를 겹겹이 만든다`
   * 필수 parameter만 갖는 생성자
   * 필수 parameter와 선택 parameter 1개를 갖는 생성자
   * 필수 parameter와 선택 parameter 2개를 갖는 생성자
   * ...

```java
// telescoping constructor 패턴
public class NutritionFacts {
    private final int servingSize;  // 필수
    private final int servings;     // 필수
    private final int calories;     
    private final int fat;          
    private final int sodium;       
    private final int carbohydrate; 

    public NutritionFacts(int servingSize, int servings) {
        this(servingSize, servings, 0);
    }

    public NutritionFacts(int servingSize, int servings, int calories) {
         this(servingSize, servings, calories, 0);
    }
    ...
}
```
* parameter의 수가 증가하면...?
   * 클라이언트 코드 작성이 힘들고, 
   * 동일한 타입의 parameter가 길게 연속되어 가독성도 떨어진다 

### 대안 2. JavaBeans 패턴
* `parameter가 없는 생성자로 객체를 생성한 후 setter`로 필수 필드와 선택 필드의 값을 지정

```java
// JavaBeans 패턴
public class NutritionFacts {
    // default value로 초기화
    private final int servingSize = -1;  // 필수
    private final int servings = -1;     // 필수
    private final int calories = 0;    
    private final int fat = 0; 
    private final int sodium = 0;      
    private final int carbohydrate = 0;

    public NutritionFacts() {}

    public void setServingSize(int val) {
        this.servingSize = val;
    }
    ...
}

// usage
NutritionFacts cocaCola = new NutritionFacts();
cocaCola.setServingSize(240);
cocaCola.setServings(8);
cocaCola.setCalories(100);
...
```

#### 장점
* telescoping constructor 패턴과 같은 단점을 가지고 있지 않다
* 코드가 길어지긴하지만 `인스턴스의 생성이 간단`하고, `가독성이 좋다`

#### 단점
* `여러번의 메소드 호출로 인스턴스가 생성`되므로, 생성과정을 거치는 동안 JavaBean 객체가 일관된 상태를 유지하지 못할 수 있다
   * 생성자의 유효성을 검사하여 일관성을 유지하도록하는 옵션조차도 클래스에 없기 때문
* 일관성 없는 상태의 객체를 사용하려 한다면 결함을 찾기 어려운 문제를 야기시킬 수 있다
* immutable 클래스를 만들 수 있는 가능성을 배제하므로, thread safty를 유지하려면 추가적인 노력 필요


### 대안 3. Builder 패턴
`telescoping constructor 패턴의 안전성`과 `JavaBeans 패턴의 가독성`을 결합한 패턴

1. 원하는 객체를 바로 생성하는 대신 클라이언트는 `필수 매개변수를 갖는 생성자(또는 static factory 메소드)`를 호출하여 Builder 객체를 얻는다
2. Builder의 setter로 선택 매개변수의 값을 설정
3. `build()`로 immutable 객체를 생성
   * immutable 객체인 이유 -> setter를 가지지 않기 때문

> #### immutable 객체  
> 생성 후에 상태가 변하지 않는다  
> ex. String

```java
// Builder 패턴
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;

    public static class Builder {
        // 필수
        private final int servingSize;
        private final int servings;

        // 선택
        private int calories = 0;
        private int fat = 0;

        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }

        public Builder calories(int val) {
            this.calories = val;
            return this;
        }

        public Builder fat(int val) {
            this.fat = val;
            return this;
        }

        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }

    private NutritionFacts(Builder builder) {
        servingSize = builder.servingSize;
        servings = builder.servings;
        calories = builder.calories;
        fat = builder.fat;
    }
}

// usage
NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
                            .calories(100)
                            .fat(20)
                            .build();
```

* parameter의 값이 Builder로부터 객체에 복사된 후 Builder의 필드가 아닌 `객체의 필드에 대해 불변 규칙 검사를 수행`
* 만일 어떤 불변 규칙이라도 위배되면, `build()에서 IllegalStateException을 발생`시키며, 이 예외 관련 메소드에서는 어떤 불변 규칙이 위배되었는지 알려주어야 한다

> #### 복수 개의 parameter에 불변 규칙을 적용시키는 또다른 방법
> * 모든 그룹(필수와 선택)의 parameter를 받는 setter를 두는것
> * 만일 불변 규칙이 충족되지 않으면, `setter에서 IllegalStateException을 발생`
> * build()가 호출될 때까지 기다릴 필요 없고, 부적합한 parameter가 전달되는 즉시 이상 유무를 검출할 수 있다


#### 생성자 대비 Builder 패턴의 장점
* 여러개의 varargs(가변인자)를 가질 수 있다
   * setter당 하나씩 
* 유연성이 좋다
   * 하나의 Builder는 여러개의 객체를 생성하는데 사용될 수 있으며, 이러한 과정 중에 Builder의 매개변수는 다양하게 조정될 수 있다
   * 일부 필드의 값을 자동으로 설정할 수 있다
      * ex. 객체 생성시 자동으로 증가하는 일련 번호
* parameter의 값이 설정된 Builder는 훌륭한 `Abstract Factory`를 만든다
   * 클라이언트 코드에서는 Builder를 메소드로 전달하여, 그 메소드에서 하나 이상의 객체를 생성할 수 있다
   * Builder를 나타내는 type 필요
```java
public interface Builder<T> {
    public T build();
}
```

* 특정 Builder 인스턴스를 매개변수로 받는 메소드에서는 Builder의 타입 매개변수로 bounded wildcard 타입을 사용
   * ex. 이진 트리를 만드는 메소드
```java
// 메소드에서는 클라이언트 코드에서 제공하는 Builder 인스턴스를 사용해서 각 노드를 생성하는 트리를 만든다
Tree buildTree(Builder<? extends Node> nodeBuilder) { ... }
``` 

* 자바에서는 Class란 이름을 갖는 클래스가 Abstract Factory 패턴을 구현하고 있는데, 이 클래스의 newInstance()에서 build()의 역할을 수행
* 문제 -> `newInstance()`는 항상 생성될 클래스의 parameter 없는 생성자 호출
   * 생성자가 없을 수 있다 -> runtime exception에 대처해야 한다
* parameter 없는 생성자에서 발생시키는 어떤 예외건 그대로 전달한다
   * 즉, Class의 newInstance()는 컴파일 시점의 예외 검사를 어렵게 만들며, runtime에 exception을 발생시킬 수 있다
* `Builder interface`는 이런 결함을 해소


#### Builder 패턴의 단점
* 어떤 객체를 생성하려면 Builder를 생성해야 한다
* Builder 객체의 생성 비용이 눈에 띄게 클 정도는 아니더라도 성능이 매우 중요한 상황에서는 문제가 될 수 있다
* telescoping 패턴보다 코드가 길어지므로, `parameter가 많을 때(4개 이상)만 사용하는 것이 좋다`
   * 추후 parameter가 추가될 가능성을 염두
   * 생성자나 static factory로 시작한 후, parameter의 수가 많이 늘어나는 시점이 되어 Builder를 추가한다면, 쓸모 없게 된 생성자나 static factory가 너무 아까울 수 있다
   
### 정리
* 생성자나 static factory에서 많은 선택 paramter를 갖게 될 클래스를 설계할 때는 Builder 패턴이 좋은 선택
* telescoping constructor 패턴보다 클라이언트 `가독성이 좋고`, `작성이 쉽다`
* JavaBeans 패턴보다 `안전`하다



## 규칙 3. Enforce the singleton property with private constructor or an enum type


## 규칙 4. Enforce noninstantiability with a private constructor


## 규칙 5. Avoid creating unnecessary objects


## 규칙 6. Eliminate obsolete object references


## 규칙 7. Avoid finalizers



