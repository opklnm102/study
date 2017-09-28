# [Spring Data Jpa] Target object must not be null exception
> Spring Boot + Spring Data Jpa를 사용하던 도중 만난 exceptionㅇ에 대해 정리하고자 함

## Exception stack trace
```java
org.springframework.dao.InvalidDataAccessApiUsageException: Target object must not be null; nested exception is java.lang.IllegalArgumentException: Target object must not be null
	at org.springframework.orm.jpa.EntityManagerFactoryUtils.convertJpaAccessExceptionIfPossible(EntityManagerFactoryUtils.java:384)
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:246)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:488)
	at org.springframework.dao.support.ChainedPersistenceExceptionTranslator.translateExceptionIfPossible(ChainedPersistenceExceptionTranslator.java:59)
	at org.springframework.dao.support.DataAccessUtils.translateIfNecessary(DataAccessUtils.java:213)
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:147)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:133)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:92)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.data.repository.core.support.SurroundingTransactionDetectorMethodInterceptor.invoke(SurroundingTransactionDetectorMethodInterceptor.java:57)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:213)
	at com.sun.proxy.$Proxy184.save(Unknown Source)
	...
Caused by: java.lang.IllegalArgumentException: Target object must not be null
	at org.springframework.util.Assert.notNull(Assert.java:134)
	at org.springframework.beans.AbstractNestablePropertyAccessor.setWrappedInstance(AbstractNestablePropertyAccessor.java:205)
	at org.springframework.beans.BeanWrapperImpl.setWrappedInstance(BeanWrapperImpl.java:151)
	at org.springframework.beans.AbstractNestablePropertyAccessor.setWrappedInstance(AbstractNestablePropertyAccessor.java:194)
	at org.springframework.beans.AbstractNestablePropertyAccessor.<init>(AbstractNestablePropertyAccessor.java:133)
	at org.springframework.beans.BeanWrapperImpl.<init>(BeanWrapperImpl.java:101)
	at org.springframework.data.util.DirectFieldAccessFallbackBeanWrapper.<init>(DirectFieldAccessFallbackBeanWrapper.java:35)
	at org.springframework.data.jpa.repository.support.JpaMetamodelEntityInformation.getId(JpaMetamodelEntityInformation.java:146)
	at org.springframework.data.repository.core.support.AbstractEntityInformation.isNew(AbstractEntityInformation.java:51)
	at org.springframework.data.jpa.repository.support.JpaMetamodelEntityInformation.isNew(JpaMetamodelEntityInformation.java:227)
	at org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:507)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.executeMethodOn(RepositoryFactorySupport.java:504)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.doInvoke(RepositoryFactorySupport.java:489)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.invoke(RepositoryFactorySupport.java:461)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:56)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:99)
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:282)
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:96)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:136)
	... 79 common frames omitted
```

## 문제
```java
Product product = productRepository.findOne(anyLong());
...
productRepository.save(product);  // exception..!
```
* null인 객체를 repository.save()하다가 exception 발생

## stack trace 따라가보기
* at org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:507)
```java
@Transactional
public <S extends T> S save(S entity) {

	if (entityInformation.isNew(entity)) {  // 507 line - exception..!
		em.persist(entity);
		return entity;
	} else {
		return em.merge(entity);
	}
}
```

* at org.springframework.data.jpa.repository.support.JpaMetamodelEntityInformation.isNew(JpaMetamodelEntityInformation.java:227)
```java
@Override
public boolean isNew(T entity) {

	if (versionAttribute == null || versionAttribute.getJavaType().isPrimitive()) {
		return super.isNew(entity);  // 227 line - exception..!
	}

	BeanWrapper wrapper = new DirectFieldAccessFallbackBeanWrapper(entity);
	Object versionValue = wrapper.getPropertyValue(versionAttribute.getName());

	return versionValue == null;
}
```

* at org.springframework.beans.AbstractNestablePropertyAccessor.setWrappedInstance(AbstractNestablePropertyAccessor.java:205)
```java
public void setWrappedInstance(Object object, String nestedPath, Object rootObject) {
	Assert.notNull(object, "Target object must not be null");  // 205 line - exception..!
	if (object.getClass() == javaUtilOptionalClass) {
		this.wrappedObject = OptionalUnwrapper.unwrap(object);
	}
	else {
		this.wrappedObject = object;
	}
	this.nestedPath = (nestedPath != null ? nestedPath : "");
	this.rootObject = (!"".equals(this.nestedPath) ? rootObject : this.wrappedObject);
	this.nestedPropertyAccessors = null;
	this.typeConverterDelegate = new TypeConverterDelegate(this, this.wrappedObject);
}
```
* Assert.notNull()에서 verify에 걸림...
   * framework차원에선 NPE를 이런식으로 방지할 수 있다는걸 깨달음


## 해결법
* null check를 한다
```java
// java7
Product product = productRepository.findOne(anyLong());
if(product == null) {
	return;
}

...
productRepository.save(product);

// java8
Optional<Product> productOp = productRepository.findOne(anyLong());
Product product = productOp.orElseThrow()() -> new RuntimeException();

...
productRepository.save(product);
```
