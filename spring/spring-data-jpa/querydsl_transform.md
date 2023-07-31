# [Spring Data Jpa] Querydsl Result aggregation with transform
> date - 2023.07.31  
> keyworkd - jpa, hibernate, querydsl  
> spring data jpa + querydsl에서 transform에 대해 정리  

<br>

## transform + groupBy?
* querydsl에서 query result를 memory에서 원하는 형태로 가공할 떄 사용
* SQL의 group by가 아니라 memory에서 동작하므로 주의

<br>

### Usage
* 다음과 같은 entity가 있을 떄
```java
@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    ...
}
```
```java
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;
    ...
}
```

* category별 product를 조회하기 위해 stream을 사용하여 아래처럼 aggregation하여 category name을 key로 product set을 만든다
```java
public class ProductRepositoryImpl extends QuerydslRepositorySupport implements ProductRepositoryCustom {
  ...
  public Map<String, Set<Product>> findProductsByCategory() {
    var category = QCategory.category;
    var product = QProduct.product;

    return from(product)
          .select(category.name, product)
          .leftJoin(category)
          .on(product.category.eq(category))
          .fetch()
          .stream()
          .collect(Collectors.groupingBy(tuple -> tuple.get(category.name),
                   Collectors.mapping(tuple -> tuple.get(product), Collectors.toSet())));
    }
}
```

* 위 코드를 transform + groupBy를 사용해서 동일한 결과를 얻을 수 있다
```java
public class ProductRepositoryImpl extends QuerydslRepositorySupport implements ProductRepositoryCustom {
    ...
  public Map<String, Set<Product>> findProductsByCategoryWithTransform() {
    var category = QCategory.category;
    var product = QProduct.product;

    return from(product)
          .select(category.name, product)
          .leftJoin(category)
          .on(product.category.eq(category))
          .transform(GroupBy.groupBy(category.name).as(GroupBy.set(product)));
  }
}
```

<br>

### Issue. Spring Boot 3.0에서 'java.lang.Object org.hibernate.ScrollableResults.get(int)' 발생
```java
'java.lang.Object org.hibernate.ScrollableResults.get(int)'
java.lang.NoSuchMethodError: 'java.lang.Object org.hibernate.ScrollableResults.get(int)'
	at com.querydsl.jpa.ScrollableResultsIterator.next(ScrollableResultsIterator.java:70)
	at com.querydsl.core.group.GroupByMap.transform(GroupByMap.java:57)
	at com.querydsl.core.group.GroupByMap.transform(GroupByMap.java:35)
	at com.querydsl.core.support.FetchableQueryBase.transform(FetchableQueryBase.java:55)
    ...
```

* 아래와 같이 설정을 추가
```java
@Configuration
public class JpaConfiguration {

    @Bean
    public JPAQueryFactory jpaQueryFactory(EntityManager entityManager) {
        return new JPAQueryFactory(JPQLTemplates.DEFAULT, entityManager);
    }
}
```

* QuerydslRepositorySupport를 제외하고 직접 `JPAQueryFactory`를 사용
```java
public class ProductRepositoryImpl implements ProductRepositoryCustom {

  private final JPAQueryFactory jpaQueryFactory;

  public ProductRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
    this.jpaQueryFactory = jpaQueryFactory;
  }

  public Map<String, Set<Product>> findProductsByCategory() {
    var category = QCategory.category;
    var product = QProduct.product;

    return jpaQueryFactory.from(product)
                .select(category.name, product)
                .leftJoin(category)
                .on(product.category.eq(category))
                .transform(GroupBy.groupBy(category.name).as(GroupBy.set(product)));
    }
}
```

<br><br>

> #### Reference
> * [Result aggregation - Querydsl Docs](http://querydsl.com/static/querydsl/latest/reference/html_single/#d0e2263)
> * [java.lang.NoSuchMethodError: 'java.lang.Object org.hibernate.ScrollableResults.get(int)' with Hibernate 6.1.5.Final #3428](https://github.com/querydsl/querydsl/issues/3428)
