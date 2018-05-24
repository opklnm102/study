# [Spring] Spring Retry
> [Retrying Requests With Spring Cloud Ribbon](http://ryanjbaxter.com/cloud/spring%20cloud/spring/2016/11/04/ribbon-retry.html)를 읽고, Spring Cloud Ribbon에서 retry를 구현하기 위해 Spring Retry를 사용했다는 것이 계기가 되어 Sprint Retry를 정리하기로함


## [Spring Retry](https://github.com/spring-projects/spring-retry)

* 실패한 작업을 자동으로 다시 호출하는 기능 제공
   * declarative retry support
* 일시적인 network 장애 같은 일시적인 오류로 실패하는 경우에 유용
* Spring Batch에 있던 retry 기능이 유틸성으로 패키지 분리
* Spring Batch, Spring Integration, Spring Cloud 등에서 사용 중
   * `org.springframework.cloud.client.loadbalancer.InterceptorRetryPolicy`

---

## Quick Start

### 1. dependencies 추가
```gradle
// build.gradle
dependencies {
    compile('org.springframework.retry:spring-retry')
}
```

### 2. Enabling Spring Retry
```java
@Configuration
@EnableRetry
public class RetryConfiguration {
    ...
}
```

### 3. @Retryable 사용
```java
public interface RemoteCaller {
    public String call(String url) throws MyException;
}

@Component
@Slf4j
public class AnnotationRetryRemoteCaller implements RemoteCaller {
    
     // MyException 발생시 2초간견으로 최대 2번 재시도
    @Retryable(include = MyException.class, maxAttempts = 2, backoff = @Backoff(delay = 2000, maxDelay = 5000))
    @Override
    public String call(String url) throws MyException {
        log.info("call : {}", url);

        if (true) {
            throw new MyException();
        }

        return "OK";
    }
}

2018-05-25 01:25:17.203  INFO 4690 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2018-05-25 01:25:17.206  INFO 4690 --- [           main] m.dong.retrybasic.RetryBasicApplication  : Started RetryBasicApplication in 1.711 seconds (JVM running for 2.151)
2018-05-25 01:25:21.473  INFO 4690 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : call : testUrl
2018-05-25 01:25:21.474  INFO 4690 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : recover : null, url : testUrl
```
* include된 exception이 발생했을 때만 retry한다

### 4. @Recover
```java
@Recover
public String recover()) {
    log.info("recover");
    return "";
}

// method parameter optional
@Recover
public String recover(MyException e, String url) {
    log.info("recover : {}, url : {}", e.getClass(), url);
    return url;
}
```
* 정해진 횟수만큼 retry 후 실패시 동작하는 메소드로 선언
* retry를 시도한 method signature가 같아야 `@Recover`가 동작한다 
   * parameter는 optional

### 5. output
```java
call : testUrl
call : testUrl
recover : class me.dong.retrybasic.MyException, url : testUrl
```



> #### 참고
> * [spring-projects/spring-retry](https://github.com/spring-projects/spring-retry)
> * [Guide to Spring Retry](http://www.baeldung.com/spring-retry)
