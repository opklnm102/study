# [Spring Data Jpa] Remove JPQL Implicit join
> Spring Boot + Spring Data Jpa를 사용하던 도중 JPQL Implicit join(JPQL 묵시적 조인)을 제거하던 경험을 정리해보고자 함

## JPQL Implicit join이란?
* JPQL 사용시 명시적으로 join을 선언하진 않았지만 entity mapping에 따라 `묵시적`으로 join이 일어나는 현상

### Entity 연관관계에 따른 Implicit join
```java
// Entity
public class Shop {

    @Id
    private Long shopId;

    @OneToMany(mappedBy = "shop")
    private List<Product> products;
}

public class Product {

    @Id
    private Long productId;

    @ManyToOne
    private Shop shop;
}

// Repository
@Repository
public interface ProductRepository extends JpaRepository<Shop, Long> {

    // Named Query - ID로 조회할 경우
    List<Product> findByShopId(Long shopId);
}

// usage
@Test
public void test() throws Exception {
    List<Product> products = productRepository.findByShopId(shop.getId());
}
```

* generated query - Implicit join 발생
```sql
SELECT 
    product0_.id AS id1_8_,
    product0_.shop_id AS shop_id12_8_
FROM
    product product0_ 
LEFT OUTER JOIN
    shop shop1_ 
        ON product0_.shop_id=shop1_.id 
WHERE
    shop1_.id=?
```
* findByShopId -> Shop의 Id를 조건으로 조회하겠다
* Product는 Shop의 id를 알고 있지 않으므로 join 발생


### 개선 - JPQL로 수정
* product table은 shop_id라는 컬럼이 있기 때문에 JPQL로 작성하면 join이 발생하지 않는다
```java
@Repository
public interface ProductRepository extends JpaRepository<Shop, Long> {

    // JPQL - entity로 
    @Query(value = "SELECT p FROM Product p WHERE p.shop.id = :shopId")
    List<Product> findByShopId(@Param("shopId") Long shopId);
}
```

```sql
SELECT
    product0_.id AS id1_8_,
    product0_.shop_id AS shop_id12_8_
FROM
    product product0_ 
WHERE
    product0_.shop_id=?
```

### 개선 - Named Query일 경우
* Product는 Shop의 id를 알고 있지 않아 join 발생하므로 `알 수 있게` 해준다
* `read only` field 추가
```java
public class Product {

    @Id
    private Long productId;

    // read only field
    @Column(name = "shop_id", nullable = false, insertable = false, updatable = false)
    private Long shopId;

    @ManyToOne
    private Shop shop;
}
```

```sql
SELECT
    product0_.id AS id1_8_,
    product0_.shop_id AS shop_id12_8_
FROM
    product product0_ 
WHERE
    product0_.shop_id=?
```


## 정리
* JPQL 작성시엔 generate되는 쿼리를 확인하자
   * Entity Mapping에 따라 생성되는 쿼리가 다르다
* JPQL Implicit join으로 필요없는 데이터를 가져올 경우 쿼리를 튜닝하자
   * 명시적 JPQL 작성
   * read only field 추가


