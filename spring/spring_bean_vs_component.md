# [Spring] Difference between @Bean and @Component
> Spring의 @Bean과 @Component의 차이점을 정리

<br>

## @Bean
```java
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Bean {
}
```
* Method Level의 Bean 선언
* 직접 컨트롤 불가능한 외부 라이브러리(setter 등으로 속성만 변경 가능)들을 Bean으로 등록할 경우 사용
```java
@Bean(name = "objectMapper")
public ObjectMapper objectMapper() {
    return new ObjectMapper();
}
```


<br>

## @Component
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Component {
}
```
* Class Level의 Bean 선언
* 직접 컨트롤이 가능한 Class(구현을 수정)를 Bean으로 등록할 경우 사용
```java
@Component
public class PushComponent {
}
```


<br><br>

> #### Reference
> * [@Bean vs @Component](http://jojoldu.tistory.com/27)
