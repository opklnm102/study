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


<br><br>

> #### Reference
> * [Redis: Delete All Keys](https://www.shellhacks.com/redis-delete-all-keys-redis-cli/)
> * [How to Delete Keys Matching a Pattern in Redis](https://rdbtools.com/blog/redis-delete-keys-matching-pattern-using-scan/)
