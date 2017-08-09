# [Spring Data Jpa] findOne() vs getOne()
> Spring Data Jpa로 프로젝트를 하던 도중 findOne()을 사용하다가 getOne()를 발견하고 차이점이 궁금해서 찾아보다가 정리해둔다

* `getOne()`
  * lazy loading으로 해당 객체의 reference를 반환

* `findOne()`
  * 즉시 query로 데이터가 없으면 null을 반환

```java
public static String NON_EXISTING_ID = -1;
...
MyEntity findEntity = myEntityRepository.findOne(NON_EXISTING_ID); 
MyEntity getEntity = myEntityRepository.getOne(NON_EXISTING_ID); 

if(findEntity != null) {  
     findEntity.getText(); // findEntity는 null이라 실행되지 않는다
}

if(getEntity != null) {
     getEntity.getText();  // reference가 반환되어 getEntity는 null이 아니라 호출되지만 getText의 return값은 null이다
}
```


> #### 참고 자료
> [When use getOne and findOne methods Spring Data JPA](https://stackoverflow.com/questions/24482117/when-use-getone-and-findone-methods-spring-data-jpa)
