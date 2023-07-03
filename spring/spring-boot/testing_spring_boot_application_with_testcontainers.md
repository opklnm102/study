# [Spring Boot] Testing Spring Boot application with testcontainers
> date - 2023.06.28  
> keyworkd - test, container, spring  
> testcontainer로 Spring Boot Application의 test 환경을 구축하는 방법에 대해 정리  

<br>

## DB 등의 dependency를 실행하는 방법들
* Local DB
  * 개발자마다 설치 필요
* Server DB
  * 멱등성이 보장되지 않을 수 있다(데이터가 깨지거나 test 후 garbage data가 쌓일 수 있다)
* Container
  * Dockerfile, docker-compose 파일 관리 필요
  * container start, stop 관리 필요
  * container port 관리 필요
* Mocking
  * dependency와의 상호작용을 제외하고 순수한 로직만 test
  * test code는 쉽게 구현되지만 실제 연동에 대한 test가 제외된다
  * Spy - given에서 선언한 코드 외에는 전부 실제의 것을 사용
  * Mock - 껍데기만 있는 객체로, 내부 구현 부분은 사용자에게 위임

test 수행시 code로 dependency에 대한 container를 실행할 수 있는 [Testcontainers](https://testcontainers.com)로 보다 쉽게 test 환경에 대한 멱등성을 보장할 수 있다


<br>

## [Testcontainers](https://testcontainers.com)?
* Test dependencies as code, code로 container를 동작시킬 수 있다
* Java, Go, Node.js, Python 등 다양한 언어 지원
* Dockerfile, docker-compose로 container를 동작시킬 수 있다
* test 전/후로 container start/stop 가능
* parallel test 지원
* 다양한 [module](https://testcontainers.com/modules) 지원
  * MySQL
  * PostgreSQL
  * Neo4j
  * CockroachDB
  * Pulsar
  * Kafka
  * Redis
  * ...


<br>

## Requirement
* docker가 없으면 아래 처럼 error 발생
```java
Could not find a valid Docker environment. Please see logs and check configuration
...
```
* [Docker for Mac](https://docs.docker.com/desktop/install/mac-install) or [Rancher Desktop](https://rancherdesktop.io)을 설치해서 docker를 이용하자
* 설치 후에도 error가 발생한다면 아래 명령어를 실행해보자
```sh
$ sudo ln -s $HOME/.docker/run/docker.sock /var/run/docker.sock

$ sudo ln -s $HOME/.rd/docker.sock /var/run/docker.sock
```


<br>

## Usage

### Redis testing
#### dependency
```gradle
implementation 'org.springframework.boot:spring-boot-starter-data-redis'

testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.testcontainers:testcontainers'  // junit-jupiter만 추가해도 따라온다
testImplementation 'org.testcontainers:junit-jupiter'
```
* testcontainers의 버전은 Spring Boot에서 관리되기 때문에 버전 명시를 할 필요가 없으며 버전 정보는 [여기](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#appendix.dependency-versions.coordinates)에서 확인할 수 있다
* Spring Boot 3.1.1에서는 testcontainers 1.18.3

#### @DynamicPropertySource 사용
* container의 host, port를 동적으로 설정한다
```java
@SpringBootTest
@Testcontainers
class TestServiceTest {

    @Container
    static GenericContainer<?> REDIS = new GenericContainer<>(DockerImageName.parse("redis:7.0-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void dynamicProperty(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", REDIS::getFirstMappedPort);
    }

    @Autowired
    private TestService sut;

    @Test
    public void test() {
        sut.test();
    }
}
```
* static으로 선언하면 test class 마다 container를 사용한다
* `@DynamicPropertySource`는 static으로만 사용 가능하며 dynamic configuration이 필요한 곳에 사용할 수 있다

#### Test Fixtures
* fixtures configuration과 test code를 분리하는 버전
```java
@SpringBootTest
@ExtendWith(RedisExtension.class)
@DirtiesContext
class TestServiceTest {

    @Autowired
    private TestService sut;

    @Test
    public void test() {
        sut.test();
    }
}
```
* `@DirtiesContext`를 사용해 application context를 재생성하여 application과 DB를 격리된 상태로 만든다
* `@ExtendWith(XXX.class)`만 추가하면 재사용 가능
```java
class RedisExtension implements BeforeAllCallback, AfterAllCallback {

    private GenericContainer<?> redis;

    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        redis = new GenericContainer<>(DockerImageName.parse("redis:7.0-alpine"))
                .withExposedPorts(6379);
        redis.start();

        System.setProperty("spring.data.redis.host", redis.getHost());
        System.setProperty("spring.data.redis.port", String.valueOf(redis.getFirstMappedPort()));
    }

    @Override
    public void afterAll(ExtensionContext context) throws Exception {
        // do nothing, Testcontainers handles container shutdown
    }
}
```

<br>

### Real DB JPA testing
* dependency
```gradle
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
runtimeOnly 'com.mysql:mysql-connector-j'

testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.testcontainers:junit-jupiter'
testImplementation 'org.testcontainers:mysql'
```

```java
@DataJpaTest
@Testcontainers
@TestPropertySource(properties = {
        "spring.test.database.replace=none"
})
@ActiveProfiles("test")
@Import(JpaConfiguration.class)
class PrivilegeRepositoryTest {

    @Container
    static MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withUsername("root")
            .withPassword("password")
            .withInitScript("data/init.sql");

    @DynamicPropertySource
    static void dynamicProperty(DynamicPropertyRegistry registry) {
        registry.add("DB_HOST", MYSQL::getHost);
        registry.add("DB_PORT", MYSQL::getFirstMappedPort);
    }

    @Autowired
    private PrivilegeRepository sut;

    @Test
    @Sql("classpath:/data/test/seed-data.sql")
    void testGetAllPrivileges() {

        // when
        var result = sut.findAll();

        // then
        assertThat(result.size()).isEqualTo(4);
    }

    @Test
    void testSavePrivileges() {
        // given
        var privilegeName = "READ_PRIVILEGE";

        // when
        var result = sut.save(new Privilege(privilegeName));

        // then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(privilegeName);
    }
}
```
```java
@Configuration
@EnableJpaAuditing
public class JpaConfiguration {
}
```

<br>

### Kafka testing
* dependency
```gradle
implementation 'org.springframework.kafka:spring-kafka'

testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.kafka:spring-kafka-test'
testImplementation 'org.testcontainers:kafka'
```

* KafkaProducer
```java
@Component
@Slf4j
public class KafkaProducer {

  private final KafkaTemplate<String, String> kafkaTemplate;

  public KafkaProducer(KafkaTemplate<String, String> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  public void send(String topic, String payload) {
    kafkaTemplate.send(topic, payload);
    log.info("Message: " + payload + " sent to topic: " + topic);
  }
}
```
* KafkaConsumer
```java
@Component
@Slf4j
public class KafkaConsumer {

  private CountDownLatch latch;
  private String payload;

  public KafkaConsumer() {
    resetLatch();
  }

  @KafkaListener(topics = "test")
  public void receiveTestTopics(ConsumerRecord<String, String> consumerRecord) {
    log.info("Receiver on topic : " + consumerRecord.toString());
    payload = consumerRecord.toString();
    latch.countDown();
  }

  public void resetLatch() {
    latch = new CountDownLatch(1);
  }

  public CountDownLatch getLatch() {
    return latch;
  }

  public String getPayload() {
    return payload;
  }
}
```
* KafkaExtension
```java
class KafkaExtension implements BeforeAllCallback, AfterAllCallback {

  private KafkaContainer kafka;

  @Override
  public void beforeAll(ExtensionContext context) throws Exception {
    kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.3.2"));
    kafka.start();

    System.setProperty("spring.kafka.bootstrap-servers", kafka.getBootstrapServers());  // for Kafka AdminClient
    System.setProperty("spring.kafka.producer.bootstrap-servers", kafka.getBootstrapServers());  // for Kafka producer
    System.setProperty("spring.kafka.consumer.bootstrap-servers", kafka.getBootstrapServers());  // for Kafka consumer
  }

  @Override
  public void afterAll(ExtensionContext context) throws Exception {
    // do nothing, Testcontainers handles container shutdown
  }
}
```
* Test Case
```java
@SpringBootTest
@ExtendWith(KafkaExtension.class)
@DirtiesContext
class SimpleKafkaApplicationTests {

  @Autowired
  private KafkaProducer kafkaProducer;

  @Autowired
  private KafkaConsumer kafkaConsumer;

  @Test
  void test() throws Exception {
    // given
    var data = "sending test message ";

    // when
    kafkaProducer.send("test", data + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

    // then
    var messageConsumed = kafkaConsumer.getLatch().await(20, TimeUnit.SECONDS);

    assertThat(messageConsumed).isTrue();
    assertThat(kafkaConsumer.getPayload()).contains(data);
  }
}
```

<br>

### docker compose + Singleton containers
* Singleton containers를 사용하면 여러 test class에 대해 한번만 시작되는 container를 정의할 수 있다
* 기본 class가 로드될 떄 시작되어 모든 상속 test class에서 사용되고, test가 끝나면 testcontainer core에 의해 시작된 Ryuk container가 singleton container를 중지시킨다
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SimpleTests extends ComposeContainer {

    @Autowired
    private TestRestTemplate rest;

    @Test
    void login() {
        // given
        var userName = "bronze@example.com";
        var password = "1234";

        // when
        var result = rest.withBasicAuth(userName, password)
                .getForObject("/user", UserDto.class);

        // then
        assertThat(result.username()).isEqualTo(userName);
    }
}
```
* [Singleton containers](https://java.testcontainers.org/test_framework_integration/manual_lifecycle_control/#singleton-containers)
```java
@Testcontainers
@ActiveProfiles("test")  // optional
public abstract class ComposeContainer {

    // shared container - shared between test modules
    @Container
    private static final DockerComposeContainer<?> CONTAINERS = new DockerComposeContainer<>(new File("docker-compose-test.yml"))
            .withExposedService("mysql_1", 3306, Wait.forListeningPort());

    @DynamicPropertySource
    static void dbProperties(DynamicPropertyRegistry registry) {
        registry.add("DB_HOST", () -> CONTAINERS.getServiceHost("mysql_1", 3306));
        registry.add("DB_PORT", () -> CONTAINERS.getServicePort("mysql_1", 3306));
    }
}
```

* application.yaml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/my_db
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 5
    type: com.zaxxer.hikari.HikariDataSource
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: off
    database-platform: org.hibernate.dialect.MySQLDialect
  profiles:
    group:
      test: test-server
---
spring:
  config:
    activate:
      on-profile: test
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/my_db
```

* docker-compose.yml
```yaml
version: '3'

services:
  mysql:
    image: mysql:8.0
    volumes:
      - ./data:/docker-entrypoint-initdb.d/
    environment:
      MYSQL_ROOT_PASSWORD: password
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
```


<br><br>

> #### Reference
> * [Testcontainers](https://testcontainers.com)
> * [General Docker requirements - Testcontainers for Java](https://java.testcontainers.org/supported_docker_environment)
> * [Test Container test cases are failing due to "Could not find a valid Docker environment"](https://stackoverflow.com/questions/61108655/test-container-test-cases-are-failing-due-to-could-not-find-a-valid-docker-envi)
> * [Guide to @DynamicPropertySource in Spring](https://www.baeldung.com/spring-dynamicpropertysource)
> * [Singleton containers - Manual container lifecycle control](https://java.testcontainers.org/test_framework_integration/manual_lifecycle_control/#singleton-containers)
> * [The simplest way to replace H2 with a real database for testing](https://testcontainers.com/guides/replace-h2-with-real-database-for-testing/)
> * [Docker Compose Module](https://java.testcontainers.org/modules/docker_compose)
