# [Spring Boot] com.benjaminsproule.swagger plugin Unable to find method jackson.databind.JavaType
> date - 2023.05.25  
> keyworkd - spring boot, swagger  
> spring boot 2.7.11에서 springfox-swagger 설정 중 겪은 이슈를 정리  

<br>

## Requirement

### Dependency
* Java 17
* spring boot 2.7.12
* com.benjaminsproule.swagger 1.0.4


<br>

## Issue
* generateSwaggerDocumentation task에서 아래의 에러 발생
```java
Unable to find method ''com.fasterxml.jackson.databind.JavaType com.fasterxml.jackson.databind.introspect.AnnotatedMember.getType(com.fasterxml.jackson.databind.type.TypeBindings)''
'com.fasterxml.jackson.databind.JavaType com.fasterxml.jackson.databind.introspect.AnnotatedMember.getType(com.fasterxml.jackson.databind.type.TypeBindings)'
```


<br>

## Why?
* com.benjaminsproule.swagger는 Swagger 문서를 생성하는 Gradle plugin으로 jackson과의 호환성 이슈 때문


<br>

### Resolve
* com.benjaminsproule.swagger 1.0.14로 upgrade
* jackson version에 따라 발생하지 않을 수 있지만 발생한다면 `fixGenerateSwaggerDocumentation` 처럼 추가 필요
```groovy
swagger {
	apiSource {
		springmvc = true
		locations = [ 'com.example' ]
		info {
			title = 'Swagger Gradle Plugin Sample'
			version = 'v1'
		}
		swaggerDirectory = "${project.rootDir}/build/generated/swagger-ui"
	}
}

tasks.register('fixGenerateSwaggerDocumentation') {
    doLast {
        configurations.compileClasspath.resolve()
                .collect { it.toURI().toURL() }
                .each { buildscript.classLoader.addURL it }

        sourceSets.main.output.files
                .collect { it.toURI().toURL() }
                .each { buildscript.classLoader.addURL it }
    }
}

generateSwaggerDocumentation.dependsOn fixGenerateSwaggerDocumentation
```


<br><br>

> #### Reference
> * [com.benjaminsproule.swagger](https://plugins.gradle.org/plugin/com.benjaminsproule.swagger)
> * [could not get type for name org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler from any class loader #132](https://github.com/gigaSproule/swagger-gradle-plugin/issues/132)
