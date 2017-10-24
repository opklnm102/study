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
> reflection보다는 interface를 사용하자


### java.lang.reflect
* core reflection facility(리플렉션 핵심 관리 체계)
* `메모리에 로드된 클래스`들에 관한 정보를 사용할 수 있게 해준다
* Constructor, Method, Field 인스턴스를 얻을 수 있다
   * 생성자, 메소드, 필드를 `재귀적`으로 조작할 수 있다
   * `Method.invoke()`로 어떤 메소드건 호출 가능
* reflection은 하나의 클래스가 다른 클래스를 사용하도록 도와준다
* `compile time에 쓸 수 없는 클래스`를 이용할 수 있다
* `컴포넌트 기반의 애플리케이션` 개발 도구용으로 설계되었다
* 필요시 클래스를 로드하고, 클래스의 메소드, 생성자가 어떤 것들이 있는지 찾기 위해 reflection 사용
* reflection은 `design time(설계 시점)`에만 사용
* runtime시의 객체는 reflection을 이용해 `재귀적으로 사용하면 안된다`
   * 예외 - 클래스 브라우저, 객체 조사기, 코드 분석 도구, RPC(stub 컴파일러의 필요성 배제를 위해) 등


### reflection의 대가
* compile time에 가능한 `타입 확인을 할 수 없다`
   * 예외 검사 포함
   * runtime에 존재하지 않거나, 접근 불가능한 메소드 호출시 실패
* 재귀적인 접근을 필요로 하는 경우 `가독성 하락`
* 재귀적인 메소드 호출은 일반 메소드 호출보다 `느리다`



### reflection을 제한된 형태로만 사용
* 제한된 사용으로 `비용이 거의 수반되지 않도록` 한다면 많은 장점을 얻을 수 있다
* `compile time에 쓸 수 없는 클래스`를 사용해야 하는 경우
   * 클래스를 참조하는 `interface, super class가 compile time에 존재`하므로 그 클래스의 인스턴스를 재귀적으로 생성한 후 `interface, super class`를 통해서 그 인스턴스를 보통 때처럼 사용할 수 있다
   * 적합한 생성자, 매개변수가 없다면 `Class.newInstance()`를 사용

#### reflection을 사용하는데 필요한 핵심이 담겨있는 example
```java
// reflection으로 인스턴스 생성 후 interface를 통해 사용
public static void main(String[] args) {
    // 클래스 이름을 Class 객체로 변환
    Class<?> cl = null;

    try {
        cl = Class.forName(args[0])
    } catch(ClassNotFoundException e) {
        System.err.pringln("Class not found");
        System.exit(1);
    }

    // 클래스 인스턴스를 생성
    Set<String> s = null;
    try {
        s = (Set<String>) cl.newInstance();
    } catch(IllegalAccessException e) {
        System.err.pringln("Class not accessible");
        System.exit(1);
    } catch(InstantiationException e) {
        System.err.pringln("Class not instantiable");
        System.exit(1);
    }

    s.addAll(Arrays.asList(args).subList(1, args.length));
    System.out.println(s);
}
```
* 제네릭 Set 테스트용으로 쉽게 변환될 수 있을 것
   * Set의 인스턴스를 생성하고 조작하면서 Set에서 지켜야할 계약에 따르는지 검사할 수 있다
* 제네릭 Set 성능 분석도구로도 변환될 수 있다
* 이 기법은 `service provider framework`를 구현할 만큼 강력
* 2가지 단점
   1. 3개의 runtime error를 발생시키는데, reflection을 이용한 인스턴스 생성이 아니였다면, compile error로 검출되었을 것
   2. `new`로 인스턴스를 생성하면 깜끔하지만, 20라인의 긴 코드가 작성되었다
      * 객체를 생성하는 코드에만 국한
      * 객체가 생성되면 영향받지 않는다

> #### System.exit()
> * JVM 전체를 중단시키는 메소드
> * 적합한 사용처는 거의 없지만, 명령행에서 `바로 실행되는` 유틸 프로그램이 `비정상적으로 끝날 때` 사용하는것은 적합


### 드물게 reflection을 잘 사용하는 경우
* `runtime시에 없을 수도 있는` 클래스, 메소드, 필드에 대한 특정 클래스의 의존도 관리
* 여러 버전으로 된 다른 패키지에 맞추어 실행되어야 하는 패키지를 작성할 때 유용
* 지원에 필요한 `최소 환경(최소 버전)에 맞추어 패키지를 컴파일` 한 후 새로운(버전이 올라간) 클래스나 메소드는 reflection을 이용해서 사용하게 하는 것 
   * 사용하고자 하는 새버전의 클래스, 메소드가 runtime시에 없을 경우 대처 필요
   * 같은 목표를 달성하기 위한 대안을 사용하거나, 기능을 줄여서 동작하도록 하는 등의 적절한 조치


