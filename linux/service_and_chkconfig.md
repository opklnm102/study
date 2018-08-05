# [Linux] service와 chkconfig 
> date - 2018.08.04    
> keyword - amazon linux ami, chkconfig
> Amazon Linux AMI에서 instance reboot시 nginx 자동 시작하는 방법을 찾다 알개된 chkconfig에 대해서 정리

<br>

* Linux는 서버로 많이 사용되므로 부팅시 서비스용 데몬들은 자동으로 구동되어야 `관리가 편하며` 미구동으로 인한 `서비스 장애`를 방지할 수 있다
* 서비스를 자동으로 구동하기 위해 먼저 Linux의 부팅 과정에 대해 간략하게 살펴보자

<br>

## CentOS의 부팅 절차
```
BIOS/EFI -> GRUB 부트로더 -> 리눅스 커널 -> /sbin/init -> Runlevel 실행
```
* `/sbin/init`부터 사용자 입장에서 중요
* init은 부팅시 `linux kernel이 처음 실행하는 프로세스`로 이후의 모든 프로세스는 init이 생성한다
  * init을 모든 프로세스의 아버지라고도 한다
* init 프로세스의 수행 동작은 크게 BSD 계열과 SysV 계열로 나눠져 있고 동작 방식이 약간 다르다
* CentOS의 init은 SysV 계열의 init이므로 `/etc/inittab` 파일을 참고하여 부팅시 실행할 run level을 결정한다

| run level | 설명 |
|:--|:--|
| 0 | 시스템 중단(Halt) |
| 1 | 텍스트 기반의 단일 사용자 모드(single user mode) |
| 2 | 사용되지 않음(사용자가 지정 가능) |
| 3 | 텍스트 기반의 다중 사용자 모드 |
| 4 | 사용되지 않음(사용자가 지정 가능) |
| 5 | X 윈도 기반의 다중 사용자 모드(로그인도 X 윈도에서 이뤄짐) |
| 6 | 시스템 리부팅 |

```sh
# /etc/inittab

# inittab is only used by upstart for the default runlevel.
#
# ADDING OTHER CONFIGURATION HERE WILL HAVE NO EFFECT ON YOUR SYSTEM.
#
# System initialization is started by /etc/init/rcS.conf
#
# Individual runlevels are started by /etc/init/rc.conf
#
# Ctrl-Alt-Delete is handled by /etc/init/control-alt-delete.conf
#
# Terminal gettys are handled by /etc/init/tty.conf and /etc/init/serial.conf,
# with configuration in /etc/sysconfig/init.
#
# For information on how to write upstart event handlers, or how
# upstart works, see init(5), init(8), and initctl(8).
#
# Default runlevel. The runlevels used are:
#   0 - halt (Do NOT set initdefault to this)
#   1 - Single user mode
#   2 - Multiuser, without NFS (The same as 3, if you do not have networking)
#   3 - Full multiuser mode
#   4 - unused
#   5 - X11
#   6 - reboot (Do NOT set initdefault to this)
#
id:3:initdefault:  # 여기 집중..!
```
* init 프로세스 구동시 기본 run level을 3으로 실행
* run level에 맞게 실행되는 프로세스는 `/etc/rc.d/rcX.d`에 위치
  * X = 0 ~ 6

```sh
$ ls /etc/rc.d/
init.d/     rc          rc.local    rc.sysinit  rc0.d/      rc1.d/      rc2.d/      rc3.d/      rc4.d/      rc5.d/      rc6.d/

$ ls -al /etc/rc.d/rc3.d
lrwxrwxrwx  1 root root   13  6월 22 21:44 K60nfs -> ../init.d/nfs
lrwxrwxrwx  1 root root   20  6월 22 21:44 K69rpcsvcgssd -> ../init.d/rpcsvcgssd
...
lrwxrwxrwx  1 root root   14  6월 22 21:45 S58ntpd -> ../init.d/ntpd
lrwxrwxrwx  1 root root   15  8월  4 02:33 S85nginx -> ../init.d/nginx
lrwxrwxrwx  1 root root   15  6월 22 21:44 S90crond -> ../init.d/crond
```

