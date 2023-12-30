# [Java] Switch Expression, Pattern Matching, Records, Sealed Classes in Java 21
> date - 2023.12.25  
> keyword - java, switch expression, pattern matching, record, sealed class  
> Java 21까지의 JEP 중 Switch Expression, Pattern Matching, Records, Sealed Classes에 대해 정리  

<br>

## [JEP 361: Switch Expression](https://openjdk.org/jeps/361)
* switch에서 값 반환 가능
* yield로 값 return
* case에서 lambda 사용 가능
* Java 14에 추가

<br>

### switch statement
```java
int numLetters;
switch (day) {
  case MONDAY:
  case FRIDAY:
  case SUNDAY:
    numLetters = 6;
    break;
  case TUESDAY:
    numLetters = 7;
    break;
  case THURSDAY:
  case SATURDAY:
    numLetters = 8;
    break;
  case WEDNESDAY:
    numLetters = 9;
    break;
}
```
* 실수로 모든 case를 다루지 않거나 `break`가 누락되어 의도하지 않은 동작 가능

<br>

### switch expression
```java
int numLetters =
  switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> 9;
    default -> {
      int x = day.toString().length();
      yield x;
    }
  };
```
* 모든 case를 강제화하고, 누락된 `break`로 인한 실수가 방지
* switch block 내에서 값 반환시 `yield` 사용


<br>

## [Pattern Matching](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)
* 임의의 객체가 특정 패턴(타입, 값)을 만족하는지 조사하여 특정 패턴에 따라 코드를 더 간결하게 작성할 수 있게 해주는 기능

<br>

### [JEP 394: Pattern Matching for instanceof](https://openjdk.org/jeps/394)
* `instanceof` 후 type cast를 수동으로 처리해야했던 코드를 간소화하고 가독성을 향상
* Java 16에 추가

#### As-is
* instanceof
```java
if (obj instanceof String) {
  var str = (String) obj;
  System.out.println("String length: " + str.length());
}
```

#### To-be
* pattern matching for instanceof
```java
if (obj instanceof String str) {
  System.out.println("String length: " + str.length());
}
```

<br>

### [JEP 441: Pattern Matching for switch](https://openjdk.org/jeps/441)
* 가능한 모든 패턴을 처리하도록 강제하므로 각 패턴에 대해 간결하고 안전하게 표현 가능
* Java 21에 추가

#### As-is
* pattern matching for instanceof
```java
public String formatter(Object obj) {
  String formatted = "unknown";
  if (obj == null) {
    System.out.println("Oops!");
    return "";
  }

  if (obj instanceof Integer i) {
    formatted = String.format("int %d", i);
  } else if (obj instanceof Long l) {
    formatted = String.format("long %d", l);
  } else if (obj instanceof Double d) {
    formatted = String.format("double %f", d);
  } else if (obj instanceof String s) {
    if (s.length() == 1) {
      formatted = String.format("String %s, length 1", s);
    } else {
      formatted = String.format("String %s", s);
    }
  }
  return formatted;
}
```

#### To-be
* pattern matching for switch
```java
public String formatter(Object obj) {
  return switch (obj) {
    case null      -> {
      System.out.println("Oops!");
      yield "";
    }
    case Integer i -> String.format("int %d", i);
    case Long l    -> String.format("long %d", l);
    case Double d  -> String.format("double %f", d);
    case String s  -> String.format("String %s", s);
    case String s when s.length() == 1 -> String.format("String %s, length 1", s);
    default        -> obj.toString();
  };
}
```

* 아래처럼 switch에서 다양한 타입을 받을 수 있다
```java
sealed interface CardClassification permits Suit, Tarot { }
public enum Suit implements CardClassification { CLUBS, DIAMONDS, HEARTS, SPADES }
final class Tarot implements CardClassification { }

void exhaustiveSwitchWithoutEnumSupport(CardClassification cardClassification) {
  switch (cardClassification) {
    case Suit s when s == Suit.CLUBS -> System.out.println("clubs");
    case Suit s when s == Suit.DIAMONDS -> System.out.println("diamonds");
    case Suit s when s == Suit.HEARTS -> System.out.println("hearts");
    case Suit s -> System.out.println("spades");
    case Tarot t -> System.out.println("tarot");
  }
}
```


<br>

## [JEP 395: Records](https://openjdk.org/jeps/395)
* immutable data의 투명한 전달자 역할
* tuples이라고 생각할 수 있다
* toString, equals, hashCode 자동 생성
  * DTO(Data Transfer Objects), entity, model 등에 사용하는데 이상적
* Java 16에 추가

<br>

### Advantages
* boilerplate 감소
  * constructor, getter, equals(), hashCode(), toString()를 제공하므로 boilerplate 감소 효과
* immutability
  * record는 immutability를 보장하므로 data integrity이 중요할 때 유용
* clarity and transparency
  * record의 의도는 data 전달하는 매개체로 명확하여 투명한 의도로 코드를 더 쉽게 읽고 유지 관리 가능
* ease of use
  * 짧은 코드로 record를 정의할 수 있어 data class를 더 간단하게 만들 수 있다

### Usage

