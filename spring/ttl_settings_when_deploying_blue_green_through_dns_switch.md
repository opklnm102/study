# [Spring] TTL settings when deploying blue/green through DNS switch
> date - 2024.03.18  
> keyworkd - dns, http, ttl  
> DNS 전환을 통한 blue/green 배포시 traffic shift를 위해 TTL을 설정하는 방법 정리  

<br>

## Issue
* DNS switch로 blue/green 배포시 다른 group으로 traffic shift가 이루어지지 않는 이슈 발생


<br>

## Why?
* HTTP keep alive는 LoadBalancer에서 close 여부를 결정
* CLB, ALB는 request count를 기반으로 close하는 기능은 없고, timeout 기반으로만 close(default. 60s)
* timeout 기반은 API to API에서는 idletime이 거의 없어서 close가 되지 않기 때문에 DNS switch를 통한 blue/green 배포시 다른 group으로 traffic shift가 이루어지지 않을 수 있음
* 주기적으로 http connection을 끊어서 재연결을 하여 DNS 전환을 인식하게 해야한다


<br>

## Resolve
* `-Dhttp.keepAlive=false`로 keep alive을 끄면 매번 SSL handshake가 발생하기 때문에 가능하면 TTL을 설정을 추천
  * https의 SSL handshake는 client <-> server의 CPU를 추가로 사용하게 된다(e.g. 30 ~ 40%)
* 시간이 지나면 connection을 끊고 재연결하도록 TTL을 설정(5분 미만으로 추천)

### HttpComponent
```java
private HttpClient createHttpClient(Duration timeout) {
  return HttpClientBuilder.create()
                          .useSystemProperties()
                          .setConnectionTimeToLive(timeout.toSeconds(), TimeUnit.SECONDS)
                          .build();
}

private ClientHttpRequestFactory createClientHttpRequestFactory(HttpClient httpClient, Duration timeout) {
  var httpRequestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
  httpRequestFactory.setConnectionRequestTimeout(Math.toIntExact(timeout.toMillis()));
  httpRequestFactory.setConnectTimeout(Math.toIntExact(timeout.toMillis()));
  httpRequestFactory.setReadTimeout(Math.toIntExact(timeout.toMillis()));
  return httpRequestFactory;
}
 
var restTemplate = new RestTemplate(createClientHttpRequestFactory(createHttpClient(timeout), timeout));
```

<br>

## WebClient
```java
public record WebClientProperties(
    Integer maxConnection,  // default 50s
    Duration pendingAcquireTimeout,  // default 60s
    Integer maxLifeTime,  // 10m
    Integer maxIdleTime,  // 5m
    Integer connectionTimeoutMills,  // 5s
    Integer readTimeoutMills,  // default 60s
    Integer writeTimeoutMills  // default 60s
) {
}

@Bean
public WebClientCustomizer webClientHeaderCustomizer() {
  return webClientBuilder -> webClientBuilder
    .defaultHeader("ContentType", "application/json");
}

@Bean
public ClientHttpConnector clientHttpConnector(WebClientProperties webClientProperties) {
  var httpClient = HttpClient.create(
        ConnectionProvider.builder("test-connection-pool")
                          .maxConnections(webClientProperties.maxConnection != null ? webClientProperties.maxConnection : ConnectionProvider.DEFAULT_POOL_MAX_CONNECTIONS)
                          .pendingAcquireTimeout(webClientProperties.pendingAcquireTimeout)
                          .maxLifeTime(Duration.ofSeconds(webClientProperties.maxLifeTime))
                          .maxIdleTime(Duration.ofSeconds(webClientProperties.maxIdleTime))
                          .build());
  httpClient.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, webClientProperties.connectionTimeoutMills)
            .doOnConnected(connection -> {
                connection.addHandlerLast(new ReadTimeoutHandler(webClientProperties.readTimeoutMills, TimeUnit.MILLISECONDS));
                connection.addHandlerLast(new WriteTimeoutHandler(webClientProperties.writeTimeoutMills, TimeUnit.MILLISECONDS));
            });
  return new ReactorClientHttpConnector(httpClient);
}

@Bean
public WebClient webClient(WebClient.Builder webClientBuilder, String host) {
  return webClientBuilder.baseUrl(host)
                         .defaultHeader("Authorization", "Bearer xxxxx")
                         .build();
  }
```
