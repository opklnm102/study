# [Java] Jackson @JsonCreator & @JsonValue
> date - 2024.09.19  
> keyword - jackson, json  
> jackson의 JsonCreator, JsonValue에 대해 정리  

<br>

## serialize vs deserialize
* deserialize - json -> object
* serialize - object -> json


<br>

## `@JsonCreator`
* 기본 생성자가 아닌 생성자 or factory method로 deserialize에 사용
* immutable object에 유용
* Jackson은 기본 생성자로 object를 생성하고, public field면 직접, private field면 setter or reflection을 사용해 object에 필드를 채운다
* serialize에는 getter 필요
* deserialize한 object의 immutable을 보장하려면 setter가 없어야하므로 다음의 방법 사용 가능
  * 기본 생성자 + getter
  * `@JsonCreator` + 원하는 생성자
    * `@JsonCreator` 사용시 JsonProperty 사용 필수
  * `@JsonCreator` + factory method

<br>

### Example
```json
{
  "theName":"mike",
  "age": 10
}
```
```java
public class Person {
  private String name;
  private int age;

  private Person(String name, int age) {
    this.name = name;
    this.age = age;
  }

  @JsonCreator
  public static Person of(@JsonProperty("theName") String name,
                            @JsonProperty("age") int age){
    return new Person(name, age);
  }
}
```

* enum + MVC Converter에서 사용
```java
@Getter
public enum PaymentType {
  CASH("현금"),
  CARD("카드");
  
  private final String value;

  @JsonCreator  // request body로 들어올 때 변환
  public static PaymentType of(String code) {
    return Arrays.stream(PaymentType.values())
                 .filter(type -> type.name().equals(code))
                 .findAny()
                 .orElseThrow(() -> new NoSuchElementException());
  }
}

// request params로 들어올 때 변환
public class PaymentTypeConverter implements Converter<String, PaymentType> {

  @Override
  public PaymentType convert(@Nullable String code) {
    return PaymentType.of(code);
  }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(new PaymentTypeConverter());
  }
}
```

* enum + MVC Converter에서 사용
```java
public interface EnumMapperType {
    String getCode();
    String getValue();
}

@Getter
public enum PaymentType implements EnumMapperType {
  CASH("현금"),
  CARD("카드");
  
  private final String value;

  @JsonCreator  // request body로 들어올 때 변환
  public static PaymentType of(String code) {
    return Arrays.stream(PaymentType.values())
                 .filter(type -> type.name().equals(code))
                 .findAny()
                 .orElseThrow(() -> new NoSuchElementException());
  }

  @Override
  public String getCode() {
    return name();
  }
}


public class StringToEnumConverterFactory implements ConverterFactory<String, Enum<? extends EnumMapperType>> {
    
  @Override
  public <T extends Enum<? extends EnumMapperType>> Converter<String, T> getConverter(Class<T> targetType) {
    return new StatusCodeToEnumConverter<>(targetType);
  }

  private static final class StatusCodeToEnumConverter<T extends Enum<? extends EnumMapperType>> implements Converter<String, T> {
    private final Map<String, T> map;

    public IdCodeToEnumConverter(Class<T> targetEnum) {
      map = Arrays.stream(targetEnum.getEnumConstants())
                  .collect(Collectors.toMap(enumConstant -> ((EnumMapperType) enumConstant).getStatus(), Function.identity()));
    }

    @Override
    public T convert(String source) {
      //해당 값 존재 여부 확인
      if (!StringUtils.hasText(source)) {
        return null;
      }

      T value = map.get(source);
        if (value == null) {
          throw new IllegalArgumentException("IllegalArgumentException");
        }
      return value;
    }
  }
}

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new StringToEnumConverterFactory(););
    }
}
```


* WebClient에서 사용
```java
@Getter
public class UserApiException extends RuntimeException {
  private final String code;
  private final String message;
  private final List<FieldError> fieldErrors;

  @JsonCreator
  public UserApiException(@JsonProperty("code") String code, 
                          @JsonProperty("message") String message, 
                          @JsonProperty("fieldErrors") List<FieldError> fieldErrors) {
    this.code = code;
    this.message = message;
    this.fieldErrors = fieldErrors;
  }

  public String getFailureReason() {
    var failureReason = code + ": " + message;

    if (fieldErrors.isEmpty()) {
      return failureReason;
    }

    return String.format("%s {%s}", failureReason, fieldErrors.stream()
                    .map(FieldError::getFailureReason)
                    .collect(Collectors.joining(", ")));
  }

  public static class FieldError {
    private final String field;
    private final String reason;
    private final String value;

    @JsonCreator
    public FieldError(@JsonProperty("field") String field, @JsonProperty("reason") String reason, @JsonProperty("value") String value) {
      this.field = field;
      this.reason = reason;
      this.value = value;
    }

    public String getFailureReason() {
      return String.format("%s: %s (%s)", field, reason, value);
    }
  }
}

// usage
webClient.get()
         .uri("/users")
         .retrieve()
         .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(UserApiException.class))  // here
         .bodyToMono(UserApiResponse.class)
         .block();
```

<br>

## `@JsonValue`
* serialization에 사용
```java
@Getter
public enum PaymentType {
  CASH("현금"),
  CARD("카드");
  
  @JsonValue
  private final String value;
  ...
}
```
```json
// as-is
"CASH"

// to-be
"현금"
```


<br><br>

> #### Reference
> * [Jackson Annotation Examples](https://www.baeldung.com/jackson-annotations)
