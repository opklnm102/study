# [Test] Property-Based Testing(PBT)
> date - 2022.12.06  
> keyword - tdd, pbt  
> 테스트 주도 개발: 고품질 쾌속개발을 위한 TDD 실천번과 도구를 읽으며 공부하며 알게된 Property-Based Testing에 대해 정리  

<br>
  
## Property-Based Testing이란?
* 결과가 입력 데이터와 관련 있는 어떤 속성(property)을 만족하는지 검증하는 방식
  * range 기반 auto generation과 randomizing을 기반으로 기계적으로 값을 검증
* 보통 작성하는 test case는 입력과 기대값을 제공하고 두 값의 일치 여부를 검증하는 example-based testing이다
  * example-based testing은 예상한 것 이외에 edge case를 놓치기 매우 쉽다
* 입력 데이터와 결과에서 검증해야하는 속성이 무엇인지 찾기 위해 **항상 성립해야하는 조건**과 **항상 성립하지 않아야하는 조건**을 찾는다
  * e.g. 2개의 string이 있을 때 length(a + b) == length(a) + length(b)가 되야한다
* [jqwik](https://jqwik.net), [kotest-property](https://kotest.io/docs/proptest/property-based-testing.html) 등을 사용해서 가능
* JUnit에서도 parameterized test, theory 지원


<br><br>

> #### Reference
> [4장 - Mock 을 이용한 TDD](https://repo.yona.io/doortts/blog/issue/5)
> * [PROPERTY BASED TESTING: STEP BY STEP](https://www.leadingagile.com/2018/04/step-by-step-toward-property-based-testing/)
> * [Property-based Testing](https://kotest.io/docs/proptest/property-based-testing.html)
