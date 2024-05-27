# [Spring Boot] Configure Jackson date format
> date - 2024.01.21  
> keyword - spring boot, date, iso 8601, jackson  
> Spring Boot 3.2.2에서 LocalDateTime, LocalDate, Date 등의 시간 관련 Class의 Json response format 설정에 대해 정리  
> ISO 8601과 시간에 대한 내용은 [[Spring Boot] unix timestamp & ISO 8601 with spring boot](./unix_timestamp_iso_8601_with_spring_boot.md) 참고  

<br>

## JacksonAutoConfiguration 살펴보기
```java
@AutoConfiguration
@ConditionalOnClass({ObjectMapper.class})
public class JacksonAutoConfiguration {
  ...
  static {
    Map<Object, Boolean> featureDefaults = new HashMap();
    featureDefaults.put(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    featureDefaults.put(SerializationFeature.WRITE_DURATIONS_AS_TIMESTAMPS, false);
    FEATURE_DEFAULTS = Collections.unmodifiableMap(featureDefaults);
  }
  ...
}
```
* JacksonAutoConfiguration에 의해 다양한 module이 등록되며 그 중에는 `jackson-datatype-jdk8`과 `jackson-datatype-jsr310`가 포함된다
  * Jackson Module - Jackson의 확장을 위한 interface
  * jackson-datatype-jdk8 - Optional 등의 Java 8 type 지원을 위한 `Jdk8Module`
  * jackson-datatype-jsr310 - LocalDateTime, LocalDate 등 Java 8 Date & Time API type 지원을 위한 `JavaTimeModule`, `JSR310Module(deprecated)`
* JavaTimeModule에서는 `addDeserializer(LocalDateTime.class, LocalDateTimeDeserializer.INSTANCE);` 처럼 Java 8 Date & Time API type 마다 Ser/Deserializer를 등록한다
```java
public final class JavaTimeModule extends SimpleModule {
  private static final long serialVersionUID = 1L;

  public JavaTimeModule() {
    super(PackageVersion.VERSION);

    // First deserializers

    // // Instant variants:
    addDeserializer(Instant.class, InstantDeserializer.INSTANT);
    addDeserializer(OffsetDateTime.class, InstantDeserializer.OFFSET_DATE_TIME);
    addDeserializer(ZonedDateTime.class, InstantDeserializer.ZONED_DATE_TIME);

    // // Other deserializers
    addDeserializer(Duration.class, DurationDeserializer.INSTANCE);
    addDeserializer(LocalDateTime.class, LocalDateTimeDeserializer.INSTANCE);
    addDeserializer(LocalDate.class, LocalDateDeserializer.INSTANCE);
    addDeserializer(LocalTime.class, LocalTimeDeserializer.INSTANCE);
    ...
  }
}
```

* LocalDateTimeDeserializer를 보면 각 Ser/Deserializer의 INSTANCE는 default formmat으로 ISO 8601을 사용하는  것을 확인할 수 있다
```java
public class LocalDateTimeDeserializer extends JSR310DateTimeDeserializerBase<LocalDateTime> {
  private static final long serialVersionUID = 1L;
  private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;  // here
  public static final LocalDateTimeDeserializer INSTANCE = new LocalDateTimeDeserializer();

  protected LocalDateTimeDeserializer() { // was private before 2.12
    this(DEFAULT_FORMATTER);
  }
  ...
}
```

