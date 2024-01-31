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

## crontab 표현식(Cron expression)
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
* allow list 개념으로 동작
* 각 필드에는 값과 특수문자의 조합 사용 가능

| 필드 | 가능한 값 | 가능한 특수 문자 |
|:--|:--|:--|
| minute(분) | 0 ~ 59 | * , - / |
| hour(시) | 0 ~ 23 | * , - / |
| day of month(일) | 1 ~ 31 | * , - ? L W |
| month(월) | (1 - 12) or jan,feb,mar,apr ... | * , - / |
| day of week(요일) | (0 - 6) (Sunday=0 or 7) or sun,mon,tue,wed,thu,fri,sat | * , - ? L # |
, - / ? L #

<br>

### 특수 문자
| 특수 문자 | 설명 |
|:--|:--|
| * | 범위 내 모든 값 |
| ? | 특정 값이 아닌 모든 값, 특정 일을 선택할 때는 Day-of-month or Day-of-week 중 하나는 `?`를 사용해야한다 |
| - | 범위 |
| , | 여러 값 |
| / | 증분 값(초기값 / 증가치) |
| L | 범위의 마지막 값 |
| W | 가장 가까운 평일 |
| # | N번째 특정 요일, 4#3(3번째 목요일) |

<br>

### 주석
* cron expression spec을 기억하기 쉽지 않으므로 cron expression을 사용할 때는 정확히 무슨 의미인지 주석을 추가하자
  * e.g. `* 23-10 ? * *` - Every minute, between 08:00 ~ 19:59, every day
* [Cron Expression Descriptor](https://bradymholt.github.io/cron-expression-descriptor)를 이용하면 편하다


<br>

## Example
### server time zone = UTC, UTC 기준으로 실행할 경우
| Cron expression | Description |
|:--|:--|
| `@reboot` | run once after reboot |
| `@yearly` | 매년(0 0 1 1 *) |
| `@annually` | 매년(0 0 1 1 *) |
| `@monthly` | 매월(0 0 1 * *) |
| `@weekly` | 매주(0 0 * * 0) |
| `@daily` | 매일(0 0 * * *) |
| `@hourly` | 매시간(0 * * * *) |
| `* * * * *`, `*/1 * * * ?` | 매분 실행 |
| `30 9 * * 0` | 매주 일요일 9시 30분에 실행 |
| `0,20,40 * * * *` | 매시간 0, 20, 40분에 실행 |
| `0-30 1 * * *` | 매일 1시 0 ~ 30분 동안 매분 실행 |
| `*/10 * * * * `| 매 10분마다 실행 |
| `31 */1 * * ?` | 매시간 31분마다 실행 |
| `30 2 * * MON` | 월요일, 02:30 마다 실행 |

<br>

### server timezone = UTC, KST(UTC+09:00) 기준으로 실행할 경우
| Cron expression | Description |
|:--|:--|
| `0/5 0-11 ? * MON-FRI` |	월~금, 09:00 ~ 20:59 동안 5분 마다 실행 |
| `* 23-10 ? * *` | 매일 08:00 ~ 19:59 동안 1분 마다 실행 |
| `* 23-10 ? * *` 와 `0-30 11 ? * * *` 함께 사용  | 매일 08:00 ~ 20:30 동안 1분 마다 실행 |
| `0 17 1-30 1,3,5,7,8,10,12 *` 와 `0 17 1-29 4,6,9,11 *`, `0 17 1-27 2 *` 함께 사용 | 매달 1일을 제외하고 02:00 마다 실행 |

* 계산하기 어려우므로 아래의 python script를 사용하여 계산
```python
from datetime import datetime, timezone, timedelta

from croniter import croniter_range
from dateutil.relativedelta import relativedelta

KST = timezone(timedelta(hours=9))

# KST로 넘어온 시간을 UTC로 변환한다음 cron 식을 돌리고, 다시 KST로 변환하여 보여준다
def show_cron_date(cron_expression, start_at=datetime.now(), relative_delta_month=1):
  start_at_utc = start_at.astimezone(timezone.utc)
  end_date_utc = start_at_utc + relativedelta(months=relative_delta_month)

  for date in croniter_range(start_at_utc, end_date_utc, cron_expression):
    date_kst = date.astimezone(KST)
    print(f"{date_kst.strftime('%a, %b %d, %Y, %I:%M %p %Z')}")


if __name__ == '__main__':
    show_cron_date("0 12 * * *")
    show_cron_date(cron_expression="0 23,0-12 * * SUN-FRI", start_at=datetime.strptime("2024-01-26 14:00:00", "%Y-%m-%d %H:%M:%S"))
    show_cron_date(cron_expression="0 23,0-12 * * SUN-FRI")
    show_cron_date(cron_expression="0 23,0-10 * * MON-FRI")
    show_cron_date(cron_expression="0-30 11 * * *")
    show_cron_date(cron_expression="0 17 L * *", relative_delta_month=5)
```
* [CronTool - Cron expression editor & debugger](https://tool.crontap.com/cronjob-debugger)를 사용하면 달력표시로 확인할 수 있고, cron에 대한 test, 원하는 시간대에 대한 cron expression을 생성할 수 있어서 편하다


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
