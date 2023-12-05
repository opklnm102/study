# [Spring Boot] About ISO 8601 & DateTimeFormatter
> date - 2023.12.04  
> keyword - spring boot, date, iso 8601, fraction  
> Fraction과 java.time.format.DateTimeParseException을 해결했던 이야기로 ISO 8601과 시간에 대한 내용은 [[Spring Boot] unix timestamp & ISO 8601 with spring boot](./unix_timestamp_iso_8601_with_spring_boot.md) 참고  

<br>

## Issue. DateTimeParseException
* `java.time.format.DateTimeParseException` 발생
```java
java.time.format.DateTimeParseException: Text '2023-12-04T16:33:32.12345678+09:00' could not be parsed at index 20
	at java.base/java.time.format.DateTimeFormatter.parseResolved0(DateTimeFormatter.java:2052)
	at java.base/java.time.format.DateTimeFormatter.parse(DateTimeFormatter.java:1880)
    ...
```


<br>

## Why?
* Spring Boot에서 기본적으로 시간을 표시할 때는 ISO 8601를 따르며, 일반적으로 ms(millisecond)까지 표시하지만, 000으로 끝나는 경우 생략한다
  * ms 표시 - 2023-12-04T21:30:10.000
  * ms 생략 - 2023-12-04T21:30:10
* 생략하지 않으려면 직접 형식을 지정해야한다
```java
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
String formattedDateTime = formatter.format(now);
System.out.println(formattedDateTime);
```

<br>

### yyyy-MM-dd'T'HH:mm:ss.SSSXXX 살펴보기

| Symbol | Description |
|:--|:--|
| yyyy | 연도(4자리) |
| MM | 월(2자리) |
| dd | 일(2자리) |
| 'T' | 날짜와 시간을 구분하는 문자 |
| HH | 시간(24시간 형식, 2자리) |
| mm | 분(2자리) |
| ss | 초(2자리) |
| SSS | millisecond(3자리)<br>SSSSSS(6자리, microseconds)<br>SSSSSSSSS(9자리, nanoseconds) |
| XXX | zone offset<br>X: +09<br>XX: +0900<br>XXX: +09:00 |


<br>

## Resolve
### ms가 표시된 시간을 LocalDateTime으로 변환하기
* 아래처럼 고정된 자릿수로 설정
```java
var formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
```

* test
```java
public class DateTimeFormatterTest {

  @Test
  public void test() {
    var input = "2023-12-04T22:41:43.316";
    var formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.316");
  }
}
```


<br>

### ms가 생략되어 있는 시간을 LocalDateTime으로 변환하기
* 소수점 이하 자릿수가 유동적인 ISO 8601 형식의 문자열을 LocalDateTime으로 변환
```java
var formatter = new DateTimeFormatterBuilder()
                .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)  // 소수점 아래 9자리의 생략된 자리를 처리
                .toFormatter();
```
* test
```java
public class DateTimeFormatterTest {

  @Test
  public void tes1() {
    var input = "2023-12-04T22:41:43.12";
    var formatter = new DateTimeFormatterBuilder()
            .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .toFormatter();

    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.12");
  }

  @Test
  public void tes2() {
    var input = "2023-12-04T22:41:43.123";
    var formatter = new DateTimeFormatterBuilder()
            .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .toFormatter();

    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.123");
  }

  @Test
  public void tes3() {
    var input = "2023-12-04T22:41:43.1234";
    var formatter = new DateTimeFormatterBuilder()
            .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .toFormatter();

    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.1234");
  }

  @Test
  public void tes4() {
    var input = "2023-12-04T22:41:43.12345";
    var formatter = new DateTimeFormatterBuilder()
            .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .toFormatter();

    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.12345");
  }

  @Test
  public void tes5() {
    var input = "2023-12-04T22:41:43.123456789";
    var formatter = new DateTimeFormatterBuilder()
            .append(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
            .toFormatter();
    
    LocalDateTime result = LocalDateTime.parse(input, formatter);

    assertThat(result).isEqualTo("2023-12-04T22:41:43.123456789");
  }
}
```


<br><br>

> #### Reference
> * [jackson-modules-java8 #76](https://github.com/FasterXML/jackson-modules-java8/issues/76)
> * [Class DateTimeFormatter - Java Docs](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/format/DateTimeFormatter.html)
