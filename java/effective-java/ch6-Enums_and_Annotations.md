# Ch6. Enums and Annotations
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> Java 1.5에서 추가된 enum과 annotation을 활용하는 최선책을 정리해보자

## 규칙 30. Use enums insted of int constants(int 상수대신 enum을 사용하라)

* int enum 패턴
```java
public static final int APPLE_PUJI = 0;
public static final int APPLE_PIPPIN = 1;

public static final int ORANGE_PUJI = 0;
public static final int ORANGE_BLOOD = 1;
```

* 컴파일 시점에 `type 안전성`을 제공하지 못한다
   * 실질적으로는 int라서 잘못된 값이 들어가도 컴파일러는 인식하지 못한다
* 같은 이름의 상수가 존재할 수 없다
   * name space를 제공하지 않아서
* 문자열로 변환하기 쉽지 않다
   * 실제로는 숫자라서 출력해도 별 의미가 없다

### enum
* 실절적으로 final로 선언된 것이나 마찬가지
   * 클라이언트가 접근할 수 있는 생성자가 없기 때문

* enum 상수이외의 객체는 사용할 수 없다
   * 새로운 객체를 생성하거나, 상속을 통해 확장할 수 없기 때문

* int enum 패턴과는 다르게 컴파일 시점의 형 안전성 제공

* 같은 이름의 상수가 존재할 수 있도록한다

* toString()으로 문자열 변환도 쉽다

* 메소드, 필드 추가 가능
   * 상수 묶음에서 출발해 점차 완전한 기능을 갖춘 추상화 단위로 진화할 수 있다

* 일반적으로 유용하게 쓰일 enum은 top-level public 클래스로 선언

* 특정한 top-level 클래스에만 사용된다면 멤버 클래스로 선언

### example
```java
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS(4.869e+24, 6.052e6),
    EARTH(5.975e+24, 6.378e6);

    // enum에 데이터를 넣기 위해 필드 선언
    // enum은 변경 불가능하므로 final로 선언
    private final double mass;
    private final double radius;
    private final double surfaceGravity;

    // 중력상수(m^3 / kg s^2)
    private static final double G = 6.67300E-11;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        this.surfaceGravity = G * mass / (radius * radius);
    }

    public double getMass() {
        return mass;
    }

    public double getRadius() {
        return radius;
    }

    public double getSurfaceGravity() {
        return surfaceGravity;
    }

    public double surfaceWeight(double mass) {
        return mass * surfaceGravity;  // F=ma
    }
}

public class Test {
  public static void main(String[] args) {
    for (Planet p : Planet.values()) {  // enum 순환
      System.out.println(p);
    }
  }
}
```

### 상수들이 제각기 다른방식으로 동작해야할 경우
* enum상수에 따라 분기하는 switch문 사용
```java
public enum  Operation {
    PLUS,
    MINUS,
    TIMES,
    DIVIDE;

    double apply(double x, double y){
        switch (this){
            case PLUS:
                return x + y;
            case MINUS:
                return x-y;
            case TIMES:
                return x * y;
            case DIVIDE:
                return x/y;
        }
        throw new AssertionError("Unknow op : " + this);
    }
}
```

#### 문제점
* throw 없이 컴파일되지 않는다
* 깨지기 쉬운 코드
   * enum 상수 추가시 switch에 case를 추가하지 않아도 컴파일된다

#### 더 나은 방법 - constant-specific method implementation(상수별 메소드 구현)
* `abstract method`를 선언하고, 각 상수별로 구현하는 것
```java
// 상수별로 메소드를 가지는 enum
public enum Operation {
    PLUS {
        @Override
        double apply(double x, double y) {
            return x + y;
        }
    },
    MINUS {
        @Override
        double apply(double x, double y) {
            return x - y;
        }
    },
    TIMES {
        @Override
        double apply(double x, double y) {
            return x * y;
        }
    },
    DIVIDE {
        @Override
        double apply(double x, double y) {
            return x / y;
        }
    };

    abstract double apply(double x, double y);
}
```
* 새로운 상수 추가시 apply()의 구현을 잊을 가능성이 없다

