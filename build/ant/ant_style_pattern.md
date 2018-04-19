# [Ant] Ant Style Pattern
> Spring Framework의 BeanNameUrlHandlerMapping과 SimpleUrlHandlerMapping에서 사용하는 Ant style pattern에 대해 정리


## Ant Style Pattern
* `?` 
   * 1개의 문자와 매칭
   * matches single character
* `*`
   * matches zero or more chracters
   * 0개 이상의 문자와 매칭
* `**`
   * matches all files / directories
   * 0개 이상의 파일, 디렉토리와 매칭


## Examples
* `com/t?st.jsp`
   * com/test.jsp
   * com/tast.jsp
* `com/*.jsp`
   * com directory의 모든 .jsp
   * com/test.jsp
   * com/a.jsp
* `com/**/test.jsp`
   * com/의 모든 test.jsp
   * com/a/test.jsp
   * com/t/ab/dd/test.jsp
* `org/springframework/**/*.jsp`
   * org/springframework/의 모든 .jsp
   * org/springframework/a/b/c/abs.jsp 
* `com/{filename:\\w+}.jsp`
   * filename 변수에 할당된 com/의 .jsp


#### 참고
> * [AntPathMatcher (Spring Framework 5.0.5.RELEASE API)](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/util/AntPathMatcher.html)
