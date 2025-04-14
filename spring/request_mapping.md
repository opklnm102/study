
http://egloos.zum.com/charmpa/v/2922178

여기 글에서 HandlerMapping 구현체 내용 찾아보기


Todo: 어떤 구현체를 사용하여 request mapping이 되는지도 확인
https://gs.saro.me/#!m=elec&jn=814




```java
public interface HandlerInterceptor {
    
    /*
    HandlerMapping이 적절한 핸들러를 선택한 이후 HandlerAdapter가 해당 핸들러를 호출하기 이전에 호출되어 진다
    DispatcherServlet은 하나의 실행 체인 안에서 핸들러를 처리
    실행 체인에는 여러개의 interceptor가 존재할 수 있다
    interceptor는 실행 체인의 수행을 멈출 수 있으면, 이것은 HTTP 에러를 전송하거나 혹은 커스텀 응답을 전송함으로써 수행한다
    */
	boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;
	
    /*
    HandlerAdapter가 실제 해당 핸들러를 호출하고 난 후 DispatcherServlet이 View를 랜더링하기 이전에 호출되어 진다
    역시 이 메소드를 통해서 각 interceptor들은 실행 체인을 중단할 수 있다
    HTTP 에러를 전송하거나 혹은 커스텀 응답을 전송함으로써 수행한다
    */
	void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception;

    /*
    요청에 대한 처리가 완료된 이후(View를 랜더링한 이후)에 호출된다
    핸들러 수행 후 리소스 정리를 위해 사용할 수 있다
    preHandle()가 성공적으로 완료되고, true를 리턴했을 경우에만 호출된다
    */
	void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception;
}
```



HandlerInterceptorAdapter는 abstract class로써 HandlerInterceptor 인터페이스를 구현하기 편리하도록 기 작성된 adpater class
```java
public abstract class HandlerInterceptorAdapter implements AsyncHandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		return true;
	}

	@Override
	public void postHandle(
			HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)
			throws Exception {
	}

	@Override
	public void afterCompletion(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
	}

	@Override
	public void afterConcurrentHandlingStarted(
			HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
	}
}
```


```java
// DispatcherServlet 962 ~ 974
if (!mappedHandler.applyPreHandle(processedRequest, response)) {
    return;
}

// Actually invoke the handler.
mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

if (asyncManager.isConcurrentHandlingStarted()) {
    return;
}

applyDefaultViewName(processedRequest, mv);
mappedHandler.applyPostHandle(processedRequest, response, mv);



// HandlerExecutionChain 128 
boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HandlerInterceptor[] interceptors = getInterceptors();
    if (!ObjectUtils.isEmpty(interceptors)) {
        for (int i = 0; i < interceptors.length; i++) {
            HandlerInterceptor interceptor = interceptors[i];
            if (!interceptor.preHandle(request, response, this.handler)) {
                triggerAfterCompletion(request, response, null);
                return false;
            }
            this.interceptorIndex = i;
        }
    }
    return true;
}
```
HandlerInterceptor 구현 클래스는 실제 HandlerAdapter 클래스가 자신의 메소드를 호출하기 이전에 호출되어 진다
실제 HandlerInterceptorAdapter 구현 클래스는 아래 작업에 유용
요청 파라미터들의 전처리
파라미터들을 로깅
로케일/테마의 변경
권한 검증 수행
핸들러의 공통 로직 수행
반복적인 핸들러내의 코드 수행



HandlerInterceptor(I)
    ├── AsyncHandlerInterceptor(I)
    │     ├── HandlerInterceptorAdapter(C)
    │     │     ├── ConversionServiceExposingInterceptor(C)
    │     │     ├── CorsInterceptor(C)
    │     │     ├── LocaleChangeInterceptor(C) - 설정 가능한 요청 파라미터를 통하여 매 요청마다 현재 로케일의 변경을 허용하는 인터셉터. LocaleResolver 구현체와 함께 사용된다
    │     │     ├── PathExposingHandlerInterceptor(C)
    │     │     ├── ResourceUrlProviderExposingInterceptor(C)
    │     │     ├── ThemeChangeInterceptor(C) - 설정 가능한 요청 파라미터를 통하여 매 요청마다 현재 테마의 변경을 허용하는 인터셉터
    │     │     ├── UriTemplateVariablesHandlerInterceptor(C)
    │     │     └── UserRoleAuthorizationInterceptor(C)
    │     └── WebRequestHandlerInterceptorAdapter(C) - 서블릿 HandlerInterceptor 인터페이스를 구현하고 기저의 WebRequestInterceptor를 랩핑한 어댑터
    ├── MappedInterceptor(C)
    └── WebContentInterceptor(C) - 요청 및 응답을 체크하고 준비하는 인터셉터 구현 클래스
                                    지원가능한 메소드인지, 세션이 반드시 필요한지 등을 체크하며, 몇 초간 클라이언트에서 캐싱할지 등을 적용
                                    설정 옵션은 상위 클래스 빈 속성들을 참고




처리구조 이미지 
https://zetawiki.com/wiki/%EC%8A%A4%ED%94%84%EB%A7%81_MVC_%EC%B2%98%EB%A6%AC%EA%B5%AC%EC%A1%B0


http://wiki.javajigi.net/pages/viewpage.action?pageId=1160
spring batch도 보면 좋을듯
