# [Spring Boot] Springfox documentationPluginsBootstrapper NullPointerException
> date - 2023.05.25  
> keyworkd - spring boot, swagger  
> spring boot 2.7.11에서 springfox-swagger 설정 중 겪은 이슈를 정리  

<br>

## Requirement

### Dependency
```
implementation 'org.springframework.boot:spring-boot-starter-web:2.7.11'
implementation 'org.springframework.boot:spring-boot-starter-actuator'
implementation 'io.springfox:springfox-boot-starter:3.0.0'
```

<br>

## Issue
* spring boot run에서 에러 발생
```java
org.springframework.context.ApplicationContextException: Failed to start bean 'documentationPluginsBootstrapper'; nested exception is java.lang.NullPointerException: Cannot invoke "org.springframework.web.servlet.mvc.condition.PatternsRequestCondition.getPatterns()" because "this.condition" is null
	at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:181)
	at org.springframework.context.support.DefaultLifecycleProcessor.access$200(DefaultLifecycleProcessor.java:54)
	at org.springframework.context.support.DefaultLifecycleProcessor$LifecycleGroup.start(DefaultLifecycleProcessor.java:356)
	at java.base/java.lang.Iterable.forEach(Iterable.java:75)
	at org.springframework.context.support.DefaultLifecycleProcessor.startBeans(DefaultLifecycleProcessor.java:155)
	at org.springframework.context.support.DefaultLifecycleProcessor.onRefresh(DefaultLifecycleProcessor.java:123)
	at org.springframework.context.support.AbstractApplicationContext.finishRefresh(AbstractApplicationContext.java:937)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:586)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:147)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:731)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:408)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:307)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1303)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1292)
    ...
Caused by: java.lang.NullPointerException: Cannot invoke "org.springframework.web.servlet.mvc.condition.PatternsRequestCondition.getPatterns()" because "this.condition" is null
	at springfox.documentation.spring.web.WebMvcPatternsRequestConditionWrapper.getPatterns(WebMvcPatternsRequestConditionWrapper.java:56)
	at springfox.documentation.RequestHandler.sortedPaths(RequestHandler.java:113)
	at springfox.documentation.spi.service.contexts.Orderings.lambda$byPatternsCondition$3(Orderings.java:89)
	at java.base/java.util.Comparator.lambda$comparing$77a9974f$1(Comparator.java:473)
	at java.base/java.util.TimSort.countRunAndMakeAscending(TimSort.java:355)
	at java.base/java.util.TimSort.sort(TimSort.java:234)
	at java.base/java.util.Arrays.sort(Arrays.java:1307)
	at java.base/java.util.ArrayList.sort(ArrayList.java:1721)
	at java.base/java.util.stream.SortedOps$RefSortingSink.end(SortedOps.java:392)
	at java.base/java.util.stream.Sink$ChainedReference.end(Sink.java:258)
	at java.base/java.util.stream.Sink$ChainedReference.end(Sink.java:258)
	at java.base/java.util.stream.Sink$ChainedReference.end(Sink.java:258)
	at java.base/java.util.stream.Sink$ChainedReference.end(Sink.java:258)
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:510)
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:499)
	at java.base/java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:921)
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234)
	at java.base/java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:682)
	at springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider.requestHandlers(WebMvcRequestHandlerProvider.java:81)
	at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:197)
	at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1625)
	at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:509)
	at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:499)
	at java.base/java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:921)
	at java.base/java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234)
	at java.base/java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:682)
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.withDefaults(AbstractDocumentationPluginsBootstrapper.java:107)
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.buildContext(AbstractDocumentationPluginsBootstrapper.java:91)
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.bootstrapDocumentationPlugins(AbstractDocumentationPluginsBootstrapper.java:82)
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper.start(DocumentationPluginsBootstrapper.java:100)
	at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:178)
	... 14 common frames omitted
```


<br>

