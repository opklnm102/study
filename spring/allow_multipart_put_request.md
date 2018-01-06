# [Spring Boot] Allow multipart put request
> spring boot에서 multipart/form-data request를 HTTP.PUT으로 처리하는데 데이터 binding이 안돼는 이슈를 해결하는 과정을 정리


## 문제
* `multipart/form-data` PUT request의 데이터를 binding 못하는 문제 발생
* [RESTful PUT with file upload and form data in Spring MVC](https://stackoverflow.com/questions/12616928/restful-put-with-file-upload-and-form-data-in-spring-mvc)의 내용을 따라 아래의 `PutAwareCommonsMultipartResolver`를 추가했는데...
```java
@Component
public class PutAwareCommonsMultipartResolver extends CommonsMultipartResolver {

    private static final String MULTIPART = "multipart/";

    private static final String POST_METHOD = "post";

    private static final String PUT_METHOD = "put";

    @Override
    public boolean isMultipart(HttpServletRequest request) {
        return request != null && isMultipartContent(request);
    }

    private boolean isMultipartContent(HttpServletRequest request) {
        String method = request.getMethod().toLowerCase();
        if (!POST_METHOD.equals(method) && !PUT_METHOD.equals(method)) {
            return false;
        }
        String contentType = request.getContentType();
        if (contentType == null) {
            return false;
        }
        return contentType.toLowerCase().startsWith(MULTIPART);
    }
}
```

* 아래의 stacktrace를 만나게되었다
* CommonsMultipartResolver의 `FileItemFactory`를 찾을 수 없다는 것
* spring에서 기본적으로 사용하고 있는 resolver라는데 도대체 왜...?
```java
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'putAwareCommonsMultipartResolver': Failed to introspect bean class [kr.co.mashup.feedgetapi.common.PutAwareCommonsMultipartResolver] for lookup method metadata: could not find class that it depends on; nested exception is java.lang.NoClassDefFoundError: org/apache/commons/fileupload/FileItemFactory
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.determineCandidateConstructors(AutowiredAnnotationBeanPostProcessor.java:269) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.determineConstructorsFromBeanPostProcessors(AbstractAutowireCapableBeanFactory.java:1118) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1091) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:513) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:483) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractBeanFactory$1.getObject(AbstractBeanFactory.java:306) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:230) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:302) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:197) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:761) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:867) ~[spring-context-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:543) ~[spring-context-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.boot.context.embedded.EmbeddedWebApplicationContext.refresh(EmbeddedWebApplicationContext.java:122) ~[spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:693) [spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:360) [spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:303) [spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1118) [spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1107) [spring-boot-1.5.9.RELEASE.jar:1.5.9.RELEASE]
	at kr.co.mashup.feedgetapi.FeedgetApiApplication.main(FeedgetApiApplication.java:32) [classes/:na]
Caused by: java.lang.NoClassDefFoundError: org/apache/commons/fileupload/FileItemFactory
	at java.lang.Class.getDeclaredMethods0(Native Method) ~[na:1.8.0_121]
	at java.lang.Class.privateGetDeclaredMethods(Class.java:2701) ~[na:1.8.0_121]
	at java.lang.Class.getDeclaredMethods(Class.java:1975) ~[na:1.8.0_121]
	at org.springframework.util.ReflectionUtils.getDeclaredMethods(ReflectionUtils.java:613) ~[spring-core-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.util.ReflectionUtils.doWithMethods(ReflectionUtils.java:524) ~[spring-core-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.util.ReflectionUtils.doWithMethods(ReflectionUtils.java:537) ~[spring-core-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.util.ReflectionUtils.doWithMethods(ReflectionUtils.java:510) ~[spring-core-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.determineCandidateConstructors(AutowiredAnnotationBeanPostProcessor.java:247) ~[spring-beans-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	... 18 common frames omitted
Caused by: java.lang.ClassNotFoundException: org.apache.commons.fileupload.FileItemFactory
	at java.net.URLClassLoader.findClass(URLClassLoader.java:381) ~[na:1.8.0_121]
	at java.lang.ClassLoader.loadClass(ClassLoader.java:424) ~[na:1.8.0_121]
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331) ~[na:1.8.0_121]
	at java.lang.ClassLoader.loadClass(ClassLoader.java:357) ~[na:1.8.0_121]
	... 26 common frames omitted
```

## why?
* spring boot의 auto configuration인 `MultipartAutoConfiguration`를 보니...
```java
@Configuration
@ConditionalOnClass({ Servlet.class, StandardServletMultipartResolver.class,
		MultipartConfigElement.class })
@ConditionalOnProperty(prefix = "spring.http.multipart", name = "enabled", matchIfMissing = true)
@EnableConfigurationProperties(MultipartProperties.class)
public class MultipartAutoConfiguration {

	private final MultipartProperties multipartProperties;

	public MultipartAutoConfiguration(MultipartProperties multipartProperties) {
		this.multipartProperties = multipartProperties;
	}

	@Bean
	@ConditionalOnMissingBean
	public MultipartConfigElement multipartConfigElement() {
		return this.multipartProperties.createMultipartConfig();
	}

	@Bean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
	@ConditionalOnMissingBean(MultipartResolver.class)
	public StandardServletMultipartResolver multipartResolver() {
		StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
		multipartResolver.setResolveLazily(this.multipartProperties.isResolveLazily());
		return multipartResolver;
	}

}
```

* spring boot에서는 `StandardServletMultipartResolver`를 사용하고 있었다!
```java
public class StandardServletMultipartResolver implements MultipartResolver {

	private boolean resolveLazily = false;

	public void setResolveLazily(boolean resolveLazily) {
		this.resolveLazily = resolveLazily;
	}

	@Override
	public boolean isMultipart(HttpServletRequest request) {
		// Same check as in Commons FileUpload...
		if (!"post".equals(request.getMethod().toLowerCase())) {
			return false;
		}
		String contentType = request.getContentType();
		return (contentType != null && contentType.toLowerCase().startsWith("multipart/"));
	}

	@Override
	public MultipartHttpServletRequest resolveMultipart(HttpServletRequest request) throws MultipartException {
		return new StandardMultipartHttpServletRequest(request, this.resolveLazily);
	}

	@Override
	public void cleanupMultipart(MultipartHttpServletRequest request) {
		// To be on the safe side: explicitly delete the parts,
		// but only actual file parts (for Resin compatibility)
		try {
			for (Part part : request.getParts()) {
				if (request.getFile(part.getName()) != null) {
					part.delete();
				}
			}
		}
		catch (Throwable ex) {
			LogFactory.getLog(getClass()).warn("Failed to perform cleanup of multipart items", ex);
		}
	}
}
```


## 해결
* `StandardServletMultipartResolver`를 상속 받아 구현
```java
/**
 * HTTP POST, PUT method Multipart request를 허용하는 Resolver
 * Spring Boot AutoConfiguration인 MultipartAutoConfiguration에서
 * StandardServletMultipartResolver를 사용하고 있어서 상속받아 구현
 * <p>
 * Created by ethan.kim on 2018. 1. 5..
 */
@Component
public class PutAwareCommonsMultipartResolver extends StandardServletMultipartResolver {

    private static final String MULTIPART = "multipart/";

    private static final String POST_METHOD = "post";

    private static final String PUT_METHOD = "put";

    @Override
    public boolean isMultipart(HttpServletRequest request) {
        String method = request.getMethod().toLowerCase();
        if (!POST_METHOD.equals(method) && !PUT_METHOD.equals(method)) {
            return false;
        }

        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith(MULTIPART);
    }
}
```


## Conclusion
* spring boot는 `StandardServletMultipartResolver`를 기본적으로 사용한다
* 상속해서 `PutAwareCommonsMultipartResolver`를 구현하여 기능 동작은 시켰다
* TC 작성중 `MockMvcRequestBuilders.fileupload()`가 POST만을 지원하는걸 발견 `MockMultipartHttpServletRequestBuilder`를 상속해서 오버라이딩하려고 했으나 super class인 `MockHttpServletRequestBuilder`가 package constructor만을 제공...
* 작년에도 이와 같은 이슈를 만나 [multipart는 HTTP POST로만 전송해야 한다](https://blog.outsider.ne.kr/1001)를 보고 다른 방식으로 구현했는데 이번에는 왜 이렇게 했을까..하며 로직을 다시 수정했다...


> #### 참고
> * [RESTful PUT with file upload and form data in Spring MVC](https://stackoverflow.com/questions/12616928/restful-put-with-file-upload-and-form-data-in-spring-mvc)
> * [multipart는 HTTP POST로만 전송해야 한다](https://blog.outsider.ne.kr/1001)
