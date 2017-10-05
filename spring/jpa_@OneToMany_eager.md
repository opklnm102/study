# [Spring Data Jpa] @OneToMany(fetch = FetchType.EAGER)의 이상 현상
> Spring Boot + Spring Data Jpa에서
> @OneToMany(fetch = FetchType.EAGER)일 때, Entity가 LEFT OUTER JOIN으로 가져올 때 만난 이상 현상에 대해 정리하고자 함  
> N + 1 문제는 제외하고 정리했다. 이문제를 먼저 해결하면 결과는 다를 수 있을 가능성이 있는 걸로 사료됨

## 문제점

* 다음과 같은 연관관계가 있을 경우
 ```java
class Forest {
    
    @Id
    @Column(name = "forest_id")
    private Long forestId;

    @OneToMany(mappedBy = "forest", fetch = FetchType.EAGER)
    private List<Tree> trees;
}

class Tree {

    @Id
    @ManyToOne
    @JoinColumn(name = "forest_id", referencedColumnName = "forest_id")
    private Forest forest;
    
    @Id
    @Column(name = "tree_id")
    private Long treeId;

    @OneToMany(mappedBy = "tree", fetch = FetchType.EAGER)
    private List<Apple> apples;
}

class Apple {

    @Id
    @ManyToOne
    @JoinColumns({@JoinColumn(name = "forest_id", referencedColumnName = "forest_id"),
            @JoinColumn(name = "tree_id", referencedColumnName = "tree_id")})
    private Tree tree;

    @Id
    private Long appleId;
}
 ```

* `forestRepository.findOne(forest_id);`를 호출하면 다음과 같은 쿼리 수행
```sql
SELECT * 
FROM
    forest AS f 
    LEFT OUTER JOIN
		tree AS t
			ON f.forest_id = t.forest_id            
    LEFT OUTER JOIN
		apple AS a
			ON t.tree_id = a.tree_id
				AND t.forest_id = a.forest_id
WHERE
    f.forest_id = ?;
```

* 쿼리 결과의 엔티티를 사용
```java
// forest(1) --< tree(3) --< apple(12)의 관계일 경우
Forest forest = forestRepository.findOne(forest_id);

// 예상 size = 2, 실제 size = 2보다 큰 이상치...
List<Tree> trees = forest.getTrees();  // [Tree(1), Tree(1), Tree(1), Tree(1), Tree(2), Tree(2)....] 
```
* LEFT OUTER JOIN 쿼리가 수행되면서 드라이빙 테이블이 `forest`가 되리라 예상됬지만, 실제 동작에서는 apple로 선택됨에 따라 중복값 발생으로 이상치의 등장
* RDB의 선택에 따라 드라이빙 테이블이 변하므로...

## 해결책

### 1. @Fetch(FetchMode.SELECT)
```java
class Forest {
    
    @Id
    @Column(name = "forest_id")
    private Long forestId;

    @Fetch(FetchMode.SELECT)
    @OneToMany(mappedBy = "forest", fetch = FetchType.EAGER)
    private List<Tree> trees;
}
```
* `@Fetch(FetchMode.SELECT)`로 인해 `LEFT OUTER JOIN` 대신 `SELECT`으로 변경
```sql
SELECT * 
FROM
    forest AS f;

SELECT *
FROM
    tree AS t;
WHERE 
    tree.forest_id = ?;

SELECT *
FROM 
    apple As a
WHERE
    a.tree_id = ?
        AND a.forest_id = ?
```

### 2. Set<> 사용
* 중복되는 값들로 인해 이상치가 나온 것이므로 `Set<>`을 사용해 중복을 제거한다
```java
class Forest {
    
    @Id
    @Column(name = "forest_id")
    private Long forestId;

    @Fetch(FetchMode.SELECT)
    @OneToMany(mappedBy = "forest", fetch = FetchType.EAGER)
    private Set<Tree> trees;
}
```
* 쿼리는 `List<Tree> trees;` 때와 동일하게 수행
* 그러나 Set의 특성상 중복이 제거되어 예상하던 결과 리턴

### 3. FetchType.Lazy 사용
```java
class Forest {
    
    @Id
    @Column(name = "forest_id")
    private Long forestId;

    @OneToMany(mappedBy = "forest", fetch = FetchType.Lazy)
    private Set<Tree> trees;
}
```
* Lazy 로딩으로 필요할 때 쿼리가 발생하므로 `LEFT OUTER JOIN`으로 한번에 가져오지 않는다
* 그러나 N + 1의 문제로 인해 N번 발생할 수 있다
```sql
SELECT * 
FROM
    forest AS f;

-- 아래의 쿼리가 N번 발생할 수 있다
SELECT *
FROM
    tree AS t;
WHERE 
    tree.forest_id = ?;

SELECT *
FROM 
    apple As a
WHERE
    a.tree_id = ?
        AND a.forest_id = ?
```


## 정리
* Jpa를 사용할 때 Entity간의 연관관계를 잘 알고 사용해야 한다
* 같은 쿼리라도 DB가 옵티마이저하기에 따라 결과가 바뀌므로, 조심해야 한다
* Jpa로 작업을 할 때 `실행되는 쿼리를 보면서` 작업하자.... 

