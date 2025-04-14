# [Nginx]
> date - 2018.06.xx  
> keyword - nginx, architecture  

이래처럼 자세하게 설명하기
> nginx로 static file serving 설정 중 계속 404에러가 발생해서 stackoverflow 찾다가 `root`, `alias`로 둘다 해보고 차이점을 정리

>
>  nginx architure에 대해 정리



https://www.thegeekstuff.com/2013/11/nginx-vs-apache/



nginx 는 event-driven design 을 기반으로 하며 Apache Web Server의 process-driven design보다 hw resource를 더 잘 사용할 수 있게 한다

더 적은 자원을 사용하면서 더 많은 동시 접속 부하를 처리할 수 있다


asynchronous event-driven approach  <== 이게 nginx에서 사용하는것

threaded or process-oriented approach <== 이게 apache에서 사용하는것






# C10K Problem
current 10 thousand clients problem
Web 서버 또는 하나의 시스템당 동시 접속자 수가 1만명이 넘어갈 때 효율적 운영방안에 관한 문제
nginx는 event-driven, asynchronous 방식으로 극복




- Nginx의 event-driven 방식
Reacotr 패턴 사용
기본적으로 single threaded를 사용하며 필요에 따라 fork를 사용하여 몇개의 프로세스를 사용
Main event loop라는 것이 OS의 socket으로부터 읽을 수 있는 데이터를 기다린다
Single thread는 몇천개의 Connection을 매우 효율적으로 관리할 수 있게 된다

기존의 therad pool을 이용하는 경우를 고려해보자
1. Server Socket으로 request A가 들어오면 Thread를 할당해준다
2. 그럼 이 thread는 그 socket을 가지고, IO 작업등을 할 것
3. 이 와중에 Server Socket에 request B가 들어오면, context switching이 일어난다
4. 그럼 새로 들어온 request에 대해 thread를 배분해주고, 또 이 socket으로 IO 작업등을 할것
5. 그러면서 A의 작업을 하기 위해 중간에 다시 context switching 하고, 그러다 다시 B작업을 위해 context switching하면서 IO작업을 모두 처리할 것

Reactor 패턴에 중요한 2가지 요소
하나는 `event를 받고 전달해주는 Reactor`와 `Reactor가 보낸 event를 실제로 처리하는 Handler`가 있다
UI programming과 연관지어 설명한 것을 인용하면,

1. Reactor는 UI를 처리하는 thread이고, Handlers는 UI의 ActionListeners라고 생각하면된단
2. Reactor로 event가 들어오면 알맞는 handler로 dispatch 주는 역할을 담당
3. Handler는 이 dispatch된 event를 받아서 처리하는 역할을 하게 된다





- Overvies of Nginx Architecture

The Architecture of Open Source Applcations -> http://aosabook.org/en/index.html



Nginx Architecture
-> http://aosabook.org/en/nginx.html 

번역 -> http://www.looah.com/article/view/1640



apache의 아키텍처는 10여년전 비교적 적은 수의 end-user들이 ADSL이나 모뎀 등 비교적 느린 네트웍 환경에서 적은 양의 static contents를 서비스하는데 적합하게 설계되었다
하지만 요즘은 언제 어디서나 광대역의 네트웍을 기반으로한 다양한 기기들로 인터넷 접속이 이루어지고 있으며 빠른 페이지 로딩을 위하여 여러개의 커넥션을 사용하게 되어 동시 접속자수가 더 많이 늘게 되었다
Nginx는 개발 초기부터 고성능과 높은 동시 처리 능력, 그리고 효율적인 자원 사용에 집중해왔고, 추가적으로 로드밸런싱, 캐싱, 접근과 전송량 제어, 다양한 애플리케이션과의 효율적인 결합성도 갖추고 있어, nginx를 통해 고효율의 웹사이트 구축이 가능하다


- Apache는 적합하지 않은가...?


새로운 연결마다 새로운 복사본을 만들도록 설계
웹사이트의 비선형적인 확장에 적합하지 않다
접속당 CPU와 메모리 사용량이 증가함으로써 확장성이 떨어진다는 단점


동시 접속자 수가 1만명일 때의 C10K 문제 해결을 목표로 한 nginx는 동시 연결성과 초당 요청 건수 2가지 측면에서 확장성에 더 적합하게 만들어졌다

nginx는 event-based이기 때문에 apache와 같이 각각의 웹페이지 요청을 처리하기 위해서 새로운 process나 thread를 생성하지 않는다
그래서 부하는 증가하더라도 메모리나 CPU usage는 관리할 수 있는 상태로 남아 있는다
nginx는 현재 일반적인 HW로 구성된 단일 서버에서 수만개의 동시 connection을 처리할 수 있다






