# [Spring Boot] Deep dive into spring boot AutoConfiguration
> date - 2018.07.17  
> keyword - spring boot, auto configuration  
> deep dive into spring boot autoconfiguration를 보고 내용을 요약 및 정리  

<br>

## Why AutoConfiguration?
* `AutoConfiguration`을 통한 `설정 간소화`로 인해 spring boot의 장점인 `just run`이 가능
* 바로 실행할 수 있는 Spring 기반의 producation-grade의 stand-alone application을 쉽게 만들 수 있다
* AutoConfiguration은 dependency와 property로 `반복적인 설정 부분을 제거`

#### Before - non spring boot
```java
@EnableTransactionManagement
@Configuration
public class DatabaseConfig {
  
  @Bean
  public DataSource dataSource(
    @Value("${spring.datasource.driverClassName}") Class<Driver> driverClass,
    @Value("${spring.datasource.url}") String url,
    @Value("${spring.datasource.username}") String user,
    @Value("${spring.datasource.password}") String password) {
      return new SimpleDriverDataSource(BeanUtils.instantiateClass(driverClass), url, user, password);
    }
}
```

#### After - spring boot
1. 의존성 추가
  * spring-boot-starter-jdbc
2. 환경변수 추가
  * spring.datasource.url
  * spring.datasource.driverClassName
  * spring.datasource.username
  * spring.datasource.password

<br>

## 그럼 설정 클래스는 어디있을까..?

### @EnableAutoConfiguration이 실마리
* `특정 기준`의 설정 클래스를 로드
* `@Enable*` 모듈화된 설정의 일종
```java
@AutoConfigurationPackage
@Import(EnableAutoConfigurationImportSelector.class)  // spring boot 자동 설정 기능 담당
public @interface EnableAutoConfiguration {
  ...
}
```

> #### @Enable* 어노테이션이란?
> ```java
> @EnableWebMvc
> @EnableAspectJAutoProxy
> ...
> @Configuration
> public class ApplicationConfiguration {
>   ...
> }
> ```
> * `JavaConfig`에서 모듈화된 설정시 사용
> * 기존 XML custom tag(<mvc:*/>, <context:*/>)와 대응
> * `@Import`를 사용해 쉽게 자신의 설정 모듈 작성 가능

<br>

### AutoConfigurationImportSelector
```java
public class AutoConfigurationImportSelector implements DeferredImportSelector, BeanClassLoaderAware, ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {
  
  /**
   * 설정 클래스(@Configuration) 리스트를 받아서 활성화
   * @return 설정 클래스 리스트(패키지명 포함 클래스명)
  */
  @Override
  public String[] selectImports(AnnotationMetadata annotationMetadata) {
    if (!isEnabled(annotationMetadata)) {
      return NO_IMPORTS;
    }
    try {
      AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader.loadMetadata(this.beanClassLoader);
      AnnotationAttributes attributes = getAttributes(annotationMetadata);
      List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);  // 여기서 설정 파일 리스트 로딩
      configurations = removeDuplicates(configurations);
      configurations = sort(configurations, autoConfigurationMetadata);
      Set<String> exclusions = getExclusions(annotationMetadata, attributes);
      checkExcludedClasses(configurations, exclusions);
      configurations.removeAll(exclusions);
      configurations = filter(configurations, autoConfigurationMetadata);
      fireAutoConfigurationImportEvents(configurations, exclusions);
      return configurations.toArray(new String[configurations.size()]);
    } catch (IOException ex) {
      throw new IllegalStateException(ex);
    }
  }

  // auto configuration class 이름을 반환
  protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes) {   
    // classpath의 모든 라이브러리의 META-INF/spring.factories 위치의 파일에서 설정 파일 리스트를 읽어온다
    List<String> configurations = SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(), getBeanClassLoader());
    Assert.notEmpty(configurations, "No auto configuration classes found in META-INF/spring.factories. If you are using a custom packaging, make sure that file is correct.");
    return configurations;
  }
}
```

<br>

### META-INF/spring.factories
* Key=Value 형태로 설정 클래스 리스트 기록
* spring boot의 기본 설정 정보는 `org.springframework.boot:spring-boot-autoconfiguration:x.x.x.jar`에 포함

```yml
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
...
```

---

<br>

## Condition Annotations
* spring boot의 뛰어난 기능 중 하나인 auto configuration은 `@Conditional* `에 의해 구현된다
  * 조건부로 Bean을 Spring Container에 등록시키기 위해
* spring 3.1에서 `@Profile`로 환경 추상화를 지원
* spring 4.0은 @Profile이 기반이 된 새로운 메커니즘 도입
  * @Conditional, Condition interface
* `@Conditional`
  * component/bean/factory method가 DI container에 등록할 수 있는지 rule을 정의하기 위해 component에 annotation으로 사용된다
  * rule은 Condition interface를 구현한다
