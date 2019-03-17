# [Linux] About trap
> date - 2019.03.17  
> keyword - linux, signal  
> [kube-aws cluster-backup restore.sh](https://github.com/kubernetes-incubator/kube-aws/blob/master/contrib/cluster-backup/restore.sh)에서 사용된 trap에 대해서 정리


<br>

## trap이란?
* shell에서 발생하는 [signal](./signal.md)을 처리하기 위해 사용
  * shell script 수행 중 인터럽트로 인해 비정상적으로 종료할 수 있다
  * 이런 경우 임시로 사용한 파일을 삭제하는 것과 같은 정리 작업을 수행할 수 없게 된다
  * 이런 상황을 방지하기 위해 사용

```sh
$ trap <command> <signal>
```


<br>

## shell에서 처리할 수 있는 signal
| No | Name | Description |
|:--|:--|:--|
| 0 | EXIT | shell의 종료 |
| 1 | HUP | 터미널과 연결 종료 |
| 2 | INT | ctrl + c 입력, 현재 process 중단 |
| 3 | QUIT | ctrl + \ 입력, 현재 process 종료 |
| 9 | KILL | process 강제 종료, 무시, 추적 처리 불가 |
| 11 | SEGV | egmentation fault, 잘못된 메모리 참조(다른 process의 메모리 참조) |
| 15 | TERM | termination signal. KILL과 같지만 무시, 추적 처리 가능 |


<br>

## Usage
* 68072 shell에서 trap을 사용해 SIGINT 수신시 pid를 출력하는 명령어를 등록
```sh
## pid: 68072
trap "echo $$" INT
```

* 다른 shell에서 68072로 SIGINT 전달
```sh
## pid: 68073
$ kill -INT 68072
```

* 68072 shell이 pid를 출력하고 종료된다
```sh
## pid: 68072
...
$ 68072
```

> $$ - pid를 저장하고 있는 특수 변수


<br>

### kube-aws cluster-bachup restore script를 살펴보자
```sh
#!/bin/bash

TEMP_DIR=$(mktemp -d)  # 임시 디렉토리 생성 후 경로 저장
trap "rm -f -r ${TEMP_DIR}" EXIT  # 임시 디렉토리 제거
...
```
* 임시 디렉토리 생성 후 EXIT(shell 종료) signal이 발생하면 임시 디렉토리를 제거


<br>

### 로그인한 사용자의 이력 저장하기
```sh
#!/bin/bash

trap "cp $HISTFILE $HOME/old_hist.bak; exit" ALRM
```


<br><br>

> #### Reference
> * [kube-aws cluster-backup restore.sh](https://github.com/kubernetes-incubator/kube-aws/blob/master/contrib/cluster-backup/restore.sh)
> * [mktemp - Make a Temporary File or Directory](https://www.gnu.org/software/autogen/mktemp.html)
> * [trap를 이용한 signal 처리](https://www.joinc.co.kr/w/Site/Tip/Signal_trap)
