# [Nginx] nginx_status 설정
> date - 2018.06.08  
> keyword - nginx, status monitoring  


## nginx.conf에 추가
```sh
# /etc/nginx/nginx.conf
server {
    ....
    location /nginx-status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    ...
}
```

## nginx configuration reloading
```sh
$ sudo service nginx reload
```

## status check
```sh
$ curl http://127.0.0.1:80/nginx_status
Active connections: 1
server accepts handled requests
 28644 28644 32733
Reading: 0 Writing: 1 Waiting: 0
```

## 확인할 수 있는 정보
1. Active Connections
2. total accepted connections
3. total handled connections (보통 2번과 동일합니다)
4. number of and handles requests
5. Reading : nginx reads request header
6. Writing : nginx reads request body, processes request, or writes response to a client
7. Waiting : keep-alive connections, actually it is active

> plus 버전이 아니라면, nginx_status는 현재 연결된 connection, request 정보만 실시간으로 제공한다는 제약이 있다
> Todo: 위의 제약을 해결하여 nginx를 모니터링을 할 수 있는 방법 추가

<br>

---

> #### 참고
> * [Linux에서 Nginx 1.10.1 설치하고 nginx_status 설정하기](https://sarc.io/index.php/nginx/592-linux-nginx-1-10-1-nginx-status)
