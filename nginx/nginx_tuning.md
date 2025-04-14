

https://www.nginx.com/blog/tuning-nginx/
-> 이거 정리하기

https://gagor.pl/2016/01/optimize-nginx-for-performance/
-> 이것도






https://github.com/jwilder/nginx-proxy/issues/855 -> 여기서 위 블로그 찾아냄

모든 요청을 로깅하면 CPU 및 I / O주기가 모두 소모되므로 영향을 줄이는 한 가지 방법은 액세스 로그 버퍼링을 사용하는 것입니다.

버퍼링을 사용하면 각 로그 항목에 대해 별도의 쓰기 작업을 수행하는 대신 NGINX는 일련의 항목을 버퍼링하고 단일 작업으로 파일에 함께 기록합니다.







https://github.com/denji/nginx-tuning
https://www.f5.com/company/blog/nginx/tuning-nginx
https://www.linode.com/docs/guides/how-to-configure-nginx/
https://github.com/pkgonan/nginx-tuning/blob/master/.ebextensions/02-nginx-root.config






keep-alive disable
```nginx
user nobody nobody;
pid /data/logs/nginx/nginx.pid;
error_log /data/logs/nginx/error.log;
 
worker_processes auto;
events {
  worker_connections 2048;
}
 
http {
  # General
  include mime.types;
  default_type application/octet-stream;
  charset utf-8;
 
  log_format timed_combined '$remote_addr - $remote_user [$time_local]  '
  '"$request" $status $body_bytes_sent '
  '"$http_referer" "$http_user_agent" $request_time '
  '$upstream_response_time "$upstream_addr"';
 
  # Log
  access_log /data/logs/nginx/access.log timed_combined;
 
  # Tuning
  server_tokens off;
  sendfile on;
  keepalive_timeout 0;
 
  # Compression
  gzip on;
  gzip_http_version 1.1;
  gzip_vary on;
  gzip_comp_level 6;
  gzip_proxied any;
  gzip_types application/x-javascript application/javascript application/xml text/javascript application/json text/json text/css text/plain application/xhtml+xml application/rss+xml;
  gzip_buffers 16 8k;
  gzip_disable "msie6";
 
  include health.conf;
  include hosts/*.conf;
}
```

health.conf

hosts/tomcat.conf, hosts/rabbitmq.conf, ...
conf를 추가하면 여러 서버 설정을 유지할 수 있다

```nginx
upstream app{
    server localhost:8080;
    keepalive 32;
}
 
server {
    listen 80;
    server_name xxx.example.com;
 
    root /xxx/webroot;
 
    location / {
        proxy_pass http://app;
        proxy_redirect off;
        # upstream keep-alive
        proxy_http_version 1.1;
        proxy_set_header Connection "";
 
 
        # bypass real host
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_intercept_errors off;
        proxy_connect_timeout 10;
        proxy_send_timeout 10;
        proxy_read_timeout 60;
        proxy_buffer_size 8k;
        proxy_buffers 10 512k;
        proxy_busy_buffers_size 512k;
        proxy_temp_file_write_size 512k;
 
        client_max_body_size 10m;
        client_body_buffer_size 512k;
 
 
        if ($uri ~* "(/resources/.*)$") {
            expires 30d;
        }
    }
     
    error_page  403     /403.html;
    location /403.html {
        proxy_pass http://{CDN}/system/error403.html;
    }
 
    error_page  501 502 503  /50x.html;
    location /50x.html {
        proxy_pass http://{CDN}/system/error500.html;
    }
}
```

resolver 설정
- proxy_pass directive 를 사용할 경우 target에 domain name 을 사용할 경우에는 resolver 설정을 해야 한다.
- resolver 설정을 하지 않을 경우 서버의 주소가 변경되는 경우가 발생해도 nginx 는 이미 캐싱한 ip 를 사용하기 때문에 새로운 서버로 요청을 보낼 수가 없다
- 특히 aws elb (clb, alb, nlb) 를 사용할 경우, elb 는 동적으로 ip 가 변경될 수 있기 때문에 resolver 설정을 해야 한다
```nginx
server {
  ...
    #### http://nginx.org/en/docs/http/ngx_http_core_module.html#resolver 참고
    resolver 10.32.0.2 ; # /etc/resolv.conf의 nameserver의 ip 를 사용하면 된다. 
 
    set $app "http://app.example.com"; # proxy_pass 에서 사용할 target을 변수로 선언한다
     
    location / {
        proxy_pass $app;  # 위에서 설정한 값을 이용한다
    }
}
```
https://tenzer.dk/nginx-with-dynamic-upstreams/
-> nginx 1.27.3부터는 upstream block의 server에서 resolve 사용 가능하여 위의 방법 불필요
> https://nginx.org/en/CHANGES

ELB에서 간헐적 502 발생
  - nginx에서 keep-alive 설정을 사용할 경우 ELB idle timeout보다 긴 keepalive_timeout을 설정하지 않으면 발생할 수 있음


https://aws.amazon.com/premiumsupport/knowledge-center/apache-backend-elb/?nc1=h_ls
- Keep-Alive 설정여부
  - keepalive_timeout 값을 설정할 수 있다.
  - 앞에 ALB, ELB 가 있다면 timeout 보다 큰 값 (2-3배) 으로 설정해야 한다.
- Backend 가 원격이라면 반드시 proxy_http_version 값을 1.1 로 해야 한다.
  - 그 이유는 1.0 에서는 Http 에 압축을 지원하지 않기 때문에 성능이 나오지 않는다.


