# [Spring] Spring Bean thread-safe
> production에서 발생한 이슈와 이유를 정리해보고자 함


## Issue
* 아래의 코드는 무슨 문제가 있을까?
```java
public class Gem {

    private Integer balance;

    private Integer total;

    // getter, setter
}

@RestController
public class GemController {

    private Integer count = 0;

    @PutMapping("/gems")
    @Transactional
    public void updateGemBalance() {

        Gem gem = new Gem();
        gem.setBalance(count++);

        // ...
    }
}
```
* `count`는 thread-safe하지 않기 때문에 request마다 증가한다


## Why?

<div align="center">
<img src="https://beyondj2ee.files.wordpress.com/2013/02/ec9db4ebafb8eca780-12.png" alt="spring-bean" width="350" height="350"/>
</div>

* Spring Application은 기동시 ApplicationContext라는 Static Sharing Pool을 생성
   * Application 구동시 1번만 생성한다

```java
// SpringApplication.run()
public ConfigurableApplicationContext run(String... args) {
    ...
    Banner printedBanner = printBanner(environment);
    context = createApplicationContext();
    ...
    return context;
}

protected ConfigurableApplicationContext createApplicationContext() {
		Class<?> contextClass = this.applicationContextClass;
		if (contextClass == null) {
			try {
				contextClass = Class.forName(this.webEnvironment
						? DEFAULT_WEB_CONTEXT_CLASS : DEFAULT_CONTEXT_CLASS);
			}
			catch (ClassNotFoundException ex) {
				throw new IllegalStateException(
						"Unable create a default ApplicationContext, "
								+ "please specify an ApplicationContextClass",
						ex);
			}
		}
		return (ConfigurableApplicationContext) BeanUtils.instantiate(contextClass);
	}
```
* ApplicationContext 영역에 POJO 클래스의 객체가 동록
   * 등록된 POJO 클래스의 객체 -> Spring Bean
* ApplicationContext가 Sharing되기 때문에 default scope인 singleton으로 생성된 POJO 클래스에 static 선언을 하지 않더라도, 멤버 변수는 multi-thread 환경에서 서로 공유
   * prototype 등의 경우 매번 생성
* JVM에서 하나의 ApplicationContext가 생성되며, Thread #1 ~ 10까지 모두 동일한 Spring Bean을 사용
* Spring Bean의 member variable도 multi-thread 환경에서 공유가 된다
* public method 안에 선언된 local variable은 thread-safe

> #### [Bean Scope](https://docs.spring.io/spring/docs/4.2.5.RELEASE/spring-framework-reference/html/beans.html#beans-factory-scopes) 
> * singleton
>    * Spring IoC Container 내에 1개의 객체 존재
>    * default
> * prototype	
>    * 다수의 객체 존재 가능
> * request
>    * 각 HTTP request마다 1개의 객체 존재
>    * Web-aware Spring ApplicationContext 안에서만 유효
> * session
>    * 각 HTTP session마다 1개의 객체 존재
>    * Web-aware Spring ApplicationContext 안에서만 유효
> * global session
>    * 각 global HTTP Session마다 1개의 객체 존재
>    * 일반적으로 portlet context 안에서 유효
>    * Web-aware Spring ApplicationContext 안에서만 유효
> * application
>    * 각 ServletContext마다 1개의 객체 존재
>    * Web-aware Spring ApplicationContext 안에서만 유효
   

## Resolve
* default인 singleton scope 때문에 발생한 것
* `class member variable을 사용하지 않는다` 혹은 `synchronization 처리` 추가
```java
public class Gem {

    private Integer balance;

    private Integer total;

    // getter, setter
}

@RestController
public class GemController {

    @PutMapping("/gems")
    @Transactional
    public void updateGemBalance() {

        // persistence layer에서 조회
        Gem oldGem = findGem();
        int count = oldGem.getBalance();

        Gem gem = new Gem();
        gem.setBalance(count++);

        // ...
    }
}
```



> #### 참고
> * [멀티 쓰레드 환경에서 스프링 빈 주의사항](https://beyondj2ee.wordpress.com/2013/02/28/%EB%A9%80%ED%8B%B0-%EC%93%B0%EB%A0%88%EB%93%9C-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C-%EC%8A%A4%ED%94%84%EB%A7%81%EB%B9%88-%EC%A3%BC%EC%9D%98%EC%82%AC%ED%95%AD/)
> * [Must Spring MVC Classes be Thread-Safe](https://stackoverflow.com/questions/16795303/must-spring-mvc-classes-be-thread-safe)
