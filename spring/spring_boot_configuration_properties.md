# [Spring Boot] @ConfigurationProperties 사용하기


## @ConfigurationProperties
* 외부 설정을 위한 annotation
* `.properties file`의 property를 binding하고, validate 할 수 있다
* `ConfigurationPropertiesBindingPostProcessor`가 property binding 수행
* `EnableConfigurationProperties`을 사용해 spring bean으로 등록할 수 있다
```java
@EnableConfigurationProperties(value = MyProperties.class)
public class MyTest {

    @Autowired
    private MyProperties myProperties;
    
    @Test
    public void test() {
        assertThat(myProperties).isNotNull();
    }
}
```

### Sample
* application.properties
```
sample.url=aaa.com
sample.url.book=/books
```

```java
@Component
@ConfigurationProperties(prefix = "sample")
public class EndpointProperties {

    @NotNull  // validation 가능
    private String url;

    @NotEmpty
    @Value("${sample.url.book}")  // @Value 사용 가능
    private String bookResource;

    @NotNull
    private Url url;  // '.'은 계층 구조를 나타낸다

    // getter, setter

    class Url {
        private String book;

        ...
    }
}
```


### ConfigurationProperties에 @Validated를 안붙이면 출력되는 warn log
```java
2018-05-22 12:30:23.677  WARN 4323 --- [           main] figurationPropertiesBindingPostProcessor : The @ConfigurationProperties bean class me.dong.bootgeneratebeancustom.EndpointProperties contains validation constraints but had not been annotated with @Validated.
```

```java
// ConfigurationPropertiesBindingPostProcessor - L418
@Override
public boolean supports(Class<?> type) {
    if (!super.supports(type)) {
        return false;
    }
    if (AnnotatedElementUtils.hasAnnotation(type, Validated.class)) {
        return true;
    }
    if (type.getPackage() != null && type.getPackage().getName()
            .startsWith("org.springframework.boot")) {
        return false;
    }
    // warn log만 출력하고, true 반환
    if (getConstraintsForClass(type).isBeanConstrained()) {
        logger.warn("The @ConfigurationProperties bean " + type
                + " contains validation constraints but had not been annotated "
                + "with @Validated.");
    }
    return true;
}
```

* 권장사항에 따라 constraints annotation을 사용시 `@Validated`를 추가하면 warn log가 사라진다
```java
@Component
@Validated  // 추가
@ConfigurationProperties(prefix = "sample")
public class EndpointProperties {
    ...
}
```

---

## @ConfigurationProperties validate 하기

### @Value에 사용한 property의 key가 없을 때
* exception 발생
```java
Caused by: java.lang.IllegalArgumentException: Could not resolve placeholder 'sample.url.book' in value "${sample.url.book}"
	at org.springframework.util.PropertyPlaceholderHelper.parseStringValue(PropertyPlaceholderHelper.java:174)
	at org.springframework.util.PropertyPlaceholderHelper.replacePlaceholders(PropertyPlaceholderHelper.java:126)
	at org.springframework.core.env.AbstractPropertyResolver.doResolvePlaceholders(AbstractPropertyResolver.java:236)
	at org.springframework.core.env.AbstractPropertyResolver.resolveRequiredPlaceholders(AbstractPropertyResolver.java:210)
	at org.springframework.context.support.PropertySourcesPlaceholderConfigurer$2.resolveStringValue(PropertySourcesPlaceholderConfigurer.java:172)
	at org.springframework.beans.factory.support.AbstractBeanFactory.resolveEmbeddedValue(AbstractBeanFactory.java:837)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1086)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1066)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:585)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:88)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessPropertyValues(AutowiredAnnotationBeanPostProcessor.java:366)
	... 40 more
```
* `@Value`에 사용한 property key는 runtime에 존재해야 한다


### @Value에 사용한 property의 value가 없을 때
* application.properties
```
sample.url.book=
```

```java
@Value("${sample.url.book}")
private String bookResource;  // '' => empty string
```
* `@Value`에 사용한 property value가 없으면 empty string이 binding

</br>

* `@NotEmpty` 추가
```java
@NotEmpty
@Value("${sample.url.book}")
private String bookResource;
```

* exception 발생
```java
Caused by: org.springframework.validation.BindException: org.springframework.boot.bind.RelaxedDataBinder$RelaxedBeanPropertyBindingResult: 1 errors
Field error in object 'sample' on field 'bookResource': rejected value []; codes [NotEmpty.sample.bookResource,NotEmpty.bookResource,NotEmpty.java.lang.String,NotEmpty]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [sample.bookResource,bookResource]; arguments []; default message [bookResource]]; default message [반드시 값이 존재하고 길이 혹은 크기가 0보다 커야 합니다.]
	at org.springframework.boot.bind.PropertiesConfigurationFactory.checkForBindingErrors(PropertiesConfigurationFactory.java:374)
	at org.springframework.boot.bind.PropertiesConfigurationFactory.doBindPropertiesToTarget(PropertiesConfigurationFactory.java:291)
	at org.springframework.boot.bind.PropertiesConfigurationFactory.bindPropertiesToTarget(PropertiesConfigurationFactory.java:250)
	at org.springframework.boot.context.properties.ConfigurationPropertiesBindingPostProcessor.postProcessBeforeInitialization(ConfigurationPropertiesBindingPostProcessor.java:331)
	... 42 more
```

---

## 정리
* `@ConfigurationProperties`로 `@Value` 없이 property를 binding하여 property class로 표현할 수 있다
* `@ConfigurationProperties`에 validate 가능
* property 값이 없으면 null이 binding되기 때문에 `@NotNull`로 validation 할 수 있다
* `@Value` 사용시 property 값이 없으면 empty string이 binding되기 때문에 `@NotNull`은 의미 없지만 `@NotEmpty`는 의미가 있다
