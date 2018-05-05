# [Spring Data Jpa] SQL Error: 0, SQLState: S1009 Can not issue data manipulation statements with executeQuery()
> Spring Data JPA를 사용하다가 만난 에러에 대해 정리


## 문제
* 문제의 code
```java
public interface UserRepository extends JpaRepository {
	
	@Query(value = "UPDATE user SET user_type = 'NORMAL' WHERE user_id = :userId", nativeQuery = true)
	int updateUserType(@Param("userId") String userId) throws Exception;
}
```

* stacktrace
```java
Hibernate: UPDATE user SET user_type_cd = 'NORMAL' WHERE user_id = ?
.04:08:00.231 [pool-2-thread-1] WARN  o.h.e.jdbc.spi.SqlExceptionHelper (127) - SQL Error: 0, SQLState: S1009 
.04:08:00.231 [pool-2-thread-1] ERROR o.h.e.jdbc.spi.SqlExceptionHelper (129) - Can not issue data manipulation statements with executeQuery().
javax.persistence.PersistenceException: org.hibernate.exception.GenericJDBCException: could not extract ResultSet
	at org.hibernate.jpa.spi.AbstractEntityManagerImpl.convert(AbstractEntityManagerImpl.java:1692)
	at org.hibernate.jpa.spi.AbstractEntityManagerImpl.convert(AbstractEntityManagerImpl.java:1602)
	at org.hibernate.jpa.internal.QueryImpl.getSingleResult(QueryImpl.java:560)
	at org.springframework.data.jpa.repository.query.JpaQueryExecution$SingleEntityExecution.doExecute(JpaQueryExecution.java:206)
	at org.springframework.data.jpa.repository.query.JpaQueryExecution.execute(JpaQueryExecution.java:85)
	at org.springframework.data.jpa.repository.query.AbstractJpaQuery.doExecute(AbstractJpaQuery.java:116)
	at org.springframework.data.jpa.repository.query.AbstractJpaQuery.execute(AbstractJpaQuery.java:106)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.doInvoke(RepositoryFactorySupport.java:483)
	at org.springframework.data.repository.core.support.RepositoryFactorySupport$QueryExecutorMethodInterceptor.invoke(RepositoryFactorySupport.java:461)
	...
Caused by: org.hibernate.exception.GenericJDBCException: could not extract ResultSet
	at org.hibernate.exception.internal.StandardSQLExceptionConverter.convert(StandardSQLExceptionConverter.java:47)
	at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:109)
	at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:95)
	at org.hibernate.engine.jdbc.internal.ResultSetReturnImpl.extract(ResultSetReturnImpl.java:79)
	at org.hibernate.loader.Loader.getResultSet(Loader.java:2117)
	at org.hibernate.loader.Loader.executeQueryStatement(Loader.java:1900)
	at org.hibernate.loader.Loader.executeQueryStatement(Loader.java:1876)
	at org.hibernate.loader.Loader.doQuery(Loader.java:919)
	at org.hibernate.loader.Loader.doQueryAndInitializeNonLazyCollections(Loader.java:336)
	at org.hibernate.loader.Loader.doList(Loader.java:2617)
	at org.hibernate.loader.Loader.doList(Loader.java:2600)
	at org.hibernate.loader.Loader.listIgnoreQueryCache(Loader.java:2429)
	at org.hibernate.loader.Loader.list(Loader.java:2424)
	at org.hibernate.loader.custom.CustomLoader.list(CustomLoader.java:336)
	at org.hibernate.internal.SessionImpl.listCustomQuery(SessionImpl.java:1967)
	at org.hibernate.internal.AbstractSessionImpl.list(AbstractSessionImpl.java:322)
	at org.hibernate.internal.SQLQueryImpl.list(SQLQueryImpl.java:125)
	at org.hibernate.jpa.internal.QueryImpl.list(QueryImpl.java:606)
	at org.hibernate.jpa.internal.QueryImpl.getSingleResult(QueryImpl.java:529)
	... 98 common frames omitted
Caused by: java.sql.SQLException: Can not issue data manipulation statements with executeQuery().
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:545)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:513)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:505)
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:479)
	at com.mysql.cj.jdbc.StatementImpl.checkForDml(StatementImpl.java:521)
	at com.mysql.cj.jdbc.PreparedStatement.executeQuery(PreparedStatement.java:1891)
	at com.zaxxer.hikari.pool.ProxyPreparedStatement.executeQuery(ProxyPreparedStatement.java:52)
	at com.zaxxer.hikari.pool.HikariProxyPreparedStatement.executeQuery(HikariProxyPreparedStatement.java)
	at org.hibernate.engine.jdbc.internal.ResultSetReturnImpl.extract(ResultSetReturnImpl.java:70)
	... 113 common frames omitted
```


## why?
* hibernate에서 update query를 `executeQuery()`로 실행하려고 했기 때문
* `executeQuery()`는 select query에만 사용하고 select 이외에는 `executeUpdate()`를 사용해야 한다


## 해결
* `@Modifying`을 추가한다
```java
public interface UserRepository extends JpaRepository {
	
	@Modifying  // 추가
	@Query(value = "UPDATE user SET user_type_cd = 'NORMAL' WHERE user_id = :userId", nativeQuery = true)
	int updateUserType(@Param("userId") String userId) throws Exception;
}
```

#### 참고
> * [Spring Data JPA - Reference Documentation 4.3.8 Modifying queries](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.modifying-queries)
