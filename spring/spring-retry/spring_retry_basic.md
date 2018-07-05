# [Spring] Spring Retry Basic
> date - 2018.06.27  
> keyword - spring retry, RetryTemplate  
> [Retrying Requests With Spring Cloud Ribbon](http://ryanjbaxter.com/cloud/spring%20cloud/spring/2016/11/04/ribbon-retry.html)를 읽고, Spring Cloud Ribbon에서 retry를 구현하기 위해 Spring Retry를 사용했다는 것이 계기가 되어 Sprint Retry를 정리하기로함

<br>

## [Spring Retry](https://github.com/spring-projects/spring-retry)
* 실패한 작업을 자동으로 다시 호출하는 기능 제공
  * declarative retry support
* 일시적인 오류로 실패하는 경우에 유용
  * 일시적인 network 장애
  * DB update의 deadlock
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

    /**
     * stateless retry
     * <p>
     * - MyException에 대해 최대 3번 시도
     * - NullPointerException은 재시도하지 않는다
     * - backoff 간격은 2000ms ~ 5000ms에서 랜덤으로 결정
     *
     * include - retry 가능 exception 설정
     * exclude - retry 불가능 exception 설정 
     * maxAttempts - 최대 시도 수
     * backoff - retry 간격 설정
     * @param url
     * @return
     */
    @Retryable(include = MyException.class, exclude = NullPointerException.class,
            maxAttempts = 3, backoff = @Backoff(delay = 2000, maxDelay = 5000), stateful = false)
    @Override
    public String call(String url) {
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
* `RetryTemplate`은 RetryOperations의 가장 단순한 범용 구현체

### RetryOperation
* Spring Retry가 제공하는 retry를 자동화하기 위한 interface
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
* callback이 실행되어 exception 발생되어 실패하면, 성공할 때까지 또는 중단될 때까지 retry
* RetryState
  * client와 구현체간의 호출 정보를 저장

#### RetryCallback
* `RetryOperations`에서 retry시 사용하는 callback interface
* 재시도해야 하는 `business logic을 구현할 수 있는 interface`
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

        // retry 전에 고정된 시간동안 일시 중지하는 backOff
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(2000L);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        // 고정된 횟수만큼 retry하는 policy
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(4);
        retryTemplate.setRetryPolicy(retryPolicy);

        return retryTemplate;
    }
}
```

<br>

### Using the RetryTemplate
```java
public String  call(String url) {

    // using anonymous class
    return retryTemplate.execute(new RetryCallback<String, RuntimeException>() {
            @Override
            public String doWithRetry(RetryContext context) {
                // business logic here
                return "OK";
            }
    });

    // using lambda
    return retryTemplate.execute(context -> {
            // business logic here
            return "OK";
    });
}
```

---

<br>

## Retry Context
* `RetryCallback.doWithRetry(RetryContext context)`
* 필요에 따라 retry 과정의 데이터를 저장
  * callback이 RetryContext를 무시할 수 있다
* 동일한 thread에서 진행 중인 nested retry가 있는 경우 parent context를 가지는데 `execute()` 호출에서 공유해야 하는 데이터를 저장하는데 유용

```
RetryContext(I)
  └── RetryContextSupport(C)
        ├── SimpleRetryContext(C) => SimpleRetryPolicy에서 사용
        ├── NeverRetryContext(C) => NeverRetryPolicy에서 사용
        ├── TimeoutRetryContext(C) => TimeoutRetryPolicy에서 사용
        ├── ExceptionClassifierRetryContext(C) => ExceptionClassifierRetryPolicy에서 사용
        ├── CircuitBreakerRetryContext(C) => CircuitBreakerRetryPolicy에서 사용
        └── CompositeRetryContext(C) => CompositeRetryPolicy에서 사용

