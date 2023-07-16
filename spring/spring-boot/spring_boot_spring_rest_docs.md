# [Spring Boot] Using Spring REST Docs in Spring Boot
> date - 2023.07.16  
> keyworkd - spring boot, swagger, openapi, api docs  
> Spring Boot에서 Rest Docs를 사용하는 방법에 대해 정리  

<br>

## Rest Docs?
* **test code 기반**으로 Asciidoctor를 이용해 HTML 등 다양한 포맷의 API document를 생성
* test code를 기반이기 때문에 test로 검증된 API Spec을 보장
* Swagger 기반의 [Springdoc](https://springdoc.org), [Springfox](https://github.com/springfox/springfox)와 다르게 비즈니스 로직에 문서화를 위한 코드가 들어가지 않는다
* `MockMvc`, `Rest Assured`로 test를 작성
* Rest Docs에서 OpenAPI Spec을 생성하려면 [restdocs-api-spec](https://github.com/ePages-de/restdocs-api-spec)를 이용


<br>

## Dependency
```gradle
plugins {
  id 'java'
  id 'org.springframework.boot' version '3.1.1'
  id 'io.spring.dependency-management' version '1.1.0'
  id 'org.asciidoctor.jvm.convert' version '3.3.2'
}

java {
  sourceCompatibility = '17'
}

repositories {
  mavenCentral()
}

configurations {
  asciidoctorExt
}

ext {
  set('snippetsDir', file("build/generated-snippets"))
}

dependencies {
  ...
  testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
  asciidoctorExt 'org.springframework.restdocs:spring-restdocs-asciidoctor'
}

tasks.withType(Test).configureEach {
  outputs.dir snippetsDir
  useJUnitPlatform()
  outputs.upToDateWhen { false }
}

tasks.named('asciidoctor') {
  inputs.dir snippetsDir
  configurations 'asciidoctorExt'
  dependsOn test
}
```


<br>

## Usage
* 공통으로 사용할 설정 생성
```java
public interface ApiDocumentUtils {

  static OperationRequestPreprocessor getDocumentRequest() {
    return preprocessRequest(
        modifyUris().scheme("https")
                    .host("docs.example.com")
                    .removePort(), prettyPrint());
  }

  static OperationResponsePreprocessor getDocumentResponse() {
    return preprocessResponse(prettyPrint());
  }
}
```
* MockMvc를 이용해 test code 작성
```java
@WebMvcTest(AdminController.class)
@AutoConfigureRestDocs(uriScheme = "https", uriHost = "docs.example.com")
@ExtendWith(RestDocumentationExtension.class)
class AdminControllerTest {

  @Autowired
  private MockMvc mvc;

  @Test
  void endpoint() throws Exception {
    // given

    // when
    ResultActions result = mvc.perform(get("/admin/{id}", 1L)
                              .param("userName", "admin"));

    // then
    result.andExpect(status().isOk())
          .andExpect(content().string("admin"))
          .andDo(document("admin",
                 getDocumentRequest(),
                 getDocumentResponse()))
          .andDo(print());
  }
}
```


<br><br>

> #### Reference
> * [Creating API Documentation with Restdocs](https://spring.io/guides/gs/testing-restdocs)
> * [Spring REST Docs](https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle)
