# [Spring Data Jpa] DB connection leak issue when using transform in Querydsl
> date - 2023.07.29  
> keyworkd - jpa, hibernate, querydsl  
> spring data jpa + querydsl에서 transform 사용시 발생한 DB connection leak issue에 대해 정리  

<br>

## TL;DR
* Querydsl에서 result handling을 위해 transform() 사용시 transaction 내부에서 실행되지 않는다면 Connection은 connection pool로 반환되지 않는다
* transform()을 사용한다면 **@Transactional 등을 이용해 transaction**을 걸어주거나 **fetch() + Stream API로 대체**하자


<br>

## Issue
* 어느날 특정 Kubernetes Pod의 readinessProbe failed로 인해 접속 불가 현상 발생


<br>

## Why?

### 1. 왜 접속 불가 현상이 발생했을까?
* readinessProbe는 Pod가 traffic을 처리할 수 있는지 확인하는데 사용하므로 application external dependency(MySQL, Redis...)의 health check가 포함되어 있다
* application external dependency에 문제로 인해 readinessProbe failed가 발생하면 외부 traffic이 차단된다

<br>

### 2. 왜 readinessProbe failed가 발생했을까?
* 특정 Pod에서 간헐적으로 `writer-pool - Connection is not available, request timed out after 10000ms`가 발생하며 readinessProbe가 실패했다
```java
Jul 17, 2023 @ 14:08:40.329        writer-pool - Connection is not available, request timed out after 10000ms.
Jul 17, 2023 @ 14:08:40.329        SQL Error: 0, SQLState: null
Jul 17, 2023 @ 14:09:05.625        DataSource health check failed
Jul 17, 2023 @ 14:09:05.626        Health contributor org.springframework.boot.actuate.jdbc.DataSourceHealthIndicator (db/dataSource) took 30067ms to respond
Jul 17, 2023 @ 14:09:06.663        Commencing graceful shutdown. Waiting for active requests to complete
Jul 17, 2023 @ 14:09:15.624        DataSource health check failed
Jul 17, 2023 @ 14:09:16.474        SQL Error: 0, SQLState: null
Jul 17, 2023 @ 14:09:25.625        DataSource health check failed
...
```

<br>

### 3. 왜 writer-pool - Connection is not available, request timed out after 10000m가 발생했을까?
* reader, writer로 connection pool을 나누어서 사용하고 있는데 이상하게 writer-pool에서만 health check가 실패하여 자세한 파악을 위해 spring.datasource.hikari.leak-detection-threshold와 HikariCP logging 활성화
```yaml
spring:
  datasource:
    hikari:
      leak-detection-threshold: 60000
logging:
  level:
    com.zaxxer.hikari: trace
    com.zaxxer.hikari.HikariConfig: debug
```
* 위 설정을 kubernetes Deplyment에 환경 변수로 설정
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        ...
        env:
          - name: SPRING_DATASOURCE_HIKARI_LEAK-DETECTION-THRESHOLD
            value: "60000"
          - name: SPRING_DATASOURCE_READ_LEAK-DETECTION-THRESHOLD
            value: "60000"
          - name: LOGGING_LEVEL_COM_ZAXXER_HIKARI_HIKARICONFIG
            value: "DEBUG"
          - name: LOGGING_LEVEL_COM_ZAXXER_HIKARI
            value: "TRACE"
