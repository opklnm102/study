# Java 9과 Spring 5로 바라보는 Java의 변화와 도전
> [Oracle Code Seoul 2017 - Java 9과 Spring 5로 바라보는 Java의 변화와 도전](https://www.youtube.com/watch?v=BFjrmj4p3_Y)에서 Spring 5.0과 관련된 내용 요약


```java
@Controller
@RequestMapping("/path")
public class MyController extends SuperController implements MyInterface{

    @RequestMapping("/home")
    public String home() {
        return "home";
    }
}

@RequestMapping("/super")
public class SuperController {
}

@RequestMapping("/if")
interface MyInterface extends SuperInterface {
}


@RequestMapping("/superif")
interface SuperInterface {
}
```
* `home()`은 어떤 url에 매핑되나?
* 항상 같은 url로 매핑될까??

> Todo: 이거 어떻게 되는지 확인 및 spring 에서 mapping을 어떻게 하는지 알아보기


## Composed Annotation 과 @AliasFor
* 4.2에서 등장
```java
@RequestMapping(method = RequestMethod.GET)
public @interface GetMapping {

	@AliasFor(annotation = RequestMapping.class)
	String name() default "";

	@AliasFor(annotation = RequestMapping.class)
	String[] value() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] path() default {};

	@AliasFor(annotation = RequestMapping.class)
	String[] params() default {};
```

## 리플렉션과 런타임 바이트코드 생성의 문제
* 성능 저하
* 타입정보 제거
* 디버깅 어려움
* 툴이나 컴파일러에 의한 검증 불가


## 함수형 스타일 프로그래밍이 도입된 Java의 기본으로 돌아간다
```java
@RestController
public class MyController {

    @GetMapping("/hello/{name}")
    public String hello(@PathVariable String name) {
        return "Hello " + name;
    }
}
```
* Annotation과 리플렉션이 없으면 의도한대로 동작하지 않는 코드


### 함수형 스타일의 Java Web 코드로 전환
* Annotation과 리플렉션 제거
* 명시적인 코드로 모든 기능을 표현
   * Annotation으로 두루뭉실하게 표현된 코드를 변경
* 불변객체 사용
* 함수의 조합을 이용
   * 함수의 장점인 함수의 조합을 활용
* 리액티브 스타일 적용


## 스프링 5.0 - 새로운 함수형 스타일 Web 개발 지원
* 서블릿의 의존성 제거
   * 서블릿 컨테이너를 비동기 HTTP 서버로 활용 가능
   * 스프링5를 지원하는 Java HTTP 서버라면 동작 가능
* 새로운 HTTP 요청과 응답의 추상화 - 불변 객체
   * `ServerRequest`
   * `ServerResponse`
* 2개의 함수를 이용해 개발
   * `HandlerFunction`
   * `RouterFunction`
* `Mono<T>`, `Flux<T>` 리액티브 방식


### 함수형 스타일 애플리케이션
* 독립형 애플리케이션
   * DI를 쓰지 않고도 작성 가능
* 스프링 컨테이너 이용


### Web Handler(Controller)가 Web 요청을 처리하는 방식
* 요청 매핑
* 요청 바인딩
    정보를 로직에서 사용할 수 있도록 헤더, 바디, url params등을 처리
* 핸들러 실행
* 핸들러 결과 처리(응답 생성)


### HandlerFunction
```java
@FunctionalInterface
public interface HandlerFunction<T extends ServerResponse> {
    Mono<T> handle(ServerRequest request);
}
```
* 요청 바인딩
* 핸들러 실행
* 핸들러 결과 처리(응답 생성)

```java
// before
@RestController
public class MyController {

    @GetMapping("/hello/{name}")
    public String hello(@PathVariable String name) {
        return "Hello " + name;
    }
}

// after
HandlerFunction helloHandler = (ServerRequest req) -> {
    String name = req.pathVariable("name");  // 웹 요청 바인딩, Annotation + 관례 -> 명시적 코드
    
    // handler(controller) 로직
    // 핸들러 결과를 웹 응답으로, 리턴값 처리 관례와 프레임워크 내부 전략을 명시적인 코드로
    return ServerResponse.ok().syncBody("Hello " + name);
}
```
* Annotation, 리플렉션 사용하지 않음
* 웹 요청을 처리하는 모든 작업을, 동작하는 자바코드로 표현
* 람다식으로 작성 가능
* 독립적인 단위 테스트 가능
* 자유로운 확장, 추상화 가능


### RouterFunction
```java
@FunctionalInterface
public interface RouterFunction<T extends ServerResponse> {
    Mono<HandlerFunction<T>> route(ServerRequest request);
}
```
* 요청 매핑

```java
// 매핑 조건 확인 -> handler 리턴
RouterFunction router = req -> RequestPredicates.path("/hello/{name}").test(req) ? Mono.just(helloHandler) : Mono.empty();
```
* 함수로 `@RequestMapping`에 대응되는 요청 매핑 기능 표현
* 독립적인 단위 테스트 가능
* 자유로운 확장, 추상화 가능


### 함수형 Web Application 구성요소
* 핸들러 함수
* 라우터 함수
* HTTP 서버
* DI 컨테이너
   * 포함시 스프링 컨테이너 Application이 된다

```java
public static void main(String[] args) throws Exception {
    // 핸들러 함수
    HandlerFunction helloHandler = (ServerRequest req) -> {
        String name = req.pathVariable("name");
        return ServerResponse.ok().syncBody("Hello " + name);
    };

    // 라우터 함수
    RouterFunction router = req -> RequestPredicates.path("/hello/{name}").test(req) ? Mono.just(helloHandler) : Mono.empty();

    // 핸들러 + 라우터 패키징
    HttpHandler httpHandler = RouterFunction.toHttpHandler(router);

    // HTTP 서버 구동
    ReactorHttpHandlerAdapter adapter = new ReactorHttpHandlerAdapter(httpHandler);
    HttpServer server = HttpServer.create("localhost", 8080);
    server.newHandler(adapter).block();

    System.in.read();
}
```


### 함수형 웹 개발
* 간결한 코드
```java
// before
HandlerFunction helloHandler = (ServerRequest req) -> {
    String name = req.pathVariable("name");
    return ServerResponse.ok().syncBody("Hello " + name);
}

// after
HandlerFunction helloHandler = req -> ok().syncBody("Hello " + req.pathVariable("name"));


// before
RouterFunction router = req -> RequestPredicates.path("/hello/{name}").test(req) ? Mono.just(helloHandler) : Mono.empty();

// after
RouterFunction router = route(path("/hello/{name}"), helloHandler);


// before
HandlerFunction helloHandler = (ServerRequest req) -> {
    String name = req.pathVariable("name");
    return ServerResponse.ok().syncBody("Hello " + name);
};

RouterFunction router = req -> RequestPredicates.path("/hello/{name}").test(req) ? Mono.just(helloHandler) : Mono.empty();

HttpHandler httpHandler = RouterFunction.toHttpHandler(router);

ReactorHttpHandlerAdapter adapter = new ReactorHttpHandlerAdapter(httpHandler);
HttpServer server = HttpServer.create("localhost", 8080);
server.newHandler(adapter).block();


// after
httpServer
    .create("localhost", 8080)
    .newhandler(new ReactorHttpHandlerAdapter(toHttpHandler(route(path("/hello/{name}"), req -> ServerResponse.ok().syncBody("Hello " + req.pathVariable("name")))))).subscribe();
```

* 메소드 레퍼런스
   * `람다식 - 메소드` 상호 호환
   * 핸들러를 람다식 대신 메소드로 작성할 수 있음
   * 기능 종류에 따라 `클래스 - 메소드`로 구현

```java
// 메소드 형태로 재작성된 핸들러, 라우터 함수
Mono<ServerResponse> helloHandler(ServerRequest req) {
    String name = req.pathVariable("name:");
    return ServerResponse.ok().syncBody("Hello " + name);
}

Mono<HandlerFunction<ServerResponse>> router(ServerRequest req) {
    return requestPredicates.path("/hello/{name}").test(req) ? Mono.just(this::helloHandler) : Mono.empty();
}

void run() throws IOException {
    HttpHandler httpHandler = RouterFunctions.toHttpHandler(this::router);
}
```


## 함수형 웹 개발
* 함수의 조합
* 함수를 파라미터로, 리턴 타입으로
* 고차 함수


### RouterFunction의 매핑 조건의 중복
* 타입 레벨의 `@RequestMapping`처럼 공통의 조건을 정의
* `RouterFunction.nest()`
* 상위 공통 매핑 조건을 하위 매핑에 적용
* 추상화된 매핑 패턴을 손쉽게 작성하고 재사용 가능
* HTTP API를 위한 CRUD 매핑 함수 조합
```java
public RouterFunction<HandlerFunction<ServerResponse>> route() {
    return nest(pathPrefix("/person"),
    nest(accept(APPLICATION_JSON),
    route(GET("{id}"), handler::getPerson)
    .andRoute(method(HttpMethod.GET), handler::listPeople)
    )
    .andRoute(POST("/").and(contentType(APPLICATION_JSON)), handler::createPerson));
}

// 핸들러를 메소드로 모아 놓은 클래스
public class PersonHandler {
    private final PersonRepository repository;
    
    public PersonHandler(PersonRepository repository) {
        this.repository = repository;
    }

    public Mono<ServerResponse> getPerson(ServerRqeust request) {
        int personId = Integer.valueOf(request.pathVariable("id"));
        Mono<Person> personMono = this.repository.getPerson(personId);
        return personMono.flatMap(person ->
        ServerResponse.ok().contentType(APPLICATION_JSON).body(fromObject(person))).switchEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> savePerson(ServerRequest request {
        Mono<Person> person = request.bodyToMono(Person.class);
        return ServerResponse.ok().build(this.repository.savePerson(person));
    }
}

// 핸들러 메소드 레퍼런스를 이용하는 라우터
public RouterFunction<ServerResponse> routerFunction(PersonHandler handler) {
    return nest(path("/person"),
    nest(accept(APPLICATION_JSON),
    route(GET("/{id}"), handler::getPerson)
    .andRoute(method(HttpMethod.GET), handler::allPeople)
    ).andRoute(POST("/").and(contentType(APPLICATION_JSON)), handler::savePerson));
}
```


### Mono
* ReactiveStreams의 Publisher 타입
* 웹 요청, 웹 응답, 핸들러, 라우터 등의 모든 함수에 적용


### Mono/Flux
* 정보를 전달할 때 컨테이너 사용
   * Mono - 단일 오브젝트
   * Flux - 스트림 오브젝트
* 데이터 가공, 변환, 조합을 위한 다양한 연산 제공
* 스케줄러를 이용해 비동기 작업 수행
* 지연 연산, 자유로운 조합
* 스프링 함수형 웹 개발의 모든 기능이 Mono/Flux 기반으로 재개발
* 리액티브 프로그래밍 기반
   * ProjectReactor
   * RxJava
* 함수형 웹 개발 외의 전 계층에 적용 가능
   * 서비스, 리포지토리, API 호출
   * 대부분의 스프링 서브 프로젝트에 적용 중
* 비동기 논블록킹 방식으로 동작하는 고성능 코드
* 함수형 스타일의 코드 


```java
public interface PersonRepository {
    Mono<Person> getPerson(int id);
    Flux<Person> allPeople();
    Mono<Void> savePeople(Mono<Person> person);
}

public Mono<ServerResponse> savePerson(ServerRequest request) {
    Mono<Person> person = request.bodyToMono(Person.class);
    return ServerResponse.ok().build(this.repository.savePerson(person));
}

public Mono<ServerResponse> allPeople(ServerRequest request) {
    Flux<Person> people = this.repository.allPeople();
    return ServerResponse.ok().contentType(APPLICATION_JSON).body(people, Person.class);
}

public Mono<ServerResponse> getPerson(ServerRequest request) {
    int personId = Integer.valueOf(request.pathVariable("id"));
    Mono<Person> personMono = this.repository.getPerson(personId);
    return personMono
    .flatMap(person -> ServerResponse.ok().contentType(APPLICATION_JSON).body(fromObject(person)))
    .switchIfEmpty(ServerResponse.notFound().build());
}

Mono<String> service() {
    return WebClient.create("http://localhost/service")
    .get()
    .uri("/hello/{name}", "Spring")
    .accept(MediaType.TEXT_PLAIN)
    .exchange()
    .flatMap(r -> r.bodyToMono(String.class))
    .map(d -> d.toUpperCase())
    .flatMap(d -> helloRepository.save(d));
}
```


### JavaSE 9 - Flow API와 ReactiveStreams
* Flow API는 ReactiveStreams 표준과 호환
* 스프링 Mono/Flux - Java9의 Flow API를 함께 사용해서 개발 가능
* Java 9의 Flow API가 많은 기술의 브릿지 역할을 담당
* Spring 5.0 required Java 8


## Spring 5 함수형 웹 개발은 다양한 방식으로 가능
* 순수 함수형 독립형
* 순수 함수형 애플리케이션 코드 + 자바설정(@)
* 하이브리드 함수형 애플리케이션 코드(@)
