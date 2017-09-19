# Ch4. Classes and Interfaces(클래스와 인터페이스)
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 클래스와 인터페이스는 Java의 핵심이며 추상화의 기본 단위  
> 클래스와 인터페이스가 쓸모 있고 강력하며, 유연성 있도록하기 위한 요소들을 최상으로 사용하는데 도움을 주는 지침을 정리  

## 규칙 13. Minimize the accessibility of classes and members(클래스와 그 멤버의 접근성을 최소화하자)

### 잘 설계된 모듈과 그렇지 않은 것을 구분 짓는 가장 중요한 잣대
* 모듈 자신의 내부 데이터 및 구현 부분을 다른 모듈로부터 `어느 정도로 숨기느냐`
* `외부 API 부분과 내부 구현을 명쾌하게 분리`하며 내부의 구현은 숨긴다
* API를 통해서만 다른 모듈과 상호작용하고, 다른 모듈의 내부 작업에 영향도가 없어야 한다
   * 캡슐화, 정보 은닉의 개념

### 정보 은닉
* 시스템을 구성하는 모듈들 간의 `결합도를 낮추어 모듈 별로 개발`, 테스트, 최적화, 사용 및 수정이 가능
* 각 모듈을 병행 개발할 수 있어 시스템 개발이 빨라짐
* `다른 모듈에 영향을 주지 않고 수정`이 가능해 유지보수에 용이하다
* 효과적인 성능 튜닝
   * 프로파일링을 통해 해당 모듈 성능 최적화
* 재사용성
   * 모듈간의 결합도가 낮아서 다른 업무 영역에도 사용될 수 있다
* 시스템 개발시 위험 부담 감소
   * 각 모듈별로 성공 여부를 입증할 수 있어서

### access control 메커니즘의 클래스와 인터페이스 및 접근성
* 각 클래스나 멤버의 접근 허용을 가능한 최소화
   * 모듈이 올바르게 동작하는 범위 내에서 가장 낮은 접근 수준 사용

#### top-level 클래스(다른 클래스나 인터페이스에 포함되지 않은)와 인터페이스
* public, package 가능
* 가능하다면 package로 선언
* 외부 API보다는 내부 구현에 더 큰 비중을 둘 수 있다
* 클라이언트에 영향을 주지 않고 코드 변경, 삭제 가능
* public으로 하면 호환성 유지를 위해 영구적인 지원 필요

#### package 전용의 top-level 클래스가 단 하나의 클래스에서만 사용될 경우
* 사용하는 클래스의 private nested 클래스로 만드는 것을 고려
* 다른 클래스로부터의 접근을 줄일 수 있다
* 불필요한 public 클래스의 접근을 줄이는 것이 훨씬 중요

### 접근자
* private - 멤버가 선언된 top-level 클래스에서만 접근 가능
* package - 클래스가 선언된 패키지의 모든 클래스에서 접근 가능(default)
* protected - 패키지 전용, 클래스의 서브 클래스로부터 접근 가능
* public - 어디서든 접근 가능

### 클래스 설계시
* public API를 신중하게 결정
* 다른 멤버는 private
   * 외부 API에 영향을 주지 않는다
* 같은 패키지의 다른 클래스가 접근할 필요가 있으면 package. 자주 생기면 클래스간의 결합도를 낮추기 위해 리팩토링
* 인터페이스의 모든 멤버는 default로 public

### 테스트를 위해 접근 수준을 높이는 것은 어느 정도는 가능
* public 클래스의 private 필드를 package로 하는 것은 허용. 그이상은 X
* 테스트를 용이하게 하기 위해 클래스나 인터페이스 또는 멤버를 패키지의 외부 API로 만들 수 없다
   * package로 접근

