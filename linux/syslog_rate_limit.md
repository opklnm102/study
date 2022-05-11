# [Linux] syslog rate limit
> date - 2022.05.11  
> keyworkd - linux, syslog, journal, rate limit  
> syslog rate limit issue를 정리  

<br>

## Requirement

### Dependency
* [Amazon Linux 2(AL2)](https://aws.amazon.com/ko/amazon-linux-2/)

<br>

## Issue
* traffic이 많은 상황에서 journald의 rate limit 설정에 의해 아래와 같은 log화 함께 syslog 유실 발생
```sh
rsyslogd: imjournal: 10000 messages lost due to rate-limiting
```


<br>

## Resolve
### 1. `/etc/systemd/journald.conf`에서 rate limit 설정 수정
```conf
[journal]
## disable rate limit
RateLimitInterval=0
RateLimitBurst=0

## custom - 600s 동안 30,000 출력
RateLimitInterval=600
RateLimitBurst=30000
```

<br>

### 2. restart journald service
```sh
$ systemctl daemon-reload
$ systemctl restart systemd-journal.service
```

<br>

### 3. `/etc/rsyslog.conf`에서 rate limit 설정 수정
```conf
## disable rate limit
$imjournalRatelimitInterval 0
$imjournalRatelimitBurst 0

## custom - 600s 동안 30,000 출력
$imjournalRatelimitInterval 600
$imjournalRatelimitBurst 30000
```

<br>

### 4. restart rsyslog service
```sh
$ systemctl restart rsyslog
```

<br>

### test
위 설정에서 값을 낮게 설정 후 아래 script 실행
```sh
#!/usr/bin/env bash

for i in $(seq 0 100000); do
  logger "hello ${i}"
done
```

script 실행 중 아래 명령어를 실행하면 rate limit로 인해 log가 생성되지 않는다
```sh
$ logger "world"
$ tail -100f /var/log/messages
...
```
설정을 수정 후 위의 script로 test 진행


<br>

## Conclusion
* rate limit를 disable할 경우 대량의 log 발생시 대량의 I/O로 인해 CPU 사용률이 증가하여 의도하지 않은 장애가 발생할 수 있으니 주의


<br><br>

> #### Reference
> * [RSyslog Docs](https://www.rsyslog.com/doc/v8-stable/configuration/modules/imjournal.html#ratelimit-interval)
