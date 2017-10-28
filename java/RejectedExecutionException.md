# [Java] RejectedExecutionException
>  RejectedExecutionException이 발생하는 이유에 대해 정리하고자 함


## 1. 새로운 task를 executor가 shutdown된 후에 실행하려고 할 때
* `shutdown()` 호출 후 오래된 task는 여전히 실행되지만, 새로운 task는 실행할 수 없다

```java
public class Test {

    public static void main(String[] args) {
        // 3개의 thread pool 중 1개가 사용가능해질 떄까지 ArrayBlockingQueue에 저장
        ExecutorService executor = new ThreadPoolExecutor(3, 3, 0L,
                TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(15));

        Worker tasks[] = new Worker[10];
        for (int i = 0; i < 10; i++) {
            tasks[i] = new Worker(i);
            executor.execute(tasks[i]);
        }

        executor.shutdown();
        executor.execute(tasks[0]);
    }
}

// Worker
class Worker implements Runnable {

    private int id;

    public Worker(int id) {
        this.id = id;
    }

    @Override
    public void run() {

        Thread currentThread = Thread.currentThread();
        System.out.println(currentThread.getName() + " id: " + id);

        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println(currentThread.getName() + " id : " + id);
    }
}
```


## 2. executor가 수용할 수 없을 정도의 task를 실행했을 때
```java
public class Test {

    public static void main(String[] args) throws InterruptedException {
        // 3개의 thread pool 중 1개가 사용가능해질 떄까지 ArrayBlockingQueue에 저장
        ExecutorService executor = new ThreadPoolExecutor(3, 3, 0L,
                TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(15));

        // queue의 size인 15를 넘어서는 task 실행 -> exception..!
        Worker tasks[] = new Worker[20];
        for (int i = 0; i < 20; i++) {
            tasks[i] = new Worker(i);
            executor.execute(tasks[i]);
        }

        executor.shutdown();
    }
}
```

## 해결 방안
* `executor.shutdown()` 호출 후 thread pool에 task를 저장하지 않는다
* `ArrayBlockingQueue`의 size를 늘려주거나 `LinkedBlockingQueue` 사용
* `ArrayBlockingQueue`에 들어있는 task들이 수행될 수 있는 시간을 준다

