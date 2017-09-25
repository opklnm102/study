# [Spring Data Jpa] @Modifying Update query
> spring data jpa에서 @Modifying을 사용하여 update query를 호출하던 중 만난 Error에 대해 정리하고자 함


```java
public interface SampleRepository extends JpaRepository<Sample, Long> {

	@Modifying
	@Query("UPDATE Sample SET price = price + :addPrice WHERE sampleId = :sampleId")
	int addPrice(@Param("addPrice") Double addPrice, @Param("sampleId") String sampleId);
}

public class SampleService {
	
	@Autowired
	private SampleRepository sampleRepository;

	public void addPrice(Double price) {
		sampleRepository.addPrice(price);
	}
}
```

## Exception stack trace
```java
org.springframework.dao.InvalidDataAccessApiUsageException: Executing an update/delete query; nested exception is javax.persistence.TransactionRequiredException: Executing an update/delete query
	at org.springframework.orm.jpa.EntityManagerFactoryUtils.convertJpaAccessExceptionIfPossible(EntityManagerFactoryUtils.java:413)
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:246)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:488)
	at org.springframework.dao.support.ChainedPersistenceExceptionTranslator.translateExceptionIfPossible(ChainedPersistenceExceptionTranslator.java:59)
	at org.springframework.dao.support.DataAccessUtils.translateIfNecessary(DataAccessUtils.java:213)
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:147)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:133)
	...
Caused by: javax.persistence.TransactionRequiredException: Executing an update/delete query
	at org.hibernate.jpa.spi.AbstractQueryImpl.executeUpdate(AbstractQueryImpl.java:54)
	at org.springframework.data.jpa.repository.query.JpaQueryExecution$ModifyingExecution.doExecute(JpaQueryExecution.java:238)
	at org.springframework.data.jpa.repository.query.JpaQueryExecution.execute(JpaQueryExecution.java:85)
	at org.springframework.data.jpa.repository.query.AbstractJpaQuery.doExecute(AbstractJpaQuery.java:116)
	at org.springframework.data.jpa.repository.query.AbstractJpaQuery.execute(AbstractJpaQuery.java:106)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.doInvoke(RepositoryFactorySupport.java:483)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.invoke(RepositoryFactorySupport.java:461)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:56)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:99)
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:282)
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:96)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179)
	at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:136)
	... 72 common frames omitted
```

## 문제
* update, delete 쿼리는 트랜잭션 안에서 일어나야 한다

## 해결법
* 트랜잭션 안에서 호출되도록 수정한다
```java
public class SampleService {

	@Autowired
	private SampleRepository sampleRepository;

	@Transactional
	public void addPrice(Double price) {
		sampleRepository.addPrice(price);
	}
}
```
