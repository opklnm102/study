

http://egloos.zum.com/springmvc/v/499291








JPA에서 transaction manager(PlatformTransactionManager)를 어디서 어떻게 사용하는가..? 파악하기
http://wikibook.co.kr/article/transaction-management-using-spring/






https://taetaetae.github.io/2016/10/08/20161008/
isolation 옵션 정리하면서 spring batch에서 관련된 내용도 같이 정리??








multi datasource일 때 
transactionManager를 어떻게 써야 깔끔하게 쓸 수 있을까....??

## MyBatis
DataSource ————> TtrnasactionManager
        |
        |———> SqlSessionFactory ———> SqlSessionTemplate

Spring 에서 조회용 쿼리에서도 TransactionManager가 필요 없는 건가…?

TransactionManager는 @Transactional 로 인해 aspect 된 TransactionAspectSupport가 결정 해준다
-> determineTransaction()

- @Transactional(readOnly = true) 로 무슨 이점이 있는거지…?
TransactionAspectSupport가 determineTransaction()을 안하는건가…?
Connection을 획득 안하나??

Connection은 언제 획득하는 거지…..?


이건 JPA로 sample 만들어서 디버깅해봐야 겠다
궁금하군….

## JPA
DataSource ————> EntityManagerFactory ———> TtrnasactionManager



최초 save() 후 find()시 
1. insert - 실제 DB에 commit이 일어나는건지...? 아니면 영속화가 되서 그런건지.. check
2. 영속화??
3. select
영속성 컨텍스트에 영속화가 언제되는지에 대한 이해도가 필요할듯...



```java
 DEBUG com.zaxxer.hikari.pool.PoolBase (127) - commonHikariCP - Closing connection com.mysql.cj.jdbc.ConnectionImpl@43c7939c: (connection has passed maxLifetime) 
.17:23:51.687 [http-nio-9000-exec-5] DEBUG o.s.b.f.s.DefaultListableBeanFactory (251) - Returning cached instance of singleton bean 'balanceReadOnlySqlSessionTemplate' 
.17:23:51.689 [commonHikariCP connection closer] DEBUG com.zaxxer.hikari.pool.PoolBase (127) - commonHikariCP - Closing connection com.mysql.cj.jdbc.ConnectionImpl@2f7f490a: (connection has passed maxLifetime) 
.17:23:51.689 [http-nio-9000-exec-5] DEBUG org.mybatis.spring.SqlSessionUtils (97) - Creating a new SqlSession 
.17:23:51.690 [http-nio-9000-exec-5] DEBUG org.mybatis.spring.SqlSessionUtils (148) - SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@3862e02a] was not registered for synchronization because synchronization is not active 
.17:23:51.691 [http-nio-9000-exec-5] DEBUG o.s.jdbc.datasource.DataSourceUtils (110) - Fetching JDBC Connection from DataSource 
.17:23:51.923 [http-nio-9000-exec-5] DEBUG o.m.s.t.SpringManagedTransaction (87) - JDBC Connection [HikariProxyConnection@1215083442 wrapping com.mysql.cj.jdbc.ha.ReplicationMySQLConnection@19438c40] will not be managed by Spring 
.17:23:51.923 [http-nio-9000-exec-5] DEBUG R.selectOtherRechargeTransactionIdsWithDistinctPhoneNo (159) - ==>  Preparing: SELECT MAX(gh.transaction_id) as transaction_id FROM order_master om , gift_history gh WHERE om.tx_id = gh.transaction_id AND om.user_id = ? AND om.order_status_cd = 'FINISHED' GROUP BY gh.user_b_msisdn ORDER BY transaction_id DESC LIMIT ? OFFSET ?  
.17:23:51.924 [http-nio-9000-exec-5] DEBUG R.selectOtherRechargeTransactionIdsWithDistinctPhoneNo (159) - ==> Parameters: 111111(String), 11(Integer), 0(Integer) 
.17:23:52.055 [http-nio-9000-exec-5] DEBUG R.selectOtherRechargeTransactionIdsWithDistinctPhoneNo (159) - <==      Total: 0 
.17:23:52.056 [http-nio-9000-exec-5] DEBUG org.mybatis.spring.SqlSessionUtils (191) - Closing non transactional SqlSession [org.apache.ibatis.session.defaults.DefaultSqlSession@3862e02a] 
.17:23:52.056 [http-nio-9000-exec-5] DEBUG o.s.jdbc.datasource.DataSourceUtils (329) - Returning JDBC Connection to DataSource 
```
















