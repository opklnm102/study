# [Nginx] upstream response is buffered to a temporary file
> date - 2021.05.26  
> keyworkd - nginx, buffer, temporary file  
> nginx에서 나온 upstream response is buffered to a temporary file 해결 과정 정리  

<br>

## Requirement

### Dependency
```
Nginx 1.20.1
```

<br>

## Issue
Nginx에서 아래와 같은 warn log를 확인하여 원인을 살펴보게 되었다
```sh
2021/05/09 07:53:35 [warn] 7#7: *2733 an upstream response is buffered to a temporary file /var/lib/nginx/tmp/proxy/1/00/0000000001 while reading upstream, 
client: xxx.xxx.xxx.xxx, 
server: www.example.com, 
request: "GET /static/event/__01.jpg HTTP/1.1", 
upstream: "https://xxx.xxx.xxxx.xxx:443/static/event/__01.jpg", 
host: "www.example.com", 
referrer: "https://www.example.com/static/event/index.html"
...
```


<br>

## Why?
* response의 size가 설정된 memory buffer를 초과하여 disk buffer가 사용되었음을 의미한다
  * `proxy_buffer_size`, `proxy_buffers`에 설정된 buffer에 맞지 않을 경우 response를 temporary file에 `proxy_max_temp_file_size`만큼 저장

<br>

> #### Nginx가 buffering하는 이유?
> * client는 일반적으로 연결 속도가 훨씬 느리고 application에서 생성한 것만큼 빠르게 response를 소비할 수 없기 때문에 Nginx가 전체 response를 buffering하여 application의 연결을 최대한 빠르게 해제하여 부하를 줄인다
> * application의 성능(low latency, high throughput) 향상을 위해


<br>

## Resolve
3가지 방법으로 접근할 수 있다

<br>

### 1. Increase buffers
* 해당 현상(warning log)이 발생하지 않을 때 까지 buffer size를 2배씩 증가시킨다
```conf
proxy_buffers 16 16k;  # default - 8 4k|8k(one memory page size로 platform에 따라 다르다)
proxy_buffer_size 16k;  # default -  8k|16k
```

<br>

### 2. Disable buffering
* response가 너무 큰 경우(e.g. 5GB video file) buffering을 사용하지 않고, client에 response를 직접 streaming
* application과 client의 연결이 길어져 부하가 증가할 수 있다
```conf
proxy_buffering off;
```

<br>

### 3. Ignore these warnings
* warning이므로 높거나 빈번한 Disk I/O가 발생하지 않는한 무시


<br><br>

> #### Reference
> * [proxy_buffers - Nginx Docs](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffers)
> * [an upstream response is buffered to a temporary file](https://serverfault.com/questions/587386/an-upstream-response-is-buffered-to-a-temporary-file)
> * [K48373902: [warn] message in error log: an upstream response is buffered to a temporary file while reading upstream](https://support.f5.com/csp/article/K48373902)
