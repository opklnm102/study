# [Redis] Migration to ElastiCache
> date - 2022.08.15  
> keyworkd - redis, migration  
> self managed cluster -> ElastiCache migration하는 방법을 정리  

<br>

## elasticache migration API 사용
> **online migration**

### Prerequisite
* self managed cluster와 ElastiCache는 통신이 가능해야 한다
  * 동일한 VPC에 있는게 좋다
  * 다른 VPC라면 VPC Peering

#### source self managed cluster 준비 사항
* cluster mode 비활성화
* Redis AUTH 비활성화
* protectedmode no
* 논리적 DB 개수가 동일해야한다
* 충분한 리소스 존재

#### target ElastiCache 준비 사항
* redis engine 5.0.5 이상이고 cluster mode 비활성화
* encryption 비활성화
* multi-az 활성화

<br>

### 1. elasticache start-migration 사용
* migration 시작되며 ElastiCache의 primary node는 self managed cluster의 replica가 되며 write 불가
* self managed cluster에서 `REPLICAOF`를 호출해 replication stream 생성

```sh
$ aws elasticache start-migration --replication-group-id <ElastiCache Replication Group Id> \
                                  --customer-node-endpoint-list "Address='<IP Address>',Port=<Port>"
```
> AWS Web Console에서는 `migrate data from endpoint`

* migration 진행 사항은 `client list` 명령어로 client output buffer 확인
* 모든 데이터가 복제되면 ElastiCache cluster status가 `sync`로 변경되며 새로운 write는 계속 복제된다

<br>

### 2. elasticache complete-migration 사용
* cluster status `sync`에서 사용
* ElastiCache의 repliction 중지되고, primary로 promote되어 write 가능
* migrating -> available로 cluster status 변경

```sh
$ aws elasticache complete-migration --replication-group-id <ElastiCache Replication Group Id>
```
> AWS Web Console에서는 `stop data migration`


<br>

## snapshot 이용
> **offline migration**
1. self managed cluster에서 `BGSAVE`로 snapshot(.rdb) 생성
2. Amazon S3에 snapshot 저장
3. Amazon S3의 snapshot으로 ElastiCache 생성

<br>

### Prerequisite
* `BGSAVE`가 동작할 수 있는 여유 리소스 필요
* 서비스 downtime이 발생하고, data loss 가능성이 있다는 것을 인지

<br>

### BGSAVE?
* child process를 생성하여 background에서 RDB 생성
* dump.rdb 파일 생성

* RDB 관련 정보 확인
```sh
$ redis-cli info persistence
```


<br>

## dual write
> **online migration**
1. source/target redis에 일정 기간 동안 dual write하도록 application 수정
2. 데이터가 일치되면 target redis만 바라보도록 수정
3. source redis 제거


<br><br>

> #### Reference
> * [Migrating Redis to AWS Elasticache with minimal downtime](https://stackoverflow.com/questions/37787964/migrating-redis-to-aws-elasticache-with-minimal-downtime)
> * [ElastiCache로 온라인 마이그레이션](https://docs.aws.amazon.com/ko_kr/AmazonElastiCache/latest/red-ug/OnlineMigration.html)
> * [Get data in and out of Redis - redis-developer/riot GitHub](https://github.com/redis-developer/riot)
> * [BGSAVE [SCHEDULE] - Redis Docs](https://redis.io/commands/bgsave/)
