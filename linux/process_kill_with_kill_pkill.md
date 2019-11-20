# [Linux] Process kill with kill, pkill
> date - 2019.11.20  
> keyworkd - kill, pkill, pgrep  
> linux에서 process kill하는 방법을 정리  

<br>

## Process를 kill하는 방법
* `kill`, `ps`, `grep`, `awk`
```sh
$ kill -9 $(ps -ef | grep 'java' | awk '{print $2}')
```

* `kill`, `pgrep`
```sh
$ kill -9 $(pgrep 'java')
```

* `pkill`
```sh
$ pkill -9 -f 'java'
```


<br>

## kill
* 지정된 명령이 실행 중인 특정 process에 signal(default. 15(정상 종료)) 전송
* `PID` 사용
  * `ps`로 `PID`를 찾아야 하는 불편함이 있다

```sh
$ kill [-signal] [PID1] [PID2] ...

## i.e.
$ kill -9 33452
```


<br>

## pgrep
* `ps` + `grep`
```sh
$ pgrep [option] [pattern]

## i.e.
$ pgrep 'java'
63644
```

<br>

### options
* `-l` - PID와 일치하는 프로세스의 이름을 출력
```sh
$ pgrep -l 'java'
63644 java
```

* `-f` - `-l`과 함께 사용하면 명령어의 경로도 출력
```sh
$ pgrep -lf 'java'

63639 /bin/java -jar xxx.jar
```
* `-n` - 패턴과 일치하는 프로세스의 가장 최근 PID 출력
* `-x` - 패턴과 정확하게 일치하는 프로세스만 출력


<br>

## pkill
* 지정된 명령이 실행 중인 특정 process에 signal(default. 15(정상 종료)) 전송
* **process name** 사용
  * `kill`에서 **PID를 찾는 불편함 개선**

```sh
$ pkill [-signal] [process name1] [process name2] ...

## i.e.
## before
$ ps
  PID TTY           TIME CMD
58879 ttys002    0:00.62 -zsh
59845 ttys002    0:00.01 /bin/java -jar xxx.jar

$ pkill 'java'

## after
$ ps
  PID TTY           TIME CMD
58879 ttys002    0:00.65 -zsh
```

<br>

### options
* `-P [ppid]` - parent process ID가 있는 process만 종료
* `-f` - match full argument lists(default. match process name)
* `-n` - 패턴과 일치하는 프로세스 중 가장 최근에 실행된 프로세스 1개만 종료
* `-x` - 패턴과 정확하게 일치하는 프로세스만 종료


<br>

## Conclusion
* process kill시에 `kill`보다는 `pkill`을 사용하면 **PID를 찾는 수고가 없으므로** 알아두자!


<br><br>

> #### Reference
> * [kill(1) - Linux man page](https://linux.die.net/man/1/kill)
> * [pgrep(1) - Linux man page](https://linux.die.net/man/1/pgrep)
> * [pkill(1) - Linux man page](https://linux.die.net/man/1/pkill)
