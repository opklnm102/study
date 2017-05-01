# MSA(Micro Service Architecture)란?

## Monolithic Architecture
https://www.nginx.com/blog/introduction-to-microservices/
http://chanwookpark.github.io/%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C%EC%84%9C%EB%B9%84%EC%8A%A4%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98/%EB%AA%A8%EB%86%80%EB%A6%AC%ED%8B%B1/%EB%B2%88%EC%97%AD/chris/2016/01/30/monolithic-architecture/

### 일반적인 응용프로그램
* 핵심 business logic
* 다수의 외부 interface adapter

### 간단한 테스트 & 배포
* 단일 서비스에 대한 TestCase
* 패키징된 응용프로그램을 단순 복사하여 배포

### 손쉬운 확장
* 비교적 간단한 부하분산 구성 가능
* L4뒤에 여러 본사본을 세트로 연결

> 프로젝트 초기 단계에서는 여전히 좋은 선택

단점
큰 Monolithic Architecture기반의 코드는 개발자를 위축시킨다
애플리케이션 크기가 커지면 커질수록 구동하는데 시간이 많이 소요 -> 개발시 생산성 하락
지속적인 배포가 점점 더 어려워진다 -> 소스코드 1줄만 고쳐도 전체 서비스를 내렸다 올림
Scale 화장시 특정 컴포넌트만 확장하는 것이 불가능 -> 비효율적이고 불필요한 확장 비용 발생
전체적인 안정성이 점점 더 중요해지므로 신기술 도입이 점점 더 어려워지고 보수적인 접근을 하게됨 -> 개발팀의 기술 정체


### X-axis Scale
* 수평적인 복제(Horizontal Duplication)
* 복제본을 이용한 확장(Sclae by cloning)

### 현실속의 X축 확장
* L4뒤에 다수의 애플리케이션 복제본을 세트로 구성
* N개의 복제본이 있다면 이론적으로 1/N의 부하분산

사용자의 요청 -> 웹서버 -> 서비스 -> DB(그림 넣기)

> 100개의 컴포넌트를 서비스하는데 1개의 컴포넌트만 대박날 경우 부하분산을 위해 무작정 확장하면 99개의 불필요한 확장비용이 생김


### Y-axis Scaling
* 기능 분해(Functional Decomposition)
* 서비스 분리를 이용한 확장(Scale by splitting different things)

### 현실속의 Y축 확장
* 애플리케이션 내부의 컴포넌트를 다수의 애플리케이션으로 분할하여 서비스
* 분할된 서비스는 하나 또는 그 이상의 기능을 명확한 기준으로 나눈다
* 독립적인 서비스들은 API를 통하여 통신한다

(그림 넣기)

> * 독립적인 서비스 100개들의 데이터 조인이 필요하다면 어떻게 해야할까?

### Z-axis Scaling
* 데이터 파티션(Data Partitioning)
* 데이터 분리를 이용한 확장(Scale by splitting similar things)

### 현실속의 Z축 확장
* 데이터베이스 데이터를 분할하여 서비스
   * Table Partitioning
   * DB Sharding
* X축 확장과 비슷하게 N개의 복제본으로 확장하는 측면에서는 비슷함
* 각각의 복제본은 데이터의 일부만 책임

(그림 넣기)

> * 파티셔닝된 데이터가 성장하여 또 다시 파티셔닝해야할 경우 애플리케이션 복잡도는?
> * 개발환경과 리얼환경의 데이터가 다르다면 테스트는 어떻게 해야할까?


X축 - Clustering Service(WAS 복제)
Y축 - Micro Service(WAS 분리)
Z축 - Table Partitioning, DB Sharding(DB 분리)


1. 큰 Monolithic Architecture기반의 코드는 개발자를 위축시킨다
   * Scale Cube Y축 확장을 통하여 서비스를 분리하고 분리된 코드는 자신의 서비스만 책임진다
2. 애플리케이션 크기가 커지면 커질수록 구동하는데 시간이 많이 소요 -> 개발시 생산성 하락
   * 서비스가 작제 분리되면 각각의 애플리케이션 구동시간은 짧아진다
3. 지속적인 배포가 점점 더 어려워진다 -> 소스코드 1줄만 고쳐도 전체 서비스를 내렸다 올림
   * 서비스 단위로 기능 확장, 리펙토링, 버그수정 및 배포가 쉬워진다
4. Scale 화장시 특정 컴포넌트만 확장하는 것이 불가능 -> 비효율적이고 불필요한 확장 비용 발생
   * 특정 서비스만 확장하는 것이 가능해진다
5. 전체적인 안정성이 점점 더 중요해지므로 신기술 도입이 점점 더 어려워지고 보수적인 접근을 하게됨 -> 개발팀의 기술 정체
   * 서비스 단위로 기술 Stack을 선택하는 것이 가능해지고 기술 도입 실패시에도 전체 서비스에 영향이 적어 쉽게 롤백하거나 재개발하는 것이 가능해진다

## Micro Service Architecture

### 서비스 단위로 응용프로그램을 분리
* Business Logic을 다수의 서비스로 분리
* 서비스 단위로 책임을 가짐
* 서비스간에 API 통신

### API Gateway
* 다수의 서비스에 공통으로 필요한 기능 제공(인증, 로깅, 보안정책)
* 모든 서비스들의 API를 등록하고 서비스간에 통신을 중앙 통제

### 서비스 단위의 손쉬운 확장
* 부하 분산이 필요한 경우 서비스 단위로 확장이 가능
* 서비스 확장 후 API Gateway에 통보

> 지속적으로 성장하는 서비스라면 MSA를 추천


### MSA로 구축된 서비스가 더욱 더 성장하여 단위 서비스가 매우 많아진다면?
* API Gateway에 장애가 발생될 경우 서비스 전체가 마비될 위험성이 있다
   * 이중화 무조건 필수
* 서비스 규모에 비례하여 API Gateway에 트래픽이 더욱 더 집중된다
   * 우리회사 최고 트래픽을 내는 서비스는?
* 단위 서비스가 늘어날수록 내부 연계와 트래픽은 기하급수적으로 증가
* 다수의 서비스간에 조인이 필요한 업무가 생기면 성능문제를 고려
   * 어떻게?

참고
http://techblog.netflix.com/2013/01/announcing-ribbon-tying-netflix-mid.html
https://blog.docker.com/2014/12/dockercon-europe-keynote-state-of-the-art-in-microservices-by-adrian-cockcroft-battery-ventures/



단일 서비스 배포 그림 넣기

서비스 기반 Database 그림넣기

API Gateway 그림 넣기

Sync Interaction 그림 넣기

Async Interaction 그림 넣기

Service Registry 그림 넣기



> #### 참고
> [Spring boot와 docker를 이용한 MSA](https://www.slideshare.net/heungrae_kim/spring-boot-docker-msa)  

