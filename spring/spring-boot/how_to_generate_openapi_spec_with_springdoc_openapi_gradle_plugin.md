# [Spring Boot] How to generate openapi spec with springdoc-openapi-gradle-plugin
> date - 2023.06.04  
> keyworkd - spring boot, swagger, openapi  
> springdoc-openapi-gradle-plugin을 이용해서 gradle task로 OpenAPI 3 Spec을 생성하는 방법을 정리  

<br>

## springdoc-openapi-gradle-plugin?
* API 문서화를 위한 표준인 [OpenAPI Specification](https://en.wikipedia.org/wiki/OpenAPI_Specification) 기반의 코드를 기반으로 API 문서 생성을 도와주는 plugin
  * 코드 기반으로 생성되기 때문에 자동으로 최신화되어 API 문서 관리에 이점이 많다
* `forkedSpringBootRun`, `generateOpenApiDocs` 2개의 task가 추가되며 `generateOpenApiDocs`를 실행하면 `forkedSpringBootRun`를 사용해 background에서 spring boot application 실행한 후 doc URL(e.g. /v3/api-docs)을 호출하여 OpenAPI Docs를 json으로 저장한다

<br>

## Usage
* build.gradle
```gradle
plugins {
      id 'org.springframework.boot' version '2.7.12'
      id 'org.springdoc.openapi-gradle-plugin' version '1.6.0'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springdoc:springdoc-openapi-ui:1.7.0'
}
```

* springdoc을 이용해 API Spec 작성
```java
@Tag(name = "test-v1", description = "test API")
@RestController
@RequestMapping(path = "/test", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class TestController {

    @GetMapping("/person")
    @Operation(
            summary = "test summary",
            description = "test description"
    )
    public Person get() {
        return new Person("a", 12);
    }
}

@Schema(description = "사람")
public class Person {
    @Schema(description = "이름")
    private String name;

    @Schema(description = "나이", hidden = true)
    private Integer age;
}
```

* `generateOpenApiDocs` task를 실행하면 build dir에 `openapi.json`이 생성된다
```sh
$ ./gradlew clean generateOpenApiDocs
```


<br><br>

> #### Reference
> * [springdoc-openapi-gradle-plugin - GitHub](https://github.com/springdoc/springdoc-openapi-gradle-plugin)
> * [Gradle plugin - Springdoc Docs](https://springdoc.org/#gradle-plugin)
