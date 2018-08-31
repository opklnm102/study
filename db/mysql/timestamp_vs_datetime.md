# [MySQL] timestamp vs datetime
> date - 2018.08.31  
> keyword - mysql, datetime, timestamp  
> mysql에서 timestamp와 datetime 중 어떤것을 사용해야할지 혼란스러워서 알아보고 정리

<br>

## 공통점
* 표현 형식이 `yyyy-MM-dd HH:mm:ss`로 같다
```
2018-08-31 11:35:32
```

<br>

## 차이점

### datetime
* 범위 - 1000-01-01 00:00;00 ~ 9999-12-31 23:59:59
* 크기 - 8 Byte
* 입력되는 날짜와 시간을 `그대로 저장`한다

### timestamp
* 범위 - 1970-01-01 00:00:01 UTC ~ 2038-01-19 03:14:07 UTC
* 크기 - 4 Byte
* time_zone 시스템 변수를 기반으로 입력된 값을 UTC로 변환하여 저장
  * time_zone에 입력된 값을 기반으로 변환하여 출력

<br>

## 자동으로 값들어가게 하기
```sql
ts_col_name TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
dt_col_name DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```
* `CURRENT_TIMESTAMP` - `now()`와 동일한 값이 입력되는 keyword


<br>


## 정리
* timestamp는 2037-12-31 23:59:59까지만 저장가능하므로 datetime을 사용하자


---

<br>

> #### Reference
> * [11.3.1 The DATE, DATETIME, and TIMESTAMP Types - MySQL Reference Manual](https://dev.mysql.com/doc/refman/5.7/en/datetime.html)
