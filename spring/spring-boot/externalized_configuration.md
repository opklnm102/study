# [Spring Boot] Externalized configuration
> date - 2018.11.12  
> keyword - spring boot, environment variable  
> 환경변수를 사용해서 embbedded tomcat의 max threads를 늘리기 위해 삽질했던 경험 정리

<br>

* OS의 환경변수를 사용하면 소스 코드의 변경 없이 restart만으로 property를 적용할 수 있다
* 환경 변수를 이용해 embbedded tomcat의 max threads를 늘려보고 싶었음

```yaml
server.tomcat.max-threads=
```
* [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)를 보면 `.`은 `_`로 나타낼 수 있다고 함
  * SERVER_TOMCAT_MAX... 근데 `-`는 어떻게 해야하는걸까에 막막해졌다
  * 그래서 시도..!

<br>

## Sample Code
```java
@RestController
@Slf4j
public class TestController {

    @Autowired
    private ApplicationContext applicationContext;

    @Value("${server.tomcat.max-threads:200}")
    private int maxThreads;

    @Autowired
    private Environment environment;

    @GetMapping(path = "/test")
    public void test() {
        log.info("{}", environment.getProperty("SERVER_TOMCAT_MAX_THREADS"));
        log.info("{}", maxThreads);

        ServerProperties properties = applicationContext.getBean(ServerProperties.class);
        log.info("{}", properties.getTomcat().getMaxThreads());
    }
}
```

```sh
# 환경변수로 등록
export SERVER_TOMCAT_MAX_THREADS=1000
```


## command line argument 없이 실행
* 환경변수를 읽어 적용한다
```sh
$ java -jar build/libs/think-lotto-0.0.1-SNAPSHOT.jar

2018-11-11 23:38:50.264 INFO 11213 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
2018-11-11 23:38:50.265 INFO 11213 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
2018-11-11 23:38:50.265 INFO 11213 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
```

## command line argument로 대문자를 입력
* 적용 안된다
```sh
$ java -jar build/libs/think-lotto-0.0.1-SNAPSHOT.jar --SERVER_TOMCAT_MAX_THREADS=900

2018-11-11 23:38:50.264 INFO 11213 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
2018-11-11 23:37:57.851 INFO 11115 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
2018-11-11 23:37:57.852 INFO 11115 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
```

## command line argument로 application.properties처럼 입력
* 적용된다
```sh
$ java -jar build/libs/think-lotto-0.0.1-SNAPSHOT.jar --server.tomcat.max-threads=900

2018-11-11 23:38:50.264 INFO 11213 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 1000
2018-11-11 23:37:57.851 INFO 11115 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 900
2018-11-11 23:37:57.852 INFO 11115 --- [nio-8070-exec-1] me.dong.thinklotto.TestController        : 900
```


```
...
4. Command line arguments.
...
10. OS environment variables.
...
```
Command line arguments의 우선순위가 높아 낮은 것은 무시됨을 알 수 있다

<br>

> #### Reference
> * [24. Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)