#### 상수별 메소드 구현을 데이터와 같이 사용
```java
// 상수별로 데이터와 메소드를 가지는 enum
public enum Operation {
    PLUS("+") {
        @Override
        double apply(double x, double y) {
            return x + y;
        }
    },
    MINUS("-") {
        @Override
        double apply(double x, double y) {
            return x - y;
        }
    },
    TIMES("*") {
        @Override
        double apply(double x, double y) {
            return x * y;
        }
    },
    DIVIDE("/") {
        @Override
        double apply(double x, double y) {
            return x / y;
        }
    };

    private final String symbol;

    Operation(String symbol) {
        this.symbol = symbol;
    }

    @Override
    public String toString() {
        return symbol;
    }

    abstract double apply(double x, double y);
}

public class Main {

    public static void main(String[] args) {
        double x = 3.0;
        double y = 4.0;
        for (Operation op : Operation.values()) {
            System.out.printf("%f %s %f = %f \n", x, op, y, op.apply(x, y));
        }
    }
}
/*
3.000000 + 4.000000 = 7.000000 
3.000000 - 4.000000 = -1.000000 
3.000000 * 4.000000 = 12.000000 
3.000000 / 4.000000 = 0.750000 
*/
```

#### toString으로 뱉어낸 문자열을 다시 enum 상수로 변환할 경우
```java
    private static final Map<String, Operation> stringToEnum = new HashMap<>();

    static {  // 상수 이름을 실제 상수로 대응시키는 map 초기화
        for(Operation op : values()){
            stringToEnum.put(op.toString(), op);
        }
    }
    
    public static Operation fromString(String symbol){
        return stringToEnum.get(symbol);
    }
```

#### 상수별 메소드의 단점
* enum 상수끼리 공유하는 코드를 만들기 어렵다
* ex. 급여 명세서에 찍히는 요일을 표현하는 enum. 시급과 요일에 일한 시간을 인자로 주면 해당 요일의 급여(초과근무 수당 포함)를 계산하는 메소드가 있다. 
```java
public enum PayrollDay {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY;

    private static final int HOURS_PER_SHIFT = 8;

    double pay(double hoursWorked, double payRate) {
        double basePay = hoursWorked * payRate;

        double overtimePay;  // 초과근무 수당 계산
        switch (this) {
            case SATURDAY:
            case SUNDAY:
                overtimePay = hoursWorked * payRate / 2;
                break;
            default:  // Weekdays
                overtimePay = hoursWorked <= HOURS_PER_SHIFT ? 0 : (hoursWorked - HOURS_PER_SHIFT) * payRate / 2;
        }
        return basePay + overtimePay;
    }
}
```
* 간결하지만 유지보수 관점에선 위험한 코드
   * 새로운 상수를 추가할 경우 case를 추가하는 것을 잊는다면...?
* 상수별 메소드를 구현한다면?
   * 초과 근무 수당을 계산하는 부분이 중복
   * 주중, 주말 급여를 계산하는 별도의 메소드를 구현하여 각 상수에서 호출
   * 식상한 코드들이 중복된다

### 더 나은 방법 - 전략 enum 패턴
* 상수 추가시 정책을 선택하도록 한다

* 초과근무 수당 계산을 정책 enum에 위임
   * switch, 상수별 메소드 구현을 없앨수 있다
* switch를 사용한 코드보다는 복잡하지만 안전하고, 유연성이 높다

```java
public enum PayrollDay {
    MONDAY(PayType.WEEKDAY),
    TUESDAY(PayType.WEEKDAY),
    WEDNESDAY(PayType.WEEKDAY),
    THURSDAY(PayType.WEEKDAY),
    FRIDAY(PayType.WEEKDAY),
    SATURDAY(PayType.WEEKEND),
    SUNDAY(PayType.WEEKEND);

    private final PayType payType;

    PayrollDay(PayType payType) {
        this.payType = payType;
    }

    double pay(double hoursWorked, double payRate) {
        return payType.pay(hoursWorked, payRate);
    }

    // 정책 enum 자료형
    private enum PayType {
        WEEKDAY {
            @Override
            double overtimePay(double hours, double payRate) {
                return hours <= HOURS_PER_SHIFT ? 0 : (hours - HOURS_PER_SHIFT) * payRate / 2;
            }
        },
        WEEKEND {
            @Override
            double overtimePay(double hours, double payRate) {
                return hours * payRate / 2;
            }
        };

        private static final int HOURS_PER_SHIFT = 8;

        abstract double overtimePay(double hours, double payRate);

        double pay(double hoursWorked, double payRate) {
            double basePay = hoursWorked * payRate;
            return basePay + overtimePay(hoursWorked, payRate);
        }
    }
}
```

