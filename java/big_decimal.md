# [Java] BigDecimal을 사용한 부동소수점 연산
> 부동소수점 연산의 정확도 문제를 해결하기 위해 BigDecimal 클래스를 사용한 경험을 정리

## 문제
* `double을 사용한 + 연산`시 원하던 값이 나오지 않는다
```java
private static final double EXPECTED_AMOUNT = 101.0;

@Test
public void test_double을_사용한_plus연산() throws Exception {
    // given : 10.1로
    double amount = 10.1;

    // when : 10번 plus 연산을 수행하면
    double totalAmount = 0.0;
    for (int i = 0; i < 10; i++) {
        totalAmount += amount;
    }

    // then : 연산 결과는 101이 된다
    assertThat(EXPECTED_AMOUNT, is(totalAmount));  // fail
}

/*
java.lang.AssertionError: 
Expected: is <100.99999999999999>
     but: was <101.0>
Expected :is <100.99999999999999>
     
Actual   :<101.0>
*/
```

## 해결 - BigDecimal 사용

### BigDecimal double 생성자 사용
* 역시나 원하던 값이 나오지 않는다
* double에 값을 넣는 순간 값의 오류가 생길 수 있다 
```java
private static final double EXPECTED_AMOUNT = 101.0;

@Test
public void test_BigDecimal을_사용한_plus연산_double_생성자의_경우() throws Exception {
    // given : 10.1로
    double amount = 10.1;

    // when : 10번 plus 연산을 수행하면
    BigDecimal totalAmount = new BigDecimal(0.0);
    for (int i = 0; i < 10; i++) {
        totalAmount = totalAmount.add(new BigDecimal(amount));
    }

    // then : 연산 결과는 101이 된다
    BigDecimal ExpectedAmount = new BigDecimal(EXPECTED_AMOUNT);

    assertThat(ExpectedAmount, is(totalAmount));  //  fail
}

/*
java.lang.AssertionError: 
Expected: is <100.9999999999999964472863211994990706443786621093750>
     but: was <101>
Expected :is <100.9999999999999964472863211994990706443786621093750>
     
Actual   :<101>
*/
```


### BigDecimal String 생성자 사용
* 원하던 정확한 결과가 도출..!
```java
private static final double EXPECTED_AMOUNT = 101.0;

 @Test
public void test_BigDecimal을_사용한_plus연산_String_생성자의_경우() throws Exception {
    // given : 10.1로
    double amount = 10.1;

    // when : 10번 plus 연산을 수행하면
    BigDecimal totalAmount = new BigDecimal("0.0");
    for (int i = 0; i < 10; i++) {
        totalAmount = totalAmount.add(new BigDecimal(String.valueOf(amount)));
    }

    // then : 연산 결과는 101이 된다
    BigDecimal ExpectedAmount = new BigDecimal(String.valueOf(EXPECTED_AMOUNT));

    assertThat(ExpectedAmount, is(totalAmount));  // success
}
```


## 정리
* 부동소수점 계산시  정확한 값의 계산을 위해서는 `BigDecimal(String)`을 사용하자
* double에 값을 넣는 순간 값의 오류가 생길 수 있기 때문에


