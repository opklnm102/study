# [Spring] Disable @Schedule on Spring Boot IntegrationTest
> Spring Boot에서 IntegrationTest시에 원하지 않는 schedule task를 동작하지 않는 방법을 정리

## Schedule Configuration Setting
* Component 구성 단계에서 `@EnableScheduling`와 `@Scheduled`를 같은 Class에 두면 `@ConditionalOnProperty`가 무시되기 때문에 같은 Class에 두지 않는다
   
```java
@Configuration
@EnableScheduling
public class ScheduleConfiguration {
}
```

```java
@Component
@ConditionalOnProperty(value = "scheduling.enable", havingValue = "true", matchIfMissing = false)
@Slf4j
public class ScheduleTask {

    @Scheduled(fixedDelay = 1000L)
    public void scheduledTask() {
        log.info("scheduledTask");
    }
}
```

## Schedule Task not working
* test 환경에서 `scheduling.enable` 값이 없거나, false라면 ScheduleTask가 실행되지 않는다
```java
@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles(profiles = "test")
@TestPropertySource(properties = "scheduling.enable:false")  // 해당 라인이 없거나, 값이 false면 ScheduleTask 동작 X
public class FeedgetApiApplicationTests {
    
    @Test
    public void contextLoads() {
    }
}
```

## Schedule Task working
```java
@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles(profiles = "test")
@TestPropertySource(properties = "scheduling.enable:true")
public class FeedgetApiApplicationTests {

    @Test
    public void contextLoads() {
    }
}
```

> #### 참고
> [Disable @Schedule on Spring Boot IntegrationTest](https://stackoverflow.com/questions/40684903/disable-schedule-on-spring-boot-integrationtest/46783392#46783392)