### enum에서 switch는 어디에 적합한가?
* 외부 enum 상수별로 달리 동작하는 코드를 만들어야 할 경우
```java
// 기존 enum에 없는 메소드를 switch로 구현한 사례
public static Operation inverse(Operation op) {
  switch (op) {
    case PLUS:
      return Operation.MINUS;
    case MINUS:
      return Operation.PLUS;
    case TIMES:
      return Operation.DIVIDE;
    case DIVIDE:
      return Operation.TIMES;
    default:
      throw new AssertionError("Unknown op : " + op);
  }
}
```

### enum을 언제 사용해야할까?
* 일반적으로 enum은 int 상수와 성능면에서 비등
* 자료형을 메모리에 올리고 초기화하는 공간적/시간적 비용 때문에 약간 손해
* 고정된 상수 집합이 필요할 경우
* 컴파일 시점에 모든 가능한 값의 목록을 알 수 있는 집합
   * 메뉴판의 메뉴, 연산자 종류, 명령줄 플래그


### 정리
* enum은 int 상수보다 `가독성이 높고`, `안전하며`, `더 강력`
* 데이터, 데이터에 관련된 메소드를 추가해서 기능을 향상시킬 수 있다
* 상수별로 다르게 동작해야하는 enum의 경우
   * switch 대신 `상수별 메소드 구현`
* 여러 enum상수가 공통 기능을 이용해야 하는 경우
   * 정책 enum 패턴 사용 고려


## 규칙 31. Use instance fields insted of ordinals(ordinal 대신 객체 필드를 사용하라)

* enum 상수는 자연스레 int값 하나에 대응

### `ordinal()`를 통해 대응되는 정수값을 구하면 편리하지 않을까?
```java
public enum Ensemble {
    SOLO, DUET, TRIO, QUARET;

    public int numberOfMusicians() {
        return ordinal() + 1;
    }
}
```

* 유지보수 관점에서 보면 끔찍한 코드
* 이미 사용한 정수값에 대응되는 상수 추가 불가
* 11을 추가하고 싶을 경우, 현재 10까지 대응되는 상수가 없어서 불가

### enum 상수에 연계되는 값은 ordinal 사용해 표현하지말고, 객체 필드에 저장해라
```java
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3), QUARET(4);

    private final int numberOfMusicians;

    Ensemble(int size) {
        this.numberOfMusicians = size;
    }

    public int getNumberOfMusicians() {
        return numberOfMusicians;
    }
}
```

> ordinal()은 EnumSet, EnumMap처럼 일반적인 용도의 enum기반 자료구조를 만들 경우 사용


## 규칙 32. Use EnumSet instead of bit fields(bit field 대신 EnumSet을 사용하라)

### 열거 자료형 원소들이 주로 집합에 사용될 경우
#### int enum 패턴 사용
```java
public class Text {

    public static final int STYLE_BOLD = 1 << 0;  // 1
    public static final int STYLE_ITALIC = 1 << 1;  // 2
    public static final int STYLE_UNDERLINE = 1 << 2;  // 4
    public static final int STYLE_STRIKETHROUGH = 1 << 3;  // 8

    /**
     * @param styles STYLE_상수를 비트별 OR 한 값이거나 0
     */
    public void applyStyles(int styles) {
        ...
    }
}
```
* bitwise arithmetic(비트 단위 산술 연산)을 통해 합집합, 교집합 등의 집합 연산도 효율젹
* int enum 패턴과 동일한 단점을 가진다
   * bit field를 출력한 결과는 int enum 패턴보다 이해하기 어렵다
   * 모든 요소를 순차적으로 살펴보기도 어렵다

