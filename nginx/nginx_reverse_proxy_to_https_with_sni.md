# [Nginx] Nginx reverse proxy to https with SNI
> date - 2020.03.06  
> keyworkd - nginx, sni, server name indication  
> nginx에서 reverse proxy로 https 사용시 발생한 SNI 관련 에러에 대해 정리

<br>

## Requirement

### Dependency
```
nginx version: nginx/1.16.1
built with OpenSSL 1.1.1d  10 Sep 2019
TLS SNI support enabled
```


<br>

## Issue
* Nginx에서 `proxy_pass`를 이용해 backend service를 변경 했는데 502 Bad Gateway 발생
* Nginx에서는 아래와 같이 설정되어 있었다
```sh
http {
  ...
  server {
    ...
    location /proxy/ {
      # before
      proxy_pass https://first.example.com/;

      # after
      proxy_pass https://second.example.io/;
  }
}
```

<br>

### Nginx error log
```sh
2020/03/03 05:37:33 [error] 8#8: *3 SSL_do_handshake() failed (SSL: error:14094438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:SSL alert number 80) while SSL handshaking to upstream, client: 172.16.1.184, server: dev.example.com, request: "GET /proxy/example.html HTTP/1.1", upstream: "https://23.44.7.185:443/example.html", host: "dev.example.com"
2020/03/03 05:37:33 [warn] 8#8: *3 upstream server temporarily disabled while SSL handshaking to upstream, client: 172.16.1.184, server: dev-m.dailyhotel.me, request: "GET /proxy/example.html HTTP/1.1", upstream: "https://32.45.1.110:443/example.html", host: "dev.example.com"
2020/03/03 05:43:13 [error] 8#8: *850 no live upstreams while connecting to upstream, client: 10.2.69.0, server: dev.example.com, request: "GET /proxy/example.html HTTP/1.1", upstream: "https://second.example.io/example.html" host: "dev.example.com"
```
* nginx error log를 보면 **SSL handshake**와 관련된 error인 것을 확인할 수 있다

<br>

### Certificate 비교
* 기존과 같은 `https`를 사용하는 host를 넣었는데 왜..? 발생하는지 의문이여서 certificate를 비교

| Common Name(CN) | Deployment Type |
|:--|:--|
| *.example.com | VIP |
| *.example.io | SNI-Only |

* certificate의 deployment type이 다른 것을 확인할 수 있었다


<br>

## Resolve

### Solution 1
* proxy 연결에 http를 사용한다
```sh
http {
  ...
  server {
    ...
    location /proxy/ {
      proxy_pass http://second.example.io/;
  }
}
```
* nginx와 backend service 간의 통신이 private이면 사용에 무리가 없으나 public일 경우 보안적으로 좋은 선택은 아니다

<br>

### Solution 2
* SNI(RFC 6066)을 통한 proxied HTTPS server와 연결을 설정하도록 `proxy_ssl_server_name` 추가
```sh
http {
  ...
  server {
    ...
    location /proxy/ {
      proxy_pass  https://second.example.io/;
      proxy_ssl_server_name on;  # here
  }
}
```


<br>

## Conclusion
* certificate를 발급받고, 배포하면서 지원하는 방식에 따라 발생하는 차이를 몰라서 발생한 이슈였다
* SNI에 대해 알아볼 필요가 있다


<br><br>

> #### Reference
> * [Nginx reverse proxy to Heroku fails SSL Handshake](https://config9.com/apps/nginx/nginx-reverse-proxy-to-heroku-fails-ssl-handshake/)
> * [Nginx reverse proxy to Heroku fails SSL handshake - Stack Overflow](https://stackoverflow.com/questions/38375588/nginx-reverse-proxy-to-heroku-fails-ssl-handshake)
> * [Module ngx_http_proxy_module - Nginx Docs](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_ssl_server_name)
