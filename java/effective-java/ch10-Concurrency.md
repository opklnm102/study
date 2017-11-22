# Ch10. Concurrency
> Effective Java를 읽으며 공부했던 내용을 정리한다
> thread는 여러 작업을 동시적으로 처리할 수 있게 해준다  
> concurrency를 지원하는 프로그램을 작성하는데 도움이 되는 내용을 정리  


* [66. Synchronize access to shared mutable data](#규칙-66-synchronize-access-to-shared-mutable-data)
* [67. Avoid excessive synchronization](#규칙-67-avoid-excessive-synchronization)
* [68. Prefer executors and tasks to threads](#규칙-68-prefer-executors-and-tasks-to-threads)
* [69. Prefer concurrency utilities to wait and notify](#규칙-69-prefer-concurrency-utilities-to-wait-and-notify)
* [70. Document thread safety](#규칙-70-document-thread-safety)
* [71. Use lazy initialization judiciously](#규칙-71-use-lazy-initialization-judiciously)
* [72. Don't depend on the thread scheduler](#규칙-72-dont-depend-on-the-thread-scheduler)
* [73. Avoid thread groups](#규칙-73-avoid-thread-groups)


## 규칙 66. Synchronize access to shared mutable data
> 공유하는 가변 데이터에 접근시 동기화하자

### 동기화 - synchronized
* 하나의 thread만이 메소드나 블록을 실행하게 할 수 있다
* 불안정 상태의 객체를 thread가 볼 수 없도록 한다
   * 객체는 안정 상태에서 생성되고, 접근하는 메소드에 의해 `lock`이 걸린다
* 동기화된 메소드나 블록에 진입하는 각 thread가 모든 변경(같은 lock으로 보호되었던)이 반영된 결과를 볼 수 있게 해준다
   * 객체의 상태를 보면서 필요시 state transition(다른 안정상태로 바꾸는)를 일으킨다
   * 동기화를 하지 않으면, 변경한 내용을 다른 thread에서 못 볼 수 있다
* long, double이 아닌 타입의 변수를 R/W할 때 atomicity(원자성)을 보장한다
   * 동기화를 하지 않더라도 수정된 값을 그때그때 읽을 수 있다 -> 그러나 완전히 보장하지는 않는다
* 동기화는 `상호배타, thread 간의 신뢰성 있는 변수 값 전달`에 필요

> 상호 배타
> 하나의 thread가 객체를 변경하는 동안 다른 thread에서 불안정한 상태의 그 객체를 볼 수 없도록 하는 방법


### Thread.stop()을 사용하지 말자
* 데이터 손실 가능성이 있기 때문
* atomic boolean 필드 사용 추천
```java
// 문제가 있다 - 얼마 동안 실행될까?
public class StopThread {
    private static boolean stopRequested;

    public static void main(String[] args) throws InterruptedException {
        Thread backgroundThread = new Thread(new Runnable() {
            public void run() {
                int i = 0;
                while(!stopRequested)  // 무한 루프...
                    i++;
            }
        });
        backgroundThread.start();

        TimeUnit.SECONDS.sleep(1);
        stopRequested = true;
    }
}
```
* 동기화가 안되어 있으므로 JVM에서 최적화할 가능성이 높다
   * `hoisting`
```java
// before
while(!done)
    i++;

// after
if(!done)
    while(true)
        i++;
```

#### 개선
* atomic boolean 필드 동기화
* `read, write 메소드 모두 동기화`되어야만 동기화 효과 발생
```java
public class StopThread {

    private static boolean stopRequested;

    private static synchronized void requestStop() {
        stopRequested = true;
    }

    private static synchronized boolean stopRequested() {
        return stopRequested;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread backgroundThread = new Thread(new Runnable() {
            public void run() {
                int i = 0;
                while(!stopRequested())
                    i++;
            }
        });
        backgroundThread.start();
        TimeUnit.SECONDS.sleep(1);
        requestStop();
    }
}
```

#### 더 좋은 방법 - volatile
* 동기화 비용 없이 적은 코드로 성능이 좋은 방법
* 상호 배타를 수행하진 않지만, 가장 최근 값을 읽는다
```java
public class StopThread {
    private static volatile boolean stopRequested;

    public static void main(String args) throws InterruptedException {
        Thread backgroundThread = new Thread(new Runnable() {
            public void run() {
                int i = 0;
                while(!stopRequested)
                    i++;
            }
        });
        backgroundThread.start();
        TimeUnit.SECONDS.sleep(1);
        stopRequested = true;
    }
}
```

### 증가하는 숫자의 경우
```java
// 동기화 필요...!
private static volatile int nextSerialNumber = 0;

public static int generateSerialNumber() {
    return nextSerialNumber++;
}
```
* 하나의 thread가 값을 읽고 증가시키는 사이, 다른 therad가 기존 값을 읽을 수 있다 -> `safety failure(안전 실패)`
* 해결 방법
   * 메소드에 synchronized 추가, volatile 제거, long 사용
   * AtomicLong 사용
      * 동기화하는 것보다 성능이 좋다

```java
private static final AtomicLong nextSerialNum = new AtomicLong();

public static long generateSerialNumber() {
    return nextSerialNum.getAndIncrement();
}
```

### 가변 데이터의 사용은 단일 Thread로 제한하자
* 가변 데이터를 여러 Thread에서 공유하면서 발생하는 동기화 이슈를 피할 수 있다
* 가변 데이터 대신 불변 데이터를 공유
* 객체 참조를 공유하는 행위만 동기화하면서 다른 Thread와 객체 참조를 공유
   * 그런 객체를 `effectively immutable(효율적인 가변 객체)`라 한다
   * 그런 객체 참조를 thread로 전달하는 것을 `safe publication(안전 출판)`이라 한다


### 정리
* 여러 Thread가 가변 데이터를 공유할 때, 데이터를 R/W하는 Thread에서는 반드시 동기화를 해야 한다
   * 변경한 값을 다른 Thread가 볼 수 있다는 것을 보장하기 위해
* Thread간 상호 배타처리 없이 값 전달만 필요하다면 `volatile` 사용



## 규칙 67. Avoid excessive synchronization
> 지나친 동기화는 피하자


### 지나친 동기화
* 성능 저하
* deadlock(교착 상태) 유발


### 동기화된 메소드나 블록 안에서 절대로 클라이언트에게 제어권을 넘기지 말자
* inveness failure, safety failure가 생길 수 있다
* 오버라이딩된 메소드, 함수 객체의 형태로 클라이언트가 전달하는 메소드 호출 X
```java
// Observer 패턴
public class ObservableSet<E> extends ForwardingSet<E> {
    public ObservableSet(Set<E> set) {
        super(set);
    }

    private final List<SetObserver<E>> observers = new ArrayList<>();

    public void addObserver(SetObserver<E> observer) {
        synchronized(observers) {
            observers.add(observer);
        }
    }

    public boolean removeObserver(SetObserver<E> observer) {
        synchronized(observers) {
            return observers.remove(observer);

        }
    }

    private void notifyElementAdded(E element) {
        synchronized(observers) {
            for(SetObserver<E> observer : observers)
                observer.added(this, element);
        }
    }

    @Override
    public boolean add(E element) {
        boolean added = super.add(element);
        if(added)
            notifyElementAdded(element);
        return added;
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        boolean result = false;
        for(E element : c)
            result = add(element);  // notifyElementAdded를 호출
        return result;
    }
}

// observers는 addObserver()로 통지를 구독, removeObserver()로 구독을 해지
// 모든 경우 callback 호출
public interface SetObserver<E> {
    void added(ObservableSet<E> set, E element);
}

// 0 ~ 99까지 출력
public static void main(String[] args) {
    ObservableSet<Integer> set = new ObservableSet<>(new HashSet<Integer>());

    set.addObserver(new SetObserver<Integer>() {
        public void added(ObservableSet<Integer> s, Integer e) {
            System.out.println(e);
            if(e == 23) {
                // add() -> notifyElementAdded()도중 removeObserver() 호출
                // 같은 thread의 동기화는 되지 않는다
                s.removeObserver(this);  // ConcurrentModificationException
                
            }
        }
    });

    for(int i=0; i<100; i++)
        set.add(i);
}
```

* executor 서비스를 사용하는 observer
```java
set.addObserver(new SetObserver<Integer>() {
    public void added(final ObservableSet<Integer> s, Integer e) {
        System.out.println(e);
        if(e == 23) {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            final SetObserver<Integer> observer = this;
            try {
                executor.submit(new Runnable() {
                    public void run() {
                        s.removeObserver(observer);
                    }
                }).get();
            } catch(ExecutionException e) {
                throw new AssertionError(e.getCause());
            } catch(InterruptedException e) {
                throw new AssertionError(e.getCause());
            } finally {
                executor.shutdown();
            }
        }
    }
});
```
* 예외가 생기지 않고 deadlock에 빠진다
* background thread가 s.removeObserver() 호출하면서 observers에 lock을 걸려고 하는데 main thread가 lock을 가지고 있어서 기다린다
* main thread는 background thread가 observer의 삭제 완료를 기다리고 있다

#### 개선 - 외계인 메소드 호출을 동기화된 블록 밖으로 이동
* open call(개방 호출)
* ConcurrentModificationException과 deadlock 해결
```java
private void notifyElementAdded(E element) {
    List<SetObserver<E>> snapshot = null;
    synchronized(observers) {
        snapshot = new ArrayList<>(observers);
    }
    for(SetObserver<E> observer : snapshot)
        observer.added(this, element);
}
```

#### 더 좋은 방법 - CopyOnWriterArrayList
* 내부 배열 전체에 대한 복사본을 만들어 쓰기 처리를 수행
* 내부 배열의 변경이 없기 때문에 `lock이 필요 없어` 처리 속도가 빠르다
* `List 요소의 변경이 거의 없고, 전체 요소의 순환이 빈번한` 경우 사용
```java
// 명시적으로 동기화를 하지 않는다
ObservableSet private final List<SetObserver<E>> observers = new CopyOnWriterArrayList<>();

public void addObserver(SetObserver<E> observer) {
    observers.add(observer);
}

public boolean removeObserver(SetObserver<E> observer) {
    return observers.remove(observer);
}

private void notifyElementAdded(E element) {
    for(SetObserver<E> observer : observers) {
        observer.added(this, element);
    }
}
```


### 동기화된 블록에서는 적은 양의 일을 처리
* lock 획득 -> 공유 데이터 조사 -> 필요시 데이터 반환 -> lock 해제
* 많은 양의 처리는 동기화된 블록 밖으로 이동시키자



### 성능
* 멀티 코어 CPU가 보편화되면서 lock을 획득하는데 소요되는 시간은 지나친 동기화에 들어가는 실제 비용이 아닌 시대

#### 동기화 비용
* 병렬처리의 기회 상실, 모든 코어가 메모리의 일치된 뷰를 가져야 한다는 요구에 따른 지연 등이 지나친 동기화의 실제 비용
* 과도한 동기화 코드로 인해 VM의 코드 최적화 능력 제한

#### 동기화
* 동시적인 사용이 필요하고, 내부적으로 동기화를 함으로써 외부적으로(클라이언트) 객체 전체에 lock을 사용하는 것보다 훨씬 더 높은 동기성을 성취하려면, thread에 안전한 가변 클래스를 만들어야 한다
* 그렇지 않다면 외부적으로 동기화하게 하자
* StringBuffer는 내부적으로 동기화 -> 그러나 대부분 single thread에서 사용되었고..
   * StringBuilder(동기화되지 않은 StringBuffer)로 교체된 이유
* 어떻게 할지 망설여 진다면 클래스를 동기화하지 말고 thread safe하지 않음을 문서화


#### 내부적으로 동기화한다면, 높은 동시성을 성취하기 위해 다양한 방법 사용
* lock splitting(락 분할)
* lock striping(락 스트라이핑)
* nonblocking concurrency control(비차단 동시성 제어)
* ...


#### 메소드에서 static 필드를 변경한다면 필드에 대한 접근을 반드시 동기화
* single thread에서만 사용되더라도..
* 외부적으로 동기화하는 것이 불가능하기 때문
* ex. generateSerialNumber()


### 정리
* `synchronized` 블록에서 외계인 메소드를 호출하지 말자
   * deadlock, 데이터 손상 방지를 위해
* `synchronized` 블록에서는 작은 양의 일을 하자
* 가변 클래스 설계시 자체적으로 동기화가 필요한지 고려
* 지나친 동기화는 피하자
* 타당한 이유가 있을 때 클래스 내부적으로 동기화하고 문서화



## 규칙 68. Prefer executors and tasks to threads
> 스레드에 대해서는 executor와 tasks를 사용하자

* 기본적인 추상 개념은 thread(일의 단위 + 실행하는 메커니즘)가 아니라 `task와 executor service`
* task의 종류
   * `Runnable` - 값 반환 X
   * `Callable` - 값 반환 O
* task를 실행하는 메커니즘이 `executor service`


### 작업 큐
```java
// 작업 큐 생성
ExecutorService executor = Executors.newSingleThreadExecutor();

// runnable 실행
executor.execute(runnable);

// 종료
executor.shutdown();
```
* `invokeAny()`, `invokeAll()`
   * 특정 작업이 완료되기를 대기할 수 있다
* `awaitTermination()`
   * ExecutorService의 종료가 완료되기를 기다릴 수 있다
* `ExecutorCompletionService`
   * 작업이 하나씩 끝나는대로 결과를 받을 수 있다
    

### 멀티 스레드 작업 큐
* `Executors`의 ThreadPool을 생성하는 static 메소드 이용
* `Executors.newCachedThreadPool()`
   * 작은 규모의 가벼운(실행되는 thread의 수가 적은) 경우 선택
   * 별도 구성 없이 무난하게 실행된다
   * 작업이 큐로 관리되지 않고 thread로 넘겨져 실행
   * 가용할 thread가 없으면 새로운 thread 생성
      * 순간 부하가 올 경우 thread를 계속 생성하게 됨...
      * newFixedThreadPool()는 생성되는 thread 수를 제한할 수 있다
* `Executors.newFixedThreadPool()`
   * 실행되는 thread의 수가 많은 경우 선택
   * 정해진 수의 thread를 가지는 pool을 제공
* `Executors.newScheduledThreadPool()`
   * java.util.Timer를 대체
   * Timer보다 유연성이 더 좋다



## 규칙 69. Prefer concurrency utilities to wait and notify
> wait와 notify 대신 동시성 유틸리티를 사용하자

* wait, notify를 올바르게 사용하기 어렵다면, 고수준 동시성 유틸리티를 사용해야 한다

### java.util.concurrnet의 구성
* Executor Framework
* 동시적 컬렉션
* synchronizer


### 동시적 컬렉션
* List, Queue, Map 등 표준 컬렉션 인터페이스를 고성능의 동시적 구현체로 제공
* 내부적으로 동기화
* 동시적 컬렉션으로부터 동시성 관련 활동을 제외하는 것은 불가능하므로, 컬렉션이 갖게 될 lock은 효과가 없고, 프로그램만 느리게 한다
* 기본 연산을 단일의 원자 연산으로 결합하는 state dependent modify operation으로 확장
   * `ConcurrentMap.putIfAbsent(key, valule)`
* 특별한 이유가 없는 한, `외부적으로 동기화되는 컬렉션보다 동시적 컬렉션을 사용`하자
   * 성능이 놀랄만큼 향상된다
   * Collections.synchronizedMap, Hashtable -> `ConcurrentHashMap`

#### ConcurrentMap으로 thread safe한 Map 구현
```java
// ConcurrentMap 기반의 동시적 정규 Map
private static final ConcurrentMap<String, String> map = new ConcurrentHashMap<>();

public static String intern(String s) {
    String previousValue = map.putIfAbsent(s, s);
    return previousValue == null ? s : previousValue;
}
```

#### 개선
* ConcurrentHashMap은 get()과 같은 검색 연산에 최적화
* 필요할 때만 `putIfAbsent()` 호출
```java
public static String intern(String s) {
    String result = map.get(s);
    if(result == null) {
        result = map.putIfAbsent(s, s);
        if(result == null)
            result = s;
    }
    return result;
}
```


### blocking operation
* 성공적으로 수행될 수 있을 때까지 대기하는 방식
* 컬렉션 인터페이스 중 일부는 blocking operation으로 확장
   
#### BlockingQueue
* Queue를 확장하여 `take()` 등을 추가
   * `take()` - 큐의 맨 위 요소를 꺼내어 반환, 큐가 비어 있다면 대기
* `producer-consumer queue`라고도 알려진 `work queue`(작업 큐)로 사용
* producer-consumer queue
   * 하나 이상의 소비자 thread는 큐로부터 요소를 꺼내어, 작업이 가능할 때 처리하고, 그렇지 않으면 대기
* ThreadPoolExecutor 등의 ExecutorService 구현체들이 사용


### Synchronizer
thread가 다른 thread를 대기시킬 수 있게 해주는 객체
thread 간의 활동을 조정할 수 있게 해준다
`CountDownLatch, Semaphore` - 가장 많이 사용
`CyclicBarrier, Exchanger` - 가장 적게 사용


#### CountDownLatch
* 하나 이상의 therad가 하나 이상의 다른 thraed(일을 하고 있는)를 대기시킬 수 있게 해준다
* 생성자에서는 대기 중인 thread가 작업을 진행할 수 있기 전까지 countDown()을 몇번 호출해야하는지를 인자로 받는다
```java
/**
 * Constructs a {@code CountDownLatch} initialized with the given count.
 *
 * @param count the number of times {@link #countDown} must be invoked
 *        before threads can pass through {@link #await}
 * @throws IllegalArgumentException if {@code count} is negative
 */
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");
    this.sync = new Sync(count);
}
```

* wait(), notify()를 기반으로 구현하면 번거로운 일을 간단하게 해결
```java
// 동시적 실행의 시간을 재는 메소드
// executor - thread starvation deadlock을 피하기 위해 concurrency만큼 therad를 생성해줘야 한다
public static long time(Executor executor, int concurrency, final Runnalbe action) throws InterruptedException {
    final CountDownLatch ready = new CountDownLatch(concurrency);
    final CountDownLatch start = new CountDownLatch(1);
    final CountDownLatch done = new CountDownLatch(concurrency);
    for(int i=0; i<concurrency; i++) {
        executor.execute(new Runnable() {
            public void run() {
                ready.countDown();  // 준비 OK를 타이머에게 알림
                try {
                    start.await();  // 준비 완료를 기다린다
                    action.run();
                } catch(InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();  // 끝났음을 타이머에게 알림
                }
            }
        });
    }
    ready.await();  // 모든 worker thread가 준비될 때까지 기다린다
    long startNanos = System.nanoTime();
    start.countDown();  // 동작 시킨다
    done.await();  // 모든 worker thread가 끝날 때까지 기다린다
    return System.nanoTime() - startNanos;
}
```

> #### System.nanoTime()
> * 시간 간격을 잴 때는 System.currentTimeMillis() 대신 `System.nanoTime()` 사용
> * 더 정확하고 정밀하다
> * 시스템의 리얼타임 클럭을 조정해도 영향을 받지 않는다



### wait(), notify()를 사용할 경우

#### wait()
```java
// wait() 사용을 위한 표준 이디엄
synchronized(obj) {
    while(<대기 상태를 벗어날 조건을 만족하지 않으면>)  // wait() 호출 전에 notify()가 호출될 경우를 대비하여 필요 -> 없다면 항상 깨어난다는 보장이 없다
        obj.wait();  // 객체의 lock을 해제하고, 깨어주기를 기다린다

    ...
}
```
* 특정 상황에서 thread가 대기하도록 하는데 사용
* 동기화된 영역 내부에서 호출
* 항상 wait loop 이디엄을 사용해서 wait()를 호출
   * 절대 loop 밖에서 호출하지 않는다
   * loop는 대기 전과 후의 조건을 검사하는데 사용



### 정리
* wait(), notify()를 직접 사용하는 것은 java.util.concurrent에서 제공하는 것에 비해 `동시성 어셈블리 언어`로 코딩하는 것과 같다
   * 새로 작성하는 코드에는 가급적 사용하지 말자
* 사용해야한다면 wait loop 표준 이디엄을 사용
* notify()보다는 notifyAll() 사용
   * notify()를 사용한다면 thread 활동성이 보장되도록 주의할 것



## 규칙 70. Document thread safety
> 스레드 안전을 문서화 하자

* 자신의 인스턴스나 static method를 동시적으로 사용해야 하는 클래스의 경우 문서화를 하지 않으면 `불충분한 동기화`, `과도한 동기화`를 하게되어 심각한 에러를 유발
* javadoc는 `synchronized`를 문서화하지 않는다
   * 상세 구현부분이지 외부로 제공되는 API는 아니다
   * thread에 안전하다는 것을 나타내는 것도 아니다
* concurrency를 안전하게 하려면, 해당 클래스가 어떤 수준의 thread safe를 지원하는지 명확하제 문서화해야 한다

### thread 안전 수준
* immutable
   * 클래스의 인스턴스는 `상수`
   * `외부 동기화가 필요 없다`
   * String, Long, BigInteger 등
* unconditionally thread-safe
   * 클래스의 인스턴스는 `가변적`
   * `외부 동기화 없이 동시적으로 사용`할 수 있을만큼 내부 동기화를 하고 있다
   * Random, ConcurrentHashMap 등
* conditionally thread-safe
   * unconditionally thread-safe와 같으나, 안전한 동시성을 위해 `일부 메소드에서 외부 동기화를 필요`로 한다
   * Collections.synchronized wrapper 메소드들이 반환하는 컬렉션들이 해당
* not thread-safe
   * 클래스의 인스턴스는 `가변적`
   * 메소드 호출시 `외부 동기화 필요`
   * 범용 Collection(ArrayList, HashMap) 등 
* thread hostile
   * 외부 동기화를 하더라도 `동시성에 대해 안전하지 않다`
   * 동기화하지 않고 static 데이터를 변경하면 thread hostile 초래


#### conditionally thread-safe에 대해 문서화할 경우
* 메소드 호출을 `어떤 순서로 할 때 외부 동기화가 필요`하고, 그런 순서로 메소드를 실행할 때 `어떤 lock을 획득해야 하는지` 나타내야 한다
* 일반적으로는 인스턴스 자신의 lock이지만 예외적인 경우 존재
   * 어떤 객체가 다른 객체의 view를 나타낸다면, view를 지원하는 객체를 동기화

```java
// Collections.synchronizedMap
Map<K, V> m = Collections.synchronizedMap(new HashMap<>());
...
Set<K> s = m.keySet();  // synchronized 블록에서는 필요 없다
...
synchronized(m) {  // view 객체인 m을 동기화
    for(K key : s)
        key.f();
}
```


### private lock object
```java
private final Object lock = new Object();  // 부주의한 변경을 위한 final

public void foo() {
    synchronized(lock) {
        ...
    }
}
```
* public lock을 사용하는 클래스에서는 클라이언트가 순차적인 메소드 호출을 자동으로 실행할 수 있게 해줄 수 있지만 비용이 따른다
   * ConcurrentCollection(ConcurrentHashMap, ConcurrentLinkedQueue...)들이 사용하는 고성능 내부 동시성 제어와 호환 X
   * 클라이언트가 lock을 오랜 기간 동안 잡고 있으면 denial of service attack 가능
   * 방지하기 위해 `private lock object` 사용
`unconditionally thread-safe`에서만 사용
`conditionally thread-safe`에서는 사용할 수 없다
   * 메소드 호출시 어떤 lock을 획득해야 하는지 문서화 필요하므로
* 상속을 위한 클래스에 적절
   * 자신의 인스턴스를 lock으로 사용하면 서로 방해할 수 있기 때문


### 정리
* 모든 클래스는 thread safe를 문서화
* conditionally thread-safe
   * 메소드 호출 순서에 따른 동기화 문서화
   * 그에 따른 lock 획득도 문서화
* unconditionally thread-safe
   * 동기화된 메소드 대신 private lock object 사용 고려
   * 외부에서 동기화를 방해할 수 없다
   * 향후 동시성 제어를 위한 방법 선택에 있어 유연성 확보



## 규칙 71. Use lazy initialization judiciously
> 늦 초기화를 분별력 있게 사용하자

### lazy initialzation
* 필드의 값이 필요하게 될 때까지 `초기화를 늦추는 것`
* 값이 필요 없다면 초기화되지 않는다
* `필요하지 않으면 하지 말자`
   * 양날의 검
   * 클래스 초기화, 인스턴스 생성 비용은 감소되지만, 늦게 초기화되는 필드의 접근 비용을 증가
   * 다른 최적화처럼 성능을 저하시킬 수 있다
* 어떤 필드가 인스턴스의 일부로만 사용되고, 초기화 비용이 많이 든다면 좋을 수 있다
   * 전후의 성능을 측정하자


### multi thread의 lazy initialzation
* lazy initialzation되는 필드를 공유한다면 `동기화`가 중요
* 대부분의 상황에서는 정상적인 초기화가 lazy initialzation보다 좋다
```java
// 정상적인 초기화
private final FieldType field = computeFieldValue();
```

* 초기화 순환성을 막기 위해 lazy initialzation 사용한다면, `synchronized` 사용
```java
private FieldType field;

synchronized FieldType getField() {
    if(field == null) {
        field = computeFieldValue();
    }
    return field;
}
```


### lazy initialization holder class idiom
* `static 필드의 성능을 고려`해 lazy initialization를 사용할 때 사용하는 idiom
* initializeondemand holder class idiom라고도 함
* `사용되는 시점에 초기화`
```java
private static class FieldHolder {
    static final FieldType field = computeFieldValue();
}

// getter를 동기화하지 않아 필드 접근 비용밖에 없다
static FieldType getField() {  
    return FieldHolder.field;
}
```

### double check idiom
* 인스턴스 필드의 성능을 고려할 경우 사용
* 초기화된 후 사용될 `lock 비용 발생`을 막는다
```java
// 필드가 초기화되었다면 lock을 걸지 않으므로 volatile 선언 중요
private volatile FieldType field;  

FieldType getField() {
    FieldType result = field;  // 필드가 초기화되었을 경우 1번만 읽게 해주는 용도
    if(result == null) {  // 1번째 검사(lock X)
        synchronized(this) {
            result = field;
            if(result == null) {  // 2번째 검사(lock O)
                field = result = computeFieldValue();
            }
        }
    }
    return result;
}
```
* static 필드에도 적용할 수 있지만 `lazy initialization holder class`가 더 좋은 선택

### single check idiom
* 반복적인 초기화를 해도 괜찮은 인스턴스 필드를 lazy initialization
```java
private volatile FieldType field;

private FieldType getField() {
    FieldType result = field;
    if(result == null) {
        field = result = computeFieldValue();
    }
    return result;
}
```

### racy single check idiom
* 초기화하려는 필드가 long, double일 경우 `single check` idiom에서  volatile을 제거한 것
* 일부 아키텍처에서 필드 접근 속도를 빠르게 한다
   * 대신 추가적인(필드에 접근하는 thread당 1번까지) 초기화 필요
* String이 `hashCode를 캐싱`할 때 사용


### 정리
* 대부분의 필드는 정상적인 초기화
* 원하는 수준의 성능 향상을 위해 lazy initialization한다면 적합한 방법을 사용하자
   * 인스턴스 필드 - `double check`
   * static 필드 - `lazy initialization holder`
   * 반복 초기화해도 괜찮은 인스턴스 필드 - `single check`



## 규칙 72. Don't depend on the thread scheduler
> 스레드 스케쥴러에 의존하지 말자

* 많은 thread가 runnable 상태일 때는 어떤 thread를 실행시킬 것인지, 얼마동안 실행시킬 것인지를 `thread scheduler`가 결정
* 정확성이나 성능을 thread scheduler에 의존하면 이식성 저하


### 강력하고, 응답성이 좋고, 이식성이 있는 프로그램을 작성하는 가장 좋은 방법
* `runnable thread < process`
* runnable(대기가 아닌) 상태의 평균 thread 개수가 프로세서의 개수보다 그리 크지 않게 하는 것
* thread scheduler는 여지 없이 runnable 상태의 thread들을 그냥 실행시킬 것


### runnable 상태의 therad 개수를 줄이는 주된 방법
* thread가 `일을 한 후 더 오래 대기`하도록 하는 것
* thread가 유용한 일을 하고 있지 않다면 실행하지 않도록 해야 한다
* Executor Framework 관점에서 보자면...
   * thread pool을 적합하게 만드는 것
   * thread가 수행하는 작업이 작으면서 독립적으로 유지
      * 너무 작으면 context switching에 따른 부담으로 성능 저하


### thread는 busy-wait 상태에 빠지면 안된다
* busy-wait
   * 공유되는 객체에 변동사항이 없는지 `반복적으로 확인하면서 기다리는 상태`
* application thread scheduler에 영향을 받고
* 프로세서의 부하 증가
* 다른 thread가 할 수 있는 유용한 일의 양 감소
```java
// busy-wait가 끊임 없이 이어진다
public class SlowCountDownLatch {

    private int count;
    
    public SlowCountDownLatch(int count) {
        if(count < 0) {
            throw new IllegalArgumentException(count + " < 0");
        }
        this.count = count;
    }

    public void await() {
        while(true) {
            synchronized(this) {
                if(count == 0) return;
            }
        }
    }

    public synchronized void countDown() {
        if(count != 0)
            count--;
    }
}
```


### 일부 thread가 다른 thread에 비해 상대적으로 충분한 CPU 시간을 얻지 못하는 경우
* `Thread.yield()`로 해결하려고 하면 안된다
   * JVM마다 성능 향상, 저하를 일으킬 수 있다
* `동시적으로 실행 가능한 thread 개수를 줄이도록` application을 재구성하는게 더 좋은 방법
* thread priority 조정
    * 가장 이식성이 떨어지는 것 중 하나


### 동시성 테스트를 할 경우
* `Thread.sleep(1)` 사용
* `Thread.sleep(0)` -> 제어권이 곧바로 돌아오므로 사용 X


### 정리
* appication의 정확성을 thread scheduler에 의존하지 말자
   * 이식성이 떨어진다
* `Thread.yield()`나 `thread priority`에 의존하지 말자
* `thread priority`은 이미 동작 중인 application의 서비스 질을 높이는데 사용
   * 동작하지 않는 application을 고치기 위해 사용 X



## 규칙 73. Avoid thread groups
> 스레드 그룹을 사용하지 말자

### thread group
* thread, lock, monitor에 더하여 thread 시스템에서 제공하는 기본 추상체
* 보안을 목적으로 애플릿을 격리시키는 메커니즘으로 구상
* 보안의 중요성이 쇠약해짐
* Thread 클래스의 기본 메소드들을 `여러 thread가 포함된 그룹에 일괄로 적용`할 수 있게 해준다
   * 상당수는 사용 금지되었고, 남은 메소드도 사용되는 경우가 드물다


### 쓸모 없는 ThreadGroup
* 메소드가 스레드 안전 관점에서 빈약
* `activeCount()`
   * 하나의 thread group에 속해 활동중인 thread의 수 반환
* `enumerate()`
   * thread group에 속해 활동중인 thread 리스트 반환
   * 모든 활동중인 thread를 담을 만큼 큰 배열을 매개변수로 받는다
   * 배열의 크기가 부족하면 남은 만큼만 thread 리스트를 채워넣고 나머지는 무시한다
      * 수정에 대한 요구사항이 없어 수정되지 않은 버그
* `ThreadGroup.uncaughtException()`
   * 어떤 thread가 catch되지 않은 exception을 던질 때 제어를 얻는 유일한 수단
   * stacktrace를 볼 때 유용
   * `Thread.setUncaughtExceptionHandler()`가 동일한 기능 제공


### 정리
* ThreadGroup은 유용한 기능이 별로 없으며, 결함이 있다
* thread를 논리적으로 묶어서 처리하는 클래스를 설계한다면 `ThreadPoolExecutor`를 사용하자

