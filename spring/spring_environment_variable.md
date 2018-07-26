# [Spring] Spring Environment Variable
> date - 2018.07.26  
> keyword - spring environment, spring profile, spring cloud config  
> 너무 좋은 내용인 [실전! 스프링과 함께하는 환경변수 관리 변천사](https://www.slideshare.net/sbcoba/2015-47137155)를 기억하기 위해 정리

<br>

## 환경 변수?
* 프로세스가 컴퓨터에서 동작하는 방식에 영향을 미치는 `동적인 값`들의 모임

### 스프링 프레임워크 환경변수
* 자주 `변경`되거나 확정되지 않은 `데이터`
* 같은 용도이지만 개발, 테스트, 운영 등 `다양한 조건`마다 `다른 데이터`
* 다양한 곳에서 사용하는 `공통 데이터` 존재

### 환경변수가 중요한 이유?
* 시스템의 `유연성`

---

<br>

## 기존 Java 환경변수 방법

### 1. 클래스 상수
```java
public class DatabaseProperty {
    public static final String DATABASE_DRIVER = "org.h2.Driver";
    public static final String DATABASE_URL = "jdbc:h2:mem:test;DB_CLOSE_DELAY=1;MODE=Oracle;TRACE_LEVEL_SYSTEM_OUT=2";
    public static final String DATABASE_USER = "sa";
    public static final String DATABASE_PASSWORD = "";
}
```
* `static final`을 사용하여 클래스 상수로 사용
* 상수를 가지는 `특정 클래스 의존적`
* 변수 변경 때마다 참조하고 있는 클래스를 `재 컴파일`
* 현재도 많이 사용

<br>

### 2. properties 파일
```yml
db.driver=org.h2.Driver
db.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=1;MODE=OracleTRACE_LEVEL_SYSTEM_OUT=2
db.user=sa
db.password=
```
* Key=Value 형태의 데이터
* JAVA에서 기본 지원(java.util.Properties)

---

<br>

## Spring With `Not Profile`
* Profile 기능을 지원하지 않는 `3.0이하` 버전 Spring 


### Profile 기능이란?
* 특정 profile에 따라 `환경변수` 및 기능 등을 다르게 할 수 있도록 구성하는 것
```yml
# develop
db.driver=org.h2.Driver
db.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=1;MODE=OracleTRACE_LEVEL_SYSTEM_OUT=2
db.user=sa
db.password=

# test
db.driver=oracle.jdbc.driver.OracleDriver
db.url=jdbc:oracle:thin:@//123.123.22.321:1521/test1
db.user=test
db.password=test1
```

<br>

### Profile 기능을 적용할만한 방법이 없을까? - 살짝 무식하게(?)
* 모든 속성의 데이터를 구분
* java 실행시 -D 옵션으로 profile 정보(java -Dprofile=prod)를 넘기고 내부에서 코딩한다

```yml
# local
local.db.driver=org.h2.Driver

# test
test.db.driver=oracle.jdbc.driver.OracleDriver
```

```java
@Value("${local.db.driver}")
private dbDriver;

@Value("${test.db.driver}")
private String testDbDriver;

String profile = System.getProperty("profile");
if ("local".equals(profile)) {
    ...
} else if ("test".equals(profile)) {
    ...
}
```

---

<br>

## Maven과 Profile 기능 그리고 properties

### Maven, Profile
* Maven은 빌드 및 배포 tool
* `빌드시 profile을 선택`할 수 있는 기능 제공
* `$ mvc -P<profile> install` 형태로 빌드
* plugin을 사용하여 profile에 따른 properties 선택

```yml
# develop
db.driver=org.h2.Driver
db.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=1;MODE=OracleTRACE_LEVEL_SYSTEM_OUT=2
db.user=sa
db.password=

# test
db.driver=oracle.jdbc.driver.OracleDriver
db.url=jdbc:oracle:thin:@//123.123.22.321:1521/test1
db.user=test
db.password=test1
```


### Maven Profile 활용1
* Spring mvc-config.xml
```xml
<context:property-placeholder location="classpath:META-INF/config.xml"/>
```

* 환경변수 META-INF/config.xml
```xml
<properties>
    <comment>환경변수 설정 파일</comment>

    <entry key="profiles.active">${profiles.active}</entry>
    <entry key="db.driver">${db.driver}</entry>
    ...
</properties>
```

### Maven Profile 활용2
```sh
$ mvn -Plocal install
```

* build-local.properties
```xml
<properties>
    <comment>환경변수 설정 파일</comment>

    <entry key="profiles.active">local</entry>
    <entry key="db.driver">org.h2.Driver</entry>
    ...
</properties>
```

<br>

### Maven Profile 장/단점

#### 장점
* Spring Application에서는 단순한 설정형태 유지
* IDE 플러그인에서 Profile 지원(profile 변경시 자동 빌드)

#### 단점
* Profile 단위로만 properties를 생성하기 때문에 `중복 환경변수`들이 생성
* properties 변경시마다 maven `build 필요`
* Maven이라는 도구에 `종속`되는 문제

---

<br>

## Profile 기능을 지원하는 Spring 3.1
* framework에서 Profile 기능이 추가
* profile에 따른 Bean 정보 제어
  * @Profile(""), <beans profile="">
* 환경변수 기능이 `Environment` 클래스로 통합 관리
  * [Unified Property Management](https://spring.io/blog/2011/02/15/spring-3-1-m1-unified-property-management/) 참고

<br>

### Spring 3.1 기능 적용
* web.xml 또는 application 실행시 Profile 인자를 넘겨서 선택하는 형태
```xml
<!-- web.xml -->
<context-param>
    <param-name>spring.profiles.default</param-name>
    <param-value>프로파일명</param-value>
</context-param>
```
또는 
```sh
# application 실행시 인자 전달
$ java -Dspring.profiles.active=<profile name>
```

* 선택된 profile을 spring에서 `환경변수`파일을 직접 선택
```xml
<!-- mvc-config.xml -->
<context:property-placeholder location="classpath:META-INF/config-${spring.profiles.active:local}.properties" />
```

<br>

### 개선 후 장점
* `Maven 종속` 부분 제거
* property 변경 시 Build가 필요없어서 Build인한 부담감 축소
* Profile별 Spring Bean 구성 가능
```java
@Profile("local")
@Component
public class LocalComponent {
}

@Profile("test")
@Component
public class TestComponent {
}
```
* 여전히 `properties`와 `Profile` 조합의 단점이 존재

---

<br>

## Spring Boot의 YAML 지원
```yml
# 공통 부분
service: config-service

---
# prod 1~3 관련 속성 
spring.profiles: prod1,prod2,prod3

db:
  driver: oracle.jdbc.driver.OracleDriver
  ...

---
# test 1~2 관련 속성
spring.profile: test1,test2

db:
  driver: org.h2.Driver
  ...
```
* json과 비슷해 simple!
* 한글 지원
* 들여쓰기 강제화
* `---`로 하나의 파일에서 profile별로 나눌 수 있다

<br>

### Spring Boot 환경변수 지원
* 환경 변수와 Java bean과 `자동 바인딩` 기능 제공
```yml
service:
  name: config-service
```

```java
// 환경변수 데이터를 Java bean과 바인딩
@ConfigurationProperties(prefix = "service")
@Component
public class ServiceProperties {
    
    private String name;
}

// usage
@Autowired
private ServiceProperties serviceProperties;

String name = serviceProperties.getName();
```

<br>

### YAML 적용 후 장점
* 파일 기준 `Profile` 위주의 구성 -> 문서 내용 위주로 변경
```
resources
  ├── application.yml
  ├── db-config.yml
  └── sys-config.yml
```
* 환경변수의 `구조화`
* 중복된 데이터 축소

---

<br>

## 지금까지의 정리
* 자바 상수 클래스
  * Java 소스에 종속적인 환경변수
* Properties 파일
  * Key=Value의 심플한 환경변수
* Maven Profile
  * Build시 Profile 결정 후 환경정보 추가
* Spring 3.1 Profile
  * framework에서 Profile 환경변수 선택
* YAML
  * YAML 형태의 환경변수

> 시스템 규모의 대형화 순서

* 운영할수록 늘어가는 `서버, application, 환경변수`
* 환경변수 `변경시 마다 재배포와 재시작` 그리고.. cloud, MSA(Micro Service Architecture)

* `늘어나는 application의 환경변수 제어` 필요성
* 그런 요구에 의해서 나온 Spring Cloud Config

---

<br>

## Spring Cloud Config
* 환경변수를 제공해주는 `REST API` 서버(필수)와 환경변수를 제공받는 클라이언트로 구성(옵션)
* JSON 형식으로 제공(어떤 서버에서도 사용 가능)
* 환경변수 관리
  * git, svn 이용
* 환경변수에 대한 `암복호화` 기능 내장
* 다양한 `Application, Profile, Version` 형태를 지원

* 기존 환경변수 구조
![legacy config](https://github.com/opklnm102/study/blob/master/spring/images/legacy_config.png)

* Spring Cloud Config 시스템 구조
![spring cloud config](https://github.com/opklnm102/study/blob/master/spring/images/spring_cloud_config.png)

* `API 서버`를 통하여 `다수`의 application에 `환경변수`를 제공
* Spring Boot의 모듈은 대부분 환경변수로 제어 가능
* Spring Cloud Config와 `결합`으로 다수의 시스템의 `세세한 컨트롤`까지 가능

---

<br>

> #### 참고
> * [실전! 스프링과 함께하는 환경변수 관리 변천사](https://www.slideshare.net/sbcoba/2015-47137155)
> * [실전! 스프링과 함께하는 환경변수 관리 변천사 발표 자료 샘플](https://github.com/sbcoba/spring-camp-2015-sample)
> * [Unified Property Management](https://spring.io/blog/2011/02/15/spring-3-1-m1-unified-property-management/)
