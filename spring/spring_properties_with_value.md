# [Spring] Properties with @Value
> spring property 하나의 key에 여러 value가 있을 때에 그걸 처리하는 과정에서 공부한 것을 정리


## 1개의 key에 1개 value가 있는 경우
* application.properties
```
resource.name=ethan
```

```java
@Value("${resource.name}")
private String name;  // ethan
```

---

## default value
* property가 없는 경우 default value binding
```java
@Value("${unknown:default value}")
private String value;  // default value
```

---

## 1개의 key에 여러 value가 있는 경우 
* application.properties
```
resource.name=ethan,damon,linus
```

```java
@Value("${resource.name}")
private String[] names;  // {"ethan", "damon", "linus"}
```

### List로 읽어오기
```java
@Value("#{'${resource.name}'.split(',')}")
private List<String> names;  // [ethan, damon, linus]

@Value("#{T(java.util.Arrays).asList('${resource.name}')}")
private List<String> names2;  // [ethan, damon, linus]
```


### 공백 제거하기
* application.properties
```
# , 뒤로 공백 1칸씩 있다
resource.name-with-blank=ethan, damon, linus
```

```java
@Value("#{'${resource.name-with-blank}'.split(',')}")
private List<String> namesWithBlank;  // [ethan,  damon,  linus] => 공백이 1칸씩 존재

// 공백 제거
@Value("#{'${resource.name-with-blank}'.trim().replaceAll(\"\\s*(?=.)|(?<=,)\\s*\", \"\").split(',')}")
private List<String> namesWithoutBlank;  // [ethan, damon, linus]
```

---

## System Property
* -D 옵션으로 주는 값을 읽을 수 있다
```sh
java -jar xxx.jar -Ddatabase-url=test.com:3306
```

```java
@Value("${database-url}")
private String databaseUrl;  // test.com:3306

@Value("#{systemProperties['database-url']}")
private String databaseUrl;  // test.com:3306
```

### application.properties에 system property 사용하기
* application.properties
```
# 환경변수에 입력한 database-url이 여기로 binding된다
sample.datasource-url=${database-url}
```

```java 
@Value("#{sample.datasource-url}")
private String databaseUrl;  // test.com:3306
```
* system property를 spring property에 binding해서 사용
* 이 방법을 사용하면 application.properties 파일에 DB url, pw 등 `민감한 정보들을 노출시키지 않을 수 있다`

### system property가 없는 경우 방지
```java
@Value("#{systemProperties['unknown']}")
private String systemValue;  // null

// default value를 사용해 null safe
@Value("#{systemProperties['unknown'] ?: 'some default'}")
private String systemValue;  // some default
```


> #### 참고
> * [Reading a List from properties file and load with spring annotation @Value](https://stackoverflow.com/questions/12576156/reading-a-list-from-properties-file-and-load-with-spring-annotation-value)
> * [[Java] Spring 애노테이션을 사용하여 속성 파일 및로드에서 목록 읽기 @Value](https://code.i-harness.com/ko/q/bfe59c)
> * [A Quick Guide to Spring @Value](http://www.baeldung.com/spring-value-annotation)
