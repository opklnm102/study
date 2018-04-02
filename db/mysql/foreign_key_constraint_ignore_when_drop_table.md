# [MySQL] Foreign Key Constraint ignore when drop table


## 이슈
* FK관계가 있는 여러 table을 동시에 drop할 경우 아래의 메시지 발생
```
ERROR 1217 (23000) at line 40: Cannot delete or update a parent row: a foreign key constraint fails
```
* FK 관계를 파악하여 순서대로 drop해야 한다. 그러나 많을 경우 매우 귀찮아진다..
* alter로 FK를 지웠음에도 불구하고 발생할 수 있다
   * 다른 schema의 table이 참조할 경우
   * InnoDB internal data dictionary이 MySQL과 동기화되지 않았을 경우
   * `SHOW ENGINE INNODB STATUS`로 자세한 실패 이유를 확인할 수 있다 
   

## 해결
* foreign key constraint check option을 끈다
```sql
-- disable foreign key check option
SET FOREIGN_KEY_CHECKS=0;

-- drop table

-- restore option
SET FOREIGN_KEY_CHECKS=1;
```


> #### 참고
> * [Bogus foreign key constraint fail](https://stackoverflow.com/questions/3334619/bogus-foreign-key-constraint-fail)
