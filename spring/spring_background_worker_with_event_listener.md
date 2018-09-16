# [Spring] Background worker with EventListener
> date - 2018.09.15  
> keyword - spring boot, spring cloud eureka, backgroud worker  
> Spring Cloud Netflix OSS에서 discovery service로 사용되는 eureka module의 eureka client가 어떻게 eureka server로 자신의 상태를 전달하는지 궁금해서 알아본 내용을 정리  
> spring-cloud-starter-eureka 1.2.5.RELEASE 기준

<br>

## Eureka Client Code
```java
@Configuration
@EnableConfigurationProperties
@ConditionalOnClass(EurekaClientConfig.class)
@ConditionalOnProperty(value = "eureka.client.enabled", matchIfMissing = true)
@CommonsLog
public class EurekaDiscoveryClientConfiguration implements SmartLifecycle, Ordered {
    
    // 1. embedded servlet container가 구동될 때 발행되는 event를 받아 
    @EventListener(EmbeddedServletContainerInitializedEvent.class)
    public void onApplicationEvent(EmbeddedServletContainerInitializedEvent event) {
        
        int localPort = event.getEmbeddedServletContainer().getPort();
        if (this.port.get() == 0) {
            log.info("Updating port to " + localPort);
            this.port.compareAndSet(0, localPort);
            start();
        }
    }

    @Override
	public void start() {
        ...
        
        if (!this.running.get() && this.instanceConfig.getNonSecurePort() > 0) {
            ...
            
            if (this.healthCheckHandler != null) {
                this.eurekaClient.registerHealthCheck(this.healthCheckHandler);  // 2. eureka client에 health checker를 등록
            }
            this.context.publishEvent(new InstanceRegisteredEvent<>(this, this.instanceConfig));
            this.running.set(true);
        }
    }
}

public class DiscoveryClient implements EurekaClient {

    public void registerHealthCheck(HealthCheckHandler healthCheckHandler) {
        ...

        if (healthCheckHandler != null) {
            this.healthCheckHandler = healthCheckHandler;
            if (this.instanceInfoReplicator != null) {
                this.instanceInfoReplicator.onDemandUpdate();  // 3. instance info update
            }
        }
    }
}

class InstanceInfoReplicator implements Runnable {

    private final DiscoveryClient discoveryClient;
    private final ScheduledExecutorService scheduler;
    private final AtomicReference<Future> scheduledPeriodicRef;
    private final RateLimiter rateLimiter;
    private final int burstSize;
    private final int allowedRatePerMinute;
    
    ...

    public boolean onDemandUpdate() {
        if (this.rateLimiter.acquire(this.burstSize, (long)this.allowedRatePerMinute)) {
            this.scheduler.submit(new Runnable() {
                public void run() {
                    // 마지막에 실행된 thread를 기다리고, 취소해주면서 동시에 여러번 실행되는걸 방지
                    Future latestPeriodic = (Future)InstanceInfoReplicator.this.scheduledPeriodicRef.get();
                    if (latestPeriodic != null && !latestPeriodic.isDone()) {
                        latestPeriodic.cancel(false);
                    }

                    InstanceInfoReplicator.this.run();  // 4. scheduler의 thread run
                }
            });
            return true;
        } else {
            logger.warn("Ignoring onDemand update due to rate limiter");
            return false;
        }
    }
}
```

<br>

## spring event listener를 사용해 background 작업하기
* eureka의 코드처럼 동작하는 sample을 작성해보자 

### EventListener
* 어떤 event가 발생되었을 때 호출되어 처리를 담당하는 역할을 가진 class

#### ServletContextListener
* servlet context의 변경될 때 발행되는 event를 처리하기 위한 interface

| method | description |
|:--|:--|
| contextInitialized(ServletContextEvent sce) | servlet container가 구동될 때 실행 |
| contextDestoryed(ServletContextEvent sce) | servlet container가 종료될 때 실행 |

#### ServletContextAttributeListener
* servlet context의 속성들에 변화가 있을 때 발행되는 event를 처리하기 위한 interface

| method | description |
|:--|:--|
| attritubeAdded(ServletContextAttributeEvent scae) | servlet container에 새로운 속성이 추가될 때 실행 |
| attributeRemoved(ServletContextAttributeEvent scae) | servlet container에 속성이 제거될 때 실행 |
| attributeReplaced(ServletContextAttributeEvent scae) | servlet container에 속성 값이 변경될 때 실행 |

#### HttpSessionListener
* web application의 active session list에 변화가 있을 때 발행되는 event를 처리하기 위한 interface

| method | description |
|:--|:--|
| sessionCreated(HttpSessionEvent se) | session 생성시 실행 |
| sessionDestroyed(HttpSessionEvent se) | session이 무효화될 때 실행 |

#### HttpSessionAttributeListener
* session의 속성들에 변화가 있을 때 발행되는 event를 처리하기 위한 interface

| method | description |
|:--|:--|
| attributeAdded(HttpSessionBindingEvent se) | session에 새로운 속성이 추가될 때 실행 |
| attributeRemoved(HttpSessionBindingEvent se) | session에 속성 값이 제거될 때 실행 |
| attributeReplaced(HttpSessionBindingEvent se) | session의 속성 값이 변경될 때 실행 |

