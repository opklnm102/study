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

## 규칙 48. Avoid float and double if exact answers are required

## 규칙 49. Prefer primitive types to boxed primitives

## 규칙 50. Avoid strings where other types are more appropriate

## 규칙 51. Beware the performance of string concatenation

## 규칙 52. Refer to objects by their interfaces

## 규칙 53. Prefer interfaces to reflection

## 규칙 54. Use native methods judiciously

## 규칙 55. Optimize judiciously

## 규칙 56. Adhere to generally accepted naming conventions

