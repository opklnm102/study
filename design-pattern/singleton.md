# [Design Pattern] Singleton Pattern
> 오직 하나의 객체만 생성되도록 하는 Singleton Pattern에 대해 정리해보고자 함





## Singleton 생성 방법

### Eager initialzation
* 기본적인 방법
```java
public class Singleton {
    private static Singleton instance = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return instance;
    }
}
```
#### Pros
* class loader에 의한 loading, initialization은 thread-safe

#### Cons
* 사용 여부에 관계 없이 class loading 시점에 생성되기 때문에 memory 비효율적

<br>

### Lazy initialzation
```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```
#### Pros
* 필요시 생성하므로 memory 효율적

#### Cons
* non thread-safe

<br>

### Thread safe lazy initialzation
```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {}

    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```
#### Pros
* `synchronized`를 사용하여 thread-safe

#### Cons
* `synchronized`로 인한 성능 저하

<br>

### DCL(Double Checked Locking)
* thread-safe를 위한 synchronized의 성능 저하를 보완한 버전
* brkoen idiom으로 사용 X
```java
public class Singleton {
    private volatile static Singleton instance;
    
    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized(Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }    
        return instance;
    }
}
```

<br>

### Enum initialization
* `enum`이 한번만 초기화되는 것을 이용
```java
public enum Singleton {
    INSTANCE;

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```
#### Pros
* reflection을 통한 객체 생성 불가
* serialization 보장

#### Cons
* runtime의 context를 알 수 없으므로 메소드 호출시 context를 전달하는 overhead가 발생할 수 있다

<br>

### Initialzation on demand holder idiom
```java
public class Singleton {
    private Singleton() {}

    public static Singleton getInstance() {
        return LazyHolder.INSTANCE;
    }

    private static class LazyHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
}
```

#### Pros
* Singleton에 LazyHolder 변수가 없기 때문에 Singleton class loading시 LazyHolder를 초기화하지 않는다
* class loader에 의한 loading, initialization은 thread-safe
* LazyHolder의 instance는 static이므로 class loading시 1번만 호출

#### Cons
* reflection을 이용한 내부 생성자 호출 가능
* deserialization 발생시마다 새로운 객체 생성







> #### 참고
> * Head First Design Patterns





http://jeong-pro.tistory.com/86
http://asfirstalways.tistory.com/335
http://mkil.tistory.com/199

https://blog.seotory.com/post/2016/03/java-singleton-pattern
http://www.mimul.com/pebble/default/2013/05/27/1369640835148.html

https://github.com/iluwatar/java-design-patterns/tree/master/singleton
