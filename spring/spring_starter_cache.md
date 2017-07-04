# Spring Boot Start Cache

## Cache 사용을 고려해볼 상황
* 동일한 결과를 반복적으로 조회
* 작업의 시간이 오래 걸리거나 서버에 부담을 주는 경우(DB I/O)

## Spring Cache
* 메소드에 캐싱을 적용하여, 메소드의 실행 횟수를 줄여준다
* 비용이 큰 메소드는 해당 파라미터로 다시 실행하지 않고도 결과를 재사용할 수 있다
* 같은 input에 같은 output을 보장하는 메소드에서만 동작

> ### 고려할 것 
> * 캐싱 선언 - 캐시되어야 하는 메소드와 정책을 정한다
> * 캐시 구성 - 데이터를 저장하고 읽을 기반 캐시

### @Cacheable
* 캐시할 수 있는 메소드 지정
* 해당 메소드의 `결과`를 캐시에 저장하라는 의미

### @CachePut
* 메소드 실행에 영향을 주지 않고 캐시를 갱신
* 메소드를 `항상 실행`하고 결과를 캐싱

> #### @Cacheable vs @CachePut
> * 서로 동작이 다르므로 같이 사용하지 말 것  
> * @Cacheable은 캐시를 사용해 메소드 `실행을 건너뛰고`, @CachePut은 캐시 갱신을 위해 `실행을 강제`

### @CacheEvict
* 캐시 `제거`
* 트리거로 동작
* `allEntries` - 한 지역의 전체 캐시를 지워야할 경우 편리
* void 메소드에 사용 가능

### @Caching
* `@CacheEvict`, `@CachePut`를 조건이나 표현식에 따라 여러개 지정할 경우(조건마다 캐시가 다른 경우)
```java
@Caching(evict = {@CacheEvict("primary"), @CacheEvict(value="secondary", key="#p0")}) 
public Book importBooks(String deposit, Date date){}
```

## Example
### dependency
```gradle
compile('org.springframework.boot:spring-boot-starter-data-redis')  // dependency에 추가하면 redis를 캐시 스토리지로 사용할 수 있다. 없으면  ConcurrentHashMap 사용
compile('org.springframework.boot:spring-boot-starter-cache')
compileOnly('org.projectlombok:lombok')
testCompile('org.springframework.boot:spring-boot-starter-test')
```

### Domain 클래스
```java
@Data
public class Book implements Serializable {

    private String isbn;

    private String title;

    public Book(String isbn, String title) {
        this.isbn = isbn;
        this.title = title;
    }
}
```

### Configuration
```java
@Configuration
@EnableCaching  // 캐시 기능 사용
public class CacheConfiguration extends CachingConfigurerSupport {

    private static final Logger LOGGER = LoggerFactory.getLogger(CacheConfiguration.class);

    /**
     * Custom key generator
     *
     * @return custom key
     */
    @Bean
    public KeyGenerator keyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();

            sb.append(target.getClass().getName());
            sb.append(method.getName());

            for (Object param : params) {
                sb.append(param);
            }

            LOGGER.info("{}", sb.toString());

            return sb.toString();
        };
    }
}
```

### Business logic
* interface
```java
public interface BookRepository {
    public abstract Book getByIsbn(String isbn);
    public abstract void setByIsbn(String isbn);
}
```

* implement
```java
@Component
@CacheConfig(cacheNames = "books")
public class SimpleBookRepository {

    @Cacheable(value = "books", key = "#isbn")  // isbn에 따라 별도로 캐시, 다른 인자가 key로 무의미할 경우 사용 가능
    // @Cacheable(value = "books", key="T(SimpleBookRepository).getKey(#isbn)")
    @Override
    public Book getByIsbn(String isbn, boolean active) {
        simulateSlowService();
        return new Book(isbn, "Some Book");
    }

    @CacheEvict(value = "books", key = "#isbn")  // 캐시 내용 지우기
    @Override
    public Book setByIsbn(String isbn) {
        
    }

    private void simulateSlowService() {
        try {
            long time = 3000L;
            Thread.sleep(time);
        } catch (InterruptedException e) {
            throw new IllegalStateException(e);
        }
    }

    private String getKey(String isbn) {
        return String.format("key %s", isbn);
    }
}
```
> #### @Cachable
> * Proxy를 이용하기 때문에 interface를 구현하는 class의 public method에서만 사용 가능
> * self-invocation 불가


### 캐시 동작을 체크하기 위한 클래스
```java
@Component
public class AppRunner implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(AppRunner.class);

    private final BookRepository bookRepository;

    private final CacheManager cacheManager;

    public AppRunner(BookRepository bookRepository, CacheManager cacheManager) {
        this.bookRepository = bookRepository;
        this.cacheManager = cacheManager;
    }

    @Override
    public void run(String... args) throws Exception {
        LOGGER.info("Using cache manager: " + this.cacheManager.getClass().getName() + "\n");
        
        LOGGER.info(".... Fetching books");
        LOGGER.info("isbn-1234 -->" + bookRepository.getByIsbn("isbn-1234"));
        LOGGER.info("isbn-4567 -->" + bookRepository.getByIsbn("isbn-4567"));
        LOGGER.info("isbn-1234 -->" + bookRepository.getByIsbn("isbn-1234"));
        LOGGER.info("isbn-4567 -->" + bookRepository.getByIsbn("isbn-4567"));
        LOGGER.info("isbn-1234 -->" + bookRepository.getByIsbn("isbn-1234"));
        LOGGER.info("isbn-1234 -->" + bookRepository.getByIsbn("isbn-1234"));
    }
}
```

> #### [스프링 부트에서 레디스 캐시 유효시간 설정 기능 추가하기](http://javacan.tistory.com/entry/customize-redis-cache-expire-time-in-boot)  

