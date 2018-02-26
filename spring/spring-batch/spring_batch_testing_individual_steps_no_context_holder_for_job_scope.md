# [Spring Batch] Testing individual steps no context holder for job scope
> Spring Batch로 구현한 기능의 Step별 TC 작성 중 만난 이슈와 해결하는 과정을 정리해보고자 함  
> 전체 코드는 [여기](https://github.com/feedget/feedget-backend)에서 볼 수 있다


## Source Code
* Job
```java
@EnableBatchProcessing
@Configuration
public class CreationEndJobConfiguration implements JobConfig {

    public static final String JOB_NAME = "creationEndJob";
    private static final int PAGE_SIZE = 100;
    private static final int CHUNK_SIZE = 10;

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private CreationRepository creationRepository;

    @Autowired
    @Qualifier(value = JOB_NAME)
    private Job creationEndJob;

    @Override
    public String getJobName() {
        return JOB_NAME;
    }

    @Override
    public Job getJobInstance() {
        return creationEndJob;
    }

    @Override
    public JobParameters getJobParameters(Map<String, Object> actionParams) {
        Date processingAt = (Date) actionParams.getOrDefault("processingAt", new Date());

        return new JobParametersBuilder()
                .addDate("processingAt", processingAt)
                .toJobParameters();
    }

    @Bean(name = "creationEndJob")
    public Job creationEndJob(@Qualifier("creationEndStep") Step creationEndStep) {
        return jobBuilderFactory.get(JOB_NAME)
                .incrementer(new RunIdIncrementer())
                .start(creationEndStep)
                .build();
    }

    @JobScope
    @Bean(name = "creationEndStep")
    public Step creationEndStep(@Value("#{jobParameters}") Map<String, Object> jobParameters,
                                @Qualifier("endCreationReader") JpaPagingItemReader<Creation> endCreationReader,
                                @Qualifier("endCreationProcessor") ItemProcessor<Creation, Creation> endCreationProcessor,
                                @Qualifier("endCreationWriter") ItemWriter<? super Creation> endCreationWriter) {
        return stepBuilderFactory.get("creationEndStep")
                .allowStartIfComplete(true)
                .<Creation, Creation>chunk(new SimpleCompletionPolicy((Integer) jobParameters.getOrDefault("chunk", CHUNK_SIZE)))
                .reader(endCreationReader)
                .processor(endCreationProcessor)
                .writer(endCreationWriter)
                .build();
    }

    @StepScope
    @Bean(name = "endCreationReader")
    public JpaPagingItemReader<Creation> readEndCreation(@Value("#{jobParameters['processingAt']}") Date processingDate) throws Exception {
        String readQuery = "SELECT c FROM Creation c WHERE c.dueDate > :startDate" +
                " AND c.dueDate < :endDate AND c.status = :status";

        LocalDateTime processingAt = LocalDateTime.ofInstant(processingDate.toInstant(), ZoneId.of("UTC"));

        Map<String, Object> params = new HashMap<>();
        params.put("startDate", processingAt.minusDays(1L));
        params.put("endDate", processingAt);
        params.put("status", Creation.Status.PROCEEDING);

        JpaPagingItemReader<Creation> reader = new JpaPagingItemReader<>();
        reader.setEntityManagerFactory(entityManagerFactory);
        reader.setQueryString(readQuery);
        reader.setParameterValues(params);
        reader.setPageSize(PAGE_SIZE);
        reader.setSaveState(true);

        return reader;
    }

    @Bean(name = "endCreationWriter")
    public ItemWriter<Creation> writeEndCreation() {
        return new ItemWriter<Creation>() {
            @Override
            public void write(List<? extends Creation> items) throws Exception {
                for (Creation item : items) {
                    item.setStatus(Creation.Status.DEADLINE);
                    creationRepository.save(item);
                }
            }
        };
    }
}
```

* Test Case
```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
public class CreationEndJobConfigurationTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @MockBean
    private CreationRepository creationRepository;

    @MockBean(name = "endCreationReader")
    private JpaPagingItemReader endCreationReader;

    private Creation createCreation(long creationId) {
        Creation creation = new Creation();
        creation.setCreationId(creationId);
        creation.setStatus(Creation.Status.PROCEEDING);
        return creation;
    }

    @Configuration
    static class TestJobConfiguration {

        @Bean
        public JobLauncherTestUtils jobLauncherTestUtils() {
            return new JobLauncherTestUtils() {

                @Autowired
                @Override
                public void setJob(@Qualifier("creationEndJob") Job job) {
                    super.setJob(job);
                }
            };
        }
    }

    @Test
    public void creationEndStep() throws Exception {
        // given
        when(endCreationReader.read()).thenReturn(createCreation(1L), createCreation(2L), null);

        // when
        JobExecution jobExecution = jobLauncherTestUtils.launchStep("creationEndStep");

        // then
        boolean status = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getStatus() == BatchStatus.COMPLETED);
        boolean exitStatus = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getExitStatus().equals(ExitStatus.COMPLETED));

        assertThat(status).isTrue();
        assertThat(exitStatus).isTrue();
        verify(creationRepository, times(2)).save(any(Creation.class));
    }
}
```

## 이슈
```java
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'scopedTarget.creationEndStep': Scope 'job' is not active for the current thread; consider defining a scoped proxy for this bean if you intend to refer to it from a singleton; nested exception is java.lang.IllegalStateException: No context holder available for job scope

	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:355)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:197)
	at org.springframework.aop.target.SimpleBeanTargetSource.getTarget(SimpleBeanTargetSource.java:35)
	at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:192)
	at com.sun.proxy.$Proxy135.getName(Unknown Source)
	at org.springframework.batch.core.job.SimpleJob.getStep(SimpleJob.java:108)
	at org.springframework.batch.test.JobLauncherTestUtils.launchStep(JobLauncherTestUtils.java:232)
	at org.springframework.batch.test.JobLauncherTestUtils.launchStep(JobLauncherTestUtils.java:187)
	at kr.co.mashup.feedgetapi.batch.CreationEndJobConfigurationTest.creationEndStep(CreationEndJobConfigurationTest.java:107)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:50)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:47)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at org.springframework.test.context.junit4.statements.RunBeforeTestMethodCallbacks.evaluate(RunBeforeTestMethodCallbacks.java:75)
	at org.springframework.test.context.junit4.statements.RunAfterTestMethodCallbacks.evaluate(RunAfterTestMethodCallbacks.java:86)
	at org.springframework.test.context.junit4.statements.SpringRepeat.evaluate(SpringRepeat.java:84)
	at org.junit.runners.ParentRunner.runLeaf(ParentRunner.java:325)
	at org.springframework.test.context.junit4.SpringJUnit4ClassRunner.runChild(SpringJUnit4ClassRunner.java:252)
	at org.springframework.test.context.junit4.SpringJUnit4ClassRunner.runChild(SpringJUnit4ClassRunner.java:94)
	at org.junit.runners.ParentRunner$3.run(ParentRunner.java:290)
	at org.junit.runners.ParentRunner$1.schedule(ParentRunner.java:71)
	at org.junit.runners.ParentRunner.runChildren(ParentRunner.java:288)
	at org.junit.runners.ParentRunner.access$000(ParentRunner.java:58)
	at org.junit.runners.ParentRunner$2.evaluate(ParentRunner.java:268)
	at org.springframework.test.context.junit4.statements.RunBeforeTestClassCallbacks.evaluate(RunBeforeTestClassCallbacks.java:61)
	at org.springframework.test.context.junit4.statements.RunAfterTestClassCallbacks.evaluate(RunAfterTestClassCallbacks.java:70)
	at org.junit.runners.ParentRunner.run(ParentRunner.java:363)
	at org.springframework.test.context.junit4.SpringJUnit4ClassRunner.run(SpringJUnit4ClassRunner.java:191)
	at org.junit.runner.JUnitCore.run(JUnitCore.java:137)
	at com.intellij.junit4.JUnit4IdeaTestRunner.startRunnerWithArgs(JUnit4IdeaTestRunner.java:68)
	at com.intellij.rt.execution.junit.IdeaTestRunner$Repeater.startRunnerWithArgs(IdeaTestRunner.java:47)
	at com.intellij.rt.execution.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:242)
	at com.intellij.rt.execution.junit.JUnitStarter.main(JUnitStarter.java:70)
Caused by: java.lang.IllegalStateException: No context holder available for job scope
	at org.springframework.batch.core.scope.JobScope.getContext(JobScope.java:159)
	at org.springframework.batch.core.scope.JobScope.get(JobScope.java:92)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:340)
	... 36 more
```

## 해결 과정

### 1. exception stack trace를 추적
* `No context holder available for job scope` 메시지를 찾는다
```java
// JobScope.java:159
private JobContext getContext() {
	JobContext context = JobSynchronizationManager.getContext();
	if (context == null) {
		throw new IllegalStateException("No context holder available for job scope");
	}
	return context;
}
```
* JobContext가 null이여서 발생하는 이슈로 원인 발견

### 2. JobSynchronizationManager
* `JobSynchronizationManager.getContext()`에서 가져오니 `JobSynchronizationManager`에 context를 set해주면 되지 않을까..? 라는 접근
```java
public class JobSynchronizationManager {

	private static final SynchronizationManagerSupport<JobExecution, JobContext> manager = new SynchronizationManagerSupport<JobExecution, JobContext>() {

		@Override
		protected JobContext createNewContext(JobExecution execution, BatchPropertyContext args) {
			return new JobContext(execution);
		}

		@Override
		protected void close(JobContext context) {
			context.close();
		}
	};

	public static JobContext getContext() {
		return manager.getContext();
	}

	public static JobContext register(JobExecution JobExecution) {
		return manager.register(JobExecution);
	}

	public static void close() {
		manager.close();
	}

	public static void release() {
		manager.release();
	}
}
```
* `JobSynchronizationManager.register(JobExecution)`를 사용하면 되겠다..!

```java
@Test
public void creationEndStep() throws Exception {
    // given
    when(endCreationReader.read()).thenReturn(createCreation(1L), createCreation(2L), null);
	JobSynchronizationManager.register(MetaDataInstanceFactory.createJobExecution());

    // when
    JobExecution jobExecution = jobLauncherTestUtils.launchStep("creationEndStep");

    // then
    boolean status = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getStatus() == BatchStatus.COMPLETED);
    boolean exitStatus = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getExitStatus().equals(ExitStatus.COMPLETED));

    assertThat(status).isTrue();
    assertThat(exitStatus).isTrue();
    verify(creationRepository, times(2)).save(any(Creation.class));
}
```
* success! 

### 3. @TestExecutionListeners
* success 했으나 살짝 찝찝하다..
* [stackoverflow - Spring batch scope issue while using spring boot](http://serve.3ezy.com/stackoverflow.com/q/28457107?rq=1)를 보니 `@RunWith(SpringRunner.class)`를 사용할 때 `@TestExecutionListeners({..., JobScopeTestExecutionListener.class})`를 선언하라는 답변이 있다
```java
// JobScopeTestExecutionListener.java:91
@Override
public void beforeTestMethod(org.springframework.test.context.TestContext testContext) throws Exception {
	if (testContext.hasAttribute(JOB_EXECUTION)) {
		JobExecution jobExecution = (JobExecution) testContext.getAttribute(JOB_EXECUTION);
		JobSynchronizationManager.register(jobExecution);
	}	
}
```
* `JobScopeTestExecutionListener.beforeTestMethod()`를 보니 test method 실행 전에 `JobSynchronizationManager.register(jobExecution)`로 JobExecution을 set 해주고 있으니 선언하면 될듯한데..?

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners({JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class})
public class CreationEndJobConfigurationTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @MockBean
    private CreationRepository creationRepository;

    @MockBean(name = "endCreationReader")
    private JpaPagingItemReader endCreationReader;

    private Creation createCreation(long creationId) {
        Creation creation = new Creation();
        creation.setCreationId(creationId);
        creation.setStatus(Creation.Status.PROCEEDING);
        return creation;
    }

    @Configuration
    static class TestJobConfiguration {

        @Bean
        public JobLauncherTestUtils jobLauncherTestUtils() {
            return new JobLauncherTestUtils() {

                @Autowired
                @Override
                public void setJob(@Qualifier("creationEndJob") Job job) {
                    super.setJob(job);
                }
            };
        }
    }

    @Test
	public void creationEndStep() throws Exception {
    	// given
    	when(endCreationReader.read()).thenReturn(createCreation(1L), createCreation(2L), null);

    	// when
    	JobExecution jobExecution = jobLauncherTestUtils.launchStep("creationEndStep");

    	// then
    	boolean status = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getStatus() == BatchStatus.COMPLETED);
    	boolean exitStatus = jobExecution.getStepExecutions().stream()
                .allMatch(stepExecution -> stepExecution.getExitStatus().equals(ExitStatus.COMPLETED));

    	assertThat(status).isTrue();
    	assertThat(exitStatus).isTrue();
    	verify(creationRepository, times(2)).save(any(Creation.class));
	}
}


