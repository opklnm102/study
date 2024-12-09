# [Nginx] Nginx Proxy Configuration
> date - 2021.06.08  
> keyword - nginx, proxy  
> Nginx의 proxy configuration에 대해 정리  

<br>

## Nginx Configuration
```nginx
daemon off;
user nginx nginx;
worker_processes auto;
pid /var/run/nginx.pid;

# Logging to stderr enables better integration with Docker and Kubernetes
error_log stderr warn;

events {
  worker_connections 4096;
}

http {
  include /etc/nginx/mime.types;
  server_tokens off;
  client_max_body_size 32m;

  upstream app_server {
    server localhost:8080;
    keepalive 128;  # keepalive max connections
  }

  server {
    location /health {
      access_log off;
      return 'alive'
    }
    location /nginx_status {
      stub_status on;
      access_log off;
    }

    location / {
      proxy_pass http://app_server
      proxy_redirect off;  # upstream에서 발생한 redirection(Location header)을 그대로 전달

      # keepalive 활성화시 HTTP/1.1 사용 권장
      proxy_http_version 1.1;
      proxy_set_header Connection "";

      # `proxy_set_header`를 통해 upstream으로 트래픽을 라우팅할 때 `X-Forwarded-For` 같은 header를 설정
      proxy_set_header Host $host
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # `X-Forwarded-For` header의 1번째 값으로 request를 보낸 client의 IP address를 알 수 있다
      proxy_set_header X-Forwarded-Host $server_name;

      # upstream과의 timeout 설정
      proxy_send_timeout 300s;  #  upstream으로 data를 전송할 때 timeout
      proxy_read_timeout 300s;  #  upstream으로부터 data를 읽을 때 timeout
      proxy_connect_timeout 300s;  # upstream과의 connection timeout, 연결시에만 적용되는 timeout
      send_timeout 300s;  # client에 response 전송할 때 timeout
    }
  }
}
```
* upstream server로 proxy할 때 HTTP/1.0(default) 및 `Connection: close` header 사용, [keepalive](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive) 활성화시 HTTP/1.1 사용 권장


<br><br>

> #### Reference
> * [GoogleCloudPlatform/endpoints-samples](https://github.com/GoogleCloudPlatform/endpoints-samples/blob/master/k8s/nginx.conf)
> * [Module ngx_http_core_module - Nginx Docs](http://nginx.org/en/docs/http/ngx_http_core_module.html)
> * [proxy_http_version - Nginx Docs](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version)
> * [keepalive - Nginx Docs](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive)
