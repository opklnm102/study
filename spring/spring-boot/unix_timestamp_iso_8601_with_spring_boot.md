# [Spring Boot] unix timestamp & ISO 8601 with spring boot
> date - 2018.09.13  
> keyword - spring boot, date, timestamp, iso 8601  
> 

<br>

## 용어 정리
* **ISO 8601** *Data elements and interchange formats - Information interchange - Representation of dates and times* 은 [날짜](https://ko.wikipedia.org/wiki/%EB%82%A0%EC%A7%9C)와 [시간](https://ko.wikipedia.org/wiki/%EC%8B%9C%EA%B0%84)과 관련된 데이터 교환을 다루는 [국제 표준](https://ko.wikipedia.org/wiki/%EA%B5%AD%EC%A0%9C_%ED%91%9C%EC%A4%80)
  * UTC 혹은 UTC + offset (time zone)으로 표현
    * 2018-09-16T18:08:42+09:00 - asia/seoul
    * 2018-09-16T18:08:42Z - UTC
    * 2018-09-16T18:08:42 - local time(zone을 명시하지 않으면 local로 인식)
  * 사람이 즉시 인지하기 쉽다
* Unix Timestamp
  * [POSIX](https://ko.wikipedia.org/wiki/POSIX) 시간이나 Epoch 시간이라고 부르기도 한다
  * 1970-01-01 00:00:00 [협정 세계시](https://ko.wikipedia.org/wiki/%ED%98%91%EC%A0%95_%EC%84%B8%EA%B3%84%EC%8B%9C)(UTC)부터의 경과 시간을 초(or 밀리초)로 환산하여 정수로 표현
  * ex) 1500179801 (ISO 8601:2017-07-16T04:36:41Z)
  * 사람이 즉시 인지하기 어렵다
* ZonedDateTime
  * Java8에서 추가된 [ISO-8601](https://ko.wikipedia.org/wiki/ISO_8601) 달력 시스템에서 정의하고 있는 time zone의 날짜와 시간을 저장하는 클래스
  * `2016-04-01T16:54:05.739+09:00[Asia/Seoul]`로 표현하고, 맨 뒤에 +09:00[Asia/Seoul] 같이 협정 세계시와의 시차(+9시간)와 ZoneId(Asia/Seoul) 정보가 붙는다

### 날짜만 필요한 경우
* Unix Timestamp
  * 시간 정보가 포함된 데이터인지 아닌지 구분하기 어렵다
* ISO 8601
  * 시간 영역을 제거하면 되서 표현하기 좋다
  * 2018-09-16
  * 2018-09


<br>

## 어떤 타입을 사용할 것인가
* End-to-end 통신구간 에서는 long 형식의 timestamp
  * Mobile Application <-> Web Application
  * Web Application <-> Web Application
  * Batch Application <-> Web Application
* Application 내부 에서는 ZonedDateTime
* Presentation Layer에서 time zone을 설정하고 그 외 나머지 Layer에선 time zone에 대한 설정을 가급적 바꾸지 않는다
  * 다양한 time zone에 대한 헷갈릴 수 있는 요소 제거
 
<br>

## 주의 사항
* Timestamp 와 time mills 구분
  * Milli second 까지 가져왔다면 1000으로 나누고 소숫점을 버려야 timestamp와 같아진다
  * javascript - `new Date().getTime()` —> miili second까지 가져오는 함수
* 시간을 생성 후 time zone을 적용하면 time zone이 적용 된 시간이라는 의미
  * `2017-07-16T09:00:00+09:00 == 2017-07-16T00:00:00Z`
* time zone이 적용된 시간이 필요하면 시간을 가져올 때 time zone을 적용해서 생성해야 한다
* DB 에 저장되는 시간은 특별한 시간을 제외하고는 UTC 형식이어야 한다
  * 예외) 통계를 위한 특정일자 등
* Type을 예측할 수 없는 String은 사용하지 말자
  * ex) "yyyyMMdd"인지, "1501123882" 형식인지 알 수 없다
* 만약 초 단위의 차이에 의해 결과가 달라지는 로직이 있다면, 시간 동기화를 어떻게 할것인가?
  * 시간을 생성하는 머신의 시간이 잘못 설정되어 있는 경우
 

<br>

## 해결 과제
* ZonedDateTime을 timestamp로 변환하는 util
* ZonedDateTime serialize 문제
  * controller의 request parameter
  * object의 member field
  * persitence layer
    * MyBatis
    * JPA
* JSR310
  * [jackson-datatype-jsr310](https://github.com/FasterXML/jackson-datatype-jsr310)(deprecated) -> [jackson-modules-java](https://github.com/FasterXML/jackson-modules-java8)로 통합됨
* jackson converter (controller)
* jackson type handler (db)


<br>

## Spring Boot에서 ZonedDateTime 사용하기

### Controller의 경우
* ZonedDateTime을 그냥 json으로 변환하면 너무 장황하다
```json
{
    "localDate":{
    "year":2018,
    "month":"JANUARY",
    "era":"CE",
    "dayOfYear":1,
    "dayOfWeek":"MONDAY",
    "leapYear":true,
    "dayOfMonth":15,
    "monthValue":9,
    "chronology":{
      "id":"ISO",
      "calendarType":"iso8601"
    }
  } 
}
```

* spring boot 1.x일 경우 `jackson-datatype-jsr310` 모듈의 도움이 필요
```grrovy
// Java8 Time converter
compile group: 'com.fasterxml.jackson.datatype', name: 'jackson-datatype-jsr310', version: '2.9.1'
```
> spring boot 2부터는 필요없다

```json
{
    "created_at":"2018-09-17T03:20:21.695+09:00"
}
```

#### 기존에 unix timestamp를 사용하다가 ZonedDateTime으로 변경하기
* Custom Json Converter 생성
```java
@JsonComponent
public class JsonConverter {
    
    // ZonedDateTime -> long
    public static class ZonedDateTimeJsonSerializer extends JsonSerializer<ZonedDateTime> {
        
        @Override
        public void serialize(ZonedDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            gen.writeNumber(value.withZoneSameInstant(ZoneOffset.UTC).toEpochSecond());
        }
    }
    
    // long -> ZonedDateTime
    public static class ZonedDateTimeJsonDeserializer extends JsonDeserializer<ZonedDateTime> {
        
        @Override
        public ZonedDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JsonProcessingException {
            return ZonedDateTime.ofInstant(Instant.ofEpochMilli(p.getValueAsLong()), ZoneOffset.UTC);
        }
    }
}
```

* test sample code
```java
@RestController
public class TestController {
    
    @PostMapping(path = "test")
    public ResponseDto test(@RequestParam(name = "start_at")
                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime startAt,
                            @RequestBody RequestDto requestDto) {
        return ResponseDto.of(id, ZonedDateTime.now());
    }
    
    @Value(staticConstructor = "of")
    static class ResponseDto {
        
        @JsonProperty(value = "created_at")
        private ZonedDateTime createdAt;
    }
    
    @NoArgsConstructor
    static class RequestDto {
        @JsonProperty(value = "end_at")
        private ZonedDateTime endAt;
    }
}
```

* usage
```json
// curl -X POST -H 'Content-Type: application/json' "127.0.0.1:8080/test/1?start_at=2018-09-17T03:12:01Z" -d '{"end_at":1537122626000}'

{
  "created_at":"2018-09-17T03:20:21.695+09:00"
}
```

<br>

### JPA의 경우
* global attribute converter 생성
```java
@Converter(autoApply = true)
public class ZonedDateTimeAttributeConverter implements AttributeConverter<ZonedDateTime, Timestamp> {
    
    @Override
    public Timestamp convertToDatabaseColumn(ZonedDateTime zonedDateTime) {
        if (zonedDateTime == null) {
            return null;
        return Timestamp.from(zonedDateTime.toInstant());
    }
    
    @Override
    public ZonedDateTime convertToEntityAttribute(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        return ZonedDateTime.ofInstant(timestamp.toInstant(), ZoneId.of("UTC"));
    }
}
```

---

<br>

> #### Reference
> * [REST API 날짜/시간 표현 정하기](https://www.popit.kr/rest-api-%EB%82%A0%EC%A7%9C%EC%8B%9C%EA%B0%84-%ED%91%9C%ED%98%84-%EC%A0%95%ED%95%98%EA%B8%B0/)
