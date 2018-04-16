# [DB] Closure Table
> 사내 2번째 프로젝트에서 사용한 Closure Table에 대해 알아본 것을 정리  


## Closure Table이란?
* 계층형 구조 표현시 사용
   * 계층형 게시판
   * 카테고리
   * 댓글의 댓글이 달리는 구조
   * ...
* 부모, 자식 관계에 대한 경로만을 지정하는게 아니라, `트리의 모든 경로`를 지정하는 방식
   * `저장 공간을 많이 사용`한다는 단점 존재
* 대안 트리 모델 중 가장 선호되는 방식


## Sample
* MySQL 5.7 기준

<img src="https://github.com/opklnm102/study/blob/master/db/images/closure_table_example.png" alt="Container" width="350" height="350"/> 

### table schema
```sql
-- base
CREATE TABLE products (
  id INTEGER,
  category_id INTEGER NOT NULL REFERENCES categories (id),
  -- ...
  PRIMARY KEY(id)
);

CREATE TABLE categories (
  id INTEGER,
  parent_id INTEGER NOT NULL REFERENCES categories (id),
  -- ...
  PRIMARY KEY(id)
);

CREATE TABLE categories_tree (
  ancestor_id INTEGER,
  descendant_id INTEGER,
  depth INTEGER
);

-- sample
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `category_tree` (
  `ancestor_id` int(11) NOT NULL,
  `descendant_id` int(11) NOT NULL,
  `depth` int(11) NOT NULL,
  PRIMARY KEY (`ancestor_id`,`descendant_id`)
) ENGINE=InnoDB;

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT |0.00|,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```


### Sample data

* category

| id | parent_id | name |
|:--|:--|:--|
| 1 | NULL | category 1 |
| 2 | 1 | category 2 |
| 3 | 1 | category 3 |
| 4 | 2 | category 4 |
| 5 | NULL | category 5 |
| 6 | 4 | category 6 |
| 7 | 4 | category 7 |

* category tree

| ancestor_id | descendant_id | depth |
|:--|:--|:--|
| 1 | 1 | 0 |
| 1 | 2 | 1 |
| 1 | 3 | 1 |
| 1 | 4 | 2 |
| 1 | 6 | 3 |
| 1 | 7 | 3 |
| 2 | 2 | 0 |
| 2 | 4 | 1 |
| 2 | 6 | 2 |
| 2 | 7 | 2 |
| 3 | 3 | 0 |
| 4 | 4 | 0 |
| 4 | 6 | 1 |
| 4 | 7 | 1 |
| 5 | 5 | 0 |
| 6 | 6 | 0 |
| 7 | 7 | 8 |

* product

| id | category_id | name | price | 
|:--|:--|:--|:--|
| 1 | 3 | c3 p1 | 10.00 |
| 2 | 3 | c3 p2 | 20.00 |
| 3 | 4 | c4 p3 | 30.00 |
| 4 | 4 | c4 p4 | 40.00 |
| 5 | 5 | c5 p5 | 10.00 |
| 6 | 5 | c5 p6 | 20.00 |
| 7 | 1 | c1 p7 | 10.00 |
| 8 | 2 | c2 p8 | 20.00 |
| 9 | 6 | c6 p9 | 50.00 |
| 10 | 7 | c7 p10 | 50.00 |


### Usage
* all products in given category and its subcategories
```sql
SELECT * FROM products p
  INNER JOIN category_tree ct 
  ON p.category_id = ct.descendant_id
WHERE ct.ancestor_id = <target category ID>

-- example
SELECT * FROM products p
  INNER JOIN category_tree ct 
  ON p.category_id = ct.descendant_id
WHERE ct.ancestor_id = 1
```

| id | category_id | name | price | ancestor_id | descendant_id | depth |
|:--|:--|:--|:--|:--|:--|:--|
| 1 | 3 | c3 p1 | 10.00 | 1 | 3 | 1 |
| 2 | 3 | c3 p2 | 20.00 | 1 | 3 | 1 |
| 3 | 4 | c4 p3 | 30.00 | 1 | 4 | 2 |
| 4 | 4 | c4 p4 | 40.00 | 1 | 4 | 2 |
| 7 | 1 | c1 p7 | 10.00 | 1 | 1 | 0 |
| 8 | 2 | c2 p8 | 20.00 | 1 | 2 | 1 |
| 9 | 6 | c6 p9 | 50.00 | 1 | 6 | 3 |
| 10 | 7 | c7 p10 | 50.00 | 1 | 7 | 3 |


* 특정 카테고리의 상위 노드 조회
   * 쉽게 상위 노드로 이동할 수 있다

