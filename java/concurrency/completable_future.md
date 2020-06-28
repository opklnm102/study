# [Java] CompletableFuture
> date - 2020.06.28  
> keyworkd - java, asynchronous, concurrency, future, completablefuture  
> Java 8 Concurrency API 개선으로 도입된 `CompletableFuture`에 대해 정리  
> 정리에 사용한 코드는 [completable-future-demo](https://github.com/opklnm102/completable-future-demo)에서 확인할 수 있다  

<br>

* asynchronous는 synchronous보다 tracking하기 어렵다
* callback code가 분산되어 있거나 nested callback으로 인한 callback hell로 readability 감소

<br>

## Future
* Java 5에 추가
* `java.util.concurrent.Future`
* asynchronous를 제공하지만 `get()`을 사용해서 결과를 받기 때문에 결국 **blocking** 발생
  * Spring Framework에서는 `ListenableFuture`로 해소 가능
* 결과를 조합하거나 오류 처리를 할 방법이 없다


<br>

## ListenableFuture
* `org.springframework.util.concurrent.ListenableFuture` 
* nested callback으로 인한 callback hell로 readability 감소


<br>

## CompletableFuture
* Java 8에 추가
* `java.util.concurrent.CompletableFuture`
* `Future` interface와 `CompletionStage` interface 구현
* Asynchronous code의 Readability 향상

<br>

### CompletionStage
* 다른 step과 결합할 수 있는 contract 정의
* step 마다 다른 step의 execution을 trigger하여 `CompletionStage`와 연결

```java
public interface CompletionStage<T> {
    public <U> CompletionStage<U> thenApply(Function<? super T,? extends U> fn);
    
    public <U> CompletionStage<U> thenApplyAsync(Function<? super T,? extends U> fn);
    
    public CompletionStage<Void> thenAccept(Consumer<? super T> action);
    
    public CompletableFuture<T> toCompletableFuture();
    ...
}
```

<br>


## CompletableFuture API

### xxxAsync
* suffix가 Async인 method는 default로 기존의 `ExecutorService` 사용하거나 다른 것 사용 가능
* e.g. runAsync(), supplyAsync() 등

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
    ...
    public static CompletableFuture<Void> runAsync(Runnable runnable) {
        return asyncRunStage(ASYNC_POOL, runnable);
    }
    
    public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor) {
        return asyncRunStage(screenExecutor(executor), runnable);
    }
    ...
}
```

<br>

### runAsync
* Runnable Functional Interface
  * input X
  * output X
* input과 output이 없는 작업 수행시 사용

```java
public static CompletableFuture<Void> runAsync(Runnable runnable);

public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor);
```

#### Usage
```java
CompletableFuture.runAsync(() -> System.out.println(Thread.currentThread().getName() + " runAsync"))  // asynchronous
                 .get();  // blocking
```
* Result
```java
ForkJoinPool.commonPool-worker-19 runAsync
```

<br>

### supplyAsync
* Supplier Functional Interface
  * input X
  * output O
* input 없이 output이 있는 작업 수행시 사용

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier);

public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor);
```

#### Usage
```java
String result = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync");
    return "ok";
})
                                  .get();

System.out.println(Thread.currentThread().getName() + " supplyAsync");
```

* Result
```java
ForkJoinPool.commonPool-worker-19 supplyAsync
main supplyAsync, result : ok
```

<br>

### thenAccept, thenAcceptAsync
* Consumer Functional Interface
  * input O
  * output X
* input에 대한 output이 없는 작업 수행시 사용

```java
public CompletableFuture<Void> thenAccept(Consumer<? super T> action);

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action);

public CompletableFuture<Void> thenAcceptAsync(Consumer<? super T> action, Executor executor);
```

#### Usage
```java
CompletableFuture.runAsync(() -> System.out.println(Thread.currentThread().getName() + " runAsync"))
                 .thenAccept(aVoid -> System.out.println(Thread.currentThread().getName() + " " + aVoid));

CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync");
    return "ok";
})
                 .thenAccept(s -> System.out.println(Thread.currentThread().getName() + " s"));
```

* Result
```java
ForkJoinPool.commonPool-worker-19 runAsync
main null
ForkJoinPool.commonPool-worker-19 supplyAsync
main s
```

<br>

### thenApply, thenApplyAsync
* Function Functional Interface
  * input O
  * output O
* input에 대한 output이 있는 작업 수행시 사용
  * e.g. data transformation
* ListableFuture의 callback과 동일

```java
public <U> CompletableFuture<U> thenApply(Function<? super T,? extends U> fn);

public <U> CompletableFuture<U> thenApplyAsync(Function<? super T,? extends U> fn);

public <U> CompletableFuture<U> thenApplyAsync(Function<? super T,? extends U> fn, Executor executor);
```

#### Usage
```java
CompletableFuture.runAsync(() -> System.out.println(Thread.currentThread().getName() + " runAsync"))
                 .thenApply(aVoid -> {
                     System.out.println(Thread.currentThread().getName() + " thenApply");
                     return "ok2";
                 })
                 .thenAccept(s -> System.out.println(Thread.currentThread().getName() + " " + s));
```

