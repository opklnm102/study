# [Web] Caching with HTTP header
> date - 2020.03.13  
> keyword - http, web, cache, cache-control, etag, expires  
> HTTP header를 이용한 caching에 대한 내용 정리

<br>

## Cache-Control
* request와 response의 `caching`을 위한 directives
* request의 directive가 response와 동일하지 않아도 된다

<br>

### Caching directive rule
* case-insensitive지만 lowercase 권장
* `,`로 multiple directives 구분
* `token` or `"`로 둘러쌓인 optional argument를 가진다

<br>

### Cache request directives
* HTTP request에서 client에 의해 사용될 수 있는 Standard `Cache-Control` directives
```
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<second>
Cache-Control: no-cache
Cache-Control: no-store
Cache-Control: no-transform
Cache-Control: only-if-cached
```

<br>

### Cache response directives
* HTTP response에서 server에 의해 사용될 수 있는 Standard `Cache-Control` directives
```
Cache-Control: must-revalidate
Cache-Control: no-cache
Cache-Control: no-store
Cache-Control: no-transform
Cache-Control: public
Cache-Control: private
Cache-Control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-Control: s-maxage=<seconds>
```

<br>

### Extension Cache-Control directives
* Standard에 포함되지 않으므로 지원 여부를 확인해야 한다
* 인식하지 못하는 user-agents는 무시
```
Cache-Control: immutable
Cache-Control: stale-while-revalidate=<seconds>
Cache-Control: stale-if-error=<seconds>
```

<br>

### Directives

#### Cacheability
* `public`
  * response가 어떤 cache에 의해서든 cacheing
* `private`
  * response가 단일 사용자를 위한 것이며 shared cache에 저장되면 안된다
  * private cache(e.g. browser cache)에는 저장할 수 있다
* `no-cache`
  * cache를 사용하기전에 origin server에서 validation 요청을 강제
* `no-store`
  * cache는 client request, server response을 caching하면 안된다

#### Expiration
* `max-age=<seconds>`
  * 리소스가 최신 상태라고 판단할 최대 시간 지정
  * `Expires`에 비해 directive는 request time과 관련이 있다
* `s-maxage=<seconds>`
  * `max-age`, `Expires` header를 재정의하거나, shared cache(e.g. proxy)에만 적용되며 private cache에서는 무시된다
* `max-stale=[=<seconds>]`
  * client가 cache의 exipre time을 초과한 response를 얼마나 받아들일지 시간 설정
* `min-fresh=<seconds>`
  * client가 새로운 response를 원하는 시간 설정
* `stale-while-revalidate=<seconds>`
  * 비동기적으로 backgroud에서 검사하는 동안 client가 오래된 response를 사용하는 시간 설정
* `stale-if-error=<seconds>`
  * client에서 새로운 response 확인 실패시 오래된 response를 사용할 시간 설정

#### Revalidation and reloading
* `must-revalidate`
  * cache 사용 전 기존 리소스 검사 후 만료된 리소스는 사용하지 않는다
* `proxy-revalidate`
  * `must-revalidate`와 동일하지만, shared cache(e.g. proxy)에만 적용되며 private cache에서는 무시된다
* `immutable`
  * response body가 변하지 않는 것을 나타냄
  * 만료되지 않은 경우, `If-None-Match`, `If-Modified-Since` 등 조건부 재검증을 하면 안된다

#### Other
* `no-transform`
  * response에 변형이 일어나면 안된다
  * `Content-Encoding`, `Content-Range`, `Content-Type` header는 proxy에 의해 수정되면 안된다
  * non-transparent proxy나 browser feature는 cache space와 slow link의 traffic을 줄이기 위해 image format을 변환하지만 `non-transform` directive는 허용하지 않는다
* `only-if-cached`
  * client는 최초 response를 caching하고, origin server에서 새로운 데이터를 조회하지 않는다

<br>

### Examples
#### Preventing caching
```
Cache-Contro: no-store
```

#### Caching static assets
* image, css, java script 등 static assets caching
```
Cache-Contro: public, max-age=31536000
```

#### Requiring revalidation
* caching된 리소스가 유효한지 매번 확인하지만, 유효하다면 HTTP body download를 skip할 수 있다
```
Cache-Contro: no-cache
Cache-Contro: max-age=0
```


<br>

## Expires
* 언제 만료되는지를 지정
* `Cache-Control: max-age=<seconds>`가 있다면 무시
```
Expires: Fri, 13 Mar 2020 17:32:45 GMT
```


<br>

## ETag
```
ETag: W/"<etag_value>"
ETag: "<etag_value>"

## example
ETag: "0de7f16e857e66f172d0eccc8d16433d:1580805701.341012"
```
* 특정 버전의 리소스를 식별할 수 있는 HTTP Response header
* 리소스가 변경되지 않았다면 origin server에 리소스를 요청하지 않으므로 **cache가 더 효율적이고, bandwidth도 절약**할 수 있다
  * 리소스가 변경되면 새로운 ETag가 생성
* `ETag`를 생성하는 방법은 다양
  * 리소스의 hash
  * 마지막 수정된 timestamp의 hash
  * ...

<br>

### Example
#### Avoiding `mid-air` collisions
* `ETag`, `If-Match` header로 mid-air collision을 감지
  * 1번째 리소스 조회시 얻은 `ETag`를 내용 수정 request에 `If-Match` header로 보내어 중복 수정이 발생하는지 체크

#### Caching of unchanged resources
* `ETag`, `If-Match` header로 효율적인 caching 사용
  * 1번째 리소스 조회시 얻은 `ETag`를 `If-Match` header로 보내어 기존 cache를 사용 가능 여부를 체크


<br>

> #### Cache-Control vs Access-Control-Max-Age
> * Cache-Control - caching을 위해 일반적으로 사용
> * Access-Control-Max-Age - CORS preflighted request의 결과 caching에 사용

<br><br>

> #### Reference
> * [Cache-Control - MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
> * [ETag - MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
