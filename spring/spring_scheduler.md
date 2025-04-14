# [Spring]



spring scheduler 정리


https://stackoverflow.com/questions/37493869/java-spring-do-scheduled-task-at-a-specific-time-of-specific-timezone

https://gs.saro.me/#!m=elec&jn=866

https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/scheduling/support/CronSequenceGenerator.html
에서 example pattern 참고


```
초 분 시 일 월 주(년)
* * * * * *
1분마다 - 0 */1 * * * ?
1시간 마다 31분에 - 0 31 */1 * * ?
월요일, 2시 30분마다 - 0 30 2 * * MON
```


spring scheduler clustering -> 이건 뭘까..?