### 정리
* reflection은 강력한 관리 시스템
* 단점도 많다
* compile time에 존재하지 않는 클래스를 사용 해야할 경우, runtime에 reflection을 사용하여 객체를 생성
* 객체를 사용할 때는 compile time에 존재하는 interface나 super class를 이용



## 규칙 54. Use native methods judiciously
> 네이티브 메소드를 분별력 있게 사용하자

* `JNI(Java Native Interface)`는 Java Application에서 `native method를 호출`할 수 있게 해준다

> #### native method
> * C, C++ 같은 native 언어로 작성한 메소드
> * native 언어로 연산 후 결과 반환

### native method의 용도
1. registry와 file lock과 같은 `특정 플랫폼 관리시스템의 접근` 제공
   * Java에서 제공하는 기능이 증가하고 있다
   * 1.4 java.util.prefs - 레지스트리 기능 제공
   * 1.6 java.awt.SystemTray - 휴지통 역역 접근 제공
2. legacy data를 제공할 수 있는 `legacy 코드로 된 라이브러리의 접근` 제공
3. `성능 향상`을 위해 성능이 중요한 애플리케이션의 일부를 네이티브 언어로 작성하는데 사용
   * 권장 X
   * JVM의 성능 향상으로 native에 의존하지 않더라도 비등해졌다

### native method의 단점
* 메모리 손상 에러로부터 안전하지 않다
* 플랫폼에 종속되므로, 이식성 저하
* 결함을 찾기도 어렵다
* Java 코드에서 native 코드로 진입과 빠져 나올 때 고정 비용(시간, 자원)이 든다
   * 적은 양의 일만을 처리할 경우 오히려 성능 저하
* 알아보기 어렵고, 작성하기 번거로운 glue 코드 필요

### 정리
* native method를 사용하기 전에 다시 한번 생각하자
* 저주순의 자원, legacy 라이브러리 사용을 위해 native method를 사용해야 한다면, 적의 양의 코드를 사용하고 테스트하자



## 규칙 55. Optimize judiciously
> 잘 판단해서 최적화하자

### 최적화에 관련된 명언
1. 더 많은 컴퓨팅 죄악이 다른 어떤 한가지 이유보다는 효율성의 이름으로 저질러진다
2. 사소한 효율성은 잊어야 한다. 97%의 시간에 대한 논하자. 성급한 최적화는 모든 죄악의 근원이다
3. 최적화에 관한 두가지 규칙을 따르자
   1. 하지말자
   2. 아직 하지 말자. 정말 최적화되지 않은 솔루션이 있을 떄까지는


### 성급한 최적화는 얻는 것보다 더 많이 읽기 쉽다
* 빠른 것보다는 `좋은 프로그램 구현`에 노력
* 성능 때문에 `훌륭한 아키텍처 원리`를 포기하지 말자
* 좋은 프로그램은 `정보은닉` 실현
* 설계 시 결정사항을 개별 모듈에 모은다 -> 모듈화
* 설계 후 명확하고, 간결하고, 잘 구축된 코드를 만들면, 비로소 `최적화를 고려할 시기`가 될 수 있다


### 성능을 제한하는 설계상의 결정을 하지 않도록 노력하자
* 성능을 제한하는 `아키텍처 결함은 시스템을 재작성`해야 바로 잡을 수 있으므로, 설계 단계에서 성능을 고려해야 한다
   * 구현상의 문제점은 최적화에서 바로 잡을 수 있다
* 문제가 생긴 후 변경하기 가장 어려운 것이 `설계 컴포넌트`
   * 컴포넌트들은 `모듈과 외부와의 상호작용`을 명시
설계 컴포넌트들 중에서 가장 중요한 것들이 API, 통신 프로토콜, persistence data(DB..) 등이다
후에 변경이 어렵거나 불가능하여 시스템이 달성할 수 있는 성능에도 심각한 제약을 줄 수 있다


### API의 설계 결정이 성능에 미치는 영향을 고려하자
* public 타입을 가변(객체, 필드 등)으로 만들면 `불필요한 방어 복사`를 많이 초래할 수 있다
* 컴포지션이 적합했을 때 상속을 하면, 수퍼 클래스에 묶이게 된다
* API에서 인터페이스보다 구현체(클래스 등) 타입을 사용하면, 특정 구현체에 얽매이게 된다
   * 향후 더 좋은 구현체가 있더라도 기존 API를 변경하기 어렵다

### 좋은 성능을 얻기 위해 API를 뒤틀리게 만드는 것은 매우 나쁜 발상
* 그러지 않아도 향후에 개선될 수 있다
* 뒤틀린 API는 두고두고 어려움을 준다


### 최적화를 할 때마다 전후의 성능을 측정하자
* 그다지 큰 `효과가 없는 경우`가 종종 있다
* 어느 부분에서 시간을 소비하는지 알기가 어려운 것이 가장 큰 이유


### 프로파일링 도구
* 최적화의 초점을 어디에 둘 것인지 결정하는데 도움이 될 수 있다
* 런타임 정보 제공
   * 각 메소드가 소비한 시간과 호출 수 등
