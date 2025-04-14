# [Spring Data Jpa] cannot simultaneously fetch multiple bags error
> date - 2018.09.03  
> keyword - spring data jpa, join fetch  
> Spring Data JPA를 사용하다 만난 cannot simultaneously fetch multiple bags error에 대한 해결과정을 정리  

<br>

## Issue










```java
@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", length = 45, nullable = false)
    private String title;

    @OneToMany(mappedBy = "course")
    private List<CourseOption> courseOptions;

    @OneToMany(mappedBy = "course")
    private List<Station> stations;
}

    @Query(value = "select c from Course c join fetch c.courseOptions co join fetch c.stations where co.optionType = 'ROUTE'")
//            "where co.optionType = 'ROUTE'")
    List<Course> findList();


Caused by: org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags: [kr.co.mashup.mapc.entity.Course.courseOptions, kr.co.mashup.mapc.entity.Course.stations]
	at org.hibernate.loader.BasicLoader.postInstantiate(BasicLoader.java:75) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.loader.hql.QueryLoader.<init>(QueryLoader.java:106) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.hql.internal.ast.QueryTranslatorImpl.doCompile(QueryTranslatorImpl.java:210) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.hql.internal.ast.QueryTranslatorImpl.compile(QueryTranslatorImpl.java:141) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.engine.query.spi.HQLQueryPlan.<init>(HQLQueryPlan.java:115) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.engine.query.spi.HQLQueryPlan.<init>(HQLQueryPlan.java:77) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.engine.query.spi.QueryPlanCache.getHQLQueryPlan(QueryPlanCache.java:153) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.internal.AbstractSharedSessionContract.getQueryPlan(AbstractSharedSessionContract.java:553) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	at org.hibernate.internal.AbstractSharedSessionContract.createQuery(AbstractSharedSessionContract.java:662) ~[hibernate-core-5.2.17.Final.jar:5.2.17.Final]
	... 81 common frames omitted

```

https://blog.eyallupu.com/2010/06/hibernate-exception-simultaneously.html


https://vladmihalcea.com/hibernate-facts-multi-level-fetching/






```java

@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", length = 45, nullable = false)
    private String title;

    @OneToMany(mappedBy = "course")
    private Set<CourseOption> courseOptions;

    @OneToMany(mappedBy = "course")
    private List<Station> stations;
}
```

하나만 Set으로 하면 사라짐...
-> 이유는 여기에 나온다..! http://meetup.toast.com/posts/87 



중복 제거는 
https://jojoldu.tistory.com/165
이걸 보고.. 이런거 정리 한번해야...지