출처 - [Nginx Vs Apache: Nginx Basic Architecture and Scalability](https://www.thegeekstuff.com/2013/11/nginx-vs-apache/)




다수의 동시 요청을 처리해야하는 필요성이 매일 제기되고 있다

C10K(10,000 concurrent clients)의 예측이 문제를 해결 할 수 있는 웹 서버의 아키텍처에 대한 연구를 시작

그결과 nginx 아키텍처가 개발되었다



nginx와 아파치 웹서버간의 차이점에 대해 높은 수준에서 설명한다
nginx가 확장성 문제를 해결한 방법과



- 웹서버 확장성 향상

웹서버 확장성 문제는 HW 성능을 향상시키거나 웹서버 아키텍처를 개선하여 해결할 수 있다

여기서 목표는 웹 서버 아키텍처 개선하여 HW 리소스 최적화하는 것, 그러면 결국 비용 효율적인 아키텍처로 이어질 것


request 처리를 위해 thread-based 모델을 구현하는 전통적인 방식과는 완전히 다르다

각 클라이언트마다 완전히 분리된 하나의 쓰레드가 있으며 해당 쓰레드를 제공하기 위해 전념

프로세스가 보유중인 리소스(메모리, CPU)를 해제하기 위해 대기 중일 떄 I/O blocking 문제가 발생할 수있다

또한 별도의 프로세스를 작성하면 더 많은 자원을 소비한다


nginx에서 이문제를 해결하는 솔루션은 아래 그림과 같이 event-driven, asynchronous, non-blocking 과 single threaded architecture 를 사용하는 것


add image nginx-architecture

- How Nginx Works

event driven은 notification, signal이 프로세스의 시작 또는 완료를 표시하는데 사용됨을 의미

따라서, 프로세스 초기화 이벤트가 trigger되고 자원을 동적으로 할당 및 해제 할 때까지 다른 프로세스에서 자원을 사용할 수 있다

이로 인해 메모리와 CPU가 최적화되어 사용된다


- Event Driven
이벤트 주도 (Event-Driven)는 알림 또는 신호가 프로세스의 시작 또는 완료를 표시하는 데 사용됨을 의미합니다

따라서 프로세스 초기화 이벤트가 트리거되고 자원을 동적으로 할당 및 해제 할 때까지 다른 프로세스에서 자원을 사용할 수 있습니다

이로 인해 메모리와 CPU가 최적화되어 사용됩니다

- Asynchronous
thread가 서로를 blocking하지 않고 동시에 실행될 수 있다
dedicated 와 block 없이 리소스 공유가 향사된다


- Single threaded
리소스가 차단되지 않아
single worker process가 여러 클라이언트를 처리할 수 있다



nginx는 새로운 요청을 위해 새로운 process, thread를 생성하지 않아도 된다

worker process 는 매우 효율적인 event loop를 구현하여 요청을 수락하고 수천개의 프로세스를 처리한다

하나의 master process가 n개의 worker process를 가질 수 있다


따라서 nginx는 매우 최적화된 방식으로 활용되므로 적은 메모리로 동일한 작업을 수행할 수 있다


- Nginx vs Apache
Apache
    process-driven architecture
    새로운 요청을 위해 새로운 프로세스를 생성
        정적 리소스 제공시 메모리 소비가 적지 않다
    복잡한 구성 상황에서 nginx와 비교할 때 다양한 요구 사항을 포괄하는 많은 구성 기능을 제공하므로 쉽게 구성할 수 있다
    nginx보다 더 많은 기능을 제공



Nginx
    event-driven architecture
    새로운 요청을 위해 새로운 프로세스를 생성하지 않는다
        정적 리소스 제공시 메모리 소비가 매우 적다
    벤치마킹 결과 apache보다 정적 리소스 제공하는게 빠르다
    apache보다 가볍다
    


















> #### 참고
> * [Nginx의 event-driven 방식](https://sarc.io/index.php/nginx/64-nginx-event-driven)
> * [The Architecture of Open Source Applications nginx](http://aosabook.org/en/nginx.html)
> * [Nginx Vs Apache: Nginx Basic Architecture and Scalability](https://www.thegeekstuff.com/2013/11/nginx-vs-apache/)














Nginx는 Master Process와 Worker Process를 가진다
Master Process
    root로 실행되면서 80, 443 port의 소켓과 통신을 담당
Worker Process
    실제로 데이터를 처리하는 프로세스






http://whatisthenext.tistory.com/123
-> async event driven 그림이 좋은듯
-> 각각 블록에 대한 설명도 이게 더 읽기 좋다












