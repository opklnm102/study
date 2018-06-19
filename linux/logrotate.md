# [Linux] logrotate
> date - 2018.06.20  
> keyword - linux, logrotate  
> linux에서 Log Rotation을 위해 사용하는 logrotate에 대해 정리

<br>

## Log Rotation
* 일정시간을 주기로 로그 파일을 switching하고, 보관 기간이 지난 오래된 로그 파일은 제거하는 프로세스
* 로그 파일의 용량이 커지면 disk 공간을 차지하기 때문에 주기적인 관리 필요
   * 로그 파일을 일, 시간 단위로 분리하여 압축하여 용량 감소
   * 오래된 로그 파일 삭제
   * 오래된 로그 파일 backup
   * ...

---

<br>

## logrotate
* log를 rotate 시키는 간단한 프로그램
   * 여러 개의 로그 파일 관리
   * rotate 갯수 설정
   * 로그 파일 압축
   * rotate 전/후에 스크립트 실행
* Nginx 등의 Application은 로그를 남길 때 logrotate를 사용
   * package manager로 설치하면 자동으로 `/etc/logrotate.d`에 script가 생성된다
      * ex. Nginx 설치시 `/etc/logrotate.d/nginx` 생성
   * 컴파일로 설치해 logrotate에 등록되지 않았다면 직접 등록하면 된다

> #### logrotate는 기본적으로 ubuntu 등에 설치되어 있지만 만약 없다면..?
> * 설치하면 된다
> ```sh
> # ubuntu
> $ apt-get install logrotate
> ```

---

<br>

## logrotate 스크립트 살펴보기
* /etc/logrotate.d/nginx
```sh
# Ubuntu - nginx/1.10.3(Ubuntu)
/var/log/nginx/*.log {   # logrotate가 적용될 로그 파일 경로
    daily  # rotate 주기. daily, weekly, monthly, yearly
    missingok
    rotate 14  # 14개의 파일 유지, 오래된 것 부터 삭제
    compress  # gzip으로 압축
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}

# Amazon AMI - nginx/1.12.1
/var/log/nginx/*log {
    create 0644 nginx nginx
    daily
    rotate 10
    missingok
    notifempty
    compress
    sharedscripts
    postrotate
        /etc/init.d/nginx reopen_logs
    endscript
}
```
* logrotate의 1번째 행은 logrotate 설정이 적용될 위치를 지정
   * 로그 파일의 위치를 바꾼다면 수정 필요
   * virtutal host별 로그 파일 생성시

---

<br>

## logrotate 옵션

| 이름 | 설명 |
|:--|:--|
| rotate <N> | 몇개의 파일을 유지할지 설정 <br> ex) rotate 10 | 
| daily | 일 단위로 rotate |
| weekly | 주 단위로 rotate |
| monthly | 월 단위로 rotate |
| yearly | 년 단위로 rotate |
| missingok | 로그 파일이 없더라도 오류를 발생시키지 않는다 |
| notifempty | 로그 파일의 내용이 없을 경우 rotate하지 않는다 |
| ifempty | 로그 파일의 내용이 없더라도 rotate한다 |
| dateext | rotate 완료 파일에 1, 2, 3..이 아닌 날짜를 붙인다 |
| dateformat | dateext에 사용될 날짜 형식 지정 <br> %Y(년), %m(월), %d(일), %s(timestamp)로 지정 <br> ex) %Y-%m-%d-%s |
| prerotate | rotate 전 실행할 스크립트 설정 |
| postrotate | rotate 후 실행할 스크립트 설정 |
| sharedscripts | 각각의 로그 파일마다 prerotate, postrotate에 설정된 스크립트가 동작하지 않고 rotate할 때 1번만 실행하도록 한다 |
| compress | 파일을 gzip으로 압축 |
| nocompress | 파일을 압축하지 않는다 |
| copytruncate | 원본 파일을 지우지 않고 truncate(파일 크기를 0으로 만든다) <br> 로그 파일을 새로 만들기 위한 signal을 가지고 있지 않은 경우 사용하면 좋다 |
| size | 지정된 용량이 되면 rotate <br> M(MB), K(KB) 단위로 설정 |
| maxage <N> | N일 이상된 로그 파일 삭제 <br> ex) maxage 30 |
| mail <mail address> | 설정에 의해 보관 기간이 끝난 파일을 메일로 발송 |
| errors <mail address> | rotate중 오류 발생시 메일 발송 |
| nomail | 메일을 발송하지 않는다 |
| mailfirst <mail address> | 원본 파일을 메일로 발송 |

