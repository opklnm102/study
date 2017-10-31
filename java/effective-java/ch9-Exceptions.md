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
> checked 예외의 불필요한 사용을 피하자


### Checked Exception
* 에러 코드를 반환하는 방식과는 다르게, `처리하지 않을 수 없도록` 한다
* 과용은 API 사용을 불편하게 만들 수 있다
* API를 올바르게 사용해도 `예외 상황을 피할 수 없고`, 예외를 만나더라도 API 사용자가 조치를 취해야 한다면 사용자로선 부담스럽다
   * try-catch 사용으로 번거롭다
   * 2가지 상황을 모두 만족시키지 못한다면 `unchecked exception`을 사용하는 것이 더 적합
   * 오직 하나의 checked exception을 발생시킨다면 checked exception을 피하는 방법이 없는지 고려

#### ex. CloneNotSupportedException
* Cloneable을 구현하는 객체에게만 호출되는 Object.clone()에서 발생시킨다
* clone()가 호출된 객체의 클래스에서 Cloneable을 구현하지 않은 것에 대한 assertion 실패 외에는 특별히 처리하는 내용이 없다
* 이런 exception을 checked exception으로 사용하면 프로그램이 복잡해진다


### checked exception을 unchecked exception으로 바꾸는 방법
* exception을 발생시키는 메소드를 쪼갠다
* 예외 발생을 나타내는 상태 검사 메소드(boolean 반환) 사용
```java
// before - checked exception을 사용한 메소드 호출
try {
    obj.action(args);
} catch(TheCheckedException e) {
    // 예외 처리
}

// after - 상태 검사 메소드와 unchecked exception을 사용한 메소드 호출
if (obj.actionPermitted(args)) {
    obj.action(args);
} else {
    // 예외 처리
}
```
* 깔끔하진 않지만 만들어진 API는 유연성이 더 좋다
* 메소드 호출이 성공할거라는 것을 사용자는 알고 있거나, 실패할 경우 해당 쓰레드를 종료시킬 경우에 상태-검사 메소드 호출 없이 간단하게 호출할 수 있다
```java
obj.action(args);
```
* 만일 이런 간단한 호출이 정상이라고 느껴지면, 상태 검사 메소드를 사용한 API가 적합할 수 있다
* 동시적으로 사용하거나, 외부에서 객체의 상태를 변경하는 경우에는 부적절
   * 상태 검사 메소드 호출 후 상태가 변경될 수 있기 때문



## 규칙 60. Favor the use of standard exceptions
> 표준 예외를 사용하자

* 고도로 숙련된 프로그래머는 높은 수준의 코드 재사용을 위해 끊임 없이 노력하여 성취
* exception 역시 코드 재사용이 좋다는 총칙에서 벗어날 수 없다
* Java에선 기본적인 unchecked exception 제공
    * 대부분의 API에서 필요로 하는 예외 메커니즘의 많은 부분을 담당

### 기존 예외 재사용의 장점
1. 프로그래머들이 익숙해진 내용과 일치하기 때문에 API를 `배우고 사용하기 쉽게` 해준다
2. API에서 생소한 예외를 사용하지 않으므로 코드를 `이해하기 쉽다`
3. 적은 수의 예외 클래스를 사용하므로, `메모리 사용도 적고` 클래스를 `메모리로 로딩하는 시간도 줄어든다`


#### 흔히 재사용되는 예외
| exception | usage |
|:----:|:---:|
| IllegalArgumentException | null이 아닌 매개변수 값이 부적합할 때 |
| IllegalStateException | 객체가 메소드 호출이 가능한 상태가 아닐 때 |
| NullPointerException | 매개변수 값이 null일 때 |
| IndexOutOfBoundsException | 인덱스 매개변수 값이 범위를 벗어날 때 |
| ConcurrentModificationException | 동시적인 수정이 금지된 객체가 변경되었을 때 |
| UnsupportedOperationException | 해당 객체에서 메소드를 지원하지 않을 때 |


* 요구에 맞는 예외가 있다면 주저 없이 사용
* 예외를 던져야 하는 상황이 그 예외의 문서화된 내용과 일치할 때만 사용
* 재사용할 때는 이름만이 아닌 내용적인 의미를 기반으로 해야 한다
* 더 많은 정보를 추가하고 싶으면, 기존 예외 클래스의 서브 클래스를 만들어 사용



