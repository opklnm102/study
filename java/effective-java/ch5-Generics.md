# Ch5. Generics
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> generics으로 각 collection에 어떤 타입을 허용할 것인지 컴파일러에게 알려주면, cast 코드를 컴파일러가 자동으로 만들어주어 더욱 안전하고 명백한 코드가 된다  
> 장점이 있는 만큼 복잡함도 증가


* [23. Don't use raw types in new code](#규칙-23-dont-use-raw-types-in-new-code)
* [24. Eliminate unchecked warnings](#규칙-24-eliminate-unchecked-warnings)
* [25. Prefer lists to arrays](#규칙-25-prefer-lists-to-arrays)
* [26. Favor generic types](#규칙-26-favor-generic-types)
* [27. Favor generic methods](#규칙-27-favor-generic-methods)
* [28. Use bounded wildcards to increase API flexibility](#규칙-28-use-bounded-wildcards-to-increase-api-flexibility)
* [29. Consider typesafe heterogeneous containers](#규칙-29-consider-typesafe-heterogeneous-containers)


## 규칙 23. Don't use raw types in new code
> 새로 작성하는 코드에서는 raw 타입을 사용하지 말자

### generic type
* generic class, generic interface
* 하나 이상의 type parameter를 선언하고 있는 class, interface
* actual type paremater(실 타입 매개변수)는 formal type parameter(형식 타입 매개변수)와 대응
   * ex. List<E> -> List<String>
   * E -> formal type parameter
   * String -> actual type paremater

### raw type
* actual type parameter 없이 사용되는 generic type
* ex. List<E> -> List
* generic이 추가되기 전 interface List가 했던 것과 같은 방법으로 동작
```java
// Stamp만 저장하는 collection
private final Collection stamps = ...;

// Coin을 저장해도 컴파일러가 알아채지 못함
stamps.add(new Coin());

// 꺼낼 때 runtime error
for(Iterator i = stamps.iterator(); i.hasNext();) {
    Stamp s = (Stamp) i.next();  // ClassCastException
    ...
}
```

* error는 컴파일 시점에 발견하는게 가장 좋다
* generic은 컴파일러에게 저장할 type을 알려준다
```java
private final Collection<Stamp> stamps = ...;

stamps.add(new Coin());  // error
```

* collection에서 요소를 꺼낼 때 casting 불필요
```java
// type safe 보장
for(Stamp s : stamps) {  // casting 불필요
    ...
}

for(Iterator<Stamp> i = stamps.iterator(); i.hasNext();) {
    ...
}
```
* 호환성 때문에 raw type을 지원하지만 raw type을 사용하면 generic의 장점인 `type safe`와 `표현력` 모두를 포기하는 것


### raw type과 `List<Object>`의 차이
* raw type은 generic type 검사가 생략
* `List<Object>`는 어떤 타입이든 저장할 수 있다고 컴파일러에게 알린다
* `List<String>`은 List의 매개변수로 전달 가능하지만 `List<Object>`로는 불가능
* `List<String>`은 List의 서브타입이지만 `List<Object>`의 서브타입은 아니다
* `List 같은 raw type을 사용하면 type safe 상실, List<Obejct> 같은 매개변수 타입을 사용하면 괜찮다`

```java
public static void main(String[] args) {
    List<String> strings = new ArrayList<String>();
    unsafeAdd(strings, new Integer(42));
    String s = strings.get(0);  // 컴파일러가 casting 코드 생성
}

// get()할 때 ClassCastException 발생 - type safe가 깨짐
private static void unsafeAdd(List list, Object o) {
    list.add(o);
}

// 컴파일 error 발생
private static void unsafeAdd(List<Object> list, Object o) {
    list.add(o);
}
```


### collection의 타입이 미지정 혹은 어떤 타입이건 관계 없을 경우 
* generic을 모를 경우
```java
static int numElementsInCommon(Set s1, Set s2) {
    int result = 0;
    for(Object o1 : s1)
        if(s2.contains(o1))
            result++;
    return result;
}
```
* 개선 - unbounded wildcard type 사용
```java
static int numElementsInCommon(Set<?> s1, Set<?> s2) {
    int result = 0;
    for(Object o1 : s1)
        if(s2.contains(o1))
            result++;
    return result;
}
```
* 어떤 type의 요소건(null이 아닌) 추가할 수 없고, 꺼내는 type도 예상할 수 없다
   * 제약을 피하려면 `generic method`나 `bounded wildcard type`을 사용
```java
s1.add("11");

Error:(77, 15) java: no suitable method found for add(java.lang.String)
    method java.util.Collection.add(capture#1 of ?) is not applicable
      (argument mismatch; java.lang.String cannot be converted to capture#1 of ?)
    method java.util.Set.add(capture#1 of ?) is not applicable
      (argument mismatch; java.lang.String cannot be converted to capture#1 of ?)
```

> #### unbounded wildcard type
> * `?`
> * generic을 사용하고 싶지만 actual type parameter를 모르거나, 어떤 type이든 상관없을 경우 사용


### raw type을 사용하지 않는다는 규칙의 예외
1. raw type은 class literal 형태로 사용
   * `String[].class, int.class` -> O
   * `List<String>.class, List<?>.class` -> X
2. unbounded wildcard type이 아닌 경우에 instanceof를 사용할 수 없다
   * runtime시에 generic type정보가 사라지기 때문
   * unbounded wildcard type은 instanceof 동작에 영향을 주지 않으며, `<>`, `?`는 아무 의미 없다
```java
// generic type과 instanceof를 사용할 때 좋은 방법
if(o instanceof Set) {  // raw type
    Set<?> m = (Set<?>) o;  // unbounded wildcard type
}
```

### 정리
* raw type을 사용하면 runtime error가 발생할 수 있으므로 사용하지 말자
   * raw type은 generic이 없던 때와의 호환성을 위해 제공된 것

|           |            `Set<Object>`            |                 `Set<?>`                 |              `Set`              |
| :-------: | :---------------------------------: | :--------------------------------------: | :-----------------------------: |
|    의미     | 매개변수화 타입<br/> 어떤 type도 포함할 수 있는 Set | unbounded wildcard type<br/> 미지정 type의 객체만을 포함할 수 있는 Set | raw type<br/> generic을 사용하지 않는다 |
| type safe |                  O                  |                    O                     |                X                |

* 용어 정리

| 용어                                      | 사용 예                               | 관련 규칙  |
| :-------------------------------------- | :--------------------------------- | :----- |
| parameterized type(매개변수화 타입)            | `List<String>`                     | 23     |
| actual type parameter(실 타입 매개변수)        | `String`                           | 23     |
| generic type                            | `List<E>`                          | 23, 26 |
| formal type parameter(형식 타입 매개변수)       | `E`                                | 23     |
| unbounded wildcard type(언바운드 와일드 카드 타입) | `List<?>`                          | 23     |
| raw type(원천 타입)                         | `List`                             | 23     |
| bounded type paremeter(바운드 타입 매개변수)     | `<E extends Number>`               | 26     |
| recursive type type(재귀적 타입 바운드)         | `<T extends Comparable<T>>`        | 27     |
| bounded wildcard type(바운드 와일드카드 타입)     | `List<? extends Number>`           | 28     |
| generic method                          | `static <E> List<E> asList(E[] a)` | 27     |
| type token                              | `String.class`                     | 29     |



## 규칙 24. Eliminate unchecked warnings
> 컴파일 경고 메시지가 없게 하자
* generic을 사용하면 unchecked cast, unchecked method call, unchecked generic array generate, unchecked conversion warning 등 발생

### 가능한 unchecked warning message를 없애자
* type safe 보장
* runtime시 ClassCastException 발생 방지
```java
// unchecked conversion
Set<Lark> exaltation = new HashSet();

// 수정
Set<Lark> exaltation = new HashSet<>();
```


### 메시지를 유발시킨 코드가 type safe를 보장한다면 @SuppressWarnings("unchecked")를 사용해 warning message를 억제
* `@SuppressWarnings`은 가급적 작은 범위에 사용
   * 변수 선언, 메소드, 생성자 등
   * Class에 하면 중요한 메시지를 감추게 된다

#### local variable에 @SuppressWarnings 선언
* return에는 @SuppressWarnings 선언 불가
```java
public <T> T[] toArray(T[] a) {
    if(a.length < size) 
        return (T[]) Arrays.copyOf(elements, size, a.getClass());  // unchecked warning
    System.arraycopy(elements, 0, a, 0, size);
    if(a.length > size)
        a[size] = null;
    return a;
}

// 수정
public <T> T[] toArray(T[] a) {
    if(a.length < size) {
        // 생성하는 배열이 인자로 전달된 것과 같으므로 캐스팅에 적합하다
        @SuppressWarnings("unchecked")
        T[] result =  (T[]) Arrays.copyOf(elements, size, a.getClass());
        return result;
    }

    System.arraycopy(elements, 0, a, 0, size);
    if(a.length > size)
        a[size] = null;
    return a;
}
```
* 다른 사람의 코드 이해를 위해 `@SuppressWarnings("unchecked")`사용시 이유를 주석화


### 정리
* unchecked warning message는 중요하므로 무시하지 말자
* 모든 unchecked warning message runtime시 ClassCastException 발생 가능성을 나타낸다
* unchecked warning message를 최선을 다해 없애자
* 특정 unchecked warning message를 없앨 수는 없지만 type safe를 보장한다면 최소한의 범위로 `@SuppressWarnings`을 사용해 억제하고 이유도 주석화



## 규칙 25. Prefer lists to arrays
> Array보다는 List를 사용하자

### Array가 generic과 다른 점

#### 1. array는 공변 covariant(공변), generic은 invariant(불변)
* array는 covariant
   * Sub가 Super의 서브 타입이면 Sub[]는 Super[]의 서브타입
* generic은 invariant
   * 서로 다른 타입 Type1, Type2에 대해 List<Type1>은 List<Type2>의 서브 타입도, 수퍼 타입도 아니다
```java
// runtime error
Object[] objectArray = new Long[1];
objectArray[0] = "String";  // ArrayStoreException

// compile error
List<Object> ol = new ArrayList<>();
ol.add("String");
```
* 일찌감치 error를 발견하는 List를 사용하자

#### 2. array는 reified(구체적)
* array는 element를 runtime에 알고 지키게 한다
* generic은 erasure에 의해 구현
   * compile시 type safe하게 하고 runtime시에는 type 정보를 무시


### generic type, parameterized type, type parameter를 저장하는 배열 생성시 compile 발생
* `new List<E>[]`, `new List<String>[]`, `new E[]` 등
* `type safe` 때문
```java
List<String>[] stringList = new List<String>[1];  // compile error

// 아래 라인들은 정상
List<Integer> intList = Arrays.asList(42);
Object[] objects = stringList;
objects[0] = intList;  // 1번째 요소만 저장 - generic에 의해 나머지 값 소거
String s = stringList[0].get(0);  // Integer를 읽어서 ClassCastException -> 이걸 방지하기 위해 1번 라인에서 compile error
```

#### nonreifiable(비구체화) type
* `E`, `List<E>`, `List<String>` 같은 type 
* compile시보다 runtime시에 더 적은 정보를 갖는 type
   * array와 같은 구체화 type과는 반대
* parameterized type 중 reifiable type
   * `List<?>`, `Map<?, ?>` 같은 unbounded wildcard type


### generic 배열 생성시 E[]보다는 List<E>를 사용
* generic 배열 생성 에러 방지
* 성능이나 코드의 간결함에 손해를 볼 수 있지만, generict의 장점(type safe, 호환성 등)을 얻는다
```java
// generic을 사용하지 않는 reduce - concurrency의 결함이 있다
// synchronized 영역에서 alien 메소드를 호출하지 말 것
static Object reduce(List list, Function f, Object initVal) {
    synchronized(list) {
        Object result = initVal;
        for(Object o : list)
            result = f.apply(result, o);
        return result;
    }
}

interface Function {
    Object apply(Object arg1, Object arg2);
}
```

```java
// generic을 사용하지 않으면서 concurrency 결함이 없는 reduce
// List를 공유하는 다른 thread를 기다리게 하지 않고 복사한 list로 reduce
static Object reduce(List list, Function f, Object initVal) {
    Object[] snapshot = list.toArray();  // 내부적으로 List의 lock이 걸림
    Object result = initVal;
    for(Object o : list)
        result = f.apply(result, o);
    return result;
}
```

#### generic method
```java
interface Function<T> {
    T apply(T arg1, T arg2);
}
```

* compile error
```java
static <E> reduce(List<E> list, Function<E> f, E initVal) {
    E[] snapshot = list.toArray();  // list에 lock - compile error
    E result = initVal;
    for(E e : snapshot)
        result = f.apply(result, e);
    return result;
}
```

* warning
* 잘 동작하지만 runtime시에 ClassCastException 발생 가능성이 있다
```java
// E[]로 casting
static <E> reduce(List<E> list, Function<E> f, E initVal) {
    E[] snapshot = (E[])list.toArray();  // warning
    E result = initVal;
    for(E e : snapshot)
        result = f.apply(result, e);
    return result;
}
```

* 개선 - List 사용
```java
static <E> E reduce(List<E> list, Function<E> f, E initVal) {
    List<E> snapshot;
    synchronized(list) {
        snapshot = new ArrayList<>(list);
    }
    E result = initVal;
    for(E e : snapshot) 
        result = f.apply(result, e);
    return result;
}
```


### 정리
* array와 generic은 전혀 다른 type 규칙
* array는 covariant, reified
   * `runtime시 type safe`, compile시 non type safe
* generic은 invariant, nonreified
   * `compile시 type safe`, runtime시 non type safe -> type 정보가 사라진다
* 섞어 쓸 때 compile error, warning 이 나오면 `array를 List로 수정`



## 규칙 26. Favor generic types
> 제네릭 타입을 애용하자
* JDK에서 제공하는 generic을 이용하는 것뿐만 아니라 직접 만드는 법도 알면 좋다

### generification(제네릭화)
```java
// Object 기반의 collection -> generic 사용의 우선 대상
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
        if(size == 0)
            throw new EmptyStackException();
        Object result = elements[--size];
        elements[size] = null;
        return result;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    private void ensureCapacity() {
        if(elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```
* 문제 - stack에서 꺼낸 객체를 일일이 casting 해야함
   * 잘못 casting시 runtime error

### 1. type parameter E 추가 후 모든 Object를 E로 수정
```java
public class Stack<E> {
    private E[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new E[DEFAULT_INITIAL_CAPACITY];  // compile error
    }

    public void push(E e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public E pop() {
        if(size == 0)
            throw new EmptyStackException();
        E result = elements[--size];
        elements[size] = null;
        return result;
    }
    ...
}
```
* E와 같은 `non reifiable`(runtime보다 compile에 더 많은 정보를 갖는) type을 저장하는 array는 생성할 수 없다


### 2. non reifiable 생성 error 해결

#### 1. generic array 생성 금지를 피한다
* Object array를 생성하고 `generic type으로 casting`
* `@SuppressWarnings`로 warning 제거 및 주석 추가
```java
// elements array는 push(E)를 통해서만 인스턴스를 저장해서 type safe
// 그러나 elements의 runtime type은 Object[]다
@SuppressWarnings("unchecked")
public Stack() {
    elements = (E[]) new Object[DEFAULT_INITIAL_CAPACITY];
}
```

#### 2. elements type을 E[]에서 Object[]로 수정
```java
public class Stack<E> {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(E e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public E pop() {
        if(size == 0)
            throw new EmptyStackException();
    
        // push()에서 E만 element로 받으므로 E로 캐스팅
        @SuppressWarnings("unchecked")
        E result = (E) elements[--size];

        elements[size] = null;
        return result;
    }
    ...
}
```
* 2가지 중 scalar type보다는 array에 대한 unchecked cast warning를 억제하는게 더 위험하므로 2번째 방법 사용을 고려
* 그러나 2번째 방법은 사용하는 곳에서 casting이 많이 일어나므로 1번째 방법이 보편적으로 사용됨


### generic type의 경우 내면에 항상 List를 사용하는 것이 가능하거나 바람직하진 않다
* 언어 자체에서 List를 지원하지 않으므로 ArrayList는 array를 기반으로 구현
* 성능을 위해 HashMap은 array를 기반으로 구현 


### primitive type은 저장할 수 없다
* generic의 제약
* primitive type 대신 `boxed primitive` class 이용


### bounded type parameter로 type parameter의 허용 가능한 값 제한
```java
// E - bounded type parameter
class DelayQueue<E extends Delayed> implements BlockingQueue<E>;
```
* `actual type parameter`가 Delayed의 서브 클래스여야 한다는 의미
* DelayQueue의 element로 Delayed 메소드 이용 가능
* 명시적 casting 불필요
* ClassCastException 발생 위험이 없다


### 정리
* client에서 캐스팅을 하는 type보다 generic type이 더 안전하고 사용하기 쉽다
* 새로운 type 설계시 casting 없이 사용 가능한지 확인
   * type을 generic하게 만든다는 의미가 된다
* 기존 type을 generification하면 기존 코드에 side effect 없이 더욱 쉽게 사용할 수 있다 



## 규칙 27. Favor generic methods
> 제네릭 메소드를 애용하자

* 메소드 또한 generification하면 이득
* `static util method`는 generification의 좋은 후보
* Collection의 알고리즘 메소드(binaraySearch, sort 등)는 generification

### generification

#### raw type 사용
```java
public static Set union(Set s1, Set s2) {
    Set result = new HashSet(s1);  // unchecked warning
    result.addAll(s2);  // unchecked warning
    return result;
}
```

#### 개선 - generic method
* type safe, easy use
* 모두 type이 같아야 하는 제약
   * `bounded wildcard type`을 사용하면 더 유연하게 만들 수 있다
```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}

// usage
public static void main(String[] args) {
    Set<String> guys = new HashSet<>(Arrays.asList("Tom", "Dick", "Harry"));
    Set<String> stooges = new HashSet<>(Arrays.asList("Larry", "Moe", "Curly"));
    Set<String> aflCio = union(guys, stooges);
    System.out.println(aflCio);
}
```

### generic method 특성
* generic constructor 호출시 반드시 명시적으로 parameter type 지정해야 하지만 `generic method 호출시에는 지정할 필요가 없다`
   * `type inference(타입 추론)` 때문
   * Java 7부터 `<>`로 인해 generic constructor도 지정할 필요 없어짐

> #### type inference
> * compiler가 method parameter의 type을 조사하여 값을 찾는 것

#### generic constructor에서 명시적 paremater type 지정 개선하기 
* generic static factory 메소드 작성
```java
// before
Map<String, List<String>> map = new HashMap<String, List<String>>();

// after - generic static factory method 사용
public static <K, V> HashMap<K, V> newHashMap() {
    return new HashMap<K, V>();
}

Map<String, List<String>> map = newHashMap();
```

### generic singleton factory
* immutable이지만 여러 type에 적합한 객체를 생성 필요할 경우
* generic은 erasure에 의해 구현되므로, 필요한 모든 타입의 매개변수화를 위해 `단일 객체를 사용`
* 요청된 각 타입의 매개변수화에 사용될 객체를 반복해서 `분배하는 static factory method` 작성 필요
   * `Collections.reverseOrder(`), `Collections.emptySet()` 등에서 사용

#### generic singleton factory pattern을 사용하여 identity function(항등 함수) 구현하기
```java
public interface UnaryFunction<T> {
    T apply(T arg);
}

// generic singleton factory pattern
// 상태 값을 가지지 않으므로, 매번 인스턴스를 생성하면 리소스 낭비되므로
private static UnaryFunction<Object> IDENTITY_FUNCTION = new UnaryFunction<Object>() {
    @Override
    public Object apply(Object arg) {
        return arg;
    }
};

// 상태 값이 없고, unbounded type parameter를 갖는다
// 모든 type에서 하나의 instance를 공유해도 안전
@SuppressWarnings("unchecked")
public static <T> UnaryFunction<T> identityFunction() {
    return (UnaryFunction<T>) IDENTITY_FUNCTION;
}

// usage
public static void main(String[] args) {
    String[] strings = {"jute", "hemp", "nylon"};
    UnaryFunction<String> sameString = identityFunction();
    for (String s : strings)
        System.out.println(sameString.apply(s));

    Number[] numbers = {1, 2.0, 3L};
    UnaryFunction<Number> sameNumber = identityFunction();
    for(Number n : numbers)
        System.out.println(sameNumber.apply(n));
}
```


### recursive type bound(재귀적 타입 바운드)
* type parameter가 자신을 포함하는 수식에 의해 한정될 경우
* natual order를 정의하는 `Comparable`와 가장 많이 사용된다
* 모든 요소들이 mutually comparable(상호 비교)될 수 있어야 한다
```java
public interface Comparable<T> {
    int compareTo(T o);
}

// recursive type bound를 사용한 mutually comparable 표현
// <T extends Comparable<T>> - 자신과 비교될 수 있는 모든 타입을 T라고 정의
public static <T extends Comparable<T>> T max(List<T> list){
    Iterator<T> iterator = list.iterator();
    T result = iterator.next();
    while (iterator.hasNext()) {
        T t = iterator.next();
        if(t.compareTo(result) > 0)
            result = t;
    }
   return result;
}
```
* `recursive type bound와 bound wildcard`를 이해하면 수많은 recursive type bound에 대처할 수 있다

### 정리
* 가능하면 기존 메소드를 generic method로 만들자 - generification
   * 기존 코드에 side effect 없이 더욱 쉽게 사용할 수 있다
   * 메소드 인자와 반환 값을 클라이언트 코드에서 캐스팅할 필요가 없다
      * type safe 보장
      * 캐스팅 없이 사용할 수 있다 -> 메소드가 generic 하다
   * generification할 때 generic method가 type처럼 캐스팅 없이 사용될 수 있는지 반드시 확인



## 규칙 28. Use bounded wildcards to increase API flexibility
> 바운드 와일드 카드를 사용해서 API의 유연성을 높이자

### bounded wildcard type
```java
Iterable<? extends E>
```
* parameterized tpye은 invariant(불변)
   * `List<String>`과 `List<Object>`은 다르다
* 불변 타입이 제공하는 것보다 유연성이 필요할 경우 사용

#### pushAll()
```java
public class Stack<E> {
    public Stack();
    public void push(E e);
    public E pop();
    public boolean isEmpty();

    // wildcard type 사용하지 않는 pushAll()
    public void pushAll(Iterable<E> src) {
        for(E e : src)
            push(e);
    }
}

// usage
Stack<Number> numberStack = new Stack<>();
Iterable<Integer> integers = ..;
numberStack.pushAll(integers);  // error - parameterized type은 invariant기 때문
```

* bounded wildcard type 사용
```java
// Iterable<? extends E> -> E의 어떤 서브타입의 Iterable다
public void pushAll(Iterable<? extends E> src) {
    for(E e : src) 
        push(e);
}
```

#### popAll()
```java
public void popAll(Collection<E> dest) {
    while(!isEmpty())
        dest.add(pop());
}

// usage
Stack<Number> numberStack = new Stack<>();
Collection<Object> objects = ..;
numberStack.popAll(objects);  // error
```

* bounded wildcard type 사용
```java
// Collection<? super E> -> E의 어떤 수퍼타입을 저장하는 Collection이다
public void popAll(Collection<? super E> dest) {
    while(!isEmpty())
        dest.add(pop());
}
```

### 유연성을 극대화 하려면 `method parameter에 wildcard type`을 사용
* parameter가 producer, consumer 모두에 해당하면 wildcard type은 좋지 않다
* 정확한 type 일치가 필요하므로 wildcard가 필요 없다

### PECS
* 어떤 wildcard를 선택할지 결정하는데 사용
* PE -> `producer(생산자) - extends`
   * parameter type이 T 생산자를 나타낼 경우 - `<? extends T>` 사용
* CS -> `consumer(소비자) - super`
   * parameter type이 T 소비자를 나타낼 경우 - `<? super T>` 사용

```java
// src는 stack에서 사용될 인스턴스를 생성 -> producer
public void pushAll(Iterable<? extends E> src)

// dest는 stack으로 부터 인스턴스를 소비 -> consumer
public void popAll(Collection<? super E> dest)
```

#### reduce()의 경우
* before
```java
static <E> E reduce(List<E> list, Function<E> f, E initVal)

// usage
interface Function<T> {
    T apply(T arg1, T arg2);
}

Function<Number> numberFunction = new Function<Number>() {
    @Override
    public Number apply(Number arg1, Number arg2) {
        return arg1.intValue() + arg2.intValue();
    }
};

List<Integer> numList = Arrays.asList(1, 2, 3);
Number result = reduce(numList, numberFunction, 0);  // compile error
```

* after
```java
// list는 reduce의 결과를 생산하는데 사용 - producer로 사용
// f는 producer, consumer로 사용 - wildcard 사용 X
static <E> E reduce(List<? extends E> list, Function<E> f, E initVal)
```


#### union()의 경우
* before
```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}
```

* after
```java
// s1, s2는 union의 결과를 생산하는데 사용 - producer로 사용
// return type은 Set<E>
public static <E> Set<E> union(Set<? extends E> s1, Set<? extends E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}

// usage
Set<Integer> integers = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Double> doubles = new HashSet<>(Arrays.asList(1.2, 2.3, 3.4));

// explicit type parameter
Set<Number> numbers = Union.<Number>union(integers, doubles);  

// Java7 부터는 explicit type parameter 필요 없다
Set<Number> numbers = Union.union(integers, doubles);  
```
* `return type에는 wildcard type을 사용하지 말자`
   * client에서 wildcard type을 사용해야 하는 문제가 생기기 때문
   * clinet는 wildcard type을 알 수 없도록 해야하다
* wildcard type은 `반드시 받아야하는 parameter와 거부해야할 parameter를 구분`해준다
* client가 `wildcard type 때문에 고민해야 한다면 해당 API에 문제`가 있는 것


```java
public static <T extends Comparable<T>> T max(List<T> list){
    Iterator<? extends T> iterator = list.iterator();
    T result = iterator.next();
    while (iterator.hasNext()) {
        T t = iterator.next();
        if(t.compareTo(result) > 0)
            result = t;
    }
    return result;
}

// list는 max()의 결과를 생산하는데 사용 - producer
// Comparable<T>는 T 인스턴스를 소비 - consumer
// Comparable은 항상 소비자 - 항상 Comparable<? super T> 사용
public static <T extends Comparable<? super T>> T max(List<? extends T> list){
    Iterator<? extends T> iterator = list.iterator();
    T result = iterator.next();
    while (iterator.hasNext()) {
        T t = iterator.next();
        if(t.compareTo(result) > 0)
            result = t;
    }
    return result;
}
```


### generic type VS wildcard type
* 둘 중 더 좋은 것은?
```java
// generic type
public static <E> void swap(List<E> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));
}

// unbounded wildcard type
public static void swap(List<?> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));  // compile error - list가 List<?>라서 null을 제외한 어떤 값도 추가할 수 없다
}
```
* public API 관점에서는 wildcard type이 더 간단
   * type parameter를 고민할 필요없이 전달만 하면 List의 요소로 저장한다
* `method 선언부에 type parameter가 1번만 나타나면` wildcard로 바꾸면 된다
   * type parameter가 unbounded면 unbounded wildcard, bounded면 bounded wildcard로 변경

* unbounded wildcard type compile error 개선 - 
```java
public static void swap(List<?> list, int i, int j) {
    swapHelper(list, i, j);
}

// wildcard type을 잡아내기 위한 helper method
// list는 List<E>, 요소가 E인 것을 안다. 어떤 E를 추가해도 compile error가 없다
private static <E> void swapHelper(List<E> list, int i, int j) {
    list.set(i, list.set(j, list.get(i)));
}
```

### 정리
* method API에 wildcard type을 사용하면 유연한 API를 만들 수 있다
* 라이브러리를 작성한다면 wildcard type을 올바르게 사용해야 한다
* PECS를 기억
   * `Producer - extends`, `Consumer - super`
   * `Comparable`, `Comparator`는 consumer



## 규칙 29. Consider typesafe heterogeneous containers
> 타입 안전이 보장되는 heterogeneous 컨테이너의 사용을 고려하자

* generic은 Collection(Set, Map)과 단일 요소 저장 컨테이너에 많이 사용(ThreadLocal, AtomicReference)
   * 매개변수화 되는 것은 컨테이너
   * 컨테이너의 특성에 따라 `type parameter의 개수 제한`
      * Set<T> -> 1개
      * Map<K, V> -> 2개
* 제한을 피하기 위해 컨테이너 대신 `key를 매개변수화`

### type safe heterogeneous container pattren
```java
public class Favorites {

    // 일반 Map과 다르게 key 별로 서로 다른 type
    // Class<?>가 가능하게 함
    private Map<Class<?>, Object> favorites = new HashMap<>();

    public <T> void putFavorite(Class<T> type, T instance) {
        if (type == null)
            throw new NullPointerException("Type is null");

        favorites.put(type, instance);  // object로 type을 읽어버리지만 get에서 복구됨
    }

    public <T> T getFavorite(Class<T> type) {
        return type.cast(favorites.get(type));  // dynamic casting
    }
}

// usage
public static void main(String[] args) {
    Favorites f = new Favorites();
    f.putFavorite(String.class, "Java");
    f.putFavorite(Integer.class, 0xcafebabe);
    f.putFavorite(Class.class, Favorites.class);

    String favoriteString = f.getFavorite(String.class);
    int favoriteInteger = f.getFavorite(Integer.class);
    Class<?> favoriteClass = f.getFavorite(Class.class);
    System.out.printf("%s %x %s\n", favoriteString, favoriteInteger, favoriteClass.getName());
}
```
* type safe 보장
* 각 key별로 다른 type
* Class가 매개변수화된 key의 역할
   * 1.5에서 generification 되었기 때문

> #### type token
> * compile, runtime시에 type 정보를 전하기 위해 Class 리터럴이 parameter로 전달될 때 Class 리터럴을 type token이라 한다

### Favorites.class의 제약

#### 1. client가 Class 객체를 raw type으로 사용하면 type safe를 훼손시킨다
* `dynamic casting`으로 runtime시에 type safe 보장
```java
public <T> void putFavorite(Class<T> type, T instance) {
    favorites.put(type, type.cast(instance));
}
```
* Collections의 `checkedSet(), checkedList(), checkedMap()`등이 이와 같은 패턴 사용

```java
// Collections.checkedMap()
public static <K, V> Map<K, V> checkedMap(Map<K, V> m,
                                          Class<K> keyType,
                                          Class<V> valueType) {
    return new CheckedMap<>(m, keyType, valueType);
}

// private static class CheckedMap constructor
CheckedMap(Map<K, V> m, Class<K> keyType, Class<V> valueType) {
    this.m = Objects.requireNonNull(m);
    this.keyType = Objects.requireNonNull(keyType);
    this.valueType = Objects.requireNonNull(valueType);
}
```
* Collection과 Class 객체를 인자로 받아, compile시 Class 객체와 collection의 타입이 일치하는지 확인
* Collection을 둘러 싸서 구체화 해주는 일종의 `wrapper method`


#### 2. non reifiable type에 사용될 수 없다
* Favorites객체를 `String, String[]`에 저장할 수 있지만, `List<String>`에는 저장할 수 없다
* runtime시에 generic 정보가 사라지므로..
```java
Favorites f = new Favorites();

String[] stringArray = {"aa", "ff", "cc"};
f.putFavorite(String[].class, stringArray);

List<String> stringList = new ArrayList<>();
f.putFavorite(List<String>.class, stringList);  // compile error - List<String>의 Class를 얻을 수 없기 때문

// 같은 key가 되어 덮어써진다
List<String> stringList = new ArrayList<>(Arrays.asList("aa", "ff", "cc"));
f.putFavorite(List.class, stringList);

List<Integer> integerList = new ArrayList<>(Arrays.asList(1, 2, 3));
f.putFavorite(List.class, integerList);

List list = f.getFavorite(List.class);  // [1, 2, 3]
```

* `super type` token 사용
* generic class 정의 후 상속 받으면 runtime시에 generic 정보를 가져올 수 있다
   * `jackson의 TypeReference<T>` 참고
```java
class SuperTypeToken<T> {
}

public class Favorites {
    private Map<Type, Object> favorites = new HashMap<>();

    public <T> void putFavorite(Type type, T instance) {
        if (type == null)
            throw new NullPointerException("Type is null");

        favorites.put(type, instance);
    }

    public <T> T getFavorite(Type type) {
        return (T) favorites.get(type);
    }
}

// usage
SuperTypeToken stringListToken = new SuperTypeToken<List<String>>() {};
SuperTypeToken integerListToken = new SuperTypeToken<List<Integer>>(){};

Type stringListType = ((ParameterizedType)stringListToken.getClass().getGenericSuperclass()).getActualTypeArguments()[0];
Type integerListType = ((ParameterizedType)integerListToken.getClass().getGenericSuperclass()).getActualTypeArguments()[0];

Favorites f = new Favorites();
List<String> stringList = new ArrayList<>(Arrays.asList("aa", "ff", "cc"));
f.putFavorite(stringListType, stringList);

List<Integer> integerList = new ArrayList<>(Arrays.asList(1, 2, 3));
f.putFavorite(integerListType, integerList);
   
List<String> list = f.getFavorite(stringListType);     
List<Integer> integerlist = f.getFavorite(integerListType);


// refactoring
public abstract class TypeReference<T> {

    private final Type type;

    public TypeReference() {
        this.type = ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
    }

    public Type getType() {
        return type;
    }
}

public class Favorites {

    private Map<Type, Object> favorites = new HashMap<>();

    public <T> void putFavorite(TypeReference typeReference, T instance) {
        if (typeReference == null)
            throw new NullPointerException("Type is null");

        favorites.put(typeReference.getType(), instance);
    }

    @SuppressWarnings("unchecked")
    public <T> T getFavorite(TypeReference typeReference) {
        Type type = typeReference.getType();

        Class<T> clazz;

        if(type instanceof ParameterizedType) {
            clazz = (Class<T>)((ParameterizedType)type).getRawType();
        } else {
            clazz = (Class<T>) type;
        }

        return clazz.cast(favorites.get(type));
    }
}

// usage
TypeReference stringListType = new TypeReference<List<String>>() {};
TypeReference integerListType = new TypeReference<List<Integer>>() {};

Favorites f = new Favorites();
List<String> stringList = new ArrayList<>(Arrays.asList("aa", "ff", "cc"));
f.putFavorite(stringListType, stringList);
        
List<Integer> integerList = new ArrayList<>(Arrays.asList(1, 2, 3));
f.putFavorite(integerListType, integerList);

List<String> list = f.getFavorite(stringListType);
System.out.println(list);

List<Integer> integerlist = f.getFavorite(integerListType);
System.out.println(integerlist);
```


### Favorites에서 사용하는 type token은 unbounded(제한이 없는) type token
* 어떤 Class 객체도 인자로 받는다는 의미
* 때때로 제한할 필요가 있다면 `bounded type token` 사용
   * `bounded type parameter`, `bounded wildcard type`
   * Annotation에서 많이 사용

```java        
// interface AnnotatedElement
// annotationClass는 bounded type token
<T extends Annotation> T getAnnotation(Class<T> annotationClass);
```

#### asSubclass()로 bounded type token으로 안전하게 캐스팅
* Class<?> 타입의 객체를 getAnnotation()처럼  bounded type token을 필요로 하는 메소드에 전달할 경우 사용
```java
static Annotation getAnnotation(AnnotatedElement element, String annotationTypeName) {
    Class<?> annotationType = null;  // unbounded type token
    try {
        annotationType = Class.forName(annotationTypeName);
    } catch (Exception e) {
        throw new IllegalArgumentException(e);
    }
    return element.getAnnotation(annotationType);  // <? extends Annotation>이라 compile error
}

// 개선
return element.getAnnotation(annotationType.asSubclass(Annotation.class));
```


### 정리
* container에 generic을 사용하면 type parameter의 숫자가 제한된다
* container 자체보다 key에 type parameter를 두자
* 서로 다른 type을 저장할 수 있는 container를 heterogeneous container라 한다
   * key로 Class 객체 사용 가능
   * ex. DB의 row를 표현하는 `DatabaseRow`면 key로 `Column<T>` 사용

