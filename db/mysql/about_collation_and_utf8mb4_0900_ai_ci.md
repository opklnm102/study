# [MySQL] About collation and utf8mb4_0900_ai_ci
> date - 2023.10.06  
> keyworkd - mysql, collation, unicode  
> MySQL의 collation에 대해 정리    

<br>

## Collation 이란?
* `character set`은 문자 자체에 대한 모양과 encoding 정의이고, `collation`은 정해져 있는 encoding을 기반으로 문자끼리 어떻게 비교할지에 대한 규칙 정의
  * 동일한 문자에 대해 어떻게 비교할지, 정렬은 어떻게 할지, 검색시 어떤 결과가 일어날지 등


<br>

## Collation 동작 방식
* 문자열에 대해 가중치 값을 계산한 후 비교
  * MySQL에서는 `WEIGHT_STRING()`로 가중치 확인 가능
* DUCET(Default Unicode Collation Element Table)에 정의된 가중치 사용
* Unicode 문자열 가중치 값은 primary, secondary, tertiary 같이 단계적으로 구성
  * primary - 기본 문자 비교
  * secondary - accent 등 diacritic 비교
  * tertiary - 대소문자 비교
* collation 민감도 - as_cs > as_ci > ai_ci
* 한글 음절(가, 각)의 경우 초성, 중성, 종성을 분해해서 가중치 값을 조합한 후 비교
  * utf8mb4_0900_ci_ci의 경우 `가`와 `ㄱㅏ`를 동일시 하는 반면 `각`과 `ㄱㅏㄱ`은 다른 문자로 본다


<br>

## Collation 확인
* MySQL server의 collation 확인
```sql
SHOW GLOBAL VARIABLES LIKE '%collation%';
```

* 전체 database character set 확인
```sql
SELECT SCHEMA_NAME AS 'database', 
       DEFAULT_CHARACTER_SET_NAME AS 'character_set', 
       DEFAULT_COLLATION_NAME AS 'collation'
FROM information_schema.SCHEMATA;
```

* 하나의 database character set 확인
```sql
USE <DB>;
SHOW GLOBAL VARIABLES LIKE 'character_set_database';
```

* DB table의 collation 확인
```sql
SELECT table_schema,
       table_name,
       table_collation
FROM information_schema.tables
WHERE table_schema = '<DB>';
```

* table collation 확인
```sql
SHOW TABLE STATUS WHERE NAME LIKE '<table>';
```

* table의 column collation 확인
```sql
SHOW FULL COLUMNS FROM <table>;
```


<br>

## utf8mb4_0900_ai_ci
* MySQL 8.0에서 사용하는 collation
* utf8mb4
  * 각 character가 최대 4byte UTF8 encoding을 지원하는 MySQL 8.0 default character set
  * emoji 처리 가능
* 0900
  * UCA(Unicode Collation Algorithm) 9.0.0 지원
  *  9.0.0은 이전 버전보다 빠르기 때문에 utf8mb4_0900_ai_ci이 default collation으로 선택
* ai(accent insensitivity)
  * e, è, é, ê and ë 같이 accent가 있는 문자들을 동일한 문자로 취급
  * accent 규칙이 없는 collation은 case 규칙에 따라 accent 규칙이 정해진다
    * ci(case insensitivity) -> ai(accent insensitivity)
    * cs(case sensitivity) -> as(accent sensitivity)
* ci(case insensitivity) - p와 P를 같은 문자로 취급

<br>

### utf8mb4_general_ci vs utf8mb4_0900_ai_ci
* uft8mb4_unicode_ci의 상위버전
  * ai(accent insensitive) & ci(case insensitive)
  * 공백을 다른 문자로 구분(NO PAD)
    * NO PAD - 문자열 끝에 공백이 있을 경우 공백까지 포함하여 비교
* utf8mb4_general_ci보다 UCA(Unicode Collation Algorithm) 버전이 높아 더 정확한 문자 비교 가능
  * 0900 같은 숫자 정보가 없는 것은 UCA(Unicode Collation Algorithm) 4.0.0 사용
* general은 legacy collation으로 expansions, contractions, ignorable character의 비교는 수행하지 않아 일반적으로 unicode collation보다 빠르지만 정확도는 떨어진다
* 한글을 처리하는데 있어 utf8mb4_general_ci와 차이를 보이는 부분이 있다

