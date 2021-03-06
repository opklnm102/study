# [Java] Exception handling in Streams
> date - 2020.07.10  
> keyworkd - java, stream, exception handling  
> Stream에서 Exception 처리에 대해 정리  

<br>

## Step 1
* lambda에서는 checked exception을 발생시키는 method를 호출시 **compile error 발생**
```java
public void test() throws Exception {
    items.stream()
         .filter(Objects::nonNull)
         .forEach(item -> raiseChecked(item));
}

private Item raiseChecked(Item integer) throws IOException {
    throw new IOException("error");
}
```
```java
> Task :spring:compileTestJava FAILED
src/test/java/me/opklnm102/exception/StreamExceptionHandleTest.java:76: error: unreported exception IOException; must be caught or declared to be thrown
                .forEach(item -> raiseChecked(item));
                                                ^
```

<br>

### try-catch에서 처리 필요
* `try-catch`에서 직접 처리하거나
```java
public void test() throws Exception {
    items.stream()
         .forEach(item -> {
            try {
                raiseChecked(item);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
}

private Item raiseChecked(Item item) throws IOException {
    throw new IOException("error");
}
```

* `try-catch`에서 unchecked exception으로 wrapping
```java
public void test() throws Exception {
    items.stream()
         .filter(Objects::nonNull)
         .forEach(item -> {
            try {
                raiseChecked(item);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
}
```


<br>

## Step 2
* lambda block은 **readability가 떨어지므로 가급적 피하는 것을 권장**, try-catch를 method로 추출하여 **readability 향상 및 관심사 구분**
```java
public void test() throws Exception {
    items.stream()
         .filter(Objects::nonNull)
         .forEach(this::wrapCheckedException);
}

private Item wrapCheckedException(Item item) {
    try {
        return raiseChecked(item);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

private Item raiseChecked(Item item) throws IOException {
    throw new IOException("error");
}
```


<br>

## Step 3
* 반복되는 wrapping을 functional interface로 분리
```java
@FunctionalInterface
public interface CheckedExceptionFunction<T, R> {
    R apply(T t) throws Exception;

    static <T, R> Function<T, R> wrap(CheckedExceptionFunction<T, R> function) {
        return input -> {
            try {
                return function.apply(input);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }
}

public void test() throws Exception {
    // function interface로 checked exception을 unchecked exception으로 변환
    items.stream()
         .filter(Objects::nonNull)
         .map(CheckedExceptionFunction.wrap(item -> raiseChecked(item)))
         .forEach(System.out::println);
}

private Item raiseChecked(Item item) throws IOException {
    throw new IOException("error");
}
```
* exception 발생시 **stream processing이 즉시 중단**된다는 이슈가 있다


<br>

## Step 4
* exception 발생시 stream 중단 없이 사용하고 싶을 경우가 있다

### Either
* functional languages의 common type으로 Java의 Optional과 유사하게 **2가지 가능성이 있는 wrapper**
* exception을 가능한 결과로 생각하지 않고, `Either`로 stream에서 계속 처리할 여부를 결정
  * `throws exception` 대신 `Either` 사용
* Right, Left 둘 중 하나만 될 수 있다
  * `Either<String, Ineger>`
  * `Either`에 `Exception`과 value를 사용
  * 일반적으로 left는 `Exception`, right는 value
* `throws exception`으로 stream이 즉시 종료되는 대신 return되는 Either stream을 통해 제어
  * left instance를 filtering하고 기록할 수 있다
  * 올바른 instance를 기록하고 exception을 무시할 수 있다
