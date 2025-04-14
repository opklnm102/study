# [Spring] Spring @Async 
> Spring에서 `@Async`를 사용하여 얼마나 간단하게 asynchronous 작업을 처리하는지에 대해 정리

## Java 비동기 방식 처리
```java
@Service
@Slf4j
public class OrderService {

    public void createOrder() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                log.info("test createOrder {}", Thread.currentThread());
            }
        }).start();
    }
}
```
* thread를 관리할 수 없기 때문에 위험한 방법
* 동시에 1000개의 method call이 발생하면 동시에 1000개의 thread가 생성되는 방식

```java
@Service
@Slf4j
public class OrderService {

    ExecutorService executorService = Executors.newFixedThreadPool(10);

    public void createOrder() {
        executorService.submit(new Runnable(){
            @Override
            public void run() {
                log.info("test createOrder {}", Thread.currentThread());
            }
        });
    }
}
```
* Thread 관리를 위해 `java.util.concurrent.ExecutorService`를 사용
* `ExecutorService`를 사용하기 위해 메소드 수정
* asynchronous 처리를 하기 위해 method 마다 동일한 반복 작업...
* `@Async`로 간단하게 처리 가능


## Enable Async
```java
@Configuration
@EnableAsync
public class AsyncConfig {

}
```

### @EnableAsync
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(AsyncConfigurationSelector.class)
public @interface EnableAsync {

	Class<? extends Annotation> annotation() default Annotation.class;

	boolean proxyTargetClass() default false;

	AdviceMode mode() default AdviceMode.PROXY;

	int order() default Ordered.LOWEST_PRECEDENCE;
}
```
* annotation
   * spring의 class or method level에 선언된 `@Async`를 감지
   * 사용자 정의 annotation도 감지할 수 있다
* mode
   * 사용할 advice type을 지정
   * `AdviceMode.PROXY` - JDK proxy
   * `AdviceMode.ASPECTJ` - AspectJ weaving
* proxyTargetClass
   * interface-based proxy와 다른 subclass-based(CGLIB) proxy 사용 여부
   * mode가 `AdviceMode.PROXY`일 경우에만 유효
   * true일 경우(default, false), 다른 proxy가 필요한 bean(@Transactional 등)도 subclass-based proxy가 사용된다
   * 특정 proxy를 명시적으로 선언하지 않는한 사용에 주의
* order
   * `AsyncAnnotationBeanPostProcessor`를 적용해야 하는 순서 지정
   * 다른 모든 proxy 후에 실행하기 위해 default는 `Ordered.LOWEST_PRECEDENCE`
   * 이중 proxy가 아닌 기존 proxy에 advisor를 추가할 수 있다

```java
public interface Ordered {

	int HIGHEST_PRECEDENCE = Integer.MIN_VALUE;

	int LOWEST_PRECEDENCE = Integer.MAX_VALUE;

	int getOrder();
}
```


#### @EnableAsync custom annotation 사용하기
```java
@Service
@Slf4j
public class OrderService {

    @Async
    public void createOrder() {
        log.info("test createOrder {}", Thread.currentThread());
    }

    @MyAnnotation
    public void readOrder() {
        log.info("test readOrder {}", Thread.currentThread());
    }
}

// 기본 설정
@Configuration
@EnableAsync
public class AsyncConfig {
}
[           main] k.c.m.creationfeedback.OrderService      : test readOrder Thread[main,5,main]
[cTaskExecutor-1] k.c.m.creationfeedback.OrderService      : test createOrder Thread[SimpleAsyncTaskExecutor-1,5,main]

// custom annotation에 적용
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {

}

@Configuration
@EnableAsync(annotation = MyAnnotation.class)
public class AsyncConfig {
}

[           main] k.c.m.creationfeedback.OrderService      : test createOrder Thread[main,5,main]
[cTaskExecutor-1] k.c.m.creationfeedback.OrderService      : test readOrder Thread[SimpleAsyncTaskExecutor-1,5,main]
```


## @Async

### @Async의 제약사항
* private method에 사용 불가
   * class based proxy를 사용할 경우
      * protected, package, public 사용
   * interface-based proxy일 경우
      * interface의 메소드는 모두 public
* self invocation(같은 클래스에서 호출)에는 작동하지 않는다
* method가 `private가 아니어야` proxy될 수 있고, `self invocation`은 proxy를 우회하여 직접 호출하기 때문에 작동하지 않는다
```java
@Component
public class MyListener {

