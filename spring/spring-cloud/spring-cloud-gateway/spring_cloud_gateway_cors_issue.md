# [Spring Cloud Gateway] CORS issue
> date - 2019.05.25  
> keyword - spring cloud gateway, cors  
> spring cloud gateway에서 cors에 관련된 issue를 정리  

<br>

## Issue
* 아래와 같은 flow에서 CORS issue 발생

```
+---------+          +---------+          +-----------------+
| Client  | -------> | Gateway | -------> | Backend Service |
+---------+          +---------+          +-----------------+
```

```
Access to XMLHttpRequest at 'https://a.com/api/v1/xxx' from origin 'https://origin-b.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
* backend service에서 각각 CORS 설정이 되어 있는 상태에서 Spring Cloud Gateway 도입시 발생한 issue


<br>

## Resolve 1
* [Support for routing cross-origin OPTIONS requests #830](https://github.com/spring-cloud/spring-cloud-gateway/issues/830)를 보면 preflight request를 backend로 routing하지 않는 것을 알 수 있다
  * gateway에서 CORS를 제어하지 않고 backend로 routing하여 backend에 맡기도록 발전할 수도 있을 듯
* [Preflight Request #229](https://github.com/spring-cloud/spring-cloud-gateway/issues/229)에서 논의되어 Golbal CORS 설정 추가
  * [10. CORS Configuration - Spring Cloud Gateway Docs](https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.1.0.RELEASE/single/spring-cloud-gateway.html#_cors_configuration) 참고

<br>

> CORS를 gateway에서 하는게 좋을까? 각 backend에 맡기는게 좋을까...?  
> backend마다 CORS policy가 다를 수 있으므로 gateway는 그냥 backend로 routing만하고 backend에서 알아서 처리하는게 더 괜찮지 않을까...?

<br>

### Spring Cloud CORS configuration
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://a.com"
            allowedMethods:
            - GET
            - POST
            ...

######### any origin, any hethod #########
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true
```

* 해결될 줄 알았으나.... **multiple header** error 발생
```
as been blocked by CORS policy: The 'Access-Control-Allow-Origin' header contains multiple values 'https://origin-b.com, https://origin-b.com', but only one is allowed.
```

* Gateway와 backend service에서 각각 넣어준 header가 존재하기 때문
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://origin-b.com
Access-Control-Allow-Origin: https://origin-b.com
```


<br>

## Resolve 2
* `zuul`에서는 ignored-headers 추가
  * [Zuul Access-Control-* Headers are duplicated #1250](https://github.com/spring-cloud/spring-cloud-netflix/issues/1250)
* Spring Cloud Gateway에서는....??
  * [Doubled CORS headers after upgrade to Greenwich #728](https://github.com/spring-cloud/spring-cloud-gateway/issues/728)에서 발견되어 [Dedupe response header filter #866](https://github.com/spring-cloud/spring-cloud-gateway/pull/866)에서 fix되어 2.0.4.RELEASE에 포함


<br><br>

> #### Reference
> * [Support for routing cross-origin OPTIONS requests #830](https://github.com/spring-cloud/spring-cloud-gateway/issues/830)
> * [Preflight Request #229](https://github.com/spring-cloud/spring-cloud-gateway/issues/229)
> * [10. CORS Configuration - Spring Cloud Gateway Docs](https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.1.0.RELEASE/single/spring-cloud-gateway.html#_cors_configuration)
> * [Zuul Access-Control-* Headers are duplicated #1250](https://github.com/spring-cloud/spring-cloud-netflix/issues/1250)
> * [Doubled CORS headers after upgrade to Greenwich #728](https://github.com/spring-cloud/spring-cloud-gateway/issues/728)  
> * [Dedupe response header filter #866](https://github.com/spring-cloud/spring-cloud-gateway/pull/866)