* `Either`는 **generic wrapper**라서 exception handling뿐만 아니라 모든 type에 사용 가능
```java
public class Either<L, R> {
    private final L left;
    private final R right;

    public Either(L left, R right) {
        this.left = left;
        this.right = right;
    }

    public static <L, R> Either<L, R> Left(L value) {
        return new Either<>(value, null);
    }

    public static <L, R> Either<L, R> Right(R value) {
        return new Either<>(null, value);
    }

    public Optional<L> getLeft() {
        return Optional.ofNullable(left);
    }

    public Optional<R> getRight() {
        return Optional.ofNullable(right);
    }

    public boolean isLeft() {
        return left != null;
    }

    public boolean isRight() {
        return right != null;
    }

    public <T> Optional<T> mapLeft(Function<? super L, T> mapper) {
        if (isLeft()) {
            return Optional.of(mapper.apply(left));
        }
        return Optional.empty();
    }

    public <T> Optional<T> mapRight(Function<? super R, T> mapper) {
        if (isRight()) {
            return Optional.of(mapper.apply(right));
        }
        return Optional.empty();
    }

    @Override
    public String toString() {
        if (isLeft()) {
            return "Left(" + left + ")";
        }

        return "Right(" + right + ")";
    }

    public static <T, R> Function<T, Either<Exception, R>> lift(CheckedExceptionFunction<T, R> function) {
        return input -> {
            try {
                return Either.Right(function.apply(input));
            } catch (Exception e) {
                return Either.Left(e);
            }
        };
    }
}

// usage
items.stream()
    .filter(Objects::nonNull)
    .map(Either.lift(item -> raiseChecked(item)))
    .forEach(either -> System.out.println(either));
```

<br>

### Pair
* 단순 `Either`는 `Exception`만을 저장하기 때문에 origin value를 알 수 없다
* `Pair`로 `Exception`과 origin vaule를 저장
  * 2가지 값을 가질 수 있는 type
  * 직접 구현하거나 Apache Commons lang 등 libary 사용

```java
public class Pair<F, S> {

    private final F first;

    private final S second;

    public Pair(F first, S second) {
        this.first = first;
        this.second = second;
    }

    public F getFirst() {
        return first;
    }

    public S getSecond() {
        return second;
    }

    public static <F, S> Pair<F, S> of(F first, S second) {
        return new Pair<>(first, second);
    }

    @Override
    public String toString() {
        return "Pair{" +
                "first=" + first +
                ", second=" + second +
                '}';
    }
}

public class Either<L, R> {
    ...
    public static <T, R> Function<T, Either<Pair<Exception, T>, R>> liftWithValue(CheckedExceptionFunction<T, R> function) {
        return input -> {
            try {
                return Either.Right(function.apply(input));
            } catch (Exception e) {
                return Either.Left(Pair.of(e, input));
            }
        };
    }
}

// usage
items.stream()
     .filter(Objects::nonNull)
     .map(Either.liftWithValue(item -> raiseChecked(item)))
     .forEach(either -> System.out.println(either));
```

<br>

### Try
* `Scala` 등에서는 `Either` 대신 `Try`사용
* `Exception`과 success를 보유
* left가 `Exception`으로 고정된 **Either의 구현체**라고 생각하면 된다
* 실패시 `Exception`만 보유할 수 있기 때문에 **Either보다 유연성이 떨어진다**


<br>

## Step 5
* `Either`, `Try` 등의 type을 사용하여 성공, 실패 양쪽다 functional로 처리하고 싶은 경우

```java
public class PredicateSplitterConsumer<T> implements Consumer<T> {

    private Predicate<T> predicate;
    private Consumer<T> positiveConsumer;
    private Consumer<T> negativeConsumer;

    public PredicateSplitterConsumer(Predicate<T> predicate, Consumer<T> positiveConsumer, Consumer<T> negativeConsumer) {
        this.predicate = predicate;
        this.positiveConsumer = positiveConsumer;
        this.negativeConsumer = negativeConsumer;
    }

    @Override
    public void accept(T t) {
        if (predicate.test(t)) {
            positiveConsumer.accept(t);
            return;
        }
        negativeConsumer.accept(t);
    }
}

// usage
items.stream()
     .filter(Objects::nonNull)
     .map(Either.liftWithValue(this::raiseChecked))
     .forEach(new PredicateSplitterConsumer<>(Either::isLeft,
              either -> System.out.println(either.getLeft() + " left"),
              either -> System.out.println(either.getRight() + "right")));
```


<br>

## Step 6 - with io.vavr

