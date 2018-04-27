# [Spring] Bean Lifecycle
> spring bean lifecycle에 대해 정리


## 초기화 메소드
* Bean이 생성되고, DI 후에 호출된다
* DI를 통해 Bean이 주입된 후 `사용자 정의 초기화`, `필수 속성 설정 확인`, `의존성 주입 유효성 검사` 등의 작업이 있을 때 사용
* Object 초기화 작업은 생성자에서 진행


### InitializingBean
* `org.springframework.beans.factory`에 존재
* `BeanFactory`에 의해 DI 후 반응해야하는 bean에서 구현하면 된다
```java
@Service
public class TestService implements InitializingBean {

    // spring이 초기화 시점에 호출해준다
    @Override
    public void afterPropertiesSet() throws Exception {
        // do something..
    }
}
```

### @PostConstruct
* JSR-250 스펙
* JSR-250을 구현한 다른 framework에서도 동작
* spring에 의존적이지 않다는 장점
* class에서 오직 하나의 메소드에만 사용
```java
import javax.annotation.PostConstruct;

@Service
public class TestService {

    @PostConstruct
    public void postConstruct() {
        // do something..
    }
}
```
* 메소드의 파라미터, return type을 사용하지 않는다

#### `@PostConstruct`를 사용할 수 있는 method signature
* public, protected, private, package
* final 가능
* application client만 static 가능
```java
// interceptor class일 경우
void method(InvocationContext);

Object method(InvocationContext) thrrows Exception

// 비 interceptor class일 경우
// container에서 return value는 무시
void method();
```

### @Bean(initMethod)
```java
@Bean(initMethod = "init")
public TestService testService() {
    return new TestService();
}

public class TestService {

    public void init() {
        // do something..
    }
}
```


## 제거 메소드
* container가 종료되어 bean destroy시 호출된다
* 종료시점에 필요한 작업이 있을 경우 사용
   * 리소스 반환
   * worker thread의 처리 완료 대기
### DisposableBean
* BeanFactory가 cache된 singleton bean을 destroy할 때 호출
`org.springframework.beans.factory`에 존재

```java
@Service
public class TestService implements DisposableBean {

    @Override
    public void destroy() throws Exception {
        // do something..
    }
}
``` 

### @PreDestroy
`@PostConstruct`와 같은 JSR-250 스펙 구현
```java
@Service
public class TestService {

    @PreDestroy
    public void destroy() {
        // do something..
    }
}
```

#### `@PreDestroy`를 사용할 수 있는 method signature
* public, protected, private, package
* final 가능
* application client만 static 가능
```java
// interceptor class일 경우
void method(InvocationContext);

Object method(InvocationContext) thrrows Exception

// 비 interceptor class일 경우
// container에서 return value는 무시
void method();
```

### @Bean(destroyMethod)
* `@Bean(initMethod)`와 유사
```java
@Bean(initMethod = "destroy")
public TestService testService() {
    return new TestService();
}

public class TestService {

    public void destroy() {
        // do something..
    }
}
```


## 호출 순서

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/spring/images/spring_bean_lifecycle.png" alt="spring bean lifecycle" width="400" height="400"/>
</div>

### lifecycle when initialize bean factory
1. BeanNameAware's setBeanName
2. BeanClassLoaderAware's setBeanClassLoader
3. BeanFactoryAware's setBeanFactory
4. EnvironmentAware's setEnvironment
5. EmbeddedValueResolverAware's EmbeddedValueResolver
6. ResourceLoaderAware's setResourceLoader(only application when running in an application context)
7. ApplicationEventPublisherAware's setApplicationEventPublisher(only application when running in an application context)
8. MessageSourceAware's setMessageSource(only application when running in an application context)
9. ApplicationContextAware's setApplicationContext(only application when running in an application context)
10. ServletContextAware's setServletContext(only application when running in an application context)
11. postProcessBeforeInitialization methods of BeanPostProcessors
12. InitializingBean's afterPropertiesSet
13. a custom init-method definition
14. postProcessAfterInitialization methods of BeanPostProcessors

### lifecycle when shutdown of a bean factory
1. postProcessBeforeDestruction methods of DestructionAwareBeanPostProcessors
2. DisposableBean's destroy
3. a custom destroy-method definition

