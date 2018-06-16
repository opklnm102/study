# [Nginx] Nginx log
> date - 2018.06.17  
> keyword - nginx, access log, error log, log format, virtual host logging  
> Nginx에서 log는 특별히 설정하지 않아도 분석하는데 불편함이 없지만 하루에 쌓이는 양이 많다면 불필요한 정보는 남기지 않던가 알아보기 좋게 남기는게 좋기 때문에 Nginx에서 제공하는 log 설정에 대해 알아보자

<br>

## log_format
* `log_format` directive로 `로그 형식` 설정
* `http` context에서만 지정 가능
* `공통 변수`와 `로그 작성시에만 생성되는 변수`만 사용 가능
* `combined` format을 사용하면 많은 log analysis tool(ELK, splunk..)에 pre-built filter가 있으므로 편리하다
* `log_format은 access_log directive 보다 위`에 와야한다
   * 아래에 있으면 Nginx가 찾지 못한다

<br>

### syntax
```sh
log_format <format name> [escape=default | json | none] '<set of variables to define format>';
```

<br>

### 사용할 수 있는 log format
| | |
|:--|:--|
| $remote_user | HTTP Authorization으로 접속했을 때 사용자 계정 |
| $remote_addr | 방문자 IP |
| $time_local | Common Log format의 request을 처리한 시간(서버 기준) |
| $time_iso8601 | ISO 8601 format의 local time |
| $request | 방문자 요청 |
| $http_user_agent | 방문자가 사용한 브라우저 |
| $http_referer | 해당 페이지가 이전에 거쳐온 URL |
| $http_x_forwarded_for | proxy 서버를 거치기 전의 IP |
| $request_method | request http method |
| $request_body | request body |
| $request_length | request line, header, body를 포함한 request의 길이 |
| $request_time | request 처리 시간(ms) <br> client로부터 1번째 byte를 수신한 시점 ~ client로 마지막 byte를 전송한 시점 |
| $status | response HTTP status code |
| $body_bytes_sent | 보낸 데이터(byte) |
| $connection | log를 남길 당시의 connection count |
| $connection_requests | connection을 통해 만들어진 current request count |
| $bytes_sent | clinet에 송신된 byte 수 |
| $msec | 로그를 남긴 시간(ms) |
| $pipe | request가 pipeline된 경우 `p`, 아니면 `.` |
| $host | 현재 host IP |

<br>

> * 응답시간 지연이 발생할 때 `request_time`, `connection`을 통해 어느 정도 해당 웹서버의 상태 파악 가능
> * nginx 앞단에 reverse proxy가 있을 경우 `$remote_addr`에는 reverse proxy의 IP가 찍히므로 `$http_x_forwarded_for`를 이용해 방문자의 IP를 남긴다

---

<br>

## access_log
* `access_log` directive로 access log 파일 설정
* `http, server, location` context에 지정 가능
* Nginx에서 모든 request는 `ngx_http_log_module`을 사용하여 지정된 형식으로 access log에 저장된다
* `/var/log/nginx/access.log`가 default log 파일
* default format은 `combined` or `main`

<br>

### syntax
```sh
access_log <log file path> [format [buffer=size] [gzip[=level]] [flush=time] [if=condition]];
access_log off;  # access logging 끄기

# simple form
access_log /path/log_file <format name>;
```

<br>

### Example

#### 1. nginx config 수정
```sh
# /etc/nginx/nginx.conf
http {
    ...

    ##
    # Logging Settings
    ##
    # log format -> access_log directive 보다 위에 와야한다
    # main(default config)
    log_format main '$remote_addr - $remote_user [$time_local] "$request"'
                    '$status $body_bytes_sent "$http_referer"'
                    '"$http_user_agent" "$http_x_forwarded_for"';

    log_format custom 'remote_addr - $remote_addr \n'
                      'remote_user - $remote_user \n'
                      'time_local - $time_local \n'
                      'request - $request \n'
                      'status - $status \n'
                      'body_bytes_sent - $body_bytes_sent \n'
                      'http_referer - $http_referer \n'
                      'http_user_agent - $http_user_agent \n'
                      'http_x_forwarded_for - $http_x_forwarded_for \n'
                      'msec - $msec \n'
                      'request_time - $request_time \n'
                      'connection - $connection \n';
    
    access_log /var/log/nginx/access.log main;
    access_log /var/log/nginx/custom_access.log custom;
    ...
}
```

#### 2. Nginx에 수정한 Config 적용
```sh
$ sudo service nginx reload

# reload가 안된다면 restart
$ sudo service nginx restart
```

