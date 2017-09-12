# Ch3. Methods Common to All Objects(모든 객체에 공통적인 메소드)
> Effective Java를 읽으며 공부했던 내용을 정리한다
> Object 클래스는 상속을 목적으로 설계  
> final이 아닌 메소드는 다른 모든 Java 클래스에서 준수해야하는 general contracts을 내포하고 있다. 오버라이드하도록 설계되었기 때문  
> final이 아닌 Objet의 메소드를 언제 어떻게 오버라이드하는지 알아보자


## 규칙 8. Obey the general contract when overriding equals(equals 메소드를 오버라이딩 할 때는 보편적 계약을 따르자)
* 인스턴스의 동일 여부를 판정하는 `equals()`


### 수퍼 클래스의 equals()를 오버라이딩하지 않아도 되는 경우
1. 클래스의 `각 인스턴스가 본래부터 유일`한 경우
   * 인스턴스가 갖는 값보다 활동하는 개체임을 나타내는 것이 더 중요한 Thread 등은 객체 참조가 같은면 동일한 것임을 알 수 있으므로
2. 두 인스턴스가 `논리적으로 같은지 검사하지 않아도 되는 클래스`의 경우
   * `java.util.Random`에서 2개의 Random 인스턴스가 같은 난수열을 만드는지 확인하기 위해 equals를 오버라이딩할 수 있었으나, 그럴 필요가 없었다
3. 수퍼 클래스의 이미 `오버라이딩된 equals()를 그대로 사용`해도 좋은 경우 
   * Set은 AbstractSet, List는 AbstractList, Map은 AbstractMap에 구현된 equals()를 상속 받아 사용
4. `private이나 패키지 전용(package-private) 클래스`라서 equals()가 절대 호출되지 않아야 할 경우
   * 오버라이딩해서 호출되지 않도록 해야 한다
```java
@Override
public boolean equals(Object o) {
    throw new AssertionError();  // 메소드가 절대 호출되지 않는다
}
```


### Object.equals()를 오버라이딩해야 하는 경우
* 객체 참조만으로 인스턴스의 동일 여부를 판단하는게 아니라, `인스턴스가 갖는 값을 비교하여 판단해야하는 경우`
   * value 클래스(Integer, Date...)
   * Map의 key나 Set의 요소로 객체를 저장하고 사용할 수 있게 하려면 equals() 오버라이딩 필요
      * 같은 값의 객체가 이미 있는지 비교하는 수단을 제공해야 하기 때문
* 수퍼 클래스에서 equals()를 오버라이드하지 않았을 경우


#### equals()를 오버라이드 할 필요 없는 value 클래스
* 각 값당 최대 하나의 객체만 존재하도록 인스턴스 제어를 사용하는 클래스
   * enum -> 이들에겐 객체 참조와 논리적 일치는 동일한 의미


### equals()의 general contract
* equivalence relation(동등 관계)을 구현
* Reflexive(재귀적)
   * null이 아닌 모든 참조 값 x에 대해, `x.equals(x)는 반드시 true`(x == x)
* Symmetric(대칭적)
   * null이 아닌 모든 참조 값 x, y에 대해, `y.equals(x)가 true라면  x.equals(y)도 true`(x == y)
* Transitive(이행적)
   * null이 아닌 모든 참조 값 x, y, z에 대해, `x.equals(y)가 true, y.equals(z)가 true면 x.equals(z)도 true`(x == y == z)
* Consistent(일관적)
   * null이 아닌 모든 참조 값 x, y에 대해, `equals()에서 사용하는 정보가 변경되지 않는다면, 여러번 호출하더라도 결과에 일관성이 있어야 한다`
* Non-nullity(Null이 아님)
   * null이 아닌 모든 참조 값 x에 대해, `x.equals(null)은 반드시 false`  


#### Reflexive(재귀적) 위배
* 일부러하지 않는 이상 위배하기 어렵다

#### Symmetric(대칭적) 위배
```java
// Symmetric 위배
public final class CaseInsensitiveString {
    private final String s;

    public CaseInsensitiveString(String s) {
        if (s == null)
            throw new NullPointerException();
        this.s = s;
    }

    /* 
    Symmetric 위배
    CaseInsensitiveString cis = new CaseInsensitiveString("Polish");
    String s = "polish";

    cis.equals(s);  // true
    s.equals(cis);  // false - 대소문자를 구분한다
    */
    @Override
    public boolean equals(Object o) {
        if(o instanceof CaseInsensitiveString)
            return s.equalsIgnoreCase(((CaseInsensitiveString) o).s);

        if(o instanceof String)  // 한 쪽으로만 상호 운용된다
            return s.equalsIgnoreCase((String)o);

        return false;
    }
}

// 개선 - equals()에서 String 처리 제거
@Override
public boolean equals(Object o) {
    return o instanceof CaseInsensitiveString &&
        ((CaseInsensitiveString)o).s.equalsIgnoreCase(s);
}
```