#### 더 나은 방법 : java.util.EnumSet 사용
```java
public class Text {
    public enum Style{
        BOLD, ITALIC, UNDERLINE, STRIKETHROUGH
    }

    public void applyStyles(Set<Style> styles){
        ...
    }   
}

// usage
text.applyStyles(EnumSet.of(Text.Style.BOLD, Text.Style.ITALIC));
```
* enum으로 구성된 집합을 효율적으로 표현할 수 있다
* Set Interface 구현
   * Set의 풍부한 기능 제공
   * 타입 안전성 제공
   * Set과 같은 수준의 interoperability(상호운용성)도 제공
* 내부적으로는 `bit vector` 사용
   * bit field에 필적하는 성능
* bit field를 직접 조작할 때 생기는 어려움을 해결해준다
* 단점
   * immutable EnumSet 객체를 만들 수 없다

### 정리
* 열거 자료형을 집합에 사용해야 한다고 해서 bit field로 표현하면 곤란하다
* EnumSet을 활용하자


## 규칙 33. Use EnumMap instead of ordinal indexing(ordinal을 배열 첨자로 사용하는 대신 EnumMap을 이용하라)
```java
// 요리용 허브를 표현하는 클래스
public class Herb {

    public enum Type {
        ANNUAL, PERENNIAL, BIENNIAL
    }

    final String name;
    final Type type;

    public Herb(String name, Type type) {
        this.name = name;
        this.type = type;
    }

    @Override
    public String toString() {
        return name;
    }
}
```

### 허브를 품종별로 나열할 경우

#### ordinal을 index로 사용
```java
Herb[] garden = ...;

Set<Herb>[] herbsByType = (Set<Herb>[]) new Set[Herb.Type.values().length];

for(int i=0; i<herbsByType.length; i++){
    herbsByType[i] = new HashSet<>();

    for(Herb h : garden){
        herbsByType[h.type.ordinal()].add(h);
    }
}
```
#### 문제점
* 배열은 제네릭과 호환되지 않는다
   * 무점검 형변환 필요, 깔끔하게 컴파일되지 않는다
* 배열 원소를 참조할 때 정확한 int값을 사용해야한다
   * 오동작의 원인
   * ArrayIndexOutOfBoundsException 발생

#### 더 나은 방법 : EnumMap 사용
```java
Map<Herb.Type, Set<Herb>> herbsByType = new EnumMap<>(Herb.Type.class);
        
for(Herb.Type t : Herb.Type.values()){
    herbsByType.put(t, new HashSet<>());
            
    for(Herb h : garden){
        herbsByType.get(h.type).add(h);
    }
}
```
* 무점검 형변환이 없다
* index 때문에 오류도 나지 않는다

> EnumMap 생성자는 key의 자료형을 나타내는 Class 객체를 인자로 받는다  
> 이런 Class 객체를 bounded type token(한정적 자료형 토큰)이라 부르는데,  
> 실행시점 제네릭 자료형 정보(runtime generic type informatio)를 제공한다


### phase transition(상전이) 관계를 표현할 경우
* phase transition
   * 액체 -> 고체 = 언다
   * 액체 -> 기체 = 끓는다

#### ordinal을 index로 사용
```java
public enum Phase {
    SOLID, LIQUID, GAS;

    public enum Transition {
        MELT, FREEZE, BOIL, CONDENSE, SUBLIME, DEPOSIT;
        
        private static final Transition[][] TRANSITIONS = {
                {null, MELT, SUBLIME},
                {FREEZE, null, BOIL},
                {DEPOSIT, CONDENSE, null}
        };

        // 특정 상전이 과정을 표현하는 enum 반환
        public static Transition from(Phase src, Phase dest){
            return TRANSITIONS[src.ordinal()][dest.ordinal()];
        }

    }
}
```
* ArrayIndexOutOfBoundsException
* NullPointerException
* 상태가 늘어나면 상전이 테이블의 크기가 증가

