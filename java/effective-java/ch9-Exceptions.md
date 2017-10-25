# Ch9. Exceptions
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 예외를 잘 사용하면 가독성, 신뢰성, 유지보수성을 향상시킬 수 있다
> 하지만 잘못 사용하면 반대의 효과를 낼 수 있다
> 효과적으로 예외를 사용하는 방법에 대해 정리해보고자함  


* [57. Use exceptions only for exceptional conditions](#규칙-57-use-exceptions-only-for-exceptional-conditions)
* [58. Use checked exceptions for recoverable conditions and runtime exceptions for programming errors](#규칙-58-use-checked-exceptions-for-recoverable-conditions-and-runtime-exceptions-for-programming-errors)
* [59. Avoid unnecessary use of checked exceptions](#규칙-59-avoid-unnecessary-use-of-checked-exceptions)
* [60. Favor the use of standard exceptions](#규칙-60-favor-the-use-of-standard-exceptions)
* [61. Throw exceptions appropiate to the abstarction](#규칙-61-throw-exceptions-appropiate-to-the-abstarction)
* [62. Document all exceptions thrown by each method](#규칙-62-document-all-exceptions-thrown-by-each-method)
* [63. Include failure-capture information in detail messages](#규칙-63-include-failure-capture-information-in-detail-messages)
* [64. Strive for failure atomicity](#규칙-64-strive-for-failure-atomicity)
* [65. Don't ignore exceptions](#규칙-65-dont-ignore-exceptions)


## 규칙 57. Use exceptions only for exceptional conditions
> 예외 상황에서만 예외를 사용하자

### exception의 터무니 없는 사용
```java
// 뭘하려는지 모르겠다
try {
    int i = 0;
    while(true)
        range[i++].climb();
} catch(ArrayIndexOutOfBoundsException e){
}

// 같은 동작
for(Mountain m : range) m.clinb();
```
* 배열의 요소를 loop로 처리할 때 exception을 사용한다는 잘못된 발상에서 비롯


왜 exception으로 루프를 종료하려는 것일까?

사용중인 배열의 범위를 JVM이 검사하기 때문에 정상적인 loop 종료 검사를 하면 중복되는 것이므로 피해야 한다는 논리 떄문
논리의 잘못된 점 3가지
1. exception은 예외 상황을 대비해 설계된 것이므로, JVM을 만드는 회사가 예외 처리 속도를 빠르게 하려고 매달릴만한 일은 아니다

2. try-catch 내부에 코드를 넣으면, 여러 종류의 JVM이 해줄 수 있는 최적화를 못하게 하는 부작용이 생길 수 있다
3. 배열을 loop 처리하면서 정상적인 종료 검사를 하는 표준 이디엄 코드가 반드시 중복 검사를 하는 것은 아니다. 근래에는 JVM이 최적화 한다

* 이름에서 의미하듯, exception은 `예외적인 상황에서만 사용`되는 것. 절대로 정상적인 흐름 제어에 사용하면 안된다


### 잘 설계된 API에서는 클라이언트가 예외를 사용해서 정상적인 흐름 제어를 하게끔 하지 않는다
* 예측할 수 없는 특정 상황에서만 호출될 수 있는 `state dependent(상태 종속) 메소드`를 갖는 클래스에서는 일반적으로 `state testing(상태 검사) 메소드`를 갖고 있어야 한다
```java
// Iterator.next() - 상태 종속 메소드
// Iterator.hasNext() - 상태 검사 메소드
for(Iterator<Foo> i = collection.iterator(); i.hasNext(); ) {
    Foo foo = i.next();
    ...
}

// Iterator.hasNext()가 없다면...?
// 예외 기반 loop는 코드가 장황하고, 혼란스럽고, 성능도 떨어진다
// 사용하지 말자..!
try {
    Iterator<Foo> i = collection.iterator();
    while(true) {
        Foo foo = i.next();
        ...
    }
} catch(NoSuchElementException e) {
}
```


#### 상태 검사 메소드를 별도로 제공하는 다른 방법
* `null(부적합한 상태의 객체로 호출되었을 때)과 같은 식별 값`을 반환하는 상태 종속 메소드를 두는 것
* 외부에서 동기화하지 않고 동시적으로 사용하거나 외부에서 객체의 상태를 변경해야 한다면 `식별 값 반환` 방법 사용
   * 상태 검사 메소드와 상태 종속 메소드 호출 사이에 생기는 시간 간격 도중에 객체의 상태가 변경될 수 있기 때문
* 상태 검사 메소드가 상태 종속 메소드의 일을 `중복 처리`한다면 성능을 고려해 `식별 값 반환` 방법 사용
* 모든 것이 동일하다면, 식별 값 반환 방법보다는 `상태 검사 메소드 사용`
   * 가독성이 더 좋다
   * 잘못된 사용시 문제를 찾기 쉽다
   * 상태 검사 메소드 호출을 빠뜨리면, 상태 종속 메소드에서 exception을 발생시키므로


### 정리
* exception은 `예외적인 상황에서 사용`하기 위해 설계되었다
* 정상적인 흐름제어에 exception을 사용하지 말자
* 클라이언트가 정상적인 흐름 제어에 exception을 사용하게 하는 API를 작성하지 말자



## 규칙 58. Use checked exceptions for recoverable conditions and runtime exceptions for programming errors

## 규칙 59. Avoid unnecessary use of checked exceptions

## 규칙 60. Favor the use of standard exceptions

## 규칙 61. Throw exceptions appropiate to the abstarction

## 규칙 62. Document all exceptions thrown by each method

## 규칙 63. Include failure-capture information in detail messages

## 규칙 64. Strive for failure atomicity

## 규칙 65. Don't ignore exceptions