* 나머지 옵션들을 [여기서 확인](https://linux.die.net/man/8/logrotate)

> #### dateformat 사용시 주의할 점
> * %d-%m-%Y처럼 순서를 바꿔서 사용하지 않는다 
> * rotate 옵션에서 오래된 파일 제거시 파일 이름으로 정렬하기 때문

---

<br>

## logrotate와 crontab
* logrotate는 cron을 이용해서 실행 주기를 관리
   * 지정한 logrotate를 실행시켜주는 스케쥴러 역할
* logrotate 설치시 `/etc/cron.daily`에 등록된 crontab에 의해 동작
```sh
# /etc/cron.daily/logrotate

#!/bin/sh - Amazon AMI
/usr/sbin/logrotate /etc/logrotate.conf
EXITVALUE=$?
if [ $EXITVALUE != 0 ]; then
    /usr/bin/logger -t logrotate "ALERT exited abnormally with [$EXITVALUE]"
fi
exit 0
```

* logrotate 실행 완료시 `/var/lib/logrotate.status`에 결과가 작성된다
   * 언제 어떤 로그를 로테이션 했는지 확인할 수 있다
   * logrotate는 실행될 때 결과를 읽어 로그파일이 정해진 기간이 지났는지 확인

```sh
# /var/lib/logrotate.status - Amazon AMI

logrotate state -- version 2
"/var/log/nginx/error.log" 2018-6-19
"/var/log/yum.log" 2018-1-1
"/var/log/maillog" 2018-6-17
"/var/log/nginx/access.log" 2018-6-4
"/var/log/cron" 2018-6-17

# /var/lib/logrotate/status - ubuntu
"/var/log/nginx/access.log" 2018-6-4-6:0:0
"/var/log/cron" 2018-6-17-6:0:0
```

* log rotation을 위해선 logrotate script를 `/etc/logrotate.d`에 생성하기만 하면 끝..!
   * crontab이 읽는 `/etc/logrotate.conf`에 설정되어 있기 때문

```sh
# /etc/logrotate.conf

# see "man logrotate" for details
# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
dateext

# uncomment this if you want your log files compressed
#compress

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d

# no packages own wtmp and btmp -- we'll rotate them here
/var/log/wtmp {
    monthly
    create 0664 root utmp
        minsize 1M
    rotate 1
}

/var/log/btmp {
    missingok
    monthly
    create 0600 root utmp
    rotate 1
}

# system-specific logs may be also be configured here.
```

* 정각에 rotate되게 할려면 `/etc/cron.daily`에 등록된 crontab을 정시에 동작하도록 수정
```sh
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the 'crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user command
17 *   * * * root cd / && run-parts --report /etc/cron.hourly
25 6   * * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )  # 25 6 * * *(before) -> 0 0 * * *(after)
47 6   * * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6   1 * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
```

---

<br>

## Usage
* `-f` - 강제로 실행 
```sh
$ logrotate -f /etc/logrotate.d/nginx

error.log.1.gz
```

* dateext 추가 - 확장자에 날짜 추가
```sh
$ logrotate -f /etc/logrotate.d/nginx

error.log-20180617.gz
```

* dateformat로 dateext의 날짜 형식 설정
   * dateformat .%Y-%m-%d-%s 추가

```sh
$ logrotate -f /etc/logrotate.d/nginx

error.log-2018-06-17-1529250021.gz
```

* -d - test를 위한 옵션, 실제로는 rotation되지 않는다
```sh
$ logrotate -d /etc/logrotate.d/nginx
```

* /etc/logrotate.d의 모든 script 실행
```sh
$ logrotate -f /etc/logrotate.conf
```

---

<br>

> #### 참고
> * [NGINX 로그 기본 설정 및 logrotate 설정 방법](https://extrememanual.net/10139)
> * [logrotate(8) - Linux man page](https://linux.die.net/man/8/logrotate)
> * [nginx: 로그 로테이트 적용하기 + 상세 설정](http://ohgyun.com/754)
> * [logrotate 사용법](http://culturescrap.tistory.com/entry/logrotate-%EC%82%AC%EC%9A%A9%EB%B2%95%EB%A1%9C%EA%B7%B8-%EC%84%B8%EB%8C%80%EA%B4%80%EB%A6%AC)
