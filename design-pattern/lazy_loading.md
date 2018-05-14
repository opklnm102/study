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

    /**
     * Constructor
     */
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

/**
 * Simple implementation of the lazy loading idiom. However, this is not thread safe.
 */
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

* thread safe version
```java
/**
 * Same as HolderNaive but with added synchronization. This implementation is thread safe, but each
 * {@link #getHeavy()} call costs additional synchronization overhead.
 */
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

* Java8 version
```java
/**
 * This lazy loader is thread safe and more efficient than {@link HolderThreadSafe}. It utilizes
 * Java 8 functional interface {@link Supplier} as {@link Heavy} factory.
 */
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


> #### 참고
> * [java-design-patterns](https://github.com/iluwatar/java-design-patterns/tree/master/lazy-loading)
