# [AWS] ElastiCache update
> date - 2022.08.07  
> keyword - aws, cloud, elasticache, redis  
> ElastiCache for Redis 업데이트에 대한 내용 정리  

<br>

## Scale up/down
ElastiCache memory 과점유로 인해 scale up이 필요하거나 효율화를 위해 scale down이 필요할 경우
* [Modify Cluster] - [Node Type] 변경 - Modify 버튼 클릭

### scale up시 background 동작
1. 요청된 node type으로 내부 cluster 생성
2. 기존 cluster의 데이터를 새로 생성된 cluster로 동기화
3. 데이터 동기화 완료시 DNS endpoint 업데이트

<br>

### 순단
* 이전 node에 대한 지속적인 요청이 있는 경우, 기존 cache node 종료 과정 중 약간의 downtime이 발생할 수 있다
* scale up 과정 진행시 DNS endpoint를 업데이트 하기 전까지는 기존 node로 트래픽은 유지된다


<br>

## Cluster update
긴급 보안 패치 적용 등

* 패치가 동작할 경우, failover 발생(primary <-> replica 변경)
* DNS endpoint 업데이트 전까지 순단 발생
* endpoint DNS TTL 시간 이후 자동 정상화되며 소스 코드 변경 불필요


<br>

## ParameterGroup update
지연, 순단을 발생시키지 않으나 주의사항이 있다

* node reboot가 필요한 parameter가 있으니 [Redis-specific parameters](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/ParameterGroups.Redis.html)의 Changes take effect 확인 필요
* parameter 변경으로 인한 영향도 파악
  * e.g. 'reserved-memory-percent' 변경시 maxmemory에 영향을 주어 사용 가능한 memory가 변경된다


<br><br>

> #### Reference
> * [Redis-specific parameters](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/ParameterGroups.Redis.html)
> * [Modifying a parameter group](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/ParameterGroups.Modifying.html)
