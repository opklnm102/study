# [Spring Data Jpa] Soft Delete
> date - 2024.02.26  
> keyworkd - jpa, hibernate, soft delete  
> spring data jpa에서 soft delete를 구현하는 방법에 대해 정리

<br>

## hard delete? soft delete?
* hard delete - physical delete라고 하며 실제로 삭제되는 것을 의미
* soft delete - logical delete라고 하며 실제로 삭제되지 않고, 삭제된 것을 의미하는 필드를 두어 구분하는 것을 의미


<br>

## `@SQLDelete`
* deleted_at(datetime), deleted(boolean) 등의 필드를 이용하여 soft delete를 구현하는데 사용
* entity에 `@SQLDelete` 설정 후 JPARepository.delete()를 사용하면 자동으로 `@SQLDelete`의 sql이 실행된다

<br>

### `@SQLDelete` + `@Where`로 soft delete 구현
* `@Where`를 설정하여 entity의 모든 query에 default where 절을 적용시킬 수 있다
* `@SQLDelete`를 사용해 soft delete에 사용될 필드를 업데이트하고, `@Where`를 사용해 삭제되지 않은 데이터를 조회하는 방식으로 구현하며 삭제된 데이터까지 조회가 필요한 경우에는 `@Where`로 인해 불편함이 발생한다

#### deleted(boolean) column 사용시
```java
@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE product SET deleted = true, updated_at = now() WHERE product_id = ?")
@Where(clause = "deleted = false")
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "product_id")
  private Long productId;

  ...

  @Column(name = "deleted")
  private boolean deleted;

  @Column(name = "updated_at")
  private LocalDatetime updatedAt;
}

public class ProductService {
  ...
  @Transactional
  public void delete(long productId) {
   productRepository.deleteById(productId);
  }
}
```

#### deleted_at(datetime) column 사용시
```java
@SQLDelete(sql = "UPDATE product SET deleted_at = now() WHERE product_id = ?")
@Where(clause = "deleted_at is null")
```


<br>

## `@SQLDelete` + `@FilterDef`로 soft delete 구현
* `@Where`와는 다르게 조건을 선택적으로 적용
* `@SQLDelete`를 사용해 soft delete에 사용될 필드를 업데이트하고, filter를 사용해 조건을 선택적으로 적용하여 삭제되지 않은 데이터를 조회하거나 모든 데이터를 조회하는데 사용
```java
@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE product SET deleted = true WHERE product_id = ?")
@FilterDef(name = "deleteProductFilter", parameters = @ParamDef(name = "deleted", type = Boolean.class))  // or org.hibernate.type.descriptor.java.BooleanJavaType.class
@Filter(name = "deleteProductFilter", condition = "deleted = :isDeleted")
public class Product {
  ...
}

public class ProductService {
  
  @Autowired
  private EntityManager entityManager;

  @Transactional(readOnly = true)
  public Iterable<Product> findAll(boolean isDeleted) {
    var session = entityManager.unwrap(Session.class);
    var filter = session.enableFilter("deleteProductFilter");
    filter.setParameter("isDeleted", isDeleted);
    var list = productRepository.findAll();
    session.disableFilter("deleteProductFilter");
    return list;
  }
}
```


<br>

## JPQL 등을 사용해 명시적인 query로 구현
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
  @Query("""
        SELECT p
        FROM Product p
        WHERE p.productId = :productId
        AND p.deletedAt is null
        """)
  Optional<Product> findByProductId(Long productId);

  @Transactional
  @Modifying
  @Query("""
        UPDATE Product p
        SET p.deletedAt = :#{T(java.time.LocalDateTime).now()}
        WHERE p.productId = :productId
        AND p.deletedAt is null
        """)
  void deleteByProductId(Long productId);
}

public class ProductService {

  @Transactional
  public void delete(long productId) {
    productRepository.findByProductId(productId).orElseThrow(() -> new RuntimeException());
    productRepository.deletdeleteByProductIdeById(productId);
  }
```


<br>

## JPA 활용
* `@SQLDelete`와 JPQL을 직접 사용하는 경우 JPA AuditorAware의 영향을 받지 않기 때문에 Auditor가 필요하다면 아래처럼 entity lifecycle에 따라 동작하도록 구현한다
```java
@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Product {
  ...
  public void delete() {
    this.deleted = true;
  }
}

public class ProductService {
  ...
  @Transactional
  public void delete(long productId) {
    var product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException());
    product.delete();
    productRepository.save(product);
  }
}
```


<br><br>

> #### Reference
> * [How to Implement a Soft Delete with Spring JPA](https://www.baeldung.com/spring-jpa-soft-delete)
