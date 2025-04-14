# [DB] Isolation Level
> date - 2019.02.10  
> keyword - DB, 
> 

<br>

## Isolation Level이란
* 트랜잭션에서 일관성 없는 데이터를 허용하는 수준

> Isolation은 [About Relational Database](./about_rdb.md)을 참고

https://m.blog.naver.com/PostView.nhn?blogId=pjt3591oo&amp;logNo=221754164462&amp;proxyReferer=http%3A%2F%2Fm.facebook.com%2F


* ANSI에서 4가지 표준 Transaction Isolation Level 정의
  * Read Uncommitted
  * Read Committed
  * Repeatable Read
  * Serializable
* 동시성이 증가하면 데이터 무결성에 문제가 발생할 수 있고, 동시성이 떨어질수록 데이터 무결성이 보장된다
* 무결성이 보장될수록 비용이 증가




### Read Uncommitted

### Read Committed

### Repeatable Read

### Serializable





여러 트랜잭션이 동시 다발적으로 데이터에 접근할 때 발생하는 문제

Dirty Read
커밋되지 않은 수정 중인 데이터를 다른 트랜잭션에서 읽을 수 있도록 허용

Non-Repeatable Read


Phantom Read





