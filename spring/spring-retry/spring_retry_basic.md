# [Spring] Spring Retry Basic
> date - 2018.06.27  
> keyword - spring retry, RetryTemplate  
> [Retrying Requests With Spring Cloud Ribbon](http://ryanjbaxter.com/cloud/spring%20cloud/spring/2016/11/04/ribbon-retry.html)를 읽고, Spring Cloud Ribbon에서 retry를 구현하기 위해 Spring Retry를 사용했다는 것이 계기가 되어 Sprint Retry를 정리하기로함

<br>

## [Spring Retry](https://github.com/spring-projects/spring-retry)
* 실패한 작업을 자동으로 다시 호출하는 기능 제공
   * declarative retry support
* 일시적인 network 장애 같은 일시적인 오류로 실패하는 경우에 유용
* Spring Batch에 있던 retry 기능이 유틸성으로 패키지 분리
* Spring Batch, Spring Integration, Spring Cloud 등에서 사용 중
   * `org.springframework.cloud.client.loadbalancer.InterceptorRetryPolicy`

---

<br>

## Quick Start

### 1. dependencies 추가
```gradle
// build.gradle
dependencies {
    // current version : 1.2.2 RELEASE
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
    
     // MyException 발생시 2초간견으로 최대 3번 재시도
    @Retryable(include = MyException.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, maxDelay = 5000))
    @Override
    public String call(String url) throws MyException {
        log.info("call : {}", url);

        if (true) {
            throw new MyException();
        }

        return "OK";
    }
}

2018-06-27 23:44:47.302  INFO 2986 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : call : testUrl
2018-06-27 23:44:51.524  INFO 2986 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : call : testUrl
2018-06-27 23:44:55.880  INFO 2986 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : call : testUrl
2018-06-27 23:44:55.880  INFO 2986 --- [pool-1-thread-1] m.d.r.AnnotationRetryRemoteCaller        : recover : class me.dong.retrybasic.MyException, url : testUrl
```
* include된 exception이 발생했을 때만 retry한다
* log를 보면 2~5초의 간격을 두고 3번 호출된 것을 알 수 있다

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
* retry를 시도한 method(@Retryable이 선언된)와 return type이 같으면 `@Recover`가 동작한다 
   * parameter는 optional

```java
// private여도 실행
@Recover
private String recover() {
    log.info("recover");
    return "";
}

// 여러개의 @Recover가 있을 경우 더 자세한(parameter가 있는) 메소드가 실행된다
// 이게 실행된다
@Recover
public String recover(MyException e, String url) {
    log.info("recover : {}, url : {}", e.getClass(), url);
    return url;
}

// 실행이 안된다
@Recover
public void recoverVoid(MyException e, String url) {
    log.info("recover : {}, url : {}", e.getClass(), url);
}
```

### 5. output
```java
call : testUrl
call : testUrl
recover : class me.dong.retrybasic.MyException, url : testUrl
```

---

<br>

## RetryTemplate

### RetryOperation
* Spring Retry가 제공하는 interface
* parameter로 retry할 logic을 RetryCallback으로 받아 callback 방식으로 retry한다
```java
public interface RetryOperations {

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback) throws E;

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RecoveryCallback<T> recoveryCallback) throws E;
    
	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RetryState retryState) throws E, ExhaustedRetryException;

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RecoveryCallback<T> recoveryCallback, RetryState retryState)
			throws E;
}
```

#### RetryCallback
* `RetryOperations`에서 retry시 사용하는 callback interface
* 재시도해야 하는 business logic을 구현할 수 있는 interface
```java
public interface RetryCallback<T, E extends Throwable> {
	T doWithRetry(RetryContext context) throws E;
}
```

<br>

### RetryTemplate Configuration
* RetryTemplate Bean 설정
```java
@Configuration
public class RetryConfiguration {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(2000L);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(4);
        retryTemplate.setRetryPolicy(retryPolicy);

        return retryTemplate;
    }
}
```
* RetryPolicy
  * retry 시기를 결정
  * SimpleRetryPolicy는 고정된 횟수만큼 retry하는데 사용
* BackOffPolicy
  * retry간의 backOff를 제어하는데 사용
  * FixedBackOffPolicy는 retry하기 전에 일정 시간동안 일시 중지한다

<br>

### Using the RetryTemplate
```java
public String  call(String url) {

    // using anonymous class
    return retryTemplate.execute(new RetryCallback<String, RuntimeException>() {
            @Override
            public String doWithRetry(RetryContext context) {
                log.info("call : {}", url);

                return "OK";
            }
    });

    // using lambda
    return retryTemplate.execute(context -> {
            log.info("call : {}", url);
            return "OK";
    });
}
```

---

<br>

## Listeners
* retry시 추가 callback 제공
* 서로 다른 retry간의 cross-cutting 문제에 사용
* callback은 RetryListener에서 callback 제공
  * open(), close()는 전체 retry 전후 발생
  * onError()는 개별 RetryCallback 호출시 적용

```java
@Slf4j
public class DefaultListenerSupport extends RetryListenerSupport {
    
    @Override
    public <T, E extends Throwable> boolean open(RetryContext context, RetryCallback<T, E> callback) {
        log.info("open");
        return super.open(context, callback);
    }

    @Override
    public <T, E extends Throwable> void close(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {
        super.close(context, callback, throwable);
        log.info("close");
    }

    @Override
    public <T, E extends Throwable> void onError(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {
        super.onError(context, callback, throwable);
        log.info("onError");
    }
}
```

* Listener 등록
```java
@Configuration
public class RetryConfiguration {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        ...

        retryTemplate.registerListener(new DefaultListenerSupport());
        return retryTemplate;
    }
}
```

---

<br>

Todo:
https://github.com/spring-projects/spring-retry
=> 여기 README 정도는 정리해두자

> #### 참고
> * [spring-projects/spring-retry](https://github.com/spring-projects/spring-retry)
> * [Guide to Spring Retry](http://www.baeldung.com/spring-retry)
