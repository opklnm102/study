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

## 규칙 68. Prefer executors and tasks to threads

## 규칙 69. Prefer concurrency utilities to wait and notify

## 규칙 70. Document thread safety

## 규칙 71. Use lazy initialization judiciously

## 규칙 72. Don't depend on the thread scheduler

## 규칙 73. Avoid thread groups


