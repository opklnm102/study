# [MySQL] Difference between VARCHAR and CHAR
> VARCHAR와 CHAR의 차이를 알아본 것을 정리

* CHAR, VARCHAR는 유사하지만, 저장 및 검색시에만 다르다


## CHAR
* 고정 길이의 문자열 저장
* 매우 짧은 문자열을 저장하거나, 모든값의 길이가 같은 경우 적합
   * MD5 암호화 정보 - CHAR(32)
   * IPv4 문자열 주소 - CHAR(15) or int
* 나머지 공간에 공백을 채워넣는다
   * CHAR(40)에 abcd를 저장할 때 4Byte를 저장하고 나머지 36Byte의 비어 있는 공간에는 공백을 채워 저장
   * 읽을 때 임의로 채워진 공백들은 제거되어 읽는다
   * `PAD_CHAR_TO_FULL_LENGTH` mode일 경우 공백까지 읽어온다
* index lookup시 VARCHAR보다 20% 더 빠르다


## VARCHAR
* 가변 길이의 문자열 저장
* 고정 size보다 효율적인 storage 사용
* 추가로 길이 정보를 저장하는 1 or 2Byte 저장
   * 1Byte - 255길이 미만
   * 2Byte - 255길이 이상
   * VARCHAR(10) -> 11Byte 사용
   * VARCHAR(40)에 abcd를 저장할 때 4Byte를 저장하고, 뒤에 1Byte(255길이 미만) 또는 2Byte(255길이 이상)의 길이 정보를 추가
* 공백을 채워넣지 않는다
* 성능에 이점이 있다
   * 수백만 또는 수십억 개의 row 저장시, 더 작은 row를 생성하여 실제 파일이 더 작기 때문에
* 새로운 데이터가 업데이트될 경우
   * 기존보다 더 큰 길이의 data가 저장되면, 저장 공간이 부족하여 새로운 영역에 할당
   * data fragmentation 발생
   * table에 VARCHAR가 있으면, fragmentation은 발생할 수 밖에 없다
   * fragmentation을 염두한다면 VARCHAR 사용을 고려해보자

### VARCHAR 사용시 fragmentation 막는 법
* VARCHAR를 CHAR처럼 동작하도록 강제 지정
   * 저장 용량은 증가하지만, fragmentation으로 인한 성능 저하는 막을 수 있다
```sql
ALTER TABLE <table name> ROW_FORMAT = FIXED;
```

> 무조건 파편화가 발생되는건 아니다  
> 처음에 insert 후 더 큰 크기의 data로 update될 경우 발생  
> log table처럼 insert만 허용되는 table은 해당하지 않는다

* 아래 query로 저장된 data를 분석해서 판단
```sql
SELECT * FROM <table name> PROCEDURE ANALYSE();
```


### VARCHAR(20)을 VARCHAR(64000)과 같이 VARCHAR에 무조건 최대값을 쓰지 않는 이유
* 결과를 필터링할 temporary table 생성시(GROUP BY 등) 전체 길이가 할당된다
   * internal temporary table이 필요시 memory table을 사용한다
   * 그러나 memory table은 아래의 경우 사용할 수 없다
      * text/blob columns
      * 어느 정도 큰 VARCHAR. 아마 512
   * VARCHAR는 CHAR로 변환
      * VARCHAR(255)는 내용에 관계없이 765Byte로 확장
   * memory table이 max_heap_table_size 또는 tmp_table_size보다 크면 MyISAM으로 변환되어 disk로 유출될 수 있다
   * 그래서 VARCHAR(25)는 momory에 머물러 있기 때문에 더 빠르다
* client에 row를 전송하는 wire protocol은 더 큰 길이가 할당된다
* storage engine은 적절한 VARCHAR를 구현하지 않을수도 있다


> #### 참고
> * [mysql 에서 CHAR(40) 와 VARCHAR(40) 의 성능 차이](http://netmaid.tistory.com/44?category=408411)
> * [Any benefit of uses CHAR over VARCHAR?](https://stackoverflow.com/questions/7601424/any-benefit-of-uses-CHAR-over-VARCHAR)
> * [Performance implications of MySQL VARCHAR sizes](https://dba.stackexchange.com/questions/424/performance-implications-of-mysql-VARCHAR-sizes)
> * [The CHAR and VARCHAR Types](https://dev.mysql.com/doc/refman/5.5/en/CHAR.html)
