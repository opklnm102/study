# [SpringBoot + Spring Security] Setting Up Swagger2 with a Spring REST API 
> REST API를 만들 때 문서화는 매우 중요하지만, 매번하는 것은 귀찮고 힘든 작업임에는 틀림없다  
> 그래서 Spring Boot + Spring Security환경에서 Swagger를 연동하여 API 문서화를 자동화하던 중  
> Spring Security 설정 때문에 swagger ui가 사용하는 api info에 접근을 못해서 생기는 문제로 어려움을 겪음...

## [Swagger](http://swagger.io/)
* The World's most popular api framework
* RESTful API를 설계, 빌드, 문서화 및 사용하는데 도움이되는 강력한 오픈 소스 프레임 워크
* API를 호출할 수 있는 방법과 설명을 간략하게 볼 수 있고 테스트도 가능

##  그래들 의존성 추가
* Swagger2 명세서의 구현체인 `Springfox` 사용
* `build.gradle`에 의존성을 추가
```gradle
// Swagger
compile group: 'io.springfox', name: 'springfox-swagger2', version: '2.6.1'
compile group: 'io.springfox', name: 'springfox-swagger-ui', version: '2.6.1'
```

## Swagger 설정하기
```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("kr.co.mash-up.9tique")
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.any())  // 현재 RequestMapping으로 할당된 모든 url 리스트 추출
                .paths(PathSelectors.ant("/api/**"))  // '/api'로 시작하는 것만 문서화
                .build()
                .pathMapping("/api")  // 문서화시 servlet mapping경로에 perfix로 붙여준다 -> 실제 request에는 영향 X
                .useDefaultResponseMessages(false)  // default message를 사용하지 않는다
                // global response message 설정
                .globalResponseMessage(RequestMethod.GET,
                        Arrays.asList(
                                new ResponseMessageBuilder()
                                        .code(500)
                                        .message("server error")
                                        .responseModel(
                                                new ModelRef("Error")
                                        ).build(),
                                new ResponseMessageBuilder()
                                        .code(400)
                                        .message("bad request")
                                        .responseModel(
                                                new ModelRef("Error")
                                        ).build()
                        )
                );
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("구티크")
                .description("Mash-Up 2기(2016-2) Team Project")
                .termsOfServiceUrl("https://github.com/mash-up-kr/9tique-backend")
                .contact(new Contact("opklnm102", "https://github.com/opklnm102", "opklnm102@gmail.com"))
                .license("Apache License Version 2.0")
                .licenseUrl("https://www.apache.org/licenses/LICENSE-2.0")
                .version("1.0")
                .build();
    }
}
```

## Spring Security 설정하기
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

     ...

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring()
                .antMatchers("/v2/api-docs", "/swagger-resources/**", "/swagger-ui.html");
    }
}
```

## API에 부가 정보 설정하기
```java
@RestController
@RequestMapping(value = "/api/categories")
// description - api 설명, tag 옆에 들어감
// tags - 제목 부분에 들어갈 tag, 여러개 가능
@Api(description = "카테고리", tags = {"category"})
public class CategoryController {

    @Autowired
    private CategorySservice categorySservice;

    /**
     * 카테고리 생성
     */
    @ApiOperation(value = "카테고리 생성")  // 메소드명 대신 들어갈 값
    @ApiResponses(value = {  // api response 설정
        @ApiResponse(code = 200, message = "success"),
        @ApiResponse(code = 401, message = "Unauthorized", response = ResponseVO.class /*response model*/)
    })
    @RequestMapping(method = RequestMethod.POST)
    public ResponseVO add(@RequestBody CategoryRequestVO requestVO) {
        ...
    }
```

## 확인하기
* `http://127.0.0.1:8080/{app-root}/swagger-ui.html`에서 확인

> #### 참고  
> [SpringFox](http://springfox.github.io/springfox/)  
> [SpringFox - Swagger SpringBoot Demo](https://github.com/springfox/springfox-demos/blob/master/boot-swagger/src/main/java/springfoxdemo/boot/swagger/Application.java)  
> [Swagger로 REST API문서 자동화 하기](http://jojoldu.tistory.com/31)  
> [Setting Up Swagger 2 with a Spring REST API](http://www.baeldung.com/swagger-2-documentation-for-spring-rest-api)  
> [How to configure Spring Security to allow Swagger URL to be accessed without authentication](http://stackoverflow.com/questions/37671125/how-to-configure-spring-security-to-allow-swagger-url-to-be-accessed-without-aut)  

> #### 더보면 좋을 것  
> [swagger-core - wiki](https://github.com/swagger-api/swagger-core/wiki/Annotations-1.5.X)  
> [swagger-codegen](http://swagger.io/swagger-codegen/)
