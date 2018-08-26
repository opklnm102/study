# [Nginx] Nginx Error Page
> date - 2018.08.27  
> keyword - nginx, 404, error page  
> Nginx에서 404 error page를 보여주는 법을 정리

<br>

/var/www/html/404.html 이 있다고 가정

* status 404로 response
```sh
server {
    ...

    location / {
        proxy_intercept_errors on;  # here

        proxy_pass http://localhost:8080;

        error_page 404 = /404.html;  # here
    }
}
```

* status 304로 response
```sh
server {
    ...

    location / {
        proxy_intercept_errors on;  # here

        proxy_pass http://localhost:8080;

        error_page 404 = /404.html;  # here
    }

    location /404.html {
        root html;
        internal;  # here
    }
}
```

<br>

> #### [internal](http://nginx.org/en/docs/http/ngx_http_core_module.html#internal)
> ```
> Syntax:	internal;
> Default:	—
> Context:	location
> ```
> * 특정 location이 nginx 내부 요청에서만 유효하고 외부 요청에서는 404로 응답하도록 한다
> * 에러 페이지 등에 사용

<br>

### 여러 에러 코드들을 한번에 처리 가능
```sh
location / {
    error_page 404 500 502 503 504 = /error.html
}

```

<br>

### server context에서도 가능
```sh
server {
    ...

    error_page 404 = /404.html
}
```

---

<br>

> #### Reference
> * [Nginx - Customizing 404 page](https://stackoverflow.com/questions/1024199/nginx-customizing-404-page)
