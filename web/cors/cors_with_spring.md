# [Web] CORS with Spring
> date - 2019.05.20  
> keyword - web, cors, spring mvc, spring webflux  
> 이론은 [Cross-Origin Resource Sharing](./cors.md)을 참고  
> 여기서는 Spring에서의 방법만 정리  

<br>

## Processing
* `HandlerMapping` 구현체는 CORS에 대해 built-in support
* `HandlerMapping`은 CORS configuration에 따라 request handler를 확인 후 처리
  * preflight request는 직접 처리
  * simple request는 intercept하여 필요한 CORS response header를 설정
* cross-origin request를 사용하려면 CORS configuration 명시적 선언 필요
  * 일치하는 CORS configuration이 없으면 거부되어 simple/actual request의 response header에 **CORS header가 추가되지 않아 브라우저에서 거부된다**
* 각 `HandleerMapping`은 **URL pattern-based** CorsConfiguration mapping을 사용해 설정
* HandlerMapping level에서 global CORS 설정을 세분화된 handler level CORS configuration과 결합할 수 있다
  * global & local 설정을 결합하는 것은 선택사항

> #### 코드에 대해 더 일고 싶으면 봐야할 class
> * CorsConfiguration
> * CorsProcessor, DefaultCorsProcessor
> * AbstractHandlerMapping


<br>

## Spring MVC

### Controller에 설정
```java
@CrossOrigin(origins = {"http://a.com", "http://b.com"}, maxAge = 3600)  // class level
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin  // method level. default - all origins, all headers, all HTTP methods
    @GetMapping(path = "/hello")
    public String get() {
        return "hello";
    }
}
```

### Global로 설정
```java
@Bean
public WebMvcConfigurer cosrConfigurer() {
    return new WebMvcConfigurerAdapter() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/hello")
                    .allowedOrigins("http://a.dom", "http://b.com")
                    .allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATH")
                    .allowCredentials(false)
                    .maxAge(3600);
            // .addMapping("/**").allowedOrigins("*").allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATH");
        }
    }
}
```

### CORS Filter
* `Spring Security`는 built-in `CorsFilter` support
```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();

    // Possibly...
    // config.applyPermitDefaultValues()

    config.setAllowCredentials(true);
    config.addAllowedOrigin("http://a.com");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsFilter(source);
}
```


<br>

## WebFlux

### Controller에 설정
```java
@CrossOrigin(origins = {"http://a.com", "http://b.com"}, maxAge = 3600)  // class level
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin  // method level. default - all origins, all headers, all HTTP methods
    @GetMapping(path = "/hello")
    public Mono<Account> get() {
        // ...
    }
}
```

### Global로 설정
```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {
    @Override
    public addCorsMapping(CorsRegistry registry) {
        registry.addMapping("/hello")
                .allowedOrigins("http://a.dom", "http://b.com")
                .allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATH")
                .allowCredentials(false)
                .maxAge(3600);
        // .addMapping("/**").allowedOrigins("*").allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATH");
    }
}
```

### CORS Filter
* `Spring Security`는 built-in `CorsFilter` support
```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();

    // Possibly...
    // config.applyPermitDefaultValues()

    config.setAllowCredentials(true);
    config.addAllowedOrigin("http://a.com");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsFilter(source);
}
```


<br><br>

> #### Reference
> * [Enabling Cross Origin Requests for a RESTful Web Service](https://spring.io/guides/gs/rest-service-cors/)
> * [CORS Spring Web MVC Docs](https://docs.spring.io/spring/docs/5.1.7.RELEASE/spring-framework-reference/web.html#mvc-cors)
> * [CORS Spring WebFlux Docs](https://docs.spring.io/spring/docs/5.1.7.RELEASE/spring-framework-reference/web-reactive.html#webflux-cors)
