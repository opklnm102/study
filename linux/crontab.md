# [Linux] crontab
> date - 2019.09.12  
> keyworkd - cron, crontab  
> linux에서 주기적인 작업을 실행할 사용하는 crontab에 대해 정리  

<br>

## cron
* **어떤 작업을 특정 시간에 실행**시키기 위한 데몬
* **주기적으로 어떤 작업을 수행**해야할 때 유용
  * e.g. 주기적으로 시스템 백업


<br>

## crontab
* cron의 작업 설정 파일
  * 시간과 수행할 작업 정의
* 사용자별로 존재
* cron은 모든 사용자의 crontab 파일을 찾아서 작업을 수행

<br>

### 작업 리스트 확인
```sh
$ crontab -l
```

<br>

### 작업 생성/수정하기
```sh
$ crontab -e
```
* editor에서 시간과 작업을 정의하고 저장하면 생성된다

<br>

### 작업 삭제하기
```sh
$ crontab -r
```

<br>

### 다른 유저의 작업 확인
* super 권한 필요
```sh
$ crontab -u [user] [command]
```


<br>

## crontab 표현식
```sh
.---------------- minute (0 - 59)
|  .------------- hour (0 - 23)
|  |  .---------- day of month (1 - 31)
|  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
|  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
|  |  |  |  |
*  *  *  *  * user-name command to be executed

## example
* * * * * huekim /etc/test.sh > test.log 2>&1
0 * * * * huekim ls -al > ls.log 2>&1
```
* `@reboot` - run once after reboot
* `@yearly` - 매년(0 0 1 1 *)
* `@annually` - 매년(0 0 1 1 *)
* `@monthly` - 매월(0 0 1 * *)
* `@weekly` - 매주(0 0 * * 0)
* `@daily` - 매일(0 0 * * *)
* `@hourly` - 매시간(0 * * * *)

<br>

### 매분 실행
```sh
* * * * * /etc/test.sh
```
* `*` - 범위 내 모든 값을 의미

<br>

### 매주 일요일 9시 30분에 실행
```sh
30 9 * * 0 /etc/test.sh
```

<br>

### 매시간 0, 20, 40분에 실행
```sh
0,20,40 * * * * /etc/test.sh
```
* `,` - 각 값을 구분시 사용

<br>

### 매일 1시 0 ~ 30분 동안 매분 실행
```sh
0-30 1 * * * /etc/test.sh
```
* `-` - 연결된 범위

<br>

### 매 10분마다 실행
```sh
*/10 * * * * /etc/test.sh
```


<br>

## Logging
* crontab에 대한 로그를 남기고 싶을 때
```sh
* * * * * /etc/test.sh >> /etc/test.log 2>&1
```
> `2>&1` - stderr redirection


<br>

## crontab 설정 파일 직접 수정
* `crontab` 명령어를 이용하는 방법외에도 직접 설정 파일을 수정해도 된다
* `/etc`에 `cron.hourly`, `cron.daily`, `cron.weekly`, `cron.monthly` 디렉토리에 스크립트 파일을 저장해두면 된다
* ubuntu 기준
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
25 6   * * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6   * * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6   1 * * root test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
#
```
* `/etc/crontab`의 설정에 따라 각 디렉토리의 스크립트가 실행된다


<br>

## Conclusion
* linux에서 주기적으로 수행해야하는 작업을 script로 만들어서 crontab을 활용하면 편리하다
* crontab 등록시 나중을 위해 적절한 **주석을 추가**하자


<br><br>

> #### Reference
> * [Crontab - Quick Reference](https://www.adminschoice.com/crontab-quick-reference)
> * [crontab - man](http://man7.org/linux/man-pages/man5/crontab.5.html)