* Result
```java
ForkJoinPool.commonPool-worker-19 runAsync
main thenApply
main ok2
```

<br>

### thenCompose, thenComposeAsync
* `CompletableFuture`를 chain으로 실행하고 싶을 때 사용
  * chain - `CompletionStage`를 사용하여 output을 다른 step의 input으로 전달
* Parallel X
  * 순차적으로 실행
  * 하나의 thread pool

```java
public <U> CompletableFuture<U> thenCompose(Function<? super T, ? extends CompletionStage<U>> fn);

public <U> CompletableFuture<U> thenComposeAsync(Function<? super T, ? extends CompletionStage<U>> fn);

public <U> CompletableFuture<U> thenComposeAsync(Function<? super T, ? extends CompletionStage<U>> fn, Executor executor);
```

#### Usage
```java
CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync");
    return "ok";
})
                 .thenCompose(s -> CompletableFuture.completedFuture(s + " 2"))
                 .thenCompose(s -> CompletableFuture.completedFuture(s + " 3"))
                 .thenAccept(s -> System.out.println(Thread.currentThread().getName() + " complete " + s));
```

* Result
```java
ForkJoinPool.commonPool-worker-19 supplyAsync
main complete ok 2 3
```

<br>

### thenCombine, thenCombineAsync
* `CompletableFuture`의 결과를 조합할 때 사용
* Parallel O
  * 별도의 Thread Pool 사용
* 각 step의 output을 조합하여 처리

```java
public <U,V> CompletableFuture<V> thenCombine(CompletionStage<? extends U> other, BiFunction<? super T,? super U,? extends V> fn);

public <U,V> CompletableFuture<V> thenCombineAsync(CompletionStage<? extends U> other, BiFunction<? super T,? super U,? extends V> fn);

public <U,V> CompletableFuture<V> thenCombineAsync(CompletionStage<? extends U> other, BiFunction<? super T,? super U,? extends V> fn, Executor executor);
```

#### Usage
```java
var secondCompletableFuture = CompletableFuture.supplyAsync(() -> {
    try {
        TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    System.out.println(Thread.currentThread().getName() + " supplyAsync - 2");
    return "second";
});

CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 1");
    return "first";
})
                  .thenCombine(secondCompletableFuture, (s1, s2) -> s1 + " and " + s2)
                  .thenAccept(s -> System.out.println(Thread.currentThread().getName() + " complete " + s));

try {
    TimeUnit.SECONDS.sleep(3);
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

* Result
```java
ForkJoinPool.commonPool-worker-5 supplyAsync - 1
ForkJoinPool.commonPool-worker-19 supplyAsync - 2
ForkJoinPool.commonPool-worker-19 complete first and second
```

<br>

### allOf
* `CompletableFuture`가 모두 완료되었을 경우 처리

```java
public static CompletableFuture<Void> allOf(CompletableFuture<?>... cfs);
```

#### Usage
```java
var completableFuture1 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 1");
    return "1";
});

var completableFuture2 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 2");
    return "2";
});

var completableFuture3 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 3");
    return "3";
});

var futures = Arrays.asList(completableFuture1, completableFuture2, completableFuture3);

CompletableFuture.allOf(completableFuture1, completableFuture2, completableFuture3)
                 .thenAccept(s -> {
                     System.out.println(Thread.currentThread().getName() + " allOf " + s);
                     
                     var results = futures.stream()
                                          .map(CompletableFuture::join)
                                          .collect(Collectors.toList());
                     System.out.println(Thread.currentThread().getName() + " allOf " + results.toString());
                });
```

* Result
```java
ForkJoinPool.commonPool-worker-19 supplyAsync - 1
ForkJoinPool.commonPool-worker-19 supplyAsync - 2
ForkJoinPool.commonPool-worker-19 supplyAsync - 3
main allOf null
main allOf [1, 2, 3]
```

#### Example
* `CompletableFuture.allOf()`를 사용하여 **동시에 n개의 request 후 모두 완료시 callback 진행**
* thenAcceptAsync에서 모두 모아 처리
* **선후 관계가 없는 데이터를 동시에 조회**할 때, 적절히 사용 가능

```java
public void doTask() throws Exception {
    var task1 = CompletableFuture.supplyAsync(() -> buildMessage(1));
    var task2 = CompletableFuture.supplyAsync(() -> buildMessage(2));
    var task3 = CompletableFuture.supplyAsync(() -> buildMessage(3));

    var tasks = Arrays.asList(task1, task2, task3);
    CompletableFuture.allOf(tasks.toArray(new CompletableFuture[3]))
                     .thenApplyAsync(result -> tasks.stream()
                                                    .map(CompletableFuture::join)
                                                    .collect(Collectors.toList()))
                     .thenAcceptAsync(messages -> messages.forEach(message -> System.out.println(Thread.currentThread().getName() + " " + message)));

    try {
        TimeUnit.SECONDS.sleep(5);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}

private String buildMessage(int index) {
    try {
        TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return index + " Completed!!";
}
```

* Result
```java
ForkJoinPool.commonPool-worker-23 1 Completed!!
ForkJoinPool.commonPool-worker-23 2 Completed!!
ForkJoinPool.commonPool-worker-23 3 Completed!!
```

<br>

### anyOff
* `CompletableFuture`가 하나라도 완료되었을 경우 처리

```java
public static CompletableFuture<Object> anyOf(CompletableFuture<?>... cfs);
```

#### Usage
```java
var completableFuture1 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 1");
    return "1";
});

