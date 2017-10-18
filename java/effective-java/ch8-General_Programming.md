# Ch8. General Programming
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> Java의 기본적인 사항인 지역 변수의 처리, 제어 구조, 라이브러리의 사용, 다양한 데이터 타입의 사용, reflection, native method, 최적화와 작명 규칙에 대해 정리  


* [45. Minimize the scope of local variables](#규칙-45-minimize-the-scope-of-local-variables)
* [46. Prefer for-each loops to traditional for loops](#규칙-46-prefer-for-each-loops-to-traditional-for-loops)
* [47. Know and use the libraries](#규칙-47-know-and-use-the-libraries)
* [48. Avoid float and double if exact answers are required](#규칙-48-avoid-float-and-double-if-exact-answers-are-required)
* [49. Prefer primitive types to boxed primitives](#규칙-49-prefer-primitive-types-to-boxed-primitives)
* [50. Avoid strings where other types are more appropriate](#규칙-50-avoid-strings-where-other-types-are-more-appropriate)
* [51. Beware the performance of string concatenation](#규칙-51-beware-the-performance-of-string-concatenation)
* [52. Refer to objects by their interfaces](#규칙-52-refer-to-objects-by-their-interfaces)
* [53. Prefer interfaces to reflection](#규칙-53-prefer-interfaces-to-reflection)
* [54. Use native methods judiciously](#규칙-54-use-native-methods-judiciously)
* [55. Optimize judiciously](#규칙-55-optimize-judiciously)
* [56. Adhere to generally accepted naming conventions](#규칙-56-adhere-to-generally-accepted-naming-conventions)


## 규칙 45. Minimize the scope of local variables
> 지역 변수의 유효 범위를 최소화 하자

* 규칙 13. Minimize the accessibility of classes and members와 유사

### 지역 변수의 scope 최소화의 이점
* 가독성, 유지보수성은 상승 
* error의 가능성이 감소

### 1. 지역 변수는 최초 사용되는 곳에서 선언한다
* 지역 변수 `scope 최소화의 가장 좋은 방법`
* 너무 미리(사용되는 블록 외부) 선언하면
   * 초기값을 기억하기 어렵다
   * scope가 너무 일찍 확장되고 소멸도 늦어진다
   * 사용되는 블록 외부에서도 접근 가능 -> 에러의 가능성


#### 지역 변수의 선언과 초기화에 주의
* 올바르게 초기화하는데 필요한 `정보가 충분하지 않다면, 충분할 때 까지 선언을 미루어야 한다`
* 예외. `try-catch`
   * checked exception을 발생시키는 메소드에서 변수가 초기화된다면?
   * 그 변수는 `반드시 try 블록 내부에서 초기화`
   * 외부에서 사용해야 한다면 `try 블록 앞에 선언`


### 2. while()보다는 for()사용
* loop 변수의 내용이 loop 종료 후 필요 없다면 `while() 대신 for() 사용`
   * for()는 `자체적으로 변수의 scope를 제한`
   * while()에서는 `앞에 선언`되므로 그러지 못한다
* 코드가 짧아 가독성이 좋아진다

```java
// for()
for(Element e : collection) {
    doSomething(e);
}

for(Iterator<Element> iter1 = collection1.iterator(); iter1.hasNext(); ) {
    doSomething(iter1.next());
}

// compile error - iter1 cannot find symbol iter1
for(Iterator<Element> iter2 = collection2.iterator(); iter1.hasNext(); ) {
    doSomething(iter2.next());
}

// while()
// Iterator의 scope가 loop 외부
Iterator<Element> iter1 = collection1.iterator();
while(iter1.hasNext()) {
    doSomething(iter1.next());
}

Iterator<Element> iter2 = collection2.iterator();
while(iter1.hasNext()) {  // iter1의 scope가 loop 외부라 생긴 bug
    doSomething(iter2.next());
}
```

#### for()의 초기값 선언부에 변수 선언
* scope는 loop 내부로 제한
* loop마다 반복 호출되지 않는다
   * 비교식은 매번 호출된다
```java
// n=expensiveComputation()은 최초 1번만 호출되므로 loop마다 호출되지 않는다
for(int i=0, n=expensiveComputation(); i<n; i++) {
    doSomething(i);
}
```

### 3. 메소드를 작게, 한 가지 일에 집중하도록 구현
* 두 가지 일을 하면, 하나의 일에 관련된 지역 변수가 `다른 일을 수행하는 코드의 scope에 들어갈 수 있다`
* 메소드를 2개로 분리하여 각각 `하나의 일을 수행하도록 refactoring`



## 규칙 46. Prefer for-each loops to traditional for loops
> for() 보다는 for-each를 사용하자

* iterator와 index 변수는 혼란스럽고, 에러날 가능성이 있다
```java
// collection
for(Iterator iter = collection.iterator(); iter.hasNext();) {
    doSomething((Element) iter.next());
}

// array
for(int i=0; i<arr.length; i++) {
    doSomething(arr[i]);
}
```

* for-each로 iterator, index 변수를 감춘다
   * index의 한계값을 1번만 계산하므로 약간의 성능 향상
```java
for(Element e : elements) {
    doSomething(e);
}
```


### 중첩 loop 처리시 for()보다 for-each가 훨씬 좋다

#### 중첩 loop 처리시 흔히 범하는 오류
```java
enum Suit { CLUB, DIAMOND, HEART, SPADE }
enum Rank { ACE, DEUCE, THREE, FOUR, ... , KING}

Collection<Suit> suits = Arrays.asList(Suit.values());
Collection<Rank> ranks = Arrays.asList(Rank.values());

List<Card> deck = new ArrayList<>();
for(Iterator<Suit> i = suits.iterator(); i.hasNext(); ) 
    for(Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
        deck.add(new Card(i.next(), j.next()));  // i.next()가 너무 많이 호출
```

#### 개선1. 지역 변수 선언
```java
for(Iterator<Suit> i = suits.iterator(); i.hasNext(); ) {
    Suit suit = i.next();
    for(Iterator<Rank> j = ranks.iterator(); j.hasNext(); ) 
        deck.add(new Card(suit, j.next()));
}
```

#### 개선2. for-each 사용
* `collection`, `array`, `Iterator를 구현하는 어떤 객체`에 대해서도 반복 처리 가능
```java
for(Suit suit : suits) 
    for(Rank rank : ranks)
        deck.add(new Card(suit, rank));
```

> ### Iterable
> ```java
> public interface Iterable<E> {
>     // 객체의 요소에 대한 iterator 반환
>     iterable Iterator<E> iterator();
> }
> ```
> * element 그룹을 나타내는 타입을 구현한다면, Iterable 인터페이스를 구현하자
> * for-each를 통해서 반복 처리가 가능해진다

### for-each를 사용할 수 없는 경우

#### 1. Filtering(필터링)
* 선택된 element를 삭제할 경우
* `명시적 iterator`를 사용해서 remove()를 호출해야 하기 때문

#### 2. Transforming(변환)
* index에 기반하여 일부 element의 값을 변경할 필요가 있을 경우

#### 3. Parallel iteration(병행 반복 처리) 
* 병행으로 element를 처리할 경우
* index를 명시적으로 제어할 필요가 있다


### 정리
* for-each는 for()에 비해 성능저하가 없고, 명료하며, 버그를 방지해준다



## 규칙 47. Know and use the libraries
> 라이브러리를 배우고 사용하자

### 라이브러리 사용의 장점

#### 1. 표준 라이브러리를 사용하면, 전문가들의 지식과 사용한 사람들의 경험을 이용할 수 있다
```java
private static final Random rnd = new Random();

static int random(int n) {
    return Math.abs(rnd.nextInt()) % n;
}
```
* 위 메소드의 결함
   1. n이 2의 제곱수라면, 메소드가 생성하는 난수열은 짧은 주기로 반복
   2. n이 2의 제곱수가 아니라면, 평균적으로 어떤 수가 다른 수보다 더 자주 반환
   3. 지정한 범위를 벗어나는 난수를 반활할 수 있다
* 결함을바로 잡기 위해서 의사 난수 발생기, 정수론, 2의 보수 연산에 대해서 알아야 한다
* 이미 검증된 라이브러리가 존재하므로 그것을 사용하면 된다


#### 2. 작은 문제를 해결하는데 시간 낭비할 필요가 없다
* 이미 해결된 문제를 해결하기 보다는 애플리케이션에 관련된 일을 하는데 시간을 투자


#### 3. 지속석인 성능 개선
* 라이브러리를 사용하는 사용자들에 의해 지속적인 성능 개선이 이루어진다


#### 4. 많은 개발자들에 의해 가독성 향상, 유지보수 및 재사용 가능


### 라이브러리에 대해 파악하자
* java.lang, java.util, java.io에 익숙해지자
* java.util의 Collection Framework, concurrent 등


### 필요한 기능이 없다면?
* 표준 라이브러리에 없다면 `3rd-party 라이브러리를 사용`하거나 `직접 구현`

### 정리
* 이미 있는 것을 다시 만들지 말자
* 있는지 모르겠다면 문서를 확인하자
* 라이브러리의 코드는 많은 사람들로 인해 직접 작성한 코드보다 좋으며, 지속적으로 개선된다



## 규칙 48. Avoid float and double if exact answers are required
> 정확한 계산에는 float, double을 사용하지 말자

### 부동소수점 연산
* 넓은 범위의 수에 대해 `정확한 근사치를 빨리 산출`하기 위해 설계
* 정확한 결과를 제공하지 않는다
* 돈 계산에 부적절
```java
double funds = 1.00;
int itemsBought = 0;
for(double price = .10; funds >= price; price += .10) {
    funds -= price;
    itemsBought++;
}
System.out.println(itemsBought + " items bought");  // 3
System.out.println("Change: $" + funds);  // 0.3999999999
```

### 돈 계산시 BigDecimal, int, long 사용
```java
final BigDecimal TEN_CENTS = new BigDecimal(".10");

int itemsBought = 0;
BigDecimal funds = new BigDecimal("1.00");
for(BigDecimal price = TEN_CENTS; funds.compareTo(price) >=0; price = price.add(TEN_CENTS)) {
    itemsBought++;
    funds = funds.subtract(price);
}
System.out.println(itemsBought + " items bought");  // 4
System.out.println("Change: $" + funds);  // 0
```

### BigDecimal 사용의 단점
* 기본형 데이터 타입을 사용할 때보다 불편
* 실행 속도가 느려진다

#### 대안 - int, long을 사용하면서 소수점을 직접 계산하고 유지
```java
int itemsBought = 0;
int funds = 100;
for(int price=10; funds>=price; price+=10) {
    itemsBought++;
    funds -= price;
}
System.out.println(itemsBought + " items bought");
System.out.println("Change: $" + funds + "cents"); 
```

### 정리
* 근사치가 아닌 정확한 값의 계산에는 float, double을 사용하지 않는다
* `BigDecimal`을 사용하면 좋은 경우
   * 8가지 반올림 모드를 이용하고 싶다
   * 소수점의 정확한 계산이 필요하다
   * 사용성이 약간 떨어져도 괜찮다
   * 오토 박싱, 언박싱으로 인한 성능 저하가 괜찮다
* `int, long`을 사용하면 좋은 경우
   * 성능이 중요하다
   * 소수점을 직접 계산할 수 있다
   * 너무 큰수를 다루지 않는다
* 십진수 9자리 이하 - `int`
* 십진수 18자리 이하 - `long`
* 십진수 18자리 초과  - `BigDecimal`
   


## 규칙 49. Prefer primitive types to boxed primitives
> boxed primitive type보다는 primitive type을 사용하자

* primitive type - int, double, boolean
* reference type - String, List
* boxed primitive type - Integer, Double, Boolean
> Java 1.5에서 auto boxing, auto unboxing 추가

### primitive와 boxed primitive의 차이
1. primitive는 `값만` 가지지만, boxed primitive는 `값과 identity`를 가진다
2개의 boxed primitive 인스턴스는 값은 같지만 identity는 다를 수 있다
2. primitive는 `완전한 기능 값만` 가지지만, boxed primitive는 추가로 `비 기능값인 null`을 가진다
3. primitive는 boxed primitive보다 `실행 시간과 메모리 사용 효율이 좋다`

### boxed primitive를 비교할 경우
```java
// 문제가 있는 Comparator
Comparator<Integer> naturalOrder = new Comparator<>() {
    public int compare(Integer first, Integer second) {
        return first < second ? -1 : (first == second ? 0 : 1);
    }
};

// usage
naturalOrder.compare(new Integer(42), new Integer(42));  // 1 - error
// first == second에서 reference 비교가 이루어지므로
```
* `==`을 boxed primitive에 적용하면 `reference 비교`가 이루어진다

#### 개선
* primitive 사용
```java
Comparator<Integer> naturalOrder = new Comparator<>() {
    public int compare(Integer first, Integer second) {
        int f = first;  // auto unboxing
        int s = second;
        return f < s ? -1 : (f == s ? 0 : 1);
    }
};
```

### primitive와 boxed primitive를 하나의 연산에서 사용할 경우
```java
public class Unbelievable {
    static Integer i;
    
    public static void main(String[] args) {
        if(i == 42)  // auto unboxing이 되면서 NPE 발생
            System.out.println("Unbelievable");
    }
}
```
* primitive와 boxed primitive를 하나의 연산에 사용하면, boxed primitive는 `auto unboxing`된다

#### 개선
```java
public class Unbelievable {
    static int i;  // primitive로 수정
    ...
}
```

### 잘못된 auto unboxing 사용
```java
public static void main(String[] args) {
    Long sum = 0L;
    for(long i=0; i<Integer.MAX_VALUE; i++) {
        sum += i;  // primitive와의 연산시 잦은 auto unboxing으로 인해 성능 저하
    }
    System.out.println(sum);
}
```

#### 개선
```java
public static void main(String[] args) {
    long sum = 0L;  // primitive로 수정
    ...
}
```

### boxed primitive를 사용하면 좋은 경우
* Collection의 element, key, value로 사용
* 매개변수화 타입의 타입 매개 변수로 사용
   * `ThreadLocal<Integer>`
* reflection으로 재귀적인 메소드를 호출할 경우

### 정리
* boxed primitive보다는 primitive를 사용
   * 더 간단하고 속도가 빠르다
* boxed primitive를 사용할 경우
   * `==`은 값이 아닌 `레퍼런스를 비교`
   * 초기화 하지 않았을 경우, primitive와 같이 사용하면 auto unboxing으로 NPE 발생
* primitive가 auto boxing될 때는 불필요한 객체가 생성되고, 비용도 많이 발생한다



## 규칙 50. Avoid strings where other types are more appropriate
> 다른 타입을 쓸 수 있는 곳에서는 String 사용을 피하자

### 1. String으로 다른 값 타입을 대체하지 말자
* `int, float, BigInteger, boolean` 등 적절한 타입으로 변환


### 2. String으로 enum을 대체하지 말자
* enum은 String보다 훨씬 더 좋은 열거형 상수를 만든다

### 3. String으로 aggregate type을 대체하지 말자
* entity가 여러 개의 컴포넌트를 갖는 경우, 하나의 String으로 표현하지 말자
```java
// String으로 aggregate type으로 사용한 부적절한 예
Stirng compoundKey = className + "#" + i.next();
```

#### 문제
* 필드를 구분하는 문자가 값으로 오면 문제 발생
   * 여기선 `#`
* 각 필드 사용시 String을 분석해야 하므로 속도가 느리고, 코드가 길어지며, 에러가 생기기 쉬움
* 다른 종류의 데이터가 섞여 `equals(), toString(), compareTo()`를 오버라이딩하기 어렵다

#### 개선
* aggregate type을 나타내는 클래스 구현
   * 주로 private static member class로 구현


### 4. String으로 capabilities(역량)를 대체하지 말자
* 어떤 기능에 `접근하는 권한을 부여`하는데 String을 사용하는 경우
   * key가 `Thread 지역 변수를 식별`하는데 사용됨
```java
public class ThreadLocal() {
    private ThreadLocal(){}

    public static void set(String key, Object value);

    public static Object get(String key);
}
```

#### 문제
* Thread 지역 변수의 `key가 여러 Thread 간에 전역적으로 공유`된다
* 제대로 동작하려면, 클라이언트가 제공한 문자열 key가 중복되지 않아야 한다

#### 개선 1 - 유일하고 위조 불가능한 키를 생성
* 문자열 기반의 문제점을 모두 해결하진 않는다
```java
public class ThreadLocal() {
    private ThreadLocal(){}

    public static class Key {  // capability
        Key() {}
    }

    // 유일하고 위조 불가능한 키를 생성
    public static Key getKey() {
        return new Key();
    }

    public static void set(String key, Object value);

    public static Object get(String key);
}
```

#### 개선 2 - Thread 지역 변수가 key가 된다
```java
public final class ThreadLocal {
    public ThreadLocal() {}
    public void set(Object value);
    public Object get();
}
```

#### 개선 3 - type safe하게 수정
* String 기반 문제점 해결
* key기반보다 빠르고 좋다
```java
// java.lang.ThreadLocal
public final class ThreadLocal<T> {
    public ThreadLocal() {}
    public void set(T value);
    public T get();
}
```


### 정리
* 더 좋은 데이터 타입이 있거나, 구현할 수 있다면, String으로 표현하지 말자
* 다른 타입에 비해 번거롭고, 유연성이 떨어지며, 속도도 느리고, 에러 가능성이 있다



## 규칙 51. Beware the performance of string concatenation
> 문자열 결합의 성능 저하를 주의하자

`+`는 문자열을 결합하는 편리한 방법
출력 내용을 1줄로 만들거나, 작고 고정된 크기의 객체를 String으로 만들 때 사용
크기 조정 X
`+`를 반복적으로 사용하면 n^2에 비례하는 시간이 걸린다 O(n^2)
String은 immutable
결합될 때 복사되어 하나의 String 생성
```java
// 항목 수에 n^2의 시간 소요
public String statement() {
    String result = "";
    for(int i=0; i<numItems(); i++) 
        result += lineForItem(i);
    return result;
}
```

### 개선 - StringBuilder 사용
* StringBuilder - StringBuffer의 비동기화 버전
* 항목 수에 비례하는(n) 시간 소요
```java
// 
public String statement() {
    StringBuilder b = new StringBuilder(numItems() * LINE_WIDTH);
        b.append(lineForItem(i));
    return b.toString();
}
```

### 정리
* 결합할 문자열이 많다면 `+` 대신 `StringBuilder.append()` 사용
* 또는 `문자 배열`을 사용하거나, 결합하지 말고 `하나씩 처리`



## 규칙 52. Refer to objects by their interfaces
> 객체 참조는 그 객체의 interface로 하자


### 객체를 참조할 때는 클래스보다는 interface를 사용
* 적합한 interface가 있다면, `매개변수, 반환 값, 변수, 필드`에 interface를 사용
* 유일하게 필요 없는 경우 - `객체 생성시`
```java
// good
List<Subscriber> Subscribers = new Vector<>();

// bad
Vector<Subscriber> Subscribers = new Vector<>();
```


### 구현체 변경에 대응하기 쉽다
```java
// before
List<Subscriber> Subscribers = new Vector<>();

// after
List<Subscriber> Subscribers = new ArrayList<>();
```
* `객체 생성부를 제외`하고는 변경이 없다
* 기존 구현체가 interface 구현과 무관한 기능에 의존하고 있다면, 새로운 구현체에서도 동일한 기능 제공해야 한다
   * `Vector의 동기화`에 의존 -> ArrayList로 대체 불가
   * 구현체의 특별한 속성에 의존한다면 문서화
* interface의 구현체를 변경하고자 하는 이유
   * 새로 변경한 구현체가 더 좋은 성능을 제공하거나 추가 기능을 제공하기 때문
* ThreadLocal
   * Thread의 값을 ThreadLocal 인스턴스와 연관시키기 위해 Map 사용
      * 1.3 - HashMap
      * 1.4 - IdentityHashMap
   * Map interface를 사용했기 때문에 1라인의 변경으로 작업이 완료되었다


### 만일 적합한 interface가 없다면, 객체를 참조하는 타입을 interface 대신 클래스로 하는 수밖에 없다
1. value class - String, BigInteger
   * 매개변수, 변수, 필드, 반환 타입에 사용하면 좋다
2. 프레임워크에 속한 객체들의 `기본 타입이 인터페이스가 아닌 클래스`
   * base class(super면서 abstract clas)를 사용 - TimerTask
3. interface를 구현하는 클래스가 `interface에 없는 메소드를 추가로 지원`할 경우
   * LinkedHashMap


### 정리
* 적합한 interface를 갖고 있느냐의 여부가 분명해야 한다
* 갖고 있다면 `interface를 사용`함으로써 훨씬 유연해진다
* 없다면 super class 중 가장 `general한 클래스를 사용`



## 규칙 53. Prefer interfaces to reflection

## 규칙 54. Use native methods judiciously

## 규칙 55. Optimize judiciously

## 규칙 56. Adhere to generally accepted naming conventions

