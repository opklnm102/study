# [Spring Data Redis] How to use Distributed Lock with Redisson
> date - 2023.06.06  
> keyworkd - spring data redis, redisson, distributed lock  
> 동시성 제어를 위해 redisson을 이용해 distributed lock을 구현하는 방법을 정리

<br>

## Distributed lock?
* 서로 다른 프로세스가 상호 배타적인 방식으로 공유 리소스를 사용해야하는 많은 환경에서 유용한 기본 요소
* 수강 신청, 티켓팅 등의 재고 관리 시스템에서 동시성 제어 필요시 사용


<br>

## [Redisson](https://github.com/redisson/redisson)
* [Netty](https://netty.io) 기반의 async, lock-free Java Redis client
* [Lettuce](https://lettuce.io)처럼 Netty를 사용해서 non blocking I/O 제공
* Redlock 알고리즘으로 DLM(Distributed Lock Manager) 구현
  * 오직 한순간에 하나의 작업자만 lock을 획득할 수 있다
  * 알 수 없는 이유로 lock을 해제하지 못했을 경우라도 다른 작업자가 lock을 획득할 수 있어야한다
  * Redis node가 동작하는한 모든 작업자는 lock을 획득하고 해제할 수 있어야한다
* `RLock`으로 pub/sub 기반 distributed lock 제공
  * pub/sub 방식으로 lock 해제시 subscribe 중인 client들에게 메시지를 보내 lock 획득을 시도시킨다
  * Lua script로 lock에 사용되는 연산의 atomic 보장
* [Caffeine](https://github.com/ben-manes/caffeine) 기반의 local cache도 지원
* Lettuce는 Redis command를 바로 사용할 수 있지만 Redisson은 [Redis commands mapping](https://github.com/redisson/redisson/wiki/11.-Redis-commands-mapping)에 따라 RBucket(SET), RList(RPUSH), RQueue(LPUSH), RMap(HSET) 같은 data type을 사용해야하는 단점이 있다
  
<br>

### Lock acquire process
1. `tryLock`으로 lock 획득시 `true` 반환하여 경합이 없을 때 overhead 없이 lock을 획득
2. pub/sub을 이용해 대기하다가 메시지가 오면 lock 획득 시도, waitTime에 도달할 때까지 반복
3. waitTime을 초과하면 `false`를 반환하여 lock 획득 실패를 알린다

<br>

### Lock acquire atomic process
* Lua script로 lock acquire process의 atomic 보장
RedissonLock의 tryLockInnerAsync를 보면 Lua script로 TTL 정의
```java
public class RedissonLock extends RedissonBaseLock {

  <T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    return commandExecutor.syncedEval(getRawName(), LongCodec.INSTANCE, command,
                "if ((redis.call('exists', KEYS[1]) == 0) " +
                            "or (redis.call('hexists', KEYS[1], ARGV[2]) == 1)) then " +
                        "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                        "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                        "return nil; " +
                    "end; " +
                    "return redis.call('pttl', KEYS[1]);",
                Collections.singletonList(getRawName()), unit.toMillis(leaseTime), getLockName(threadId));
  }
```
* `hincrby` - key가 없으면 increment 값을 설정
* `pexpire` - key의 만료 시간 설정


<br>

## Usage

### Dependency
* build.gradle
```gradle
plugins {
    id 'org.springframework.boot' version '3.1.0'
    ...
}

dependencies {
    // 3.22.0는 redisson-spring-data-31이 포함되어 있으므로 spring boot 3.1에서 사용 가능
    implementation 'org.redisson:redisson-spring-boot-starter:3.22.0'
}
```

* Spring Boot version에 따라 호환성에 맞게 설정해야한다

| redisson-spring-data | Spring Boot |
|:--|:--|
| redisson-spring-data-27 | Spring Data Redis v.2.7 |
| redisson-spring-data-30 | Spring Data Redis v.3.0 |
| redisson-spring-data-31 | Spring Data Redis v.3.1 |

```gradle
plugins {
    id 'org.springframework.boot' version '3.0.7'
    ...
}

dependencies {
    implementation ("org.redisson:redisson-spring-boot-starter:3.22.0") {
        exclude group: 'org.redisson', module: 'redisson-spring-data-31'
    }
    implementation "org.redisson:redisson-spring-data-30:3.22.0"
}
```

* redisson-spring-boot-starter의 `RedissonAutoConfiguration`에 의해 redisson-spring-data의 `RedissonConnectionFactory`, `RedissonClient`가 생성되기 때문에 이후 별도의 설정은 필요 없다
```java
@Configuration
@ConditionalOnClass({Redisson.class, RedisOperations.class})
@AutoConfigureBefore(RedisAutoConfiguration.class)
@EnableConfigurationProperties({RedissonProperties.class, RedisProperties.class})
public class RedissonAutoConfiguration {
  
  @Bean
  @ConditionalOnMissingBean(RedisConnectionFactory.class)
  public RedissonConnectionFactory redissonConnectionFactory(RedissonClient redisson) {
    return new RedissonConnectionFactory(redisson);
  }
  ...
  
  @Bean(destroyMethod = "shutdown")
  @ConditionalOnMissingBean(RedissonClient.class)
  public RedissonClient redisson() throws IOException {
    ...
  }
```

<br>

### Sample code
* 전체 코드는 [여기](https://github.com/opklnm102/spring-data-sample/tree/main/data-redisson)에서 확인
```java
@Service
@Slf4j
public class StockService {

    private final RedissonClient redissonClient;

    public StockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public void decrease(String id, int count) {
        var lock = redissonClient.getLock(id + ":lock");

        try {
            if (!lock.tryLock(5, 3, TimeUnit.SECONDS)) {
                log.info("acquire lock fail");
                return;
            }

            decreaseStock(id, count);
        } catch (InterruptedException e) {
            log.info("acquire lock fail");
        } finally {
            lock.unlock();
        }
    }

    public int currentStock(String id) {
        return redissonClient.<Integer>getBucket(id).get();
    }

    private void decreaseStock(String id, int quantity) {
        var stock = currentStock(id);
        if (stock <= 0) {
            log.info("No stock {}", stock);
            return;
        }

        log.info("Stock {} - {} = {}", stock, quantity, stock - quantity);
        setStock(id, stock - quantity);
    }

    public void setStock(String id, int quantity) {
        redissonClient.<Integer>getBucket(id).set(quantity);
    }
}
```


<br><br>

> #### Reference
> * [Redisson - Easy Redis Java client with features of an in-memory data grid](https://github.com/redisson/redisson)
> * [Spring Boot Starter - Redisson](https://github.com/redisson/redisson/tree/master/redisson-spring-boot-starter)
> * [Spring Data Redis integration - Redisson](https://github.com/redisson/redisson/tree/master/redisson-spring-data)
> * [Distributed Locks with Redis](https://redis.io/docs/manual/patterns/distributed-locks)
> * [How to Boost Redis With Local Caching in Java](https://dzone.com/articles/how-to-boost-redis-with-local-caching-in-java)
> * [14.2.1 Spring Cache. Local cache and data partitioning](https://github.com/redisson/redisson/wiki/14.-Integration-with-frameworks/#1421-spring-cache-local-cache-and-data-partitioning)
> * [레디스와 분산 락(1/2) - 레디스를 활용한 분산 락과 안전하고 빠른 락의 구현](https://hyperconnect.github.io/2019/11/15/redis-distributed-lock-1.html)
> * [HINCRBY](http://redisgate.kr/redis/command/hincrby.php)
> * [PEXPIRE](http://redisgate.kr/redis/command/pexpire.php)