#### 3. log result
```sh
# /var/log/nginx/access.log
## log_format - main(default)
127.0.0.1 - - [10/Jun/2018:11:45:32 +0000] "GET / HTTP/1.1" 200 512 "-" "curl/7.47.0"

# /var/log/nginx/custom_access.log
## log_format - custom
remote_addr - 127.0.0.1
remote_user - -
time_local - 10/Jun/2018:11:47:32 +0000
request - GET / HTTP/1.1
status - 200
body_bytes_sent - 612
http_referer - -
http_user_agent - curl/7.47.0
http_x_forwarded_for - -
msec - 1528631252.373
request_time - 0.000
connection - 8
```

<br>

### Advanced access log configuration
```sh
# 32K의 buffer를 이용하여 custom format으로 logging
access_log /var/log/nginx/custom.log custom buffer=32k;

# compression format으로 5분 후 gzip으로 압축해서 logging
access_log /var/log/nginx/custom.gz compression gzip flush=5m;
```

<br>

### buffer parameter

#### buffering 시 데이터가 파일에 기록되는 경우
* 다음 log line이 buffer에 맞지 않은 경우
* buffering된 데이터가 flush에 지정된 시간보다 오래된 경우
* worker process가 log 파일을 다시 열거나 닫을 때

#### buffer를 추가하면 좋은점?
* File 쓰기 작업에는 CPU 및 I/O Cycle을 사용하므로 모든 request를 logging하면 성능에 좋지 않다
* buffer된 것을 1번에 파일에 기록하여 `CPU 및 I/O Cycle을 줄일 수 있다`

<br>

