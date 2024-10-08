# [Spring] Difference between Filter and Interceptor
> filter와 interceptor의 차이에 대해 정리하고 각각의 사용법에 대해 정리하자

<br>

## Spring MVC Request Lifecycle
<div align="center">
  <img src="./images/spring-request-lifecycle.jpg" alt="spring mvc request lifecycle" width="80%" height="80%"/>
</div>

<br>

### 처리 시점
1. 브라우저가 요청
2. Filter에 들어온다
3. Dispatcher Servlet로 들어온다
4. Interception로 들어온다
5. Controller
6. Interceptor
7. Dispatcher Servlet
8. Filter
9. 브라우저에게 응답

<br>

### Request가 어떻게 Filter와 Interceptor로 진입할까?
* `ApplicationFilterChain`로 Filter 호출
```java
// StandardWrapperValve - L199
public final void invoke(Request request, Response response)
        throws IOException, ServletException {
    
    // Create the filter chain for this request - L171
    ApplicationFilterChain filterChain = ApplicationFilterFactory.createFilterChain(request, wrapper, servlet);

    ...
    
    filterChain.doFilter(request.getRequest(), response.getResponse());
    ...
}

// ApplicationFilterChain - L137
public void doFilter(ServletRequest request, ServletResponse response) throws IOException, ServletException {
    ...
    internalDoFilter(request,response);
}
```

* `ApplicationFilterChain.internalDoFilter()`에서 filter를 순회
* `마지막 Filter에서 호출한 internalDoFilter()`에서 dispatcher servlet 호출
```java
// ApplicationFilterChain - L170
private void internalDoFilter(ServletRequest request, ServletResponse response) throws IOException, ServletException {

    // Call the next filter if there is one
    if (pos < n) {  // filterChain의 마지막 filter에서 호출한 internalDoFilter()면 통과하여 아래에서 dispatcher servlet 호출
        ...
        ApplicationFilterConfig filterConfig = filters[pos++];

        Filter filter = filterConfig.getFilter();
        filter.doFilter(request, response, this);

        return;
    }

    ...

    // ApplicationFilterChain - L231
    // We fell off the end of the chain -- call the servlet instance
    // Dispatcher Servlet으로 진입
    servlet.service(request, response);
}

public class TestFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        // callback 방식으로 ApplicationFilterChain으로 다른 filter 호출
        chain.doFilter(request, response);  

    }
}
```

* `DispatcherServlet.doDispatch()`에서 handler(controller) 로직 호출 전후에 `HandlerExecutionChain`으로 interceptor의 method 호출
```java
// DispatcherServlet - L924
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HandlerExecutionChain mappedHandler = null;

    // Determine handler for the current request.
    mappedHandler = getHandler(processedRequest);
    if (mappedHandler == null || mappedHandler.getHandler() == null) {
        // matching 되는 handler가 없다
        noHandlerFound(processedRequest, response);  
        return;
    }

    // Determine handler adapter for the current request.
    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

    ...

    // interceptor.preHandle() 실행
    if (!mappedHandler.applyPreHandle(processedRequest, response)) {
        return;
    }

    // Actually invoke the handler.
    // handler(controller) 내부 로직 호출
    mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

    ...

    // interceptor.postHandle() 실행
    mappedHandler.applyPostHandle(processedRequest, response, mv);

    // interceptor.afterCompletion() 실행 => try-catch에선 triggerAfterCompletion(...)로 호출한다
    processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
}

public class HandlerExecutionChain {

	private HandlerInterceptor[] interceptors;

    ...

	public HandlerInterceptor[] getInterceptors() {
		if (this.interceptors == null && this.interceptorList != null) {
			this.interceptors = this.interceptorList.toArray(new HandlerInterceptor[this.interceptorList.size()]);
		}
		return this.interceptors;
	}

    // HandlerExecutionChain - L128
    boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
        HandlerInterceptor[] interceptors = getInterceptors();
        if (!ObjectUtils.isEmpty(interceptors)) {
            for (int i = 0; i < interceptors.length; i++) {
                HandlerInterceptor interceptor = interceptors[i];
                if (!interceptor.preHandle(request, response, this.handler)) {
                    triggerAfterCompletion(request, response, null);
                    return false;
                }
                this.interceptorIndex = i;
            }
        }
        return true;
    }

    // HandlerExecutionChain - L146
    void applyPostHandle(HttpServletRequest request, HttpServletResponse response, ModelAndView mv) throws Exception {
        HandlerInterceptor[] interceptors = getInterceptors();
        if (!ObjectUtils.isEmpty(interceptors)) {
            for (int i = interceptors.length - 1; i >= 0; i--) {
                HandlerInterceptor interceptor = interceptors[i];
                interceptor.postHandle(request, response, this.handler, mv);
            }
        }
    }
}
```