// NPE 발생..!?
java.lang.NullPointerException
	at kr.co.mashup.feedgetapi.batch.CreationEndJobConfigurationTest.creationEndStep(CreationEndJobConfigurationTest.java:105)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	...
	at com.intellij.rt.execution.junit.JUnitStarter.prepareStreamsAndStart(JUnitStarter.java:242)
	at com.intellij.rt.execution.junit.JUnitStarter.main(JUnitStarter.java:70)
```
* DI가 안돼서 NPE 발생

### 4. DependencyInjectionTestExecutionListener
* [Spring Batch Doc - 10.4 Testing Step-Scoped Components](https://docs.spring.io/spring-batch/trunk/reference/html/testing.html#d5e3531)를 보니 `DependencyInjectionTestExecutionListener`가 있다

```java
// DependencyInjectionTestExecutionListener
@Override
public void beforeTestMethod(final TestContext testContext) throws Exception {
	if (Boolean.TRUE.equals(testContext.getAttribute(REINJECT_DEPENDENCIES_ATTRIBUTE))) {
		if (logger.isDebugEnabled()) {
			logger.debug("Reinjecting dependencies for test context [" + testContext + "].");
		}
		injectDependencies(testContext);
	}
}

protected void injectDependencies(final TestContext testContext) throws Exception {
	Object bean = testContext.getTestInstance();
	AutowireCapableBeanFactory beanFactory = testContext.getApplicationContext().getAutowireCapableBeanFactory();
	beanFactory.autowireBeanProperties(bean, AutowireCapableBeanFactory.AUTOWIRE_NO, false);
	beanFactory.initializeBean(bean, testContext.getTestClass().getName());
	testContext.removeAttribute(REINJECT_DEPENDENCIES_ATTRIBUTE);
}
```
* test method 실행 전에 DI를 해주고 있네..? 그럼 이걸 사용하면 DI가 되겠지..!

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners(value = {DependencyInjectionTestExecutionListener.class, JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class})
public class CreationEndJobConfigurationTest {
...


// NPE 발생..!?
java.lang.NullPointerException
	at kr.co.mashup.feedgetapi.batch.CreationEndJobConfigurationTest.creationEndStep(CreationEndJobConfigurationTest.java:105)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
...
```
* @MockBean은 여전히 DI가 되지 않아서 NPE 발생