> #### nginx reload , restart 시 error가 발생한다면? 
> * `journalctl -xe`나 `service nginx status`를 살펴보자
>
> ```sh
> $ journalctl -xe
> ```
> ![journalctl -xe when error](https://github.com/opklnm102/study/blob/master/nginx/images/journalctl-xe.png)
> 
> ```sh
> $ service nginx status 
> ```
> ![nginx status when error](https://github.com/opklnm102/study/blob/master/nginx/images/service-nginx-status.png)

---

<br>

## error_log
* nginx가 어떤 결함이 있는 경우, error log에 기록
* `error_log` directive로 log 파일 지정
* `main, http, mail, stream, server, location` context에 지정
* main은 순서대로 하위 수준에 상속
   * 하위 수준의 설정은 상위 수준에서 상속된 설정보다 우선시

<br>

### syntax
```sh
error_log <log file path> <log level>;
```

<br>

### error level

| | |
|:--|:--|
| debug | debug 정보 |
| info | 기본 정보 제공 <br> 알아두면 좋은 정보 |
| notice | 정상 수준의 메시지 <br> 주목할만한 가치가 있다 |
| warn | 경고 수준의 메시지 |
| error | 프로세스 처리시 오류 <br> 오류가 발생, 무언가 실패|
| crit | 프로세스에 영향을 줄 수 있는 오류 <br> 해결해야할 중요한 문제 |
| alert | 대응이 신속하게 필요한 심각한 상황 <br> 프로세스에 영향을 줄 수 있는 오류(좀 더 심각) |
| emerg | 서비스 불가 수준의 오류(주로 Syntax가 잘못된 경우) |

<br>

### Example
* `warn, crit, alert, emerg` level logging
```sh
error_log /var/log/nginx/error.log warn;
```

* `crit, alert, emerg` level logging
```sh
error_log /var/log/nginx/error.log crit;
```

* error가 발생하면 `가장 가까운 context`에 logging
```sh
# /etc/nginx/nginx.conf
http {
    ...
    error_log /var/log/nginx/error.log crit;

    server {
        ...
        server_name example1.com;

        # this logs errors messages for example1.com only
        error_log /var/log/nginx/example1_error.log warn;
        ...
    }

    server {
        server_name example2.com;

        # this logs errors messages for example2.com only
        error_log /var/log/nginx/example2_error.log;
        ...
    }
}
```

* 2개 이상의 `error_log`를 지정하면 정의된 모든 설정에 로깅
   * nginx 1.5.2부터 가능

```sh
# /etc/nginx/nginx.conf
http {
    ...
    server {
        listen 80;
        server_name example1.com;

        error_log /var/log/nginx/example1/warn_error.log warn;
        error_log /var/log/nginx/example1/crit_error.log crit;
        ...
    }
}
```

---

<br>

## Configuring Conditional Logging 
* Nginx가 모든 메시지를 logging할 필요는 없기 때문에 조건에 따라 logging할 수 있다
   * 특정 인스턴스에 대한 access log에서 덜 중요한 메시지 무시 등..
* 값을 다른 변수의 값에 의존하는 변수를 만드는 `ngx_http_map_module`을 사용
   * `map` block
      * http context에만 사용 가능
      * map block 내부의 변수는 소스와 결과값 사이의 매핑을 지정한다
      * 조건이 0 또는 빈 문자열로 평가되면 로깅하지 않는다

### Example
* HTTP status code 2xx와 3xx은 logging 제외
```sh
# /etc/nginx/nginx.conf
http {
    map $status $loggable {
        ~^[23] 0;
        default 1;
    }
    server {
        access_log /var/log/nginx/loggable.log if=$loggable;
    }
}
```

* 모든 메시지를 무시하고 debug 정보만 logging
   * 개발 단계에서 디버깅하는데 유용

```sh
# /etc/nginx/nginx.conf
http {
    map $info $debuggable {
        default 0;
        debug 1;
    }

    server {
        access_log /var/log/nginx/debug_access.log if=$debuggable;
        ...
    }
}
```

> syslog를 포함하여 더 많은 정보를 찾을 수 있다 
> -> [Logging to Syslog](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/#logging-to-syslog)

---

<br>

## Parsing Logs 
* http status code 빈도수 출력
```sh
# /var/log/nginx/access.log
127.0.0.1 - - [10/Jun/2018:11:45:32 +0000] "GET / HTTP/1.1" 200 512 "-" "curl/7.47.0"
127.0.0.1 - - [10/Jun/2018:11:45:35 +0000] "GET / HTTP/1.1" 200 512 "-" "curl/7.47.0"
127.0.0.1 - - [10/Jun/2018:11:45:37 +0000] "GET /a HTTP/1.1" 400 512 "-" "curl/7.47.0"
127.0.0.1 - - [10/Jun/2018:11:45:40 +0000] "GET /s HTTP/1.1" 404 512 "-" "curl/7.47.0"
127.0.0.1 - - [10/Jun/2018:11:45:50 +0000] "GET /a HTTP/1.1" 400 512 "-" "curl/7.47.0"
127.0.0.1 - - [10/Jun/2018:11:45:55 +0000] "GET / HTTP/1.1" 200 512 "-" "curl/7.47.0"

$ tail -f /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c | sort -rn 

3 200
2 400
1 404
```

---

<br>

## Separating Error Logs per Virtual Host
* virtual host가 여러 개인 경우 각각에 대해 별도의 error log를 유지하는게 좋다
* virtual host는 완전히 독립적일 수 있으며 다른 관리자가 관리할 수도 있어야 하기 때문에 각각 access, error logging 필요


```sh
# /etc/nginx/nginx.conf
error_log /var/log/nginx/main_error.log;

http {
    ...
    error_log /var/log/nginx/http_error.log;

    server {
        server_name one.io;
        access_log /var/log/nginx/one/access.log;
        error_log /var/log/nginx/one/error.log;
    }

    server {
        server_name two.io;
        access_log /var/log/nginx/two/access.log;
        error_log /var/log/nginx/two/error.log;
    }
    ...
}
```

> #### log는 발생 지점부터 가장 가까운 설정이 적용된다
> * 중복으로 logging하지 않는다
>   * location context에서 남기면 server context에서 남기지 않는다
>   * server context에서 남기면 http context에서 남기지 않는다


* virtual host별로 파일도 분리
```sh
# /etc/nginx/nginx.conf
error_log /var/log/nginx/main_error.log;

http {
    ...
    error_log /var/log/nginx/http_error.log;

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;  # conf.d의 모든 conf를 http context에 include
    ...
}

# /etc/nginx/conf.d/one.conf
server {
    server_name one.io;
    access_log /var/log/nginx/one/access.log;
    error_log /var/log/nginx/one/error.log;
}

# /etc/nginx/conf.d/two.conf
server {
    server_name two.io;
    access_log /var/log/nginx/two/access.log;
    error_log /var/log/nginx/two/error.log;
}
```

<br>


> #### 참고
> * [How to Configure Custom Access and Error Log Formats in Nginx](https://www.tecmint.com/configure-custom-access-and-error-log-formats-in-nginx/)
> * [Nginx Doc - Configuring Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)
> * [Module ngx_http_log_module](https://nginx.org/en/docs/http/ngx_http_log_module.html)
> * [Configuring the Nginx Error Log and Access Log](https://www.keycdn.com/support/nginx-error-log/)
> * [Nginx Doc - Core functionality](http://nginx.org/en/docs/ngx_core_module.html#error_log)
> * [Separating Error Logs per Virtual Host](https://www.nginx.com/resources/wiki/start/topics/examples/separateerrorloggingpervirtualhost/)
> * [NGINX 로그 포맷 및 레벨 설정 방법](https://extrememanual.net/10140)
> * [Add buffer to access_log to reduce CPU and I/O cycles](https://github.com/jwilder/nginx-proxy/issues/855)
