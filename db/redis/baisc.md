



https://www.slideshare.net/charsyam2/redis-196314086




https://github.com/KD4/TIL/blob/master/Redis/redis-database.md




redis hash
https://www.google.co.kr/search?newwindow=1&safe=off&q=redis+hash&spell=1&sa=X&ved=0ahUKEwiSyaf58ufWAhUEjLwKHcq4CqEQvwUIISgA&biw=1440&bih=803



https://charsyam.wordpress.com/2011/11/06/redis%EC%97%90-%EC%8B%AC%ED%94%8C%ED%95%9C-key-value-%EB%A1%9C-%EC%88%98-%EC%96%B5%EA%B0%9C%EC%9D%98-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A0%80%EC%9E%A5%ED%95%98%EA%B8%B0/

https://aws.amazon.com/ko/elasticache/what-is-redis/

http://tech.kakao.com/2016/03/11/redis-scan/

http://www.zdnet.co.kr/news/news_view.asp?artice_id=20131119174125



https://architecturenotes.co/redis/





spring-data-redis
https://github.com/spring-projects/spring-data-keyvalue-examples/blob/master/retwisj/src/main/java/org/springframework/data/redis/samples/retwisj/redis/RetwisRepository.java




Redis를 사용하는 이유
* in-memory-db
  * 속도가 빠름 ( 네트워크 통신 없을 시 redis 자체 TPS 10만 가능하다고 나와있음 ) 
  * RDB + AOF로 저장 기능을 제공하지만 영구 저장 목적으로 사용은 가능
* Single Thread
  * 스레드간 정보의 불일치 없음
  * 오래걸리는 명령어는 주의 필요
* List, Set, ZSet과 같은 자료구조 지원
* 단순한 key / value 
  * 사용하기 쉬움
  * 쿼리 불가
* 2^32(40억 정도) 개의 key 저장 가능



Redis Hashing 충돌 가능성 - https://www.tutorialspoint.com/redis/redis_hashes.htm#:~:text=Redis%20Hashes%20are%20maps%20between,4%20billion%20field%2Dvalue%20pairs.








## DB 선택
```sh
$ select [number]

## example
$ select 1
```
* redis.conf의 `databases` 설정
  * default 16(0 ~ 15)
* cluster node는 0만 사용하므로 확장성을 고려하여 다른 DB는 사용하지 않는게 나을듯

https://www.pymoon.com/entry/Redis-%EC%97%90%EC%84%9C-%EA%B0%99%EC%9D%80-%ED%82%A4%EB%A1%9C-%EB%8B%A4%EB%A5%B8-%EA%B0%92%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B2%95


## Redis Persistence
https://redis.io/docs/manual/persistence/

### RDB
```sh
## 10000개 key 변경시 60s 이내에 save
$ save 60 10000

## 즉시 900s(15min)이내에 save
$ save 900 1
```

### AOF(Append Only File)
```
appendonly yes(default. no)
```
입력되는 모든 key, value가 disk에 쓰기 명령으로 저장














https://github.com/TheOpenCloudEngine/uEngine-cloud-k8s/wiki/Redis-on-kubernetes



< 💡 Redis 는 언제 사용해야할까? >

💬 Redis 란?
Redis는 “REmote DIctionary Service” 의 약자로 RAM 에 데이터를 저장하여 조회 및 처리 속도가 매우 빠른 오픈소스 데이터 저장소입니다. 하지만 RAM 은 휘발성 메모리이기 때문에 전원이 꺼지면 데이터가 손실됩니다. 그래서 Redis 는 다른 데이터 저장소에 비해 내구성 있고 일관된 데이터베이스는 아닙니다.

💬 Redis 의 장점
- 매우 빠른 속도로 읽기 와 쓰기가 가능합니다.
- 데이터가 메모리에 상주하므로 대기 시간이 짧고 처리량이 높은 데이터 액세스가 가능합니다.
- 다양한 데이터 형식(String, List, Set, Map, Streams, JSON 등)을 지원합니다.
- 쿼리 언어를 사용하는 기존 데이터베이스와 달리 Redis는 해시 기반 데이터 구조로 인해 훨씬 ​​간단합니다. 그래서 한 줄의 코드를 사용하여 Redis 데이터를 읽고 쓸 수 있습니다.
- 다양한 프로그래밍 언어(Python, Java, C, C++ 등)를 지원합니다.
- 기본 복제본 아키텍처를 따르기 때문에 Redis 데이터 저장소를 여러 서버에 쉽게 복제할 수 있습니다.
- 가용성과 확장성 이 뛰어 납니다. 기본 복제본 또는 클러스터된 토폴로지를 사용할 수 있습니다. Redis는 일관된 성능과 안정성을 제공 합니다.
- 일정 시간이 지나면 데이터를 자동으로 삭제시킬 수 있습니다.(key 값에 대해 expire time 을 설정할 수 있습니다.)

💬 Redis 를 사용하기 좋은 케이스
- 빠르게 저장 및 조회가 필요한 캐시 데이터를 관리 할 때 사용합니다.
- 게임 순위표 구현: 순위표가 변경될 때마다 Redis 에 업데이트하고 이를 즉시 조회 하여 반영 가능합니다.
- 웹 애플리케이션의 세션 저장소로 사용 가능합니다.
- 음식 배달 및 택시 애플리케이션을 위한 GeoSpatial 데이터베이스로 사용 가능합니다.
- 실시간 데이터를 수집, 처리 및 분석하기 위한 인메모리 데이터 저장소로 Apache Kafka와 같은 스트리밍 솔루션과 함께 사용 가능합니다.

💬 Redis 를 사용하기 힘든 케이스
- 중요한 비즈니스 데이터(회원, 결제 등)는 Redis 에 저장해서는 안 됩니다. 지속적이지 않기 때문입니다.
- join 과 같은 복잡한 데이터베이스 쿼리를 수행해야 하는 경우 다른 대안을 고려해야 합니다. Redis는 key-value 형태로 저장되기 때문에 key 를 통해서만 액세스할 수 있습니다.
- 데이터가 매우 많이 쌓여야할 경우 RAM 이 디스크에 비해 훨씬 비싸고 저장 공간이 제한되어 있으므로 이럴 경우 Redis 보다는 디스크 기반 데이터베이스를 사용하는 것이 좋습니다.
- ACID 속성이 필요하거나 데이터가 높은 관계형인 경우 SQL 데이터베이스를 사용하는 것이 좋습니다.


[Why should you use Redis? (and Why not)](https://medium.com/@ronythankachan/why-should-you-use-redis-c322707a7fe0)
