# [Java] BDD Style Section-based Test
> BDD 스타일로 unit test를 작성하는 내용을 정리

## BDD(Behavior Driven Development) style section-based test structure
* 일관성 있고, 읽기 쉽게 유지
* 잘 쓰여진 unit test는 몇가지 요구사항을 충족해야 함
   * 좀 더 알아보기로...
* 정확하게 정의된 책임을 지닌 3개의 코드 블록으로 분명한 분리
* 테스트를 짧게 유지하는데 도움이 되며, 테스트할 하나의 책임에만 집중하게 된다
* `given`, `when`, `then`이라고 주석을 달아두는 것
   * 어떻게 테스트를 작성해야 하고, 만들도록 장려


## 3가지 section
* given
   * 테스트를 위한 초기화 작업을 수행
   * stub, mocking, stubing, injection 
* when
   * 주어진 테스트를 수행하기 위한 동작
   * 테스트 대상 메소드 호출 등..
* then
   * 반환된 결과 검증(result assertion)
   * mock 객체 검증(mocks verification)
```java
@Test
public void test() {
    // given
    List mockList = mock(List.class);
    given(mockList.get(0)).willReturn("one");

    // when
    Object result = mockList.get(0);

    // then
    assertThat(result, is("one"));
}
```


> #### 참고자료
> * [Modern TDD-oriented Java8 JUnit test template for Idea(with Mockito and AssertJ)](https://www.javacodegeeks.com/2017/09/modern-tdd-oriented-java-8-junit-test-template-idea-mockito-assertj.html)

