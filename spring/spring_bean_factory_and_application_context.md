# [Spring] BeanFactory and ApplicationContext
> Spring의 BeanFactory와 ApplicationContext에 대해 정리


## BeanFactory
* Spring의 IoC 기능에 대한 기반을 제공
   * spring의 `core compoenent`
* Bean 등록/생성/조회/반환/관리
* 보통은 직접 이용하지 않고 이를 확장한 `ApplicationContext`를 이용
* 다른 3rd party framework와의 통합에만 직접 이용되며 BeanFactory, BeanFactoryAware, InitializingBean, DosposableBean 등은 호환성을 위해 여전히 존재

```java
public interface BeanFactory {

	String FACTORY_BEAN_PREFIX = "&";

	Object getBean(String name) throws BeansException;

	<T> T getBean(String name, Class<T> requiredType) throws BeansException;

	Object getBean(String name, Object... args) throws BeansException;

	<T> T getBean(Class<T> requiredType) throws BeansException;	
	
	<T> T getBean(Class<T> requiredType, Object... args) throws BeansException;

	boolean containsBean(String name);

	boolean isSingleton(String name) throws NoSuchBeanDefinitionException;

	boolean isPrototype(String name) throws NoSuchBeanDefinitionException;

	boolean isTypeMatch(String name, ResolvableType typeToMatch) throws NoSuchBeanDefinitionException;

	boolean isTypeMatch(String name, Class<?> typeToMatch) throws NoSuchBeanDefinitionException;

	Class<?> getType(String name) throws NoSuchBeanDefinitionException;

	String[] getAliases(String name);
}
```


## ApplicationContext
* BeanFactory를 확장한 Ioc 컨테이너
* BeanFactory의 기능 `+@의 부가 기능` 제공

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/spring/images/configurableApplicationContext_hierarchical_structure.png" alt="configurableApplicationContext hierarchical structure"/>
</div>


### ApplicationContext가 구현한 interface

* `MessageSource`
   * Application에서 필요한 메시지들을 관리하는 것이 가능
   * i18n style의 message에 대한 access 제공
* `ApplicationEventPublisher`
   * `ApplicationListener`에게 Event 전달 가능
   * 사용법은 [Spring Events](https://github.com/opklnm102/study/blob/master/spring/spring_events.md) 참고

```java
public interface ApplicationEventPublisher {

	// application의 모든 event listener에게 RequestHandledEvent와 같은 application event를 발행
	void publishEvent(ApplicationEvent event);

	// application의 모든 event listener에게 event를 발행
	// ApplicationEvent가 아닌 경우 PayloadApplicationEvent로 wrapping 된다
	void publishEvent(Object event);
}

public class PayloadApplicationEvent<T> extends ApplicationEvent implements ResolvableTypeProvider {

	private final T payload;

	public PayloadApplicationEvent(Object source, T payload) {
		super(source);
		Assert.notNull(payload, "Payload must not be null");
		this.payload = payload;
	}

	@Override
	public ResolvableType getResolvableType() {
		return ResolvableType.forClassWithGenerics(getClass(), ResolvableType.forInstance(getPayload()));
	}

	public T getPayload() {
		return this.payload;
	}
}
```

* `ResourcePatternResolver, ResourceLoader`
   * 파일, URL과 같은 다양한 리소스에 access 제공
   * 다양한 하위레벨의 자원을 Spring의 인스턴스로 생성하는 것이 가능
* `EnvironmentCapable`
   * EnvironmentAware통해 setting된 environemnt를 가져온다

```java
public interface EnvironmentAware extends Aware {
	void setEnvironment(Environment environment);
}

public interface EnvironmentCapable {
	Environment getEnvironment();
}
```

> 메모리 소비가 중요하거나, 리소스가 제한된 환경(임베디드) 등의 특별한 이유가 아니라면 BeanFactory보다는 ApplicationContext를 사용해라

> | Feature | BeanFactory | ApplicationContext |
> |:--|:--|:--|
> | Bean instantiation/wiring | O | O |
> | Automatic `BeanPostProcessor` registration | X | O |
> | Automatic `BeanFactoryPostProcessor` registration | X | O |
> | Convenient `MessageSource` access (for i18n) | X | O |
> | `ApplicationEvent` publication | X | O |
> 
> Spring은 프록시 등을 위해 `BeanPostProcessor`를 많이 사용하기 때문에 BeanFactory만 사용한다면 트랜잭션과 AOP 등이 원하는데로 동작안할 수 도 있다



> #### 참고
> * [BeanFactory vs ApplicationContext](https://stackoverflow.com/questions/243385/beanfactory-vs-applicationcontext)
> * [7.16 The BeanFactory](https://docs.spring.io/spring/docs/4.3.9.RELEASE/spring-framework-reference/html/beans.html#beans-beanfactory)
