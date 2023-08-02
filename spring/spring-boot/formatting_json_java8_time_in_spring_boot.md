# [Spring Boot] Formatting json Date/LocalDateTime/LocalDate in Spring Boot
> date - 2023.08.02  
> keyworkd - spring boot, time  
> jackson에서 Java 8 date/time type `java.time.xxxx` not supported by default 에러 해결을 정리  

<br>

## TL;DR
* jackson은 Java 8에서 추가된 java.time.*를 기본적으로 지원하지 않으므로 jackson-datatype-jsr310의 JavaTimeModule 설정 필요


<br>

## Issue. jackson InvalidDefinitionException
```java
com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.Year` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: Request["yearDateType"])
	at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:77)
	at com.fasterxml.jackson.databind.SerializerProvider.reportBadDefinition(SerializerProvider.java:1300)
	at com.fasterxml.jackson.databind.ser.impl.UnsupportedTypeSerializer.serialize(UnsupportedTypeSerializer.java:35)
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:728)
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:774)
	at com.fasterxml.jackson.databind.ser.BeanSerializer.serialize(BeanSerializer.java:178)
	at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider._serialize(DefaultSerializerProvider.java:480)
	at com.fasterxml.jackson.databind.ser.DefaultSerializerProvider.serializeValue(DefaultSerializerProvider.java:319)
	at com.fasterxml.jackson.databind.ObjectMapper._writeValueAndClose(ObjectMapper.java:4568)
	at com.fasterxml.jackson.databind.ObjectMapper.writeValueAsString(ObjectMapper.java:3821)
	...
```


<br>

## Why?
* Year, LocalDate 등 Java 8 date/time type에 대한 serializer/deserializer가 설정되어 있지 않아서 발생
```java
public void handle() {
  var request = new Request("2023", LocalDateTime.now(), LocalDate.now(), LocalTime.now());
  var result = objectMapper.writeValueAsString(request);
}

public class Request {
  private final String year;
  private final LocalDateTime dateTime;
  private final LocalTime time;
  private final LocalDate date;
  
  public Request(String year, LocalDateTime dateTime, LocalDate date, LocalTime time) {
    this.year = year;
    this.dateTime = dateTime;
    this.date = date;
    this.time = time;
  }

  public Year getYear() {
    return Year.parse(this.year, DateUtil.YEAR_ONLY_FORMAT);
  }
}
```


<br>

## Resolve
* dependency에 `com.fasterxml.jackson.datatype:jackson-datatype-jsr310`가 없다면 추가
```java
implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
```
* 아래 방법 중 하나로 ObjectMapper가 `JavaTimeModule`을 사용하도록 설정

### 1. JsonMapper 사용
```java
@Bean
public ObjectMapper objectMapper() {
    return JsonMapper.builder()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .addModule(new JavaTimeModule())
                .build();
}
```

<br>

### 2. Jackson2ObjectMapperBuilder 사용 및 formatter 지정
```java
@Bean
public ObjectMapper objectMapper() {
  var timeModule = new JavaTimeModule();
  
  var dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  timeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(dateTimeFormatter));
  timeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(dateTimeFormatter));
  
  var dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  timeModule.addSerializer(LocalDate.class, new LocalDateSerializer(dateFormatter));
  timeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(dateFormatter));

  var timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
  timeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(timeFormatter));
  timeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(timeFormatter));

  return new Jackson2ObjectMapperBuilder()
                .modules(timeModule)
                .failOnUnknownProperties(false)
                .build();
}
```

<br>

### 3. Jackson2ObjectMapperBuilderCustomizer 이용
* JacksonAutoConfiguration에 의해 생성되는 ObjectMapper를 `Jackson2ObjectMapperBuilderCustomizer`로 customize할 수 있다
```java
@Bean
public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
  return builder -> {
    // formatter
    var dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    var dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    var timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    // deserializers
    builder.deserializers(new LocalDateTimeDeserializer(dateTimeFormatter));
    builder.deserializers(new LocalDateDeserializer(dateFormatter));
    builder.deserializers(new LocalTimeDeserializer(timeFormatter));

    // serializers
    builder.serializers(new LocalDateTimeSerializer(dateTimeFormatter));
    builder.serializers(new LocalDateSerializer(dateFormatter));
    builder.serializers(new LocalTimeSerializer(dateFormatter));
  };
}
```


<br><br>

> #### Reference
> * [Spring Boot 2.5.0 and InvalidDefinitionException: Java 8 date/time type java.time.Instant not supported by default #26859](https://github.com/spring-projects/spring-boot/issues/26859)