#### Transitive(이행적) 위배
* 기존 수퍼 클래스에 value component인 Color 객체를 추가하는 서브 클래스
```java
// 2차원 정수 좌표의 point를 나타내는 immutable 클래스
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if(!(o instanceof Point))
            return false;
        Point p = (Point)o;
        return p.x == x && p.y == y;
    }
}

public class ColorPoint extends Point {
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = color;
    }

    // Symmetric 위배
    // Point.equals(ColorPoint)면 Color이 비교 대상에서 제외
    @Override
    public boolean equals(Object o) {
        if(!(o instanceof ColorPoint))
            return false;
        return super.equals(o) && ((ColorPoint)o).color == color;
    }
}

// Symmetric 위배 개선 ->  그러나 Transitive 위배
@Override
public boolean equals(Object o) {
    if(!(o instanceof Point))
        return false;

    // o가 Point라면, Color는 빼고 비교
    if(!(o instanceof ColorPoint))
        return o.equals(this);
    
    // o가 ColorPoint라면, Point, Color 모두 비교
    return super.equals(o) && ((ColorPoint)o).color == color;
}

ColorPoint p1 = new ColorPoint(1, 2, Color.RED);
Point p2 = new Point(1, 2);
ColorPoint p3 = new ColorPoint(1, 2, Color.BLUE);

p1.equals(p2);  // true
p2.equals(p3);  // true
p1.equals(p3);  // false
```
* 객체지향 언어가 갖고 있는 동등관계의 문제
* 인스턴스 생성이 가능한 클래스의 서브 클래스에 value component를 추가하면서 equals() 계약을 지킬 수 있는 방법은 없다

#### 차선책 - inheritance(상속)보다는 composition(컴포지션)을 사용하자
```java
// private Point 필드와 public view 메소드를 추가
public class ColorPoint {
    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        if(color == null)
            throw new NullPointerException();
        point = new Point(x, y);
        this.color = color;
    }

    public Point asPoint() {
        return point;
    }

    @Override
    public boolean equals(Object o) {
        if(!(o instanceof ColorPoint)) 
            return false;
        ColorPoint cp = (ColorPoint)o;
        return cp.point.equals(point) && cp.color.equals(color);
    }
}
```
* abastract 클래스의 서브 클래스에는 equals 계약을 위배하지 않고 value component를 추가할 수 있다
   * `규칙20. tagged class보다는 클래스 상속 구조를 이용하자`에서는 중요
   * 수퍼 클래스의 인스턴스를 직접 생성할 수 없기 때문

> ##### Tagged Class  
> * 인스턴스의 종류를 구분하기 위한 필드를 갖고 있는 클래스  
> * 상속 구조를 만드는 것이 바람직

#### Consistent(일관적) 위배
* 가변 객체들은 시점이 달라져도 다른 객체들과 동일할 수 있지만, 불변 객체는 그럴 수 없다
* 불변 클래스로 만들어야 한다면, 동일한 객체들은 `꾸준히 동일함을 유지하게` equals()를 작성
* `신뢰할 수 없는 자원에 의존하는 equals()는 작성하지 말자`
   * java.net.URL의 equals()는 URL과 연관된 호스트의 IP를 비교
   * 호스트명을 IP로 바꾸기 위해 네트워크 접근, 항상 같다는 보장이 없음


#### Non-nullity(Null이 아님)
* o.equals(null)이 true일 거라고 상상할 수도 없지만, NPE의 가능성이 있다 
```java
// 이런 검사는 불필요
@Override
public boolaen equals(Object o) {
    if(o == null) 
        return false;
}

// instanceof 사용
@Override
public boolean equals(Object o) {
    if(!(o instanceof MyType))  // null인 경우에도 처리되므로 따로 검사할 필요X
        return false;
    MyType mt = (MyType)o;
}
```

### 양질의 equals()를 만드는 방법
```java
// sample
public final class PhoneNumber {
    private final short areaCode;
    private final short prefix;
    private final short lineNumber;

    @Override
    public boolean equals(Object o) {
        if(o == this)
            return true;
        if(!(o instanceof PhoneNumber))
            return false;
        PhoneNumber pn = (PhoneNumber)o;
        return pn.lineNumber == lineNumber 
            && pn.prefix == prefix
            && pn.areaCode == areaCode;
    }
}
``` 

