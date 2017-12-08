# [Spring] Difference between @Component, @Service, @Controller, and @Repository


## @Component의 역할
* Spring 초기 모든 빈은 `XML 파일`에 선언하여 사용 
   * 대규모 프로젝트의 경우, 이것은 커다란 작업
* Spring 2.5부터 @Component를 사용하여 Annotation 기반 Dependency Injection 도입
   * Spring bean으로 클래스를 자동으로 검색하고 등록
   * XML에서 `<bean>`을 사용하여 선언하지 않아도 된다 
   * `<context : component-scan>`으로 활성화, 비활성화


## @Controller, @Service, @Repository
* Spring Bean
   * @Component와 @Controller, @Service의 Bean 생성, DI는 동일하게 동작
* Layer마다 특별한 기능을 추가할 수 있다


### @Controller
* Spring MVC의 Controller Class에서 @Component 대신 사용
   * Spring ApplicationContext에 의해 관리되어야 하는 MVC의 Controller임을 명시
* DispatcherServlet은 @Controller를 사용하여 `@RequestMapping`을 찾는다
   * @Component는 사용하지 않는다


### @Service
* Service Layer에서 사용

### @Repository
* Persistence Layer에서 사용
* 플랫폼 특정 예외를 잡아서, Spring의 통합되지 않은 단일 예외로 재사용 가능 
   * Application Context에서 `org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor`를 Spring Bean으로 선언해야 한단
   * @Repository Bean에 Advisor를 추가, Advisor는 플랫폼 특정 예외를 잡아 Spring의 unchecked data access exception 중 하나로 다시 throw한다


## Spring에서 Component Scanning은 어떻게 작동할까?
* Spring 2.0부터 `<context : component-scan>`과 `annotation-driven dependency injection` 사용
   * Spring Bean을 XML 파일에서 지정하는 대신 `자동으로 감지하고 등록`
* `@Component만 검색`하고 @Controller, @Service 및 @Repository는 찾지 않는다
   
```java
@Component
public @interface Service {
}

@Component
public @interface Repository {
}

@Component
public @interface Controller {
}

@Controller
@ResponseBody
public @interface RestController {
}
```
* @Controller, @Service, @Repository는 @Component의 특수한 유형
   * @Component를 명시했기 때문에 스캔된다
   * `<context : component-scan>`은 @Component로 처리 된 것처럼 Bean을 감지하고 등록
* 사용자 정의 Annotation을 추가하고 @Component를 추가하면 `<context : component-scan>`으로 스캔된다

<img src="https://github.com/opklnm102/study/blob/master/spring/images/component_hierarchical_structure.png" alt="component_hierarchical_structure" width="350" height="350"/>  


| Annotation | Desc |
|:---:|:---:|
| @Component | Spring이 관리하는 component를 나타내는 일반적인 스테레오 타입 </br> AOP의 PointCut에 대한 적절한 Target으로 활용 가능 |
| @Repository | Persistence Layer의 component에 대해 선언 |
| @Service | Business(Service) Layer의 component에 대해 선언 |
| @Controller | Presentation Layer의 component에 대해 선언 </br> View를 위해s @ResponseBody에 대한 적절한 구현 필요 |
| @RestController | @Controller + @ResponseBody |


</br>

> #### 참고
> * [Difference between @Component, @Service, @Controller, and @Repository in Spring
](https://www.javacodegeeks.com/2017/11/difference-component-service-controller-repository-spring.html)
