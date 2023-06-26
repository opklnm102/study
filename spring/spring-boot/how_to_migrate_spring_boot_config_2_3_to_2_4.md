# [Spring Boot] How to migrate Spring Boot config 2.3 to 2.4
> date - 2023.06.26  
> keyworkd - spring boot, profiles  
> spring boot에서는 application.properties, application.yml을 설정 파일로 사용하는데 2.4에서 바뀐 동작이 있어서 정리  

<br>

## 2.3 이전
```yaml
# application-prod.yaml
spring.profiles.active: prod,proddb,prodquartz
```
* prod profile을 활성화하면 application.yaml, application-prod.yaml을 사용하여 설정이 로드되고, profile의 설정이 우선 순위가 높다


<br>

## 2.3 -> 2.4
* application-<profile>.properties, application-<profile>.yml 내부에 pring.profiles.active이 선언되어 있으면 error 발생
```yaml
# application-prod.yaml
spring.profiles.active: prod,proddb,prodquartz
```
```java
org.springframework.boot.context.config.InvalidConfigDataPropertyException: Property 'spring.profiles.active' imported from location 'class path resource [application-dev.properties]' is invalid in a profile specific resource [origin: class path resource [application-dev.properties] from app.jar - 1:24]
at org.springframework.boot.context.config.InvalidConfigDataPropertyException.lambda$throwOrWarn$1(InvalidConfigDataPropertyException.java:125)
at java.base/java.lang.Iterable.forEach(Iterable.java:75)
at java.base/java.util.Collections$UnmodifiableCollection.forEach(Collections.java:1092)
at org.springframework.boot.context.config.InvalidConfigDataPropertyException.throwOrWarn(InvalidConfigDataPropertyException.java:122)
at org.springframework.boot.context.config.ConfigDataEnvironment.checkForInvalidProperties(ConfigDataEnvironment.java:362)
at org.springframework.boot.context.config.ConfigDataEnvironment.applyToEnvironment(ConfigDataEnvironment.java:326)
at org.springframework.boot.context.config.ConfigDataEnvironment.processAndApply(ConfigDataEnvironment.java:233)
at org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor.postProcessEnvironment(ConfigDataEnvironmentPostProcessor.java:102)
at org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor.postProcessEnvironment(ConfigDataEnvironmentPostProcessor.java:94)
at org.springframework.boot.env.EnvironmentPostProcessorApplicationListener.onApplicationEnvironmentPreparedEvent(EnvironmentPostProcessorApplicationListener.java:102)
at org.springframework.boot.env.EnvironmentPostProcessorApplicationListener.onApplicationEvent(EnvironmentPostProcessorApplicationListener.java:87)
at org.springframework.context.event.SimpleApplicationEventMulticaster.doInvokeListener(SimpleApplicationEventMulticaster.java:176)
at org.springframework.context.event.SimpleApplicationEventMulticaster.invokeListener(SimpleApplicationEventMulticaster.java:169)
at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:143)
at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:131)
at org.springframework.boot.context.event.EventPublishingRunListener.environmentPrepared(EventPublishingRunListener.java:85)
at org.springframework.boot.SpringApplicationRunListeners.lambda$environmentPrepared$2(SpringApplicationRunListeners.java:66)
at java.base/java.util.ArrayList.forEach(ArrayList.java:1511)
at org.springframework.boot.SpringApplicationRunListeners.doWithListeners(SpringApplicationRunListeners.java:120)
at org.springframework.boot.SpringApplicationRunListeners.doWithListeners(SpringApplicationRunListeners.java:114)
at org.springframework.boot.SpringApplicationRunListeners.environmentPrepared(SpringApplicationRunListeners.java:65)
at org.springframework.boot.SpringApplication.prepareEnvironment(SpringApplication.java:343)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:301)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:1303)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:1292)
...
```

<br>