## 규칙 61. Throw exceptions appropiate to the abstarction
> 하위 계층의 예외처리를 신중하게 하자

### Exception Translation(예외 변환)
* 어떤 메소드가 자신이 수행하는 작업과 뚜렷한 관계가 없는 예외를 발생시킨다면 혼란스러울 것
* 저수준의 추상체에서 발생한 예외를 메소드가 전파할 때 종종 생긴다
   * 저수준의 추상체 -> 네트웍, DB 등과 같은 외부와의 인터페이스를 담당하는 하위 계층
* 상위 계층의 API에서 세부적인 구현 내역이 노출된다
* 만일 상위 계층의 구현 내역이 차후 배포판에서 변경되면, 거기에서 발생시키는 예외도 변경될 것이고, 클라이언트에도 영향을 준다
* 상위 계층에서 `하위 계층의 예외를 반드시 catch`하여 catch한 예외 대신 상위 계층의 추상체가 알 수 있는 예외로 `바꿔 던져야`한다 -> `Exception Translation`
```java
// exception translation
try {
    // 하위 계층의 추상체를 사용하는 코드
} catch(LowerLevelException e) {
    throw new HigherLevelException(...);
}
```

#### example
```java
// AbstractSequentialList의 exception translation
public E get(int index) {
    ListIterator<E> i = listIterator(index);
    try {
        return i.next();
    } catch(NoSuchElementException e) {
        throw new IndexOutOfBoundsException("index: " + index);
    }
}
```


### Exception Chaining(예외 연쇄)
* 고수준(상위 계층) 예외를 유발시킨 저수준(하위 계층) 예외가 문제점을 디버깅하는 사람에게 도움이 될 수 있는 경우에 적합
* 예외의 근원인 `저수준 예외가 고수준 예외로 전달`되는 것
   * 고수준 예외에서는 저수준 예외의 getter 제공

```java
// exception chaining
try {
    // 저수준의 추상체를 사용하는 코드
} catch(LowerLevelException cause) {
    throw new HigherLevelException(cause);
}
```
* 고수준 예외의 생성자에서는 예외 연쇄를 알 수 있는 수퍼 클래스의 생성자를 다시 호출하면서 `생성자의 인자로 저수준 예외를 전달`
```java
// exception chaining을 사용하는 고수준 exception class
class HigherLevelException extends Exception {
    HigherLevelException(Throwable cause) {
        super(cause);
    }
}
```
* 대부분의 표준 예외들은 예외 연쇄를 알고 있는 생성자를 갖고 있다
   * 없는 경우 `Throwable.initCause()`를 사용해 근원(저수준) 예외를 설정
* `근원 예외를 사용`할 수 있고, `stack trace를 고수준 예외와 통합`할 수 있다
* 하위 계층에서 발생한 예외를 분별 없이 전파하는 것보다는 exception translation을 사용하는 것이 좋지만, exception translation 역시 남용해서는 안된다


### 하위 계층에서 예외 처리
* 가장 좋은 방법
   * 하위 계층의 메소드가 성공적으로 실행되도록 하여 예외가 생기지 않도록 하는 것
   * 상위 계층 메소드의 매개변수를 `하위 계층으로 전달하기 전`에 적합성을 철저히 판단
* 하위 계층에서 발생하는 예외를 막을 수 없을 때
   * 상위 계층에서 하위 계층 메소드의 예외를 조용히 처리하여 상위 계층 메소드의 호출자가 `하위 계층 메소드의 문제를 모르도록` 하는 것
   * 예외를 적절히 로깅 처리
      * 클라이언트와 최종 사용자는 문제에서 격리되거, 시스템 관리자는 문제를 조사할 수 있다


### 정리
* `exception translation`
   * 하위 계층에서 발생한 예외를 `막거나`, 그 자체에서 `처리할 수 없을` 경우
   * 하위 계층에서 발생되는 예외가 상위 계층의 예외와 `대응되지 않을` 경우 적합
