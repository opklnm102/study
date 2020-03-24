# [Nginx] Nginx Configuration Snippets
> date - 2020.03.23  
> keyword - nginx  
> [Nginx Configuration Snippets](https://github.com/lebinh/nginx-conf)를 정리

<br>

## Table of Contents
* [The Nginx Command](#the-nginx-command)
* [Rewrite and Redirection](#rewrite-and-redirection)
  * [Force www](#force-www)
  * [Force no-www](#force-no-www)
  * [Force HTTPS](#force-https)
  * [Force Trailing Slash](#force-trailing-slash)
  * [Redirect a Single Page](#redirect-a-single-page)
  * [Redirect an Entire Site](#redirect-an-entire-site)
  * [Redirect an Entire Sub Path](#redirect-an-entire-sub-path)
* [Performance](#performance)
  * [Contents Caching](#contents-caching)
  * [Gzip Compression](#gzip-compression)
  * [Open File Cache](#open-file-cache)
  * [SSL Cache](#ssl-cache)
  * [Upstream Keepalive](#upstream-keepalive)
* [Monitoring](#monitoring)
  * [Luameter](#luameter)
  * [ngxtop](#ngxtop)
* [Security](#security)
  * [Enable Basic Authentication](#enable-basic-authentication)
  * [Only Allow Access From Localhost](#only-allow-access-from-localhost)
  * [Secure SSL settings](#secure-ssl-settings)
* [Miscellaneous](#miscellaneous)
  * [Sub-Request Upon Completion](#sub-request-upon-completion)
  * [Enable Cross Origin Resource Sharing](#enable-cross-origin-resource-sharing)


<br>

## The Nginx Command
* 버전 및 compiling parameters 조회
```sh
$ nginx -V
nginx version: nginx/1.17.9
built by gcc 8.3.0 (Alpine 8.3.0)
built with OpenSSL 1.1.1d  10 Sep 2019
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules ...
```

* 현재 configuration test or 위치 확인
```sh
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

* 재시작 없이 configuration reload
```sh
$ nginx -s reload
2020/03/22 17:59:25 [notice] 38#38: signal process started
```


<br>

## Rewrite and Redirection

### Force www
* [right way](http://nginx.org/en/docs/http/converting_rewrite_rules.html)는 domain에 대해 분리된 server로 설정
```nginx
http {
  ...
  server {
    listen 80;
    server_name example.com;
    return 301 $scheme://www.example.com$request_uri;
  }

  server {
    listen 80;
    server_name www.example.com;
    ...
  }
}
```

<br>

### Force no-www
```nginx
http {
  ...
  server {
    listen 80;
    server_name example.com;
    ...
  }

  server {
    listen 80;
    server_name www.example.com;

    return 301 $scheme://example.com$request_uri;
  }
}
```

<br>

### Force HTTPS
```nginx
http {
  ...
  server {
    listen 80;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;

    # browser에게 HTTPS만 사용하는 것을 알림
    add_haeder Strict-Transport-Security max-age=2592000
    ...
  }
}
```

<br> 

### Force Trailing Slash
* `.`을 포함하지 않는 URL 마지막에 `/`를 영구적으로 추가
  * [Source](http://stackoverflow.com/questions/645853/add-slash-to-the-end-of-every-url-need-rewrite-rule-for-nginx)

```nginx
rewrite ^([^.]*[^/])$ $1/ permanent;
```

<br> 

### Redirect a Single Page
```nginx
http {
  ...
  server {
    location = /oldpage.html {
      return 301 https://example.com/newpage.html;
    }
  }
}
```

<br> 

### Redirect an Entire Site
```nginx
http {
  ...
  server {
    server_name old-site.com;
    return 301 $scheme://new-site.com$request_uri;
  }
}
```

<br> 

### Redirect an Entire Sub Path
```nginx
location /old-site {
    rewrite ^/old-site/(.*) http://example.org/new-site/$1 permanent;
}
```


<br>

## Performance

<br> 

### Contents Caching
* browser가 기본적으로 static contents를 cache하도록 `Expires`, `Cache-Control` header 추가
```nginx
location /static {
  root /data;
  expires max;
}
```

* browser가 cache하지 않도록 하기
```nginx
location = /empty.gif {
    empty_gif;
    expires -1;  # here
}
```

<br> 

### Gzip Compression
```nginx
gzip  on;
gzip_buffers 16 8k;
gzip_comp_level 6;
gzip_http_version 1.1;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types
    text/xml application/xml application/atom+xml application/rss+xml application/xhtml+xml image/svg+xml
    text/javascript application/javascript application/x-javascript
    text/x-json application/json application/x-web-app-manifest+json
    text/css text/plain text/x-component
    font/opentype application/x-font-ttf application/vnd.ms-fontobject
    image/x-icon;
gzip_disable  "msie6";
```

<br> 

### Open File Cache
* static file이 많은 경우 file의 metadata를 caching하면 latency가 절약될 수 있다
```nginx
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
```

<br> 

### SSL Cache
* SSL connection handshake 등 overhead를 줄이기 위해 SSL session 재사용
```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

<br>

### Upstream Keepalive
* upstream server와의 connection을 재사용
  * [Source](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive)

```nginx
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;  # here
}

server {
    ...
    location /api/ {
        proxy_pass http://backend;
        ...
    }
}
```


<br>

## Monitoring
* [Stub Status](http://nginx.org/en/docs/http/ngx_http_stub_status_module.html)는 기본적으로 Nginx의 기본 상태만 제공
  * Client connections - accpeted, handled, active(reading, writing, waiting) 
  * total client request

```nginx
location /status {
  stub_status on;
  access_log off;
}
```

<br>

### Luameter
* [Luameter](https://luameter.com/)
* Nginx status metrics을 JSON API로 제공
  * requests - client로부터 받은 total request count
  * responses - http status(1xx, 2xx, 3xx...)로 grouping된 response count
  * received - client로부터 받은 bytes
  * sent - client로 보낸 bytes
  * rates - 1, 5, 15분의 request rate
  * latency - 5%의 오차와 99.9% 신뢰 수준의 **sampled** request snapshot(min, max, average, median, 75%, 90%, 95%, 99%)
  * cache - hit, miss, bypass, expired, stale, updating, revalidating

<br>

### ngxtop
* [ngxtop](https://github.com/lebinh/ngxtop)
* status checking 및 troubleshooting에 좋은 tool


<br>

## Security

### Enable Basic Authentication
* 먼저 password 파일이 필요
```
name:{PLAIN}plain-text-password
```

* `server`, `location` block에 아래의 설정 추가
```nginx
auth_basic "This is Protected";
auth_basic_user_file /path/to/password-file;
```

<br> 

### Only Allow Access From Localhost
```nginx
location /local {
  allow 127.0.0.1;
  deny all;
  ...
}
```

<br> 

### Secure SSL settings
* default로 `SSLv3` disable하여 [POODLE SSL Attack](http://nginx.com/blog/nginx-poodle-ssl/) 방지
* Ciphers that best allow protection from Beast. [Mozilla Server Side TLS and Nginx]( https://wiki.mozilla.org/Security/Server_Side_TLS#Nginx)
```nginx
# don’t use SSLv3 ref: POODLE CVE-2014-356 - http://nginx.com/blog/nginx-poodle-ssl/
ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;  

# Ciphers set to best allow protection from Beast, while providing forwarding secrecy, as defined by Mozilla (Intermediate Set) - https://wiki.mozilla.org/Security/Server_Side_TLS#Nginx
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
ssl_prefer_server_ciphers  on;
```


<br>

## Miscellaneous

<br> 

### Sub-Request Upon Completion
* request를 처리한 후 다른 backend로 전달할 경우 `post_action` 사용
  * e.g. file download 완료 후 API를 호출하여 download count를 증가시켜 tracking, 가능한 빨리 리턴하고 background에서 처리

```nginx
location = /empty.gif {
  empty_gif;
  expires -1;
  post_action @track;
}

location @track;
  internal;
  proxy_pass http://tracking-backend;
}
```
> 그러나 post_action은 Docs에 나와있지 않다

<br> 

### Enable Cross Origin Resource Sharing
* Allow cross-domain request
```nginx
location ~* \.(eot|ttf|woff) {
  add_header Access-Control-Allow-Origin *;
}
```


<br><br>

> #### Reference
> * [Nginx Configuration Snippets](https://github.com/lebinh/nginx-conf)

<br>

> #### Further reading
> * [Nginx Official Guide](http://nginx.com/resources/admin-guide/)
> * [HTML 5 Boilerplate's Sample Nginx Configuration](https://github.com/h5bp/server-configs-nginx)
> * [Nginx Pitfalls](http://wiki.nginx.org/Pitfalls)
