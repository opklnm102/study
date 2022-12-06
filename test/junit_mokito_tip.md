# [Test] JUnit & Mokito tip
> date - 2022.12.06  
> keyworkd - java, test, unit, integration  
> Spring Boot에서 JUnit5와 mockito 사용시 팁을 정리  

<br>

## JUnit5

### assertThrows
* Junit4에서 @Expect, try-catch로 처리하던 Exception 검증을 Excutable + assertThrows로 대체할 수 있다
* @Expect는 sut가 아닌 test case에서 발생하는 Exception을 catch하기 때문에 assertThrows를 사용하자
```java
@DisplayName("상품 중복 등록시 DuplicateKeyException이 발생해야 한다")
@Test
public void addProduct_exceed() {
    // given
    long productId = 1L;
    var productAddCommand = new ProductAddCommand(productId, ...);
    var product = new Product(productId, ...);
 
    when(productRepository.findProduct(productId)).thenReturn(product);
 
    // when
    Executable executable = () -> sut.addProduct(productId, productAddCommand);
 
    // then
    assertThrows(DuplicateKeyException.class, executable);
}
```

<br>

### @Tag
* test case에 tag를 부여해 grouping하여 특정 tag만 수행, 특정 tag만 제외 등에 사용
```java
@Tag("tag")
@Test
public void test() throws Exception {
...
}
```

```gradle
tasks.named('test') {
    useJUnitPlatform {
        excludeTags 'tag'  // 특정 tag 제외
        includeTags 'tag'  // 특정 tag만 수행
    }
}
```

<br>

### unit test, integration test 분리
* unit test 보다 느린 integration test를 개발 중 매번 수행하면 생산성이 낮아지게되므로 unit test와 integration test는 분리해서 실행할 필요가 있다
* IntelliJ IDEA, Gradle 중 선택적으로 동작 가능하게 설정하는 법을 알아보자

#### @Tag 이용
* integration test를 위한 annotation 생성
```java
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Test
@Tag("integration")
public @interface IntegrationTest {
}
```

* `@IntegrationTest` 사용
```java
@IntegrationTest
public void test() throws Exception {
    ...
}
```

* build.gradle에 `excludeTags`, `includeTags`를 사용하여 task 분리
```gardle
tasks.named('test') {
    useJUnitPlatform {
        excludeTags 'integration'
    }
}

task integrationTest(type: Test) {
    useJUnitPlatform {
        includeTags 'integration'
    }
}
```

* gradle task 실행(IntelliJ IDEA에서는 그냥 실행하면 된다)
```sh
## test
$ ./gradlew :test

## test target 지정
$ ./gradlew :test --tests "com.example.xxxxTest"

## integrationTest
$ ./gradlew :integrationTest --tests "com.example.xxxxTest"
```

#### 디렉토리 분리
* src/integrationTest/java, src/integrationTest/resources 생성 후 build.gradle에 아래 내용 추가
```gradle
plugins {
    ...
    id 'idea'  // 아래에서 idea를 사용하기 위해
}

// dependencies 분리를 위해
configurations {
    integrationTestImplementation.extendsFrom testImplementation
    integrationTestRuntimeOnly.extendsFrom testRuntimeOnly
}

sourceSets {
    integrationTest {
        java.srcDir "$projectDir/src/integrationTest/java"
        resources.srcDir "$projectDir/src/integrationTest/resources"
        compileClasspath += main.output + test.output
        runtimeClasspath += main.output + test.output
    }
}

// IntelliJ IDEA에서 integrationTest directory를 test directory로 인식시키기
idea {
    module {
        testSourceDirs += sourceSets.integrationTest.java.srcDirs
        testSourceDirs += sourceSets.integrationTest.resources.srcDirs
    }
}

...
dependencies {
    integrationTestImplementation 'integrationTest에서만 사용할 dependency 지정'
}

tasks.named('test') {
    useJUnitPlatform()
}

task integrationTest(type: Test) {
    useJUnitPlatform()
    testClassesDirs = sourceSets.integrationTest.output.classesDirs
    classpath = sourceSets.integrationTest.runtimeClasspath
}

check.dependsOn integrationTest  // check task 실행시 test, integrationTest가 실행되도록 하기 위함
```

<br>

### @Enabledxxx/@Disabledxxx
* test case의 실행 조건을 지정할 수 있다
```java
@EnabledIfEnvironmentVariable(named = "TEST_INTEGRATION", matches = "true")  // TEST_INTEGRATION="true"
@EnabledIfSystemProperty(named = "test.integration", matches = "true")  // -Dtest.integration=true
class Test {
...
}
```


<br>

## Mockito

### answer
* return value를 stubbing하고 싶은 경우
* 전달받은 parameter를 bypass하거나 parameter를 가공하고 싶은 경우
```java
doAnswer(invocation -> invocation.getArgument(0)).when(productRepository).findProduct();
```

<br>

### ArgumentCaptor
* return value를 검증하고 싶은 경우
* field에 `@Captor`로도 생성 가능
```java
// given
var captor = ArgumentCaptor.forClass(Product.class);

// when
sut.addProduct(...);

// then
verify(productRepository, times(1)).save(captor.capture());
        
var savedProduct =captor.getValue();
assertThat(savedProduct.getProductId()).isEqualTo(1);
```

<br>

### inOrder
* mock의 호출 순서 검증
```java
InOrder inOrder = Mockito.inOrder(mock1, mock2);
inOrder.verify(mock1, times(1)).doSomething();
inOrder.verify(mock2, times(1)).doSomething();        
```


<br><br>

> #### Reference
> * [JUnit 5](https://junit.org/junit5)
> * [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide)
> * [Mockito - Tasty mocking framework for unit tests in Java](https://site.mockito.org)
