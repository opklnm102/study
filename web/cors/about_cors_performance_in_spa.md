# [Web] About CORS(Cross Origin Resource Sharing) Performance in SPA(Single Page Application)
> date - 2020.03.09  
> keyword - web, http, cors, spa  
> CORS(Cross Origin Resource Sharing) performance issue에 대해 정리

<br>

* same-origin policy는 web security의 기초 메커니즘 중 하나
* protocol, host, port가 다른 web application간에 리소스를 공유를 제한


<br>

## SPA가 다른 Domain을 가진 HTTP API를 사용하는 경우 고려할 점
* 가능하면 **SPA와 동일한 domain에서 HTTP API를 사용하도록 API를 design**하는게 좋다
  * SPA와 동일한 domain을 사용하도록 **API Gateway 구축** 추천
* SPA에서 microservice로 구성된 API를 사용하는 경우
* microservice의 장점인 resilience, fault tolerance, user experience 향상을 얻을 수 있지만
* 만약 서로 다른 domain으로 구성되어 있고, API가 JSON(`Content-Type: application/json`)을 사용한다면 **preflighted request를 피할 수 없다**
* preflighted request로 트래픽이 증가하고, 성능 이슈 발생
  * preflighted request(OPTIONS)와 실제 request로 총 2개의 request 발생
  * 각각 2초기 소요될 경우 총 4초 소요 -> 수백만의 request가 발생한다면? 
  * 모든 latency가 2배가 되므로 성능 저하 발생(특히 network 속도가 느리다면...?)
  * SPA의 latency issue로 인해 **SPA가 제공하는 이점보다 더 많은 문제**가 발생할 수 있다
  * **HTTP request count를 최소화하는 것은 web performance의 best practice**


<br>

## preflighted request에 대한 2가지 전략

### 1. Limit the HTTP method and header that can be used when API design
* API design시 **HTTP method, header를 제한**하여 preflighted request를 발생시키지 않는다
* method
  * HEAD
  * GET
  * POST
* header
  * Accept
  * Accept-Language
  * Content-Language
  * Content-Type - application/x-www-form-urlencoded, multipart/form-data, text/plain
* 상당한 제한이 있지만 유연한 URI design으로 해결할 수 있다
  * e.g. example.com?method_override=DELETE

<br>

### 2. Enable caching on preflighted response
* **preflighted response를 broswer에서 caching**하여 반복적인 preflighted request를 감소
* 적절한 caching은 web performance를 향상시킨다
  * `Cache-Control`가 아닌 `Access-Control-Max-Age` header 사용

<br>

#### Access-Control-Max-Age header?
```
Access-Control-Max-Age: <delta-seconds>
```
* preflighted request의 결과를 cache할 수 있는 기간(seconds)
* cache하는 동안 다른 preflighted request를 하지 않아도 된다
* preflighted response의 cache는 `origin`이 아닌 [cors-preflight-cache - Fetch Spec](https://fetch.spec.whatwg.org/#cors-preflight-cache)에 따라 아래 5개 필드로 cache entry 구성
  * `byte-serialized origin` - The result of byte-serializing a request origin with request
  * `URL` - request’s current URL
    * URL path(query parameters 포함)가 다르면 preflighted request 발생
  * `max-age` - max-age
  * `credentials` - True if request’s credentials mode is "include", and false otherwise
  * `method` - method
  * `header name` - headerName
* 최상의 효율을 위해 가장 긴 시간으로 설정 


<br> 

> #### Chrome 개발자 도구 network tab에서 preflighted request가 보이지 않는다..?!
> * `chrome://flags/#out-of-blink-cors`를 disable 후에 chrome 재시작하면 보인다

<br>

> #### CORS관련 header는 OPTIONS method(preflighted request)에서만 의미가 있다
> * Access-Control-Allow-Credentials: true
> * Access-Control-Allow-Headers: version, content-type
> * Access-Control-Allow-Methods: HEAD, GET, POST, PUT, DELETE, PATCH
> * Access-Control-Allow-Origin: https://www.example.com
> * Access-Control-Max-Age: 86400


<br><br>

> #### Reference
> * [How Cross-Origin Resource Sharing requests affect your app's performance](https://www.freecodecamp.org/news/the-terrible-performance-cost-of-cors-api-on-the-single-page-application-spa-6fcf71e50147/)
> * [Two Strategies for Crossing Origins with Performance in Mind](https://gooroo.io/GoorooTHINK/Article/16408/Two-Strategies-for-Crossing-Origins-with-Performance-in-Mind/19880#.XmUbIZMzbRa)
