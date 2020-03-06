# [Linux] xargs
> date - 2020.03.06  
> keyworkd - linux, xargs  
> xargs에 대해서 알아본다

<br>

## What is xargs?
* construct argument list(s) and execute utility
* 출력된 결과를 인자로 확용하여 다른 command에서 활용할 수 있게 해준다
```sh
$ xargs [options] [command]
```


<br>

## Example

### Too long arguments error
* 많은 파일 삭제시 rm에서 argument list too long error 발생시
```sh
## 1
$ find ~ -name '*.log'
./b.log
./c.log
./a.log

## 2
$ find ~ -name '*.log' -print0
./b.log./c.log./a.log

## finally
$ find ~ -name '*.log' -print0 | xargs -0 rm -f
```

<br>

### 특정 파일을 찾고, ls 사용
```sh
$ find . -name '*.log' | xargs ls -l
-rw-r--r--  1 huekim  staff  0  3  6 10:45 ./1.log
-rw-r--r--  1 huekim  staff  0  3  6 10:45 ./2.log
-rw-r--r--  1 huekim  staff  0  3  6 10:45 ./3.log
-rw-r--r--  1 huekim  staff  0  3  6 10:45 ./4.log
```

<br>

### 여러 파일 일괄 다운로드
* **space**와 **newline**으로 stdin을 나누고 긴 인수로 1번만 호출되기 때문에 `-n`을 사용해 1개의 argument만 넘기게 해야 `curl`이 여러번 호출되어 파일을 다운로드한다
```sh
$ cat urls.txt | xargs -n1 curl -O

$ cat urls.txt | wget -c
```

<br>

### 특정 파일들을 찾아 압축
```sh
$ find . -name '*.log' -type -f -print | xargs tar -cvzf images.tar.gz
```

<br>

### 특정 파일들을 찾아 복사
* `-I`와 `{}`를 사용해 원하는 위치에 argument 전달한다
```sh
$ find . -name '*.log' | xargs -n1 -I {} cp {} /test

## result
$ find . -name '*.log' | xargs -n1 -I ./1.log cp ./1.log /test
```

<br>

### git repository의 develop branch checkout
* `-P[number]` - Parallel process
```sh
$ ls | xargs -I {} -P10 git -C {} checkout develop
```

<br>

### -n 살펴보기
```sh
$ seq 1 3 | xargs -n1 -P3 bash -c 'echo $0'
1
2
3
```

* `-n2`면 2개씩 넘기므로 `$2`에는 값이 없다
```sh
$ seq 1 3 | xargs -n2 -P3 bash -c 'echo $0 $1 $2'
1 2
3
```


<br>

## Conclusion
* `xargs`는 활용도가 매우 높은 command이므로 알아두는 것을 추천!


<br><br>

> #### Reference
> * [xargs](https://ss64.com/bash/xargs.html)
> * [xargs: How To Control and Use Command Line Arguments](https://www.cyberciti.biz/faq/linux-unix-bsd-xargs-construct-argument-lists-utility/)