```

```java
2023-07-26T21:30:35.106 writer-pool - Pool stats (total=20, active=0, idle=20, waiting=0)
2023-07-26T21:30:35.106 writer-pool - Fill pool skipped, pool is at sufficient level.
2023-07-26T21:31:31.375 writer-pool - Closing connection software.aws.rds.jdbc.mysql.shading.com.mysql.cj.jdbc.ConnectionImpl@1f2696ce: (connection has passed maxLifetime)
2023-07-26T21:31:31.387 writer-pool - Added connection software.aws.rds.jdbc.mysql.shading.com.mysql.cj.jdbc.ConnectionImpl@3c7ded4b
2023-07-26T21:32:33.325 writer-pool - Add connection elided, waiting 0, queue 1
2023-07-26T21:32:33.328 writer-pool - Added connection software.aws.rds.jdbc.mysql.shading.com.mysql.cj.jdbc.ConnectionImpl@205c3a37
2023-07-26T21:32:33.336 writer-pool - After adding stats (total=20, active=4, idle=16, waiting=0)
2023-07-26T21:33:05.109 writer-pool - Pool stats (total=20, active=8, idle=12, waiting=0)
2023-07-26T21:33:30.181 writer-pool - Timeout failure stats (total=20, active=20, idle=0, waiting=15)
2023-07-26T21:33:31.276 writer-pool - Timeout failure stats (total=20, active=20, idle=0, waiting=15)
2023-07-26T21:33:32.103 writer-pool - Timeout failure stats (total=20, active=20, idle=0, waiting=18)
2023-07-26T21:33:34.170 writer-pool - Timeout failure stats (total=20, active=20, idle=0, waiting=17)
2023-07-26T21:38:20.247 Health contributor org.springframework.boot.actuate.jdbc.DataSourceHealthIndicator (db) took 128960ms to respond
2023-07-26T21:38:20.247 DataSource health check failed
```
* writer-pool connection pool의 connection이 어느 순간 모두 active가 되면서 이후 readinessProbe failed 발생
* traffic의 부하로 인한 것이라면 readinessProbe에 의해 외부 traffic이 차단되었기 때문에 시간이 지난 후 해소가 되야하는데 active connection이 반환되지 않으며, active connection은 max-lifetime에 의한 connection refresh도 발생하지 않는다

```java
2023-07-26T21:33:05.129 read-dh - Pool stats (total=10, active=0, idle=10, waiting=0)
2023-07-26T21:33:35.129 read-dh - Pool stats (total=10, active=1, idle=9, waiting=0)
2023-07-26T21:34:05.153 read-dh - Pool stats (total=10, active=0, idle=10, waiting=0)
```
* reader-pool connection pool에서는 잘 반환되는 것을 확인할 수 있었다

```java
2023-07-26T21:34:18.101 Connection leak detection triggered for software.aws.rds.jdbc.mysql.shading.com.mysql.cj.jdbc.ConnectionImpl@205c3a37 on thread Thread-57, stack trace follows
```
* spring.datasource.hikari.leak-detection-threshold=60000(60s)로 인해 60초 동안 connection pool로 반환되지 않는 connection leak이 writer-pool connection pool에서만 발생하는 것을 확인했고, stack trace를 분석하며 Querydsl의 transform()을 사용하는 것을 발견

```java
Connection leak detection triggered for software.aws.rds.jdbc.mysql.shading.com.mysql.cj.jdbc.ConnectionImpl@73cf88f7 on thread Thread-21, stack trace follows
     
