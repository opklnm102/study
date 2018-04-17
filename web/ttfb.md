# [Web] TTFB(Time To First Byte)
> TTFB란 용어를 보고 궁금해서 알아본걸 정리


## TTFB(Time To First Byte)
* `사이트 접속 시도 이후 최초 응답`을 받아 브라우저에서 프로세싱이 시작되기까지의 시간
* 서버까지 왕복하는데 걸린 지연시간(latency) + 서버가 응답을 전달하기를 기다리는데 보낸 시간
* 서버 프로세싱, DNS, TCP, 브라우저 프로세싱 시간을 복합적으로 나타내는 수치
* `200ms 미만`이면 좋다


## 브라우저마다 TTFB가 달라질 수 있다
* 정확한 TTFB 측정을 위해 TTFB를 측정해주는 웹서비스 이용
* [WEBPAGETEST](http://www.webpagetest.org/)
   * First Byte Time, Keep-alive Enabled, Compress Transfer, Compress Images, Cache static content, Effective use of CDN 등 총 6가지를 기준으로 사이트 성능 측정
* [UPTRENDS - free website speed test](https://www.uptrends.com/tools/website-speed-test)
* [GTmetrix](https://gtmetrix.com/)


## TTFB가 중요한 이유?
* `서버의 성능을 보여주는 척도`
* TTFB가 좋게 나올수록 구글의 SEO 랭킹도 높아진다
   * 비슷한 내용을 제공하는 웹사이트가 존재하면, TTFB 속도를 보고 검색결과 우선순위 결정


## 높은 TTFB는?
* 2가지 주요 문제 중 하나를 나타낸다
   * 클라이언트와 서버 사이의 `네트워크 상태`가 잘못되었다
   * `서버 application의 응답`이 느리다

### 해결하려면?
* 먼저 네트워크를 가급적 많이 끊는다
* application을 local에서 호스팅했을 때 TTFB가 큰 경우
   * application 응답 속도에 맞춰 `최적화 필요`
      * DB query를 최적화하여 콘텐츠의 특정 부분에 대한 캐시 구현
      * 웹 서버 구성 수정
      * ...
* local에서 TTFB가 너무 낮은 경우
   * 클라이언트와 서버 사이의 `네트워크 문제`
   * 네트워크 순회를 저해하는 다양한 원인이 있을 수 있다
   * 클라이언트와 서버 사이에는 지점이 아주 많고, 각각 자체적인 연결 제한이 있기 때문에 문제가 발생할 수 있다
   * 가장 간단한 방법으로는 애플리케이션을 다른 호스트에 배치한 다음 TTFB가 개선되는지 보는 것


> #### 참고
> * [Resource Timing의 이해](https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing?hl=ko)
> * [TTFB 에 대한 개념탑재를 해봅시다](https://hackya.com/kr/ttfb-%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B0%9C%EB%85%90%ED%83%91%EC%9E%AC%EB%A5%BC-%ED%95%B4%EB%B4%85%EC%8B%9C%EB%8B%A4/)
> * [내 사이트의 로딩속도는? 성능측정 도구 1.WEBPAGETEST](http://blog.naver.com/PostView.nhn?blogId=kinxtime&logNo=220695016199&categoryNo=0&parentCategoryNo=0&viewDate=&currentPage=1&postListTopCurrentPage=1&from=postView)
