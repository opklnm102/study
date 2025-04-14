# [MySQL] 
> date - 2023.10.06  
> keyworkd - mysql, 
> 

<br>

## Performance Schema의 메모리 사용량 이슈 해결
* PS를 활성화하고 메모리를 주로 어디에서 사용하는지에 대한 정보는 아래 쿼리로 확인할 수 있다.
```sql
select event_name, current_alloc 
from sys.memory_global_by_current_bytes 
limit 10;
```

메모리 사용량이 많은 PS 통계정보 테이블
| event name | description |
|:--|:--|
| events_errors_summary_by_account_by_error	| DB에 접속한 (user,host)별로 에러 코드 수 만큼 데이터 저장| 
| events_errors_summary_by_host_by_error	| DB에 접속한 host별로 에러 코드 수 만큼 데이터 저장| 
| events_statements_summary_by_account_by_event_name	| DB에 접속한 (user,host)별로 statement 이벤트 수 만큼 데이터 저장| 
| events_statements_summary_by_host_by_event_name| 	DB에 접속한 host별로 statement 이벤트 수 만큼 데이터 저장| 
| events_waits_summary_by_account_by_event_name	| DB에 접속한 (user,host)별로 wait 이벤트 수 만큼 데이터 저장| 
| events_waits_summary_by_host_by_event_name	| DB에 접속한 host별로 wait 이벤트 수 만큼 데이터 저장| 
| memory_summary_by_account_by_event_name| 	DB에 접속한 (user,host)별로 memory 관련 이벤트 수 만큼 데이터 저장| 
| memory_summary_by_host_by_event_name	| DB에 접속한 host별로 memory 관련 이벤트 수 만큼 데이터 저장| 

* 통계 정보 테이블은 accounts/hosts/users 관련 테이블과 연관이 있다.
* accounts/hosts/users 테이블에 쌓인 데이터는 세션이 종료되더라도 제거되지 않으며, 해당 테이블의 데이터를 삭제해도 이미 사용된 메모리 영역은 반환되지 않는다.
* accounts/hosts/users 테이블에 데이터가 저장되지 않으면 통계정보 테이블에도 데이터가 저장되지 않는다.
* 즉, 처음부터 accounts/hosts/users 테이블에 데이터가 많이 쌓이지 않도록 설정하면 Performance Schema의 메모리 사용량을 줄일 수  있다.
* accounts/hosts/users 테이블에 저장되는 데이터 수를 제어하는 파라미터는 아래와 같다. 세 파라미터의 기본값은 "-1" 로, 저장되는 데이터 수가 최대값인 1048576까지 자동 증가한다.
  * performance_schema_accounts_size
  * performance_schema_hosts_size
  * performance_schema_users_size

## 결론
* EKS 등을 통해 어플리케이션 서버가 배포되는 경우, Performance Schema의 통계 정보 테이블에 데이터가 많이 쌓일 수 있다. (DB가 공용으로 사용되는 경우에는 더더욱)
* 물리 메모리 사이즈가 적은 DB 인스턴스는 Performance Schema의 메모리 사용량이 일정 수준 이상으로 늘어나면 치명적이다.
* Performance Schema의 메모리 사용량을 체크하고, 필요 시 아래 파라미터 설정값을 변경하는 방법을 고려해볼 수 있다.
  * performance_schema_accounts_size
  * performance_schema_hosts_size
  * performance_schema_users_size








