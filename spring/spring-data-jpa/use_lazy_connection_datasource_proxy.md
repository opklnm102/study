# [Spring Data Jpa] Use LazyConnectionDataSourceProxy
> date - 2023.08.02  
> keyworkd - jpa, connection  
> LazyConnectionDataSourceProxy에 대해 정리  

<br>

## LazyConnectionDataSourceProxy?
* Spring은 transaction 시작시 connection의 실제 사용 여부와 무관하게 connection을 획득
* transaction은 시작했지만 실제 DB는 나중에 사용하는 경우 **실제 DB를 사용할 때까지 connection 획득을 지연시킬 필요**가 있다
  * API로 데이터를 가져와서 가공한 후 가장 마지막에 DB에 저장하는 작업 같은 경우
  * cache를 사용하여 connection을 전혀 사용하지 않는 경우
    * [Hibernate](https://hibernate.org) first/second level cache
    * [Redis](https://redis.io)
    * [caffeine](https://github.com/ben-manes/caffeine)
* **DB connection은 유한**하기 때문에 connection과 무관한 작업으로 시간이 소요되면 connection pool의 connection이 부족해지므로 **효율적인 사용 필요**
* [LazyConnectionDataSourceProxy](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/datasource/LazyConnectionDataSourceProxy.html)는 transaction이 시작되더라도 실제로 connection이 필요한 경우에만 connection을 획득한다
* 다른 외부 리소스에 장애가 발생하여 지연되는 경우 DB connection이 고갈되는 현상을 막을 수 있어 외부 리소스를 다양하게 접근하는 경우 효과가 있다


<br>

## Configuration
* 사용하는 DataSource 가장 마지막에 LazyConnectionDataSourceProxy로 감싸준다

### Spring
* `LazyConnectionDataSourceProxy`을 Bean으로 만들면 `@ConfigurationProperties`로 설정할 수 없어서 `HikariConfig`로 채운 뒤 생성해야한다
```java
@Configuration
public class DataSourceConfiguration {

  @Bean
  @ConfigurationProperties(prefix = "spring.datasource.hikari")
  public HikariConfig hikariConfig() {
    return new HikariConfig();
  }

  @Bean
  @Primary
  public DataSource dataSource(HikariConfig hikariConfig) {
    return new LazyConnectionDataSourceProxy(new HikariDataSource(hikariConfig));
  }
}
```

<br>

### Spring Boot
* `BeanPostProcessor`를 이용해 auto configuration으로 생성되는 DataSource를 감싸준다
```java
@Component
public class DataSourceProxyBeanPostProcessor implements BeanPostProcessor {

  @Override
  public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
  }

  @Override
  public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
    if (bean instanceof DataSource) {
      var factory = new ProxyFactory(bean);
      factory.setProxyTargetClass(true);
      factory.addAdvice(new ProxyDataSourceInterceptor((DataSource) bean));
      return factory.getProxy();
    }
    return bean;
  }

  private static class ProxyDataSourceInterceptor implements MethodInterceptor {
    private final DataSource dataSource;

    public ProxyDataSourceInterceptor(DataSource dataSource) {
      super();
      this.dataSource = new LazyConnectionDataSourceProxy(dataSource);
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
      var proxyMethod = ReflectionUtils.findMethod(dataSource.getClass(), invocation.getMethod().getName());
      if (proxyMethod != null) {
        return proxyMethod.invoke(dataSource, invocation.getArguments());
      }
    return invocation.proceed();
    }
  }
}
```

<br>

### Multi DataSource
* DataSourceProxyBeanPostProcessor를 사용하고, 아래와 같이 설정
```java
@Configuration
public class DataSourceConfiguration {
  
  @Primary
  @Bean
  @ConfigurationProperties(prefix = "spring.datasource.hikari")
  public DataSource dataSource() {
    return DataSourceBuilder.create()
                            .type(HikariDataSource.class)
                            .build();
  }
  
  @Bean
  @ConfigurationProperties(prefix = "spring.datasource.second")
  public DataSource secondDataSource() {
    return DataSourceBuilder.create()
                            .type(HikariDataSource.class)
                            .build();
  }
}
```

<br>

### Replication DataSource
* primary, replica로 DataSource를 사용해하며 @Transactional readOnly에 따라 DataSource를 사용할 경우
```java
@Configuration
public class DataSourceConfiguration {

  @Primary
  @Bean(name = "hikariConfig")
  @ConfigurationProperties(prefix = "spring.datasource.hikari")
  public HikariConfig hikariConfig() {
    return new HikariConfig();
  }

  @Bean(name = "readerHikariConfig")
  @ConfigurationProperties(prefix = "spring.datasource.reader")
  public HikariConfig readerHikariConfig() {
    return new HikariConfig();
  }

  @Primary
  @Bean(name = "dataSource")
  public DataSource dataSource(@Qualifier("hikariConfig") HikariConfig hikariConfig,
                               @Qualifier("readerHikariConfig") HikariConfig readerHikariConfig) {
    var dataSourceMap = Map.<Object, Object>of(DbType.WRITER, new HikariDataSource(hikariConfig),
                                               DbType.READER, new HikariDataSource(readerHikariConfig));
    var replicationRoutingDataSource = new ReplicationRoutingDataSource();
    replicationRoutingDataSource.setTargetDataSources(dataSourceMap);
    replicationRoutingDataSource.setDefaultTargetDataSource(dataSourceMap.get(DbType.WRITER));
    replicationRoutingDataSource.afterPropertiesSet();
    return new LazyConnectionDataSourceProxy(replicationRoutingDataSource);
  }

  @Primary
  @Bean(name = "entityManagerFactory")
  public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder builder,
                                                                     DataSource dataSource) {
    return builder
            .dataSource(dataSource)
            .packages(MyPackages.class)
            .persistenceUnit("myPersistenceUnit")
            .build();
  }

  @Primary
  @Bean(name = "transactionManager")
  public PlatformTransactionManager transactionManager(@Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
    return new JpaTransactionManager(entityManagerFactory);
  }

  private static class ReplicationRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
      return TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? DbType.READER : DbType.WRITER;
    }
  }
}

public enum DbType {
  WRITER,
  READER;
}
```


<br><br>

> #### Reference
> * [Configuring A Datasource-Proxy In Spring Boot](https://arnoldgalovics.com/spring-boot-datasource-proxy)
> * [LazyConnectionDataSourceProxy](https://kwonnam.pe.kr/wiki/springframework/lazyconnectiondatasourceproxy)
