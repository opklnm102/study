# [HTTP] 426 Upgrade Required
> date - 2024.12.08  
> keyword - http  
> HTTP 426 Upgrade Required status code로 인한 이슈 정리  

<br>

## Issue
```
HTTP/1.1 426 Upgrade Required
```
* reverse proxy인 nginx에서 요청시 HTTP `426 Upgrade Required` 발생


<br>

## Why?
* **HTTP 426**은 client가 지원하지 않는 protocol을 사용할 때 server에서 보내는 client error로 response에 있는 protocol로 upgrade하면 이후에는 처리 가능하다는 것을 의미

<br>

### case 분석
* HTTP/1.0 사용 - server가 HTTP/1.1 426 Upgrade Required 응답

```sh
$ curl --http1.0 -v test.example.com/health
...
< HTTP/1.1 426 Upgrade Required
```

* HTTP/1.1 사용 - 정상 응답
```sh
$ curl --http1.1 -v test.example.com/health
...
< HTTP/1.1 200 OK
```

<br>

### Nginx 설정 확인
* nginx는 [proxy_http_version](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version)에 따라 upstream server로 proxy 할 때 HTTP/1.0(default), `Connection: close` header로 전달


<br>

## Resolve
* client가 http 1.1을 사용하도록 하거나 reverse proxy(e.g. nginx)가 있다면 아래처럼 reverse proxy에서 http 1.1로 보내도록 설정
```nginx
http {
  ...
  server {
    listen 80;
    server_name _;

    location / {
      proxy_http_version 1.1;  # here
      proxy_set_header Connection "";  # here
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

      proxy_pass $scheme://$host:$server_port$request_uri;
    }
  }
}
```


<br><br>

> #### Reference
> * [426 Upgrade Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/426)
> * [proxy_http_version - Nginx Docs](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version)
> * [keepalive - Nginx Docs](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive)
