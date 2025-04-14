rx java  에 대해 정리 해볼까...??

https://www.google.co.kr/search?q=rxjava&oq=rxjava&aqs=chrome..69i57j35i39j69i60l3j35i39.899j0j7&sourceid=chrome&ie=UTF-8

https://zerobrain.gitbooks.io/what-is-rxjava-in-korean/content/




## RxJava2

변경점
 원본 - https://github.com/ReactiveX/RxJava/wiki
 번역 - http://realignist.me/code/2017/01/25/rxjava2-changelog.html

내부 구조
    reactive-streams 기반으로 변경

## reactive-streams?
Asynchronous stream processing / non-blocking black pressure 표준
Netflix, Pivotal, Typesafe 개발자들이 주축
쟁쟁한 reference
    Akka, MongoDB, Ratpack, Reactive Rabbit, Spring5, RxJava..
    http://www.reactive-streams.org/announce-1.0.0


## Reactive Manifesto
[리액티브 선언문](https://www.reactivemanifesto.org/ko)
reactive system의 특성
    responsive 응답성
    resilient 탄력성
    elastic 유연성
    message driven 메시지 구동
reactive-streams는 Reactive manifesto에 기반


## RxJava를 요약하면
Observable
    비동기 방식으로 전달되는 데이터 추상화
Schedulers
    미리 만들어진 thread preset
Observable operators
     생성, 조작, 구독

결국은 publish/subscribe
reactive manifesto를 쉽게 달성하기 위한 수단


Observable을 create, transform 하는 여러가지 방법이 있고
thread를 생성하는 방식에 따라 publish/subscribe 하고
Schedulers 라는 thread pool preset이 thread를 관리하고

## Flowable vs Observable
Backpressure buffer 여부


## subscribeOn vs observableOn
publishr vs subscriber


## chaining map vs flatMap
..?






Flowable 이라는 base reactive class 가 추가 되었다. 
Observable 과의 차이는 backpressure buffer의 기본 탑재 유무이다.

http://javaexpert.tistory.com/730 
http://developer88.tistory.com/146
https://medium.com/rainist-engineering/migrate-from-rxjava1-to-rxjava2-3aea3ff9051c

이거 참고해도 좋을듯..?





