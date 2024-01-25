# [Spring Boot] Using request header in Async
> date - 2024.01.25  
> keyworkd - request, thread, async  
> JPA AuditorAware에서 request header의 값을 사용할 때 발생한 이슈를 정리

<br>

## Requirement

### Dependency
* Spring Boot 3.x
* Spring Data JPA

<br>

## Issue
* RequestContextHolder는 ThreadLocal을 사용해서 데이터를 저장하는데 request thread가 아닌 thread(`@Async`로 실행한 async thread)에서 접근시 아래의 error를 마주하게 된다
```java
org.springframework.dao.InvalidDataAccessApiUsageException: No thread-bound request found: Are you referring to request attributes outside of an actual web request, or processing a request outside of the originally receiving thread? If you are actually operating within a web request and still receive this message, your code is probably running outside of DispatcherServlet: In this case, use RequestContextListener or RequestContextFilter to expose the current request.
  at org.springframework.orm.jpa.EntityManagerFactoryUtils.convertJpaAccessExceptionIfPossible(EntityManagerFactoryUtils.java:368)
  at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:234)
  at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:550)
  at org.springframework.dao.support.ChainedPersistenceExceptionTranslator.translateExceptionIfPossible(ChainedPersistenceExceptionTranslator.java:61)
  at org.springframework.dao.support.DataAccessUtils.translateIfNecessary(DataAccessUtils.java:242)
  at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:152)
  at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184)
  at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:164)
  at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184)
  at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97)
  at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184)
  at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:244)
  at jdk.proxy2/jdk.proxy2.$Proxy193.saveAll(Unknown Source)
  ...
Caused by: java.lang.IllegalStateException: No thread-bound request found: Are you referring to request attributes outside of an actual web request, or processing a request outside of the originally receiving thread? If you are actually operating within a web request and still receive this message, your code is probably running outside of DispatcherServlet: In this case, use RequestContextListener or RequestContextFilter to expose the current request.
  at org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes(RequestContextHolder.java:131)
  ...
```


<br>

## Try
* 아래의 코드는 request thread에서 접근하면 문제가 없지만 async에서는 ThreadLocal을 사용하는 RequestContextHolder에 값이 없기 때문에 문제가 발생한다
```java
@Configuration
@EnableJpaAuditing(
  auditorAwareRef = "requestedByHeaderAuditorAware"
)
public class JpaConfiguration {

  @Bean
  public AuditorAware<String> requestedByHeaderAuditorAware() {
    return () -> {
      HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
      return Optional.ofNullable(request.getHeader("X-Requested-By"));
    };
  }
}
```

<br>

### 1. DispatcherServlet에 threadContextInheritable 설정
* ThreadLocal은 기본적으로 child thread로 복사되지 않으며 ThreadLocal을 inheritable하게 설정하면 child thread로 복사하게 된다
```java
@Configuration
public class WebConfig implements WebApplicationInitializer {

  @Override
  public void onStartup(ServletContext servletContext) throws ServletException {
    var applcationContext = new AnnotationConfigWebApplicationContext();
    var dispatcherServlet = new DispatcherServlet(applcationContext);
    dispatcherServlet.setThreadContextInheritable(true);  // here

    var dispatcher = servletContext.addServlet("dispatcherServlet", dispatcherServlet);
    dispatcher.setLoadOnStartup(1);
    dispatcher.addMapping("/");
  }
}
```
* DispatcherServlet의 설정을 변경하게되어 영향도가 Spring 전반적으로 미치므로 위험도가 높다

<br>

### 2. TaskDecorator를 사용하여 RequestContextHolder의 데이터 전달
* Spring의 async는 ThreadPoolTaskExecutor를 이용하므로 TaskDecorator를 설정
* TaskDecorator는 작업 실행 전후에 로깅 등의 추가 작업을 정의할 수 있는 decorator interface
```java
@Configuration
public class AsyncConfig {

  /**
   * @see org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration
   * TaskExecutionAutoConfiguration에 의해 아래의 TaskDecorator가 등록
   */
  @Bean
  public TaskDecorator taskDecorator() {
    return task -> {
      RequestAttributes attributes = RequestContextHolder.currentRequestAttributes();
      return () -> {
        try {
          RequestContextHolder.setRequestAttributes(attributes);
		      task.run();
        } finally {
          RequestContextHolder.resetRequestAttributes();
        }
      };
    };
  }
}
```
* TaskDecorator에서 RequestContextHolder의 값을 가져오도록하였으나 아래의 error 발생
```java
org.springframework.dao.InvalidDataAccessApiUsageException: The request object has been recycled and is no longer associated with this facade
  at org.springframework.orm.jpa.EntityManagerFactoryUtils.convertJpaAccessExceptionIfPossible(EntityManagerFactoryUtils.java:368)
  at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:234)
  at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:550)
  at org.springframework.dao.support.ChainedPersistenceExceptionTranslator.translateExceptionIfPossible(ChainedPersistenceExceptionTranslator.java:61)
  ...
```
* request thread가 종료되면 request object가 재활용되어 async에서는 사용할 수 없다는 것으로 다른 방법이 필요

<br>

