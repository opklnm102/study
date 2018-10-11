# [MySQL] SQL Loging
> date - 2018.10.11  
> keyword - mysql, log  
> MySQL에서 query loging하는 법에 대해 정리

<br>

## general log 활성화
* MySQL에서 실행되는 전체 쿼리에 대한 로그
  * MySQL이 쿼리 요청을 받을 때 즉시 기록
* 사용량이 많은 서버에서 로그의 용량이 많아질 수 있으므로 주의
  * disk full 위험

### 1. general_log(query log) 상태를 확인
```sql
show variables like 'general%';
```

| Variable_name | Value |
|:--|:--|
| general_log | OFF |
| general_log_file | /var/lib/mysql/5cc4f604b52c.log |

### 2. general log 활성화
```sql
SET global general_log = on;
```
* MySQL 재시작 필요 X

| Variable_name | Value |
|:--|:--|
| general_log | ON |
| general_log_file | /var/lib/mysql/5cc4f604b52c.log |

### 3. general log 파일 확인
```sh
# mysql container 접속(docker 사용 중)
$ docker exec -it dev_mysql_1 su - root

$ tail -500f /var/lib/mysql/5cc4f604b52c.log

2018-10-11T09:40:53.578240Z  566 Query	SET NAMES utf8mb4
2018-10-11T09:40:53.578884Z  566 Query	SET character_set_results = NULL
2018-10-11T09:40:53.579390Z  566 Query	SET autocommit=1
2018-10-11T09:40:53.579946Z  566 Query	set session transaction read write
2018-10-11T09:40:53.580418Z  566 Query	SET autocommit=1
2018-10-11T09:40:54.606115Z  557 Query	SET autocommit=0
2018-10-11T09:40:54.633318Z  557 Query	insert into model (number) values (0)
2018-10-11T09:40:54.644698Z  557 Query	insert into model (number) values (1)
2018-10-11T09:40:54.657398Z  557 Query	commit
2018-10-11T09:40:54.659748Z  557 Query	SET autocommit=1
```


<br>

## general_log_file의 경로 변경하기

### mysqld conf 변경
* MySQL 재시작 필요

```sh
$ vi /etc/my.cnf

# 아래 내용 추가
[mysqld]
general_log_file = /var/log/my_general.log
general_log = 1  # enable

$ touch /var/log/my_general.log

$ chown mysql.mysql /var/log/my_general.log

$ /etc/init.d/mysqld restart
```

### global variable인 general_log_file 변경
* MySQL 재시작 필요 X
```sql
SET global general_log_file='/var/lib/mysql/my_tmp.log';
```


<br>

## 테이블에 로깅하기

### 1. 현재 output type 확인
```sql
show variables like 'log_out%';
```

| Variable_name | Value |
|:--|:--|
| log_output | FILE |

### 2. output type을 table로 변경
```sql
SET global log_output = 'table';
```

| Variable_name | Value |
|:--|:--|
| log_output | TABLE |

### 3. 확인
```sql
SELECT * FROM mysql.general_log;
```

| event_time | user_host | thread_id | server_id | command_type | argument |
|:--|:--|:--|:--|:--|:--|
| 2018-10-11 12:42:14.327821 | ethan[ethan] @  [172.18.0.1] | 481 | 0 | Query | BLOB |
| 2018-10-11 12:42:14.336921 | ethan[ethan] @  [172.18.0.1] | 480 | 0 | Query | BLOB |
| 2018-10-11 12:42:37.735060 | ethan[ethan] @  [172.18.0.1] | 592 | 0 | Connect | BLOB |
| 2018-10-11 12:42:37.740209 | ethan[ethan] @  [172.18.0.1] | 592 | 0 | Query | BLOB |


<br>

## 정리
* log를 분석해 특이사항이 발견되면 실시간으로 알림을 줘도 좋을듯
  * file beat -> logstash -> kafka -> x -> slack webhook

<br>

> #### Reference
> * [How to enable MySQL Query Log?](https://stackoverflow.com/a/14404000)
