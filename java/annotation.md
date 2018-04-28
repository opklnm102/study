# [Java] Annotation
> Annotation에 대해 정리


## Annotation이란?
* Java5에 추가된 기능
* Class나 Method 위에 붙는다 
* `@`로 시작
* meta 정보를 기술, meta 정보를 프로그래밍에 활용하는 방식
   * @Override, @Deprecated, @SuppressWarning
* 컴파일, 실행될 때 Annotation의 유무나 설정된 값을 통해 클래스가 다르게 실행
   * 일종의 설정파일처럼 설명하기도 한다


### Built-in Annotation
* Java에서 기본으로 제공하는 Annotation
* @Override
   * 메소드 오버라이드 검증
   * 오버라이드가 안되어있으면 컴파일 에러
* @Deprecated
   * 메소드를 사용하지 않게 유도
   * 사용시 컴파일시 경고
* @SuppressWarning
   * 컴파일 경고를 무시
* @FunctionalInterface
   * 메소드가 없거나 2개 이상되면 컴파일 에러


### Meta Annotation
#### @Retention
* 어떤 시점까지 사용할지 선언
* `RetentionPolicy.SOURCE`
   * 컴파일러가 무시
* `RetentionPolicy.CLASS`
   * 기본 동작
   * 컴파일러에 의해 class 파일에 기록
   * runtime시 VM에 보관되지 않는다
* `RetentionPolicy.RUNTIME`
   * 컴파일러에 의해 class 파일에 기록
   * 실행시 VM에 보관
      * reflection으로 정보를 참조할 수 있다

#### @Documented
* 문서에 annotation 정보 표현

#### @Target
* 적용할 위치
* `ElementType.TYPE`
   * Class, interface(annotation 포함), enum 등타입 선언시
* `ElementType.FIELD`
   * 멤버 변수(enum 포함) 선언시
* `ElementType.METHOD`
   * 메소드 선언시
* `ElementType.PARAMETER`
   * 파라티터 선언시
* `ElementType.CONSTRUCTOR`
   * 생성자 선언시
* `ElementType.LOCAL_VARIABLE`
   * 로컬 변수 선언시
* `ElementType.ANNOTATION_TYPE`
   * annotation 선언시
* `ElementType.PACKAGE`
   * 패키지 선언시 
* `ElementType.TYPE_PARAMETER`
   * 파라미터 타입 선언시
* `ElementType.TYPE_USE`
   * 타입 사용시

#### @Inherited
* 상속 가능

#### @Repeatable
* 반복 선언 가능
```java
public enum Role {
    USER, ADMIN;
}

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface MultiAccess {
    Access[] value();
}

// Repeatable 사용 전
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Access {
    Role role() default Role.USER;
}

@MultiAccess(value = {
        @Access(role = Role.USER),
        @Access(role = Role.ADMIN)})
public void repeatable() throws Exception {
}

MultiAccess multiAccess = FeedgetApiApplication.class.getMethod("repeatable")
            .getDeclaredAnnotation(MultiAccess.class);
System.out.println(Arrays.toString(multiAccess.value()));

for (Access access : FeedgetApiApplication.class.getMethod("repeatable")
        .getDeclaredAnnotationsByType(Access.class)) {
    System.out.println(access.role());
}
/*
[@kr.co.mashup.feedgetapi.Access(role=USER), @kr.co.mashup.feedgetapi.Access(role=ADMIN)]
=> 메소드 자체에 @Access를 여러번 사용 불가
*/

// Repeatable 사용 후
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Repeatable(MultiAccess.class)
public @interface Access {
    Role role() default Role.USER;
}

@Access(role = Role.ADMIN)
@Access(role = Role.USER)
public void repeatable() throws Exception {
}

MultiAccess multiAccess = FeedgetApiApplication.class.getMethod("repeatable")
            .getDeclaredAnnotation(MultiAccess.class);
System.out.println(Arrays.toString(multiAccess.value()));

for (Access access : FeedgetApiApplication.class.getMethod("repeatable")
        .getDeclaredAnnotationsByType(Access.class)) {
    System.out.println(access.role());
}

/*
[@kr.co.mashup.feedgetapi.Access(role=ADMIN), @kr.co.mashup.feedgetapi.Access(role=USER)]
ADMIN
USER
=> 메소드 자체에 @Access를 여러번 사용 가능
=> @MultiAccess로 @Access 정보를 가져올 수 있다
*/
```


## 커스텀 어노테이션 이용
### 1. 어노테이션 정의
```Java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Count {

    int value();

    String[] params();

    Type type() default Type.ASCENDING;

    public enum Type { 
        ASCENDING,
        DESCENDING;
    }
}
```

### 2. 어노테이션을 클래스에서 사용(타겟에 적용)
```Java
public class MyHello {
    
    @Count(value = 100, type = Count.Type.ASCENDING, params = "sample")
    public void hello(){
        System.out.println("hello");
    }
}
```

### 3. 어노테이션을 이용하여 실행
```Java
import java.lang.reflect.Method;

public class MyHelloExam {

    public static void main(String[] args) throws Exception {
        MyHello hello = new MyHello();

        Method method = hello.getClass().getDeclaredMethod("hello");
        if(!method.isAnnotationPresent(Count.class)) {
            return;
        }

        Count count = FeedgetApiApplication.class.getMethod("repeatable").getDeclaredAnnotation(Count.class);
        System.out.println(count);
        
        if (count.type() == Count.Type.ASCENDING) {
            for (int i = 0; i < count.value(); i++) {
                System.out.println("hello " + i);
            }
        }
        
        if (count.type() == Count.Type.DESCENDING) {
            for (int i = count.value(); i > 0; i--) {
                System.out.println("hello " + i);
            }
        }    
}
```


> #### 참고
> * [자바 어노테이션](http://jdm.kr/blog/216)
> * [Java 8 Repeating Annotations](https://www.logicbig.com/tutorials/core-java-tutorial/java-8-enhancements/repeating-annotations.html)
