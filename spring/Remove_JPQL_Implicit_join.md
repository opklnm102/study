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

    // Named Query - Entity로 조회할 경우
    // Shop을 조건으로 조회하겠다 -> hashCode()의 리턴값으로 동일 instance 판단
    List<Product> findByShop(Shop shop);

    // Named Query - ID로 조회할 경우
    // Shop의 Id를 조건으로 조회하겠다
    List<Product> findByShopId(Long shopId);
}

// usage
@Test
public void test() throws Exception {
    // 1. ID 기반  named query
    List<Product> products = productRepository.findByShopId(shop.getId());

    // 2. entity 기반 named query
    List<Product> products = productRepository.findByShop(shop);
}
```

* generated query - 동일한 Implicit join 발생
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
* 이유
   * @ManyToOne - default FetchType.EAGER -> Product 정보 이외에 FetchType.EAGER인 Entity를 로딩
   * Product는 Shop의 id를 알고 있지 않으므로 join 발생

### 개선 - Global Fetch Strategy 수정
* 깊은 연관관계에 있을 경우 유효
   * ex. `1 : N : M` 등 - 1을 로딩하면서 N을 로딩하고, N을 로딩하면서 M까지 로딩되는 경우 
* where 절에 해당하지 않을 경우 유효
   * 불필요한 field인 경우
* where 절에 해당하는 field는 무효
   * 필요한 field이므로 로딩된다
```java
public class Product {

    @Id
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    private Shop shop;
}
```

> #### Global Fetch Strategy
> * Entity에 직접 적용하는 Fetch Strategy
> * Application 전체에 영향을 미치므로 `Global Fetch Strategy`라 부른다
> * EAGER보다는 LAZY를 사용하면서 최적화가 필요하면 `fetch join`을 사용하는 것이 효과적


### 개선 - JPQL 사용
* product table은 shop_id라는 컬럼이 있기 때문에 JPQL로 작성하면 join이 발생하지 않는다
```java
@Repository
public interface ProductRepository extends JpaRepository<Shop, Long> {

    // JPQL
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

### 개선 - Read Only field 사용
* field가 where절에 사용되고, table상 컬럼이 있을 경우
* Product는 Shop의 id를 알고 있지 않아 join 발생하므로 `알 수 있게` 해준다
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
   * Global Fetch Strategy LAZY로 수정
   * 명시적 JPQL 작성
   * read only field 추가

