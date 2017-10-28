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
> 복구 가능한 상황에서는 checked exception을 사용하고 runtime exception은 프로그램 에러를 사용하자

### Java의 throwable exception
* checked exception
* unchecked exception
   * runtime exception
   * error

### checked, unchecked exception 중 어떤 것을 사용할지 결정하는 기본 규칙

#### checked exception
* 메소드 호출자가 예외 복구를 할 수 있는 상황에서는 `checked exception` 사용
   * checked exception를 던지면, 메소드 호출자가 예외를 처리하거나, 외부로 던져야 한다
* 메소드 선언부에 throws로 선언한 checked exception은 메소드 호출 시 exception과 연관된 상황이 생길 수 있다는 강력한 암시를 API 사용자에게 주는 것
   * API 사용자가 checked exception과 만났다는 것은, 그런 상황을 복구하라는 지시를 API 설계자로부터 받은 것
   * catch하여 무시할 수 있지만 좋은 생각은 아니다

#### unchecked exception
* exception을 catch할 필요가 없고, catch해서도 안된다
* 복구가 불가능하고 계속 실행해봐야 더 해롭기만한 상황을 의미
* catch하지 않으면 현재 thread가 중단된다


### runtime exception을 사용해서 프로그래밍 에러를 나타내자
* 대부분의 runtime exception은 사전조건 위반을 나타낸다
   * 사전조건 위반 - API 클라이언트가 API 명세에 설정된 계약을 지키지 않은 것
* ex. array index는 0 ~ size - 1까지다 -> 위반시 ArrayIndexOutOfBoundsException 발생
* 우리가 구현하는 모든 unchecked exception은 `RuntimeException의 서브 클래스`여야 한다


#### error
* JVM에서 사용하며, 자원 부족, 불편 규칙 위반에 따른 실패, `JVM이 실행을 계속할 수 없는` 상황 등을 나타낸다
* 이런 내용에 의거하여 `Error의 서브 클래스는 만들지 않는게` 가장 좋다


### Exception이나 RuntimeException 또는 Error의 서브 클래스가 아닌 exception을 정의할 수 있다
* checked exception과 동일하다고 묵시적으로 기술
* checked exception에 비해 아무런 이점이 없다
* API 사용자를 혼란스럽게할 수 있다
* 그래서 사용하지 않는다


### 정리
* 복구 가능한 상황에는 checked exception을 사용하고, 프로그래밍 에러에는 runtime exception을 사용하자
* exception을 가지는 메소드
   * exception이 발생된 상황에 관련된 추가 정보를 갖는 exception을 catch하는 코드를 제공
   * exception이 없었다면 추가 정보를 찾기 위해 예외를 표현하는 문자열을 분석해야 했을 것
* checked exception은 복구 가능한 상황을 나타내므로 복구하는데 도움이 될 수 있는 정보를 제공하는 메소드를 갖는게 중요하다
   * ex. 잔액이 부족해서 실패할 경우, 부족액이 얼마인지 조회할 수 있는 메소드를 제공



## 규칙 59. Avoid unnecessary use of checked exceptions

## 규칙 60. Favor the use of standard exceptions

## 규칙 61. Throw exceptions appropiate to the abstarction

## 규칙 62. Document all exceptions thrown by each method

## 규칙 63. Include failure-capture information in detail messages

## 규칙 64. Strive for failure atomicity

## 규칙 65. Don't ignore exceptions