#### 정리
* ApplicationFilterChain에서 Filter를 순회
* 각 Filter에서 callback 방식으로 `Filter.doFilter()` 호출하며 call stack를 쌓아간다
* 마지막 Filter에서 호출된 `ApplicationFilterChain.doFilter()`에서 dispatcherServlet을 호출
* `DispatcherServlet.doDispatch()`에서 `HandlerExecutionChain`으로 handler(controller) 호출 전후로 interceptor의 메소드 호출
* Controller에서 처리 완료 후 call stack을 제거해가면서 Filter.doFilter() 이후의 로직 실행 


<br>

## Interceptor
* Handler(Controller)로 가기 전에 정보 처리
* Spring Framework에서 제공하는 기능

<br>

### 언제 사용하면 좋을까?
* 요청 경로마다 접근 제어를 다르게 해야 할 때
* 특정 URL을 요청할 때마다 접근 내역을 기록하고 싶을 때
* 로그인 체크를 해야할 때

#### 공통 기능을 넣을 수 있는 부분
```java
public interface HandlerInterceptor {

    // controller(handler) 실행 직전
	boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;

    // controller(handler) 실행 직후
    // exception 발생하면 호출 안됨
	void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception;
    
    // preHandle()에서 true 리턴 후 view를 실행한 이후(응답 직전) or exception 발생시 호출
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

<br>

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
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/products")  // url pattern matching 가능
                .excludePathPatterns("/test/**");
    }
}
```

* XML
```xml
<mvc:interceptors>
  <bean id="authInterceptor" class="xx.yy.zz.AuthInterceptor">
</mvc:interceptors>
```

<br>

### interceptor 적용 순서
* `InterceptorRegistry`에 등록한 순서대로 동작한다
```java
@Slf4j
public class PreTestInterceptor extends HandlerInterceptorAdapter {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.info("PreTestInterceptor");
        return true;
    }
}

@Slf4j
public class PostTestInterceptor extends HandlerInterceptorAdapter {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.info("PostTestInterceptor");
        return true;
    }
}

@Slf4j
public class TestWebRequestInterceptor implements WebRequestInterceptor {

    @Override
    public void preHandle(WebRequest request) throws Exception {
        log.info("TestWebRequestInterceptor");
    }

    @Override
    public void postHandle(WebRequest request, ModelMap model) throws Exception {
    }

    @Override
    public void afterCompletion(WebRequest request, Exception ex) throws Exception {
    }
}

@Configuration
public class InterceptorConfiguration extends WebMvcConfigurerAdapter {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new PreTestInterceptor())
                .addPathPatterns("/test/**");
        registry.addInterceptor(new PostTestInterceptor());
        registry.addWebRequestInterceptor(new TestWebRequestInterceptor());
    }
}

// GET /test
2018-04-24 14:56:16.718  INFO 3104 --- [nio-8060-exec-1] k.c.m.feedgetapi.PreTestInterceptor      : PreTestInterceptor
2018-04-24 14:56:16.719  INFO 3104 --- [nio-8060-exec-1] k.c.m.feedgetapi.PostTestInterceptor     : PostTestInterceptor
2018-04-24 14:56:16.719  INFO 3104 --- [nio-8060-exec-1] k.c.m.f.TestWebRequestInterceptor        : TestWebRequestInterceptor

// GET /aaa
2018-04-24 14:56:16.719  INFO 3104 --- [nio-8060-exec-1] k.c.m.feedgetapi.PostTestInterceptor     : PostTestInterceptor
2018-04-24 14:56:16.719  INFO 3104 --- [nio-8060-exec-1] k.c.m.f.TestWebRequestInterceptor        : TestWebRequestInterceptor
```
* `InterceptorRegistry`에 등록한 순서대로 동작함을 알 수 있다

