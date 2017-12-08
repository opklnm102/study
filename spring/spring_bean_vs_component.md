# [Spring] Difference between @Bean and @Component
> Spring의 @Bean과 @Component의 차이점을 정리


## @Bean
```java
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Bean {
}
```
* Method Level의 Bean 선언
* 직접 컨트롤 불가능한 외부 라이브러리들을 Bean으로 등록할 경우 사용
```java
@Bean(name = "objectMapper")
public ObjectMapper objectMapper() {
    return new ObjectMapper();
}
```


## @Component
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Component {
}
```
* Class Level의 Bean 선언
* 직적 컨트롤이 가능한 Class를 Bean으로 등록할 경우 사용
```java
@Component
public class PushComponent {
}
```

</br>

> #### 참고
> * [@Bean vs @Component](http://jojoldu.tistory.com/27)
