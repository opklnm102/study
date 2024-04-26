# [Java] When expressing time, use duration
> date - 2024.04.26  
> keyword - time, duration  
> interval 등의 시간을 표현할 때는 Duration을 사용하자

<br>

## As-is
interval, timeout, expire 등 시간을 표현할 때 int, long을 사용하면 단위까지 표현할 수 없어서 가독성이 떨어지게 된다
```java
var interval = 30L;
...
var scheduledAt = LocalDateTime.now().plusSeconds(interval);
```
위와 같은 경우 단위가 ms인지? s인지? 고민하게 되어 변수명에 단위까지 사용하게 된다  
이럴 경우 단위가 바뀌면 변수명 수정이 필요한 문제가 있다
```java
var intervalSec = 30L;
var scheduledAt = LocalDateTime.now().plusSeconds(intervalSec);
```


<br>

## To-be
* `Duration`을 사용하게 되면 가독성이 높아지고, 자료형이 단위까지 표현하므로 유연성이 높아진다
```java
var interval = Duration.ofSeconds(30);
var scheduledAt = LocalDateTime.now().plus(interval);
```

### Duration supported units
| Units | Description |
|:--|:--|
| ns | nanoseconds |
| us | microseconds |
| ms | milliseconds |
| s | seconds |
| m | minutes |
| h | hours |
| d | days |


<br>

## Spring Boot에서 사용하기
```yaml
task:
  interval: 30s  # 30초
  timeout: 60s  # 60초
  cache:
    long-expire: P1DT1H30M  # 1일 1시간 30분
    short-expire: PT1H30M  # 1시간 30분
```
```java
@ConfigurationProperties(prefix = "task")
public record PushMessageProperties(Duration interval, Duration timeout, Cache cache) {
  public record Cache(Duration longExpire, Duration shortExpire) {
  }
}
```


<br><br>

> #### Reference
> * [Converting Durations](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.conversion.durations)