#### 왜 등록한 순서대로 동작할까?
* `InterceptorRegistry` 내부에서 List로 관리되고 있기 때문
```java
public class InterceptorRegistry {

	private final List<InterceptorRegistration> registrations = new ArrayList<InterceptorRegistration>();

	public InterceptorRegistration addInterceptor(HandlerInterceptor interceptor) {
		InterceptorRegistration registration = new InterceptorRegistration(interceptor);
		this.registrations.add(registration);
		return registration;
	}

	public InterceptorRegistration addWebRequestInterceptor(WebRequestInterceptor interceptor) {
		WebRequestHandlerInterceptorAdapter adapted = new WebRequestHandlerInterceptorAdapter(interceptor);
		InterceptorRegistration registration = new InterceptorRegistration(adapted);
		this.registrations.add(registration);
		return registration;
	}

    // WebMvcConfigurationSupport.getInterceptors()에서 호출한다
	protected List<Object> getInterceptors() {
		List<Object> interceptors = new ArrayList<Object>(this.registrations.size());
		for (InterceptorRegistration registration : this.registrations) {
			interceptors.add(registration.getInterceptor());
		}
		return interceptors ;
	}
}

public class WebMvcConfigurationSupport {

    // WebMvcConfigurationSupport.requestMappingHandlerMapping(), viewControllerHandlerMapping(), beanNameHandlerMapping()에서 호출
	protected final Object[] getInterceptors() {
		if (this.interceptors == null) {
			InterceptorRegistry registry = new InterceptorRegistry();
			addInterceptors(registry);  // 여기
			registry.addInterceptor(new ConversionServiceExposingInterceptor(mvcConversionService()));
			registry.addInterceptor(new ResourceUrlProviderExposingInterceptor(mvcResourceUrlProvider()));
			this.interceptors = registry.getInterceptors();
		}
		return this.interceptors.toArray();
	}
}

public class WebMvcConfigurationSupport {
	@Bean
	public RequestMappingHandlerMapping requestMappingHandlerMapping() {
		RequestMappingHandlerMapping mapping = createRequestMappingHandlerMapping();
		mapping.setOrder(0);
		mapping.setInterceptors(getInterceptors());  // 여기
		mapping.setContentNegotiationManager(mvcContentNegotiationManager());
		mapping.setCorsConfigurations(getCorsConfigurations());

		PathMatchConfigurer configurer = getPathMatchConfigurer();
		if (configurer.isUseSuffixPatternMatch() != null) {
			mapping.setUseSuffixPatternMatch(configurer.isUseSuffixPatternMatch());
		}
		if (configurer.isUseRegisteredSuffixPatternMatch() != null) {
			mapping.setUseRegisteredSuffixPatternMatch(configurer.isUseRegisteredSuffixPatternMatch());
		}
		if (configurer.isUseTrailingSlashMatch() != null) {
			mapping.setUseTrailingSlashMatch(configurer.isUseTrailingSlashMatch());
		}
		UrlPathHelper pathHelper = configurer.getUrlPathHelper();
		if (pathHelper != null) {
			mapping.setUrlPathHelper(pathHelper);
		}
		PathMatcher pathMatcher = configurer.getPathMatcher();
		if (pathMatcher != null) {
			mapping.setPathMatcher(pathMatcher);
		}

		return mapping;
	}
}

// 각 HandlerMapping의 super class인 AbstractHandlerMapping에서 HandlerExecutionChain을 만들 때 List에서 가져와서 반환하기 때문
// 만들어진 HandlerExecutionChain을 dispatcher servlet에서 사용한다
// dispatcher servlet에서 getHandler() 호출 -> HandlerExecutionChain 생성하면서 등록한 interceptor list에서 현재 request handler에 적용할 interceptor를 구성하여 HandlerExecutionChain 만들어서 return
public abstract class AbstractHandlerMapping ... {
    protected HandlerExecutionChain getHandlerExecutionChain(Object handler, HttpServletRequest request) {
        HandlerExecutionChain chain = (handler instanceof HandlerExecutionChain ? (HandlerExecutionChain) handler : new HandlerExecutionChain(handler));

        String lookupPath = this.urlPathHelper.getLookupPathForRequest(request);
        for (HandlerInterceptor interceptor : this.adaptedInterceptors) {
            if (interceptor instanceof MappedInterceptor) {
                MappedInterceptor mappedInterceptor = (MappedInterceptor) interceptor;
                if (mappedInterceptor.matches(lookupPath, this.pathMatcher)) {
                    chain.addInterceptor(mappedInterceptor.getInterceptor());
                }
            }
            else {
                chain.addInterceptor(interceptor);
            }
        }
        return chain;
    }
}

public class HandlerExecutionChain {

	private final Object handler;

	private HandlerInterceptor[] interceptors;

	private List<HandlerInterceptor> interceptorList;

	private int interceptorIndex = -1;

    ...
}
```