#### 1. 객체의 값을 비교할 필요 없고 참조만으로 같은 객체인지 비교 가능하다면 `==`을 사용
* 같다면 true 반환
* 코드 성능이 최적화(비교하는 비용이 많이 들 경우) 

#### 2. `instanceof`를 사용해서 전달된 인자가 올바른 타입인지 확인
* 그렇지 않다면 false 반환
* 대게는 equals()가 정의된 클래스지만, 인터페이스도 올바른 타입이 될 수 있다
   * Set, List, Map, Map.Entry 같은 Collection 인터페이스

#### 3. 인자 타입을 올바른 타입으로 변환
* instanceof 검사 후 행하므로 안전하게 처리된다

#### 4. 클래스의 중요한 필드는 인자로 전달된 객체와 equals()가 호출된 객체의 필드가 모두 같은지 비교
* 모두 같다면 true 반환
* float, double이 아닌 기본형일 경우 `==`
* 객체의 참조일 경우 `equals()`
* float, double일 경우 `Float.compare(), Double.compare()` 사용
* 배열의 경우 `Arrays.equals()`
* NPE 방지
```java
(field == null ? o.field == null : field.equals(o.field))

// field와 o.field가 같은 경우가 많다면, 아래의 방법이 더 빠르다
(field == o.field || (field != null && field.equals(o.field)))
```
* 필드 비교가 복잡할 경우 canonical form(표준 형식)을 유지하여 그것을 기준으로 비교
   * immutable 객체를 비교할 때 적합
* equals()의 성능은 비교하는 필드의 순서에 영향을 받을 수 있다
   * 비용이 적게 드는 필드부터 비교
   * synchronization에 사용되는 lock 필드처럼 자신이 갖지 않는 필드는 비교 X
   * 필드의 값을 연산하여 나오는 파생 필드도 비교 X
   * 파생 필드가 요약 정보를 가지고 있다면 파생필드만 비교하는게 성능향상에 도움이 된다

#### 5. equals()를 작성한 후 대칭적이며 이행적이고 일관성이 있는지 확인
* unit test를 작성하여 검사

### 유의사항
* equals()를 오버라이드 할 때는 `hashCode()도 항상 오버라이드`한다
* 지나치게 비교하지 마라
* equals()의 인자 타입을 Object 대신 다른 타입으로 바꾸지 말자
   * overload 된다
   * `@Override`가 이런 실수를 막아준다



## 규칙 9. Always override hasCode when you override equals(equals()를 오버라이드 할 때는 hashCode()도 항상 같이 오버라이드 하자)

* equals()를 오버라이드하는 모든 클래스는 반드시 hashCode()도 오버라이드해야 한다
* HashMap, HashSet, HashTable 등의 hash기반 Collection을 사용할 때 올바르게 동작하지 않는다

### HashCode() standard contract
* 애플리케이션 실행 중 `동일한 정수를 일관성` 있게 반환
* equals() 결과 두 객체가 동일하다면, hashCode()는 `같은 정수` 값이 나와야 한다
* equals() 결과 두 객체가 다르다고 해서 hashCode()가 `반드시 다른 정수 값이 나올 필요는 없다`
   * 만약 다른 정수를 반환한다면 hashCode()를 사용하는 Collection의 성능을 향상시킬 수 있다


```java
public final class PhoneNumber {
    private final short areaCode;
    private final short prefix;
    private final short lineNumber;

    public PhoneNumber(int areaCode, int prefix, int lineNumber) {
        rangeCheck(areaCode, 999, "area code");
        rangeCheck(prefix, 999, "prefix");
        rangeCheck(lineNumber, 999, "line number");
        this.areaCode = (short) areaCode;
        this.prefix = (short) prefix;
        this.lineNumber = (short) lineNumber;
    }

    private static void rangeCheck(int arg, int max, String name) {
        if(arg < 0 || arg > max) {
            throw new IllegalArgumentException(name + ": " + arg);
        }
    }

    @Override
    public boolean equals(Object o) {
        if(o == this)
            return true;
        if(!(o instanceof PhoneNumber))
            return false;
        PhoneNumber pn = (PhoneNumber)o;
        return pn.lineNumber == lineNumber 
            && pn.prefix == prefix
            && pn.areaCode == areaCode;
    }

    // 계약 위배 - hashCode()가 없다
}

// usage - HashMap은 해시코드를 저장하는 최적화 코드를 갖고 있어서 hashCode가 일치하지 않으면 동일 여부를 확인하지 않는다
Map<PhoneNumber, String> m = new HashMap<>();
m.put(new PhoneNumber(707, 867, 5309), "Jenny");
m.get(new PhoneNumber(707, 867, 5309));  // null 반환
```

