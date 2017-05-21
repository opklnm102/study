# mockito를 사용해 유닛 테스트하기

## mockito
* Java에서 유닛 테스트를 위한 Mocking Framework
* Mock이 필요한 테스트에 직관적으로 사용

## 간단한 사용법
1. create mock
   * `mock()`, `spy()`로 Mock을 생성
2. stub
   * mock의 응답을 개인화하거나 직접 지정
   * `Mockito.when(mock.action()).thenReturn(true)`
   * `BBDMockito.given(mock.action()).willReturn(true)`
3. use
4. verify
   * 제대로 동작하는지 확인(verification)
   * `Mockito.verify(mock).action()`
   * `BDDMockito.then(mock).should().action()`
> * @Mock, @Spy, @Captor, @InjectMocks과 같이 Annotation으로도 가능

## mock 생성하기

### mock()
```java
@Test
public void whenNotUseMockAnnotaion_thenCorrect(){
    // mock 생성
    List mockList = Mockito.mock(ArrayList.class);

    // use
    mockList.add("one");

    // verify
    Mockito.verify(mockList).add("one");  // method가 호출되었나 검증
    assertEquals(0, mockList.size());  // 실제로 호출된게 아니라 size에 영향 X

    // stub
    Mockito.when(mockList.size()).thenReturn(100);

    // verify
    assertEquals(100, mockList.size());
}
```

### @Mock
* 반복적인 mock 생성 코드를 줄여준다
   * 테스트 클래스의 `가독성`을 상승
* 필드 이름으로 각각의 mock을 구분
   * 검증시에 발생하는 에러를 좀 더 읽기 쉽게 만들어준다
```java
@RunWith(MockitoJUnitRunner.class)
public class MockitoAnnotationTest {
    
    @Mock
    List<String> mockedList;

    @Before
    public void setup(){
        // @Mock이 선언된 변수들에 대해 mock객체 생성
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void whenUseMockAnnotaion_thenMockIsInjected() {
        // use
        mockedList.add("one");

        // verify
        Mockito.verify(mockedList).add("one");
        assertEquals(0, mockedList.size());

        // stub
        Mockito.when(mockedList.size()).thenReturn(100);
        
        // verify
        assertEquals(100, mockedList.size());
    }
}
```

### @InjectMocks
* 클래스 내부에 다른 클래스를 포함하는 경우 사용
* @Mock, @Spy가 붙은 mock객체를 `자신의 멤버 클래스와 일치하면 주입`
```java
@Mock
private Map<String, String> wordMap;

@InjectMocks
private  MyDictionary dic = new MyDictionary();

@Before
public void setup(){
    MockitoAnnotations.initMocks(this);
}

@Test
public void whenUseInjectMocksAnnotation_thenCorrect() {

    // stub
    Mockito.when(wordMap.get("aWord")).thenReturn("aMeaning");

    // verify
    assertEquals("aMeaning", dic.getMeaning("aWord"));
}


class MyDictionary {
    Map<String, String> wordMap;

    public MyDictionary() {
        this.wordMap = new HashMap<>();
    }

    public void add(final String word, final String meaning){
        wordMap.put(word, meaning);
    }

    public String getMeaning(final String word){
        return wordMap.get(word);
    }
}
```

### @Spy
* mock stub를 별도로 만들지 않는다면 실제 메소드 호출
```java
/*
spy() 대신 annotation도 가능
@Spy
List<String> spiedList = new ArrayList<>();
*/

@Test
public void whenNotUseSpyAnnotation_thenCorrect(){
    List<String> spyList = Mockito.spy(new ArrayList<>());

    spyList.add("one");
    spyList.add("two");

    // verify
    Mockito.verify(spyList).add("one");  // 호출되었는지 검증
    Mockito.verify(spyList).add("two");
    assertEquals(2, spyList.size());  // 실제 method가 호출되어 size()는 2가됨

    // stub 
    Mockito.doReturn(100).when(spyList).size();  // spyList.size()를 호출하면 100을 리턴
    
    // verify
    assertEquals(100, spyList.size());
}
```

## stub

### when()
* 특정 mock객체에 조건 지정
```java
@Test
public void test_when(){
    Animal a = mock(Animal.class);
    
    // stub
    when(a.getName()).thenReturn("cat");  // a.getName()이 호출될 경우의 반환값 지정

    // verify
    assertThat(a.getName(), is("cat"));
}
```

* 파라미터가 있는 method의 경우
```java
public List<String> getList(String name){
    // something
}

@Test
public void test_when_method(){
    // 어떤 임의의 값 -> anyXXX()
    // 특정 값 -> eq()
    when(getList(anyString()))  
        .thenReturn(
            new ArrayList<>(){
                { this.add("cat"); this.add("dog");}
            }
        );
}
```

### doThrow()
* 예외를 던질 경우
```java
@Test(expected = NullPointerException.class)
public void test_doThrow_NPE(){
    Animal a = mock(Animal.class);

    // stub
    doThrow(new NullPointerException()).when(a).setName(eq("cat"));

    // use
    a.setName("cat");  // exception 발생
}
```

### void method를 stubbing하기
* `doThrow(Throwable)`
* `doAnswer(Answer)`
* `doNothing()`
* `doReturn(Object)`
```java
@Test
public void test(){
    List mockList = mock(List.class);

    // stub
    doThrow(new RuntimeException())
            .when(mockList).clear();
    doNothing()
            .when(mockList).add(anyString());

    // use
    mockList.clear();  // excption 발생
    mockList.add("one");

    // verify
    verify(mockList).add(anyString());  // mockList.add()이 호출되었는지 검증
}
```