| Collation | 문자열 가중치 기준 | 후렴공백 처리 여부 | 후렴공백('A' = 'A ') | 대소문자(A = a) | 악센트(Â = A) | 한글 분리(가 = ㄱㅏ) | 한글 분리(각 = ㄱㅏㄱ) |
|:--|:--|:--|:--|:--|:--|:--|:--|
| utf8mb4_general_ci | MySQL custom | Pad Space | O | O | O | X | X |
| utf8mb4_unicode_ci | UCA 4.0.0 | Pad Space  | O | O | O | X | X |
| utf8mb4_0900_ai_ci<br>(MySQL 8.0 default) | UCA 9.0.0 | No Pad | X | O | O | O | X | O | 
| utf8mb4_0900_as_cs | UCA 9.0.0 | No Pad | X | X | X | X | X |

<br>

### 문자 비교 test

#### pad 유무
* collation 정보 확인
```sql
SHOW COLLATION WHERE Charset = 'utf8mb4';

+----------------------------+---------+-----+---------+----------+---------+---------------+
| Collation                  | Charset | Id  | Default | Compiled | Sortlen | Pad_attribute |
+----------------------------+---------+-----+---------+----------+---------+---------------+
| utf8mb4_0900_ai_ci         | utf8mb4 | 255 | Yes     | Yes      |       0 | NO PAD        |
| utf8mb4_general_ci         | utf8mb4 |  45 |         | Yes      |       1 | PAD SPACE     |
+----------------------------+---------+-----+---------+----------+---------+---------------+
```

* utf8mb4_0900_ai_ci pad 유무 비교
```sql
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SELECT 'a ' = 'a';
+------------+
| 'a ' = 'a' |
+------------+
|          0 |
+------------+
```

* utf8mb4_general_ci pad 유무 비교
```sql
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
SELECT 'a ' = 'a';

+------------+
| 'a ' = 'a' |
+------------+
|          1 |
+------------+
```

#### 한글 분리 확인
* utf8mb4_0900_ai_ci는 한글 자음, 모음을 같은 문자로 인식(가타카나/히라가나도 같은 문자로 인식)하지만 utf8mb4_general_ci는 구분한다
```sql
SELECT WEIGHT_STRING('가'), WEIGHT_STRING('ㄱㅏ'), WEIGHT_STRING('각'), WEIGHT_STRING('ㄱㅏㄱ');
```
| 문자 | WEIGHT_STRING() |
|:--|:--|
| 가 | 0x3BF53C73 |
| ㄱㅏ | 0x3BF53C73 |
| 각 | 0x3BF53C733CD1 |
| ㄱㅏㄱ | 0x3BF53C733BF5 |

* utf8mb4_0900_ai_ci 비교
```sql
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SELECT '가나다' = 'ㄱㅏㄴㅏ다';
+--------------------+
| '가나다' = 'ㄱㅏㄴㅏ다'|
+--------------------+
|                  1 |
+--------------------+
```

* utf8mb4_general_ci 비교
```sql
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
SELECT '가나다' = 'ㄱㅏㄴㅏ다';
+--------------------+
| '가나다' = 'ㄱㅏㄴㅏ다'|
+--------------------+
|                  0 |
+--------------------+
```


<br>

## utf8mb4 collation guide
* utf8mb4 collation 선택시 아래 조건에 따라 선택

| 조건 | collation |
|:--|:--|
| emoji 구분 필요 | utf8mb4_0900_xx_xx |
| accent 구분 필요 | utf8mb4_0900_as_xx |
| 대소문자 구분 필요 | utf8mb4_0900_xx_cs |
| 대소문자 구분 필요 | utf8mb4_0900_xx_cs |
| 한글 자모 구분/완성문자 구분 필요 | utf8mb4_unicode_xx or utf8mb4_0900_ac_cs |


<br><br>

> #### Reference
> * [Unicode Character Sets - MySQL Docs](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-sets.html)
> * [Collation Naming Conventions - MySQL Docs](https://dev.mysql.com/doc/refman/8.0/en/charset-collation-names.html)
> * [How collation works](http://peter.eisentraut.org/blog/2023/03/14/how-collation-works)

<br>

> #### Further reading
> * [[MySQL] collation 의 이모지 식별 (emoji)](https://blog.naver.com/sory1008/222401508955)