### Migration Guide
| Case | To-be |
|:--|:--|
| application-<profile>.yaml | spring.profiles.active, spring.profiles.default, spring.profiles.include 사용 불가<br>spring.profiles.active는 system property(e.g. -Dspring.profiles.active=<profile>) or 환경 변수(e.g. SPRING_PROFILES_ACTIVE=<profile>)로 설정<br>spring.profiles.include는 [profile group](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles.groups)으로 변경 |
| application.yaml (non-profile) | spring.profiles.active, spring.profiles.default, spring.profiles.include 사용 가능 |
| multi-document | spring.profiles -> spring.config.activate.on-profile<br>overwrite가 profile 순서에서 파일에 선언된 순서로 변경<br>위에서 아래로 적용되기 때문에 마지막에 있는 값 적용 |

* spring.profiles.active, spring.profiles.default, spring.profiles.include
  * non-profile 파일에서만 사용 가능
  * spring.config.activate.on-profile에 의해 활성화된 profile 파일에서는 사용 불가
* `spring.profiles`, `spring.profiles.include` 사용 -> -Dspring.profiles.active=<profile>로 profile이 활성화되며 `spring.config.activate.on-profile=<profile>`로 설정된 document와 application-<profile>.yaml, spring.profiles.group으로 설정된 profile을 사용한다
```yaml
spring.profiles: prod
spring.profiles.include: proddb,prodquartz
```
```yaml
spring:
  profiles:
    group:
      prod: proddb,prodquartz
---
spring:
  config:
    activate:
      on-profile: prod
...
```

<br>

### Multi-document?
* application.yaml `---`로 구분
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.zaxxer.hikari.HikariDataSource
---
spring:
  config.activate.on-profile: local
  datasource:
    url: jdbc:mysql://localhost:3306/xxx
---
spring:
  config.activate.on-profile: prod
  datasource:
    url: jdbc:mysql://prod:3306/xxx
```
* application.properties `#---`로 구분
```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.type=com.zaxxer.hikari.HikariDataSource
#---
spring.config.activate.on-profile=local
spring.datasource.url=jdbc:mysql://localhost:3306/xxx
#---
spring.config.activate.on-profile=prod
spring.datasource.url=jdbc:mysql://prod:3306/xxx
```


<br>

## 2.4 이후
* pring.profiles.include + spring.config.activate.on-profile을 사용할 수도 있고, spring.profiles.group + spring.config.activate.on-profile을 이용할 수도 있다

### spring.profiles.include 이용
* application.yaml
```yaml
spring:
  application:
    name: test-api
  profiles:
    include:
      - db
---
spring:
  config.activate.on-profile: local
server:
  port: 8081
---
spring:
  config.activate.on-profile: prod
server:
  port: 8080
```

* application-db.yaml
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.zaxxer.hikari.HikariDataSource
  jpa:
    show-sql: false
    open-in-view: off
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: false
---
spring:
  config.activate.on-profile: local
  datasource:
    url: jdbc:mysql://localhost:3306/xxx?sslMode=DISABLED&connectTimeout=10000&socketTimeout=30000
    username: test-user
    hikari:
      maximum-pool-size: 5
      max-lifetime: 300000
      connection-timeout: 10000
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
---
spring:
  config.activate.on-profile: prod
  datasource:
    url: jdbc:mysql://prod:3306/xxx?sslMode=DISABLED&connectTimeout=10000&socketTimeout=30000
    username: test-user
    hikari:
      maximum-pool-size: 10
      max-lifetime: 300000
      connection-timeout: 10000
```

<br>

### spring.profiles.group 이용
* application.yaml
```yaml
spring:
  application:
    name: test-api
  profiles:
    group:
      local: localdb,localquartz
      prod: proddb,prodquartz
---
spring:
  config.activate.on-profile: local
server:
  port: 8081
---
spring:
  config.activate.on-profile: prod
server:
  port: 8080
```
* application-localdb.yaml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/xxx?sslMode=DISABLED&connectTimeout=10000&socketTimeout=30000
    username: test-user
    hikari:
      maximum-pool-size: 5
      max-lifetime: 300000
      connection-timeout: 10000
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```
* application-proddb.yaml
```yaml
spring:
  datasource:
    url: jdbc:mysql://prod:3306/xxx?sslMode=DISABLED&connectTimeout=10000&socketTimeout=30000
    username: test-user
    hikari:
      maximum-pool-size: 10
      max-lifetime: 300000
      connection-timeout: 10000
```

<br><br>

> #### Reference
> * [Spring Boot Config Data Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-Config-Data-Migration-Guide)