```sql
SELECT * FROM category c
  INNER JOIN category_tree ct 
  ON c.id = ct.ancestor_id
WHERE ct.descendant_id = <target category ID>
ORDER BY ct.depth DESC;

-- example
SELECT * FROM category c
  INNER JOIN category_tree ct 
  ON c.id = ct.ancestor_id
WHERE ct.descendant_id = 6
ORDER BY ct.depth DESC;
```

| id | parent_id | name | ancestor_id | descendant_id | depth |
|:--|:--|:--|:--|:--|:--|
| 1 | NULL | category 1 | 1 | 6 | 3 |
| 2 | 1 | category 2 | 2 | 6 | 2 |
| 4 | 2 | category 4 | 4 | 6 | 1 |
| 6 | 4 | cagetory 6 | 6 | 6 | 0 |


* Insert Leaf node
   * 자기 자신의 tree path와 부모 노드의 path를 추가
```sql
INSERT INTO category(id, parent_id, name)
VALUES(<new node ID>, <parent node ID>, 'category 11');

INSERT INTO category_tree (ancestor_id, descendant_id, depth)
  SELECT ct.ancestor_id, <new node ID>, ct.depth + 1
  FROM category_tree AS ct
  WHERE ct.descendant_id = <parent node ID>
UNION ALL
  SELECT <new node ID>, <new node ID>, 0;

-- example
-- insert leaf node #11 as a child of #6
INSERT INTO category(id, parent_id, name)
VALUES(11, 6, 'category 11');

INSERT INTO category_tree (ancestor_id, descendant_id, depth)
  SELECT ct.ancestor_id, 11, ct.depth + 1
  FROM category_tree AS ct
  WHERE ct.descendant_id = 6
UNION ALL
  SELECT 11, 11, 0;
```

* Delete Leaf node
```sql
DELETE FROM category_tree WHERE descendant_id = <target node ID>;

DELETE FROM category WHERE id = <target node ID>;

-- example
-- delete leaf node #11
DELETE FROM category_tree WHERE descendant_id = 11;

DELETE FROM category WHERE id = 11;
```

* Delete Subtree
```sql
-- error code 1093 때문에 임시 변수 사용
SET @temp_category_id = (SELECT group_concat(descendant_id separator ',')
                         FROM category_tree
                         WHERE ancestor_id = <target node ID>);

SELECT @temp_category_id;
                    				
DELETE FROM category
WHERE find_in_set(id, cast(@temp_category_id as char));

DELETE FROM category_tree
WHERE find_in_set(descendant_id, cast(@temp_category_id as char));

-- example
-- delete #12 and all children from the tree
SET @temp_category_id = (SELECT group_concat(descendant_id separator ',')
                         FROM category_tree
                         WHERE ancestor_id = 12);
                    
SELECT @temp_category_id;
                    				
DELETE FROM category
WHERE find_in_set(id, cast(@temp_category_id as char));

DELETE FROM category_tree
WHERE find_in_set(descendant_id, cast(@temp_category_id as char));
```

* Move Subtree
   * subtree의 최상위 node와 그 node의 자손들을 참조하는 row를 삭제
   * 고아가 된 subtree를 새로운 node의 subtree로 추가
```sql
-- reparent #6 from #4 -> #3
-- Step 1: Disconnect from current ancestors
-- delete all paths that end at descendants in the subtree
-- or that begin with
DELETE FROM category_tree
WHERE descendant_id IN (SELECT descendant_id
                     FROM category_tree
                     WHERE ancestor_id = 6)
    AND ancestor_id IN (SELECT ancestor_id
                     FROM category_tree
                     WHERE descendant_id = 6
                     AND ancestor_id != descendant_id);

-- Step 2: Insert rows matching ancestors of insertion point and descendants of subtree
-- CROSS JOIN => Cartesian Product 생성
INSERT INTO category_tree (ancestor_id, descendant_id, depth)
  SELECT supertree.ancestor_id, subtree.descendant_id, supertree.depth +  subtree.depth + 1 AS depth
  FROM category_tree AS supertree
  CROSS JOIN category_tree AS subtree
  WHERE supertree.descendant_id = 3
  AND subtree.ancestor_id = 6;
```


> #### 참고
> * [[SQL 안티 패턴 – 2] 순진한 트리 (Naive Trees)](https://ahnndroid.wordpress.com/)
> * [Closure Tables for Browsing Trees in SQL](https://coderwall.com/p/lixing/closure-tables-for-browsing-trees-in-sql)
> * [Recursive Query / Hierarchical Queries](https://junyongs.wordpress.com/tag/closure-table/)
> * [Closure Table operations SQL fragments](https://gist.github.com/emmanuel/1004087)
