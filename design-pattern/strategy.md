# [Design Pattern] Strategy Pattern
> 교환 가능한 행동을 캡슐화하고 위임을 통해서 어떤 행동을 사용할지 결정하는 Strategy Pattern에 대해 정리해보고자 함
> * [Source Code](https://github.com/opklnm102/design-pattern/tree/master/strategy)


## Strategy Pattern
* 알고리즘군을 정의하고 각각 캡슐화하여 교환해서 사용할 수 있도록 만든다
* 클라이언트와 독립적으로 알고리즘을 변경할 수 있다

### 어떤 경우에 적용할까?
* 어떤 클래스의 행동이 자주 변경되어야 하거나, 런타임시 행동이 바뀔 필요가 있을 때
* 상속을 여러개 만들어야 하고, 서브 클래스의 메소드 중복을 피하고 싶을 때
* 복잡한 조건문을 리펙토링할 때

### 적용하는 방법
1. 변하는 부분을 추출하여 알고리즘으로 정의
2. 각각을 캡슐화
3. 캡슐화한 알고리즘을 교체 가능하게 만든다

---

## Base code

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/design-pattern/images/strategy-1.png?raw=true" alt="Strategy1" width="350" height="350"/>
</div>

* 다양한 오리를 만든다고 할 때, Duck을 상속하여 다른 종류의 Duck을 만든다
   * display()를 오버라이딩

```java
public class Duck {

    public void quack() {
        System.out.println("quack");
    }

    public void swim() {
        System.out.println("swim");
    }

    public void display() {
        System.out.println("Duck");
    }
}

public class MallardDuck extends Duck {

    @Override
    public void display() {
        System.out.println("MallardDuck");
    }
}

public class RedHeadDuck extends Duck {

    @Override
    public void display() {
        System.out.println("RedHeadDuck");
    }
}
```

---

## 이슈 1

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/design-pattern/images/strategy-2.png?raw=true" alt="Strategy2" width="350" height="350"/>
</div>

* 날 수 있는 새로운 기능 추가
   * RubberDuck은 날 수 없다 -> 부작용


### Resolve
* fly(), quack() 오버라딩하여 기능 변경

```java
public class Duck {

    public void quack() {
        System.out.println("quack");
    }

    public void swim() {
        System.out.println("swim");
    }

    public void display() {
        System.out.println("Duck");
    }
    
    // issue 1. 새로운 기능 추가
    public void fly() {
        System.out.println("fly");
    }
}

public class MallardDuck extends Duck {

    @Override
    public void display() {
        System.out.println("MallardDuck");
    }
}

public class RedHeadDuck extends Duck {

    @Override
    public void display() {
        System.out.println("RedHeadDuck");
    }
}

// 날 수 없고, 울지 못하는 RubberDuck에 기능이 추가되었다 -> 부작용
public class RubberDuck extends Duck {

    @Override
    public void display() {
        System.out.println("RubberDuck");
    }

    @Override
    public void quack() {
        // nothing
    }

    @Override
    public void fly() {
        // nothing
    }
}

public class Main {

    public static void main(String[] args) {
        Duck mallardDuck = new MallardDuck();
        Duck rubberDuck = new RubberDuck();

        mallardDuck.display();
        mallardDuck.fly();
        mallardDuck.quack();

        rubberDuck.display();
        rubberDuck.fly();
        rubberDuck.quack();
    }
}
```
* RubberDuck과 같은 클래스 추가시 상속 메소드의 오버라이딩해야 하는 문제 발생

### 문제점
* 상속 때문에 발생한 문제
* 서브 클래스에서 코드 중복
* 실행시 특징을 바꾸기 힘들다
* 모든 오리의 행동을 알기 힘들다
* 변경시 서브 클래스에게서 원치 않은 영향을 끼칠 수 있다

---

## 이슈 2

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/design-pattern/images/strategy-3.png?raw=true" alt="Strategy3" width="350" height="350"/>
</div>

* 상속으로 인해 새로운 오리(RubberDuck 같은)를 추가할 때마다 메소드 오버라이딩을 피할 수 없다
* 인터페이스를 사용해보면?


### 문제점
* 비슷한 fly(), quack() 중복 발생
* 날아다니는 기능을 조금 바꾸기 위해서는 모든 서브 클래스의 fly()를 전부 고쳐야 한다
* 서브 클래스가 직접 인터페이스를 구현하기 때문에 발생

```java
public class Duck {

    public void swim() {
        System.out.println("swim");
    }

    public void display() {
        System.out.println("Duck");
    }
}

public interface Flyable {

    void fly();
}

public interface Quackable {

    void quack();
}

public class MallardDuck extends Duck implements Flyable, Quackable {

    @Override
    public void display() {
        System.out.println("MallardDuck");
    }

    @Override
    public void fly() {
        System.out.println("fly");
    }

    @Override
    public void quack() {
        System.out.println("quack");
    }
}

public class RedHeadDuck extends Duck implements Flyable, Quackable {

    @Override
    public void display() {
        System.out.println("RedHeadDuck");
    }

    @Override
    public void fly() {
        System.out.println("fly");
    }

    @Override
    public void quack() {
        System.out.println("quack");
    }
}

public class RubberDuck extends Duck implements Quackable {

    @Override
    public void display() {
        System.out.println("RubberDuck");
    }

    @Override
    public void quack() {
        System.out.println("quack");
    }
}

public class Main {

    public static void main(String[] args) {
        Duck mallardDuck = new MallardDuck();
        Duck rubberDuck = new RubberDuck();

        mallardDuck.display();
        ((MallardDuck) mallardDuck).fly();
        ((MallardDuck) mallardDuck).quack();

        rubberDuck.display();
        ((RubberDuck) rubberDuck).quack();
    }
}
```


### Resolve
* 애플리케이션에서 달라지는 부분을 추출하여, 달라지지 않는 부분과 분리
   * 달라지는 부분을 캡슐화
* 상속(inheritance) 보다는 구성(composition)
   * IS-A(inheritance) 보다는 HAS-A(composition)가 나을 수 있다
* 구현이 아닌 인터페이스를 사용

> #### Composition
> * 특정 객체의 기능을 이용하기 위해 해당 객체를 `자신의 속성(Attribute)으로 포함`시키는 것
> * Car --------> Car Behaviors ------< Klaxon Behaviors, Move Behaviors

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/design-pattern/images/strategy-4.png?raw=true" alt="Strategy4" width="350" height="350"/>
</div>

```java
public abstract class Duck {

    private FlyBehavior flyBehavior;

    private QuackBehavior quackBehavior;

    public void setFlyBehavior(FlyBehavior flyBehavior) {
        this.flyBehavior = flyBehavior;
    }

    public void setQuackBehavior(QuackBehavior quackBehavior) {
        this.quackBehavior = quackBehavior;
    }

    public void performQuack() {
        quackBehavior.quack();
    }

    public void performFly() {
        flyBehavior.fly();
    }

    public void swim() {
        System.out.println("swim");
    }

    public abstract void display();
}

// fly
public interface FlyBehavior {

    void fly();
}

public class FlyNoWay implements FlyBehavior {

    @Override
    public void fly() {
        System.out.println("FlyNoWay");
    }
}

public class FlyWithWings implements FlyBehavior {

    @Override
    public void fly() {
        System.out.println("FlyWithWings");
    }
}

// quack
public interface QuackBehavior {    

    void quack();
}

public class MuteQuack implements QuackBehavior {

    @Override
    public void quack() {
        System.out.println("MuteQuack");
    }
}

public class Quack implements QuackBehavior {

    @Override
    public void quack() {
        System.out.println("Quack");
    }
}

// duck
public class RubberDuck extends Duck {

    public RubberDuck() {
        this.setFlyBehavior(new FlyNoWay());
        this.setQuackBehavior(new MuteQuack());
    }

    @Override
    public void display() {
        System.out.println("--- RubberDuck ---");
    }
}

public class MallardDuck extends Duck {

    public MallardDuck() {
        this.setFlyBehavior(new FlyWithWings());
        this.setQuackBehavior(new Quack());
    }

    @Override
    public void display() {
        System.out.println("--- MallardDuck ---");
    }
}

public class Main {

    public static void main(String[] args) {
        Duck mallardDuck = new MallardDuck();
        Duck rubberDuck = new RubberDuck();

        mallardDuck.display();
        mallardDuck.performFly();
        mallardDuck.performQuack();

        rubberDuck.display();
        rubberDuck.performFly();
        rubberDuck.performQuack();
    }
}
```

---

## Strategy Pattern using lambda expression

```java
public interface Strategy {
    void performTask();
}
```
* 위와 같은 Strategy가 있을 때 Lambda Expression을 사용했을 때와 아닐 때의 코드를 아래에서 살펴보자


### Before - without lambda expression
```java
public class LazyStrategy implements Strategy {

    @Override
    public void performTask() {
        System.out.println("LazyStrategy");
    }
}

public class ActiveStrategy implements Strategy {

    @Override
    public void performTask() {
        System.out.println("ActiveStrategy");
    }
}

public class Main {

    public static void main(String[] args) {

        List<Strategy> strategies = Arrays.asList(
                new LazyStrategy(),
                new ActiveStrategy()
        );

        for (Strategy strategy : strategies) {
            strategy.performTask();
        }
    }
}
```


### After - using lambda expression
* interface 구현체를 안만들어도 된다

```java
public class Main {

    public static void main(String[] args) {

        List<Strategy> strategies = Arrays.asList(
                () -> System.out.println("LazyStrategy"),
                () -> System.out.println("ActiveStrategy")
        );

        for (Strategy strategy : strategies) {
            strategy.performTask();
        }
    }
}
```


### Another Sample

```java
@FunctionalInterface
public interface Computation<T> {

    T compute(T n, T m);
}
```

#### Before - without lambda expression

```java
public class IntSum implements Computation<Integer> {

    @Override
    public Integer compute(Integer n, Integer m) {
        return n + m;
    }
}

public class IntDifference implements Computation<Integer> {

    @Override
    public Integer compute(Integer n, Integer m) {
        return n - m;
    }
}

public class IntProduct implements Computation<Integer> {

    @Override
    public Integer compute(Integer n, Integer m) {
        return n * m;
    }
}

public class Main {

    public static void main(String[] args) {

        List<Computation> computations = Arrays.asList(
                new IntSum(),
                new IntProduct(),
                new IntDifference()
        );

        for (Computation computation : computations) {
            System.out.println(computation.compute(10, 4));
        }
    }
}
```

#### After - using lambda expression

```java
public class Main {

    public static void main(String[] args) {

        List<Computation<Integer>> computationsWithLambda = Arrays.asList(
                (n, m) -> n + m,
                (n, m) -> n * m,
                (n, m) -> n - m
        );

        computationsWithLambda.forEach(computation -> System.out.println(computation.compute(10, 4)));
    }
}
```


> #### 참고
> * Head First Design Patterns
> * [Strategy Pattern using Lambda Expressions in Java 8](https://dzone.com/articles/strategy-pattern-using-lambda)