튜닝의 초점을 맞추는 것 + 알고리즘 변경의 필요성 경고
시스템의 코드가 많을수록 도입이 필요하다

### Java는 performance model을 갖고 있지 않다
* 연산 수행에 들어가는 상대적인 비용 정의 X
* JVM마다, 배포판마다, 프로세서마다 성능이 제각각
* 여러 HW 플랫폼에서 실행할 예정이면 최적화의 효과 측정 필요


### 정리 
* 속도가 빠른 프로그램에 매달리지 말고, 양질의 프로그램을 구현하도록 노력하면 속도는 따라올 것이다
* 시스템 설계시 특히, `API, 통신 프로토콜, persistence data(DB..)` 설계시 성능 문제를 심사숙고하자
* 시스템 구축이 끝났을 때 성능을 측정하고, 충분히 빠르지 않다면 프로파일러 도구로 문제의 근원을 찾자
   * 관련된 부분의 최적화 실시
   * 1단계로 알고리즘을 잘 선택했는지 검사
* 변경이 생길 때마다 성능을 측정하면서 만족할 떄까지 반복



## 규칙 56. Adhere to generally accepted naming conventions
> 보편화된 작명 규칙을 따르자

* 안정된 naming convention 존재
* JLS(Java Language Specification) 6.8에 포함
* 글자 규칙과 문법 규칙으로 분류

### 글자 규칙
* package, class, interface, method, 필드, 타입 매개변수에 대한 작명 규칙 포함
* 어기면 혼란과 에러를 유발하는 잘못된 추측을 초래

#### package 이름
* 컴포넌트 이름을 `마침표로 구분 및 연결`하여 `계층적인 형태`로 구성
* 컴포넌트 이름은 `영문 소문자와 숫자(드물게)`로 구성
* 어떤 조직의 외부에서 사용될 패키지의 이름은 도메인의 이름을 반대로
   * com.sun
* Java 표준 라이브러리는 `java, javax`로 시작
* 나머지 부분은 패키지가 무엇인지를 나타내는지 하나이상의 컴포넌트 이름으로 구성
* 8자 이내의 짦은 약어
   * utilities -> util
   * Abstract Window Toolkit -> awt
* 컴포넌트의 규모가 큰 경우 분류하여 계층화된 이름을 사용
   * javax.swing는 javax.swing.plaf.metal의 상위 패키지

#### enum, annotation을 포함한 class, interface 이름
하나 이상의 단어로 구성하되 `첫 글자는 영문 대문자`
   Timer, FutureTask 등

#### method, 필드 이름
* class, interface와 동일한 규칙을 따르되 `첫글자는 영문 소문자`
* 상수는 `대문자와 _`를 사용
   * MAX_VALUE

#### 타입 매개변수
* `단일 문자`로 구성
* 임의 타입 - T, U, V, T1, T2...
* 컬렉션 요소 타입 - E
* Map의 key와 value는 - K, V
* 예외 타입 - X

| 식별자 타입 | usage |
|:----:|:---:|
| 패키지 | com.google.inject, org.joda.time.format |
| class, interface | Timer, FutureTask, HttpServlet |
| 메소드, 필드 | remove, getCrc |
| 상수 | MAX_VALUE |
| 지역 변수 | i, xref |
| 타입 매개변수 | T, E, K, V, X |



### 문법 작명 규칙

#### package
* 문법 작명 규칙이 없다

#### class
* 단일 명사나 명사구로 구성
   * Timer, BufferedWriter

#### interface
* 클래스 이름과 유사하거나 형용사인 `able, ible`를 붙인다
   * Collection, comparator
   * Runnable, Iterable, Accessible


#### annotation
* 모든 품사가 고루 사용, 명사, 동사, 전치사, 형용사
   * Inject, ImplementedBy, Singleton

#### 메소드
* 동사나 동사구로 구성
   * append, drawImage
* boolean을 반환하는 메소드는 대게 `is, has(드물게)`로 시작하며, 뒤로 명사, 명사구나 아무 단어가 따라 나온다
   * isDigit, isProbablePrime, isEmpty, isEnabled, hasSiblings
* 함수나 속성으 반환하는 메소드는 명사, 명사구, 또는 get으로 시작하는 동사구로 구성
   * size, hashCode, getTime
* 객체의 타입을 변환하는 메소드는 `toType`의 형태
   * toString, toArray
* 인자로 받은 객체와 다른 타입의 뷰를 반환하는 메소드는 `asType`
   * asList
* 메소드가 호출된 객체와 같은 값을 갖는 기본형 값을 반환하는 메소드는 `typeValue`
   * intValue
* static factory 메소드의 이름으로는 `valueOf, of, getInstance, newInstance, getType, newType`


#### 필드
* 클래스, 인터페이스, 메소드 이름보다 덜 중요
* boolean 필드는 is를 뺀것과 유사한 이름
   * initialized, composite


### 정리
naming convention을 내것으로 만들고 사용법을 배우자