* `Jackson2ObjectMapperBuilderCustomizer`는 JacksonAutoConfiguration에 의해 생성되는 ObjectMapper의 customizing을 위해 사용된다
```java
@ConditionalOnClass({Jackson2ObjectMapperBuilder.class})
@EnableConfigurationProperties({JacksonProperties.class})
static class Jackson2ObjectMapperBuilderCustomizerConfiguration {
  Jackson2ObjectMapperBuilderCustomizerConfiguration() {
  }

  @Bean
  StandardJackson2ObjectMapperBuilderCustomizer standardJacksonObjectMapperBuilderCustomizer(JacksonProperties jacksonProperties, ObjectProvider<Module> modules) {
    return new StandardJackson2ObjectMapperBuilderCustomizer(jacksonProperties, modules.stream().toList());
  }

  static final class StandardJackson2ObjectMapperBuilderCustomizer implements Jackson2ObjectMapperBuilderCustomizer, Ordered {
    private final JacksonProperties jacksonProperties;
    private final Collection<Module> modules;

    StandardJackson2ObjectMapperBuilderCustomizer(JacksonProperties jacksonProperties, Collection<Module> modules) {
      this.jacksonProperties = jacksonProperties;
      this.modules = modules;
    }

    public int getOrder() {
      return 0;
    }

    public void customize(Jackson2ObjectMapperBuilder builder) {
      if (this.jacksonProperties.getDefaultPropertyInclusion() != null) {
        builder.serializationInclusion(this.jacksonProperties.getDefaultPropertyInclusion());
      }

      if (this.jacksonProperties.getTimeZone() != null) {
        builder.timeZone(this.jacksonProperties.getTimeZone());
      }

      this.configureFeatures(builder, JacksonAutoConfiguration.FEATURE_DEFAULTS);
      ...
    }
  }
  ...
}
```
* `StandardJackson2ObjectMapperBuilderCustomizer`는 `JacksonProperties` 기반으로 ObjectMapper를 customizing한다
* 여기까지 봤을 때 ObjectMapper를 수정할 수 있는 방법으로는 다음과 같이 분류해볼 수 있다
  * `JacksonProperties`를 통한 설정
  * `Jackson2ObjectMapperBuilderCustomizer`를 통한 설정
  * Jackson Module을 통한 설정
  * ObjectMapper 직접 생성


<br>

## 1. JacksonProperties를 통한 설정
* `spring.jackson`을 사용해 설정할 수 있다
```java
@ConfigurationProperties(prefix = "spring.jackson")
public class JacksonProperties {
  private String dateFormat;
  ...
}
```

<br>

### Date type의 format 설정
* serialization에는 ISO-8601(yyyy-MM-dd'T'HH:mm:ss.SSSZ), deserialization에는 ISO-8601, RFC-1123 사용하는 `StdDateFormat`를 default로 사용

#### `spring.jackson.date-format: StdDateFormat`
```yaml
spring:
  jackson:
    date-format: com.fasterxml.jackson.databind.util.StdDateFormat
```
* result
```json
{
    "createdAt": "2024-01-21T22:00:08.180764",  // LocalDateTime
    "createdDate": "2024-01-21",  // LocalDate
    "date": "2024-01-21T13:00:08.180+00:00"  // Date
}
```

#### `spring.jackson.date-format: yyyy-MM-dd HH:mm:ss`
```yaml
spring:
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
```
* result
```json
{
    "createdAt": "2024-01-21T22:04:09.756171",  // LocalDateTime
    "createdDate": "2024-01-21",  // LocalDate
    "date": "2024-01-21 13:04:09"  // Date
}
```
* `spring.jackson.date-format`은 java.util.Date에 대한 설정으로 Java 8 API에는 동작하지 않는다

<br>

### Date -> Timestamp serialization

#### spring.jackson.serialization.write-dates-as-timestamps: true
* config
```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: true
```
* result
```json
{
   "createdAt":[  // LocalDateTime
      2024,
      1,
      21,
      16,
      16,
      2,
      761444000
   ],
   "createdDate":[  // LocalDate
      2024,
      1,
      21
   ],
   "date":1705821362761  // Date
}
```

#### spring.jackson.serialization.write-dates-as-timestamps: false
```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
```
* result
```json
{
   "createdAt":"2024-01-21T16:18:38.687541",  // LocalDateTime
   "createdDate":"2024-01-21",  // LocalDate
   "date":"2024-01-21T07:18:38.687+00:00"  // Date
}
```

<br>

