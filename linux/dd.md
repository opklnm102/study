# [Linux] dd - convert and copy a file
> date - 2021.03.22  
> keyworkd - linux, dd, file copy  
> dd 명령어에 대해 정리

<br>

## dd란?
* 가변적인 I/O block size의 파일(default, stdin -> stdout)을 복사하고 변환(optional)을 수행
* input data는 512 byte block을 read/write
* input data가 작으면 여러 input을 집계하여 write block 생성
* 완료되면 input, output block의 수와 잘린 input record를 stderr로 표시

<br>

### Syntax
```sh
$ dd [operands ...]
```


<br>

## Usecase
* 수행 시간과 속도를 알 수 있어 Disk의 read/wirte 속도 측정용으로 많이 사용
* Disk I/O 부하주기
  * `bs(block size)`, `count`를 크게하면 read/write load를 만들 수 있다
* Disk partition copy

<br>

### disk의 read/write 측정
```sh
$ dd if=[file] of=[file] bs=[block size] count=[count]
```

#### read 측정
* read 측정시 `/dev/zero`를 많이 사용
```sh
$ dd if=[src file] of=/dev/zero bs=[block size]

## example
$ dd if=test.log of=/dev/zero bs=256
41049+1 records in
41049+1 records out
10508782 bytes transferred in 0.059799 secs (175735209 bytes/sec)
```
* 0.059799 secs 소요된 것을 확인할 수 있다

> 1번 읽은 파일은 cache에 올라가기 때문에, 다음에 동일한 파일을 읽는 경우 성능이 향상될 수 있다

#### write 측정
```sh
$ dd if=[src file] of=[dest file] bs=[block size]

## example
$ dd if=test.log of=test_copy.log bs=256
41049+1 records in
41049+1 records out
10508782 bytes transferred in 0.152581 secs (68873475 bytes/sec)
```

<br>

### Disk I/O 부하주기
```sh
$ dd if=/dev/zero of=[dest file] bs=[block size] count=[count]

## example - 40Gi 파일 write load 발생
$ dd if=/dev/zero of=/test bs=1G count=40
40+0 records in
40+0 records out
42949672960 bytes (43 GB, 40 GiB) copied, 281.52 s, 153 MB/s
```

<br>

### disk copy and rest
```sh
## 1. copy disk
## dest disk unmount 선행 필요
$ dd if=/dev/sda of=/dev/sdb bs=512

## 2. reset disk
$ dd if=/dev/zero of=/dev/sda
```

<br>

### 파일을 대문자로 변경
```sh
$ dd if=[src file] of=[dest file] conv=ucase
```

<br>

### Random data로 파일 생성
```sh
$ dd if=/dev/urandom of=[dest file] bs=[block size] count=count

## example
$ dd if=/dev/urandom of=/random_data bs=512 count=1
```


<br><br>

> #### Reference
> * [dd(1) - Linux man page](https://linux.die.net/man/1/dd)