I - interface
C - class
```

---

<br>

## RecoveryCallback
* retry 기회가 고갈되면 RetryOperations는 RecoveryCallback에 제어를 전달해 대체 처리를 수행할 수 있다
```java
@Override
public String call(String url) {
    return retryTemplate.execute(context -> {  
        // retry callback - business logic here

        log.info("call : {}", url);

        return restTemplate.getForEntity(url, String.class).getBody();
    }, context -> {
        // recovery callback - recover logic here
    
        log.info("recover. retryCount : {}, exception : {}", context.getRetryCount(), context.getLastThrowable().getMessage());
        return "failure";
    });
}
```

---

<br>

## Stateless Retry
* retry는 단순히 생각하면 while loop
  * 성공 or 실패할 때까지 계속 시도할 수 있다
* `RetryContext`
  * 재시도 or 중단할지 결정할 수 있는 state 포함
* state는 stack에 있어 전역에 저장할 필요가 없어 `stateless retry`로 불린다
* callback은 retey시 항상 `실패했을 때와 동일한 thread`에서 실행
* Stateless, Stateful retry의 차이는 `RetryPolicy 구현`

---

<br>

## Stateful Retry
* 실패로 인해 트랜잭션이 실패하는 경우 rollback을 위해 실패한 exception을 전파하고 새로운 유효한 트랜잭션 시작해야 한다
  * stateless retry는 부적합
  * retry 및 rollback은 `RetryOperations.execute()`를 종료하고 stack에 있던 context를 잃어버리기 때문
  * 손실을 피하기 위해 stack 대신 heap storage 사용
* RetryTemplate에 사용할 수 있는 storage strategy인 `RetryContextCache` 제공
  * 기본 구현은 Map을 사용해 메모리에 저장
  * memory leak 방지를 위한 maximum capacity 구현되어 있지만, time to live와 같은 고급 cache 기능은 없다
    * 필요한 경우 이런한 기능이 포함된 Map 사용을 고려
  * cluster에서 여러 프로세스를 사용하는 경우 cluster cache에서 RetryContextCache 구현을 고려 -> over engineering이 될 수 있다


### RetryState 추상화
* RetryOperations은 실패한 작업이 재시도시 새로운 실행(새로운 트랜잭션 등)으로 돌아 왔을 때 인식하기 위해 RetryState 추상화 제공
  * 여러번의 retry에서 state를 식별하기 위해 unique key를 반환하는 RetryState를 제공
  * unique key는 RetryContextCached의 key로 사용
    * hashCode() - X
    * business key - best
    * ex. JMS일 경우에는 message ID 사용

---

<br>

## Retry Policies
* retry 여부를 결정


```
Todo: 이렇게 구현체들 나열해서 간단한 설명 작성
RetryPolicy
  └── RetryContextSupport
        ├── SimpleRetryContext
        ├── NeverRetryContext
        ├── TimeoutRetryContext
        ├── ExceptionClassifierRetryContext  
        ├── CircuitBreakerRetryContext
        └── CompositeRetryContext

RetryPolicy
  └──
        SimpleRetryPolicy => 고정된 횟수만큼 retry 한다
        TimeoutRetryPolicy => 시간 초과에 도달 할 때까지 다시 시도됩니다?
```





---

<br>

## Backoff policies
* 일시적인 오류일 경우 잠깐 기다렸다가 재시도하면 대부분 해결된다
* 대기하지 않고 retry하면 전부 실패할 수 있다
   * ex) ethernet...

<br>

### BackoffPolicy
* retry간의 간격을 제어하는데 사용
* 원하는 방식으로 backOff를 자유롭게 구현 가능
* Spring Retry가 제공하는 BackoffPolicy는 모두 `Object.wait()` 사용
  * 1.2.2 RELASE에서는 `Thread.sleep()` 사용
* RetryCallback이 실패하면 RetryTemplate은 BackoffPolicy에 따라 실행을 일시 정지할 수 있다

```java
public interface BackoffPolicy {
 
    // backoff의 새로운 block 시작
    // start()가 호출될 때 일시 정지되도록 할 수 있지만 일반적으로는 BackOffContext가 즉시 반환된다
    BackOffContext start(RetryContext context);

    // 구현에 따라 일시 정지
    // BackOffContext는 start()에서 가져온것과 대응된다
    void backOff(BackOffContext backOffContext) throws BackOffInterruptedException;
}
```

```
BackOffPolicy(I)
  ├── SleepingBackOffPolicy(I) => backoff시 sleep하는 policy
  │     ├── ExponentialBackOffPolicy(C) => 대기 시간이 기하 급수적으로 증가
  │     │      └── ExponentialRandomBackOffPolicy(C) => 대기 시간이 기하 급수적으로 증가하는데 증가 폭이 랜덤
  │     │
  │     ├── FixedBackOffPolicy(C) => 일정한 대기 시간
  │     └── UniformRandomBackOffPolicy(C) => 랜덤한 대기 시간
  │
  └── StatelessBackOffPolicy(AC) => Stateless backoff policy
        └── NoBackOffPolicy(C) => 대기 시간이 없다

I - interface
AC - abstract class
C - class 
```

<br>

### Sleeper
* backOff를 동작시키기 위해 대기하는 기능 제공
```java
package org.springframework.retry.backoff;

public interface Sleeper extends Serializable {
    void sleep(long var1) throws InterruptedException;
}
```

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

## Declarative Retry
* AOP를 사용해 retry를 지원
* RetryOperation call을 wrapping 하는 interceptor인 `RetryOperationsInterceptor`를 제공
   * intercept된 메소드를 호출하고 실패시 RepeatTemplate의 RetryPolicy에 따라 retry

```java
@Configuration
@EnableRetry
public class RetryConfiguration {

    @Bean
    public RetryListener retryListener1() {
        return new RetryListener() { ... }
    }

    @Bean
    public RetryListener retryListener2() {
        return new RetryListener() { ... }
    }
}

@Service
public class {
    
    @Retryable(maxAttempts = 12, backoff = @Backoff(delay = 100, maxDelay = 500))
    public service() {
        ...
    }
}
```

### @EnableRetry
* runtime시 retry 제어를 위한 RetryTemplate과 interceptor에 사용되는 Sleeper 등을 찾는다
* `@Retryable` bean에 대한 proxy를 생성
  * proxy는 application의 bean instance에 Retryable interface를 추가


---

<br>

> #### 참고
> * [spring-projects/spring-retry](https://github.com/spring-projects/spring-retry)
> * [Guide to Spring Retry](http://www.baeldung.com/spring-retry)
