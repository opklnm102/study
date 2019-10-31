# [Linux] Pipe and Redirection
> date - 2019.05.13  
> keyword - pipe, redirection  
> 2018년에 면접 질문으로 들었던 질문 중 하나인 pipe와 redirection에 대해 정리  

<br>

## Pipe?
* 어떤 명령의 실행 결과 출력을 **그대로 다음 명령의 소스로 전달**하는 것
* process의 input, output을 process로 사용
* `|` 사용
* 이전 명령어의 결과를 가공할 때 주로 사용하기 때문에 `awk`, `cut`, `grep`, `more` 등의 명령어들을 조합해서 많이 사용


### Usage
```sh
$ tail -500f <file name> | grep "xxx"
```


<br>

## Redirection?
* **Standard Stream의 흐름을 바꾸**는 것
* process의 input, output을 file로 사용
* `>`, `<` 사용


<br>

### Standard Stream?
* 일반적으로 command로 실행되는 process는 3개의 stream을 가진다
  * standard input stream(stdin) = 0
  * standard output stream(stdout) = 1
  * standard error stream(stderr) = 2
* 1개의 input stream, 2개의 output stream
* 0, 1, 2의 **file descriptor**를 사용해 redirection할 수 있다
* 기본적으로 plain text로 console에 출력


<br>

### Usage
* stdout을 file로 redirection. file이 없으면 만들고, 있으면 **overwrite**
```sh
 > file
```

* stdout을 file로 redirection. file이 없으면 만들고, 있으면 **append**
```sh
 >> file
```

* stderr를 stdout으로 redirection. stderr도 stdout로 출력
```sh
 2>&1
```

* file을 stdin으로 지정
```sh
 < file
```

* stderr를 stdout으로 redirection. stdout은 `/dev/null`로 redirection -> **stdout, stderr를 둘다 버린다**
```sh
 > /dev/null 2>&1
```

<br>

> #### /dev/null
> * 특수 파일로 이 파일로 출력된 데이터는 버려진다

<br>

#### 실행된 프로세스의 stream을 console이 아닌 file로 사용하고 싶을 때
* output stream을 file로 사용
```sh
$ ls > ls.txt
```

* input stream을 file로 사용
```sh
$ head < ls.txt
```

* input/output stream을 file로 사용
```sh
$ head < ls.txt > ls2.txt
```

* ls의 error를 `/dev/null`로 redirection
```sh
$ ls -xy 2> /dev/null
```

* stdout과 stderr 분리해서 file로 저장
```
$ ls -alF 1>stdin.log 2>stderr.log
```


<br><br>

> #### Reference
> * [리눅스 리다이렉션 & 파이프(Linux redirection & pipe)](https://jdm.kr/blog/74)
> * [redirection에 대해 이해](https://gracefulprograming.tistory.com/100)
> * [pipe에 대한 이해](https://gracefulprograming.tistory.com/92)


<br>

> #### Further reading
> * [Chapter 20. I/O Redirection - Advanced Bash-Scripting Guide](http://www.tldp.org/LDP/abs/html/io-redirection.html)