var completableFuture2 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 2");
    return "2";
});

var completableFuture3 = CompletableFuture.supplyAsync(() -> {
    System.out.println(Thread.currentThread().getName() + " supplyAsync - 3");
    return "3";
});

var futures = Arrays.asList(completableFuture1, completableFuture2, completableFuture3);

CompletableFuture.anyOf(completableFuture1, completableFuture2, completableFuture3)
                 .thenAccept(s -> {
                     System.out.println(Thread.currentThread().getName() + " anyOf " + s);
                     
                     var results = futures.stream()
                                          .map(CompletableFuture::join)
                                          .collect(Collectors.toList());
                     System.out.println(Thread.currentThread().getName() + " anyOf " + results.toString());
                });
```

* Result
```java
ForkJoinPool.commonPool-worker-5 supplyAsync - 1
ForkJoinPool.commonPool-worker-5 supplyAsync - 2
ForkJoinPool.commonPool-worker-5 supplyAsync - 3
main anyOf 1
main anyOf [1, 2, 3]
```

#### Example
* `CompletableFuture.anyOf()`를 사용하여 **동시에 n개의 request 후 하나라도 완료시 callback 진행**
* thenAcceptAsync에서 callback 처리

```java
public void doTask() throws Exception {
    
    var task1 = CompletableFuture.supplyAsync(() -> buildMessage(1));
    var task2 = CompletableFuture.supplyAsync(() -> buildMessage(2));
    var task3 = CompletableFuture.supplyAsync(() -> buildMessage(3));

    var tasks = Arrays.asList(task1, task2, task3);
    CompletableFuture.anyOf(tasks.toArray(new CompletableFuture[3]))
                     .thenAcceptAsync(message -> System.out.println(Thread.currentThread().getName() + " " + message));

    try {
        TimeUnit.SECONDS.sleep(5);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}

private String buildMessage(int index) {
    try {
        TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return index + " Completed!!";
}
```

* Result
```java
ForkJoinPool.commonPool-worker-23 2 Completed!!
```

<br>

### exceptionally
* Function Functional Interface
  * input O
  * output O
* input으로 `Throwable`을 처리하여 output 생성
* `ListableFuture`의 `Callback.onFailure`
* `ListableFuture`와 다르게 각 step에서 처리하는게 아니라 하나의 step에서 통합적으로 처리

```java
public CompletableFuture<T> exceptionally(Function<Throwable, ? extends T> fn);

public CompletableFuture<T> exceptionallyAsync(Function<Throwable, ? extends T> fn);

public CompletableFuture<T> exceptionallyAsync(Function<Throwable, ? extends T> fn, Executor executor);

public CompletableFuture<T> exceptionallyCompose(Function<Throwable, ? extends CompletionStage<T>> fn);

public CompletableFuture<T> exceptionallyComposeAsync(Function<Throwable, ? extends CompletionStage<T>> fn);

public CompletableFuture<T> exceptionallyComposeAsync(Function<Throwable, ? extends CompletionStage<T>> fn, Executor executor);
```

#### Usage
```java
CompletableFuture.runAsync(() -> System.out.println(Thread.currentThread().getName() + " runAsync"))
                 .thenApply(aVoid -> {
                     System.out.println(Thread.currentThread().getName() + " thenApply");
                     throw new RuntimeException("error!");
                })
                 .exceptionally(throwable -> {
                     System.out.println(Thread.currentThread().getName() + " " + throwable);
                     return "failed";
                })
                 .thenAccept(s -> System.out.println(Thread.currentThread().getName() + " " + s));
```

* Result
```java
ForkJoinPool.commonPool-worker-19 runAsync
main thenApply
main java.util.concurrent.CompletionException: java.lang.RuntimeException: error!
main failed
```


<br>

## Conclusion
* Asynchronous 처리를 위해 `CompleteableFuture`를 사용한다고 해도 중간에 blocking(e.g. DB)이 들어가면 의미가 없기 때문에 아직은 **API Gateway**같이 blocking 연산이 없는 곳에서 사용해야 효율적


<br><br>

> #### Reference
* [20 Examples of Using Java’s CompletableFuture](https://dzone.com/articles/20-examples-of-using-javas-completablefuture)
* [CompletableFuture 자바 비동기 프로그래밍을 위한 CompletableFuture 검토](https://brunch.co.kr/@springboot/267)