### 1. Using CheckedFunction
```java
private Item raiseChecked(Item item) throws IOException {
    if (item.getId() % 2 == 0) {
        return item;
    }
    throw new IOException("error");
}


CheckedFunction1<Item, Item> raisedCheckedFunction = x -> raiseChecked(x);

// unchecked exception 발생시 stream이 끊기므로 주의
items.stream()
     .filter(Objects::nonNull)
     .map(raisedCheckedFunction.unchecked())  // wrapping with unchecked exception
     .forEach(output -> System.out.println("do something " + output));
```

<br>

### 2. Using helper methods
* 1의 방식을 위한 helper method 지원
```java
items.stream()
     .filter(Objects::nonNull)
     .map(API.unchecked(this::raiseChecked))
     .forEach(output -> System.out.println("do something " + output));
```
* unchecked exception을 처리해야 stream이 끊기지 않는다
* unchecked exception 처리를 위해 lambda block에 `try-catch`를 사용하면 lambda의 간결함이 손상 -> **Vavr lifting** 사용

<br>

### 3. Using Lifting
* concept from functional programming
* Option을 return하는 total function으로 `partial function`을 lift할 수 있다
* `partial function`
  * 전체 domain에 정의된 total function이 아닌 subset domain에 정의되는 function
  * 범위를 벗어난 input으로 partial function을 호출하면 일반적으로 exception 발생

```java
items.stream()  // Stream<Item>
     .filter(Objects::nonNull)
     .map(CheckedFunction1.lift(this::raiseChecked))  // Stream<Option<Item>>
     .map(x -> x.getOrElse(Item.NOT_FOUND))  // Stream<Item>
     .forEach(output -> System.out.println("do something " + output));
```


<br>

### 4. Using Try
* lift는 exception을 해결하지만, 실제로는 삼키므로 consumer는 exception을 모른다 -> `Try` 사용
* Try - exception을 묶을 수 있는 container
  * [Guide to Try in Vavr](https://www.baeldung.com/vavr-try) 참고

```java
items.stream()  // Stream<Item>
     .filter(Objects::nonNull)
     .map(CheckedFunction1.liftTry(this::raiseChecked))  // Stream<Try<Item>>
     .flatMap(Value::toJavaStream)  // Stream<Item>
     .forEach(output -> System.out.println("do something " + output));
```

<br>

### 5. Processing Multi Task
* `Try`를 사용해 다양한 function을 처리시 exception에도 견고한 stream을 사용하고 싶을 경우
```java
items.stream()
     .filter(Objects::nonNull)
     .map(item -> Try.of(() -> task1(item))
                     .andThen(() -> task2(item))
                     .andThen(() -> task3(item))
                     .filter(item1 -> item1.getId() != 2)
                     .onFailure(throwable -> System.out.println("fatal error " + throwable + "origin value: " + item)))  // try 자체로는 origin value를 알 수 없지만, 같은 scope에 있어서 가능
     .flatMap(Value::toJavaStream)  // Try.Success -> return origin value
     .forEach(output -> System.out.println("do something " + output));
```

* `Either`를 사용하면 origin vaule도 알 수 있다
```java
items.stream()
     .filter(Objects::nonNull)
     .map(item -> taskEither1(item).peekLeft(x -> System.out.println("task1 fatal error " + x.getFirst() + " origin value: " + x.getSecond())))
     .filter(Either::isRight)
     .map(either -> taskEither2(either.get()).peekLeft(x -> System.out.println("task2 fatal error " + x.getFirst() + " origin value: " + x.getSecond())))
     .filter(Either::isRight)
     .map(x -> taskEither3(x.get()))
     .flatMap(Value::toJavaStream)
     .forEach(x -> System.out.println("final: " + x));
```

<br>

## Conclusion
* checked exception 처리 방안으로는 아래 2가지가 있다
  * lambda의 try-catch에서 unchecked exception으로 변환
  * `Either`, `Try` type으로 stream의 data로 처리

<br><br>

> #### Reference
> * [Exception Handling in Java Streams - DZone](https://dzone.com/articles/exception-handling-in-java-streams)
> * [Exception Handling in Java Streams](https://medium.com/swlh/exception-handling-in-java-streams-5947e48f671c)