#### 더 나은 방법 : EnumMap 사용
```java
public enum Phase {
    SOLID, LIQUID, GAS;

    public enum Transition {
        MELT(SOLID, LIQUID),
        FREEZE(LIQUID, SOLID),
        BOIL(LIQUID, GAS),
        CONDENSE(GAS, LIQUID),
        SUBLIME(SOLID, GAS),
        DEPOSIT(GAS, SOLID);

        private final Phase src;
        private final Phase dest;

        Transition(Phase src, Phase dest) {
            this.src = src;
            this.dest = dest;
        }

        // 상전이 맵 초기화
        private static final Map<Phase, Map<Phase, Transition>> m = new EnumMap<>(Phase.class);

        static {
            for (Phase p : Phase.values()){
                m.put(p, new EnumMap<>(Phase.class));

                for(Transition trans : Transition.values()){
                    m.get(trans.src).put(trans.dest, trans);
                }
            }
        }

        public static Transition from(Phase src, Phase dest){
            return m.get(src).get(dest);
        }
    }
}
```


### 정리
* ordinal 값을 배열 첨자로 사용하는 것은 적절하지 않다
* EnumMap을 활용하자
   * 관계가 다차원적이라면, EnumMap<..., EnumMap<...>>과 같이 표현



## 규칙 34. Emulate extensible enums with interfaces(확장 가능한 enum을 만들어야 한다면 인터페이스를 이용하라)
* enum 자료형은 final 이라서 상속할 수 없다
   * 상속 가능해도, 상수들이 상속되는 것은 바람직하지 않다
* enum 자료형을 확장하면 좋을 경우
   * 연산 코드를 만들어야 할 때

### interface를 이용
```java
public interface Operation {
    double apply(double x, double y);
}

public enum BasicOperation implements Operation {
    PLUS("+") {
        @Override
        public double apply(double x, double y) {
            return x + y;
        }
    },
    MINUS("-") {
        @Override
        public double apply(double x, double y) {
            return x - y;
        }
    },
    TIMES("*") {
        @Override
        public double apply(double x, double y) {
            return x * y;
        }
    },
    DIVIDE("/") {
        @Override
        public double apply(double x, double y) {
            return x / y;
        }
    };

    private final String symbol;

    BasicOperation(String symbol) {
        this.symbol = symbol;
    }
}
```
* BasicOperation은 enum 자료형이라 상속할 수 없지만, Operation은 interface라 확장 가능
```java
public enum ExtendedOperation implements Operation {
    EXP("^") {
        @Override
        public double apply(double x, double y) {
            return Math.pow(x, y);
        }
    },
    REMINDER("%") {
        @Override
        public double apply(double x, double y) {
            return x % y;
        }
    };

    private final String symbol;

    ExtendedOperation(String symbol) {
        this.symbol = symbol;
    }
}

// usage
public static void main(String[] args) {
    double x = 1.0;
    double y = 2.0;

    test(ExtendedOperation.class, x, y);
    test(Arrays.asList(ExtendedOperation.values()), x, y);
}
    
// 1. 한정적 자료형 토큰
// <T extends Enum<T> & Operation> -> Class 객체가 나타내는 자료형이 enum인 동시에 Operation의 하위 자료형이 되도록 한다
private static <T extends Enum<T> & Operation> void test(Class<T> opSet, double x, double y){
    for(Operation op : opSet.getEnumConstants()){
        ...
    }
}

// 2. 한정적 와일드카드 자료형
// EnumSet, EnumMap을 사용할 수 없다
// 여러 자료형에 정의한 연산들을 함께 전달하는 유연성이 필요 없다면, 한정적 자료형 토큰 방법을 사용하는편이 낫다
private static void test(Collection<? extends Operation> opSet, double x, double y){
    for(Operation op : opSet){
        ...
    }
}
```

### 정리
* 상속 가능 enum은 만들 수 없지만, interface를 만들고, interface를 구현하는 enum을 만들면된다



## 규칙 35. Prefer annotations to naming patterns





## 규칙 36. Consistently use the Override annotation





## 규칙 37. Use maker interfaces to define types