#### As-is
* [lombok](https://projectlombok.org)으로 인한 복잡성을 제거할 수 있다
```java
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PersonSaveCommandRequest {
  private String name;
  private int age;
}
```

#### To-be
```java
public record PersonSaveCommandRequest(
  String name, 
  int age
) {
}
```
* public constructor - PersonSaveCommandRequest(String name, int age)
* public getter - name(), age()
* equals(), hashCode(), toString() 구현

<br>

### Spring Boot [@ConfigurationProperties scanning](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.2-Release-Notes#configurationproperties-scanning)

* @ConfigurationProperties를 사용한 설정을 기존에는 @EnableConfigurationProperties or @Component를 사용해야했지만 @ConfigurationPropertiesScan을 사용하면 자동으로 등록한다
* setter를 만들지 않고, 생성자에 @ConstructorBinding를 설정하면 constructor-based binding되어 immutable해진다


#### As-is 
* @ConfigurationProperties + @EnableConfigurationProperties 조합
```java
@EnableConfigurationProperties(XXXRestTemplateConfig.XXXProperties.class)
@Configuration
public class XXXRestTemplateConfig {
  ...
 
    @Getter
    @Setter
    @ConfigurationProperties(prefix = "xxx.api")
    public static class XXXProperties {
        private String url;
        private String key;
        private int timeout;
    }
}
```

#### To-be
* @ConfigurationProperties + @ConstructorBinding + 전역 설정 @ConfigurationPropertiesScan 조합
```java
@ConfigurationPropertiesScan
@SpringBootApplication
public class XXApplication {
  ...
}
 
@Configuration
public class XXXRestTemplateConfig {
  ...
 
    @Getter
    @ConfigurationProperties(prefix = "xxx.api")
    public static class XXXProperties {
        private String url;
        private String key;
        private int timeout;
 
      @ConstructorBinding
      public XXXProperties(...) {
        ...
      }
    }
}
```

#### To-be - Spring Boot 2.6+ + Java 16+
* record 사용으로 immutable
* 생성자가 하나면 @ConstructorBinding가 필요 없고, 여러개라면 원하는 생성자에 @ConstructorBinding 설정 필요
```java
@ConfigurationProperties(prefix = "xxx.api")
public record XXXProperties(String url, String key, int timeout) {
}
```


<br>

## [JEP 409: Sealed Classes](https://openjdk.org/jeps/409)
* 지정한 class 외에 상속 불가
* 어떤 class가 상속했는지 쉽게 파악 가능하여 제한적인 계층 관계를 효과적으로 표현 가능
  * 기존의 무분별한 확장을 제한
* Java 17에 추가
* 권한을 받은 sub class는 sealed, non-sealed, final로 분류
  * final - 상속 불가
  * sealed - 특정 class에서 상속 가능
  * non-sealed - 아무 class에서 상속 가능

<br>

### 계층 관계 표현
```java
// Sedan, SUV, Truck에서 상속 가능
public sealed class Car permits Sedan, SUV, Truck {
}

// ModelS에서 상속 가능
public sealed class Sedan extends Car permits ModelS {
}

// ModelX, ModelY에서 상속 가능
public sealed class SUV extends Car permits ModelX, ModelY {
}

// 아무 class에서 상속 가능
public non-sealed class Truck extends Car {
}

// 상속 불가
public final class ModelS extends Sedan {
}

// 상속 불가
public final class ModelX extends SUV {
}

// 상속 불가
public final class ModelY extends SUV {
}
```

<br>

### Use case
* request 객체 표현
```java
public sealed class User permits Customer, Store, Admin {
  private String name;

  protected User(String name) {
    this.name = name;
  }
}

public final class Customer extends User {
  private String address;
  private String phoneNumber;

  public Customer(String name, String address, String phoneNumber) {
    super(name);
    this.address = address;
    this.phoneNumber = phoneNumber;
  }
}

public final class Admin extends User {
  private String department;

  public Admin(String name, String department) {
    super(name);
    this.department = department;
  }
}

public final class Store extends User {
  private String address;
  private String businessNumber;

  public Store(String name, String address, String businessNumber) {
    super(name);
    this.address = address;
    this.businessNumber = businessNumber;
  }
}

public class UserRequest {
  private String name;  // not null
  private String address;  // nullable
  private String phoneNumber;  // nullable
  private String businessNumber;  // nullable
  private String department;  // nullable
  private Type type;  // not null

  enum Type {
    CUSTOMER, STORE, ADMIN
  }

  public User form(UserRequest before) {
    return switch (before.type) {
      case CUSTOMER -> new Customer(before.name, before.address, before.phoneNumber);
      case STORE -> new Store(before.name, before.address, before.businessNumber);
      case ADMIN -> new Admin(before.name, before.department);
    };
  }
}
```

<br><br>

> #### Reference
> * [JDK 17](https://openjdk.org/projects/jdk/17)
> * [JDK 21](https://openjdk.org/projects/jdk/21)
> * [JEP 361: Switch Expression](https://openjdk.org/jeps/361)
> * [Pattern Matching](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)
> * [JEP 394: Pattern Matching for instanceof](https://openjdk.org/jeps/394)
> * [JEP 441: Pattern Matching for switch](https://openjdk.org/jeps/441)
> * [JEP 395: Records](https://openjdk.org/jeps/395)
> * [@ConfigurationProperties scanning](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.2-Release-Notes#configurationproperties-scanning)
> * [JEP 409: Sealed Classes](https://openjdk.org/jeps/409)