stack_trace
java.lang.Exception: Apparent connection leak detected
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:100)
    at org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource.getConnection(AbstractRoutingDataSource.java:194)
    at org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy$LazyConnectionInvocationHandler.getTargetConnection(LazyConnectionDataSourceProxy.java:405)
    at org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy$LazyConnectionInvocationHandler.invoke(LazyConnectionDataSourceProxy.java:378)
    at jdk.proxy3/jdk.proxy3.$Proxy214.prepareStatement(Unknown Source)
    at org.hibernate.engine.jdbc.internal.StatementPreparerImpl$5.doPrepare(StatementPreparerImpl.java:149)
    at org.hibernate.engine.jdbc.internal.StatementPreparerImpl$StatementPreparationTemplate.prepareStatement(StatementPreparerImpl.java:176)
    at org.hibernate.engine.jdbc.internal.StatementPreparerImpl.prepareQueryStatement(StatementPreparerImpl.java:151)
    at org.hibernate.loader.Loader.prepareQueryStatement(Loader.java:2122)
    at org.hibernate.loader.Loader.executeQueryStatement(Loader.java:2059)
    at org.hibernate.loader.Loader.executeQueryStatement(Loader.java:2037)
    at org.hibernate.loader.Loader.scroll(Loader.java:2945)
    at org.hibernate.loader.hql.QueryLoader.scroll(QueryLoader.java:610)
    at org.hibernate.hql.internal.ast.QueryTranslatorImpl.scroll(QueryTranslatorImpl.java:452)
    at org.hibernate.engine.query.spi.HQLQueryPlan.performScroll(HQLQueryPlan.java:352)
    at org.hibernate.internal.SessionImpl.scroll(SessionImpl.java:1601)
    at org.hibernate.query.internal.AbstractProducedQuery.doScroll(AbstractProducedQuery.java:1588)
    at org.hibernate.query.internal.AbstractProducedQuery.scroll(AbstractProducedQuery.java:1574)
    at org.hibernate.query.internal.AbstractProducedQuery.scroll(AbstractProducedQuery.java:122)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(Unknown Source)
    at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source)
    at java.base/java.lang.reflect.Method.invoke(Unknown Source)
    at org.springframework.orm.jpa.SharedEntityManagerCreator$DeferredQueryInvocationHandler.invoke(SharedEntityManagerCreator.java:410)
    at jdk.proxy3/jdk.proxy3.$Proxy806.scroll(Unknown Source)
    at com.querydsl.jpa.HibernateHandler.iterate(HibernateHandler.java:60)
    at com.querydsl.jpa.impl.AbstractJPAQuery.iterate(AbstractJPAQuery.java:222)
    at com.querydsl.core.group.GroupByMap.transform(GroupByMap.java:54)
    at com.querydsl.core.group.GroupByMap.transform(GroupByMap.java:35)
    at com.querydsl.core.support.FetchableQueryBase.transform(FetchableQueryBase.java:55)
	...
```
```java
public Map<Long, Long> countPurchaseByOption(Collection<Long> orderIdxes) {
    NumberExpression<Long> sum = orderOption.purchaseCount.sum();
    return from(orderOption)
            .where(orderOption.orderIdx.in(orderIdxes))
            .select(orderOption.orderIdx, sum)
            .groupBy(orderOption.orderIdx)
            .transform(GroupBy.groupBy(orderOption.orderIdx).as(sum));
}
```
* Querydsl 5.0.0 사용을 사용하고 있었고, [querydsl #3089](https://github.com/querydsl/querydsl/issues/3089)를 보면 Transaction 외부에서 FetchableQueryBase#transform을 사용할 때 connection leak이 발생하는 것을 확인할 수 있었다

<br>

### 4. 왜 FetchableQueryBase#transform()에서 connection이 반환되지 않았을까?
* `FetchableQueryBase#transform()`은 query result를 memory에서 변환
* spring data jpa에서 `queryTerminatingMethods`에 포함된 method로 query가 종료될 때 EntityManager를 close한다
```java
public abstract class SharedEntityManagerCreator {
    ...
  private static final Set<String> transactionRequiringMethods = Set.of(
		"joinTransaction",
		"flush",
		"persist",
		"merge",
		"remove",
		"refresh");

  private static final Set<String> queryTerminatingMethods = Set.of(
	    "execute",  // jakarta.persistence.StoredProcedureQuery.execute()
		"executeUpdate", // jakarta.persistence.Query.executeUpdate()
		"getSingleResult",  // jakarta.persistence.Query.getSingleResult()
		"getResultStream",  // jakarta.persistence.Query.getResultStream()
		"getResultList",  // jakarta.persistence.Query.getResultList()
		"list",  // org.hibernate.query.Query.list()
		"stream",  // org.hibernate.query.Query.stream()
		"uniqueResult",  // org.hibernate.query.Query.uniqueResult()
		"uniqueResultOptional"  // org.hibernate.query.Query.uniqueResultOptional()
	);
  ...
}
```