### 연속적인 콜 stubbing
* method 호출이 대해 다른 return, exception을 발생시켜야 하는 경우
```java
@Test
public void test(){
    List mockList = mock(List.class);

    // stub
    when(mockList.get(0))
            .thenThrow(new RuntimeException())
            .thenReturn("one");

    // 1번째 : exception 발생
    mockList.get(0);

   // 2번째 : "one"
    mockList.get(0);

    // 3번째 : "one" -> 마지막 stubbung이 계속 발생
    mockList.get(0);

    // 연속 호출에 대한 stubbing을 간략화
    when(mockList.get(0))
            .thenReturn("one", "two", "three");
}
```

## verify

### verify()
* 해당 구문이 호출되었는지 체크
* 호출, 횟수, 타임 아웃 시간까지 지정 가능
   * 멀티 스레드 시스템을 테스트할 경우 유용
```java
@Test
public void test_verify(){
     Animal a = mock(Animal.class);
     String name = "cat";
     a.setName(name);

     // n번 호출했는지
     verify(a, times(1)).setName(any(String.class));

     // 호출 안했는지
     verify(a, never()).getName();

     // 적어도도 1번이상 호출되는가
     verify(a, atLeastOnce()).setName(any(String.class));

     // n번 이하 호출되는가
     verify(a, atMost(2)).setName(any(String.class));

     // 적어도 n번 호출되는가 -> n번 이상
     verify(a, atLeast(2)).setName(any(String.class));

     // 지정된 시간(millis)안에 호출되는가
     verify(a, timeout(100)).setName(any(String.class));

     // 지정된 시간(millis)안에 적어도 n번 호출되는가 -> n번 이상
     verify(a, timeout(100).setLeast(1)).setName(any(String.class));

     // 지정된 시간(millis)안에 정확히 n번 호출되는가
     verify(a, timeout(100).times(2)).setName(anyString());

     // 다른 mock이 호출되지 않았는지 검증
     verifyZeroInteractions(mockedList);
     
     // 주어진 시간 안에 지정된 검증 방식을 통과하면 성공
     // 자신만의 검증 방식이 만들어져 있다면 유용
     verify(mockList, new Timeout(100, yourOwnVerificationMode)).add("one");
}
```

### 파라미터 검증

#### method로 ArgumentCaptor 사용
```java
@Test
public void whenNotUseCaptorAnnotation_thenCorrect(){
    List mockList=  Mockito.mock(List.class);
    ArgumentCaptor<String> arg = ArgumentCaptor.forClass(String.class);

    // use
    mockList.add("one");

    // verify
    Mockito.verify(mockList).add(arg.capture());
    assertEquals("one", arg.getValue());
}
```

#### annotation으로 ArgumentCaptor 사용
```java
@Captor
ArgumentCaptor<String> argCaptor;

@Test
public void whenUseCaptorAnnotation_thenThesam(){

    // use
    mockedList.add("one");

    // verify
    Mockito.verify(mockedList).add(argCaptor.capture());
    assertEquals("one", argCaptor.getValue());
}
```

### 순서 검증하기
* mock들이 순서대로 실행되는지 검증
* 유연한 검증 방식 중 하나 
* 모든 method가 실행되는지 검증할 필요는 없고 관심 있는 method만 순서대로 실행되는지 검증
* 검증하려고 하는 mock만 InOrder를 통해 생성한 뒤 차례대로 실행되는지 검사
```java
@Test
public void whenUseInOrder() {
    List firstMock = mock(List.class);
    List secondMock = mock(List.class);

    // use -> mock을 사용한다
    firstMock.add("was called first");
    secondMock.add("was called second");

    // mock이 순서대로 실행되는지 확인하기 위해 inOrder객체에 mock을 전달한다
    InOrder inOrder = Mockito.inOrder(firstMock, secondMock);

    // verify -> firstMock이 secondMock보다 먼저 실행되는 것을 확인한다
    inOrder.verify(firstMock).add("was called first");
    inOrder.verify(secondMock).add("was called second");
}
```

### 불필요하게 실행되는 코드 검증
* 무분별하게 사용하지 말고 적절하게 사용
```java  
@Test
public void test(){
    List mockList = mock(List.class);

    // use
    mockList.add("one");
    mockList.add("two");  // 불필요한 호출. 이것때문에 실패

    // verify
    verify(mockList).add("one");

    // 검증과 상관없이 불필요한 메소드 호출을 검증
    verifyNoMoreInteractions(mockList);
}
```

## BDD(Behavior Driven Development) 스타일로 테스트 작성
* `given`, `when`, `then`이라고 주석을 달아두는 것
   * 어떻게 테스트를 작성해야 하고, 만들도록 장려
* when을 이용한 stubbing이 주석에 맞아떨어지지 않는 문제
   * stubbing이 when이 아닌 given에 속하기 때문
   * `BDDMockito.given(Object)` 사용
```java
@Test
public void test() {
    List mockList = mock(List.class);

    // given
    given(mockList.get(0))
            .willReturn("one");

    // when
    Object result = mockList.get(0);

    // then
    assertThat(result, is("one"));
}
```

> #### 참고 자료
> [Getting Started with Mockito @Mock, @Spy, @Captor and @InjectMocks](http://www.baeldung.com/mockito-annotations)  
> [Mockito features in Korean](https://github.com/mockito/mockito/wiki/Mockito-features-in-Korean) 