# [MySQL] No operations allowed after connection closed issue
> date - 2022.10.05  
> keyword - mysql, autoreconnect, jdbc, hikaricp  
> MySQL 사용시 발생하는 No operations allowed after connection closed에 대해 정리  

<br>

## Requirement

### Dependency
* [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/)
* [MySQL Connector/J](https://dev.mysql.com/doc/connector-j/8.0/en) or [MariaDB Connector/J](https://mariadb.com/kb/en/about-mariadb-connector-j)
* [HikariCP](https://github.com/brettwooldridge/HikariCP)


<br>

## Issue. connection error 발생
```java
hikari-pool - Failed to validate connection com.mysql.cj.jdbc.ConnectionImpl@18b7eeb5 (No operations allowed after connection closed)
Possibly consider using a shorter maxLifetime value.
```
> 예전에는 autoReconnect=true or Possibly consider using a shorter maxLifetime value 였는데 autoReconnect deprecated로 메시지가 변경되었다


<br>

## Resolve
종료된 connection을 사용하는 경우 발생하는데 아래 3가지 방법 정도로 수정해볼 수 있다
1. MySQL의 `wait_timeout`을 수정
2. JDBC parameter에 autoReconnect=true로 설정
3. HikariCP의 maxLifetime을 MySQL의 wait_timeout 보다 작게 설정

<br>

### 1. MySQL의 `wait_timeout`을 수정
* MySQL이 관리할 connection이 늘어날 수 있어 MySQL에 부담이될 수 있어 비추천

<br>

### 2. JDBC parameter에 autoReconnect=true로 설정
* autoReconnect는 DB session에 문제가 있으면 SQLException 발생 후 재접속, transaction rollback과 남은 작업이 수행되지 않아야하는데 처리되지 않는다
* [3.14 Troubleshooting Connector/J Applications](https://dev.mysql.com/doc/connectors/en/connector-j-usagenotes-troubleshooting.html)을 보면 아래와 같이 사용하지 않도록 가이드하므로 비추천
```
Use of the autoReconnect option is not recommended because there is no safe method of reconnecting to the MySQL server without risking some corruption of the connection state or database state information. Instead, use a connection pool, which will enable your application to connect to the MySQL server using an available connection from the pool. The autoReconnect facility is deprecated, and may be removed in a future release.
```

<br>

### 3. HikariCP의 maxLifetime을 MySQL의 wait_timeout 보다 작게 설정
* 권장하는 방법
* MySQL은 `wait_timeout`을 초과한 idle connection을 정리
* MySQL은 어떤 client인지 알 수 없으므로 connection close packet을 보낼 수 없는데, 이때 client에서 종료된 connection을 사용하게 되면 발생하게 된다. 즉 active connection이면 상관 없다
* MySQL wait_timeout 확인
```sql
-- MySQL default 28,800s(8 hours)
show global variables like 'wait_timeout' 
```
* HikariCP의 maxLifetime(default. 30min, 최소 30s)을 network latency를 고려하여 wait_timeout 보다 2 ~ 5s 짧게 설정
  * HikariCP에서 connection의 lifecycle을 관리할 수 있게하면 사용 중인 connection은 정리되지 않는다
  * maxLifetime은 connection pool에서 idle connection의 최대 생존 시간
  * connection 사용 후 connection pool에 반환시 idle time이 초기화되어 트래픽이 많은 시간대라면 connection 종료 가능성은 낮다


<br><br>

> #### Reference
> * [光 HikariCP・A solid, high-performance, JDBC connection pool at last](https://github.com/brettwooldridge/HikariCP)
> * [3.14 Troubleshooting Connector/J Applications](https://dev.mysql.com/doc/connectors/en/connector-j-usagenotes-troubleshooting.html)
