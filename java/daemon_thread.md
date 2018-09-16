# [Java] Daemon Thread
> date - 2018.09.16  
> keyword - daemon thread, user thread
> spring application에서 backgroud worker를 구현하다가 본 setDaemon()에 대해 알아본걸 정리  

<br>

* user thread(daemon thread가 아닌)의 작업을 돕는 보조적인 역할을 수행하는 thread
* user thread가 모두 종료되면 daemon thread는 강제적으로 종료된다
* daemon thread가 생성한 thread는 daemon thread가 된다

```java
public class Thread implements Runnable {

    /**
     * user/daemon thread로 변경
     */
    public final void setDaemon(boolean on) {
        checkAccess();
        if (isAlive()) {
            throw new IllegalThreadStateException();
        }
        daemon = on;
    }

    /**
     * Tests if this thread is a daemon thread.
     */
    public final boolean isDaemon() {
        return daemon;
    }
}
```

<br>

## Sample Code
```java
@Slf4j
public class DaemonThreadTester {

    public static void main(String[] args) {

        Task task = new Task();

        Thread worker = new Thread(task);
        worker.setName("main worker");
        worker.setDaemon(false);
        worker.start();

        try {
            Thread.sleep(3 * 1000);
        } catch (InterruptedException e) {
            log.error("interrupted");
        }

        task.stopTask();
    }

    static class Task implements Runnable {

        private boolean running = true;

        @Override
        public void run() {
            Thread worker2 = new Thread(() -> {
                while (true) {
                    doTask();
                }
            });
            worker2.setName("worker2");
            worker2.setDaemon(true);
            worker2.start();

            Thread worker3 = new Thread(() -> {
                while (true) {
                    doTask();
                }
            });
            worker3.setName("worker3");
            worker3.setDaemon(true);  // worker3의 상태를 바꿔가며 test
            worker3.start();

            while (running) {
                doTask();
            }
        }

        public void stopTask() {
            running = false;
        }

        private void doTask() {
            log.info("working...");

            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                log.error("interrupted");
            }
        }
    }
}
```

### worker2(daemon), worker3(daemon) 일 때
```java
21:58:46.120 [worker3] INFO me.dong.DaemonThreadTester - working...
21:58:46.120 [worker2] INFO me.dong.DaemonThreadTester - working...
21:58:46.120 [main worker] INFO me.dong.DaemonThreadTester - working...
21:58:47.131 [main worker] INFO me.dong.DaemonThreadTester - working...
21:58:47.131 [worker3] INFO me.dong.DaemonThreadTester - working...
21:58:47.131 [worker2] INFO me.dong.DaemonThreadTester - working...
21:58:48.134 [main worker] INFO me.dong.DaemonThreadTester - working...
21:58:48.134 [worker3] INFO me.dong.DaemonThreadTester - working...
21:58:48.134 [worker2] INFO me.dong.DaemonThreadTester - working...
21:58:49.135 [worker2] INFO me.dong.DaemonThreadTester - working...
21:58:49.135 [worker3] INFO me.dong.DaemonThreadTester - working...
```
* user thread인 main worker가 종료되는 순간 daemon thread인 worker2, 3가 종료된다

### worker2(daemon), worker3(user) 일 때
```java
22:00:18.870 [main worker] INFO me.dong.jsonincdluetest.events.DaemonThreadTester - working...
22:00:18.870 [worker2] INFO me.dong.jsonincdluetest.events.DaemonThreadTester - working...
22:00:18.870 [worker3] INFO me.dong.jsonincdluetest.events.DaemonThreadTester - working...
....
22:00:50.979 [worker3] INFO me.dong.jsonincdluetest.events.DaemonThreadTester - working...
22:00:50.979 [worker2] INFO me.dong.jsonincdluetest.events.DaemonThreadTester - working...
```
* user thread인 worker3가 살아있기 때문에 worker2도 살아있다

---

<br>

> #### Reference
> * [자바에서 데몬 쓰레드가 뭔가요?](https://hashcode.co.kr/questions/209/%EC%9E%90%EB%B0%94%EC%97%90%EC%84%9C-%EB%8D%B0%EB%AA%AC-%EC%93%B0%EB%A0%88%EB%93%9C%EA%B0%80-%EB%AD%94%EA%B0%80%EC%9A%94)
