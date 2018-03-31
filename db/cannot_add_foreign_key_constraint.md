# [MySQL] Error Code: 1215. Cannot add foreign key constraint
> 테이블 생성시 경험한 말도 안돼는 실수를 기록하고 두고두고 기억하기 위해 정리해보고자 한다

## DDL
```sql
CREATE TABLE IF NOT EXISTS `TEST`.`user` (
  `user_id` INT(11) NOT NULL COMMENT 'ID',
  `name` varchar(20),
  PRIMARY KEY (`user_id`)
)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `TEST`.`user_history` (
  `history_id` VARCHAR(32) NOT NULL COMMENT '변경 이력 ID',
  `user_id` INT(11) NOT NULL COMMENT 'user ID',
  PRIMARY KEY (`history_id`),
  INDEX `fk_user_id` (`user_id` ASC),
  CONSTRAINT `fk_user_id`
    FOREIGN KEY (`user_id`)
      REFERENCES `TEST`.`user` (`user_id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
) 
ENGINE=InnoDB 
DEFAULT CHARSET=utf8 
COMMENT='user의 변경 이력';
```


## 문제
* 이런 DDL이 있을 때 user_history 테이블이 생성되지 않는다..!
* Error Code
```
Error Code: 1215. Cannot add foreign key constraint	0.153 sec
```
* 그 이유는....?


## 원인
1. 레퍼런스 테이블에 FK 락이 걸려 있을 가능성
   * 트랜잭션이 잦은 테이블이라면 가능성 증가...!
2. FK로 사용할 컬럼에 index가 없을 경우
3. 컬럼 타입이 다를 경우
   * `character set`도 같아야 한다
```sql
-- InnoDB 엔진 상태 확인
SHOW ENGINE INNODB STATUS;

-- LATEST FOREIGN KEY ERROR 부분 확인
-- 왜 실패했는지 이유를 찾을 수 있다
-- ex. lock...
LATEST FOREIGN KEY ERROR
------------------------
2017-10-31 14:14:48 0x7f88a9186700 
Error in foreign key constraint of table 
CREATE TABLE IF NOT EXISTS `TEST`.`user_history` (
    FOREIGN KEY (`user_id`)
      REFERENCES `TEST`.`user` (`user_id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
) 
ENGINE=InnoDB 
DEFAULT CHARSET=utf8 
COMMENT='user의 변경 이력' :
Cannot find an index in the referenced table where the
referenced columns appear as the first columns, or column types
in the table and the referenced table do not match for constraint.
Note that the internal storage type of ENUM and SET changed in
tables created with >= InnoDB-4.1.12, and such columns in old tables
cannot be referenced by such columns in new tables.
Please refer to http://dev.mysql.com/doc/refman/5.7/en/innodb-foreign-key-constraints.html for correct foreign key 
```


## 해결

### Lock이 걸려 있다면
* FK check 옵션 해제
```sql
SET FOREIGN_KEY_CHECKS=0;
```

### FK로 사용할 컬럼에 index가 없을 경우
* index를 생성해준다

### 컬럼 타입이 다를 경우
* type과 characterset을 통일해준다 
> 내가 이상황을 겪은 이유다...  
> DB 스키마의 Default characterset과 테이블 생성시 characterset 달랐기 때문 
> referenced table DDL에 `DEFAULT CHARSET=utf8`때문에 발생한 문제


## Character Set & Collation

### Character Set
* 문자가 저장될 때 어떠한 `코드`로 저장될지에 대한 규칙의 집합
   * 저장 공간 크기 포함
   * latin1 - 2Byte
   * utf8 - 가변 3Byte
   * utf8mb4 - 가변 4Byte 
* 프로그램과 DB가 문자를 주고 받을 때 charset만 설정하면 된다
   * 전송할 text type을 알려주고, text stream을 전송하면 알맞게 처리하기 때문


### Collation
* Character Set에 의해 DB에 저장된 값들을 비교 검색하거나 정렬 등의 작업을 위해 문자들을 `비교`할 때 사용하는 규칙의 집합
* text 계열 자료형에서만 사용하는 속성
   * int
      * 1500 < 1700 => 명확
   * Date
      * 2018-03-01 < 2018-03-10 => 명확
   * test
      * a와 b => ?
      * a와 A => ?
* 같은 Character Set이라도 Collation에 따라 영문 대소문자 구분 비교 여부 등이 달라진다

#### Example. A, B, a, b 정렬시

##### utf8_bin
* binary 저장 값 그대로 정렬

```
16진수로 A(41), B(42), a(61), b(62)

A, B, a, b
```

##### utf8_general_ci
* 사람의 인식에 맞게 정렬(a 다음에 b)
* 일반적으로 널리 사용
* binary를 1번 가공

```
A, a, B, b
```

##### utf8_unicode_ci
* utf8_general_ci보다 조금 더 사람에 맞게 정렬


## 정리
* 왠만하면 Table의 collation과 character set은 DB Schema의 default 값을 사용하자
* 이모지 사용(utf8mb4) 등의 특별한 이유가 아니라면 `통일하는게 관리하기에 편하다`
* 새로 추가되는 문자들이 4Byte 영역을 사용하기도 하므로 `utf8mb4(charset), utf8mb4_unicode_ci(collation)`를 권장



> #### 참고
> * [14.8.1.6 InnoDB and FOREIGN KEY Constraints](https://dev.mysql.com/doc/refman/5.7/en/innodb-foreign-key-constraints.html) 
> * [utf8mb4 언어셋 소개 및 표현범위](https://blog.lael.be/post/917) 
