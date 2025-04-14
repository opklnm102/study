# [Redis] Redis command collections
> date - 2020.03.25  
> keyword - redis  
> Redis에서 사용할 만한 명령어 정리

<br>

## Get Keys

### Get All Keys
```sh
$ redis-cli --scan --pattern '*'
```


<br>

## Delete Keys

### Delete All Keys
* All Redis Database
```sh
$ redis-cli FLUSHALL
```

* currently selected Redis Database
```sh
$ redis-cli FLUSHDB
```

* specified Redis Database
```sh
$ redis-cli -n [database number] FLUSHDB
```

<br>

### Delete Keys Matching a Pattern
```sh
$ redis-cli --scan --pattern '[pattern]' | xargs redis-cli del

## example
$ redis-cli --scan --pattern users:* | xargs redis-cli del
```

* Redis 4.0 이상이면 `unlink`로 background에서 제거
```sh
$ redis-cli --scan --pattern '[pattern]' | xargs redis-cli unlink
```






# [Redis] 
> date - 2018.10.25  
> keyword - redis  






- Redis tunneling
1. nginx가 있는 ec2로 터널링
$ ssh -N -L 63790:tb-redis-dev.c59xxt.0001.apse1.cache.amazonaws.com:6379 ec2-user@52.76.72.210 -i TB_MASTER_KEYPAIR.pem

2. Redis 접속
$ redis-cli -p 63790

$ keys otp* 검색한 후
key에 해당하는 value를 삭제해준다



$ hkeys <key>
$ hset <key> <field> <value>
$ heget <key> <field>


- CMS에서 등록하는 system config redis 구조
Key - SYSTEM_CONFIG
Hash key - {configId}:{configGroupId}
Value - xxx

ex. 
SYSTEM_CONFIG -> MIN_APP_VERSION:APP_VERSION
SYSTEM_CONFIG -> EACH_TRANSFER_LIMIT:WALLET




- key search
```sh
$ keys [pattern]

$ keys memo:ask:send:*
```
keys 대신 scan
>. https://knight76.tistory.com/entry/redis-keys-%EB%8C%80%EC%8B%A0-scan
https://velog.io/@sejinkim/Redis-KEYS-vs-SCAN
https://realmojo.tistory.com/171


- field value search
```sh
$ hgetall [key]

$ hgetall memo:ask:send:20220614
```

- delete
```sh
$ hdel [key] [hash key]
$ hdel memo:ask:send:20220614 ff:2HE2QCQU:1
```

















<br><br>

> #### Reference
> * [Redis: Delete All Keys](https://www.shellhacks.com/redis-delete-all-keys-redis-cli/)
> * [How to Delete Keys Matching a Pattern in Redis](https://rdbtools.com/blog/redis-delete-keys-matching-pattern-using-scan/)
