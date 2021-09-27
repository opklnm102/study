# [Spring Boot] Logging with slf4j, logback, log4j2
> date - 2021.09.24  
> keyworkd - spring boot, logging, slf4j, logback, log4j2  
> Spring Boot에서 SLF4J를 이용해 logback, log4j2를 사용하는 법을 정리

<br>

## SLF4J란?
* logging module에는 logback, log4j2 등 다양한데, logging module 교체시 많은 변경이 발생하게 된다
* `SLF4J`(Simple Logging Facade for Java)를 사용하면 facade pattern을 통해 추상화된 logging api 사용 가능하여 application code의 변경이 필요 없게 된다
* 다양한 logging mobule을 하나의 통일된 방식으로 사용하는 방법을 제공
  * logging module을 runtime이 아닌 compile time에 정한다
* 구성
  * SLF4J API
    * logging interface
    * slf4j-api-{version}
  * SLF4J Binding
    * SLF4J interface를 logging 구현체로 연결
    * adpater 역할
    * 여러 binding 중 반드시 하나만 사용
      * slf4j-log4j12-{version}
      * slf4j-jdk14-{version}
      * logback-classic-{logback-version}
  * SLF4J Bridge
    * logger 호출을 SLF4J interface로 연결
      * Log4J -> SLF4J API
    * 어떤 component가 특정 logger 구현체에 의존하면 해당 logger의 호출을 대신 받아 SLF4J API를 호출한다

<br>

### Log4J 호출을 SLF4J로 연결하려면?
* 의존성에 `log4j-over-slf4j` 추가 & log4j 제거
* `slf4j-log4j12` binding과 같이 사용하면 무한 루프 발생
```
Log4J -> log4j-over-slf4j(Bridge) -> slf4j-api(API) -> slf4j-log4j(Binding) -> Log4J
```

<br>

### 모든 logging을 logback으로 하려면?
* `spring-boot-starter-logging`을 사용하면 아래의 구조로 `logback`을 사용하게 된다
```
log4j / jul / jcl 호출 -> Bridge -> API -> Binding -> Logback
```
* Bridge
  * log4j-over-slf4j
  * jcl-over-slf4j
  * jul-to-slf4j
* Binding
  * logback-classic


<br>

## Logback
* `spring-boot-start-web`에 logback이 추가되어 있어 간단하게 사용 가능하다
* `resources/logback-spring.xml` 설정 파일을 추가해주자

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Hello {

    public void hello() {
        log.info("hello");
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

  <!-- include default configuration -->
  <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
  <property name="LOG_LEVEL" value="DEBUG"/>

  <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>${CONSOLE_LOG_PATTERN}</pattern>
      <charset>utf8</charset>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>${LOG_LEVEL:-INFO}</level>
    </filter>
  </appender>

  <root level="${LOG_LEVEL:-INFO}">
    <appender-ref ref="consoleAppender"/>
  </root>
</configuration>
```


<br>

## Log4J2
* `logback` 의존성을 제거한 후 `log4j2`를 추가해야한다
```gradle
configurations {
    all {
        exclude group: 'org.springframework.boot', module: 'spring-boot-starter-logging'
    }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-log4j2'
}
```

* `resources/log4j2-spring.xml` 설정 파일을 추가해주자
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
    <Appenders>
        <Console name="consoleAppender" target="SYSTEM_OUT">
            <PatternLayout
                    pattern="%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} [%mdc] - %msg%n" />
        </Console>
    </Appenders>

    <Loggers>
        <!-- LOG everything at INFO level -->
        <Root level="info">
            <AppenderRef ref="consoleAppender" />
        </Root>
    </Loggers>

</Configuration>
```


<br>

## Conclusion
* Java에서는 `SLF4J`를 사용하면 다른 logging module에 독립적으로 logging할 수 있기 때문에 필수로 사용하자
* 확장성을 위해 느슨하고 유연한 구조를 가져가는게 좋다

<br><br>

> #### Reference
> * [Logging in Spring Boot](https://www.baeldung.com/spring-boot-logging)
> * [스프링 부트와 로깅](https://www.slideshare.net/whiteship/ss-47273947)

<br>

> #### Further reading
> * [Log4j 2 Best Pratices Example](https://examples.javacodegeeks.com/enterprise-java/log4j/log4j-2-best-practices-example/)
