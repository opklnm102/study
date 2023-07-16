# [Spring Data Redis] Using lettuce connection pool in spring data redis
> date - 2023.07.14  
> keyworkd - spring data redis, lettuce  
> spring data redis에서 lettuce connection pool을 사용하는 방법에 대해 정리  

<br>

## Lettuce
* [Netty](https://netty.io)(asynchronous event-driven network application framework)의 Redis client


<br>

## Lettuce Connection Pool
* Lettuce connection은 non-blocking + asynchronous로 thread safe하며 기본적으로 하나의 connection을 여러 thread에서 공유하고(`shareNativeConnection(default. true)`로 제어), 재사용
```java
public class LettuceConnectionFactory implements ... {}
  
  private boolean shareNativeConnection = true;
  ...

  public void setShareNativeConnection(boolean shareNativeConnection) {
    this.shareNativeConnection = shareNativeConnection;
  }
```
* 대부분의 경우 connection pool은 필요 X
  * Redis의 모든 user operation은 single-thread로 실행되기 때문에 connection pool을 사용해도 성능 향상에 도움이되지 않는다
* Redis transaction or blocking API는 동적 worker thread에서 전용 connection이 필요하므로 connection pooling이 유용

<br>

### Connection pool execution model
Lettuce에서는 2가지 execution model을 지원

* Apache Commons Pool 2를 이용한 synchronous/blocking
  * 코드가 실행되는 thread에서 모든 작업을 수행
* Lettcue-specific pool을 이용한 asynchronous/non-blocking(v5.1+)
  * non-blocking programming model에서 non-blocking api 필요
  * lettuce는 non-blocking pool을 제공


<br>

## Usage

### Dependency
* 기본적으로 [spring boot에서 관리하는 버전](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#appendix.dependency-versions.coordinates)을 사용하므로 버전을 명시하지 않는다

```gradle
implementation 'org.springframework.boot:spring-boot-starter-data-redis'

// for lettuce connection pooling
implementation 'org.apache.commons:commons-pool2'
```

### Configuraton
* spring-data-redis의 `LettuceConnectionConfiguration`에 의해 apache commons-pool2의 dependency만 설정하면 connection pool을 사용하게 되며 `spring.data.redis.lettuce.pool`로 수치 설정이 가능하다
```yaml
spring:
  data:
    redis:
      host: <redis-url>
      port: 6379
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          max-wait: -1ms
          min-idle: 0
```
* connection pool을 사용하게 되면 Redis의 current connection이 높아지고, CPU 사용량도 높아지기 때문에 blocking operation의 사용 빈도를 고려해 pool size를 설정하며 클 필요는 없다

```java
/**
 * Redis connection configuration using Lettuce.
 *
 * @author Mark Paluch
 * @author Andy Wilkinson
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(RedisClient.class)
@ConditionalOnProperty(name = "spring.redis.client-type", havingValue = "lettuce", matchIfMissing = true)
class LettuceConnectionConfiguration extends RedisConnectionConfiguration {

  LettuceConnectionConfiguration(RedisProperties properties,
                                 ObjectProvider<RedisStandaloneConfiguration> standaloneConfigurationProvider,
			                     ObjectProvider<RedisSentinelConfiguration> sentinelConfigurationProvider,
			                     ObjectProvider<RedisClusterConfiguration> clusterConfigurationProvider) {
    super(properties, standaloneConfigurationProvider, sentinelConfigurationProvider, clusterConfigurationProvider);
  }

  @Bean(destroyMethod = "shutdown")
  @ConditionalOnMissingBean(ClientResources.class)
  DefaultClientResources lettuceClientResources(ObjectProvider<ClientResourcesBuilderCustomizer> customizers) {
    DefaultClientResources.Builder builder = DefaultClientResources.builder();
	customizers.orderedStream().forEach((customizer) -> customizer.customize(builder));
	return builder.build();
  }

  @Bean
  @ConditionalOnMissingBean(RedisConnectionFactory.class)
  LettuceConnectionFactory redisConnectionFactory(ObjectProvider<LettuceClientConfigurationBuilderCustomizer> builderCustomizers,
                                                  ClientResources clientResources) {
    LettuceClientConfiguration clientConfig = getLettuceClientConfiguration(builderCustomizers, clientResources,
	getProperties().getLettuce().getPool());
	return createLettuceConnectionFactory(clientConfig);
  }

  private LettuceConnectionFactory createLettuceConnectionFactory(LettuceClientConfiguration clientConfiguration) {
    if (getSentinelConfig() != null) {
	  return new LettuceConnectionFactory(getSentinelConfig(), clientConfiguration);
	}
	if (getClusterConfiguration() != null) {
	  return new LettuceConnectionFactory(getClusterConfiguration(), clientConfiguration);
	}
	return new LettuceConnectionFactory(getStandaloneConfig(), clientConfiguration);
  }

  private LettuceClientConfiguration getLettuceClientConfiguration(ObjectProvider<LettuceClientConfigurationBuilderCustomizer> builderCustomizers,
                                                                   ClientResources clientResources, Pool pool) {
    LettuceClientConfigurationBuilder builder = createBuilder(pool);
    applyProperties(builder);
    if (StringUtils.hasText(getProperties().getUrl())) {
      customizeConfigurationFromUrl(builder);
    }
    builder.clientOptions(createClientOptions());
    builder.clientResources(clientResources);
    builderCustomizers.orderedStream().forEach((customizer) -> customizer.customize(builder));
    return builder.build();
  }

  private LettuceClientConfigurationBuilder createBuilder(Pool pool) {
    if (isPoolEnabled(pool)) {
      return new PoolBuilderFactory().createBuilder(pool);
    }
    return LettuceClientConfiguration.builder();
  }

  private LettuceClientConfigurationBuilder applyProperties(LettuceClientConfiguration.LettuceClientConfigurationBuilder builder) {
    if (getProperties().isSsl()) {
	  builder.useSsl();
	}
	if (getProperties().getTimeout() != null) {
	  builder.commandTimeout(getProperties().getTimeout());
	}
	if (getProperties().getLettuce() != null) {
	  RedisProperties.Lettuce lettuce = getProperties().getLettuce();
	  if (lettuce.getShutdownTimeout() != null && !lettuce.getShutdownTimeout().isZero()) {
	    builder.shutdownTimeout(getProperties().getLettuce().getShutdownTimeout());
	  }
	}
	if (StringUtils.hasText(getProperties().getClientName())) {
	  builder.clientName(getProperties().getClientName());
	}
	return builder;
  }

  private ClientOptions createClientOptions() {
    ClientOptions.Builder builder = initializeClientOptionsBuilder();
	Duration connectTimeout = getProperties().getConnectTimeout();
	if (connectTimeout != null) {
	  builder.socketOptions(SocketOptions.builder().connectTimeout(connectTimeout).build());
	}
	return builder.timeoutOptions(TimeoutOptions.enabled()).build();
  }

  private ClientOptions.Builder initializeClientOptionsBuilder() {
    if (getProperties().getCluster() != null) {
	  ClusterClientOptions.Builder builder = ClusterClientOptions.builder();
	  Refresh refreshProperties = getProperties().getLettuce().getCluster().getRefresh();
	  Builder refreshBuilder = ClusterTopologyRefreshOptions.builder()
				.dynamicRefreshSources(refreshProperties.isDynamicRefreshSources());
	  if (refreshProperties.getPeriod() != null) {
	    refreshBuilder.enablePeriodicRefresh(refreshProperties.getPeriod());
	  }
	  if (refreshProperties.isAdaptive()) {
	    refreshBuilder.enableAllAdaptiveRefreshTriggers();
	  }
	  return builder.topologyRefreshOptions(refreshBuilder.build());
	}
    return ClientOptions.builder();
  }

  private void customizeConfigurationFromUrl(LettuceClientConfiguration.LettuceClientConfigurationBuilder builder) {
    ConnectionInfo connectionInfo = parseUrl(getProperties().getUrl());
	if (connectionInfo.isUseSsl()) {
	  builder.useSsl();
	}
  }

  /**
   * Inner class to allow optional commons-pool2 dependency.
   */
  private static class PoolBuilderFactory {
    LettuceClientConfigurationBuilder createBuilder(Pool properties) {
	  return LettucePoolingClientConfiguration.builder().poolConfig(getPoolConfig(properties));
    }

	private GenericObjectPoolConfig<?> getPoolConfig(Pool properties) {
	  GenericObjectPoolConfig<?> config = new GenericObjectPoolConfig<>();
	  config.setMaxTotal(properties.getMaxActive());
	  config.setMaxIdle(properties.getMaxIdle());
	  config.setMinIdle(properties.getMinIdle());
	  if (properties.getTimeBetweenEvictionRuns() != null) {
	    config.setTimeBetweenEvictionRuns(properties.getTimeBetweenEvictionRuns());
	  }
	  if (properties.getMaxWait() != null) {
	    config.setMaxWait(properties.getMaxWait());
	  }
	  return config;
    }
  }
}
```


<br>

> #### Reference
> * [Connection Pooling - Lettuce Docs](https://lettuce.io/core/release/reference/index.html#_connection_pooling)
> * [The Pooling of Connections in Redis - Redis Best Practises in Multi-Threaded Environments](https://medium.com/geekculture/the-pooling-of-connections-in-redis-e8188335bf64)
