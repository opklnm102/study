# [MySQL] What does int(11) means in MySQL
> MySQL에서 int(11)과 int(20)의 차이가 궁금해서 알아본 것을 정리


## Integer Types(Exact Value)
| Type | Storage(Byte) | Signed/Unsigned | Minimum Value | Maximum Value |
|:--|:--|:--|:--|:--|
| TINYINT | 1 | Signed | -128 | 127 |
|  | | Unsigned | 0 | 255 |
| SMALLINT | 2 | Signed | -32768 | 32767 |
|  | | Unsigned | 0 | 65535 |
| MEDIUMINT | 3 | Signed | -8388608 | 8388607 |
|  | | Unsigned | 0 | 16777215 |
| INT | 4 | Signed | -2147483648 | 2147483647 |
|  | | Unsigned | 0 | 4294967295 |
| BIGINT | 8 | Signed | -9223372036854775808 | 9223372036854775807 |
|  | | Unsigned | 0 | 18446744073709551615 |


## () 안의 숫자는 필드의 표시 너비
* 부동 소수점 - 소수 자리수
* 문자 필드 - 저장될 수 있는 최대 문자 수
* 정수 - 최대값에 영향을 주지 않는다
   * INT(5), INT(11) 동일한 최대값을 저장할 수 있다
   * INT의 가장 큰 음수 값은 11자리(-2147483648)
   * 그래서 default display width는 11
   * BIGINT는 -9223372036854775808 -> 20자리


## 그렇다면 용도는?

```sql
CREATE TABLE zerofill_demo (
	id INT(11) NOT NULL AUTO_INCREMENT,
	a INT(11) NOT NULL,
	b INT(11) UNSIGNED ZEROFILL NOT NULL,
	c INT(5) DEFAULT NULL,
	d INT(5) UNSIGNED ZEROFILL NOT NULL,
	e INT(15) DEFAULT NULL,
	PRIMARY KEY (`id`)
)

INSERT INTO zerofill_demo (a, b, c, d, e) VALUES (1, 1, 1, 1, 1);
INSERT INTO zerofill_demo (a, b, c, d, e) VALUES (1234567890, 1234567890, 1234567890, 1234567890, 1234567890);

+----+------------+-------------+------------+------------+------------+
| id | a          | b           | c          | d          | e          |
+----+------------+-------------+------------+------------+------------+
|  1 |          1 | 00000000001 |          1 |      00001 |          1 |
|  2 | 1234567890 | 01234567890 | 1234567890 | 1234567890 | 1234567890 |
+----+------------+-------------+------------+------------+------------+
```
* `UNSIGNED ZEROFILL`이 아니면 실제로 아무것도 하지 않는다
* `UNSIGNED ZEROFILL`일 경우 저장된 숫자가 INT(11)보다 작으면 숫자는 왼쪽에 0으로 채워진다
* ZEROFILL은 음수를 저장할 수 없도록 암시적으로 부호를 지정하지 않으므로 ZEROFILL열에 음수가 없다
* column에 `ZEROFILL`이 있으면 항상 해당열의 `문자수를 저장`
   * b는 항상 최소 11자의 정수를 저장


### 필드가 UNSIGNED ZEROFILL이 아닌 경우 display width를 어떻게 사용할까?
* column이 UNSIGNED ZEROFILL이 아닌 경우 display width를 사용하지 않는다
   * 그러나 원하는 경우 Application에서 사용할 수 있다
   * meta data를 가져와서 column의 display width를 얻은 다음 column width를 설정하거나 표시하거나...



> #### 참고
> * [What does int(11) means in MySQL?](https://www.virendrachandak.com/techtalk/mysql-int11-what-does-it-means/)
> * [11.2.1 Integer Types (Exact Value) - INTEGER, INT, SMALLINT, TINYINT, MEDIUMINT, BIGINT](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html)
> * [Types in MySQL: BigInt(20) vs Int(20)](https://stackoverflow.com/questions/3135804/types-in-mysql-bigint20-vs-int20)
> * [신규 Web 서비스시 고려해 볼 사항](http://kwonnam.pe.kr/wiki/web/%EC%8B%A0%EA%B7%9C%EC%84%9C%EB%B9%84%EC%8A%A4)
