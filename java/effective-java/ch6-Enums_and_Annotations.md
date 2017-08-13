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
* ordinal()은 EnumSet, EnumMap처럼 일반적인 용도의 enum기반 자료구조를 만들 경우 사용


## 규칙 32. Use EnumSet instead of bit fields





## 규칙 33. Use EnumMap instead of ordinal indexing





## 규칙 34. Emulate extensible enums with interfaces





## 규칙 35. Prefer annotations to naming patterns





## 규칙 36. Consistently use the Override annotation





## 규칙 37. Use maker interfaces to define types