### sample code
* `InitializingBean`과 `@PostConstruct`, `@Bean(initMethod)`를 모두 사용했을 경우
```java
public class TestService implements InitializingBean, DisposableBean {

    @Override
    public void afterPropertiesSet() throws Exception {
    }

    @PostConstruct
    public void postConstruct() {
    }

    public void init() {
    }

    @Override
    public void destroy() throws Exception {
    }

    @PreDestroy
    public void preDestroy() {
    }

    public void destroyMethod() {
    }
}

@Configuration
class ServiceConfiguration {

    @Bean(initMethod = "init", destroyMethod = "destroyMethod")
    public TestService testService() {
        return new TestService();
    }
}
```
* `@PostConstruct` -> `InitializingBean` -> `@Bean(initMethod)` -> ... -> `@PreDestroy` -> `DisposableBean` -> `@Bean(destroyMethod)`


### AbstractAutowireCapableBeanFactory
* Bean 생성시 초기화 메소드를 호출한다
* `@PostConstruct`
   * doCreateBean() -> initializeBean() -> applyBeanPostProcessorsBeforeInitialization() -> postProcessBeforeInitialization
* `afterPropertiesSet()`
   * doCreateBean() -> initializeBean() -> invokeInitMethods() -> afterPropertiesSet
* `@Bean(initMethod = "init")`
   * doCreateBean() -> initializeBean() -> invokeInitMethods() -> invokeCustomInitMethod

```java
public abstract class AbstractAutowireCapableBeanFactory extends AbstractBeanFactory implements AutowireCapableBeanFactory {
    ...
    // doCreateBean() 에서 호출
    protected Object initializeBean(final String beanName, final Object bean, RootBeanDefinition mbd) {
		if (System.getSecurityManager() != null) {
			AccessController.doPrivileged(new PrivilegedAction<Object>() {
				@Override
				public Object run() {
					invokeAwareMethods(beanName, bean);
					return null;
				}
			}, getAccessControlContext());
		}
		else {
			invokeAwareMethods(beanName, bean);
		}

		Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
            // applyBeanPostProcessorsBeforeInitialization() 내부의 postProcessBeforeInitialization()로 인해 @PostConstruct 호출
			wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
		}

		try {
            // 내부에서 afterPropertiesSet(), @Bean(initMethod) 호출
			invokeInitMethods(beanName, wrappedBean, mbd);
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					(mbd != null ? mbd.getResourceDescription() : null),
					beanName, "Invocation of init method failed", ex);
		}

		if (mbd == null || !mbd.isSynthetic()) {
			wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
		}
		return wrappedBean;
	}

    // initializeBean()에서 호출
    protected void invokeInitMethods(String beanName, final Object bean, RootBeanDefinition mbd) throws Throwable {

		boolean isInitializingBean = (bean instanceof InitializingBean);
		if (isInitializingBean && (mbd == null || !mbd.isExternallyManagedInitMethod("afterPropertiesSet"))) {
			if (logger.isDebugEnabled()) {
				logger.debug("Invoking afterPropertiesSet() on bean with name '" + beanName + "'");
			}
			if (System.getSecurityManager() != null) {
				try {
					AccessController.doPrivileged(new PrivilegedExceptionAction<Object>() {
						@Override
						public Object run() throws Exception {
							((InitializingBean) bean).afterPropertiesSet();
							return null;
						}
					}, getAccessControlContext());
				}
				catch (PrivilegedActionException pae) {
					throw pae.getException();
				}
			}
			else {
                // afterPropertiesSet() 호출
				((InitializingBean) bean).afterPropertiesSet();
			}
		}

		if (mbd != null) {
			String initMethodName = mbd.getInitMethodName();
			if (initMethodName != null && !(isInitializingBean && "afterPropertiesSet".equals(initMethodName)) &&
					!mbd.isExternallyManagedInitMethod(initMethodName)) {
                // @Bean(initMethod) 호출
				invokeCustomInitMethod(beanName, bean, mbd);
			}
		}
	}
}
```


### DisposableBeanAdapter
* Bean 파괴 메소드를 호출한다
* `AbstractApplicationContext.destroyBeans()` -> ... -> `DisposableBeanAdapter.destroy()`
* `@PreDestroy`
   * destroy() -> CommonAnnotationBeanPostProcessor.postProcessBeforeDestruction();
* `destroy()`
   * destroy() -> DisposableBean.destroy()
* `@Bean(destroyMethod = "destroyMethod")`'
   * destroy() -> invokeCustomDestroyMethod()