## Why?
[Spring Boot 2.6에서 Spring MVC Path Matching Strategy 변경](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.6-Release-Notes#pathpattern-based-path-matching-strategy-for-spring-mvc)된게 원인으로 관련해서 자세히 보면
* Spring MVC handlerMappings(spring.mvc.pathmatch.matching-strategy)의 default가 `AntPathMatcher` -> `PathPatternParser`로 변경
* `spring.mvc.pathmatch.matching-strategy=ant-path-matcher`로 `AntPathMatcher` 사용 가능
* `PathPatternParser` 사용시 spring.mvc.servlet.path 사용 불가
* actuator endpoint의 path matching strategy도 `PathPattern` 기반을 사용하며, condition property로 설정 불가
  * actuator + springfox 사용시 application이 시작되지 않을 수 있고, 자세한 내용은 [Spring 5.3/Spring Boot 2.4 support #3462](https://github.com/springfox/springfox/issues/3462) 참고
* Spring Security를 사용하는 경우 `mvcMatchers` 사용을 검토해야하며 예를 들어 `/hello`에 접근한다면 아래와 같이 변경해야한다

| Path matching strategy | Spring Security configuration | Etc |
|:--|:--|:--|
| AntPathMatcher | authorizeRequests.mvcMatchers("hello").permitAll() | |
| PathPatternParser | authorizeRequests.mvcMatchers("/hello").permitAll() | `/`에 유의 |


<br>

## Resolve

### 1. springfox 사용
* application.properties에 path matching strategy `AntPathMatcher`로 변경
```properties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

* actuator 사용시 아래 설정 추가
```java
@Configuration
public class SwaggerConfiguration {
  @Bean
  public BeanPostProcessor beanPostProcessor(){
    return new BeanPostProcessor() {
      @Override
      public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof WebMvcRequestHandlerProvider) {
          customizeSpringfoxHandlerMappings(getHandlerMappings(bean));
        }
        return bean;
      }

      private <T extends RequestMappingInfoHandlerMapping> void customizeSpringfoxHandlerMappings(List<T> mappings) {
        List<T> copy = mappings.stream()
                               .filter(mapping -> mapping.getPatternParser() == null)
                               .toList();
        mappings.clear();
        mappings.addAll(copy);
      }

      private List<RequestMappingInfoHandlerMapping> getHandlerMappings(Object bean) {
        try {
          Field field = ReflectionUtils.findField(bean.getClass(), "handlerMappings");
          field.setAccessible(true);
          return (List<RequestMappingInfoHandlerMapping>) field.get(bean);
        } catch (IllegalArgumentException | IllegalAccessException e) {
          throw new IllegalStateException(e);
        }
      }
    };
  }
}
```

* spring security 사용시 아래 설정 추가
```java
@Configuration
public class WebSecurityConfiguration {
  // SecurityFilterChain or WebSecurityCustomizer 둘 중 하나 적용
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.authorizeRequests()
                .requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class)).permitAll()
                .mvcMatchers("/swagger-resources/**", "/swagger-ui/**", "/v3/api-docs").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin().disable()
                .csrf().disable()
                .build();
  }

  @Bean
  public WebSecurityCustomizer webSecurityCustomizer() {
    return (web) -> web.ignoring().antMatchers("/swagger-resources/**", "/swagger-ui/**", "/v3/api-docs");
  }
}
```


<br>

### 2. springfox -> springdoc로 변경
* [Migrating from SpringFox](https://springdoc.org/#migrating-from-springfox)에 따라 dependency 추가 후 swagger2 annotation -> swagger3 annotation(io.swagger.v3.oas.annotations)으로 변경
```gradle
implementation 'org.springdoc.springdoc-openapi-ui:1.7.0'
```
* as-is
```java
@Api(description = "test v2", tags = "test-v2")
@RestController
@RequestMapping("/v2")
public class TestController {

    @GetMapping("/test")
    public D test(@ApiParam(name = "이름", allowableValues = "kim,lee") @RequestParam("name") String name,
                  @RequestParam("age") Integer age) {
        return new Person(name, age);
    }

    @ApiModel
    @Value
    public static class Person {
        
        @ApiModelProperty(value = "이름")
        private String name;

        @ApiModelProperty(value = "나이", hidden = true)
        private Integer age;
    }
}
```
* to-be
```java
@Tag(name = "test v2", description = "test v2")
@RestController
@RequestMapping("/v2")
public class TestController {

    @GetMapping("/test")
    public D test(@Parameter(name = "이름", schema = @Schema(allowableValues = {"kim", "lee"})) @RequestParam("name") String name,
                  @RequestParam("age") Integer age) {
        return new Person(name, age);
    }

    @Schema
    @Value
    public static class Person {
        @Schema(title = "이름")
        private String name;

        @Schema(title = "나이", hidden = true)
        private Integer age;
    }
}
```


<br>

## Conclusion
* springfox의 최신 버전은 2020-07-14에 릴리즈된 3.0.0으로 관리가 되지 않는 프로젝트로 보여 장기적인 관점에서 springdoc로 변경하는게 더 나아보인다


<br><br>

> #### Reference
> * [springfox - Automated JSON API documentation for API's built with Spring](https://github.com/springfox/springfox)
> * [Spring 5.3/Spring Boot 2.4 support #3462](https://github.com/springfox/springfox/issues/3462)
> * [Spring Boot 2.6.0 / Spring fox 3 - Failed to start bean 'documentationPluginsBootstrapper'](https://stackoverflow.com/questions/70036953/spring-boot-2-6-0-spring-fox-3-failed-to-start-bean-documentationpluginsboo)
> * [Migrating from SpringFox](https://springdoc.org/#migrating-from-springfox)
> * [Spring Boot 2.4 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.4-Release-Notes)
> * [Spring Boot 2.6 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.6-Release-Notes)
> * [URL Matching with PathPattern in Spring MVC](https://spring.io/blog/2020/06/30/url-matching-with-pathpattern-in-spring-mvc)
