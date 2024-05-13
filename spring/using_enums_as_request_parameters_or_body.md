# [Spring] Using Enums as request parameters or body
> date - 2024.05.13  
> keyword - spring, mvc, enum  
> enum을 request parameter or body로 사용허는 내용 정리  

<br>

## request parameter에서 enum 사용
* Spring MVC에서 predefined(미리 정의된) request parameter 필요시 enum을 사용한다
```java
public enum Modes {
  ALPHA,
  BETA,
  RELEASE_CANDIDATE,
  STABLE
}
```
```java
@GetMapping("/modes")
public String getModes(@RequestParam("mode") Modes mode) {
  ...
}

@GetMapping("/modes/{mode}")
public String getMode(@PathVariable("mode") Modes mode) {
  ...
}
```
* request parameter의 String을 [StringToEnumConverterFactory](https://github.com/spring-projects/spring-framework/blob/main/spring-core/src/main/java/org/springframework/core/convert/support/StringToEnumConverterFactory.java)가 `Enum.valueOf()`를 사용하여 enum으로 변환하므로 String이 enum과 정확하게 일치해야하며, 일치하지 않다면 `org.springframework.core.convert.ConversionFailedException` 발생

<br>

### Converter 구현
* 정확하게 일치하지 않는 String -> enum을 위한 Converter를 구현하면 `ConversionFailedException`가 발생하지 않도록 할 수 있다
```java
public enum Modes {
  ALPHA,
  BETA,
  RELEASE_CANDIDATE,
  STABLE;

  public static Modes of(@Nullable String source) {
    return Arrays.stream(Modes.values())
                 .filter(mode -> mode.name().equalsIgnoreCase(source))
                 .findAny()
                 .orElse(STABLE);
  }
}
```
```java
public class ModeConverter implements Converter<String, Modes> {

  @Override
  public Modes convert(String source) {
    return Modes.of(source);
  }
}
```
```java
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

  @Override
  public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(new ModeConverter());
  }
}
```

<br>

### Exception handling
* `ConversionFailedException`을 처리하기 위해서는 `@ExceptionHandler`에서 `MethodArgumentTypeMismatchException`를 처리해주면 된다
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<String> handleBadRequestException(Exception exception) {
    ...      
  }
}
```


<br>

## request body에서 enum 사용
```java
public record ModeRequest(@NotNull Modes mode) {
}
```
```java
@PostMapping("/modes")
public String postModes(@RequestBody @Valid ModeRequest request) {
  ...
}
```
* `AbstractJackson2HttpMessageConvetor`에서 ObjectMapper를 이용해서 변환하므로 정확하게 일치하지 않으면 `com.fasterxml.jackson.databind.exc.InvalidFormatException` 발생

<br>

### @JsonCreator 사용
```java
public enum Modes {
  ALPHA,
  BETA,
  RELEASE_CANDIDATE,
  STABLE;

  @JsonCreator
  public static Modes of(@Nullable String source) {
    return Arrays.stream(Modes.values())
                 .filter(mode -> mode.name().equalsIgnoreCase(source))
                 .findAny()
                 .orElse(STABLE);
  }
}
```
* `Content-Type: application/json`의 경우 정확하게 일치하지 않는 String -> enum을 위해 enum 내부의 static method에 `@JsonCreator`를 선언하면 해당 method를 이용해 request body를 parsing하게 된다
  * 해당 field의 key가 있어야 동작하며, key가 없거나 value가 null이면 동작하지 않는다
  * request body를 읽어서 json deserialize하여 @RequestBody에 선언된 object 생성 -> json deserialize 동안 enum을 만들기 위해 @JsonCreator에 선언된 메소드가 동작 -> object가 생성된 후 spring validation 동작


<br><br>

> #### Reference
> * [Using Enums as Request Parameters in Spring](hhttps://www.baeldung.com/spring-enum-request-param)