```java
// DefaultListableBeanFactory - L510
public void destroySingletons() {
	...
	// lock이 걸린다
	synchronized (this.singletonObjects) {
		this.singletonsCurrentlyInDestruction = true;
	}

	String[] disposableBeanNames;
	synchronized (this.disposableBeans) {
		disposableBeanNames = StringUtils.toStringArray(this.disposableBeans.keySet());
	}
	// LIFO (Last-In-First-Out) - 싱글톤 bean으로 초기화된 역순으로 destroy된다
	for (int i = disposableBeanNames.length - 1; i >= 0; i--) {
		destroySingleton(disposableBeanNames[i]);
	}

	this.containedBeanMap.clear();
	this.dependentBeanMap.clear();
	this.dependenciesForBeanMap.clear();

	synchronized (this.singletonObjects) {
		this.singletonObjects.clear();
		this.singletonFactories.clear();
		this.earlySingletonObjects.clear();
		this.registeredSingletons.clear();
		this.singletonsCurrentlyInDestruction = false;
	}
}

// DisposableBeanAdapter - L250
@Override
public void destroy() {
	if (!CollectionUtils.isEmpty(this.beanPostProcessors)) {
		for (DestructionAwareBeanPostProcessor processor : this.beanPostProcessors) {
			processor.postProcessBeforeDestruction(this.bean, this.beanName);  // @PreDestroy 호출
		}
	}
	...
	if (this.invokeDisposableBean) {
		if (System.getSecurityManager() != null) {
			AccessController.doPrivileged(new PrivilegedExceptionAction<Object>() {
				@Override
				public Object run() throws Exception {
					((DisposableBean) bean).destroy();  // DisposableBean.destroy() 호출
					return null;
				}
			}, acc);
		} else {
			((DisposableBean) bean).destroy();
		}
	}

	...

	if (this.destroyMethod != null) {
		invokeCustomDestroyMethod(this.destroyMethod);  // @Bean(destroyMethod = "destroyMethod") 호출
	}
	...
}
```

> #### applicion 종료시 destroy() 호출
> * `applicationContext.registerShutdownhook()` 사용
> * 권장 방법
> * application이 어떤 방법으로 종료되어도 자동으로 destroy() 호출



## Spring Aware Interface
* 모든 Aware interface는 root marker interface인 `org.springframework.beans.factory.Aware`를 확장한다
* setter만 정의되어 있으며, spring에서 setter-based DI를 하여 bean을 사용 가능하게 한다
* `servlet listeners`의 callback method와 비슷
* `observer pattern`으로 구현

### ApplicationContextAware
* ApplicationContext를 injection 받는다
* 선언된 bean 이름의 배열을 얻거나, bean을 얻는다
```java
public interface ApplicationContextAware extends Aware {
	void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}

// example usage
String[] beanNames = context.getBeanDefinitionNames();
for (String beanName : beanNames) {
	Object bean = context.getBean(beanName);
}
```

### BeanFactoryAware
* BeanFactory를 injection 받는다
* bean의 scope를 확인할 때 사용
```java
public interface BeanFactoryAware extends Aware {
	void setBeanFactory(BeanFactory beanFactory) throws BeansException;
}

// example usage
beanFactory.isSingleton(beanName);
beanFactory.isPrototype(beanName);
```

### BeanNameAware
* BeanName를 injection 받는다
* configuration 파일에 정의된 bean name을 알고 싶을 때 사용
```java
public interface BeanNameAware extends Aware {
	void setBeanName(String name);
}
```

### ResourceLoaderAware
* ResourceLoader를 injection 받는다
* classpath의 file을 input stream으로 가져올 때 사용
```java
public interface ResourceLoaderAware extends Aware {
	void setResourceLoader(ResourceLoader resourceLoader);
}
```

### ServletContextAware
* ServletContext를 injection 받는다
* ServletContext의 parameter와 attribute를 가져올 때 사용
```java
public interface ServletContextAware extends Aware {
	void setServletContext(ServletContext servletContext);
}
```

### ServletConfigAware
* ServletConfig를 injection 받는다
* servlet config parameter를 가져올 때 사용
```java
public interface ServletConfigAware extends Aware {
	void setServletConfig(ServletConfig servletConfig);
}
```


> #### 참고
> * [Spring bean LifeCycle](http://wonwoo.ml/index.php/post/1820)
> * [Spring : Life Cycle of spring Bean](https://premaseem.wordpress.com/2013/02/10/spring-life-cycle-of-spring-bean/)
> * [Spring Bean Life Cycle](https://www.journaldev.com/2637/spring-bean-life-cycle)
> * [Spring doc - Interface BeanFactory](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/BeanFactory.html)
