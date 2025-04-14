# DBCP(Database Connection Pool)


DB 를 사용하는 비즈니스 로직에서 가장 많은 시간이 소요되는 것은 DB Connection을 생성할 때

1. DB 서버 접속을 위해 JDBC 드라이버를 로드
2. DB 접속 정보와 JDBC 드라이버를 이용해 DB Connection을 생성
3. Connection 객체를 이용해 SQL을 수행
4. 처리가 완료되면 사용된 리소스들을 close하여 반환




Todo: DBCP 사진 추가

Connection Pool의 역할

WAS가 실행되면서 미리 일정량의 DB Connection 객체를 생성하고 Pool이라는 공간에 저장
HTTP 요청에 따라 Pool에서 Connection 객체를 가져다 쓰고 반환

이와 같은 방식으로 HTTP 요청마다 DB Driver를 로드하고 물리적인 연결에 의한 Connection 객체를 생성하는 비용을 줄인다








## DBCP 종류

[Apache Commons DBCP](http://commons.apache.org/proper/commons-dbcp/)


[HikariCP](https://github.com/brettwooldridge/HikariCP)
There is nothing faster. There is nothing more correct. HikariCP is a “zero-overhead” production-quality connection pool.





https://www.holaxprogramming.com/2013/01/10/devops-how-to-manage-dbcp/



