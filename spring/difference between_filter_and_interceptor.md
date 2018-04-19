# [Spring] difference between filter and interceptor
> filter와 interceptor의 차이에 대해 정리하고 각각의 사용법에 대해 정리하자


## Spring MVC Request Lifecycle

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/spring/images/spring-request-lifecycle.jpg" alt="spring mvc request lifecycle" width="400" height="400"/>
</div>



 처리 시점
 브라우저가 요청
 Filter에 들어온다
 Dispatcher Servlet로 들어온다
 Interception로 들어온다
 Controller
 Interceptor
 Dispatcher Servlet
 Filter
 브라우저에게 응답

Todo: 어떻게 저렇게 처리되는지 코드로 설명 추가






## Interceptor
* Handler(Controller)로 가기 전에 정보 처리
* Spring Framework에서 제공하는 기능

### 언제 사용하면 좋을까?
* 요청 경로마다 접근 제어를 다르게 해야 할 때
* 특정 URL을 요청할 때마다 접근 내역을 기록하고 싶을 때
* 로그인 체크를 해야할 때
* 공통 기능을 넣을 수 있는 부분
```java
public interface HandlerInterceptor {

    // controller(handler) 실행 직전
	boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;
	
    // controller(handler) 실행 직후
	void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception;
    
    // view를 실행한 이후(응답 직전)
    void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception;
}
```


> * Spring Interceptor Interface 계층 구조
> ```sh
> HandlerInterceptor(I)
>     ├── AsyncHandlerInterceptor(I)
>     │     ├── HandlerInterceptorAdapter(C)
>     │     │     ├── ConversionServiceExposingInterceptor(C)
>     │     │     ├── CorsInterceptor(C)
>     │     │     ├── LocaleChangeInterceptor(C)
>     │     │     ├── PathExposingHandlerInterceptor(C)
>     │     │     ├── ResourceUrlProviderExposingInterceptor(C)
>     │     │     ├── ThemeChangeInterceptor(C)
>     │     │     ├── UriTemplateVariablesHandlerInterceptor(C)
>     │     │     └── UserRoleAuthorizationInterceptor(C)
>     │     └── WebRequestHandlerInterceptorAdapter(C)
>     ├── MappedInterceptor(C)
>     └── WebContentInterceptor(C)
> ```


### Interceptor 구현 해보기

#### `HandlerInterceptorAdapter`를 상속받아 구현 
```java
@Component
@Slf4j
public class AuthInterceptor extends HandlerInterceptorAdapter {

    @Autowired
    private Environment environment;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        log.debug("preHandle");

        if (ArrayUtils.contains(environment.getActiveProfiles(), "localhost")) {
            return true;
        }

        return true;
    }
}
```

#### Interceptor Configuration
* Java
```java
@Configuration
public class InterceptorConfiguration extends WebMvcConfigurerAdapter {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor);
    }
}
```

* XML
```xml
<mvc:interceptors>
    <bean id="authInterceptor" class="xx.yy.zz.AuthInterceptor">
</mvc:interceptors>
```

---

## Filter
Dispatcher servlet 앞에서 처리
J2EE 표준 스펙에 정의되어 있는 기능
인코딩, 보안처리 같은 web app 전역적으로 처리해야하는 로직은 필터로 구현


공통 기능을 넣을 수 있는 부분
1. Servlet에게 요청하기 직전
2. Servlet에게 요청하기 직후

Todo: 코드 추가

### Filter 구현 해보기
Todo: 코드 추가







## 정리
* `Filter`와 `Interceptor`는 처리 시점이 다르다




> #### 참고
> * [인터셉터 인터페이스](http://egloos.zum.com/charmpa/v/2922178)
> * [Spring MVC - Intercepting requests with a HandlerInterceptor](https://www.logicbig.com/tutorials/spring-framework/spring-web-mvc/spring-handler-interceptor.html)