#### HttpSessionActivationListener
* session에 바인드된 객체는 session이 비활성화/활성화될 때 발행되는 event를 수신할 수 있ㄷ
* VM간 session을 마이그레이션하거나, 유지해야하는 container는 bind된 속성을 알려야한다

| method | description |
|:--|:--|
| sessionWillPassivate(HttpSessionEvent se) | session이 비활성화 될 때 실행 |
| sessionDidActivate(HttpSessioㅈnEvent se) | session이 활성화되고 실행 |


### Sample Code
```java
/**
 * Servlet Container 구동시 background worker 시작
 * HikariCP, Eureka Client를 참고해서 작성
 * <p>
 * Created by ethan.kim on 2018. 9. 14..
 */
@Component
@Slf4j
public class CustomListener implements ServletContextListener {

    private final PeriodicWorker periodicWorker;

    public CustomListener() {
        periodicWorker = new PeriodicWorker();
    }

    // servlet context 초기화시 호출
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.info("context start");
        periodicWorker.start(0, 1);
    }

    // servlet context 종료시 호출
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("context stop");
        periodicWorker.stop();
    }
}

/**
 * 주기적으로 일하는 일꾼 -> polling 구현시 좋을듯
 * <p>
 * Created by ethan.kim on 2018. 9. 16..
 */
@Slf4j
public class PeriodicWorker {

    private final ScheduledExecutorService scheduledExecutor;

    private final AtomicBoolean started;

    private final ThreadPoolExecutor threadPoolExecutor;

    private int maximumPoolSize = 10;

    private final BackgroundWorker backgroundWorker;

    private final AtomicReference<Future> scheduledPeriodicRef;

    public PeriodicWorker() {
        this.scheduledExecutor = Executors.newScheduledThreadPool(1);

        LinkedBlockingQueue<Runnable> workerQueue = new LinkedBlockingQueue<>(maximumPoolSize);
        this.threadPoolExecutor = createThreadPoolExecutor(workerQueue, "worker", null, new ThreadPoolExecutor.DiscardPolicy());

        this.backgroundWorker = new BackgroundWorker();

        this.scheduledPeriodicRef = new AtomicReference<>();
        this.started = new AtomicBoolean(false);
    }

    public void start(int initialDelay, int period) {

        if (this.started.compareAndSet(false, true)) {
            Runnable task = () -> {
                log.info("Scheduling: {}", ZonedDateTime.now(ZoneOffset.UTC));

                Future latestPeriodic = PeriodicWorker.this.scheduledPeriodicRef.get();

                // 이전 작업을 취소하거나
//                if (latestPeriodic != null && latestPeriodic.isDone() == false) {
//                    log.info("cancel");
//                    latestPeriodic.cancel(false);
//                }

                // 기다리거나 -> network 상태 등의 외부요인으로 인해 오래 걸리는 작업이라면 무한히 기다리는것 보다는 취소하는게 더 안전할듯
                if (latestPeriodic != null) {
                    try {
                        latestPeriodic.get();
                    } catch (InterruptedException | ExecutionException e) {
                        log.warn("latestPeriodic interrupted");
                    }
                }

                Future<?> next = this.threadPoolExecutor.submit(this.backgroundWorker);
                this.scheduledPeriodicRef.set(next);
            };

            this.scheduledExecutor.scheduleAtFixedRate(task, initialDelay, period, TimeUnit.SECONDS);
        }
    }

    public void stop() {
        this.scheduledExecutor.shutdownNow();  // 다음 scheduling을 방지하기 위해 바로 종료
        this.started.set(false);

        shutdownThreadExecutor(threadPoolExecutor, 3L, TimeUnit.SECONDS);
    }

    private void shutdownThreadExecutor(@Nonnull ExecutorService executorService, long timeout, TimeUnit unit) {
        try {
            executorService.shutdown();
            executorService.awaitTermination(timeout, unit);
        } catch (InterruptedException e) {
            log.error("thread interrupted when context destroy");
        }
    }

    private ThreadPoolExecutor createThreadPoolExecutor(BlockingQueue<Runnable> queue, String threadName, ThreadFactory threadFactory, RejectedExecutionHandler policy) {
        if (threadFactory == null) {
            threadFactory = new DefaultThreadFactory(threadName, true);
        }

        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(1, 1, 5L, TimeUnit.SECONDS, queue, threadFactory, policy);
        threadPoolExecutor.allowCoreThreadTimeOut(true);
        return threadPoolExecutor;
    }

    public static final class DefaultThreadFactory implements ThreadFactory {

        private final String threadName;

        private final boolean daemon;

        public DefaultThreadFactory(String threadName, boolean daemon) {
            this.threadName = threadName;
            this.daemon = daemon;
        }

        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, this.threadName);
            thread.setDaemon(daemon);  // user thread가 종료되면 종료되도록 daemon thread로
            return thread;
        }
    }

    private final class BackgroundWorker implements Runnable {

        @Override
        public void run() {
            log.info("working..");

            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                log.error("thread interrupted");
            }
        }
    }
}
```

---

<br>

> #### Reference
> * [spring-cloud-netflix](https://github.com/spring-cloud/spring-cloud-netflix)
> * [HikariCP](https://github.com/brettwooldridge/HikariCP)
> * [Spring Boot에서 Background Thread 만들기](https://infoscis.github.io/2017/03/26/Springboot-background-thread/)