### 최악의 hashCode()
```java
@Override
public int hashCode() {
    return 42;
}
```
* 모든 객체가 같은 hashCode를 갖는다
* 모든 객체는 같은 버킷에 위치
* hash collection(HashMap, HashSet, HashTable 등)에서 linkedlist를 다시 생성
* 객체 수에 선형적으로 비례하여 느리게 실행된다

### 좋은 hashCode()
* 동일하지 않은 인스턴스에 대해 모든 가능한 hash를 고르게 분산시켜 준다

#### 1. 17처럼 0이 아닌 상수를 int result 변수에 저장

#### 2. equals()에서 비교하는 f에 대해 다음을 수행
* 각 필드에 대한 int hashCode c를 산술
   * f가 boolean이면, (f ? 1 : 0)
   * f가 byte, char, short, int면, (int)f
   * f가 long이면, (int)(f ^ (f >>> 32))
   * f가 float면, Float.floatToIntBits(f)
   * f가 double이면, Double.doubleToLongBits(f)로 반환된 long값을 3번째 처럼 산술
   * f가 객체 참조라면, equals() 호출, 복잡하다면 표준 형식을 만들어 처리, null이면 0 반환
   * f가 배열이면, 각 요소를 별개의 필드로 산술 처리. Arrays.hashCode() 사용 
   * 파생 필드는 제외
   * equals()에서 사용하지 않는 필드 제외
* 산술된 결과 c로 `result = 31 * result + c` 연산

#### 3. result 반환

#### 4. hashCode() 구현이 끝나면, unit test로 검증
```java
@Override
public int hashCode() {
    int result = 17;
    result = 31 * result + areaCode;
    result = 31 * result + prefix;
    result = 31 * result + lineNumber;
    return result;
}
```

### immutable, hashCode() 연산 비용이 중요한 경우
* 객체 내부에 hashCode를 저장
* 인스턴스 생성시 hashCode 산출 or lazy initialzation
```java
// lazy initialzation - 최신 기법은 아니다
private volatile int hashCode();

@Override
public int hashCode() {
    int result = hashCode;
    if (result == 0) {
        result = 17;
        result = 31 * result + areaCode;
        result = 31 * result + prefix;
        result = 31 * result + lineNumber;
        hashCode = result;
    }
    return result;
}
```



## 규칙 10. Always override toString(toString()은 항상 오버라이드 하자)

### toString()
* 반환되는 문자열은 `간결하며 읽기 쉬워야 한다`
* 모든 서브 클래스는 오버라이드 할 것을 권장
* printX(), +, assert, 디버거 출력 등에 사용
* 가능하면, 객체의 모든 중요한 정보 반환
   * 비용이 클 경우 요약정보만


### 반환값 형식을 API 문서에 상세하게 규정할 것인가
* value class라면 권장
   * 객체의 표현이 표준화되고, 읽기 쉬워진다
   * XML 문서처럼 입출력에 사용되거나, 영속적인 데이터 객체 내에서 사용
* 표준화할 경우 값들을 인자로 받아 필드를 초기화하는 static factory 메소드나 생성자를 두는 것이 좋다
   * BigInteger, BigDecimal, wrapper 클래스에서 많이 사용
* 잘못 규정하면 차기 버전에서 정보를 추가한다던가, 형식을 개선하는데 유연성이 없어진다
   * 갈아 엎을 수 없는 경우...

### 표현 형식의 규정 여부와 무관하게 의도를 명쾌하게 문서화
* 형식을 규정한다면 필수
```java
/** 
 * PhoneNumber 객체(전화번호)의 문자열 표현 반환
 * 14자이며 "(XXX) YYY-ZZZZ"
 * XXX - 지역번호, YYY - 국번호, ZZZZ - 선번호
 * 각 영문 대문자는 한자리 십진수
 * 지정된 자리수가 채워지지 않은 경우 0으로 채운다
 */
@Override
public String toString() {
    return String.format("(%03d) %03d-%04d", areaCode, prefix, lineNumber);
}
```

* 규정하지 않는다면
```java
/**
 * 간략한 표현 반환
 * 형식이 정해지지 않았으므로 변경될 수 있다
 * 일반적인 형태는 다음과 같다
 * [(XXX) YYY-ZZZZ]
 */
```
* 이런 주석을 보면 형식에 의존하는 코드나 보존 데이터를 만들지 않을 것

### toString()의 반환값에 포함되는 정보에 접근할 수 있는 메소드 제공
* 존재하지 않을 경우 문자열을 분석해야 하므로...
* 문자열 형식 변경시 문제 발생



## 규칙 11. Override clone judiciously

## 규칙 12. Consider implementing Comparable


