# Ch2. Creating and Destorying Objects(객체의 생성과 소멸)
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 언제 어떻게 생성해야 하는지, 언제 어떻게 생성을 피해야 하는지 등...


* [1. Consider static factory methods instead of constrictors](#규칙-1-consider-static-factory-methods-instead-of-constrictors)
* [2. Consider a builder when faced with many constructor](#규칙-2-consider-a-builder-when-faced-with-many-constructor)
* [3. Enforce the singleton property with private constructor or an enum type](#규칙-3-enforce-the-singleton-property-with-private-constructor-or-an-enum-type)
* [4. Enforce noninstantiability with a private constructor](#규칙-4-enforce-noninstantiability-with-a-private-constructor)
* [5. Avoid creating unnecessary objects](#규칙-5-avoid-creating-unnecessary-objects)
* [6. Eliminate obsolete object references](#규칙-6-eliminate-obsolete-object-references)
* [7. Avoid finalizers](#규칙-7-avoid-finalizers)


## 규칙 1. Consider static factory methods instead of constrictors
> 생성자 대신 factory 메소드 사용을 고려하라

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

## 규칙 2. Consider a builder when faced with many constructor
> 생성자의 매개변수가 많을 때는 builder를 고려하자

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
> private 생성자나 enum 타입을 사용해서 싱글톤의 특성을 유지하자

* singleton은 정확히 `하나의 인스턴스만 생성`되는 클래스
* 본질적으로 `유일한 시스템 컴포넌트`를 나타낸다

### 1. public final 필드를 갖는 singleton
```java
public class Elvis {
    public static final Elvis INSTANCE = new Elvis();

    private Elvis() { }

    public void leaveTheBuilding() {    }
}
```
* private 생성자는 딱 1번만 호출되어 INSTANCE 초기화
* 멤버 필드만 봐도 singleton인지 알 수 있다
* `public static 필드가 final`이므로 항상 같은 참조를 갖는다
* static factory 메소드를 사용하는 것에 비해 성능 이점은 없다
   * JVM은 static factory 메소드를 인라인코드로 호출하기 때문


### 2. static factory 메소드를 갖는 싱글톤
```java
public class Elvis {
    private static final Elvis INSTANCE = new Elvis();

    private Elvis() {  }
    
    public static Elvis getInstance() {
        return INSTANCE;
    }

    public void leaveTheBuilding() {
    }
}
```
* 몇번이 호출되건 Elvis.getInstance()에서 항상 같은 객체의 참조 반환
* 클래스의 API를 변경하지 않고, 반환하는 싱글톤 인스턴스의 형태를 바꿀 수 있는 유연성을 제공
   * ex. factory 메소드에서는 오직 하나의 인스턴스를 반환하지만, 호출하는 각 thread마다 하나씩의 인스턴스를 반환하도록 쉽게 수정할 수 있다
* 제네릭 타입에 관련된 장점은 규칙 27에서 설명
* 위의 장점은 그다지 유용하지 않으며, `final 필드를 이용한 방법이 더 간단`


> #### 앞의 2가지 방법으로 구현된 싱글톤 클래스르 serializable하려면?
> * implements Serializable 추가
> * 싱글톤을 보장하기 위해 모든 인스턴스 필드를 `transient`로 선언
> * readResolve 메소드를 추가
>    * 안하면, deserialized될 때 마다 새로운 인스턴스가 생성됨
```java
// 싱글톤 특성 보존을 위한 readResolve()
private Object readResolve() {
    // 하나의 진짜 Elvis를 반환하고 GC가 가짜 Elvis를 처리하도록 한다
    return INSTANCE;
}
```

### 3. 하나의 요소를 갖는 enum 타입
```java
public enum Elvis {
    INSTANCE;
    
    public void leaveTheBuilding() {  }
}
```
* 가장 좋은 방법
* public 필드 방법과 기능적으로 동일하지만 더 간단
* 복잡한 직렬화나 reflection에서도 직렬화가 자동으로 지원
* 인스턴스가 여러개 생기지 않도록 확실히 보장



## 규칙 4. Enforce noninstantiability with a private constructor
> private 생성자를 사용해서 인스턴스 생성을 못하게 하자

### static 메소드, static 필드만 모아놓은 클래스의 적합한 용도
1. java.lang.Math, java.util.Arrays 처럼 `산술 연산에 필요한 기본형 값`이나 `배열에 관련된 메소드들을 모아 놓는데` 사용
2. java.util.Collections처럼 `특정 인터페이스를 구현하는 객체들에 사용되는 static 메소드를 모아놓는데` 사용
3. 상속을 통해 서브 클래스로 확장하는 대신 하나의 `final 클래스로 메소드를 모아 놓는데` 사용

### utility 클래스들은 인스턴스를 생성하지 못하게 설계
* 인스턴스의 생성이 무의미
* 그러나 컴파일러가 default 생성자를 자동으로 생성

#### abstract 클래스로 인스턴스 생성을 불가능 하자
* 잘못된 생각
* 서브 클래스를 만들 수 있고, 서브 클래스는 인스턴스 생성이 가능
* 상속을 위해 설계된 것처럼 보이게 된다

#### 해결법 - 명시적인 private 생성자를 이용
```java
public class UtilityClass {

    /**
     * default 생성자가 자동으로 생기는 것을 방지 -> 이처럼 의도를 나타내는 주석 추가
    */
    private UtilityClass() {
        throw new AssertionError();  // 필수는 아니지만 내부에서 잘못 호출될 경우를 방지
    }
}
```
* 클래스 외부에서 생성자 호출 불가
* 서브 클래스를 만들 수 없다는 부작용
   * 서브 클래스는 super()를 사용해 생성자 호출
   * 외부에서 호출이 불가하므로 컴파일시 error 발생



## 규칙 5. Avoid creating unnecessary objects
> 불필요한 객체의 생성을 피하자

* 기능적으로 동일한 객체를, 필요할 때마다 매번 새로 생성하기보다는 하나의 객체를 재사용하는 것이 좋을 때가 많다

### 재사용의 이점
* 객체 생성에 소요되는 시간, 자원이 절감
* 속도가 빨라지고, 가독성 향상
* immutable 객체는 항상 재사용 가능
```java
// 실행시마다 매번 새로운 객체 생성
String s = new String("stringette");
```

#### 개선
```java
String s = "stringette";
```
* 하나의 String 인스턴스 사용
* 동일한 문자열 리터럴 사용

### immutable 클래스의 불필요한 객체 생성을 막으려면 생성자보다는 static factory 메소드를 사용
* `Boolaen(String)`보다 `Boolean.valueOf(String)` 사용


### 객체의 상태가 변경되지 않는다면 mutable 객체도 재사용 가능
```java
public class Person {
    private final Date birthDate;

    // 이렇게 하지 말자
    public boolean isBabyBoomer() {
        // 불필요한 객체 생성
        Calendar gmtCal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
        gmtCal.set(1946, Calendar.JANUARY, 1, 0, 0, 0);
        Date boomStart = gmtCal.getTime();
        gmtCal.set(1965, Calendar.JANUARY, 1, 0, 0, 0);
        Date boomEnd = gmtCal.getTime();
        return birthDate.compareTo(boomStart) >= 0 && birthDate.compareTo(boomEnd) < 0;
    }
}
```

### 개선 - static initializer 사용
```java
class Person {
    private final Date birthDate;

    // 상수로 더 명확해짐
    private static final Date BOOM_START;
    private static final Date BOOM_END;

    static {
        Calendar gmtCal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
        gmtCal.set(1946, Calendar.JANUARY, 1, 0, 0, 0);
        BOOM_START = gmtCal.getTime();
        gmtCal.set(1965, Calendar.JANUARY, 1, 0, 0, 0);
        BOOM_END = gmtCal.getTime();
    }

    public boolean isBabyBoomer() {
         return birthDate.compareTo(BOOM_START) >= 0 && birthDate.compareTo(BOOM_END) < 0;
    }
}
```
* `isBabyBoomer()`가 절대 호출되지 않는다면 BOOM_START, BOOM_END는 `쓸데 없는 초기화`
* lazy initialization함으로써 배제
   * 권장하지 않음
   * 구현이 복잡, 두드러진 성능 개선을 기대하기 어려움


### 재사용 여부가 불분명한 경우
* adapter 패턴
   * backing 객체에게 기능을 위임, 선택가능한 인터페이스를 backing 객체에게 제공

* Map객체에 대해 KetSet을 여러번 호출하더라도 동일한 Set 인스턴스를 반환
   * Set은 변경가능하더라도 모든 반환 객체들은 기능적으로 동일

### autoboxing
* 불필요한 객체를 생성하는 방법
* 성능 측면을 잘 고려

```java
public static void main(String[] args) {
    Long sum = 0L;
    for(long i=0; i<Integer.MAX_VALUE; i++){
        sum += i;  // 쓸데없는 객체 생성으로 느려짐
    }
    System.out.println(sum);
}
```

* 생성자에서 일을 거의 하지 않는 작은 객체의 생성과 재사용은 비용이 적게 든다
   * 프로그램의 `명확성`과 `단순성` 및 `능력을 향상`시키기 위해서라면 객체를 추가로 만드는 것도 좋은 일

* object pool을 만들고 유지하여 객체 생성을 피하려는 방법은 좋지 않다
   * 단, pool에 유지할 객체들이 대단히 무거워서 `생성 비용이 많이 드는 것이라면 고려`
   * ex. DB connection


### 정리
* 기존것을 재사용해야 한다면 새로운 객체는 생성하지 말자
* 방어 복사와는 반대 의견
* 방어복사가 필요한 상황에서 객체를 재사용함으로써 생기는 불이익은 중복 객체를 생성하여 받는 불이익보다 훨씬 크다
* 방어 복사에 실패하면, 찾기 어려운 결함 + 보안에 구멍



## 규칙 6. Eliminate obsolete object references
> 쓸모없는 객체 참조를 줄이자

* 메모리 관리에도 신경을 써야한다

### Memory Leak
* 성능 저하
   * gc 작업이 증가하거나, 메모리 할당과 회수가 빈번하게 생기기 때문
   * full gc의 경우, 시스템이 정지된다
* 최악의 겨우 디스크상의 paging이 생기고, OutOfMemoryError도 발생

### Memory Leak의 원인 1 - 쓸모없는 참조
```java
// 간단한 스택
// 어디에서 메모리 누수가 생기는가?
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if(size == 0) {
            throw new EmptyStackException();
        }
        return elements[-size];
    }

    // 배열에 요소를 저장하는데 필요한 공간을 확인하고, 부족할 경우 2배로 늘린다
    private void ensureCapacity() {
        if(elements.length == size) {
            elements = Arrays.copyOf(elements, 2 * size + 1);
        }
    }
}
```
* 스택이 커졌다 줄어들면 스택에서 꺼냈던 객체들은 gc되지 않는다
* 사용되지 않는 쓸모없는 참조를 가지고 있기 때문
* 쓸모 없는 참조
   * null이 아닌 객체에 대한 참조를 가지고 있지만 다시는 사용되지 않을 참조


#### 해결책 - 쓸모없는 참조를 null로 만든다
```java
public Object pop() {
    if(size == 0) {
        throw new EmptyStackException();
    }
    Object result = elements[--size];
    elements[size] = null;  // 쓸모없는 참조 제거
    return result;
}
```
* 쓸모없는 참조를 null로 바꾸면, NPE로 인해 실수 방지
   * 필수 X, 바람직 X
   * 꼭 필요할 때만 예외적으로 적용
   * 스택같이 자신의 메모리를 스스로 관리할 경우
* 가장 좋은 방법은 `참조값을 갖는 변수가 유효 범위 밖에 있도록 하는 것`


### Memory Leak의 원인 2 - 캐시(cache)
* 객체 참조를 캐시에 저장하면, 잊어버리고 필요 없을 때 까지 캐시에 내버려두기 쉽다

### 해결책 - Weak Reference 사용
* 캐시 외부에 캐시의 key에 대한 참조가 있을 동안만 저장된 항목이 유효한 캐시라면
`WeakHashMap`을 캐시로 사용
* 더이상 참조되지 않을 때 gc의 대상이 된다
* 캐시에 저장된 항목들의 생명주기가 각 항목의 key에 대한 외부 참조에 의해 결정되도록 할 경우 유용
* 캐시에 저장된 항목의 생명주기가 잘 정의되지 않을 경우
   * 시간이 경과하고 가치가 없게 된 항목이 생긴다
   * 가끔 삭제해주어야 한다
   * `background thread`(Timer, ScheduledThreadPoolExecutor)로 처리
   * `새 항목을 캐시에 추가할 때` 처리
      * `LinkedHashMap.remove-EldestEntry()`
* 더 복잡한 캐시의 경우 `java.lang.ref의 클래스`들을 직접 사용할 필요가 있다


### Memory Leak의 원인 3 - listener, callback
* callback을 등록하되 해제하지 않는 API를 구현한다면 계속 누적된다
* callback이 gc의 대상이 되도록 하는 가장 좋은 방법은 `weak reference`로 저장
   * `WeakHashMap`의 key로 callback을 저장

### 정리
* memory leak이 생기기전에 예상하고, 발생을 막는 것이 바람직



## 규칙 7. Avoid finalizers
> finalizer의 사용을 피하자

* finalizer는 예측불가하고, 위험하고, 일반적으로는 불필요
* C++의 destructor과는 다르다
   * Java에서는 destructor 용도로 `try-finally`를 사용


### finalizer의 단점
* 신속하게 실행된다는 보장이 없다
   * 실행 시간이 중요한 작업을 하면 안된다
   * ex. 열 수 있는 파일이 제한되어 있는 경우에 파일 닫기 - 언제 닫힐지 보장 X
* finalizer가 얼마나 빨리 실행되는가는 주로 gc알고리즘에 달려있다
   * JVM 종류에 따라 다양
* 클래스에 finalizer를 사용하면 간혹 인스턴스들의 메모리 회수와 재활용이 지연될 수 있다
   * 객체들이 쌓이고 쌓여 OutOfMemoryError 발생
* persistent 상태를 변경할 경우에도 X
   * ex. DB에서 공유 자원에 걸려있는 lock을 해지하는데 finalizer를 사용한다면 분산 시스템 전체를 멈추게 될 것이다

### System.gc()와 System.runFinalization()은 되도록 사용하지 말자
* finalizer의 실행을 반드시 보장하지 않는다


### finalizer를 사용하면 안되는 이유
1. finalize되는 동안 exception이 발생하면 무시되고, stack trace도 남지 않는다
2. 엄청난 성능 저하
   * 간단한 객체를 생성, 소멸시키는 시간은 5.6ns, finalizer를 추가하면 2400ns, 약 430배 느려진다


### File, Thread처럼 종결 작업이 필요한 자원을 갖는 객체들의 클래스에서는 무엇을 사용해야 할까?

#### 1. 작업이나 자원을 정상적으로 종료하는 메소드 별도 추가
* private 필드로 인스턴스에서 자신의 종료 여부를 관리해야 한다
* 메소드에서 필드 값을 확인하여 유효하지 않은 호출이라면 IllegalStateException 발생
   * InputStream, OutputStream, java.sql.Connection에 있는 `close()`

#### 2. java.util.Timer의 cancel()
* Timer 인스턴스와 연관된 Thread가 `자신을 정상적으로 종료하는데 필요한 상태변경`을 수행

#### 3. Image.flush()
* Image 인스턴스와 관련된 모든 자원을 해지하되, 인스턴스를 사용가능한 상태로 두므로 필요하면 자원을 재할당



### 가급적 종료 메소드는 try-finally와 함께 사용하여 확실하게 실행되도록 하자
* exception이 발생해도 항상 실행된다
```java
// try-finally를 사용하면 종료 메소드의 실행을 보장
Foo foo = new Foo();
try {
    // doing
} finally {
    foo.terminate();  // 종료 메소드
}
```


### finalizer는 어떤 경우에 사용하면 좋을까??
1. 생성된 객체를 갖고 있는 코드에서 그 객체의 종료 메소드 호출을 빠뜨렸을 경우 `안전망`역할
   * 자원의 사용이 완전히 끝나지 않은 경우 finalizer에서 경고 메시지로 기록

2. native peer 객체와 관련이 있다
* native peer
   * native 메소드를 통해 일반 Java 객체가 자신의 일을 위임하는 native 객체
* 일반 Java객체가 아니므로, 그것과 연관된 Java peer 객체가 소멸되면 gc가 알지 못하며 재활용 할 수 없다
* native peer가 중요한 자원을 갖고 있지 않을 경우에만 적합


### finalizer의 연쇄 호출은 자동으로 실행되지 않는다
* try-catch에서 서브 클래스를 finalize하되, 수퍼 클래스의 finalizer도 호출
```java
// finalizer의 연쇄 호출은 직접 해야 한다
@Override
protected void finalize() throws Throwable {
    try {
        // doing
    } finally {
        super.finalize();
    }
}
```
* 위의 경우 finalize()를 오버라이딩할 때 super.finalize()의 호출을 빼먹을 수 있다
   * 모든 객체가 finalize 되도록 추가 객체를 생성하여 대응할 수 있다
   * finalize가 필요한 클래스의 finalizer를 작성하는 대신 자신을 포함하는 `외부 클래스의 인스턴스를 finalize하는 목적만을 갖는 익명의 내부 클래스`에 finalizer를 만드는 것
```java
// finalizer guardian
// public 클래스인 Foo는 finalizer를 갖고 있지 않다
public class Foo {
    // 이 객체의 목적은 외부 클래스(Foo) 객체의 finalize를 수행하는 것
    private final Object finalizerGuardian = new Object() {
        @Override
        protected void finalize() throws Throwable {
            // 외부 클래스(Foo) 객체의 finalize()를 수행
        }
    };
}
```

### 정리
* 종료 메소드 호출을 빼먹는 경우를 대비한 `안전망`이나, `중요하지 않은 네이티브 자원`을 종결하는 경우 외에는 finalizer를 사용하지 말자
   * 안전망으로 finalizer를 사용한다면, 부적절한 상황(자원 사용이 끝나지 않은 객체를 finalize)에 대한 메시지를 남겨라
* 어쩔수 없이 사용해야 하는 경우 `super.finalize()`를 호출하는 것을 잊지말자
* `public이고 final이 아닌 클래스`에 finalizer가 필요하다면, `finalizer guardian`의 사용을 고려