    @Autowired
    private OrderService orderService;

    @EventListener
    public void listen(ApplicationReadyEvent event) {
        orderService.createOrder();  // 1
        orderService.readOrder();  // 4
    }
}

@Service
@Slf4j
public class OrderService {

    @Autowired
    private NotificationService notificationService;

    void createOrder() {
        log.info("test createOrder {}", Thread.currentThread());

         this.readOrder();  // 2 - self invocation
         notificationService.notifyToUser();  // 3
    }

    @Async
    public void readOrder() {
        log.info("test readOrder {}", Thread.currentThread());
    }
}

@Service
@Slf4j
public class NotificationService {

    @Async
    public void notifyToUser() {
        log.info("test notifyToUser {}", Thread.currentThread());
    }
}

[           main] k.c.m.creationfeedback.OrderService      : test createOrder Thread[main,5,main]  // 1
[           main] k.c.m.creationfeedback.OrderService      : test readOrder Thread[main,5,main]  // 2 - self invocation
[cTaskExecutor-1] k.c.m.c.NotificationService              : test notifyToUser Thread[SimpleAsyncTaskExecutor-1,5,main]  // 3
[cTaskExecutor-2] k.c.m.creationfeedback.OrderService      : test readOrder Thread[SimpleAsyncTaskExecutor-2,5,main]  // 4
```


### return type이 없는 메소드
* 간단한 설정으로 동작
```java
@Async
public void createOrder() {
    log.info("test notifyToUser {}", Thread.currentThread());
}
```

### return type이 있는 메소드
* Future를 구현한 AsyncResult<V>로 비동기 메소드 실행 결과를 가져온다
```java
@Service
@Slf4j
public class NotificationService {

    @Async
    public Future<String> notifyToUser() {
        log.info("test notifyToUser {}", Thread.currentThread());

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            log.error("thread sleep", e);
        }
        return new AsyncResult<>("complete notification");
    }
}
@Service
@Slf4j
public class OrderService {

    @Autowired
    private NotificationService notificationService;

   public void createOrder() throws ExecutionException, InterruptedException {
        log.info("test createOrder {}", Thread.currentThread());

        this.readOrder();

        Future<String> future = notificationService.notifyToUser();
        while (true) {
            if (future.isDone()) {
                log.info("result from asynchronous process {}", future.get());
                break;
            }
            Thread.sleep(1000);
        }
    }
}
```


## Task Executor
* Spring은 default로 `SimpleAsyncTaskExecutor`를 사용하여 메소드를 비동기로 실행
   * thread를 관리할 수 없다
* 2가지 level로 override할 수 있다
   * application level
   * method level

### method level
```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }
}

// SimpleAsyncTaskExecutor -> ThreadPoolTaskExecutor로 바뀐것을 볼 수 있다
2017-12-14 07:08:46.348  INFO 5188 --- [           main] k.c.m.creationfeedback.OrderService      : test createOrder Thread[main,5,main]
2017-12-14 07:08:46.348  INFO 5188 --- [           main] k.c.m.creationfeedback.OrderService      : test readOrder Thread[main,5,main]
2017-12-14 07:08:46.353  INFO 5188 --- [lTaskExecutor-1] k.c.m.c.NotificationService              : test notifyToUser Thread[threadPoolTaskExecutor-1,5,main]
2017-12-14 07:08:51.372  INFO 5188 --- [lTaskExecutor-1] k.c.m.creationfeedback.OrderService      : test readOrder Thread[threadPoolTaskExecutor-1,5,main]
```

#### 특정 Executor 사용하기
* `@Async`별로 Executor를 설정할 수 있다
```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }

    @Bean(name = "asyncThreadPoolTaskExecutor")
    public Executor asyncThreadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }
}

@Service
@Slf4j
public class OrderService {

    @Async(value = "threadPoolTaskExecutor")
    public void createOrder() {
        log.info("test createOrder {}", Thread.currentThread());
    }

    @Async(value = "asyncThreadPoolTaskExecutor")
    public void readOrder() {
        log.info("test readOrder {}", Thread.currentThread());
    }
}

