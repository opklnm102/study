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

## 규칙 69. Prefer concurrency utilities to wait and notify

## 규칙 70. Document thread safety

## 규칙 71. Use lazy initialization judiciously

## 규칙 72. Don't depend on the thread scheduler

## 규칙 73. Avoid thread groups


