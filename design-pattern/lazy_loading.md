# [Design Pattern] Lazy Loading Pattern
> 실제로 사용하는 시점에 객체를 생성하는 Lazy Loading Pattern에 대해 정리  
> Idiom, Performance

## Lazy Loading이란?
* 필요할 떄까지 객체 초기화를 지연시키는데 일반적으로 사용되는 디자인 패턴
* 즉시 로딩으로 초기화한 객체가 전혀 필요하지 않을 때 사용하면 비용 효율적이다

### Real world examples
* JPA annotations @OneToOne, @OneToMany, @ManyToOne, @ManyToMany and fetch = FetchType.LAZY

---

## Example

![Lazy Loading](https://github.com/opklnm102/study/blob/master/design-pattern/images/lazy_loading.png)

```java
/**
 * Heavy objects are expensive to create.
 */
public class Heavy {
    
    public Heavy() {
        System.out.println("Creating Heavy ...");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            System.out.println("Exception caught.");
        }
        System.out.println("... Heavy created");
    }
}
```

### Naive Lazy Loading
```java
public class HolderNaive {

    private Heavy heavy;

    public HolderNaive() {
        System.out.println("HolderNaive created");
    }

    public Heavy getHeavy() {
        if(heavy == null) {
            heavy = new Heavy();
        }
        return heavy;
    }
}
```
* not thread safe


### Thread Safe Lazy Loading
```java
public class HolderThreadSafe {

    private Heavy heavy;

    public HolderThreadSafe() {
        System.out.println("HolderThreadSafe created");
    }

    public synchronized Heavy getHeavy() {
        if(heavy == null) {
            heavy = new Heavy();
        }
        return heavy;
    }
}
```
* thread safe 보장
* getHeavy() 호출시 마다 `synchronized`로 인한 overhead 발생


### Java8 version
```java
public class Java8Holder {

    private Supplier<Heavy> heavy = () -> createAndCacheHeavy();

    public Java8Holder() {
        System.out.println("Java8Holder created");
    }

    public Heavy getHeavy() {
        return heavy.get();
    }

    private synchronized Heavy createAndCacheHeavy() {
        class HeavyFactory implements Supplier<Heavy> {

            private final Heavy heavyInstance = new Heavy();

            @Override
            public Heavy get() {
                return heavyInstance;
            }
        }
        if (!HeavyFactory.class.isInstance(heavy)) {
            heavy = new HeavyFactory();
        }
        return heavy.get();
    }
}
```
* thread safe 보장
* `Thread Safe Lazy Loading`보다 효율적


> #### 참고
> * [java-design-patterns](https://github.com/iluwatar/java-design-patterns/tree/master/lazy-loading)