### 5. MockitoTestExecutionListener
* [github - @MockBean is not autowired in Test](https://github.com/spring-projects/spring-boot/issues/9609)를 보니 Spring Boot가 default로 사용하는 TestExecutionListener들이 있는걸 파악
```java
// spring-boot-test의 spring.factories
# Spring Test ContextCustomizerFactories
org.springframework.test.context.ContextCustomizerFactory=\
org.springframework.boot.test.context.ImportsContextCustomizerFactory,\
org.springframework.boot.test.context.SpringBootTestContextCustomizerFactory,\
org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizerFactory,\
org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory,\
org.springframework.boot.test.mock.mockito.MockitoContextCustomizerFactory

# Test Execution Listeners
org.springframework.test.context.TestExecutionListener=\
org.springframework.boot.test.mock.mockito.MockitoTestExecutionListener,\
org.springframework.boot.test.mock.mockito.ResetMocksTestExecutionListener

// spring-test-4.3.13의 spring.factories
# Default TestExecutionListeners for the Spring TestContext Framework
#
org.springframework.test.context.TestExecutionListener = \
	org.springframework.test.context.web.ServletTestExecutionListener,\
	org.springframework.test.context.support.DirtiesContextBeforeModesTestExecutionListener,\
	org.springframework.test.context.support.DependencyInjectionTestExecutionListener,\
	org.springframework.test.context.support.DirtiesContextTestExecutionListener,\
	org.springframework.test.context.transaction.TransactionalTestExecutionListener,\
	org.springframework.test.context.jdbc.SqlScriptsTestExecutionListener

# Default ContextCustomizerFactory implementations for the Spring TestContext Framework
#
org.springframework.test.context.ContextCustomizerFactory = \
	org.springframework.test.context.web.socket.MockServerContainerContextCustomizerFactory
```
* `MockitoTestExecutionListener`를 발견..! 적용해보자

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners(value = {DependencyInjectionTestExecutionListener.class, JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class,
        MockitoTestExecutionListener.class})
public class CreationEndJobConfigurationTest {
...
```
* success!

### 6. TestExecutionListeners.MergeMode
* 그래도 test 클래스마다 @TestExecutionListeners에 다닥다닥 연결시키는 방법 밖에 없는가... 해서 봤더니
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface TestExecutionListeners {

	@AliasFor("listeners")
	Class<? extends TestExecutionListener>[] value() default {};

	@AliasFor("value")
	Class<? extends TestExecutionListener>[] listeners() default {};

	boolean inheritListeners() default true;

	MergeMode mergeMode() default MergeMode.REPLACE_DEFAULTS;

	enum MergeMode {
		REPLACE_DEFAULTS,

		MERGE_WITH_DEFAULTS
	}
}
```
* `mergeMode`가 있고, default로 `MergeMode.REPLACE_DEFAULTS`를 사용하고 있었다. 그래서 `@TestExecutionListeners({JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class})`를 선언 했을 때 기존의 TestExecutionListener들이 동작하지 않았던 것...

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners(value = {JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class},
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class CreationEndJobConfigurationTest {
...
```
* spring.factories에 선언된 TestExecutionListener들을 제거..!
* `org.springframework.batch.test`의 TestExecutionListener만 남게되었다
   *  `org.springframework.batch.test`에는 spring.factories가 존재하지 않아 명시적인 설정이 필요


## 정리
* `TestExecutionListener`로 test method 실행 전후 작업을 처리할 수 있다
* spring.factories에 선언된 default TestExecutionListener가 있고, `MergeMode.REPLACE_DEFAULTS`를 사용하면 default TestExecutionListener는 동작하지 않는다


> #### 참고
> * [stackoverflow - Spring batch scope issue while using spring boot](http://serve.3ezy.com/stackoverflow.com/q/28457107?rq=1)
> * [Spring Batch Doc - 10.4 Testing Step-Scoped Components](https://docs.spring.io/spring-batch/trunk/reference/html/testing.html#d5e3531)
> * [github - @MockBean is not autowired in Test](https://github.com/spring-projects/spring-boot/issues/9609)