* 웹서버, DBMS 서버 등의 프로그램은 `시스템 부팅시 자동으로 같이 구동`되어야 할 필요가 있다
  * background에서 돌기 때문에 인지하기 어렵기도 하고, 자동으로 구동되야 관리하기 편하다
* run level 3과 5(다중 사용자 모드)로 부팅되어야할 경우 모두 실행해야하므로 `/etc/rc.d/rc3.d`, `/etc/rc.d/rc5.d`에 등록되어 있어야 한다
* 실제로는 init.d에 스크립트 파일이 위치하여 `rcX.d`에는 심볼릭 링크로 처리되어 있다
> /etc/inittab을 잘못 편집하면 부팅이 안되거나 단일 사용자 모드로 부팅될 수 있으므로 주의

---

<br>

## chkconfig
* 부팅시 run level에 따라 서비스를 시작 여부를 간편하게 제어할 수 있는 명령어
* 특정 run level에서 실행할 프로그램을 `등록/설정/변경/조회` 가능
* 직접 편집해서 설정하는 귀찮고, 실수할 여지가 많은 일을 도와준다

```sh
$ chkconfig --help
chkconfig 버전 1.3.49.3 - Copyright (C) 1997-2000 Red Hat, Inc.
이 프로그램은 GNU Public License(GPL)하에 자유롭게 재배포될 수 있습니다.

사용법:   chkconfig [--list] [--type <종류>] [이름]
          chkconfig --add <이름>
          chkconfig --del <이름>
          chkconfig --override <이름>
         chkconfig [--level <레벨>] [--type <종류>] <이름> <on|off|reset|resetpriorities>
```

<br>

### 등록된 서비스 조회
* 현재 등록된 모든 서비스에 대해 시스템 run level별로 on/off 정보를 표시
```sh
$ chkconfig --list  # or chkconfig

nfslock        	0:해제	1:해제	2:해제	3:활성	4:활성	5:활성	6:해제
nginx          	0:해제	1:해제	2:활성	3:활성	4:활성	5:활성	6:해제
...
```

### 특정 서비스만 조회
```
$ chkconfig --list <service name>

# example
$ chkconfig --list nginx
nginx          	0:해제	1:해제	2:활성	3:활성	4:활성	5:활성	6:해제
```

### 서비스 신규 등록
* `/etc/init.d`의 서비스 실행 파일을 등록
```sh
# 서비스 목록에 추가
$ chkconfig --add <실행/스크립트 파일명>

# example
$ chkconfig --add nginx
```

### 서비스 on/off
* 해당 서비스를 부팅시 구동하려면 `on`, 하지 않으려면 `off`
```sh
$ chkconfig <실행/스크립트 파일명> on/off

# example - off => on 해보기
$ chkconfig nginx off

$ chkconfig --list nginx
nginx          	0:해제	1:해제	2:해제	3:해제	4:해제	5:해제	6:해제

$ chkconfig nginx on

$ chkconfig --list nginx
nginx          	0:해제	1:해제	2:활성	3:활성	4:활성	5:활성	6:해제
```

### 특정 run level에서 서비스를 시작 또는 정지하도록 설정
```sh
$ chkconfig --level <run level> <실행/스크립트 파일명> on/off

# example - nginx service를 run level을 15로 부팅시에 시작해라
$ chkconfig --level 15 nginx on

# 정지
$ chkconfig --level 345 nginx off
```

### 서비스 제거
```sh
$ chkconfig --del <실행/스크립트 파일명>

# example
$ sudo chkconfig --del /etc/init.d/nginx

# 제거 확인
$ sudo chkconfig --list nginx
nginx 서비스는 chkconfig를 지원하지만 어떠한 런레벨에도 등록되지 않았습니다 ( 'chkconfig --add nginx'를 실행하십시오)
```

<br>

### S는 활성화 되어 있다는 의미, K는 비활성화
```sh
$ sudo chkconfig nginx off
$ ls -al /etc/rc.d/rc3.d

# off하면 K
lrwxrwxrwx  1 root root   15  8월  4 17:30 K15nginx -> ../init.d/nginx
...

$ sudo chkconfig nginx on
$ ls -al /etc/rc.d/rc3.d

# on하면 S
lrwxrwxrwx  1 root root   15  8월  4 17:30 S85nginx -> ../init.d/nginx
...
```
* on/off시 접두어가 변경된다
* 알파벳 사이의 숫자는 `수행 순서`

