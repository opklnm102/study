# [Linux] About find
> date - 2022.08.04  
> keyworkd - find  
> find에 대해 정리

<br>

## find?
* directory hierarchy에서 파일 검색시 사용


<br>

## directory의 파일 리스트 조회
```sh
$ find [directory] -maxdepth 1 -type f
```

* 하위 directory 포함
```sh
$ find [directory] -type f
```


<br>

## regex
* regex 사용시 directory name까지 고려 필요
```sh
$ find [directory] -regex [regex]
```

* example
```sh
$ ls
error.log
error.log.1.gz
error.log.2.gz
error.log.10.gz
error.log.12.gz
access.log
access.log.1.gz

$ find . -regex ".*/error.log.[0-9]+.gz"
./error.log.1.gz
./error.log.2.gz
./error.log.10.gz
./error.log.12.gz

$ find . -regex ".*/error.log.[1-2]+.gz"
./error.log.1.gz
./error.log.2.gz

$ find . -regex ".*/error.log.[0-9][0-2]+.gz"
./error.log.10.gz
./error.log.12.gz
```


<br>

## 특정 파일 삭제
```sh
$ find . -regex ".*/error.log.[2-4]+.gz" -exec rm {} \;

# error.log.2.gz, error.log.3.gz, error.log.4.gz 가 삭제된다
```


<br><br>

> #### Reference
> * [find(1) - Linux man page](https://linux.die.net/man/1/find)
