# [MySQL] iterator numbering when select

* account table

| id | first_name | last_name | age |
|:--|:--|:--|:--|
| 1 | mark | lee | 23 |
| 2 | mark | kim | 21 |
| 3 | ethan | kim | 27 |
| 4 | jack | lee | 25 |
| 5 | jack | kim | 25 |
| 6 | jack | choi | 26 |


```sql
SELECT @rownum := @rownum + 1 AS num, a.first_name, a.last_name, a.age  FROM account AS a, (SELECT @rownum := 0 ) r;
```
* result

| num | first_name | last_name | age |
|:--|:--|:--|:--|
| 1 | mark | lee | 23 |
| 2 | mark | kim | 21 |
| 3 | ethan | kim | 27 |
| 4 | jack | lee | 25 |
| 5 | jack | kim | 25 |
| 6 | jack | choi | 26 |
