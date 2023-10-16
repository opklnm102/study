# [Linux] About timedatectl
> date - 2023.10.16  
> keyworkd - time, date, timedatectl  
> timedatectl에 대해 정리  

<br>

## timedatectl
* system의 time과 date를 조작하기 위한 명령어
* RHEL/CentOS 7, Fedora 30+ 배포판을 위한 date 명령어의 대체 utility


<br>

## Usage
```sh
$ timedatectl [options] <commnad>
```

<br>

### time, date 정보 확인
```sh
$ timedatectl ## or timedatectl status

$ timedatectl
      Local time: Mon 2023-10-16 07:16:18 UTC
  Universal time: Mon 2023-10-16 07:16:18 UTC
        RTC time: Mon 2023-10-16 07:16:19
       Time zone: n/a (UTC, +0000)
     NTP enabled: yes
NTP synchronized: yes
 RTC in local TZ: no
      DST active: n/a
```
* Local time - 현재 시간
* Universal time - UTC, 국제 표준시
* RTC time - Hardware 시계
* Time zone - time zone
* NTP enabled - NTP 활성화 여부
* NTP synchronized - NTP 동기화 여부
* RTC in local TZ - RTC와 timezone 시간 동기화 여부

<br>

### 시간 설정
* 시간 설정을 위해서는 NTP disable 필요
```sh
$ timedatectl set-time <time>

## example
$ timedatectl set-time "2023-10-30 18:17:16"
```

<br>

### timezone 확인
```sh
$ timedatectl list-timezones 
```

<br>

### timezone 설정
* 위에서 확인한 timezone으로 설정할 수 있다
```sh
$ timedatectl set-timezone <timezone>

## example
$ timedatectl set-timezone UTC  #  Asia/Seoul
```

<br>

### 시간 동기화 설정
* NTP(Network Time Protocol)를 사용해 시간을 동기화할 수 있다
```sh
## yes - NTP enable, no - NTP disable
$ timedatectl set-ntp <yes | no>
```

<br><br>

> #### Reference
> * [timedatectl](https://www.freedesktop.org/software/systemd/man/timedatectl.html)
