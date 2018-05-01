# [Clean Code] Command Query Separation
> CQRS에 대해 공부하다 CQS라는 개념이 있어서 정리 

* [Object Oriented Software Construction](https://www.amazon.com/gp/product/0136291554?ie=UTF8&tag=martinfowlerc-20&linkCode=as2&camp=1789&creative=9325&creativeASIN=0136291554)에 나오는 개념
* 근본적인 아이디어는 객체의 메소드를 `2개의 분리된 카테고리로 나눈다`
* Queries(R)
   * 결과를 반환하고 시스템의 관찰 가능한 상태를 변경하지 않는다(side effect X)
* Commands(CUD)
   * 시스템의 상태는 변경하지만 값은 반환하지 않는다
   * mutator라고 볼 수 있다
* 상태를 변경하는 메소드와 그렇지 않은 메소드를 명확하게 분리할 수 있다면 매우 편해진다
   * 함수형 언어의 장점을 제한적으로 누릴 수 있다
   * query 순서에 따라 실행 결과가 변하지 않는다
   * 디버깅 용이
   * 버그를 줄일 수 있다
* 모든 메소드는 1번의 액션에서 `상태를 변경하는 command`든 `데이터를 반환하는 query`든 1가지 액션만 취해야 한다
   * `질문을 할 때 대답을 변경하지 말라`
   * 메소드는 값을 반환할 때 referentially transparent(시스템 상태를 변경하지 않는 메소드)해야 하며 side effect를 유발하지 말아야 한다


## Sample
* before
```java
int x;

int incrementAndReturn() {
    x = x + 1;
    int copyX = x;

    return copyX;
}
```

* after - Command Query Separation
```java
int x;

int value() {
    return x;
}

int increment() {
    x = x + 1;
}
```


## 실제 Application에 적용한다면?
* 비즈니스 로직은 거의 대부분 데이터 변경 작업에서 처리되고, 데이터 조회 작업은 단순 데이터 조회가 대부분
* 두 업무를 동일한 domain model로 처리하게 되면?
   * 각 업무 영역에 필요치 않은 domain 속성들로 인해 복잡도는 한없이 증가
   * domain model은 초기 설계 의도와 다른 방향으로 변질
* `Command와 Query를 분리하여 domain model의 순수성을 유지`하자(Pure Domain Model)

|| Command | Query |
|:--|:--|:--|
| 변경 | 가끔 변경됨 | 자주 변경됨 |
| 검증 | O | X |
| 비즈니스 로직 수정| O | X |

> #### Pure Domain Model
> * 도메인 객체는 순수해야 한다
> * 순수한 객체
>    * no getter, setter
>    * law of demeter
>    * SRP, DIP, OCP, ISP, LSP
> * 장점
>    * 순수한 Domain Model
> * 단점
>    * DTO를 만드는 것은 귀찮다, 성가시다, 괴롭다
>    * DTO는 또다른 중복
>    * DTO와 Domain Model의 Convert를 고민해야 한다

### Entity
<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/clean-code/images/cqs_domain1.png" alt="cqs domain1" width="400" height="400"/>
</div>

* Entity가 View가 늘어날 수록 점점 비대해진다
* View를 위한 DTO가 필요한 시점

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/clean-code/images/cqs_domain2.png" alt="cqs domain2" width="400" height="400"/>
</div>

* View와 비즈니스 로직의 요구사항 다름
* Entity = 비즈니스 로직
* DTO = View

### Service
<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/clean-code/images/cqs_service1.png" alt="cqs service1" width="400" height="400"/>
</div>

* 뚱뚱한 서비스

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/clean-code/images/cqs_service2.png" alt="cqs service2" width="400" height="400"/>
</div>


### 멀티 모듈인 경우
* 모듈에 특화된 조회 서비스는 해당 모듈에서 관리
* Core 모듈의 복잡성이 줄어듬
* 비즈니스 로직은 Core에서 관리


> #### CQS vs CQRS
> * CQS
>    * Separate command methods that change state from query methods that read state
> * CQRS
>    * Separate command messages that change state from query messages that read state
> * CQS는 method에 한정되어 있지만 CQRS는 message에 관심
> * 조금 더 구체적? 상위 개념이라고 생각하면 될까나.. infra적으로 접근할 수도 있어서?


> #### 참고
> * [Command Query Separation](https://martinfowler.com/bliki/CommandQuerySeparation.html)
> * [좌충우돌 ORM 개발기 | Devon 2012](https://www.slideshare.net/daumdna/devon-2012-b4-orm?qid=8ba43bc4-0866-4415-9414-aba30c26cb05&v=&b=&from_search=30)
> * [Greg Young. CQS vs. CQRS](http://codebetter.com/gregyoung/2009/08/13/command-query-separation)
