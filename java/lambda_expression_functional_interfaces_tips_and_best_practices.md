# [Java] Lambda Expressions and Functional Interfaces: Tips and Best Practices
> Lambda Expression을 사용하면서 더 좋게 작성하는 법을 보고 정리

> #### 람다식이란??
> [Java Lambda Expressions](http://tutorials.jenkov.com/java/lambda-expressions.html)를 읽어보고 오자


## Lambda Expression 사용시 고려할 점
* Size
   * code block이 커질수록 이해하기 어렵다
* Repetition
   * 반복되는 logic을 위해 method를 만드는 것이 좋다
   * 단순한 lambda를 반복해도 괜찮다
* Naming
   * 적절한 이름을 생각해 낼 수 없다면 code를 사용하는게 더 명확
   * ex. priceIsOver100보단 `x -> x.price > 100`
* Nesting
   * 중첩된 lambda는 정말 읽기 어렵다

---

## Tips

### 1. Prefer Standard Functional Interfaces
* functional interface
   * lambda, method referrence에 대한 target type을 제공하는데 필요한 대부분의 요구를 충족
* 일반적이고 추상적이여서 모든 lambda expression에 쉽게 적용
* 새로운 functional interface를 만들기 전에 `java.util.function` 탐색

 ```java
 @FunctionalInterface
public interface Foo {

    String method(String string);
}

public class UseFoo {
    
    public String add(String string, Foo foo) {
        return foo.method(string);
    }
}

// usage
public void test() {
    UseFoo useFoo = new UseFoo();
    
    Foo foo = params -> params + " from lambda";
    String result = useFoo.add("Message ", foo);
}
```
* Foo는 하나의 인수를 받아들여 결과를 산출하는 `함수에 불과`하다
   * `Function<T, R>` 로 수정

```java
public class UseFoo {

    public String add(String string, Function<String, String> fn) {
        return fn.apply(string);
    }
}

// usage
public void test() {
    UseFoo useFoo = new UseFoo();
    
    Function<String, String > fn = param -> param + " from lambda";
    String result = useFoo.add("Message ", fn);
}
```

---

### 2. Use the `@FunctionalInterface`

```java
// bad
public interface Foo {
    String method();
}

// good
@FunctionalInterface
public interface Foo {
    String method();
}
```
* `@FunctionalInterface`는 처음에는 쓸모 없어 보인다
* `interface`는 하나의 abstract method를 가지고 있는한 functional로 취급

#### 다른 method가 추가되면?
* functional interface로 사용할 수 없다

#### `@FunctionalInterface`
* 컴파일러가 functional interface가 아니게될 경우 compile error를 트리거
   * fucntionalInterfce로 디자인 되어있는 것이 수정되는 사고를 방지할 수 있다
* 다른 개발자가 application architecture에 대해 쉽게 이해할 수 있다

---

### 3. Don't Overuse Default Methods in FunctionalInterfaces
* FunctionalInterface에 쉽게 default method를 추가할 수 있다
* abstract method가 하나뿐인 functional interface에서 가능

```java
@FunctinoalInterface
public interface Foo {
    String method();
    default void defaultMethod(){}
}
```

* FunctinoalInterface는 다른 FunctinoalInterface를 상속할 수 있다
* 같은 signature의 abstract method를 가져야 한다
* 다른 signature의 abstract method가 있을 경우 functional interface 조건에 위배
   * 2개의 abstract method를 가지게 되므로

```java
@FunctinoalInterface
public interface Baz {
    String method();
    default void defaultBaz() {}
}

@FunctinoalInterface
public interface Bar {
    String method();
    default void defaultBar() {}
}

@FunctinoalInterface
public interface FooExtended extends Baz, Bar {}
```

#### Issue - interface inherits
* 일반적인 interface 상속의 문제가 발생할 수 있다

```java
// 동일한 default method가 존재할 경우
@FunctinoalInterface
public interface Baz {
    String method();
    default void defaultCommon() {}
}

@FunctinoalInterface
public interface Bar {
    String method();
    default void defaultCommon() {}
}

@FunctinoalInterface
public interface FooExtended extends Baz, Bar {}
```
* `compile error` 발생
   * interface Foo inherits unrelated defaults for defaultCommon() from types Baz and Bar...

#### Resolve
* 모호한 default method override
```java
@FunctionalInterface
public interface FooExtended extends Baz, Foo {
    
    @Override
    default void defaultMethod() {
        Foo.super.defaultMethod();  // Baz or Foo의 default method 사용
    }
}
```
* 너무 많은 default method를 추가에 주의
   * 좋은 achitectual descision이 아니다
   * 하위 버전과의 호환성을 유지하면서 interface를 upgrade하기 위해 필요한 경우에만 사용

---

### 4. Instantiate Functional Interfaces with Lambda Expressions
* inner class보다 `Lambda Expression`으로 functional interface를 instance화 한다
   * 불필요한 코드가 많아지므로

```java
// bad
Foo foo = new Foo() {
    @Override
    public String method(String string) {
        return string + " from Foo";
    }
};

// good
Foo foo = param -> param + " from Foo";
```
* Lambda Expression은 Runnable, Comparator 등과 같은 interface에 사용할 수 있다
* 위와 같은 `모든 interface를 Lambda Expression로 변경하라는 뜻은 아니다`

---

### 5. Avoid Overloading Methods with Functional Interfaces as Parameters
* 충돌을 피하기 위해 이름이 다른 메소드를 사용하십시오

#### Issue
```java
public interface Adder {
    String add(Function<String, String> f);
    void add(Consumer<Integer> f);
}

public class AdderImpl implements Adder {

    @Override
    public String add(Function<String, String> f) {
        return f.apply("Something ");
    }

    @Override
    public void add(Consumer<Integer> f) {
    }
}

// usage
String r = adder.add(a -> a + " from lambda");  // ambigous both method
```

#### Resolve
```java
// 1. 다른 이름을 사용
public interface Adder {
    String add(Function<String, String> f);
    void add(Consumer<Integer> f);
}

// 2. casting - not preferred
String r = adder.add((Function)a -> a + " from lambda");
```
> jdk1.8.0_121에선 재현되지 않는다..

---

### 6. Don't Treat Lambda Expressions as Inner Classes
* inner class와 lambda expression은 `scope`측면에서 다르다
* inner class
   * 새로운 scope 생성
   * enclosing scope의 local variable을 `덮어쓸 수 있다`
   * `this`는 inner class의 참조
* lambda expression
   * `enclosing scope`에서 동작
   * lambda expression body에서 enclosing scope의 local variable을 `덮어 쓸 수 없다`
   * `this`는 enclosing instance의 참조

```java
@FunctionalInterface
public interface Foo {
    String method();
}

public class EnclosingClass {

    private String value = "Enclosing scope value";

    public String scopeExperiment() {
        // inner class
        Foo fooIc = new Foo() {
            String value = "Inner class value";

            @Override
            public String method() {
                return this.value;
            }
        };

        String resultIc = fooIc.method();

        // lambda expression
        Foo fooLambda = () -> {
            String value = "Lambda value";
            return this.value;
        };
        String resultLambda = fooLambda.method();

        return String.format("resultIC: %s, resultLambda: %s", resultIc, resultLambda);  // resultIC: Inner class value, resultLambda: Enclosing scope value
    }
}
```

---

### 7. Keep Lambda Expressions Short And Self-explanatory
* 가능한 큰 code block 대신 one-line lambda expression 사용
* `Lambda expression은 표현`
* 간결한 구문으로 `제공하는 기능을 정확하게 표현`
* 성능에 크게 영향을 주지 않고, code style 관련 내용
   * 일반적으로 이러한 코드를 이해하고 작업하는게 훨씬 쉽다

#### Avoid Blocks of Code in Lambda's Body
* code block이 큰 경우 Lambda expression의 기능이 명확하지 않기 때문에 `1줄의 code로 작성`
* 매개변수가 있는 경우, Lambda 자체만으로 어떤 데이터로 실행해야 하는지 알 수 있다

```java
// bad
Foo foo = param -> {
    String result = "Something " + param;
    // many lines of code
    return result;
};

// good
Foo foo = param -> buildString(param);

private String buildString(String param) {
    String result = "Something " + param;
    // many lines of code
    return result;
}
```
* one-line lambda를 반드시 지킬 필요는 없다
   * code block이 2~3줄 정도로 짧다면 굳이 추출할 필요는 없다
   
#### Avoid Specifying Parameter Types
* 대부분의 경우 컴파일러는 type inference을 사용
* 매개변수 type 선언은 `선택사항이며 생략 가능`

```java
// bad
BiFunction<String, String, String> f = (String a, String b) -> a.toLowerCase() + b.toLowerCase();
        
// good
BiFunction<String, String, String> f = (a, b) -> a.toLowerCase() + b.toLowerCase();
```

#### Avoid Parentheses Around a Single Parameter
* `()`는 2개 이상이거나, 없을 때 필요
* 매개변수가 1개일 때는 `생략 가능`

```java
// bad
(a) -> a.toLowerCase();

// good
a -> a.toLowerCase();
```

#### Avoid Return Statement and Braces
* `{}`와 `return`은 one-line lambda에서 생략 가능

```java
// bad
a -> { return a.toLowerCase() };

// good
a -> a.toLowerCase();
```

#### Use Method References
* 구현된 메소드를 호출하는 경우 method reference 사용

```java
// bad
a -> a.toLowerCase();

// good
String::toLowerCase;
```

---

### Use Effectively Final Variables
* lambda expression 내부의 final이 아닌 변수에 접근하면 compile error 발생
* lambda expression에서 접근 가능 변수
   * static variables
   * instance variables
   * effectively final method parameter
   * effectively final local variables
* `effectively final`로 인해 모든 변수를 final로 선언할 필요는 없다

```java
// bad
public void method() {
    int num = 1;
    num = 2;
    
    Foo foo = param -> num + param;  // compile error
}

// good
public void method() {
    int num = 1;  // effectively final
    
    Foo foo = param -> num + param;
}
```

> #### effectively final
> * 컴파일러는 1번만 할당된 모든 변수를 final로 취급
> * loop, inner class에서 초기화할 수 없다
> ```java
> // final
> final int number;
> number = 23;
> 
> // effectively final
> int number;
> number = 34;
> ```

---

### Protect Object Variables from Mutation
* Lambda expression의 주요 목적 중 하나는 병렬 컴퓨팅에서 사용된다는 것
* thread-safety 에 유용
* `effectively final`은 여기에 많은 도움이 되지만, 모든 경우에 해당하지 않는다
   * Lambda expression에서 immutable enclosing scope object의 값을 변경할 수 없다
   * mutable인 경우 가능

```java
int[] total = new int[1];
Runnable r = () -> total[0]++;
r.run();
```
* total에는 Lambda 수행 후 다른 값이 존재
* 이런 상황을 주의


> #### 참고
> * [Lambda Expressions and Functional Interfaces: Tips and Best Practices](http://www.baeldung.com/java-8-lambda-expressions-tips)
> * [Difference between final and effectively final](https://stackoverflow.com/questions/20938095/difference-between-final-and-effectively-final)
