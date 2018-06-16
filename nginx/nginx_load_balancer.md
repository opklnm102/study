# [Nginx] Load Balancer
> date - 2018.05.06  
> keyword - nginx, load balancer  
> nginx의 reverse proxy 기능을 살펴보던 중 load balancing 기능도 알게되어 정리


* 일반적으로 reverse proxy는 load balance 기능을 포함한다
* reverse proxy와 load balancer는 Client-Server Architure의 구성 요소
   * 둘 다 중개자로써 효율성을 향상시킨다


## Load Balancing이란?
* 들어오는 network traffic을 server farm, server pool이라고 하는 `backend server group에 효율적으로 분배`하는 것을 의미
* 각 server의 리소스를 최대한 활용하고 모든 server의 과부하를 방지하며 가장 빠르게 응답하는 방식으로 부하를 분산시킨다
* client로 가는 error response 수를 줄임으로서 UX(user experience)를 향상시킬 수 있다
   * 안정성
* 온라인 상태의 server에만 요청을 보내 High-Availability와 reliability 보장
   * server 다운을 감지하여 요청을 그룹의 다른 server로 전달
* 요구사항에 따라 서버를 축소하거나 축소할 수 있는 유연성 제공

---

## Load Balancer 사용 시기
* traffic이 단일 backend server가 효율적으로 처리하기에는 너무 많아 여러 server가 필요할 때
   * traffic이 많은 서비스는 수십만 건의 동시 요청에 대해 data(text, image, video 등)를 빠르고 안정적으로 제공해야 한다
   * 이러한 요구에 비용 효율적으로 확장하려면 서버를 추가해야 한다
   * scale out이라고 함
* SPOF(single point of faulure)가 제거되므로 서비스의 안정성이 향상

---

## Nginx의 Load Balancing을 위한 기능

### Application health check
* 일반 요청에 대한 error 응답을 가로채서 server 상태를 감지
   * 별도의 요청으로 health check하는 것보다 유연하고 정교한 방법


### Session persistence
* 특정 client의 모든 요청을 동일한 backend server로 전달하는 기능
* HTTP가 stateless일지라도 장바구니 같은 기능을 제공하기 위해 상태 정보를 저장해야 할 경우가 있다
   * 요청을 다른 backend server로 전달할 경우 성능이 저조하거나 실패할 수 있기 때문에


### Dynamic Configuration of Server Group
* EC2와 같이 backend server 수가 빠르게 변하는 환경에서 기존 connection을 중단시키지 않고 group에서 server를 동적으로 추가, 제거할 수 있다

---

## Load Balancing Algorithms

### Round Robin
* backend server group에 순차적으로 전달
* 모든 backend server에 동일하게 요청을 분산

```sh
# nginx.conf
http {
    upstream myproject {
        server 127.0.0.1:8080 weight=3;  # weight 설정 가능(default 1)
        server 127.0.0.1:8081;
        server 127.0.0.1:8082;
    }

    server {
        listen 80;
        server_name www.example.io;
        location / {
            proxy_pass http://myproject;
        }
    }
}
```

### Least Connections
* connection 수가 가장 적은 backend server로 전달

```sh
# nginx.conf
http {
    upstream myproject {
        least_conn;
        server 127.0.0.1:8080 weight=3;  # weight 설정 가능(default 1)
        server 127.0.0.1:8081;
    }
    ...
}
```

### IP Hash
* IP를 기반으로 backend server로 전달
* IP 주소가 같다면 동일한 backend server로 전달

```sh
# nginx.conf
http {
    upstream myproject {
        ip_hash;
        server 127.0.0.1:8080;
        server 127.0.0.1:8081;
        server 127.0.0.1:8082;
        server 127.0.0.1:8083 down;  # IP의 hashing을 유지한채 load balancing group 일시적으로 제외. 요청은 group의 다음 서버로 전달
    }
    ...
}
```

### Generic Hash
* 전송된 text, 변수 등을 조합하여 hash key로 사용
   * IP, URI 
* upstream group에 변화가 생기면 cache 손실을 최소화하는 몇개의 key만 다시 매핑

```sh
# nginx.conf
http {
    upstream myproject {
        hash $request_uri consistent;
        server 127.0.0.1:8081;
        server 127.0.0.1:8082;
    }
    ...
}
``` 

### Least Time
* Nginx Plus에서만 제공하는 알고리즘
* 각 요청에 대해 평균 latency가 가장 짧고, active connection이 가장 적은 server를 선택
* 평균 latency는 `least_time` parameter에 따라 계산
   * header - server에서 1번째 byte를 수신한 시간
   * last_byte - server로부터 전체 응답 수신 시간

```sh
# nginx.conf
http {
    upstream myproject {
        least_time header;
        server 127.0.0.1:8081;
        server 127.0.0.1:8082;
    }
    ...
}
``` 

> #### 주의
> * hash, ip_hash, least_conn, least_time 등의 지시문은 upstream block의 상단에 정의
>
> #### backup
> ```sh
> # nginx.conf
> http {
>     upstream myproject {
>         server 127.0.0.1:8081;
>         server 127.0.0.1:8082 backup;  # load balancing 대상에서 제외
>     }
>     ...
> }
> ```
> 
> #### Server Slow-Start
> ```sh
> http {
>     upstream myproject {
>         server 127.0.0.1:8081;
>         server 127.0.0.1:8082 slow_start=30s;  # 30s 후에 정상 load balancing 대상에 포함, 서서히 weight를 높인다
>     }
>     ...
> }
> ```

</br>

> #### 참고
> * [WHAT IS A REVERSE PROXY VS. LOAD BALANCER?](https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer)
> * [WHAT IS A REVERSE PROXY SERVER?](https://www.nginx.com/resources/glossary/reverse-proxy-server)
> * [Nginx example - Simple Load Balancing](https://www.nginx.com/resources/wiki/start/topics/examples/loadbalanceexample)
> * [Nginx doc - Choosing a Load-Balancing Method](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/#choosing-a-load-balancing-method)
> * [NginX로 Reverse-Proxy 서버 만들기](https://www.joinc.co.kr/w/man/12/proxy)
