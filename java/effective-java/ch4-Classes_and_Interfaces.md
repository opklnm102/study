# Ch4. Classes and Interfaces(클래스와 인터페이스)
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 클래스와 인터페이스는 Java의 핵심이며 추상화의 기본 단위  
> 클래스와 인터페이스가 쓸모 있고 강력하며, 유연성 있도록하기 위한 요소들을 최상으로 사용하는데 도움을 주는 지침을 정리  


* [13. Minimize the accessibility of classes and members](#규칙-13-minimize-the-accessibility-of-classes-and-members)
* [14. In public classes, use accessor methods, not public fields](#규칙-14-in-public-classes-use-accessor-methods-not-public-fields)
* [15. Minimize mutablility](#규칙-15-minimize-mutablility)
* [16. Favor composition over inheritance](#규칙-16-favor-composition-over-inheritance)
* [17. Design and document for inheritance or else prohibit it](#규칙-17-design-and-document-for-inheritance-or-else-prohibit-it)
* [18. Prefer interfaces to abstract classes](#규칙-18-prefer-interfaces-to-abstract-classes)
* [19. Use interfaces only to define types](#규칙-19-use-interfaces-only-to-define-types)
* [20. Prefer class hierachies to tagged classes](#규칙-20-prefer-class-hierachies-to-tagged-classes)
* [21. Use function objects to represent strategies](#규칙-21-use-function-objects-to-represent-strategies)
* [22. Favor static member classes over nonstatic](#규칙-22-favor-static-member-classes-over-nonstatic)


## 규칙 13. Minimize the accessibility of classes and members
> 클래스와 그 멤버의 접근성을 최소화하자

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



## 규칙 14. In public classes, use accessor methods, not public fields
> public 클래스에서는 public 필드가 아닌 접근자 메소드를 사용하자

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
> 가변성을 최소화 하자

### immutable 클래스
* 인스턴스가 갖는 값을 변경할 수 없는 클래스
* 모든 정보는 인스턴스 생성시 제공되며, 살아있는 동안 변경되지 않는다
* String, boxed primitive(wrapper), BigInteger, BigDecimal 등
* mutable 클래스에 비해 설계, 구현 및 사용이 더 쉽다
* 에러 발생이 적으며 보안, 사용 측면에서 더 안전

### immutable 클래스 구현 규칙
* 객체의 상태를 변경하는 메소드를 제공하지 않는다
* 상속할 수 없게 구현
   * 서브 클래스에서도 immutablility(불변성)을 보장하기 위해
   * `final 클래스`
   * `모든 생성자를 private이나 package`로 하고, 생성자 대신 public static factory 메소드 추가
* 모든 필드는 `final`
   * Java에서 immutablility를 지켜줌
   * memory model에 나와 있듯, 새로 생성된 immutable 객체의 참조가 thread 간의 동기화를 하지 않고, 다른 thread로 확실하게 전달되도록 하는데도 필요
* 모든 필드는 private
   * 직접 접근하는 것을 방지
   * public final로 되면 클래스 내부 구조를 바꾸기 힘들어진다
* 가변 컴포넌트의 직접적인 외부 접근을 막자
   * 가변 객체를 참조하는 필드가 클래스에 있다면, 참조를 획득할 수 없게 하자
   * 외부에서 전달된 객체 참조로 초기회 X
   * 접근자 메소드에서 반환 X
   * 생성자, 접근자 메소드 및 readObject 메소드에서 defensive copy을 사용
```java
// 복소수 - 이 클래스는 반올림이 정확하지 않고, NaN, 무한대를 제대로 처리하지 못한다
public final class Complex {
    private final double re;
    private final double im;

    public Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    // 대응되는 변경자 메소드가 없는 접근자 메소드
    public double realPart() {
        return re;
    }

    public double imaginaryPart() {
        return im;
    }

    public Complex add(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }

    public Complex subtract(Complex c) {
        return new Complex(re - c.re, im - c.im);
    }

    public Complex multiply(Complex c) {
        return new Complex(re * c.re - im * c.im, re * c.im + im * c.re);
    }

    public Complex divide(Complex c) {
        double tmp = c.re * c.re + c.im * c.im;
        return new Complex((re * c.re + im * c.im) / tmp, (im * c.re - re * c.im) / tmp);
    }

    @Override
    public boolean equals(Object o) {
        if(o == this)
            return true;
        if(!(o instanceof Complex))
            return false;
        Complex c = (Complex)o;

        return Double.compare(re, c.re) == 0 && Double.compare(im, c.im) == 0;
    }

    @Override
    public int hashCode() {
        int result = 17 + hashDouble(re);
        result = 31 * result + hashDouble(im);
        return result;
    }

    private int hashDouble(double val) {
        long longBits = Double.doubleToLongBits(re);
        return (int) (longBits ^ (longBits >>> 32));
    }

    @Override
    public String toString() {
        return "(" + re + " + " + im + "i)";
    }
}
```
* 연산 메소드에서 새로운 인스턴스 생성
* 대부분 immutable 클래스에서 사용
* 피연산자를 변경하지 않고 함수를 적용한 결과를 리턴 -> functional 방법
* immutablility 유지

### immutable은 thread safety므로 자유롭게 공유 가능
* immutable은 본질적으로 thread safety하여 동기화가 필요 없다
* immutable 사용은 thread safety를 위한 가장 쉬운 방법
* 기존 인스턴스를 재사용하도록 하여 장점을 최대한 이용

#### 1. 자주 사용되는 값을 상수로 제공
```java
public static final Complex ZERO = new Complex(0, 0);
public static final Complex ONE = new Complex(1, 0);
public static final Complex I = new Complex(0, 1);
```

#### 2. 자주 사용되는 인스턴스를 보관하고 재사용하는 caching을 해주는 static factory 메소드 제공
* boxed premitive, BigInteger에서 사용 중
* 메모리의 빈번한 할당, 해지를 줄이고 gc의 부담을 덜어준다
* 클래스 설계시 public 생성자 대신 static factory 채택시 유연하게 caching 추가 가능

#### 3. immutable은 자유로운 공유가 가능하므로 defensive copies를 만들 필요 없다
* 항상 원본과 같기 때문
* clone(), copy constructor를 만들어서는 안된다

#### 4. immutable은 객체의 공유는 물론이고 내부 구조들도 공유
* BigInteger.negate() - 숫자는 같고, 부호만 반대인 객체 생성
   * 동일한 원본 숫자 참조

#### 5. 다른 객체를 만들 때 사용할 수 있는 훌륭한 컴포넌트
* 객체를 구성하는 컴포넌트들이 변하지 않는다면, immutablility에 대해 걱정하지 않아도 된다 

### immutable 클래스의 단점
* 객체가 가질 수 있는 각 값마다 별개의 객체가 필요
* 비용이 많이 든다
* 매 단계마다 새로운 객체를 생성, 중간에 생성된 객체는 필요없고, 최종 결과의 객체만 필요한 다단계 연산을 수행할 때 성능상 문제가 대두

#### 해결법 1. 어떤 다단계 연산인지 알아내어 immutable 대신 기본형 데이터 타입 사용
* 매 단계마다 immutable을 생성하지 않아도 된다
* BigInteger는 package 전용의 가변 클래스 사용
   * 지수 연산 같은 다단계 연산 속도를 위해

#### 해결법 2. 어떤 다단계 연산일지 모른다면 BigInteger처럼 package 전용 가변 클래스 사용
* 그렇지 않다면 StringBuilder같이 public 가변 클래스 생성 

### immutablility을 보장하는 클래스 설계
* final 클래스
* 모든 생성자를 private로 하고, public factory 메소드 추가
```java
// public 생성자 대신 static factory를 갖는 immutable 클래스
public class Complex {
    private final double re;
    private final double im;

    private Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    public static Complex valueOf(double re, double im) {
        return new Complex(re, im);
    }
}
```
* 흔히 사용되진 않지만, 가끔 최상의 대안이 된다
* public constructor가 없어서 상속 받을 수 없다
   * final의 효과를 낸다
* static factory 메소드에 caching 기능을 추가하여 성능을 개선할 수 있다

#### 극좌표를 복소수로 생성
* 극좌표 -> 실수, 복소수 -> 실수 이므로 생성자를 사용할 수 없다
   * 기능을 잘 나타내는 이름을 가진 static factory 메소드 추가
```java
public static Complex valueofPolar(double r, double theta) {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
}
```  

#### 신뢰할 수 없는 immutable 클래스의 서브 클래스가 인자로 왔을 경우
* immutable 클래스인지 확인하고 방어적 복사
```java
public static BigInteger safeInstance(BigInteger val) {
    if(val.getClass() != BigInteger.class)
        return new BigInteger(val.toByteArray());
    return val;
}
```

#### 모든 필드가 final일 필요는 없다
* 외부에서 접근할 수 있는 메소드만 없으면 된다
* 성능상의 이유로 연산된 값을 보관하여 반환하기 위해
   * lazy initialization

### immutable 클래스에서 Serializable를 구현시, 가변 객체를 참조하는 필드를 갖고 있다면 
* readObject()나 readResolve()를 명시적으로 정의
* 또는 ObjectOutputStream.writeUnshared(), ObjectInputStream.readUnshared()를 사용
* 사용 안하면 immutable 클래스의 인스턴스를 immutable 객체로 생성할 수 있다 

### 정리
* 인스턴스가 가변적이어야할 이유가 없다면 immutable 클래스가 되야 한다
   * 작은 값을 갖는 객체는 immutable 클래스로
   * String 같이 큰 값을 갖는 객체는 immutable 클래스로 할지 고려
      * 성능이 필요할 경우 immutable 클래스에서 사용할 public 가변 클래스 구현
* immutable 클래스가 되기 어렵다면, 가능한 가변성을 제거
   * final로 하지 말아야할 이유가 없는한 모든 필드를 fianl로 만든다
* 생성자에서는 완변하게 초기화된 객체 생성
   * 재 초기화 메소드를 제공하지 말자 -> 복잡한 만큼 성능을 기대하기 어렵다
   * TimerTask -> 2가지 상태만 갖는다(실행, 중단) 



## 규칙 16. Favor composition over inheritance
> 가급적 상속보다는 컴포지션을 사용하자

* 상속은 코드를 재사용하는 강력한 방법이지만 일을 하는데 가장 좋은 도구는 아니다
* 잘못 사용하면 부실한 SW를 초래
* 안전한 상속
   * 동일 프로그래머가 같은 패키지 내에서 상속(설계를 알기 때문에)
   * 상속을 위해 특별히 설계되고 문서화된 클래스를 상속

### 메소드 호출과 달리 상속은 encapsulation 위배
* 서브 클래스는 수퍼 클래스에 의존
* 수퍼 클래스에 변화가 생기면 서브 클래스도 그에 맞춰 진화 해야 함
   * 상속을 위해 설계되고, 문서화된 경우는 예외


```java
// 상속을 잘못 사용한 예 - 수퍼 클래스에 의존도가 높다
/*
addAll(Arrays.asList("A", "B", "C")); 시 addCount=3이어야 하지만
6이 나옴
addAll()은 내부적으로 add()를 호출
addAll()을 오버라이딩 안하면, 수퍼 클래스의 addAll()에서 add()를 꼭 호출해야만 한다
-> 의존도가 높아졌다, 수퍼 클래스의 내부 구현이 바뀌지 않을거란 보장이 없기 때문에 위험
*/
public class InstrumentedHashSet<E> extends HashSet<E> {
    // 요소를 추가했던 횟수
    private int addCount = 0;

    public InstrumentedHashSet() {
    }

    public InstrumentedHashSet(int initCap, float loadFactor) {
        super(initCap, loadFactor);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);  // 내부적으로 add()를 호출
    }

    public int getAddCount() {
        return addCount;
    }
}
```
* addAll()에서 add()를 호출 한다
   * 수퍼 클래스의 add()를 구현해야 한다 - 어려운 작업
   * 다음 버전의 업데이트된 내용을 동기화하지 않아서 허약한 메소드가 될 수 있다
* 메소드를 오버라이딩 하기 때문에 위의 문제 발생
* 기존 메소드를 오버라이딩하지 않고, 추가시에만 상속하면 조금은 안전
   * 메소드 이름은 같고, 반환 타입이 다르면 잘못된 오버라이딩으로 간주하여 컴파일 에러
   * 동일한 메소드라면, 오버라이딩과는 다른 의미가 되므로 문제

### Composition
* 기존 클래스가 새 클래스의 컴포넌트화
* 새로운 클래스(서브 클래스가 될뻔
한)에 기존 클래스(수퍼 클래스가 될뻔한)의 인스턴스를 참조하는 private 필드 생성 
* 포워딩 메소드
   * 새로운 클래스에서 기존 클래스에 대응되는 메소드를 호출하여 반환
* 기존 클래스의 내부 구현에 종속되지 않는다
```java
// Wrapper 클래스(decorator pattern) - 상속 대신 컴포지션 사용
// 하나의 Set을 기능이 추가된 다른 Set으로 변환
public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;

    public InstrumentedSet(Set<E> s) {
        super(s);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}

// 재사용 가능한 포워딩 클래스
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) {
        this.s = s;
    }

    public void clear() {
        s.clear();
    }

    public boolean contains(Object o) {
        return s.contains(o);
    }

    public boolean isEmpty() {
        return s.isEmpty();
    }

    public int size() {
        return s.size();
    }

    ...
}

// usage
// Set을 구현하는 클래스라면 사용 가능
Set<Date> s = new InstrumentedSet<Date>(new TreeSet<Date>(cmp));
Set<E> s2 = new InstrumentedSet<E>(new HashSet<E>(capacity));

// 변환해서 사용 가능
static void walk(Set<Dog> dogs) {
    InstrumentedSet<Dog> iDogs = new InstrumentedSet<Dog>(dogs);
    // dogs 대신 iDigs 사용
}
```

### Composition의 단점
* 콜백이 될 수 있도록 객체 자신의 참조를 다른 객체에게 전달하는 callback framework에서의 사용은 부적합
* SELF 문제
   * wrapper 객체에 포함된 객체는 wrapper를 모르므로 자신의 참조만 다른 객체에 전달
* forwarding 메소드는 작성이 번거롭지만 각 인터페이스에 대해 1번만 작성하면 된다


### 서브 클래스가 진정한 서브 타입인 경우에만 상속을 사용하는게 좋다
* `is-a` 관계일 경우
* `모든 B객체가 진정한 A인가?` yes -> 상속, no -> Composition 고려
* 위를 위반하는 클래스 - Stack -> Vector가 아니지만 상속받았다
* Composition이 적합한 곳에 상속을 사용하면 클래스의 내부 구현이 쓸데없이 노출된다
* 수퍼 클래스를 직접 수정하여 서브 클래스의 immutablility가 저해된다

### Composition시 고려할 점
* 상속을 하려는 클래스에 API 결함은 없는가?
* 결함이 있다면 서브 클래스에 그대로 상속받을 것인가?
* 상속은 결함을 그대로 가져가는 반면, Composition은 결함을 감추는 새로운 API 설계 가능


### 정리
* 상속은 강력하지만 encapsulation을 위배하므로 문제
* 상속은 진정한 서브 타입 관계에만 적합
* 수퍼 클래스가 상속을 위해 설계된 것이 아니고, 다른 패키지에 있다면 서브 클래스를 허약하게 만들 수 있다
* 이런 상속의 문제를 피하기 위해 Composition과 forwarding 메소드를 사용
   * Wrapper 클래스를 구현하는데 적합한 인터페이스가 존재한다면 더욱 더..
   * 서브 클래스보다 Wrapper 클래스가 더 견고하기 때문



## 규칙 17. Design and document for inheritance or else prohibit it
> 상속을 위한 설계와 문서화를 하자. 그렇지 않다면 상속을 금지 시킨다

* 메소드 오버라이딩으로 인한 `파급 효과를 문서화`
* 오버라이딩 가능한 메소드가 같은 클래스의 다른 메소드를 호출하는지에 대해
* 오버라이딩 가능한 메소드를 누가 호출하는지, 어떤 순서로, 결과가 다음 처리에 어떤 영향을 주는지에 대해
* ex. java.util.AbstractCollection.remove(Object o)
* 잘된 API 문서화 규칙을 깨버리는 일
   * 상속이 encapsulation을 위반함으로써 초래된 불행

> #### 잘된 API 문서
> 무슨일(what)을 하는지 기술하고, 어떻게(how) 하는지는 설명하면 안된다

### 효율적인 서브 클래스 작성을 위해 잘 선정된 protected 메소드를 제공하여 클래스 내부의 다른 메소드와 연결
* ex. java.util.AbstractList.removeRange(int fromIndex, int toIndex)
* clear()에서 호출
   * 이 메소드를 오버라이드하면 clear()의 성능을 향상시킬 수 있다
* clear()의 성능 향상을 위해 제공된 오버라이드 가능한 메소드

### 어떤 protected 메소드를 제공해야 할까?
* protected 멤버는 클래스 내부 구현을 그렇게 하겠다는 `약속`
* 서브 클래스에게 가능한 최소화하여 제공
* 너무 적어도 상속할 수 없는 클래스가 되므로 주의
* 서브 클래스를 만들어 `상속을 위한 클래스를 테스트`
   * 3개 정도 만들어보며 테스트
   * 1개는 다른 사람이 작성
   * protected 멤버를 전혀 사용하지 않는다면 private로 수정

### 생성자에서는 오버라이딩 가능한 메소드를 호출하면 안된다
* 수퍼 클래스의 생성자는 서브 클래스 생성자보다 먼저 호출
* 서브 클래스의 생성자가 호출되기 전에 서브 클래스의 메소드가 호출되어 예상대로 동작하지 않을 수 있다
```java
public class Super {
    // 생성자에서 오버라이드 가능한 메소드 호출
    public Super() {  
        overriedMe();
    }

    public void overriedMe() {
    }
}

public final class Sub extends Super {
    private final Date date;  // 생성자에서 초기화

    Sub() {
        date = new Date();
    }

    @Override
    public void overrideMe() {
        Sustem.out.println(date);
    }

    public static void main(String[] args) {
        Sub sub = new Sub();
        sub.overrideMe();
    }
}

// result
null
yyyy.MM.dd...
```

### 상속을 위한 클래스에서 Cloneable, Serializable 구현하기
* clone(), readObject()가 생성자와 흡사하게 동작하므로 `생성자와 유사한 규칙이 적용`된다는 것에 유의
* clone(), readObject()에서 `오버라이딩 가능한 메소드를 호출 X`
   * readObject() - deserialized되기 전에 오버라이딩 메소드 호출
   * clone() - 서브 클래스의 clone()에서 복제된 객체의 상태를 결정하기 전에 오버라이딩 메소드 호출
   * 정상적인 결과를 바라기 어렵다
* Serializable 구현시 readResolve(), writeReplace()를 가지고 있다면 private이 아닌 protected로 한다
   * 서브 클래스에서 사용할 수 있도록

### 서브 클래스를 안전하게 만들 수 있도록 설계나 문서화되지 않은 클래스의 상속 금지
* 상속을 위해 클래스를 설계하다보면 많은 제약이 생기므로 이런 문제를 해결
* 상속을 금지하는 법
   * final 클래스
   * 모든 생성자를 private, package로 하고, public static factory 메소드 추가

### 상속 가능한 클래스에서 어떤 오버라이딩 가능한 메소드를 호출하지 않도록하고 문서화

#### 1. 자체 사용(self-use) 제거
* 서브 클래스가 안전한 클래스를 생성하게 된다
* 메소드 오버라이딩은 다른 메소드에 영향을 주지 않는다

#### 2. private hepler 메소드 생성
* 오버라이딩 가능한 메소드의 body를 private helper 메소드로 옮기고, 오버라이딩 가능한 메소드에서 호출
* 오버라이딩 가능한 메소드를 호출하는 메소드에서 helper 메소드를 호출하도록 수정



## 규칙 18. Prefer interfaces to abstract classes
> 추상 클래스보다는 인터페이스를 사용하자

### interface와 abstract class의 차이
* abstract class는 구현된 메소드를 포함할 수 있는 반면 interface는 그렇지 못하다
   * Java8의 interface default 메소드로 깨짐
* abstract class를 구현하는 클래스는 반드시 abstract class의 서브클래스가 된다
* interface 구현은 상속과는 무관
* 단일 상속만 지원하므로 abstract class로 타입을 정의할 때는 제약이 많다
   * 2개의 클래스에서 상속하고자 하면 한단계 끌어올려 두 클래스의 조상이 되도록해야 한다
* 기존 클래스들은 새로운 interface를 구현하기 위해 쉽게 변경될 수 있다
   * implements하고 메소드를 구현하면 된다
* interface는 mixin을 정의하는데 이상적
   * mixin 
      * 자신의 본래 타입에 `추가하여 구현할 수 있는 타입`
      * 선택 가능한 기능 제공
      * 제공 받고자 하는 클래스에서 선언
      * ex. Comparable

### interface는 비계층적인 타입 프레임워크를 구축할 수 있게 해준다
```java
public interface Singer {
    AudioClip sing(Song s);
}

public interface Songwriter {
    Song compose(boolean hit);
}

// 2개의 interface를 상속하고 추가 메소드 정의
public interface SingerSongwriter extends Singer, Songwriter {
    AudioClip strum();
    void actSensitive();
}
```
* 지원되는 모든 조합의 속성들을 위해 클래스 하나를 포함하는 팽창된(bloated) 클래스
   * 속성이 n개라면, 조합의 수는 2^n -> combinatorial explosion
   * 메소드 인자의 타입만 다른 수많은 메소드를 갖는 bloated class 초래
   * 공통적인 행동을 담고 있는 타입이 없기 때문


### interface는 안전하고 강력한 기능 향상을 가능하게 해준다
* abstract class를 사용하면 기능 추가를 위해 상속을 사용 
   * 문제가 생길 수 있다
* 외부에 공개한 중요한 interface와 연관시킨 skeletal implementation abstract class를 제공하여 interface와 abstract class의 장점을 결합
   * AbstractXX.class - AbstractList, AbstractSet...
   * interface를 구현하기 쉬워진다
   * interface를 구현하는 클래스의 private 클래스로 메소드 호출 전달 가능
      * 골격 구현 클래스를 상속한 서브 클래스로 정의
      * `simulated multiple inheritance`
```java
// skeletal implementation abstract class를 이용한 List interface 구현
static List<Integer> intArrayAsList(final int[] a) {
    if(a == null) 
        throw new NullPointerException();
    
    // Adapter pattern
    // 익명 클래스
    return new AbstractList<Integer>() {
        public Integer get(int i) {
            return a[i];  // auto boxing
        }

        @Override
        public Integer set(int i, Integer val) {
            int oldVal = a[i];
            a[i] = val;  // auto unboxing
            return oldVal;  // auto boxing
        }

        public int size() {
            return a.length;
        }
    };
}
```

### skeletal implementation abstract class 만들기
* 대상이 되는 interface를 파악하여 `구현할 메소드`와 `그대로 둘 메소드` 결정
* 그대로 둘 메소드 - 골격 구현 클래스의 abstract 메소드
* 그대로 둘 메소드를 제외하고 나머지 메소드 구현
* 상속을 위해 설계되었으므로, `상속 설계 지침`과 `문서화` 필요
```java
// example
public abstract class AbstractMapEntry<K, V> implements Map.Entry<K, V> {
    // 기본 메소드
    public abstract K getKey();
    public abstract V getValue();

    // 수정가능한 Map의 요소들은 이 메소드를 반드시 오버라이딩
    public V setValue(V value) {
        throw new UnsupportedOperationException();
    }

    // Map.Entry.equals에 general contract 구현
    @Override
    public boolean equals(Object o) {
        if(o == this) 
            return true;
        if(! (o instanceof Map.Entry))
            return false;
        Map.Entry<?, ?> arg = (Map.Entry)o;
        return equals(getKey(), arg.getKey()) && equals(getValue(), arg.getValue());
    }

    private static boolean equals(Object o1, Object o2) {
        return o1 == null ? o2 == null : o1.equals(o2);
    }

    @Override
    public int hashCode() {
        return hashCode(getKey()) ^ hashCode(getValue());
    }

    public static int hashCode(Object obj) {
        return obj == null ? 0 : obj.hashCode();
    }
}
```

### simple implementation class
* skeletal implementation abstract class의 변이
* AbstractMap.SimpleEntry
* 같은점 - 인터페이스를 구현하고, 상속을 위해 설계됨
* 다른점 - abstract class가 아니다
   * 그대로 사용하거나, 상속하여 사용

### 다수의 구현체를 허용하는 타입 정의시 abstract class의 장점
* interface보다는 abstract class를 진화시키는게 훨씬 더 쉽다
* interface에 메소드 추가는 모든 구현 클래스에 영향이 간다
* interface는 신중하게 설계
   * interface가 `배포되면 변경이 거의 불가능` 
   * 여러 프로그래머들이 그 interface를 구현하도록하여 많은 결함을 발견하여 수정

### 정리
* interface는 많은 class에서 구현하는 타입을 정의하는 가장 좋은 방법
* 진화의 용이성이 더 중요한 경우는 예외
   * abstract class 이용
* interface는 신중하게 설계 후 구현 클래스를 많이 만들어 철저하게 테스트 
* skeletal implementation abstract class 제공을 고려



## 규칙 19. Use interfaces only to define types
> 타입을 정의할 때만 인터페이스를 사용하자

* interface는 클래스의 인스턴스를 참조하는데 사용될 수 있는 `type` 역할
* 클래스의 인스턴스로 `할 수 있는 일`을 나타내야 한다

### constant interface
* 메소드를 가지지 않고 외부에 제공하는 static final 상수 필드로만 구성
* interface를 형편없이 사용하는 패턴 - antipattern
* 상수는 상세 구현이지만 외부로 공개된다
   * 클라이언트에 디펜던시가 생겨 수정이 어렵다
```java
// example
public interface PhysicalConstants {
    static final double AVOGADROS_NUMBER = 6.02214199e23;
    static final double BOLTZMANN_CONSTANT = 1.3806503e-23;
    static final double ELECTRON_MASS = 9.10938188e-31;
}
```

### 상수를 외부에 제공하는 방법
1. 클래스, interface와 밀접한 연관이 있다면 해당 클래스, interface에 추가
   * Integer, Double의 MIN_VALUE, MAX_VALUE
2. 열거 타입의 멤버라면 enum 사용
3. 인스턴스를 생성할 수 없는 유틸리티 클래스
```java
// 상수 유틸리티 클래스
public class PhysicalConstants {
    private PhysicalConstants() {}  // 인스턴스 생성 방지

    public final double AVOGADROS_NUMBER = 6.02214199e23;
    public final double BOLTZMANN_CONSTANT = 1.3806503e-23;
    public final double ELECTRON_MASS = 9.10938188e-31;
}

// usage
PhysicalConstants.AVOGADROS_NUMBER;
```

### 정리
* interface는 타입을 정의할 때만 사용
* 상수를 외부에 공개하기 위해 사용하면 안된다



## 규칙 20. Prefer class hierachies to tagged classes
> tagged 클래스 보다는 클래스 계층을 사용하자

### 특성을 나타내는 tag 필드를 갖는 클래스
* 인스턴스들이 2개 이상의 특성으로 분류
```java
class Figure {
    enum Shape {
        RECTANGLE, CIRCLE
    };

    final Shape shape;

    // rectangle일 때만
    double length;
    double width;

    // circle일 떄만
    double radis;

    Figure(double radis) {
        shape = Shape.CIRCLE;
        this.radis = radis;
    }

    Figure(double length, double width) {
        shape = Shape.RECTANGLE;
        this.length = length;
        this.width = width;
    }

    double area() {
        switch(shape) {
            case RECTANGLE:
                return length * width;
            case CIRCLE:
                return Math.PI * (radius * radius);
            default:
                throw new AssertionError();
        }
    }
}
```
#### 단점
* enum 선언
* tag 필드
* switch
* 다양한 구현체들이 하나의 클래스에 뒤범벅
   * 가독성 저하
   * 쓸모없는 필드의 메모리 할당, 해지 증가
   * 여러 생성자가 필드를 초기화하므로 final로 만들 수 없다
* tag 클래스는 코드가 쓸데없이 장황하고, 에러가 나기 쉬우며, 비효율적
* 컴파일러가 잘못된 인스턴스 생성을 알 수 없다

### 개선 - 서브 클래스
* tag 값에 따라 동작이 달라지는 메소드를 추상메소드화하여 abstract class 구현
* 모든 인스턴스가 사용하는 필드로 abstract class에 넣는다
```java
abstract class Figure {
    abstract double area();
}

class Circle extends Figure {
    final double radius;

    Circle(double radius) {
        this.radius = radius;
    }

    double area() {
        return Math.PI * (radius * radius);
    }
}

class Rectangle extends Figure {
    final double length;
    final double width;

    Circle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    double area() {
        return length * width;
    }
}
```
* tag 클래스의 모든 단점 해소
* 각 클래스는 부적절한 데이터를 가지지 않는다
* 모든 필드는 final
   * 생성자가 필드를 초기화하는지 컴파일러가 검사
* switch문을 빠뜨려서 runtime error발생 가능성 배제
* 자연적인 계층관계 반영
```java
class Square extends Rectangle {
    Square(double side) {
        super(side, side);
    }
}
```

### 정리
* tag 클래스는 적합하지 않다
* 기존 클래스가 태그 클래스라면 상속을 이용하여 재구성할 수 있는지 고려



## 규칙 21. Use function objects to represent strategies
> 전략을 표현할 때 함수 객체를 사용하자

* function pointer, delegate, lambda expression 등으로 특정 `함수의 호출을 저장하거나 전달` 할 수 있다
* 어떤 함수를 호출할 때 호출된 함수에서 사용할 부속 함수를 전달하여 함수 호출자가 자신의 행동을 특화 시킬 수 있도록 하기 위해 사용
   * ex. C언어의 qsort()
   * 정렬 순서는 comparator()를 함수 포인터로 전달함으로써 이루어진다 - `Strategy parrern`
   * Java는 객체 참조를 사용하여 구현


### 문자열 비교를 위한 concrete strategy
```java
// StringLengthComparator의 참조가 comparator에 대한 함수 포인터 역할
class StringLengthComparator {

    // comparator
    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
}
```

### 전형적인 concrete strategy class인 StringLengthComparator는 stateless
* 모든 인스턴스는 기능적으로 동일
* 불필요한 `객체 생성 비용 절감`을 위해 `singleton`으로 구현
```java
class StringLengthComparator {
    private StringLengthComparator() {}

    public static final StringLengthComparator INSTANCE = new StringLengthComparator();

    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
}
```

### StringLengthComparator 인스턴스를 메소드에 전달하려면 적절한 타입의 매개변수 필요
* 클라이언트가 다른 비교 strategy를 전달할 수 있도록 interface를 정의
```java
// strategy interface
// generic으로 String이 아닌것도 사용 가능
public interface Comparator<T> {
    public int compare(T t1, T t2);
}

class StringLengthComparator implements Comparator<String> {
    ...
}
```

### concrete strategy class는 anonymous class를 사용하기도 한다
```java
Arrays.sort(stringArray, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
});
```
* 메소드가 호출되어 실행될 때마다 새로운 anonymous class 인스턴스 생성
   * 자주 호출되면 `private static final 필드에 참조를 저장`하여 `재사용을 고려`
   * 필드명으로 `함수 객체를 잘 나타낼 수 있다`

```java
class Host {
    // strategy interface가 모든 strategy class의 타입 역할을하므로 concrete strategy class는 public으로 만들 필요가 없다 
    private static class StrLenCmp implements Comparator<String>, Serializable {
        public int compare(String s1, String s2) {
            return s1.length() - s2.length();
        }
    }

    // host 클래스가 외부에 제공하도록 할 수 있다
    public static final Comparator<String> STRING_LENGTH_COMPARATOR = new StrLenCmp();
}
```

### 정리
* 함수 포인터의 주 용도는 `strategy pattren`을 구현하는 것
* Java에서는 strategy를 나타내는 interface를 정의하고, interface를 구현하는 concrete strategy를 정의
* concrete strategy가 단 1번만 사용될 때는 `anonymous class`로 생성
* 반복적으로 사용된다면 private static 멤버 클래스로 구현 후 interface로 public static final 필드를 사용해 외부에 제공



## 규칙 22. Favor static member classes over nonstatic
> static 멤버 클래스를 많이 사용하자

### nested class
* 다른 클래스 `내부에 정의된 클래스`
* `enclosing(외곽) class를 지원`하는 목적으로만 존재해야 한다
* 다른 클래스에서도 사용된다면 최상위 클래스로 분리
* 종류
   * static member class
   * non static member class
   * anonymous class
   * local class
   * 위 4가지를 innner class라 한다

### static member class
* 다른 클래스의 내부에 선언되어 있고 enclosing class의 모든 멤버들을 사용할 수 있는 일반 클래스
* 자신의 enclosing class의 static 멤버
* enclosing class로부터 독립적으로 존재할 수 있다
* public helper class로도 사용
   * enclosing class와 함께 사용할 때만 유용

### non static member class
* enclosing class와 연관
* Adapter pattren을 구현할 때 사용하기도 함
* enclosing class가 멤버 클래스와 관계 없는 것처럼 보이게 할 수 있다
   * ex. Map에서 non static 멤버를 사용해 collection view 구현
   * ex. Set, List 등에서 non static 멤버를 사용해 iterator 구현
```java
public class MySet<E> extends AbstractSet<E> {

    public Iterator<E> iterator() {
        return new MyIterator();
    }

    private class MyIterator implements Iterator<E> {
        ...
    }
}
```

#### enclosing class의 인스턴스를 사용할 필요가 없는 멤버 클래스를 선언한다면, 항상 static 멤버 클래스로 만들자
* static을 생략하면 인스턴스가 enclosing class의 참조를 갖게 된다
   * 참조의 저장에 시간, 메모리 소모
* GC의 대상이 될 enclosing class가 메모리에 남아있게 된다
* enclosing class의 인스턴스 없이 `메모리에 할당할 수 없다`

#### private static 멤버 클래스
* 자신의 enclosing class가 나타내는 객체의 컴포넌트들을 표현하는데 주로 사용
* ex. Map
   * key, value마다 Entry 객체를 갖는다
   * Map과 연관되어 있지만, getKey(), getValue(), setValue() 등은 Map을 사용할 필요가 없다
   * 이런 경우 non static는 낭비 -> 불필요한 Map의 참조를 갖게되어 리소스 낭비
* 외부에 제공되는 클래스의 public, protected 멤버라면 static, non static 선택이 중요
   * 멤버 클래스가 외부 API가 되므로 호환성을 유지하려면 non static을 static로 변경할 수 없다

### anonymous class
* 이름이 없다
* enclosing class의 멤버가 아니다
* 다른 멤버와 함께 선언되지 않고, `사용시점에 선언과 인스턴스 생성`이 동시에 이루어진다
* non static일 때만 enclosing class의 인스턴스를 갖는다
* static 멤버를 가질 수 없다(static 이더라도)
```java
// static일 필요는 없다
public static BulkOperations bulkOperations() {
    // anonymous class 
    return new BulkOperations() {

        private int count;
        private static int num;  // impossible

        @Override
        public void bulkPersist(List entities) {

        }
    };
}
```

#### anonymous class의 제약
* 선언된 곳에서만 인스턴스 생성 가능
* instanceof로 타입 검사 불가
* 이름이 필요한 곳에 사용 불가
* 여러개의 interface를 구현할 수 없다
* 가급적 코드가 짧아야 가독성이 좋다
* `funcation object` 생성에 많이 사용
   * Comparator, Runnable, Thread, TimerTask 등
* static factory 메소드 내부에서도 사용
   * 규칙 18의 `intArrayAsList()`


### local class
* 위의 클래스 중 가장 적게 사용된다
* 지역 변수가 선언될 수 있는 곳이면 어디든 선언 가능
* 지역 변수와 동일한 scope
* 이름을 가질 수 있어 재사용 가능
* static이 아닐 때 anonymous class처럼 enclosing class의 인스턴스를 가지고, static 멤버를 가질 수 없다
* 가급적 코드가 짧아야 가독성이 좋다
```java
public BulkOperations bulkOperations() {
 
    class BulkOperationExtendsion implements BulkOperations {

        @Override
        public void bulkPersist(List entities) {
            ...
        }
    }

    // 재사용 가능
    BulkOperationExtendsion bulk1 = new BulkOperationExtendsion();
    BulkOperationExtendsion bulk2 = new BulkOperationExtendsion();

    return bulk1;
}
```

### 정리
* nested class에는 static member class, on static member class, anonymous class, local class가 있고, 각각의 용도가 있다
* nested class가 메소드 외부에서 접근할 필요가 있거나, 코드가 너무 길어 메소드 내부에 두기 적합하지 않다면 멤버 클래스를 사용
* 멤버 클래스가 enclosing class의 참조가 필요가 없을 경우 static member class
* 아니면 non static member class
* 메소드 내부에 있다는 가정하에 한곳에서만 사용하고, 해당 클래스의 타입이 존재할 경우 anonymous class로, 아니면 local class