* fetch(), fetchOne()는 `queryTerminatingMethods`에 포함된 method로 종료
```java
public abstract class AbstractJPAQuery<T, Q extends AbstractJPAQuery<T, Q>> extends JPAQueryBase<T, Q> {
  ...
  public List<T> fetch() {
    try {
      Query query = createQuery();
	  return (List<T>) getResultList(query);  // here
    } finally {
	  reset();
    }
  }

  public T fetchOne() throws NonUniqueResultException {
    try {
      Query query = createQuery(getMetadata().getModifiers(), false);
	  return (T) getSingleResult(query);  // here
    } catch (javax.persistence.NoResultException e) {
  	  logger.log(Level.FINEST, e.getMessage(), e);
  	  return null;
    } catch (javax.persistence.NonUniqueResultException e) {
	  throw new NonUniqueResultException(e);
    } finally {
	  reset();
    }
  }
}
```

* transform()에서는 `queryTerminatingMethods`에 포함되어 있지 않은 `iterate()`로 종료되어 EntityManager가 close되지 않기 때문에 connection 반환이 되지 않는다
```java
public RES transform(FetchableQuery<?, ?> query) {
  Map<K, Group> groups = (Map) mapFactory.get();

  // create groups
  FactoryExpression<Tuple> expr = FactoryExpressionUtils.wrap(Projections.tuple(expressions));
  boolean hasGroups = false;
  for (Expression<?> e : expr.getArgs()) {
	hasGroups |= e instanceof GroupExpression;
  }
  if (hasGroups) {
	expr = withoutGroupExpressions(expr);
  }
  CloseableIterator<Tuple> iter = query.select(expr).iterate();  // here
  ...

  // transform groups
  return transform(groups);
}
```
* transform()이 transaction 내부에서 실행되었다면 `queryTerminatingMethods`와 관계 없이 JpaTransactionManager.cleanupAfterCompletion()에서 정리가 된다


<br>

### 5. 왜 Transaction 외부에서 FetchableQueryBase#transform이 사용되었을까?
* 이슈가 발생한 FetchableQueryBase#transform을 사용하는 코드를 살펴보면 두가지 유형을 찾을 수 있었다

#### 1. Transaction 내부에서 비동기 사용
```java
@Transactional(readOnly = true)
@Service
public class TestService {
  private final TestRepository testRepository;
  ...
  public TestResponse fetchList() {
    var fetchX = CompletableFuture.supplyAsync(() -> testRepository.findAllByXXX());
    var fetchY = CompletableFuture.supplyAsync(() -> testRepository.findAllByYYY());
 
    return CompletableFuture.allOf(fetchX, fetchY)
	                          .thenApply(Void -> {
                                  var xxx = fetchX.join();
                                  var yyy = fetchY.join();
                                  return TestResponse.of(xxx, yyy); 
                            })
                            .join();
  }
}
```
* `@Transactional(readOnly = true)`로 선언된 메소드 내부에서 CompletableFuture를 사용해 http request thread와 다른 thread에서 동작하므로 http request thread에서 시작된 transaction이 적용되지 않는다

#### 2. Transaction 사용하지 않음
```java
@Service
public class TestService {
  private final TestRepository testRepository;
 
  public TestService(TestRepository testRepository) {
    this.testRepository = testRepository;
  }
 
  public TestResponse fetchList() {
    var xxx = testRepository.findAllByXXX();
    var yyy = testRepository.findAllByYYY();
 
    return TestResponse.of(xxx, yyy);
  }
}
```
* 조회만 있기 때문에 `@Transactional`을 사용하지 않았고, 그렇기 때문에 조회마다 connection을 획득하고 반환하기 때문에 비효율적으로 동작할 수 있다


<br>

## Resolve
* 아래 3가지 방법으로 수정 후 정상적으로 connection이 반환되는 것을 확인할 수 있었다