* `org.springframework.boot.autoconfigure.condition`에 위치

```java
@Conditional(ProfileCondition.class)
public @interface Profile {
  ...
}

class ProfileCondition implements Condition {

	@Override
	public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
		if (context.getEnvironment() != null) {
			MultiValueMap<String, Object> attrs = metadata.getAllAnnotationAttributes(Profile.class.getName());
			if (attrs != null) {
				for (Object value : attrs.get("value")) {
					if (context.getEnvironment().acceptsProfiles(((String[]) value))) {
						return true;
					}
				}
				return false;
			}
		}
		return true;
	}
}
```
* `AnnotatedTypeMetadata` annotation의 metadata 
  * class loading을 요구하지 않고 spring이 정보를 가져온다

---

<br>

### Class Conditions
* 특정 class가 classpath의 존재 유무에 따라 configuration을 포함시킨다
* string, Class<?>으로 정규화된 클래스 이름을 정의할 수 있다
  * meta-annotation의 일부로 사용한 annotation을 사용할 경우 `name 사용`
* compile time에 사용할 수 없는 클래스를 정의하고 가져오기 때문에 닭, 달걀 문제 발생
  * [ASM](https://asm.ow2.io/)을 사용해 annotation meta data를 수집할 때 classpath에 없는 클래스를 연결 오류없이 실행하도록 참조
* 라이브러리, 프레임워크 클래스를 다른 개발자에게 제공할 때 특정 클래스의 기존에 기반하여 특정 bean을 활성화하는데 사용할 수 있다
  * driver-calss 등

#### @ConditionalOnClass
* `지정된 class가 classpath에 존재하면` 사용
```java
...
@Conditional(OnClassCondition.class)
public @interface ConditionalOnClass {
  
  // classpath에 없을 수도 있는 class를 지정하는게 안전
  Class<?>[] value() default {};
  
  // 반드시 있어야하면 여기다 지정
  String[] name() default {};
}

// ex. value 사용
@ConditionalOnClass(HttpRequest.class)

// ex. name 사용
@ConditionalOnClass(name = "org.springframework.retry.support.RetryTemplate")
```

#### @ConditionalOnMissingClass
* `지정된 class가 classpath 없으면` 사용
```java
@ConditionalOnMissingClass(value = "org.springframework.retry.support.RetryTemplate")
```

---

<br>

### Bean Conditions
* 특정 bean의 유무에 따라 configuration을 포함시킨다
* Bean 정의가 추가되는 순서 조심해야 한다
  * `@Conditional*`은 현재까지 처리된 내용을 기준으로 평가
  * 사용자 정의 bean이 BeanFactory에 추가된 후 로드되므로 autoconfiguration에서는 `@ConditionalOnBean`, `@ConditionalOnMissingBean`만 사용하는게 좋다

#### @ConditionalOnBean
* 지정된 class 또는 name을 가진 Bean이 BeanFactory에 있으면 일치

```java
...
@Conditional(OnBeanCondition.class)
public @interface ConditionalOnBean {

  // bean을 ApplicationContext에서 type으로 찾을 경우
	Class<?>[] value() default {};

  // bean을 ApplicationContext에서 이름으로 찾을 경우
	String[] type() default {};

  // Annotation이 달린 bean을 ApplicationContext에서 찾을 경우
	Class<? extends Annotation>[] annotation() default {};

  // 지정된 Bean 이름 중 하나가 ApplicationContext에 있는 경우
	String[] name() default {};

  // Bean 검색시 ApplicationContext 계층 구조 제한
	SearchStrategy search() default SearchStrategy.ALL;
}
```

```java
// entityManagerFactory bean이 있을 때 실행
@Bean
@ConditionalOnBean(name = "entityManagerFactory")
public BasicBatchConfigurer jpaBatchConfigurer(DataSource dataSource,
    EntityManagerFactory entityManagerFactory,
    ObjectProvider<TransactionManagerCustomizers> transactionManagerCustomizers) {
  return new BasicBatchConfigurer(this.properties, dataSource,
      entityManagerFactory, transactionManagerCustomizers.getIfAvailable());
}
```

#### @ConditionalOnMissingBean
* 지정된 class 또는 name을 가진 Bean이 BeanFactory에 없으면 일치

```java
// LoadBalancerClient bean이 없을 때 실행
@Bean
@ConditionalOnMissingBean(LoadBalancerClient.class)
public LoadBalancerClient loadBalancerClient() {
  return new RibbonLoadBalancerClient(springClientFactory());
}
```

---

<br>

### Property Conditions

#### @ConditionalOnProperty
* Spring Environment property 기반으로 구성
  * application.properties, system environment variable
* 지정된 property가 있는 경우에 Bean을 등록하는데 사용

```java
// spring.batch.job.enabled=true면 실행
// matchIfMissing -> 없다면 true
@ConditionalOnProperty(prefix = "spring.batch.job", name = "enabled", havingValue = "true", matchIfMissing = true)
public JobLauncherCommandLineRunner jobLauncherCommandLineRunner(
    JobLauncher jobLauncher, JobExplorer jobExplorer) {
  JobLauncherCommandLineRunner runner = new JobLauncherCommandLineRunner(
      jobLauncher, jobExplorer);
  String jobNames = this.properties.getJob().getNames();
  if (StringUtils.hasText(jobNames)) {
    runner.setJobNames(jobNames);
  }
  return runner;
}
```

> #### @EnableConfigurationProperties
> * property를 저장하는 class를 bean으로 등록해주는 역할
> * `@ConditionalOnProperty`와 같이 많이 사용한다

---

<br>

### Resource Conditions

#### @ConditionalOnResource
* 리소스가 지정된 경로에 있으면 일치
  * ex) file:/home/user/test.dat, classpath:META-INF/test.dat
