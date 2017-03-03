# Nginx directive - root vs alias

> date - 2017.03.03  
> keyword - nginx, root, alias  
> nginx로 static file serving 설정 중 계속 404에러가 발생해서 stackoverflow 찾다가 `root`, `alias`로 둘다 해보고 차이점을 정리


## root
* location으로 넘어온 경로를 root로 설정한 경로에 추가
* [nginx-root](http://foofish.qiniudn.com/nginx-root.png)

### ex. request url - 127.0.0.1/static일 경우
```sh
# var/www/app/static/static에서 찾는다
location /static {
    root /var/www/app/static;
    autoindex off;
}

# var/www/app/static에서 찾는다
location /static {
    root /var/www/app;
    autoindex off;
}
```

## alias
* location으로 넘어온 경로를 alias로 설정한 경로로 대체
* [nginx-alias](http://foofish.qiniudn.com/nginx-alias.png)

### ex. request url - 127.0.0.1/static일 경우
```sh
# var/www/app/static에서 찾는다
location /static {
    alias /var/www/app/static;
    autoindex off;
}
```

### 특정 파일 serving하기
```sh
# 직접 특정파일을 지정
location = /robots.txt {
    alias /usr/share/nginx/html/dir/robots.txt;
}
```

### root, alias로 static file을 serving할 경우 어떻게 구분해서 써야할까?
[Nginx Docs](http://nginx.org/en/docs/http/ngx_http_core_module.html#alias)에 따르면 
`location directive의 uri`가 `root directive`의 마지막 부분과 일치할 경우 root를 사용하는걸 권장한다
```sh
# before
location /static {
    alias /var/www/app/static;
}

# after
location /static {
    root /var/www/app;
}
```


> #### 참고  
> [Nginx — static file serving confusion with root & alias](http://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias)  
> [nginx: root vs alias](http://ohgyun.com/556)
<br/>
> #### 더보면 좋을 것
> [nginx location 설정(http://kwonnam.pe.kr/wiki/nginx/location)