### JacksonProperties의 다양한 설정
```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE  # property name에 snake case 사용 - LOWER_CAMEL_CASE, UPPER_CAMEL_CASE, SNAKE_CASE, UPPER_SNAKE_CASE, LOWER_CASE, KEBAB_CASE, LOWER_DOT_CASE
    default-property-inclusion: non_empty  # property 포함 전략 - always, non_null, non_absent, non_default, non_empty
    serialization:
      write-dates-as-timestamps: false  # Date에 timestamp 사용 X
      fail-on-empty-beans: false  # bean이 empty 일 때 fail 하지 않음
    deserialization:
      read-unknown-enum-values-as-null: true  # 알 수 없는 ENUM일 경우 null로 설정
```
```json
// as-is
{
    "createdAt": "2024-01-21T22:10:46.650693",  // LocalDateTime
    "createdDate": "2024-01-21",  // LocalDate
    "date": null  // Date
}

// to-be
{
    "created_at": "2024-01-21T22:10:19.179237",  // LocalDateTime
    "created_date": "2024-01-21"  // LocalDate
}
```


<br>

## 2. Jackson2ObjectMapperBuilderCustomizer를 통한 설정
* Class type에만 적용 가능하므로 특정 Class type에 대해서 사용시 유용
* 사용할 모든 Class type을 등록해야해서 번거로울 수 있다
```java
@Configuration
public class ObjectMapperConfig {

  @Bean
  public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
    return builder -> {
      builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
             .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
             .featuresToDisable(SerializationFeature.FAIL_ON_EMPTY_BEANS)  // bean이 empty 일 때 fail 하지 않음
             .featuresToEnable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL)  // 알 수 없는 ENUM일 경우 null로 설정
             .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)  // property name에 snake case 사용
             .serializationInclusion(JsonInclude.Include.NON_NULL)  // null 값은 serialize 하지 않음
             .modules(new JavaTimeModule())
             .serializers(LocalDateTimeSerializer.INSTANCE, LocalDateSerializer.INSTANCE)
             .deserializers(LocalDateTimeDeserializer.INSTANCE, LocalDateDeserializer.INSTANCE);

             // .serializers(LocalDateTimeSerializer.INSTANCE, LocalDateSerializer.INSTANCE) 와 동일한 설정
             .serializerByType(LocalDateTime.class, LocalDateTimeSerializer.INSTANCE)  // LocalDateTimeSerializer.INSTANCE == new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
             .serializerByType(LocalDate.class, LocalDateSerializer.INSTANCE)  // LocalDateSerializer.INSTANCE == new LocalDateSerializer(DateTimeFormatter.ISO_LOCAL_DATE)

             // .serializers(LocalDateTimeSerializer.INSTANCE, LocalDateSerializer.INSTANCE) 와 동일한 설정
             .serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
             .serializerByType(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ISO_LOCAL_DATE));

      // custom DateTimeFormatter 사용
      DateTimeFormatter dtfNanoSec = new DateTimeFormatterBuilder()
                .append(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)  // 소수점 아래 9자리의 생략된 자리를 처리
                .toFormatter();
      builder.deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer(dtfNanoSec))
             .serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(dtfNanoSec));


      DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
      builder.deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer(dtf))
             .serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(dtf));
    }
  }
}
```


<br>

## 3. Jackson Module을 통한 설정
* Jackson Module은 Jackson의 확장을 위한 interface로 필요한 설정들을 간편하게 정의하여 ObjectMapper에 등록할 수 있다
  * e.g. `Jdk8Module`, `JavaTimeModule`