* `exception chaining`
    * 모든 경우에서 가장 좋은 방법 제공
    * 하위 계층의 예외가 발생할 때 `적합한 상위 계층 예외를 던질 수` 있다
    * 근원 예외의 정보를 기록하여 `시스템 장애 분석`에 사용할 수 있다



## 규칙 62. Document all exceptions thrown by each method
> 메소드가 던지는 모든 예외를 문서화하자

* 충분한 시간을 가지고 메소드에서 던지는 모든 예외를 문서화

### @throws 태그를 사용해 항상 checked exception은 별도로 선언하고, 각 예외가 발생하는 상황을 정확하게 문서화
* 메소드가 던지는 예외가 많다고 해서, 공통의 수퍼 클래스로 함축해서 나타내면 안된다
   * throws Exception
* 메소드가 던질 수 있는 예외를 사용자가 제대로 알 수 없어서 메소드 사용을 방해하게 된다

### unchecked exception을 사용자가 검사할 필요는 없지만, checked exception만큼은 신중하게 문서화
* unchecked exception은 에러를 나타내므로, 문서화하면 에러를 피할 수 있게 도와준다
메소드가 성공적으로 실행되기 위한 precondition(사전조건)을 효과적으로 나타낸다

#### 인터페이스에 정의된 메소드의 경우
* 자신이 던질 수 있는 unchecked exception을 문서화하는 것이 중요
* 인터페이스의 general contract 중 일부가 되며, 구현체들의 공통적인 행동을 나타내기 때문

### @throw 태그를 사용해 unchecked exception을 문서화, 메소드 선언부에는 throws로 unchecked exception은 넣지 말자
* checked exception과 `구분`하기 위함


### 문서화의 어려움
* 모든 unchecked exception을 문서화한다는 것은 현실적으로 어렵다
* 하위 계층에 추가된 unchecked exception이 외부로 전파될 수 있기 때문
   * 상위 계층 클래스의 문서화에는 누락되고 만다

### 같은 클래스의 여러 메소드에서 동일한 이유로 1가지 예외를 던질 경우
* 클래스의 문서화 주석에 추가하는 것이 좋다
   * NullPointerException - null이 메소드의 매개변수로 전달될 경우 이 클래스의 모든 메소드에서는 NullPointerException을 던진다

### 정리
* 각 메소드에서 던질 수 있는 모든 exception을 문서화하자
   * checked exception, unchecked exception
* 메소드 선언부의 `throws`에는 checked exception는 넣되, unchecked exception은 넣지 말자
* 문서화에 실패하면 다른 사용자가 클래스를 사용하기 어려울 것이다



## 규칙 63. Include failure-capture information in detail messages
> 실패 상황 정보를 상세 메시지에 포함하자

* catch 하지 않은 예외로 실행이 실패하면, 시스템에서 자동으로 stack trace를 출력
* stack trace
   * 예외를 나타내는 문자열
   * `예외 클래스 이름 + 상세 메시지`로 구성
* 향후 분석을 위해 상세 메시지에는 `실패 원인과 관련된 정보`가 있어야 한다
* 실패 상황 정보를 잡으려면, 예외 발생에 기여한 `모든 매개변수와 필드의 값`이 예외의 상세 메시지에 포함되어야 한다
   * IndexOutOfBoundException -> index 범위, 실패 상황의 index 값
* 장황한 설명은 필요 X
   * 소스 파일과 연계하여 분석을 위한 용도
   * 사용자 수준의 에러 메시지와 다르게, 프로그래머에게 도움이 되어야 하는 것


### 추천 방법
* 문자열을 받는 대신 필요한 정보를 받는다
* 특정 예외에 대한 상세 메시지를 만드는 코드를 예외 클래스에서 관리
* 클래스 사용자가 상세 메시지를 중복해서 만들 필요가 없다
```java
public IndexOutOfBoundsException(int lowerBound, int upperBound, int index) {
    // 실패 상황정보를 담은 상세 메시지를 만든다
    super("Lower bound: " + lowerBound + ", Upper bound: " + upperBound + ", Index: " + index);

    // 프로그램에서 사용하기 위해 상황 정보를 보존
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.indxe = index;
}
```
* getter를 제공해 실패 상황에 따른 장애 복구에 도움이 되도록 한다



## 규칙 64. Strive for failure atomicity

## 규칙 65. Don't ignore exceptions

