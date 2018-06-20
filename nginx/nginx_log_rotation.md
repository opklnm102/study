# [Nginx] Log Rotation
> date - 2018.06.20  
> keyword - nginx, log rotation, logrotate  
> 적절한 로그 구성 및 관리를 통해 서버에 문제가 발생했을 때 문제를 진단하는데 도움이 되는 정보에 쉽게 엑세스 할 수 있으면 시간과  
> 에너지를 절약할 수 있기 때문에 Nginx의 log를 관리하는 법을 정리

<br>

## Log Rotation
* 일정시간을 주기로 로그 파일을 switching하고, 보관 기간이 지난 오래된 로그 파일은 제거하는 프로세스
* Nginx는 로그 파일을 관리하는 tool을 제공하진 않지만, 간단하게 관리할 수 있는 메커니즘을 가지고 있다
   * USR1 signal을 받으면 로그 파일을 다시 여는 등

---

<br>

## Manual Log Rotation
1. log file 이름 변경
   * 원하는 형식으로 변경하면 된다
2. Nginx가 log file을 다시 열도록 `USR1 signal`을 보낸다
   * log를 rotate시키는 역할
   * Nginx는 USR1 signal에 대응하여 log file을 다시 연다
   * `/var/run/nginx.pid` - Nginx master process의 pid를 저장하는 곳
3. rotate 후 process가 log를 쓸 수 있도록 `sleep 1` 실행
4. 이전 파일을 압축하는 등 원하는 작업 수행

```sh
# 다음 스크립트를 실행
# nginx_log_rotate.sh
mv /var/log/nginx/access.log /var/log/nginx/access.log.1
kill -USR1 `cat /var/run/nginx.pid`  # master.nginx.pid
sleep 1

# post-rotation processing of old log file
gzip /var/log/nginx/access.log.1  # old log file compression
```

---

<br>

## Log Rotation with logrotate
* [logrotate](https://github.com/opklnm102/study/blob/master/linux/logrotate.md)를 사용해 Nginx의 log를 rotate를 해보자

### 1. logrotate script 만들기
* `/etc/logrotate.d`에 생성
```sh
/var/log/nginx/*.log {   # logrotate가 적용될 로그 파일 경로
    daily  # rotate 주기. daily, weekly, monthly, yearly
    missingok
    rotate 14  # 14개의 파일 유지, 오래된 것 부터 삭제
    compress  # gzip으로 압축
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```
* `postrotate`에 [Manual Log Rotation](#manual-log-rotation)과 유사한 명령이 포함되어 있다
   * rotate 완료 후 로그 파일을 다시 로드하도록 Nginx에 지시한다

<br>

### 2. crontab에 등록하기
* crontab은 logrotate를 실행시켜주는 스케쥴러 역할
* logrotate를 설치하면 자동으로 `/etc/cron.daily/logrotate`에 등록된다

> * Nginx를 package manager로 설치하면 default logrotate script가 생성되기 때문에 건드리지 않아도 된다
> * virtual host의 log를 다른 위치에 쌓을 경우 script를 수정하던가 생성할 필요가 있다

---

<br>

> #### 참고
> * [NGINX 로그 기본 설정 및 logrotate 설정 방법](https://extrememanual.net/10139)
> * [How To Configure Logging and Log Rotation in Nginx on an Ubuntu VPS](https://www.digitalocean.com/community/tutorials/how-to-configure-logging-and-log-rotation-in-nginx-on-an-ubuntu-vps)
> * [Log Rotation](https://www.nginx.com/resources/wiki/start/topics/examples/logrotation/)
> * [logrotate(8) - Linux man page](https://linux.die.net/man/8/logrotate)
> * [nginx: 로그 로테이트 적용하기 + 상세 설정](http://ohgyun.com/754)
