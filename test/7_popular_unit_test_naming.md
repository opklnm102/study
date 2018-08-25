# [Test] 7 Popular Unit Test Naming Conventions
> date - 2018.08.25  
> keyword - test, naming conventions  
> [7 Popular Unit Test Naming Conventions](https://dzone.com/articles/7-popular-unit-test-naming)를 요약

<br>

계좌에서 현금 출금에 대한 상황을에 대해 test method naming 해보자


## 1. MethodName_StateUnderTest_ExpectedBehavior
* test target method 이름에 변경이 생기면 `test method method 이름에도 변경이 생긴다`
  * code smell

```java
@Test
public void withdrawMoney_invalidAccount_exceptionThrown() {
    // ...
}
```


## 2.MethodName_ExpectedBehavior_StateUnderTest
* test target method 이름에 변경이 생기면 `test method method 이름에도 변경이 생긴다`
  * code smell

```java
@Test
public void withDrawMoney_throwsException_ifAccountIsInvalid() {
    // ...
}
```


## 3. test[feature being tested]
* test할 기능이 이름의 일부로 쓰여지므로 쉽게 이해할 수 있다
* test라는 접두어가 중복
  * JUnit 등 test framework는 test case라는걸 명시적으로 표현하는 기능이 있는데 네이밍에 `test` 접두어는 불필요?

```java
@Test
public void testFailToWithdrawMoneyIfAccountIsInvalid() {
    // ...
}
```


## 4. Feature to be tested
* 많은 사람들이 단순하게 테스트할 기능으로 작성하는게 더 낫다고 제안
  * test method를 식별하기 위해 annotation을 사용하기 때문
* unit test를 `문서의 대체로 만들고 code smell을 피하기 위해 권장`

```java
@Test
public void failToWithdrawMoneyIfAccountIsInvalid() {
    // ...
}
```


## 5. Should_ExpectedBehavior_When_StateUnderTest
* test를 쉽게 읽을 수 있도록 많은 사람들이 사용

```java
@Test
public void Should_failToWithdrawMoney_forInvalidAccount() {
    // ...
}
```


## 6. When_StateUnderTest_Expect_ExpectedBehavior
```java
@Test
public void When_invalidAccount_Expect_withdrawMoneyToFail() {
    // ...
}
```


## 7. Given_preconditions_When_StateUnderTest_Then_ExpectedBehavior
* BDD(Behavior-Driven Development) 기반으로 네이밍
* test를 3부분으로 나누어 전제 조건, 테스트중인 상태, 예상되는 동작의 형식으로 작성

```java
@Test
public void Given_userIsAuthenticated_When_invalidAccountNumberIsUsedToWithdrawMoney_Then_transactionsWillFail() {
    // ...
}
```


<br>

> #### Reference
> * [7 Popular Unit Test Naming Conventions(https://dzone.com/articles/7-popular-unit-test-naming)
