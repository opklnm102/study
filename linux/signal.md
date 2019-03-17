# [Linux] About Signal
> date - 2019.03.17  
> keyword - linux, signal  
> signal에 대해 정리

<br>

카페에서 시간을 보낸다고 하자, 목이 마르니 음료를 마시고, 배가 고프니 디저트르 먹고, 자리가 부족해 옮겨야 하고... 각종 사건에 대해 반응을 해야한다. 프로세스도 만찬가지로 각종 **예외 상황에 대해 적절한 처리**가 필요하다


<br>

## signal이란?
* Unix OS의 SW interrupt로 process간의 비동기적인 Event
  * 비동기적인 Event - 터미널 종료, 알람, 입력장치를 통한 입력 등
* process에 종속적으로 **process별로 처리할 수 있는 signal이 정의**된다
* **SIGxxx** 형식
  * SIGINT
  * SIGTERM
  * SIGKILL


<br>

## signal의 종류
* 간단하게 `kill`로 사용할 수 있는 signal을 확인할 수 있다
```sh
$ kill -l
HUP INT QUIT ILL TRAP ABRT EMT FPE KILL BUS SEGV SYS PIPE ALRM TERM URG STOP TSTP CONT CHLD TTIN TTOU IO XCPU XFSZ VTALRM PROF WINCH INFO USR1 USR2
```

| No | 이름 | 기본 처리 | 설명 |
|:--|:--|:--|:--|
| 1 | HUB | terminate | 터미널과 연결이 종료 | 
| 2 | INT | terminate | ctrl + c 입력 |
| 3 | QUIT | terminate & core dump | ctrl + \ 입력 |
| 4 | ILL | terminate & core dump | 잘못된 명령 사용 |
| 5 | TRAP | terminate & core dump | trace, breakpoint에서 TRAP 발생 |
| 6 | ABRT | terminate & core dump | abort()에 의해 발생, 비정상 종료 |
| 9 | KILL | terminate | process 강제 종료. 무시, 추적 처리 불가 |
| 10 | BUS | terminate & core dump | bus 오류 |
| 11 | SEGV | terminate & core dump | segmentation fault(잘못된 메모리 참조) |
| 12 | SYS | terminate & core dump | system call 오류 |
| 13 | PIPE | terminate & core dump | pipe 오류(단절된 pipe에 write...) |
| 14 | ALRM | terminate & core dump | 알람에 의해 발생 |
| 15 | TERM | terminate | termination signal. KILL과 같지만 무시, 추적 처리 가능 |
| 16 | USR1 | terminate | 사용자 정의 signal 1 |
| 17 | USR2 | terminate | 사용자 정의 signal 2 |
| 18 | CHLD | ignore | child process 상태 변화 |
| 23 | STOP | stop | SIGCONT 발생시까지 process 중지 |
| 24 | TSTP | stop | ctrl + z 입력 |
| 25 | CONT | ignore | 중지된 process 실행 |
| 28 | VRALRM | terminate | 가상 타이머 종료 |
| 29 | IO | terminate | 입출력 발생 |


<br>

## 간단하게 signal 발생시키기
* `kill` 사용
```sh
$ kill -<signal name or number> <pid>

## example
$ kill -9 13532

$ kill -KILL 13532
```


<br><br>

> #### Reference
> * [Signal - Wikipedia](https://en.wikipedia.org/wiki/Signal_(IPC))
