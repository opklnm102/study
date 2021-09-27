# [Spring Boot] Logging with MDC
> date - 2021.09.24  
> keyworkd - spring boot, logging, logback, mdc  
> Spring Boot + logback에서 MDC를 사용하는 법 정리

<br>

## MDC(Mapped Diagnostic Context)란?
* 실행 thread에 공통 값을 주입하여 의미있는 정보를 추가해 로깅할 수 있도록 제공
* multi thread, MSA 환경에서는 여러 log가 섞이기 때문에 확인하기 어렵다
  * thread or request flow에 id를 할당하면 tracking하기 쉬워진다
* user id, token 등 다양한 정보를 logging 하는데 사용할 수 있다


<br>

## Example
* request filter에서 MDC 활용
```java
@Component
@Order(1)
public class LoggingFilter extends OncePerRequestFilter {

    public static final String HEADER_TRACE_ID = "X-Trace-Id";

    public static final String MDC_TRACE_ID = "trace.id";
    public static final String MDC_SPAN_ID = "span.id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        var xTraceId = request.getHeader(HEADER_TRACE_ID);

        if(!StringUtils.hasText(xTraceId)) {
            xTraceId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_TRACE_ID, xTraceId);
        MDC.put(MDC_SPAN_ID, UUID.randomUUID().toString());

        filterChain.doFilter(request, response);

        MDC.clear();
    }
}
```

<br>

### MDC를 이용한 특정 값 사용
* log pattern에 `%X{trace.id}` 같이 MDC에 넣은 key를 사용
```xml
<!-- logback-spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

  <!-- include default configuration -->
  <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
  <property name="LOG_LEVEL" value="DEBUG"/>

  <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} [%X{trace.id}] - %msg%n</pattern>
      <charset>utf8</charset>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>${LOG_LEVEL:-INFO}</level>
    </filter>
  </appender>

  <springProfile name="local">
    <root level="${LOG_LEVEL:-INFO}">
      <appender-ref ref="consoleAppender"/>
    </root>
  </springProfile>
</configuration>
```

* result
```java
2021-09-24 15:59:12 [http-nio-8080-exec-1] INFO  com.example.demo.HelloController [2da56b7a-6534-4be7-839f-921f30ea8e64] - hello
```

<br>

### MDC의 모든 값 사용
* log pattern에 `%mdc`로 MDC에 모든 값을 사용할 수 있다
```xml
<!-- logback-spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">
  ...
      <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} %mdc - %msg%n</pattern>
  ...
</configuration>
```

* result
```java
2021-09-24 16:04:40 [http-nio-8080-exec-1] INFO  com.example.demo.HelloController trace.id=24efdfc4-7059-457e-9b37-6056baf69d3e, span.id=19e74c47-4f4c-4cfe-8f87-3bf85bc34575 - hello
```


<br>

## Conclusion
* MDC를 활용하면 logging이 더욱 풍부한 logging을 할 수 있으니 적절하게 사용하면 좋다
* request filter에서 셋팅 & http client를 이용해 request 전에 MDC에서 trace id 같은 것을 추출하여 보내주면 tracing에 용이하다

<br><br>

> #### Reference
> * [Improved Java Logging with Mapped Diagnostic Context (MDC)](https://www.baeldung.com/mdc-in-log4j-2-logback)
