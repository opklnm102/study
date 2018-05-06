# [Server] Reverse Proxy vs Forward Proxy
> reverse proxy에 왜 reverse란 prefix가 붙었을까에 대한 궁금함을 해소하다가 알게된 reverse proxy와 forward proxy에 대한 내용을 정리 


## Proxy Server를 구축하는 이유
* 보안
   * 내부 Server의 직접 접근 방지
* 속도
    사용자의 요청을 cache를 사용하여 가지고 있다가, 동일한 요청이 오면 cache에서 응답, 서비스의 속도와 불필요한 리소스 낭비를 막는다
* ACL
   * Server에 접근 가능한 IP인지 정책적으로 정의할 수 있다
* Log/Audit
   * network로 access하는 사용자에 대한 사용 정보를 reporting
* 접근 우회
   * 보안상의 이유로 특정 서버에 대한 접근이 제한된 경우 proxy server를 사용하여 우회할 수 있다 

---

## Forward Proxy란?

![forward proxy](https://github.com/opklnm102/study/blob/master/server/images/forward_proxy.jpg)

* service network의 edge에 존재
* client가 target server의 url로 요청하면 proxy server가 target server로 요청을 전달(forward)한다
   * client가 직접 연결하는게 아님
* service network에 설정된 정책에 따라 outbound traffic을 규제
* 대학이나 기업같은 대규모 조직에서 내부적으로 사용

### 사용처
* 유해 웹사이트 방문 및 client 연결 필터링
   * 악의적인 traffic이 target server에 도달하지 못하도록 차단
* client의 IP를 숨길 수 있다
* Compliance Reporting
   * 온라인 활동 모니터링
* Content Filtering
* 외부 사이트 컨텐츠 caching을 통한 UX 개선

---

## Reverse Proxy란?

![reverse proxy1](https://github.com/opklnm102/study/blob/master/server/images/reverse_proxy1.jpg)

![reverse proxy2](https://github.com/opklnm102/study/blob/master/server/images/reverse_proxy2.png)

* service network의 edge에 위치하여 사용자의 요청을 뒷쪽(reverse) network에 있는 server에 전달하는 역할
   * 실제 endpoint 처럼 동작하여 초기 HTTP 연결 요청을 받는다
* 사용자와 reverse proxy 뒤의 server(ex. WAS) 사이의 gateway
   * 모든 policy 적용 및 traffic routing 역할 수행
   * TCP 3-way handshake 완료 및 초기 connection 종료
* [HAProxy](http://www.haproxy.org/), [Nginx](https://www.nginx.com/), [Apache HTTP Server](https://httpd.apache.org/) 등으로 구축
* TCP multiplexing 기능이 핵심
   * connection이 pooling되어 더 적은 수의 connection을 사용하여 backend server와의 연결을 수행한다는 것
   * 일반적인 TCP multiplexing 비율은 10:1 
   * 10개의 request에 1개의 backend server와의 연결 시도 


### 이점
* backend server가 직접 노출되는 것보다 이점이 많다

#### 부하 분산
* backend server가 여러개일 경우 load balancer로 사용

#### 1개의 backend server(web server, WAS)일 경우의 이점
* 웹사이트의 public face라고 생각
* 보안 강화
   * 외부 network에서 backend server에 access할 수 없게 한다
   * client `IP의 black list를 관리`하여 `traffic을 거부`하거나 `연결 수를 제한`하여 DDoS 공격 방지 가능
* 확장성 및 유연성 향상
   * client는 reverse proxy의 IP만 알고 있으므로 backend infra의 구성을 자유롭게 변경할 수 있다
   * ex. scale out 등
* web acceleration
   * 응답시간(응답 생성 시간 + client에 전달되는 시간) 감소 및 backend server의 리소스 절약
   * Compression
      * 응답을 압축(gzip 등)하여 필요한 bandwidth의 양을 줄여 network 전송 속도를 높인다
   * SSL termination
       * network packet의 decryption, encryption 역할을 함으로써 backend server의 리소스 절약
   * Caching
      * backend server의 응답을 client에 전달하기 전에 local에 저장하여 동일한 요청이 오면 backend server로 전달하는 대신 cache에서 응답을 제공


## 정리
* Forward Proxy와 Reverse Proxy의 역할은 다르다
* Reverse Proxy는 backend server가 1개일지라도 구축하는게 좋다
* Reverse Proxy의 유용한 점
   * TCP Multiplexing
   * Load Balancing
   * SSL Offload/Acceleration(SSL Multiplexing)
   * Caching
   * Compression
   * Content Switching/Redirection
   * Application Firewall
   * Server Obfuscation
   * Authentication
   * Single Sign On


> #### 참고
> * [NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
> * [what is reverse proxy](https://www.youtube.com/watch?v=Dgf9uBDX0-g)
> * [Reverse Proxy](https://www.incapsula.com/cdn-guide/glossary/reverse-proxy.html)
> * [What's the difference between a reverse proxy and forward proxy?](https://www.quora.com/Whats-the-difference-between-a-reverse-proxy-and-forward-proxy)
> * [Difference between a forward proxy and a reverse proxy server](http://opensourceforgeeks.blogspot.kr/2018/01/difference-between-forward-proxy-and.html)
> * [WHAT IS A REVERSE PROXY VS. LOAD BALANCER?](https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer)
