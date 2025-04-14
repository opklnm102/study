# Smart Lifecycle











http://kingbbode.tistory.com/38

http://selvakumaresra.herokuapp.com/spring-smartlifecycle-smart-shutdown-sequence-for-java-service/

https://www.programcreek.com/java-api-examples/index.php?api=org.springframework.context.SmartLifecycle

https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/SmartLifecycle.html

https://www.google.co.kr/search?newwindow=1&ei=ykVUWsTpJ8Hm0gSPzpjYBQ&q=spring+boot+smartlifecycle&oq=spring+boot+smartlifecycle&gs_l=psy-ab.3..35i39k1j0i19k1.708.708.0.844.1.1.0.0.0.0.108.108.0j1.1.0....0...1c.1.64.psy-ab..0.1.107....0.Wd1FxKzMjrM



```java
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import lombok.extern.slf4j.Slf4j;

/**
 * Todo: discovery member에서 어떻게 제거할지... EurekaDiscoveryClientConfiguration 참고
 * ContextClosedEvent 대신 사용할 수 있을지 검증
 * https://bitbucket.org/balancehero/promotion/pull-requests/839/add-application-context-close-sqs-listener/diff 내용 체크
 *
 * Created by ethan.kim on 2018. 1. 9..
 */
@Component
@Slf4j
public class ApplicationLifeCycle implements SmartLifecycle {

    private AtomicBoolean running = new AtomicBoolean(false);

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public void stop(Runnable callback) {
        log.info("ethantest STOP");

        try {
            stop();

            TimeUnit.SECONDS.sleep(30);

            callback.run();
        } catch (InterruptedException e) {
            log.error("LifeCycle error", e);
        }
    }

    @Override
    public void start() {
        log.info("ethantest start");

        running.set(true);
    }

    @Override
    public void stop() {
        log.info("ethantest stop");

        running.set(false);
    }

    @Override
    public boolean isRunning() {
        return this.running.get();
    }

    /**
     * This is the most important method
     * Returning Interger.MAX_VALUE only suggests that
     * we will be the first bean to shutdown
     *
     * @return
     */
    @Override
    public int getPhase() {
        return Integer.MAX_VALUE;
    }
}
```