<br>

## Filter
* Dispatcher servlet 앞에서 처리
* web app 전역적으로 처리해야하는 로직은 필터로 구현
   * 인코딩, 보안처리
   * multipart form, GZIP 압축 같은 content handling
* filter chain에서 전달되는 request, response 객체를 교환할 수 있다
* J2EE 표준 스펙에 정의되어 있는 기능

<br>

### 공통 기능을 넣을 수 있는 부분
```java
public interface Filter {

    // application 시작시 호출
    public void init(FilterConfig filterConfig) throws ServletException;
	
    // request/response를 Dispatcher Servlet로 넘기기 전에 FilterChain에서 호출
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException;

    // application 종료시 호출
    public void destroy();
}
```
1. Dispatcher Servlet에게 요청하기 직전
2. Dispatcher Servlet에게 요청하기 직후

<br>

### Filter 구현 해보기
```java
@WebFilter(urlPatterns = "/test/*")
@Slf4j
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        log.info("test doFilter start");  // Dispatcher Servlet에게 요청하기 직전

        chain.doFilter(request, response);

        log.info("test doFilter end");  // Dispatcher Servlet에게 요청하기 직후
    }

    @Override
    public void destroy() {
    }
}

@SpringBootApplication
@ServletComponentScan
public class FeedgetApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FeedgetApiApplication.class, args);
    }
}
```

### Exception handling
```java
@Slf4j
public class TestFilter implements Filter {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    ...
    throw new CustomException("custom exception");
  }
}
```
filter에서 `throw CustomException()`을 하면 `@RestControllerAdvice`, `@ExceptionHandler`에서 처리할까?  
-> X, filter는 DispatchServlet 외부이기 때문에 handler가 동작할 수 없음!  
HandlerExceptionResolver가 처리할 수 없으므로!

<br>

## Conclusion
* `Filter`와 `Interceptor`는 처리 시점이 다르기 때문에 적절하게 사용하자

<br><br>

> #### Reference
> * [인터셉터 인터페이스](http://egloos.zum.com/charmpa/v/2922178)
> * [Spring MVC - Intercepting requests with a HandlerInterceptor](https://www.logicbig.com/tutorials/spring-framework/spring-web-mvc/spring-handler-interceptor.html)
> * [스프링 3.1 (2) HandlerInterceptor의 적용순서](http://toby.epril.com/?cat=134&paged=3)