* Spring Boot에서는 Jackson Module Bean을 등록하면 자동으로 ObjectMapper에 등록된다
* 사용자가 생성한 Class type에 관련된 상속 구조 같은 규칙을 가지는 범용 Ser/Deserializer 사용시 유용
```java
@Configuration
public class ObjectMapperConfig {
  
  @Bean
  public CustomModule customModule() {
    return new CustomModule();
  }

  public static class CustomModule extends SimpleModule {
    
    public CustomModule() {
      // deserializers
      addDeserializer(LocalDateTime.class, LocalDateTimeDeserializer.INSTANCE);

      // serializers
      addSerializer(LocalDateTime.class, CustomLocalDateTimeSerializer.INSTANCE);
      addSerializer(Boolean.class, CustomBooleanSerializer.INSTANCE);
    }
  }

  static class CustomLocalDateTimeSerializer extends JsonSerializer<LocalDateTime> {
    public static final CustomLocalDateTimeSerializer INSTANCE;
    private static final DateTimeFormatter DEFAULT_FORMATTER;

    static {
      INSTANCE = new CustomLocalDateTimeSerializer();
      DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }

    @Override
    public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
      gen.writeString(value.format(DEFAULT_FORMATTER));
    }
  }

  static class CustomLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    public static final CustomLocalDateTimeDeserializer INSTANCE;
    private static final DateTimeFormatter DEFAULT_FORMATTER;

    static {
      INSTANCE = new CustomLocalDateTimeDeserializer();
      DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }

    @Override
    public LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p, DeserializationContext ctxt) throws IOException {
      return LocalDateTime.parse(p.getValueAsString(), DEFAULT_FORMATTER);
    }
  }

  static class CustomBooleanSerializer extends JsonSerializer<Boolean> {
    private static final String TRUE_TEXT = "Yes";
    private static final String FALSE_TEXT = "No";
    public static final CustomBooleanSerializer INSTANCE = new CustomBooleanSerializer();

    @Override
    public void serialize(Boolean value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
      if (Objects.isNull(value)) {
        value = false;
      }
      gen.writeString(value ? TRUE_TEXT : FALSE_TEXT);
    }
  }
}
```


<br>

## 4. ObjectMapper 직접 생성
* `JacksonAutoConfiguration`을 사용하는게 아닌 직접 ObjectMapper를 생성하여 사용하는 방법으로 권장하는 방식은 아니나 버전별로 고정된 설정을 사용하고 싶을 경우 유용
```java
@Configuration
public class ObjectMapperConfig {
  
  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    ObjectMapper objectMapper = new ObjectMapper();

    objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    objectMapper.enable(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL);   // 알 수 없는 Enum일 경우 null로 설정
    objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);                 // bean이 empty 일 때 fail 하지 않음
    objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    objectMapper.registerModule(new Jdk8Module());

    // localDateTime serializer 등록
    JavaTimeModule javaTimeModule = new JavaTimeModule();
    javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME));  // == addSerializer(LocalDateTimeSerializer.INSTANCE);
    javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME));  // == addDeserializer(LocalDateTimeDeserializer.INSTANCE);
    javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ISO_DATE));  // == addSerializer(LocalDateSerializer.INSTANCE);
    javaTimeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ISO_DATE));  // == addDeserializer(LocalDateDeserializer.INSTANCE);
    objectMapper.registerModule(javaTimeModule);

    return objectMapper;
  }
}
```


<br>

## 5. @JsonFormat으로 하나하나 설정
* 각각의 date format이 다른 경우 유용
* Class를 만들 때마다 설정을 해줘야하며, 설정해주지 않는 실수 가능성이 높아 시간이 지날수록 관리가 어려워진다
* **하나의 시스템 내에서 사용되는 date format은 가급적 통일하는게 좋다**
```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime cancelRequestedAt;
```


<br>

## ZonedDateTime 사용시 timezone 설정
* `-Duser.timezone=Asia/Seoul` java options을 사용하거나 아래의 jackson properties를 이용하여 jackson에서 ser/deser시에 time zone을 설정할 수 있다
* server에서도 timezone을 설정할 수는 있지만 server에서는 UTC를 사용하고 유저에게 보여줄 때 client에서 timezone에 맞게 변환하여 보여주는게 가장 좋다
```yaml
spring:
  jackson:
    time-zone: Asia/Seoul
```


<br>

## Conclusion
* `Jackson2ObjectMapperBuilderCustomizer`를 이용해 공통 foramt을 지정하고, format이 다른 특정 필드에는 `@JsonFormat`을 사용하자

<br><br>

> #### Reference
> * [Spring Boot: Customize the Jackson ObjectMapper](https://www.baeldung.com/spring-boot-customize-jackson-objectmapper)
> * [Jackson의 확장 구조를 파헤쳐 보자](https://d2.naver.com/helloworld/0473330)
