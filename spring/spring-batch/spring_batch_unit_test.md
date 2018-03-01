# [Spring Batch] Unit Test
> Spring Batch로 구현한 기능의 Test 하는 법을 정리해보고자 함


## End-To-End Testing of Batch Jobs
* Job을 실행하고, 완료 여부만 검증한다

## Testing Individual Steps
* Job이 복잡하여 End-To-End Testing of Batch Job을 하기 어려운 경우 각각의 step별로 testing

## Example - End-To-End Testing of Batch Jobs, Testing Individual Steps
```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners(value = {JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class},
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
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

    /**
     * End-To-End Testing of Batch Jobs
     */
    @Test
    public void creationEndJob_창작물_마감_성공() throws Exception {
        // given : 진행중인 창작물 2개로
        when(endCreationReader.read())
                .thenReturn(createCreation(1L), createCreation(2L), null);

        JobParametersBuilder builder = new JobParametersBuilder();
        builder.addDate("processingAt", new Date());

        // when : 창작물 마감 job이 실행되면
        JobExecution jobExecution = jobLauncherTestUtils.launchJob(builder.toJobParameters());

        // then : 창작물이 마감된다
        assertThat(jobExecution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
        assertThat(jobExecution.getExitStatus()).isEqualTo(ExitStatus.COMPLETED);

        verify(creationRepository, times(2)).save(any(Creation.class));
    }

    /**
     * Testing Individual Steps
     */
    @Test
    public void creationEndStep_창작물_마감_성공() throws Exception {
        // given : 진행중인 창작물 2개로
        when(endCreationReader.read())
                .thenReturn(createCreation(1L), createCreation(2L), null);

        // when : 창작물 마감 step이 실행되면
        JobExecution jobExecution = jobLauncherTestUtils.launchStep("creationEndStep");

        // then : 창작물이 마감된다
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


## Testing Step-Scoped Components
* 런타임에 step에 대해 구성되는 component는 `step scope`와 `지연 바인딩`을 사용하여 JobExecution, StepExecution으로부터 context를 주입하는 경우가 많기 때문에 Step이 실행된 것처럼(StepExecution 존재) Context를 설정하는 방법이 없는한 component를 개별 test를 하는것은 까다롭다
* 이런 어려움은 Spring Batch의 `StepScopeTestExecutionListener`와 `StepScopeTestUtils`를 사용하여 해결된다
   * Listener를 활용하면 JobScope 또는 StepScope에서 Test Case를 실행하기 편리하다
* `StepScopeTestExecutionListener`는 class level에 선언되어, 각 test method에 대해 `StepExecution` Context를 생성해 준다
   * `JobScopeTestExecutionListener`는 `JobExecution` Context를 생성
* `DependencyInjectionTestExecutionListener`
   * Application Context에서 구성된 Dependenct Injection 처리
* `StepScopeTestExecutionListener`
   * Spring Batch에서 StepExecution에 대한 Test Case에서 Method Factory를 찾고, Test Case의 Context로 사용
   * Step에서 활성화된 것처럼 만들어 준다
   * Factory Method는 method signature에 의해 감지(StepExecution을 return하면 된다)
      * Factory Method가 없으면 기본 StepExecution 생성

```java
protected StepExecution getStepExecution(TestContext testContext) {
    Object target;
    
    try {
        Method method = TestContext.class.getMethod(GET_TEST_INSTANCE_METHOD);
        target = ReflectionUtils.invokeMethod(method, testContext);
    } catch (NoSuchMethodException e) {
        throw new IllegalStateException("No such method " + GET_TEST_INSTANCE_METHOD + " on provided TestContext", e);
    }

    ExtractorMethodCallback method = new ExtractorMethodCallback(StepExecution.class, "getStepExecution");
    ReflectionUtils.doWithMethods(target.getClass(), method);
    if (method.getName() != null) {
        HippyMethodInvoker invoker = new HippyMethodInvoker();
        invoker.setTargetObject(target);
        invoker.setTargetMethod(method.getName());
        try {
            invoker.prepare();
            return (StepExecution) invoker.invoke();
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not create step execution from method: " + method.getName(), e);
        }
    }
    
    return MetaDataInstanceFactory.createStepExecution();
}
```

* `StepScopeTestUtils`
   * 보다 융통성 있는 접근 가능
   * StepScope(StepExecution 존재)에서 callback method를 실행한다
   * ex. reader에서 사용할 수 있는 항목 계산 등

```java
public class StepScopeTestUtils {
    