// 호출부
@EventListener
public void listen(ApplicationReadyEvent event) {
    orderService.createOrder();
    orderService.readOrder();
}

[lTaskExecutor-1] k.c.m.creationfeedback.OrderService      : test createOrder Thread[threadPoolTaskExecutor-1,5,main]
[lTaskExecutor-1] k.c.m.creationfeedback.OrderService      : test readOrder Thread[asyncThreadPoolTaskExecutor-1,5,main]
```


### application level
* `AsyncConfigurerSupport`, `AsyncConfigurer`를 상속하여 Application을 위한 Executor를 선언
* `@Async` 메소드를 실행하는 기본 Executor로 사용된다
```java
@Configuration
@EnableAsync
public class AsyncConfig extends AsyncConfigurerSupport {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("AsyncExecutor-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60000);
        executor.initialize();
        return executor;
    }
}

[AsyncExecutor-1] k.c.m.creationfeedback.OrderService      : test createOrder Thread[AsyncExecutor-1,5,main]
[AsyncExecutor-2] k.c.m.creationfeedback.OrderService      : test readOrder Thread[AsyncExecutor-2,5,main]
```


## Exception Handling
* method `return type이 Future`일 경우
   * Future.get()으로 exception이 전달된다
* method `return type이 void`일 경우
   * exception이 호출 thread로 전달되지 않는다
   * 추가 설정 필요
   * `AsyncUncaughtExceptionHandler` interface로 exception handler 구현
   * `AsyncConfigurer`의 `getAsyncUncaughtExceptionHandler()` override

```java
@Slf4j
public class MyAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

    // uncaugh asynchronous exception 발생시 호출
    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        log.error("handleUncaughtException", ex);
    }
}

@Configuration
@EnableAsync
public class AsyncConfig extends AsyncConfigurerSupport {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);  // 최소 가용 thread 2개
        executor.setQueueCapacity(50);  // 2개의 thread가 모두 사용중이라면 queue에 50개 까지 대기
        executor.setMaxPoolSize(2);  // queue 마저 차버리면 가용 thread를 최대 2개까지 생성, 최대 가용 thread까지 모두 차버리면 TaskRejectedException 발생
        executor.setThreadNamePrefix("AsyncExecutor-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60000);
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new MyAsyncExceptionHandler();
    }
}

// 강제로 exception 발생시켜 handler에서 catch
2017-12-14 07:47:10.207  INFO 5818 --- [AsyncExecutor-1] k.c.m.creationfeedback.OrderService      : test createOrder Thread[AsyncExecutor-1,5,main]
2017-12-14 07:47:10.207  INFO 5818 --- [AsyncExecutor-2] k.c.m.creationfeedback.OrderService      : test readOrder Thread[AsyncExecutor-2,5,main]
2017-12-14 07:47:10.212 ERROR 5818 --- [AsyncExecutor-1] k.c.m.c.MyAsyncExceptionHandler          : handleUncaughtException

java.lang.RuntimeException: null
	at kr.co.mashup.creationfeedback.OrderService.createOrder(OrderService.java:23) ~[classes/:na]
	at kr.co.mashup.creationfeedback.OrderService$$FastClassBySpringCGLIB$$8c89ab82.invoke(<generated>) ~[classes/:na]
	at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:204) ~[spring-core-4.3.12.RELEASE.jar:4.3.12.RELEASE]
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:738) ~[spring-aop-4.3.12.RELEASE.jar:4.3.12.RELEASE]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:157) ~[spring-aop-4.3.12.RELEASE.jar:4.3.12.RELEASE]
	at org.springframework.aop.interceptor.AsyncExecutionInterceptor$1.call(AsyncExecutionInterceptor.java:115) ~[spring-aop-4.3.12.RELEASE.jar:4.3.12.RELEASE]
	at java.util.concurrent.FutureTask.run(FutureTask.java:266) [na:1.8.0_121]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142) [na:1.8.0_121]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617) [na:1.8.0_121]
	...
```




Todo: https://heowc.github.io/2018/02/10/spring-boot-async/
https://heowc.github.io/2018/02/13/spring-boot-async-advanced/



> #### 참고
> * [How To Do @Async in Spring](http://www.baeldung.com/spring-async)