```java
@ConditionalOnResource(resources = "classpath:META-INF/services/javax.validation.spi.ValidationProvider")
public class ValidationAutoConfiguration {
  ...
}
```

---

<br>

### Web Application Conditions

#### @ConditionalOnWebApplication
* web environment(JEE 기반 servlet-context, web application context에서 실행)일 경우에 사용할 bean 정의에 사용
* `WebApplicationContext`, `StandardServletEnvironment`를 사용할 경우 web environment

```java
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@Configuration
@ConditionalOnWebApplication
@Import(BeanPostProcessorsRegistrar.class)
public class EmbeddedServletContainerAutoConfiguration {
  ...
}
```

#### @ConditionalOnNotWebApplication
* web environment이 아니면 실행

```java
@Configuration
@ConditionalOnNotWebApplication
public static class FreeMarkerNonWebConfiguration extends FreeMarkerConfiguration {
  ...
}
```

---

<br>

### SpEL Expression Conditions

#### @ConditionalOnExpression
* 지정된 [SpEL expression](https://docs.spring.io/spring/docs/5.1.0.BUILD-SNAPSHOT/spring-framework-reference/core.html#expressions) 결과에 따라 configuration 구성

```java
@ConditionalOnExpression("'${spring.profiles.active}' == 'localhost'")
```

---

<br>

### Etc

#### @ConditionalOnJava
* application을 실행한 jvm version check
```java
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Conditional(OnJavaCondition.class)
public @interface ConditionalOnJava {
  
  Range range() default Range.EQUAL_OR_NEWER;
  
  // Java version 설정
  JavaVersion value();  // NINE, EIGHT, SEVEN..
  
  enum Range {
    // 지정된 version과 같거나 더 새로운 version
    EQUAL_OR_NEWER,
    
    // 지정된 version보다 오래된 version
    OLDER_THAN
  }
}
```

---

<br>

### Spring Boot 설정
* MVC 설정
  * 서블릿 인터페이스 있는가?
  * 이미 MVC 설정하는게 있는가?
* Security 설정
  * 스프링 시큐리티 라이브러리가 있는가? 등등
* JDBC 설정
  * DataSource 객체가 스프링 컨테이너에 존재하는가? 등
* JPA 설정
  * JPA, 하이버네이트 라이브러리가 있는가?
  * DataSource 설정이 이미 되었는가?
* AOP 설정
  * 스프링 AOP, AspectJ 라이브러리가 존재하는가?

> 즉 spring.factories의 설정 클래스는 조건(@Conditional)에 따라 컨테이너에 등록

<br>

### Autoconfiguration 지원 기술
* Core
  * Spring(Security, AOP, Session, Cache, DevTools...)
* Web
  * Spring(MVC, Websocket, Rest Docs), WS, Jersey, ...
* Template Engines
  * Freemaker, Velocity, Thymeleaf, Mustache, ...
* SQL
  * JPA, JOOQ, JDBC, H2, HSQLDB, Derby, MySQL, PostreSQL
* NoSQL, Cloud, Social, I/O, Ops, ...

---

<br>

## 정리
* Spring Boot의 설정의 시작은 `@EnableAutoConfiguration`
* 설정 리스트의 보관소 `META-INF/spring.factories`
* Spring Boot는 `@Conditional*`을 통해 AutoConfiguration 구현
* 모든 설정 클래스를 로딩하지 않고 `@Conditional`을 통해 `조건적`으로 Bean이 spring container에 올라간다

---

<br>

> #### 참고
> * [스프링캠프 2016 발표 - Deep dive into spring boot autoconfiguration](https://www.slideshare.net/sbcoba/2016-deep-dive-into-spring-boot-autoconfiguration-61584342)
> * [Spring Boot docs - 47.3 Condition Annotations](https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/html/boot-features-developing-auto-configuration.html#boot-features-condition-annotations)
> * [Spring 에서 @ConditionalOnClass, @ConditionalOnBean 사용할 때 주의할 점](https://blog.kingbbode.com/posts/spring-conditional)