    public static <T> T doInStepScope(StepExecution stepExecution, Callable<T> callable) throws Exception {
        try {
            StepSynchronizationManager.register(stepExecution);
            return callable.call();
        } finally {
            StepSynchronizationManager.close();
        }
    }
}
```


### spring batch doc example
```java
@ContextConfiguration
@TestExecutionListeners( { DependencyInjectionTestExecutionListener.class,
    StepScopeTestExecutionListener.class })
@RunWith(SpringJUnit4ClassRunner.class)
public class StepScopeTestExecutionListenerIntegrationTests {

    // StepScope로 정의 되어 있어서 Step이 활성화되지 않으면 inject할 수 없다
    @Autowired
    private ItemReader<String> reader;

    public StepExecution getStepExection() {
        StepExecution execution = MetaDataInstanceFactory.createStepExecution();
        execution.getExecutionContext().putString("input.data", "foo,bar,spam");
        return execution;
    }

    @Test
    public void testReader() {
        // The reader is initialized and bound to the input data
        assertNotNull(reader.read());
    }

    @Test
    public void testReadCount() {
        int count = StepScopeTestUtils.doInStepScope(stepExecution, 
        new Callable<Integer>() {
            public Integer call() throws Exception {
                int count = 0;
                
                while (reader.read() != null) {
                    count++;
                    }
                return count;
            }
        });
        
        assertEquals(count, 3);
    }
}
```

### Example - Testing Step-Scoped Components
```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {FeedgetApiApplication.class, CreationEndJobConfigurationTest.TestJobConfiguration.class})
@ActiveProfiles(profiles = "test")
@TestExecutionListeners(value = {JobScopeTestExecutionListener.class, StepScopeTestExecutionListener.class},
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Slf4j
public class WriterTest {

    @MockBean(name = "endCreationReader")
    private JpaPagingItemReader endCreationReader;

    // StepScopeTestExecutionListener에 의해 호출된다
    public StepExecution getStepExecution() {
       return MetaDataInstanceFactory.createStepExecution();
    }

    // JobScopeTestExecutionListener에 의해 호출된다
    public JobExecution getJobExecution() {
        JobParameters jobParameters = new JobParametersBuilder()
                .addDate("processingAt", new Date())
                .toJobParameters();

        return MetaDataInstanceFactory.createJobExecution("creationEndJob", 1L, 1L, jobParameters);
    }

    @Test
    public void test() throws Exception {
        // given :
        when(endCreationReader.read())
                .thenReturn(createCreation(1L), createCreation(2L), null);

        // when :
        int count = StepScopeTestUtils.doInStepScope(getStepExecution(),
                new Callable<Integer>() {
                    @Override
                    public Integer call() throws Exception {
                        int count = 0;

                        while (endCreationReader.read() != null) {
                            count++;
                        }
                        return count;
                    }
                });

        // then :
        assertEquals(count, 2);
    }

    private Creation createCreation(long creationId) {
        Creation creation = new Creation();
        creation.setCreationId(creationId);
        creation.setStatus(Creation.Status.PROCEEDING);
        return creation;
    }
}
```


## Mocking Domain Objects
* Spring Batch Domain Model은 OOP를 따르고 있어 `StepExecution`에는 `JobExecution`이 필요하고 유효한 StepExecution을 생성하기 위해 `JobInstance`, `JobParameters`가 필요하다
* Unit Test를 위한 Stub이 어렵다
* `MetaDataInstanceFactory`를 사용하면 해결..!

```java
private NoWorkFoundStepExecutionListener tested = new NoWorkFoundStepExecutionListener();

@Test
public void test() throws Exception {
    // before
    // StepExecution stepExecution = new StepExecution("NoProcessingStep",
                // new JobExecution(new JobInstance(1L, "NoProcessingJob"), new JobParameters()));

    // after   
    StepExecution stepExecution = MetaDataInstanceFactory.createStepExecution();

    stepExecution.setReadCount(0);

    try {
        tested.afterStep(stepExecution);
        fail();
    } catch (IllegalArgumentException e) {
        assertThat(e.getMessage()).isEqualTo("Step has not processed any items");
    }
}

static class NoWorkFoundStepExecutionListener extends StepExecutionListenerSupport {
    
    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        if (stepExecution.getReadCount() == 0) {
            throw new IllegalArgumentException("Step has not processed any items");
        }
        return stepExecution.getExitStatus();
    }
}
```


> #### 참고
> * [Spring Batch Unit Testing Doc](https://docs.spring.io/spring-batch/trunk/reference/html/testing.html)