### 1. Transaction 내부에서 비동기 사용
@Async + @Transactional를 사용하거나 직접 transaction을 제어하도록 수정
* @Async + @Transactional
```java
@Configuration
@EnableAsync
public class AsyncConfig {
  // Additional configuration can be placed here if needed
}
 
@Service
public class ExampleService {
  
  @Async
  @Transactional
  public CompletableFuture<String> doAsyncTransactionalTask() {
	return CompletableFuture.supplyAsync(() -> {
      // Perform your asynchronous task here
      return "Result of the asynchronous computation";
    });
  }
}
```

* TransactionTemplate을 이용한 Programmatic Transaction Management
```java
@Transactional(readOnly = true)
@Service
public class TestService {
  private final TestRepository testRepository;
  private final TransactionTemplate readTransactionTemplate;
 
  public TestService(TestRepository testRepository,
                     PlatformTransactionManager transactionManager) {
    this.testRepository = testRepository;
    this.readTransactionTemplate = new TransactionTemplate(transactionManager);
    this.readTransactionTemplate.setReadOnly(true);
  }
 
  public TestResponse fetchList() {
    var fetchX = CompletableFuture.supplyAsync(() -> readTransactionTemplate.execute(status -> testRepository.findAllByXXX()));  // here
    var fetchY = CompletableFuture.supplyAsync(() -> readTransactionTemplate.execute(status -> testRepository.findAllByYYY()));
 
    return CompletableFuture.allOf(fetchX, fetchY)
	                          .thenApply(Void -> {
                                  var xxx = fetchX.join();
                                  var yyy = fetchY.join();
                                  return TestResponse.of(xxx, yyy); 
                            })
                            .join();
  }
}
```

<br>

### 2. Transaction 사용하지 않음
```java
@Transactional(readOnly = true)  // here
@Service
public class TestService {
  private final TestRepository testRepository;
  
  ...
  public TestResponse fetchList() {
    var xxx = testRepository.findAllByXXX();
    var yyy = testRepository.findAllByYYY();
 
    return TestResponse.of(xxx, yyy);
  }
}
```
* `@Transactional(readOnly = true)`를 설정하여 transaction 내부에서 connection을 획득과 반환이 1번만 발생하고, readOnly transaction을 통해 read-write spliting의 효과도 누릴 수 있기 때문에 더 효율적으로 동작한다

<br>

### 3. FetchableQueryBase#transform()을 제거
* `FetchableQueryBase#transform()`은 query result를 memory에서 변환하므로 fetch() + Stream API로 대체할 수 있다
```java
public Map<Long, Long> countPurchaseByOption(Collection<Long> orderIdxes) {
  NumberExpression<Long> sum = orderOption.purchaseCount.sum();
  return from(orderOption)
          .where(orderOption.orderIdx.in(orderIdxes))
          .select(orderOption.orderIdx, sum)
          .groupBy(orderOption.orderIdx)
          .fetch()
          .stream()
          .collect(Collectors.toMap(
                    tuple -> tuple.get(orderOption.orderIdx),
                    tuple -> tuple.get(sum)));
}
```


<br><br>

> #### Reference
> * [Spring/Hibernate connection leak with ScrollableResults](https://stackoverflow.com/questions/76008518/spring-hibernate-connection-leak-with-scrollableresults)
> * [Detecting a connection leak with Hikari](https://www.naiyerasif.com/post/2022/09/18/detecting-a-connection-leak-with-hikari/)
> * [[장애회고] ORM(JPA) 사용 시 예상치 못한 쿼리로 인한 HikariCP 이슈](https://saramin.github.io/2023-04-27-order-error/)
> * [Connection leak when using FetchableQueryBase#transform outside of a transaction #3089](https://github.com/querydsl/querydsl/issues/3089)
> * [Querydsl에서 transform 사용시에 DB connection leak 이슈](https://colin-d.medium.com/querydsl-%EC%97%90%EC%84%9C-db-connection-leak-%EC%9D%B4%EC%8A%88-40d426fd4337)
