# [Design Pattern] Overview

<br>

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


<br>

## Design Pattern 전문 용어의 위력
* 간단한 단어로 많은 것을 얘기할 수 있다
* Pattern 수준에서 이야기를 하면 `Design`에 더 오랫동안 집중할 수 있다
* 서로간 오해의 소지를 최소화시키고 빠르게 작업할 수 있다


<br>

## 디자인 도구 상자 안에 들어가야할 도구들

### OOP(Object Oriented Programming)의 기초
* 추상화
* 캡슐화
* 다형성
* 상속


### 디자인의 원칙
* 자주 변경되는 부분을 찾고, 변경되지 않는 부분과 분리시킨다
  * 새로운 요구사항이 추가되었을 때마다 모든 코드를 수정하지 말고, 자주 변경되는 부분을 분리하여 변경을 최소화한다
* 상속(inheritance)보다는 구성(composition)을 활용한다
* 구현이 아닌 인터페이스에 맞춰서 프로그래밍한다
* Loose Coupling
  * 서로 상호작용을 하는 객체 사이에서는 가능하면 느슨하게 결합하는 디자인을 사용한다
* OCP(Open-Closed Principle)
  * 클래스는 확장에 대해서는 열려 있지만 변경에 대해서는 닫혀 있어야 한다
* DIP(Dependency Inversion Principle)
  * 구상 클래스에 의존하지 않고, 추상화된 것에 의존하라
* Principle of Least Knowledge
  * 아주 가까운 객체들끼리 상호작용하라
* Hollywood Principle
  * 고수준에서 저수준으로만 호출하여 의존성 부패를 방지한다
* SRP(The Single Responsibility Principle)
  * 어떤 클래스가 바뀌게 되는 이유는 1가지 뿐이여야 한다


<br>

## 왜 패턴을 배워야 하나요?
* 디자인 패턴은 SW 디자인의 일반적인 문제들에 대해 **시도되고 검증된** 해결책들을 모은 것으로 객체 지향 디자인의 원칙들을 사용해 많은 종류의 문제를 해결하는 방법을 배울 수 있다
* 팀에서 더 효울적으로 의사소통할 수 있다
  * e.g. 싱글턴 패턴을 사용하세요


<br>

## 패턴의 분류
22가지
* Creational patterns(생성 패턴)
  * Factory Method(팩토리 매서드)
  * Abstract Factory(추상 팩토리)
  * Builder(빌더)
  * Prototype(프로토타입)
  * Singleton(싱글턴)
* Structural patterns(구조 패턴)
  * Adapter(어댑터)
  * Bridge(브릿지)
  * Composite(복합체)
  * Decorator(데코레이터)
  * Facade(퍼사드)
  * Flyweight(플라이웨이트)
  * Proxy(프록시)
* Behavioral patterns(행동 패턴)
  * Chain of Responsibility()
  * Command(커맨드)
  * Iterator(반복자)
  * Mediator(중재자)
  * Memento(메멘토)
  * Observer(옵저버)
  * State(상태)
  * Strategy(전략)
  * Template Method(템플릿 메서드)
  * Visitor(비지터)


<br>

## 디자인 패턴 공부시 염두할 점
* 이 패턴을 왜 쓰나?
* 무엇이 좋아지나?
* 무엇이 안좋아지나?
* 항상 trade-off 가 존재
* GoF의 디자인 패턴에도 장/단점이 분명하다
* 각 패턴의 장/단점이 무엇인지 알면 장점은 부각시키고, 단점은 최소화할 수 있다
  * 장점은 살리고, 단점은 감춘다 -> 좋은 SW 아키텍트가 갖추어야할 설계 역량

<br>

### example - Singleton pattern
* 객체지향 버전의 전역변수나 마찬가지
  1. 싱글톤 객체 - 다른 객체간 의존성이 높아짐
  2. 인스턴스 생성의 책임이 분리되지 않기 때문에 SRP 위반
  3. unit test 객체가 싱글톤 객체에 종속성이 발생하기 때문에 테스트 어려움


<br><br>

> #### Reference
> * Head First Design Patterns
> * [Design Patterns](https://refactoring.guru/design-patterns)
