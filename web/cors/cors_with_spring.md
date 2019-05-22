# [Web] CORS with Spring
> date - 2019.05.20  
> keyword - web, cors, spring  
> 이론은 [Cross-Origin Resource Sharing](./cors.md)을 참고  
> 여기서는 Spring에서의 방법만 정리  

<br>

## Spring MVC

### Controller에 설정
```java
// any origin - @CrossOrigin(origins = "*")
@CrossOrigin(origins = {"http://a.dom", "http://b.com"})  
@GetMapping()
@GetMapping(path = "/hello")
public String get() {
    return "hello";
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


<br>


https://github.com/spring-projects/spring-framework/blob/master/src/docs/asciidoc/web/webflux-cors.adoc
TODO: 이 내용 추가


<br><br>

> #### Reference
> * [Enabling Cross Origin Requests for a RESTful Web Service](https://spring.io/guides/gs/rest-service-cors/)
