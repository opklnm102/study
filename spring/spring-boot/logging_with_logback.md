# [Spring Boot] logging with logback
> date - 2018.11.25  
> keyword - spring boot, logging, logback  
> Spring Boot에서 logback을 설정하는 법을 정리  

<br>


* Logabck을 사용하려면 classpath에 spring-jcl 포함하면 된다
  * Spring Framework의 spring-jcl 모듈에서 제공하는 Commons Logging API만 필수
* `spring-boot-starter-logging`에 포함되어 있다
* classpath에 `logback.xml`, `logback-spring.xml`이 있으면 설정을 읽어간다

<br>


## logback 설정하기
* `spring-boot-starter-web` dependency 추가
  * 하위에 `spring-boot-starter-logging`를 포함하고 있다

```gradle
dependencies {
    implementation('org.springframework.boot:spring-boot-starter-web')
}
```


### logback 파일
* [org/springframework/boot/logging/logback](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml)에서 default 설정 제공

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

    <!-- include default configuration -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <property name="FILE_PREFIX" value="think-lotto"/>
    <property name="LOG_LEVEL" value="DEBUG"/>
    <property name="LOG_PATH" value="logs/think-lotto"/>

    <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf8</charset>
        </encoder>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>${LOG_LEVEL}</level>
        </filter>
    </appender>

    <appender name="dailyRollingFileAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <FileNamePattern>${LOG_PATH}/${FILE_PREFIX}.%d{yyyy-MM-dd}.log.zip</FileNamePattern>

            <!-- keep 30 days' worth of history -->
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <appender name="auditDailyRollingFileAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <FileNamePattern>${LOG_PATH}/audit/${FILE_PREFIX}.%d{yyyy-MM-dd}.log.zip</FileNamePattern>

            <!-- keep 30 days' worth of history -->
            <maxHistory>30</maxHistory>
        </rollingPolicy>

        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <springProfile name="local">
        <root level="${LOG_LEVEL}">
            <appender-ref ref="consoleAppender"/>
            <appender-ref ref="dailyRollingFileAppender"/>
        </root>

        <logger name="me.dong.thinklotto.web.audit" level="INFO" additivity="false">
            <appender-ref ref="auditDailyRollingFileAppender"/>
        </logger>
    </springProfile>

</configuration>
```
* appender가 추가될수록 지져분해진다
  * 설정 파일을 분리하자
* profile별로 log path를 다르게 할 수 없다
  * conditional processing 또는 환경변수를 이용해서 개선해보자


<br>

## appender 분리하기
* `included`, `include`를 사용해서 파일을 분리하자
* `logback.xml`의 가독성이 증가한다

<br>

* console-appender.xml 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<included>
    <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf8</charset>
        </encoder>

        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>${LOG_LEVEL}</level>
        </filter>
    </appender>
</included>
```

* daily-rolling-file-appender.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<included>
    <appender name="dailyRollingFileAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <FileNamePattern>${LOG_PATH}/${FILE_PREFIX}.%d{yyyy-MM-dd}.log.zip</FileNamePattern>

            <!-- keep 30 days' worth of history -->
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>
</included>
```

* audit-daily-rolling-file-appender.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<included>
    <appender name="auditDailyRollingFileAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <FileNamePattern>${LOG_PATH}/audit/${FILE_PREFIX}.%d{yyyy-MM-dd}.log.zip</FileNamePattern>

            <!-- keep 30 days' worth of history -->
            <maxHistory>30</maxHistory>
        </rollingPolicy>

        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>
</included>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

    <property name="FILE_PREFIX" value="think-lotto"/>
    <property name="LOG_LEVEL" value="DEBUG"/>
    <property name="LOG_PATH" value="logs/think-lotto"/>
    
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <include resource="console-appender.xml"/>
    <include resource="daily-rolling-file-appender.xml"/>
    <include resource="audit-daily-rolling-file-appender.xml"/>

    <springProfile name="local">
        <root level="${LOG_LEVEL}">
            <appender-ref ref="consoleAppender"/>
            <appender-ref ref="dailyRollingFileAppender"/>
        </root>

        <logger name="me.dong.thinklotto.web.audit" level="INFO" additivity="false">
            <appender-ref ref="auditDailyRollingFileAppender"/>
        </logger>
    </springProfile>
</configuration>
```


<br>

## profile별로 property를 다르게 하기
* [Conditional processing](https://logback.qos.ch/manual/configuration.html#conditional)을 사용하려면 [Janino library](https://janino-compiler.github.io/janino/) 필요
* [Could not find Janino library on the class path. Skipping conditional processing](https://logback.qos.ch/codes.html#ifJanino)를 참고해 setting
* Janino dependency 추가
```gradle
dependencies {
    implementation('org.codehaus.janino:janino:3.0.6')
}
```

* 아래와 같이 사용할 수 있다
```xml
<configuration>
    <if condition='"${spring.profiles.active}".contains("local")'>
        <then>
            <property name="LOG_LEVEL" value="DEBUG"/>
            <property name="LOG_PATH" value="logs/think-lotto"/>
        </then>
    </if>

    <if condition='"${spring.profiles.active}".contains("develop")'>
        <then>
            <property name="LOG_LEVEL" value="DEBUG"/>
            <property name="LOG_PATH" value="/home/ec2-user/logs/think-lotto"/>
        </then>
    </if>
    ...
</configuration>
```
* profile이 추가될 수록 지져분해진다
* 새로운 profile 추가시 또는 profile의 property 변경시 build 필요
* `환경변수`를 사용해 개선해보자


<br>

## 환경변수 바인딩하기
```sh
$ env

LOG_LEVEL=DEBUG
LOG_PATH=/logs/think-lotto
SPRING_PROFILES_ACTIVE=local
```
* 해당 방법사용시 profile을 환경변수에 설정안해주면 못읽어오더라...

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

    <property name="FILE_PREFIX" value="think-lotto"/>

    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <include resource="daily-rolling-file-appender.xml"/>
    <include resource="audit-daily-rolling-file-appender.xml"/>

    <springProfile name="local">
        <include resource="console-appender.xml"/>

        <root level="${LOG_LEVEL:-INFO}">
            <appender-ref ref="consoleAppender"/>
            <appender-ref ref="dailyRollingFileAppender"/>
        </root>

        <logger name="me.dong.thinklotto.web.audit" level="INFO" additivity="false">
            <appender-ref ref="auditDailyRollingFileAppender"/>
        </logger>
    </springProfile>

    <springProfile name="develop">
        <root level="${LOG_LEVEL:-INFO}">
            <appender-ref ref="dailyRollingFileAppender"/>
        </root>

        <logger name="me.dong.thinklotto.web.audit" level="INFO" additivity="false">
            <appender-ref ref="auditDailyRollingFileAppender"/>
        </logger>
    </springProfile>

</configuration>
```
* `${LOG_LEVEL:-INFO}`
  * LOG_LEVEL을 환경변수에서 바인딩되고 없으면 default로 INFO 사용
* build할 필요 없이 `restart만 하면되도록 개선`되었다


<br><br>

> #### Reference
> * [org/springframework/boot/logging/logback](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-project/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml)
> * [Logging - Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/howto-logging.html)
> * [Could not find Janino library on the class path. Skipping conditional processing](https://logback.qos.ch/codes.html#ifJanino)
> * [Conditional processing](https://logback.qos.ch/manual/configuration.html#conditional)
> * [Janino library](https://janino-compiler.github.io/janino/)
