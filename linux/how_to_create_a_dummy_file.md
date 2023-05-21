# [Linux] How to create a dummy file
> date - 2023.05.21  
> keyworkd - dd, fallocate  
> network bandwidth 측정 등의 test를 위해 특정 크기의 파일이 필요할 때 유용한 방법에 대해 정리  

<br>

## dd
* block 단위로 파일을 복사하거나 변환할 수 있는 명령어
```sh
$ dd if=<input target file> of=<output target file> bs=<block size> count=<block write count>
```

* 1GB block 10개를 ./dummy로 출력하여 10G 파일 생성
```sh
$ dd if =/dev/zero of=./dummy bs=1G count=10
10+0 records in
10+0 records out
10737418240 bytes transferred in 2.229286 secs (4816527911 bytes/sec)
```

* /var/log/dmesg를 읽어 test.log에 1024 byte로 10번 반복
```sh
$ dd if=/var/log/dmesg of=./test.log bs=1024 count=10
```


<br>

## fallocate
* 특정 크기의 파일을 만드는 명령어
* size - byte가 기본 단위이며 K, M, G, T, P, E, Z, Y 등 사용 가능
```sh
$ fallocate -l <size> <file name>
```

* 10G 파일 생성
```sh
$ fallocate -l 10G test
```

<br><br>

> #### Reference
> * [dd(1) - Linux man page](https://linux.die.net/man/1/dd)
> * [fallocate(1) - Linux man page](https://linux.die.net/man/1/fallocate)