<br>

### example. nginx를 소스로 설치했을 경우
* 소스로 설치했을 때 chkconfig를 이용해 등록해야 부팅시 자동으로 실행된다

#### 1. /etc/init.d/에 스크립트 생성
* [Red Hat NGINX Init Script](https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/)의 내용을 /etc/init.d/nginx로 생성

* /etc/init.d/nginx
```sh
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15  # 여기 집중..!
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /etc/nginx/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid

# Source function library.
. /etc/rc.d/init.d/functions
...
```
> `chkconfig:   - 85 15`가 있어야 chkconfig 사용시 경고가 안나온다

#### 2. chkconfig에 등록
```sh
$ chkconfig --add /etc/init.d/nginx

# 등록 확인
$ chkconfig --list nginx
nginx 0: 해제 1: 해제 2: 해제 3: 해제 4: 해제 5: 해제 6: 해제
```

#### 3. --level 옵션을 이용해 활성화
```sh
$ chkconfig --level 35 nginx on

# 활성화 확인
$ chkconfig --list nginx
nginx 0: 해제 1: 해제 2: 해제 3: 활성 4: 해제 5: 활성 6: 해제
```

> CentOS 7, RHEL 7 등에서 기존 init 데몬 대신에 systemd라는 데몬을 통해 부팅시 프로세스를 관리하는데 이에 따라 chkconfig, service 명령어는 `systemctl` 명령어로 대체되고 있다

#### Amazon Linix 2 AMI
* chkconfig를 사용하지 않고, systemctl을 사용함을 볼 수 있다
```sh
$ chkconfig --list nginx

알림: 이 출력 결과에서는 SysV 서비스만을 보여주며 기존의 systemd 서비스는
포함되어 있지 않습니다. SysV 설정 데이터는 기존의 systemd  설정에 의해
덮어쓰여질 수 있습니다.

      'systemctl list-unit-files'를 사용하여 systemd 서비스를 나열하실 수 있습니다.
       특정 대상에 활성화된 서비스를 확인하려면
       'systemctl list-dependencies [target]'을 사용하십시오.

nginx 서비스의 정보를 읽는 도중 오류가 발생했습니다: No such file or directory

$ chkconfig nginx on
알림: 'systemctl enable nginx.service'에 요청을 전송하고 있습니다.
Failed to execute operation: The name org.freedesktop.PolicyKit1 was not provided by any .service files  # 이 메시지는...?

# 권한 문제 였다는...
$ sudo chkconfig nginx on
알림: 'systemctl enable nginx.service'에 요청을 전송하고 있습니다.
```

---

<br>

## service
* `/etc/init.d`에 있는 SysV init script를 `실행/중지/재실행`하는 유틸리티
* 부팅시 네트워크 설정이나 iptables 방화벽 설정, sshd, httpd 등의 서비스를 시작 할 수 있다

```sh
$ service <service name> <option>

# example
$ service nginx start
```

<br>

### option
* `--status-all`
  * 모든 서비스의 상태 출력
  * argument에 service name 불필요
* `start`
  * 지정된 서비스를 시작
  * 에러 발생시 메시지 출력
    * 로그 파일등을 확인해서 조치
* `stop`
  * 지정된 서비스를 종료
* `restart`
  * 지정된 서비스를 재시작
  * 서비스 설정 파일 변경 후 반영시 유용

---

<br>

## 정리
* service와 chkconfig는 linux에서 구동되는 서비스를 `등록/삭제/실행/종료/상태 확인`을 위해 꼭 알아야하는 프로그램
* MySQL DBMS, postfix 이메일 서버, nginx 웹서버 등은 모두 service 명령어를 통해 관리
  * 서비스는 동일한 인터페이스를 제공하므로 새로운 서비스도 쉽게 관리할 수 있다
* 실수로 `chkconfig on`을 실행하지 않은 경우 부팅시 서비스가 자동으로 시작되지 않으므로 주의

---

<br>

> #### 참고
> * [chkconfig(8) - Linux man page](https://linux.die.net/man/8/chkconfig)
> * [service와 chkconfig](https://www.lesstif.com/pages/viewpage.action?pageId=27984899)
