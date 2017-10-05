# 10 Subtle Mistakes When Using the Streams API
> [Java 8 Friday: 10 Subtle Mistakes When Using the Streams API](https://blog.jooq.org/2014/06/13/java-8-friday-10-subtle-mistakes-when-using-the-streams-api/)를 읽고 정리

## 1. Accidentally reusing streams(재사용 스트림)
* stream은 오직 `1번만` 소비할 수 있다
```java
IntStream stream = IntStream.of(1, 2);
stream.forEach(x -> System.out::println(x));

// reusing
stream.forEach(x -> System.out::println(x));

exception throw
java.lang.IllegalStateException: 
  stream has already been operated upon or closed
```


## 2. Accidentally creating “infinite” streams(무한 스트림 생성)
```java
// 무한 스트림 생성
IntStream.iterate(0, i -> i + 1)
  .forEach(System.out::println);

// 의도치 않았다면 적절한 한계를 두는게 좋다
IntStream.iterate(0, i -> i + 1)
  .limit(10)
  .forEach(System.out::println);
```


## 3. Accidentally creating “subtle” infinite streams(의도치 않은 무한 스트림)
```java
// 영원히 limit(10)에 다다르지 못한다
IntStream.iterate(0, i -> (i + 1) % 2)  // 0, 1 반복 생성
  .distinct()  // 중복 제거
  .limit(10)  // 10개로 제한
  .forEach(System.out::println);  // 10개까지 출력
```


## 4. Accidentally creating “subtle” parallel infinite streams(의도치 않은 병렬 무한 스트림)
* 무한히 실행되면서, 시스템의 모든 리소스를 점거하게된다
```java
IntStream.iterate(0, i -> (i + 1) % 2)
  .parallel()
  .distinct()
  .limit(10)
  .forEach(System.out::println);
```


## 5. Mixing up the order of operations
* `limit()`와 `distinct()`의 순서를 바꾸면 잘 동작한다
```java
IntStream.iterate(0, i -> (i + 1) % 2)  // 0, 1 반복 생성
  .limit(10)  // 10개로 제한
  .distinct()  // 중복 제거
  .forEach(System.out::println);
```


## 6. Mixing up the order of operations (again)
```java
IntStream.iterate(0, i -> i + 1)  // 0, 1, 2, 3...
  .limit(10)  // 10개로 제한
  .skip(5)  // 5개 건너띔
  .forEach(System.out::println);

5
6
7
8
9
```


## 7. Walking the file system with filters
```java
Files.walk(Paths.get("."))  // 현재 dir의 모든 sub dir의 스트림 생성
  .filter(p -> !p.File().getName().startsWith("."))  // .으로 시작하는 것 filter
  .forEach(System.out::println);
```


## 8. Modifying the backing collection of a stream
* List를 순회하는 동안, iteration body안의 동일한 List는 수정하지 않아야한다
* 원하는 결과가 나오지 않는다
```java
// 0 ~ 9의 List 생성
List<Integer> list = 
  IntStream.range(0, 10)
    .boxed()
    .collect(toCollection(ArrayList::new));

// 사용 후 제거
list.stream()
  // remove(Object), not remove(int)
  .peek(list::remove)
  .forEach(System.out::println);
```


## 9. Forgetting to actually consume the stream
* 스트림은 소비를 하는 메소드를 호출해야 발생한다
```java
IntStream.range(1, 5)
 .peek(System.out::println)
 .peek(i -> {
   if(i == 5)
    throw new RuntimeException("bang");  // 스트림이 소비되지 않아 발생하지 않는다
 });

// JOOQ일 경우. excute(), fetch()를 호출하지 않으면 실행되지 않는다
DSL.using(configuration)
  .update(TABLE)
  .set(TABLE.COL1, 1)
  .set(TABLE.COL2, "abc")
  .where(TABLE.ID.eq(3));
```


## 10. Parallel stream deadlock
적절한 동기화를 하지않는다면 모든 병렬 시스템은 deadlock에 걸릴 수 있다
```java
Object[] locks = { new Object(), new Object() };
 
IntStream
    .range(1, 5)
    .parallel()
    .peek(Unchecked.intConsumer(i -> {
        synchronized (locks[i % locks.length]) {
            Thread.sleep(100);
 
            synchronized (locks[(i + 1) % locks.length]) {
                Thread.sleep(50);
            }
        }
    }))
    .forEach(System.out::println);

// 위 쓰레드가 각각 1번째 synchornized에 진입한 후에 2번째 synchornized에 진입하기 위해 무한정 기다린다
```