### 인스턴스 필드는 절대로 public으로 하지 말아야 한다
* final이 아니거나 가변 객체의 final 참조일 경우 외부에서 값의 변경이 가능하므로
* public 가변 필드를 갖는 클래스는 Thread Safe를 보장할 수 없다
* 요소가 하나라도 있는 배열은 가변적
* 클래스에 public static final 배열 필드를 갖거나, 그런 필드를 반환하는 접근자 메소드를 갖는 것은 잘못된 것
```java
// 보안상 허점..!
public static final Thing[] VALUES = {};

// 아래 2가지 중 어떤 반환 타입이 편리한지, 성능이 어떤게 좋은지 등을 고려해서 선택
// 개선1 - public immutable list 추가
private static final Thing[] PRIVATE_VALUES = {};
public static final List<Thing> VALUES = Collections.unmodifiableList(Arrays.asList(PRIVATE_VALUES));

// 개선2 - 복사본 반환
private static final Thing[] PRIVATE_VALUES = {};
public static final Thing[] values() {
    return PRIVATE_VALUES.clone();
}
```

### 정리
* 가능한 접근성을 줄여야 한다
* 클래스 설계시 `최소한의 public API`를 결정
* 클래스나 인터페이스 및 멤버들이 `불필요하게 API의 한 부분이 되지 않도록` 주의
* 상수로 정의하는 public static final 필드를 제외하고 public 클래스에서는 어떤 public 필드도 갖지 않아야 한다
   * public static final 필드로 참조되는 객체는 `immutable`



## 규칙 14. In public classes, use accessor methods, not public fields(public 클래스에서는 public 필드가 아닌 접근자 메소드를 사용하자)

```java
// 이렇게 사용 X
class Point {
    public double x;
    public double y;
}
```
* 클래스의 데이터 필드가 외부에서 직접 접근 가능하므로 encapsulation이 깨진다
* 클래스 API를 수정하지 않는 한 필드를 변경할 수 없다
* 값이 변하지 않도록 할 수 없다
* 필드에 접근시 부수적인 조치 불가

```java
// getter, setter 추가
class Point {
    private double x;
    private double y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public void setX() {
        this.x = x;
    }

    public void setY() {
        this.y = y;
    }
}
```
* `어떤 클래스가 자신이 속한 패키지의 외부에서 접근 가능하다면 접근자 메소드를 제공`
* 클래스 내부 구조를 변경하기가 용이
* public 클래스에서 내부 데이터를 노출하면 내부 구조의 변경이 어렵다
* package 클래스, private nested 클래스라면 데이터 필드를 노출해도 아무 문제가 없다
   * 접근자 메소드보다 코드를 알아보기 쉽다
   * 외부에 영향을 주지 않고 클래스를 수정할 수 있다
* immutable 필드면 값이 변하지 않으므로 노출해도 괜찮다 - 별로 좋진 않다
```java
public final class Time {
    private static final int HOURS_PER_DAY = 24;
    private static final int MINUTES_PER_HOUR = 60;

    public final int hour;
    public final int minute;

    public Time(int hour, int minute) {
        if(hour < 0 || hour >= HOURS_PER_DAY)
            throw new IllegalArgumentException("Hour: " + hour);
        if(minute < 0 || minute >= MINUTES_PER_HOUR)
            throw new IllegalArgumentException("Min: " + minute);
        this.hour = hour;
        this.minute = minute;
    }
}
```

### 정리
* public 클래스는 자신의 mutable 필드를 절대로 외부에 노출해서는 안된다
* immutable 필드를 노출하는 것은 그나마 괜찮다
* package, private nested 클래스의 경우 필요하다면 노출할 수 있다



## 규칙 15. Minimize mutablility

## 규칙 16. Favor composition over inheritance

## 규칙 17. Design and document for inheritance or else prohibit it

## 규칙 18. Prefer interfaces to abstract classes

## 규칙 19. Use interfaces only to define types

## 규칙 20. Prefer class hierachies to tagged classes

## 규칙 21. Use function objects to represent strategies

## 규칙 22. Favor static member classes over nonstatic

