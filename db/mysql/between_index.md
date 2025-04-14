


날짜 검색

mysql between Index
https://www.google.co.kr/search?newwindow=1&safe=off&ei=zuA4Wp3RLsf98gWD8qawCg&q=mysql+between+index&oq=mysql+between+index&gs_l=psy-ab.3..0j0i8i30k1l9.348606.352813.0.352916.13.10.0.3.3.0.190.1072.0j9.9.0....0...1c.1.64.psy-ab..1.12.1082...0i131k1j0i67k1j0i30k1.0.hZkwpBeRRRY

날짜검색 시 주의사항
http://egloos.zum.com/tiger5net/v/5751776


Mysql Query Optimization using Covering Index
http://b.fantazm.net/entry/Mysql-Query-Optimization-using-Covering-Index



mysql의 indx 사용법
http://egloos.zum.com/laydios/v/1114374


```
나 있다. Index는 검색(select 작업)을 할때 큰 역할을 한다. (MySQL reference를 보면 1000개의 행에서 검색을 할때 index를 설정한 경우가 그렇지 않은 경우보다 적어도 100배 빠르다고 한다.) 하지만 빈번하게 insert나 update가 이루어지는 경우 index를 갱신하는 작업이 필요하므로 select할 때 줄인 시간만큼 insert나 update에서 더 시간이 걸릴 수도 있다. 그러므로 index의 사용은 table과 자료의 목적에 따라 적절히 사용되어야 할 것이다.
```


## explain plan

https://dev.mysql.com/doc/workbench/en/wb-performance-explain.html
내용 정리






example

```sql
explain
SELECT * FROM (SELECT id FROM account) AS T1
JOIN account_info USING (id);
```

| id | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| 1 | SIMPLE | account_info | NULL | ALL | PRIMARY | NULL | NULL | NULL | 2 | 100.00 | NULL |
| 1 | SIMPLE | account | NULL | eq_ref | PRIMARY | PRIMARY | 4 | TEST_PRODUCT.account_info.id | 1 | 100.00 | Using index |



