# Spring Cloud Redis Cache 사용시 java.lang.IllegalArgumentException: Cannot find cache named 이슈
> Spring Cloud dependency가 있는 환경에서 Redis에 @Cacheable로 Spring cache를 사용하려고 할 때 만난 이슈와 해결 방법을 정리한다

## Project Code

### Dependency
```gradle
compile 'org.springframework.boot:spring-boot-starter-web'
compile 'org.springframework.boot:spring-boot-starter-data-redis'
compile group: 'org.springframework.cloud', name: 'spring-cloud-aws-autoconfigure', version: '1.1.3.RELEASE'
```

### Redis 설정
```java
@Configuration
public class RedisConfiguration {

    @Value("${redis.host}")
    private String redisHost;

    @Value("${redis.port}")
    private int redisPort;

    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        JedisConnectionFactory factory = new JedisConnectionFactory();
        factory.setHostName(redisHost);
        factory.setPort(redisPort);
        factory.setUsePool(true);
        return factory;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        final RedisTemplate<String, Object > template =  new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericToStringSerializer<>(Object.class));
        template.setValueSerializer(new GenericToStringSerializer<>(Object.class));
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager() {
        return new RedisCacheManager(redisTemplate());
    }
}
```

### Cache
```java
public interface BookRepository {

    public abstract Book getByIsbn(String isbn);

    public abstract void setByIsbn(String isbn);
}

@Component
@CacheConfig(cacheNames = "books")
@Slf4j
public class SimpleBookRepository implements BookRepository {

    @Cacheable(value = "books", key = "#isbn")
    @Override
    public Book getByIsbn(String isbn) {
        long start = System.currentTimeMillis();
        simulateSlowService();
        long end = System.currentTimeMillis();

        log.info("수행시간 {}", end - start);

        return new Book(isbn, "Some Book");
    }

    @CacheEvict(value = "books", key = "#isbn")
    public void setByIsbn(String isbn) {
        log.info("{}", isbn);
    }

    private void simulateSlowService() {
        try {
            long time = 3000L;
            Thread.sleep(time);
        } catch (InterruptedException e) {
            throw new IllegalStateException(e);
        }
    }
}
```

### Application
```java
@SpringBootApplication
@EnableCaching
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
```

## 문제점
* Proxy가 `@Cacheable`을 동작하여 Redis에 캐싱하려고 할 때 아래의 Exception이 발생
```
java.lang.IllegalArgumentException: Cannot find cache named 'books' for Builder[public java.lang.String com.example.SimpleBookRepository.getByIsbn(java.lang.Long)] caches=[mission:bundle] | key='#isbn' | keyGenerator='' | cacheManager='' | cacheResolver='' | condition='' | unless='' | sync='false'
	at org.springframework.cache.interceptor.AbstractCacheResolver.resolveCaches(AbstractCacheResolver.java:81)
	at org.springframework.cache.interceptor.CacheAspectSupport.getCaches(CacheAspectSupport.java:242)
	at org.springframework.cache.interceptor.CacheAspectSupport$CacheOperationContext.<init>(CacheAspectSupport.java:675)
	at org.springframework.cache.interceptor.CacheAspectSupport.getOperationContext(CacheAspectSupport.java:255)
	at org.springframework.cache.interceptor.CacheAspectSupport$CacheOperationContexts.<init>(CacheAspectSupport.java:581)
	at org.springframework.cache.interceptor.CacheAspectSupport.execute(CacheAspectSupport.java:327)
	at org.springframework.cache.interceptor.CacheInterceptor.invoke(CacheInterceptor.java:61)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)ㅍ
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:655)
	at io.tbal.promotion.manager.MissionBundleManagerImpl$$EnhancerBySpringCGLIB$$9c635616.readMissionBundle(<generated>)
    ...
```

## 해결 방법
* `ElastiCacheAutoConfiguration.class`를 exclude 한다
```java
@SpringBootApplication(exclude = ElastiCacheAutoConfiguration.class)
@EnableCaching
```

> #### 참고 자료
> * [Cannot find cache named '' for CacheableOperation[] caches](https://stackoverflow.com/questions/28020245/cannot-find-cache-named-for-cacheableoperation-caches)
