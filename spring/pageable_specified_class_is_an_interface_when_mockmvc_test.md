# [Spring] Pageable Specified class is an interface when MockMvc test
> Spring Boot에서 MockMvc TC 작성 중 Controller의 request param으로 Pageable 사용했을 때 만난 exception에 대하여 정리

## 문제
* TC
```java
@Test
public void readCreations_창작물_리스트_조회_성공() throws Exception {
    // given : 유저 ID, 카테고리 이름으로
    long userId = 1L;
    String category = "ALL";

    // when : 창작물 리스트를 조회하면
    MvcResult result = mockMvc.perform(get("/creations")
            .header("userId", userId)
            .param("category", category)
    ).andExpect(status().isOk())
            .andReturn();

    // then : 창작물 리스트가 조회된다
    verify(creationService.readCreations(userId, category, any()));
}
```

* stacktrace
   * interface라서 exception
```java
org.springframework.web.util.NestedServletException: Request processing failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.data.domain.Pageable]: Specified class is an interface
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:982)
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:861)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:635)
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:846)
	at org.springframework.test.web.servlet.TestDispatcherServlet.service(TestDispatcherServlet.java:65)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:742)
	at org.springframework.mock.web.MockFilterChain$ServletFilterProxy.doFilter(MockFilterChain.java:160)
	at org.springframework.mock.web.MockFilterChain.doFilter(MockFilterChain.java:127)
	at org.springframework.test.web.servlet.MockMvc.perform(MockMvc.java:155)
	at kr.co.mashup.feedgetapi.web.controller.CreationControllerTest.readCreations_창작물_리스트_조회_성공(CreationControllerTest.java:273)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:50)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:47)
	....
Caused by: org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.data.domain.Pageable]: Specified class is an interface
	at org.springframework.beans.BeanUtils.instantiateClass(BeanUtils.java:99)
	at org.springframework.web.method.annotation.ModelAttributeMethodProcessor.createAttribute(ModelAttributeMethodProcessor.java:139)
	at org.springframework.web.servlet.mvc.method.annotation.ServletModelAttributeMethodProcessor.createAttribute(ServletModelAttributeMethodProcessor.java:82)
	at org.springframework.web.method.annotation.ModelAttributeMethodProcessor.resolveArgument(ModelAttributeMethodProcessor.java:106)
	at org.springframework.web.method.support.HandlerMethodArgumentResolverComposite.resolveArgument(HandlerMethodArgumentResolverComposite.java:121)
	at org.springframework.web.method.support.InvocableHandlerMethod.getMethodArgumentValues(InvocableHandlerMethod.java:158)
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:128)
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:97)
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:827)
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:738)
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:85)
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:967)
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:901)
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:970)
	... 34 more
```

## 해결
* MockMvc에 resolver 설정 추가
```java
 @Before
public void setUp() throws Exception {
    mockMvc = MockMvcBuilders.standaloneSetup(sut)
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())  // 
            .alwaysDo(print())
            .build();
}
```

> #### 참고
> * [Isolated Controller Test can't instantiate Pageable](https://stackoverflow.com/questions/22174665/isolated-controller-test-cant-instantiate-pageable)