### 3. TaskDecorator + MDC 사용
* RequestContextHolder의 데이터를 request thread에서 MDC에 저장하고, TaskDecorator에서 async thread에 전달하는 방식
* MDC는 ThreadLocal을 사용하여 thread 내에서 context를 유지한다
* HandlerInterceptor에서 RequestContextHolder의 데이터를 MDC에 저장한다
```java
public class RequestHeaderInterceptor implements HandlerInterceptor {

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    var requestedBy = request.getHeader("X-Requested-By");
    if (requestedBy != null) {
      MDC.put("X-Requested-By", requestedBy);
    }
    return true;
  }
}

// Interceptor 등록
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new RequestHeaderInterceptor());
  }
}
```
* AuditorAware
```java
@Configuration
@EnableJpaAuditing(
  auditorAwareRef = "requestedByHeaderAuditorAware"
)
public class JpaConfiguration {

  @Bean
  public AuditorAware<String> requestedByHeaderAuditorAware() {
    return () -> {
      var requestedBy = MDC.get(CustomHeaderConstants.HEADER_REQUESTED_BY);

      if (StringUtils.hasText(requestedBy)) {
        return Optional.of(requestedBy);
      }

      return Optional.of("system");
    };
  }
}
```

* TaskDecorator
```java
@Configuration
@EnableAsync
public class AsyncConfig {

  /**
   * @see org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration
   * TaskExecutionAutoConfiguration에 의해 아래의 TaskDecorator가 등록
   */
  @Bean
  public TaskDecorator taskDecorator() {
    return task -> {
      var callerMDC = MDC.getCopyOfContextMap();
      return () -> {
        try {
          if (callerMDC != null) {
            MDC.setContextMap(callerMDC);
          }
          task.run();
        } finally {
          MDC.clear();
        }
      };
    };
  }
}
```
* TaskExecutionAutoConfiguration을 사용하지 않고 직접 생성할 경우에는 아래의 코드를 사용
```java
@Configuration
@EnableAsync
public class AsyncConfig {

  @Bean
  public ThreadPoolTaskExecutor asyncThreadPoolTaskExecutor() {
    ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
    taskExecutor.setTaskDecorator(taskDecorator());
    return taskExecutor;
  }

  private TaskDecorator taskDecorator() {
    return task -> {
      var callerMDC = MDC.getCopyOfContextMap();
      return () -> {
        try {
          if (callerMDC != null) {
            MDC.setContextMap(callerMDC);
          }
          task.run();
        } finally {
          MDC.clear();
        }
      };
    };
  }
}
```

<br>

### 4. TaskDecorator + ThreadLocal 사용
* MDC를 사용하지 않고 직접 ThreadLocal을 사용하는 방식
* MDC는 logging에도 많이 사용하기 때문에 이용하기 어려울 때 유용
```java
public record RequestContext(String requestedBy) {
}
```

* RequestContextHolder
```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RequestContextHolder {

  private static final ThreadLocal<RequestContext> holder = new ThreadLocal<>();

  public static void setRequest(RequestContext context) {
    holder.set(context);
  }

  public static Optional<RequestContext> getRequest() {
    return Optional.ofNullable(holder.get());
  }

  public static void clear() {
    holder.remove();
  }
}
```

* RequestHeaderHolderInterceptor
```java
public class RequestHeaderHolderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        var requestedBy = request.getHeader(CustomHeaderConstants.HEADER_REQUESTED_BY);
        if (requestedBy != null) {
            RequestHolder.setRequest(new RequestContext(requestedBy));
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        RequestHolder.clear();
    }
}

// Interceptor 등록
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new RequestHeaderHolderInterceptor());
  }
}
```

* AuditorAware
```java
@Configuration
@EnableJpaAuditing(
  auditorAwareRef = "requestedByHeaderAuditorAware"
)
public class JpaConfiguration {

  @Bean
  public AuditorAware<String> xx() {
    return () -> {
      var requestedBy = RequestHolder.getRequest()
                                     .map(RequestContext::requestedBy)
                                     .orElse("system");

      return Optional.of(requestedBy);
    };
  }
}
```

<br>

### 5. Micrometer Baggage + MDC 사용
* [Micrometer Baggage](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.micrometer-tracing.baggage) 사용
* io.micrometer:micrometer-tracing-bridge-brave dependency 추가
```gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
implementation 'io.micrometer:micrometer-tracing-bridge-brave'
```
* micrometer baggage 설정으로 request header의 필드를 MDC에 넣는다
```yaml
## application.yml
management:
  tracing:
    # baggage context와 logging context의 correlation(상관 관계)를 확인할 수 있다
    baggage:
      correlation:
        # 수하물을 MDC로 전파하고 싶다면 사용
        # baggage를 MDC로 전파하고 싶을 때 사용
        fields: x-requested-by
      # network를 통해 baggage를 수동으로 전파할 때 사용
      remote-fields: x-requested-by
```

* ContextSnapshotFactory를 이용해 MDC를 전파
```java
@Configuration
@EnableAsync
public class AsyncConfig {

  @Bean
  public TaskDecorator taskDecorator() {
    return task -> ContextSnapshotFactory.builder()
                                         .build()
                                         .captureAll()
                                         .wrap(task);
  }
}
```


<br>

## Resolve
* 3 ~ 5 중 적절한 방법을 적용하면 해결된다


<br>

## Conclusion
* 지금까지 async thread에서 request header의 값을 사용하는 예제를 살펴봤다
* 해당 이슈를 해결하는 다양한 방법이 있으며 항상 적절한 기술을 사용해 문제를 해결하는게 중요함을 잊지 말자

<br><br>

> #### Reference
> * [ThreadLocal과 ThreadPool](https://blog.naver.com/tmondev/221212500642)
> * [Spring 의 동기, 비동기, 배치 처리시 항상 context 를 유지하고 로깅하기](https://blog.gangnamunni.com/post/mdc-context-task-decorator/)
