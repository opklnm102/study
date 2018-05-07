# [Server] TPS(Transaction Per Second)
> Mash-Up backend team의 세미나에서 TPS란 용어를 듣고 찾아본 내용을 정리


## TPS(Transaction Per Second)란?
* 초당 트랜잭션의 수
* 단위 시간당 처리한 건수

### 트랜잭션이란 정의하기 나름이다
* DB 트랜잭션일 경우, 한 트랜잭션이 commit, rollback의 수를 의미한다면 `초당 commit, rollback이 일어나는 횟수`라고 볼 수 있다
* Client <---> Server일 경우, Server가 `초당 Client의 requet를 처리한 건수`라고 볼 수 있다


### 간단하게 TPS를 측정하자면
* agent 10개, process 10개, thread 300개
   * 10 * 10 * 300 = 30,000
   * 총 30,000개의 thread가 지속적으로 요청하는 상황
* 30,000번의 요청을 서버에서 `1초 미만으로 처리`할 수 있다면 TPS는 30,000이상
* 30,000번의 요청을 서버에서 `2초 이상으로 처리`할 수 있다면 TPS는 15,000이하


## Commons DBCP, Tomcat으로 생각해보자
   
![TPS1](https://github.com/opklnm102/study/blob/master/server/images/helloworld-201508-CommonsDBCP1.png)

* 하나의 요청이 10개의 쿼리를 실행
   * 쿼리의 평균 실행시간 50ms
   * 10개면 500ms(다른 컴포넌트의 시간은 무시할 수 있는 정도의 값이라 제외)

![TPS2](https://github.com/opklnm102/study/blob/master/server/images/helloworld-201508-CommonsDBCP2.png)

* Connection Pool의 Idle Connection이 5개라면 동시에 5개 요청을 500ms동안 처리 가능
* 1초에 10개의 요청 처리 가능 -> 10TPS


## TPS와 Connection 개수의 연관성
* Connection 개수는 TPS에 영향
* 처리해야하는 요청 수가 증가해도 Pool의 Connection 개수가 5개인 이상, 10TPS 이상의 성능을 낼 수 없기 때문

![TPS3](https://github.com/opklnm102/study/blob/master/server/images/helloworld-201508-CommonsDBCP3.png)

* 1~5까지 요청이 실행되고 있는 동안 Connection Pool에 여분의 Connection이 없기 때문에 6~10의 요청은 wait 상태가 되어 여분의 Connection이 생길 때까지 설정한 maxWait값만큼 기다리게 된다
   * 이때 기다리는 대상은 WAS의 thread가 된다

![TPS4](https://github.com/opklnm102/study/blob/master/server/images/helloworld-201508-CommonsDBCP4.png)

* Pool의 Connection 개수를 10으로 늘려보자
   * 20TPS가 된다
* DBMS의 리소스는 다른 서비스와 공유하기 때문에 무조건 Connection 개수를 크게 설정할 수 없는 상황이 대부분
* 예상 접속자 수와 서비스의 실제 부하를 측정해 최적값을 설정하는게 중요
* wait 값 조절이 무한히 Connection 개수를 늘리지 않고 최적의 환경을 구축하는데 중요한 역할을 한다
   * 일시적인 과부하 상태에서 사용자에게 드러나는(error 화면 노출 등) 시스템의 견고함을 결정


### 적절한 maxWait 값은?

![TPS5](https://github.com/opklnm102/study/blob/master/server/images/helloworld-201508-CommonsDBCP5.png)

* Pool의 Connection이 5개인 경우, 6번째 요청이 오면 Pool에 여유 Connection이 없어 WAS thread가 maxWait까지 대기한다


#### 너무 크게 설정하면?
* 대기를 하면서도 계속 사용자 요청이 증가하게 되면 WAS therad Pool의 therad가 모두 소진되게 된다
   * Error가 발생
* wait 상태가 풀리고, DB Connection을 획득했는데, 사용자는 이미 떠나고 없는 경우도 있을 수 있다
   * 평균적으로 사용자는 2~3초 응답이 없으면 새로고침을 하거나 떠나버린다

#### 너무 작게 설정하면?
* Connection Pool에 여분의 Connection이 없는 즉시 error 발생
* 너무 자주 error 화면이 노출된다
   * UX 악영향


* 사용자의 급증으로 maxWait안에 Connection을 얻지 못하는 빈도가 증가하면 maxWait을 더 줄여서 시스템에서 사용하는 thread가 한도에 도달하지 않도록 방어할 수도 있다
   * 전체 시스템 장애는 피하고 `간헐적 오류`가 발생하는 정도로 영향도를 축소할 수 있다
   * 이런 상황이 자주 있다면 DBCP의 maxActive와 tomcat의 maxThread를 동시에 늘이는 것도 고려
      * 머신의 리소스가 충분하다면, 부족하다면 scale out/up 고려


#### maxIdle < maxActive라면?
* maxActive = 10, maxIdle = 5
* 항상 동시에 5개를 사용하고 있는 상황에서 1개의 Connection이 추가로 요청된다면, maxActive = 10이므로 Pool에 1개의 Connection을 추가로 생성하고 요청 수행 후 maxIdle = 5에 영향을 받아 Connection을 닫아버리므로, 일부Connection을 매번 생성했다 닫는 비용이 발생할 수 있다
* maxActive = maxIdle가 바람직
   * minIdle < maxActive로 두어 시스템이 휴식 기간일 때 리소스를 절약하도록 한다


> #### 참고
> [Commons DBCP 이해하기](http://d2.naver.com/helloworld/5102792)
