# [Spring Boot] How to register filter in spring boot
> Spring Boot 1.5.12에서 Java Config로 Filter를 등록하는 방법에 대해 정리


## 1. @WebFilter 사용
* URL pattern matching 가능
* `@WebFilter` 사용시 `@ServletComponentScan`와 같이 사용하여 component scan 필요
```java
@WebFilter(urlPatterns = "/test/*")
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
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

> #### @ServletComponentScan
> * embedded container에서 `@WebServlet`, `@WebFilter`, `@WebListener`인 component를 scan하여 bean으로 등록
> * standalone container에선 동작하지 않는다
>    * buint-in discovery mechanism을 사용하기 때문


## 2. @Component 사용
* 모든 requet에 filter를 적용
```java
@Component
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
```
* `@WebFilter(urlPatterns = "/test/*")`, `@ServletComponentScan`를 적용해도 모든 request에 filter가 적용된다
* `@Component`를 사용하여 spring bean으로 scan될 경우 `@WebFilter(urlPatterns = "/test/*")`에 정의된 url pattern matching이 동작하지 않는다


## 3. Filter 사용
```java
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}

@Configuration
public class FilterConfiguration {

    @Bean
    public Filter testFilter() {
        return new TestFilter();
    }
}
```


## 4. FilterRegistrationBean 사용
```java
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}

@Configuration
public class FilterConfiguration {

    @Bean
    public FilterRegistrationBean testFilter() {
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(new TestFilter());
        registrationBean.addUrlPatterns("/test/*");
        return registrationBean;
    }
}
```

> #### FilterRegistrationBean
> * Servlet 3.0+ container에 filter를 등록하는 ServletContextInitializer
> * ServletContext.addFilter(String, Filter)와 비슷하지만 Spring Bean과 친숙한 디자인
> * ServletContext.onStartup() 호출 전에 setFilter()로 filter를 지정해야 한다
> * URL pattern이나 특정 servlet에 연결된다
>    * URL pattern, 특정 servlet이 지정되지 않으면 `/*`에 연결


## Filter에 순서 지정하기
* TestFilter -> PostTestFilter 순으로 호출된다
* `@Order`는 작은 숫자의 우선순위가 더 높다
```java
@Component
@Order(value = 1)
public class TestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}

@Component
@Order(value = 2)
public class PostTestFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
```


#### 참고
> * [Spring Boot doc - Scanning for Servlets, Filters, and listeners](https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#boot-features-embedded-container-servlets-filters-listeners-scanning)
> * [Spring Boot에서 필터 클래스를 추가하는 방법?](https://code.i-harness.com/ko/q/12e851a)
