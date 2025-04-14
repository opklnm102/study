




RestTemplate 정리하기



http://blog.saltfactory.net/using-resttemplate-in-spring/

내부 구조 정리한 다른 블로그도 있음 찾아보자









> RestTemplate -> AsyncRestTemplate 도 비교해보자?

https://sjh836.tistory.com/141
https://a1010100z.tistory.com/125


RestTemplate에서 connection pool 설정하기도 정리
https://multifrontgarden.tistory.com/249





Spring 5.0으로 넘어가며 AsyncRestTemplate 클래스가 Deprecated 되었습니다.
그에 따라 yanolja common library에서 WebClient를 통한 asynchronous http 통신을 지원하도록 합니다.
[Key Features]
WebClient 추가
[Changes]
Spring framework version up (5.2.13.RELEASE)
그외 자잘한 변경 사항이 있으니 release note를 참고하시기 바랍니다. (참고 1)
또한 기존 라이브러리를 version up 하는 경우 spring version 변경에 따른 사이드 이펙트는 없는지
서비스 영향도를 꼭 체크하시고 작업해주시길 부탁드립니다. (중요)
참고 문서
Yanolja-common release note
How to WebClient for Yanolja

- https://confluence.yanolja.in/display/TS/Yanolja-common+release+note
- https://confluence.yanolja.in/display/TS/How+to+WebClient+for+Yanolja






