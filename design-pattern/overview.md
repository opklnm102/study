# [Design Pattern] Overview

## Pattern
* 특정 Context 내에서 주어진 문제에 대한 해결책

### Context
* Pattern이 적용되는 상황
* 반복적으로 일어날 수 있는 상황이여야만 한다

### Problem
* 이루고자 하는 목적
* 제약 조건도 포함

### Solution
* 누구든지 적용해서 일련의 제약조건 내에서 목적을 달성할 수 있는 일반적인 디자인

### Force
* Problem을 구성하는 요소인 `목적과 제약 조건`을 합쳐 Force라고 한다
* Solution이 Force의 양면 사이에서 균형을 이룰 수 있어야만 제대로 된 Pattern이 만들어진다

---

<br>

## Design Pattern 전문 용어의 위력
* 간단한 단어로 많은 것을 얘기할 수 있다
* Pattern 수준에서 이야기를 하면 `Design`에 더 오랫동안 집중할 수 있다
* 서로간 오해의 소지를 최소화시키고 빠르게 작업할 수 있다

---

<br>

## 디자인 도구 상자 안에 들어가야할 도구들

### OOP(Object Oriented Programming)의 기초
* 추상화
* 캡슐화
* 다형성
* 상속


### 디자인의 원칙
* 바뀌는 부분은 캡슐화한다
* 상속(inheritance)보다는 구성(composition)을 활용한다
* 구현이 아닌 인터페이스에 맞춰서 프로그래밍한다
* 서로 상호작용을 하극 객체 사이에서는 가능하면 느슨하게 결합하는 디자인을 사용한다(Loose Coupling)
* 클래스는 확장에 대해서는 열려 있지만 변경에 대해서는 닫혀 있어야 한다(OCP: Open-Closed Principle)
* 추상화된 것에 의존하라. 구상 클래스에 의존하지 않도록 한다(DIP: Dependency Inversion Principle)
* 친한 친구들하고만 이야기한다(Principle of Least Knowlegfe)
* 먼저 연락하지 마세요. 저희가 연락 드리겠습니다(Hollywood Principle)
* 어떤 클래스가 바뀌게 되는 이유는 1가지 뿐이여야 한다(SRP: The Single Responsibility Principle)

---

<br>

## 디자인 패턴 공부시 염두할 점
* 이 패턴을 왜 쓰나?
* 무엇이 좋아지나?
* 무엇이 안좋아지나?
* 항상 trade-off 가 존재
* GoF의 디자인 패턴에도 장/단점이 분명하다
* 각 패턴의 장/단점이 무엇인지 알면 장점은 부각시키고, 단점은 최소화할 수 있다
  * 장점은 살리고, 단점은 감춘다 -> 좋은 SW 아키텍트가 갖추어야할 설계 역량

### example - Singleton pattern
* 객체지향 버전의 전역변수나 마찬가지
  1. 싱글톤 객체 - 다른 객체간 의존성이 높아짐
  2. 인스턴스 생성의 책임이 분리되지 않기 때문에 SRP 위반
  3. unit test 객체가 싱글톤 객체에 종속성이 발생하기 때문에 테스트 어려움

---

<br>

> #### 참고
> * Head First Design Patterns
