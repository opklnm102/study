


https://spring.io/blog/2016/09/22/new-in-spring-5-functional-web-framework














# spring webflux
어제 스터디에서 잠깐 들었던 말 중

spring5는 servlet를 사용안하는게 아니라

spring5에 추가된 Webflux가 embedded netty 기반으로 동작하기 때문에

여전히 tomcat 기반으로 servlet을 사용할 순 있어요

webflux를 기반으로 만든다면 당연히 tomcat은 사용할 순 없죠
.war로 packaging도 못하고

spring boot2부터는 기본 embeded was가 netty로 바뀌었다는 말도 있네요


`spring-boot-starter-web`를 사용하는 servlet stack application에서는
default was로 tomcat을 사용하고

`spring-boot-starter-webflux`을 사용하는 reactive stack application에서는 default was로 Reactor Netty를 사용

-> 
https://docs.spring.io/spring-boot/docs/current/reference/html/howto-embedded-web-servers.html#howto-embedded-web-servers
여기 있음




https://www.google.co.kr/search?newwindow=1&safe=off&ei=PuwlW9eIBcSk0gS_-rbIDg&q=spring+5&oq=spring+5&gs_l=psy-ab.3..35i39k1j0i67k1j0i20i263k1j0l7.1446.1446.0.1709.1.1.0.0.0.0.148.148.0j1.1.0....0...1.1.64.psy-ab..0.1.147....0.78xlGCTGqsY

https://www.slipp.net/wiki/pages/viewpage.action?pageId=28279325

http://hyper-cube.io/2017/11/27/spring5-with-kotlin/







https://docs.spring.io/spring-framework/docs/5.0.6.RELEASE/spring-framework-reference/web-reactive.html#spring-web-reactive

Web on Reactive Stack 에 대해 정리


https://docs.spring.io/spring-framework/docs/5.0.6.RELEASE/spring-framework-reference/web.html#web-reactive-server-functional

https://docs.spring.io/spring-framework/docs/5.0.6.RELEASE/spring-framework-reference/web.html
Web on Servlet Stack 에 대해 정리


