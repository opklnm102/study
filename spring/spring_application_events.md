# [Spring] Spring Events
> spring boot의 graceful shutdown 구현을 위해 코드를 보던 중 ContextClosedEvent를 보고 Spring Event에 대해 공부한 내용을 정리 


## Application Event
* 느슨하게 결합된 Component간 정보를 전달하는 수단
* 기본적으로 synchronous


## 기본적인 방법
```java 
@Component
public class CustomListener implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // context refresh시 event consume
    }
}
```


## Geenric
* event 전달시 Listener의 signature를 이용하여 들어오는 event와 일치하는지 판단

```java
public class Order {
    private Long orderId;
}

public class CustomEvent<Order> extends ApplicationEvent {

    /**
     * Create a new ApplicationEvent.
     *
     * @param source the object on which the event initially occurred (never {@code null})
     */
    public CustomEvent(Object source) {
        super(source);
    }
}

@Component
public class CustomListener implements ApplicationListener<CustomEvent<Order>> {

    @Override
    public void onApplicationEvent(CustomEvent<Order> event) {

    }
}
```


## Annotation 기반 Event Listener
* JMS, AMQP endpoint와 유사한 `Annotation 기반 Event Listener` 지원
```java
@Component
public class CustomListener {

    // method signature에 관심있는 event 정의
    @EventListener
    @Order(value = 30)  // 순서 지정 가능
    public void handleContextRefresh(ContextRefreshedEvent event) {

    }
}
```

 
### Conditional Event Handling
* `SpEL(Spring Expression Language)` 사용
```java
public class Order {
    private Long orderId;
}

public class CustomEvent<Order> {

}

public class OrderCreatedEvent extends CustomEvent<Order> {

    private boolean success;

    public boolean isSuccess() {
        return success;
    }
}

public class CustomListener {

    @EventListener(condition = "#createdEvent.success")
    public void handleOrderCreatedEvent(OrderCreatedEvent createdEvent) {

    }
}
```


## Event Publish
* `@EventListener`가 붙은 메소드의 리턴 타입이 void가 아닌 타입 정의 가능
특정 이벤트를 처리한 결과로 null 을 반환하지 않으면 해당 결과가 새로운 이벤트로 전송

* OrderCreatedEvent는 ApplicationEvent를 상속하지 않았다
   * 유연성..
* `ApplicationEventPublisher`로 모든 객체를 Publish 가능
   * 객체가 ApplicationEvent가 아닌 경우 PayloadApplicationEvent로 래핑
   * ApplicationListener를 사용하여 event 수신시 `PayloadApplicationEvent`임을 기억할 것

```java
@Component
public class EventPublisher {

    private final ApplicationEventPublisher publisher;

    @Autowired
    public EventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void createOrder(Order order) {
        this.publisher.publishEvent(new OrderCreatedEvent(order));
    }
}
```


## Transaction bound events
* Event Listener를 Transaction 단계에 바인드하는 기능
   * Transaction이 성공적으로 완료되면 Event 처리
   * Transaction 결과가 Listener에게 중요한 경우 Event를 보다 유연하게 사용할 수 있다
* Transaction이 실행되고 있지 않으면 event 발행 X

```java
public class CustomListener {

    @TransactionalEventListener(condition = "#createdEvent.success")
    public void handleOrderCreatedEvent(OrderCreatedEvent createdEvent) {

    }
}

@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@EventListener
public @interface TransactionalEventListener {

    // BEFORE_COMMIT, AFTER_COMMIT, AFTER_ROLLBACK, AFTER_COMPLETION
    TransactionPhase phase() default TransactionPhase.AFTER_COMMIT;

    // true면 Transaction이 없으면 즉시 리스너를 호출
    boolean fallbackExecution() default false;

    @AliasFor(annotation = EventListener.class, attribute = "classes")
    Class<?>[] value() default {};

    @AliasFor(annotation = EventListener.class, attribute = "classes")
    Class<?>[] classes() default {};

    String condition() default "";
}
```


## Async Events
* `ApplicationEventMulticaster`에 `AsyncTaskExecutor` 사용
   * `ApplicationEventMulticaster` - Event Publish를 수행하는 component

```java
@Configuration
class AsynchronousSpringEventsConfig {

    @Bean(name = "applicationEventMulticaster")
    public ApplicationEventMulticaster simpleAsyncEventMulticaster() {
        SimpleApplicationEventMulticaster eventMulticaster = new SimpleApplicationEventMulticaster();

        eventMulticaster.setTaskExecutor(new SimpleAsyncTaskExecutor());
        return eventMulticaster;
    }
}

// Publisher와 Listener가 동일한 thread executor를 사용
[TaskExecutor-33] k.c.m.creationfeedback.TestListener      : test ApplicationReadyEvent Thread[SimpleAsyncTaskExecutor-33,5,main]
[TaskExecutor-36] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[SimpleAsyncTaskExecutor-36,5,main]
[TaskExecutor-38] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[SimpleAsyncTaskExecutor-38,5,main]
[TaskExecutor-40] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[SimpleAsyncTaskExecutor-40,5,main]
[TaskExecutor-42] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[SimpleAsyncTaskExecutor-42,5,main]
[TaskExecutor-44] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[SimpleAsyncTaskExecutor-44,5,main]
```

* `@Async` 사용
```java
@Async
@EventListener
public void handleOrderCreatedEvent(OrderCreatedEvent createdEvent) {
    ...
}

// @Async 설정으로 Publisher와 Listener가 다른 thread executor를 사용
[TaskExecutor-33] k.c.m.creationfeedback.TestListener      : test ApplicationReadyEvent Thread[SimpleAsyncTaskExecutor-33,5,main]
[         Test-1] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[Test-1,5,main]
[         Test-2] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[Test-2,5,main]
[         Test-1] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[Test-1,5,main]
[         Test-2] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[Test-2,5,main]
[         Test-1] k.c.m.creationfeedback.CustomListener    : test MyEvent Thread[Test-1,5,main] 
```

</br>

> #### 참고
> * [Better application events in Spring Framework 4.2](https://spring.io/blog/2015/02/11/better-application-events-in-spring-framework-4-2)
> * [Spring Events](http://www.baeldung.com/spring-events)
