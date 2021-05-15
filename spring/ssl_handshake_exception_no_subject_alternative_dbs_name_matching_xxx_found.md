# [Spring] SSLHandshakeException: No subject alternative DNS name matching xxx found
> date - 2021.05.14  
> keyworkd - spring, resttemplate, ssl certificate  
> SSLHandshakeException을 대응한 방법에 대해 정리  

<br>

## Requirement

### Dependency
* Spring Boot 2.x
```
implementation 'org.springframework.boot:spring-boot-starter-web'
```


<br>

## Issue
* `RestTemplate`으로 https request시 아래와 같이 `SSLHandshakeException` 발생

### stack trace
```java
org.springframework.web.client.ResourceAccessException: I/O error on POST request for \"https://api.example.com/v1/xxxx\": No subject alternative DNS name matching api.example.com found.; nested exception is javax.net.SSLHandshakeException: No subject alternative DNS name matching api.example.com found.
at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java:743)
at org.springframework.web.client.RestTemplate.execute(RestTemplate.java:669)
at org.springframework.web.client.RestTemplate.postForEntity(RestTemplate.java:444)
...
at java.base/java.lang.Thread.run(Thread.java:834)
Caused by: javax.net.ssl.SSLHandshakeException: No subject alternative DNS name matching api.example.com found.
at java.base/sun.security.ssl.Alert.createSSLException(Alert.java:131)
at java.base/sun.security.ssl.TransportContext.fatal(TransportContext.java:326)
at java.base/sun.security.ssl.TransportContext.fatal(TransportContext.java:269)
at java.base/sun.security.ssl.TransportContext.fatal(TransportContext.java:264)
at java.base/sun.security.ssl.CertificateMessage$T12CertificateConsumer.checkServerCerts(CertificateMessage.java:645)
at java.base/sun.security.ssl.CertificateStatus$CertificateStatusConsumer.consume(CertificateStatus.java:295)
at java.base/sun.security.ssl.SSLHandshake.consume(SSLHandshake.java:392)
...
Caused by: java.security.cert.CertificateException: No subject alternative DNS name matching api.example.com found.
at java.base/sun.security.util.HostnameChecker.matchDNS(HostnameChecker.java:207)
at java.base/sun.security.util.HostnameChecker.match(HostnameChecker.java:98)
at java.base/sun.security.ssl.X509TrustManagerImpl.checkIdentity(X509TrustManagerImpl.java:455)
at java.base/sun.security.ssl.X509TrustManagerImpl.checkIdentity(X509TrustManagerImpl.java:429)
at java.base/sun.security.ssl.X509TrustManagerImpl.checkTrusted(X509TrustManagerImpl.java:229)
at java.base/sun.security.ssl.X509TrustManagerImpl.checkServerTrusted(X509TrustManagerImpl.java:129)
at java.base/sun.security.ssl.CertificateMessage$T12CertificateConsumer.checkServerCerts(CertificateMessage.java:629)
... 42 common frames omitted
```
* request에 사용한 domain과 certificate의 CN이 일치하지 않아 `HostnameChecker`에 의해 ssl handshake 실패

```sh
$ openssl s_client -connect api.example.com:443 | openssl x509 -noout -text

depth=2 C = BE, O = GlobalSign nv-sa, OU = Root CA, CN = GlobalSign Root CA
verify return:1
depth=1 C = BE, O = GlobalSign nv-sa, CN = GlobalSign CloudSSL CA - SHA256 - G3
verify return:1
depth=0 C = US, ST = xxxxxx, L = xxxxxx, O = "xxxxx.", CN = api.example.io
...
```


<br>

## Resolve
certificate에 대한 권한이 있으면 해당 domain을 추가시켜주는게 가장 좋으나, 3rd party service일 경우 제어권이 없으므로 `HostnameChecker`를 수정하는 방법으로 우회할 수 있다

* `NoopHostnameVerifier` 사용
```java
package org.apache.http.conn.ssl;

@Contract(threading = ThreadingBehavior.IMMUTABLE)
public class NoopHostnameVerifier implements HostnameVerifier {

    public static final NoopHostnameVerifier INSTANCE = new NoopHostnameVerifier();

    @Override
    public boolean verify(final String s, final SSLSession sslSession) {  // here
        return true;
    }

    @Override
    public final String toString() {
        return "NO_OP";
    }
}
```

* `HttpClient`에서 `NoopHostnameVerifier`을 사용하도록 설정
```java
@Configuration
public class CustomApiRestTemplateConfiguration {

    private HttpClient createHttpClient() {
        return HttpClientBuilder.create()
                                .useSystemProperties()
                                .setSSLHostnameVerifier(new NoopHostnameVerifier())  // here
                                .build();
    }

    private ClientHttpRequestFactory createClientHttpRequestFactory(HttpClient httpClient, Duration timeout) {
        var httpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        httpRequestFactory.setConnectionRequestTimeout(Math.toIntExact(timeout.toMillis()));
        httpRequestFactory.setConnectTimeout(Math.toIntExact(timeout.toMillis()));
        httpRequestFactory.setReadTimeout(Math.toIntExact(timeout.toMillis()));
        httpRequestFactory.setHttpClient(httpClient);
        return httpRequestFactory;
    }

    private ClientHttpRequestInterceptor createRequestHeaderInterceptor(String apiKey) {
        return (request, body, execution) -> {
                    request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                    request.getHeaders().add("Authorization", "Bearer " + apiKey);
                    return execution.execute(request, body);
                };
    }

    @Bean
    public RestTemplate customApiRestTemplate(CustomApiProperties properties) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(createClientHttpRequestFactory(createHttpClient(), properties.timeout));
        restTemplate.setUriTemplateHandler(new RootUriTemplateHandler(properties.getUrl()));
        restTemplate.setInterceptors(List.of(createRequestHeaderInterceptor(properties.getKey())));
        return restTemplate;
    }

    @ConfigurationProperties(prefix = "custom.api")
    @Getter
    @Setter
    public static class CustomApiProperties {
        private String url;
        private String key;
        private Duration timeout;
    }
}
```


<br><br>

> #### Reference
> * [What is the SSL Certificate Common Name?](https://support.dnsimple.com/articles/what-is-common-name/)
> * [K8404: Error Message: The certificate's CN name does not match the passed value](https://support.f5.com/csp/article/K8404)
> * [“No subject alternative DNS name matching <api.hostname.net> found” Error when using RestTemplate - Stack Overflow](https://stackoverflow.com/questions/51321678/no-subject-alternative-dns-name-matching-api-hostname-net-found-error-when-u)
> * [How to Ignore Certificate Errors in Apache HttpClient 4.5](https://memorynotfound.com/ignore-certificate-errors-apache-httpclient/)
