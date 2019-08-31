# [Linux] How to check file contents
> date - 2019.08.27  
> keyworkd - cat, more, less, head, tail  
> Linux에서 파일 내용을 확인하는 명령어를 정리  

<br>

## cat
* concatenate and print files
* file을 순차적으로 읽어서 **stdout**으로 출력
  * 2개 이상일 경우 연결된 것처럼 출력
* file이 `-`거나 없는 경우 **stdin**에서 읽는다
* file이 unix domain socket이면 다음 EOF까지 읽는다
* text 파일일 경우 정상적으로 확인할 수 있지만 binary 파일인 경우 알아볼 수 없다
```sh
$ cat [option] [file ...]
```

<br>

### 각 행에 번호를 출력
```sh
$ cat -b [file]

## example
$ cat -b test.txt
1 aaa


2 bbb
3 ccc
...
```

<br>

### 빈 행에도 번호를 출력
```sh
$ cat -n [file]

## example
$ cat -n test.txt
1 aaa
2 
3
4 bbb
5 ccc
...
```

<br>

### 2개 이상 연속되는 빈 행을 1개의 행으로 출력
```sh
$ cat -s test.txt

aaa

bbb
ccc
...
```


<br>

## more
* text를 file or stdin으로 받아 line or page 단위로 출력
* 파일의 내용을 확인하는 위치에서 바로 vi로 편집 가능


```sh
$ more [file or stdin]

## example
$ more test.log

$ ls -al | more
```

<br>

### command
* `space` or `f` - 한 화면 뒤로 이동
* `b` - 한 화면 앞으로 이동
* `enter` - 한 행씩 뒤로 이동
* `/` + 문자열 입력 - 문자열 검색
  * `n` - 다음 검색 결과로 이동
  * `N` - 이전 검색 결과로 이동
* `v` - 현재 위치에서 `vi` 실행
* `=` - 현재 위치 행 번호 출력
* `q` - 종료
* `h` - help


<br>

## less
* view file(or stdin) one screenful at a time
* `more`과 유사하지만 파일에서 **앞/뒤로 이동** 가능
* 특정 행의 앞/뒤 내용을 살펴볼 때 유용
* 입력으로 **전체 파일을 읽을 필요가 없어서** vi 같은 text editor보다 빠르다
  * `vi`는 해당 파일의 size만큼 memory에 올리기 때문에 size가 클수록 느려지고, **memory가 부족하면 swap이 발생**할 수 있다
  * `less`는 random access 방식을 사용하므로 즉시 열린다
* command는 `more`와 `vi` 기반

```sh
$ less [file or stdin]

## example
$ less test.log

$ ls -al | less
```

<br>

### command
* `space` or `f` - 한 화면 뒤로 이동
* `b` - 한 화면 앞으로 이동
* `enter` - 한 행씩 뒤로 이동
* `/` + 문자열 입력 - 문자열 검색
  * `n` - 다음 검색 결과로 이동
  * `N` - 이전 검색 결과로 이동
* `v` - 현재 위치에서 `vi` 실행
* `=` - 현재 위치 행 번호 출력
* `q` - 종료
* `h` - help
* `ng` - n번째 행으로 이동(default. 처음 행)
* `nG` - n번째 행으로 이동(default. 마지막 행)



<br>

## head
* display first lines of a file
* line count(default. 10) or byte 단위로 읽는다

```sh
$ head [file or stdin]
```

<br>

### 1 ~ 200행까지 출력
```sh
$ head -n [line count] [file of stdin]

## example
$ head -n 200 test.log  # or -200
```

<br>

### 처음 200 byte까지 출력
```sh
$ head -c [byte] [file or stdin]

## example
$ head -c 200 test.log
```


<br>

## tail
* display the last part of a file
* 파일 또는 stdin을 stdout으로 출력
* **line count**, **byte**, **512-byte block** 단위로 읽는다
* log 같이 특정 파일에 계속 추가되는 내용을 모니터링할 때 유용

```sh
$ tail [file or stdin]
```

<br>

### 마지막 200행 출력
```sh
$ tail -n [line count] [file or stdin]

## example
$ tail -n 200  # or -200
```

<br>

### 2행부터 마지막 행까지 출력
```sh
$ tail -n +[line count] [file or stdin]

## example
$ tail -n +2 test.log  # or +2
```

<br>

### 마지막 200 byte 출력
```sh
$ tail -c [byte] [file or stdin]

## example
$ tail -c 200 test.log
```

<br>

### 처음의 200 byte부터 마지막까지 출력
```sh
$ tail -c +[byte] [file or stdin]

## example
$ tail -c +200 test.log
```

<br>

### 마지막 2 block 출력
```sh
$ tail -b [block count] [file or stdin]

## example
$ tail -b 2 test.log
```

<br>

### 실시간으로 마지막 200행 출력
```sh
$ tail -f [file or stdin]

## example
$ tail -200f test.log
```

<br>

### inode number를 감지해 파일 이름 변경 및 rotate할 경우에도 실시간으로 마지막 200행 출력
```sh
$ tail -F [file or stdin]

## example
$ tail -200F test.log
```

<br><br>

> #### Reference
> * [less](https://ss64.com/bash/less.html)
> * [more](http://man7.org/linux/man-pages/man1/more.1.html)
> * [cat](http://man7.org/linux/man-pages/man1/cat.1.html)
> * [head](https://linux.die.net/man/1/head)
> * [tail](http://man7.org/linux/man-pages/man1/tail.1.html)
