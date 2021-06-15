# [Nginx] gzip compression
> date - 2021.06.15  
> keyworkd - nginx, gzip, contents compression  
> Nginx에서 gzip으로 contents compression을 적용하는 방법을 정리  

<br>

## Contents Compression
* server - client 통신에서 전송되는 data size를 줄여 서비스 제공 속도를 향상시켜 서비스 품질을 향상시킬 수 있는 기술
  * [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/), [GTmetrix](https://gtmetrix.com/) 등을 통해 전/후 효과를 비교할 수 있다
* 압축 여부는 header의 `Contents-Encoding: gzip` 확인
  * Accept-Encoding - client에서 지원하는 encoding
  * Contents-Encoding header - server에서 사용한 encoding

<br>

### contents compression으로 response size를 줄이면 어떤 이점이 있을까?
* client side
  * resouce download 시간 단축
  * client의 data 사용량 감소
  * client의 페이지 첫 랜더링 시간 단축
* server side
  * data size 감소로 인한 outbound traffic 비용 절감
  * client의 resouce download 시간 단축으로 인한 server side의 처리량 증가


<br>

## Nginx에서 gzip compression 적용하기
```conf
gzip             on;
gzip_min_length  10240;
gzip_comp_level  5;
gzip_vary        on;
gzip_disable     msie6;
gzip_proxied     expired no-cache no-store private auth;
gzip_types
                 text/css
                 text/javascript
                 text/xml
                 text/plain
                 text/x-component
                 application/javascript
                 application/x-javascript
                 application/json
                 application/xml
                 application/rss+xml
                 application/atom+xml
                 font/truetype
                 font/opentype
                 application/vnd.ms-fontobject
                 image/svg+xml;
```

<br>

### gzip
```
gzip on|off

# default
gzip off
```

<br>

### gzip_buffers
```
gzip_buffers [number] [size]

# default
gzip_buffers 32 4k or 16 8k
```
* response를 압축하는데 사용되는 buffer count, size
* 기본적으로 buffer size는 memory page size와 같다

<br>

### gzip_comp_level
```
gzip_comp_level [level(1 ~ 9)]

# default
gzip_comp_level 1
```
* response의 gzip compress level 지정
* `level 5`는 size와 CPU 사용량을 완벽하게 절충하여 대부분의 ASCII 파일에 대해 약 75% 감소를 제공(level 9와 거의 동일한 수준)

<br>

### gzip_disable
```
gzip_disable [regex]
```
* regex와 일치하는 `User-Agent` header가 있는 request의 response에 대하여 disable gzipping

<br>

### gzip_min_length
```
gzip_min_length [length]

# default
gzip_min_length 20
```
* gzip으로 압출될 response의 최소 길이(byte)
* `Content-Length` response hedaer에 의해 결정
* 이미 크기가 작고 많이 줄어들 가능성이 없는 것은 압축하지 않는다
  * 작은 파일은 gzipping 후 파일 사이즈가 커질 수 있어서 좋지 않다

<br>

### gzip_proxied
```
gzip_proxied [off|expired|no-cache|no-store|private|no_last_modified|no_etag|auth|any];

# default
gzip_proxied off;
```
* proixed request(Via header가 있는 proxy를 통한 request)에 대한 compression 설정
  * e.g. `via: 1.1 xxxxxxxxxxxxxx.cloudfront.net (CloudFront)` 
  * Client -> CDN(CloudFront...) -> Nginx -> upstream server
  * Client -> Nginx(Front) -> Nginx(Back) -> upstream server

| Option | Description |
| :--|:--|
| off | 모든 proxied request를 압축 X |
| expired | response header에 `Expires`가 있고, 만료되었다면 압축 |
| no-cache | response header에 `Cache-Control: no-cache`가 있으면 압축 |
| no-store | response header에 `Cache-Control: no-store`가 있으면 압축 |
| private | response header에 `Cache-Control: private`가 있으면 압축 |
| no_last_modified | response header에 `Last-Modified`가 없으면 압축 |
| no_etag | response header에 `ETag`가 없으면 압축 |
| auth | request header에 `Authorization`가 있으면 압축 |
| any | 모든 proxied request를 압축 |

<br>

### gzip_types
```
gzip_types [mime-type]

# default
gzip_types text/html
```
* 지정된 MIME type에 대한 response의 gzipping 활성화
* `*`로 모든 MIME type을 지정할 수 있다

<br>

### gzip_vary
```
gzip_vary on|off

# default
gzip_vary off;
```
* `gzip`, `gzip_static`, `gungzip` directive가 활성화된 경우 `Vary: Accept-Encoding` response header 삽입 여부
* client의 `Accept-Encoding` header가 다를 때 리소스의 gzip, non-gzip 모두 caching하여 gzip이 지원되지 않는 client의 이슈 방지


<br>

## Conclusion
* `Contents Compression`는 전송되는 data traffic size를 감소시켜 많은 이점을 얻을 수 있을 수 있으므로 특별한 이슈(보안적)가 없다면 적용하는게 좋다
* server side 설정만으로 쉽게 적용 가능한 web performance tunning
* 설정시에는 `gzip_min_length`, `gzip_proxied`, `gzip_types` 등의 설정을 잘 챙겨 원하는대로 적용되는지 확인 필요


<br><br>

> #### Reference
> * [Module ngx_http_gzip_module - Nginx Docs](http://nginx.org/en/docs/http/ngx_http_gzip_module.html)
> * [Enable Compression - PageSpeed Insights](https://developers.google.com/speed/docs/insights/EnableCompression)
> * [h5bp/server-configs-nginx - GitHub](https://github.com/h5bp/server-configs-nginx/blob/master/h5bp/web_performance/compression.conf)
