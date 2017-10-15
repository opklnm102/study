# [Java] Convert a List to Map
> Java8에서 List를 Map으로 변환하는 과정을 정리해보고자 한다


## 준비
```java
// domain
public class Data {
    static Long sequence = 0L;
    
    private Long id;
    
    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public static Data newInstance() {
        Data data = new Data();
        data.setId(sequence++);
        return data;
    }
}

// List 생성
List<Data> datas = Stream.generate(Data::newInstance)
                        .limit(100)
                        .collect(Collectors.toList());
```


## 1. for-each
```java
Map<Long, Data> dataMap1 = new HashMap<>();

for(Data data : datas) {
    dataMap1.put(data.getId(), data);
}
```

## 2. Collectors.toMap() 
```java
// Collectors.toMap()
public static <T, K, U> Collector<T, ?, Map<K,U>> toMap(Function<? super T, ? extends K> keyMapper,
                                                        Function<? super T, ? extends U> valueMapper,
                                                        BinaryOperator<U> mergeFunction) {
    return toMap(keyMapper, valueMapper, mergeFunction, HashMap::new);
}

public static <T, K, U, M extends Map<K, U>>
    Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                                Function<? super T, ? extends U> valueMapper,
                                BinaryOperator<U> mergeFunction,
                                Supplier<M> mapSupplier) {
    BiConsumer<M, T> accumulator
                = (map, element) -> map.merge(keyMapper.apply(element),
                                              valueMapper.apply(element), mergeFunction);
    return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
}

// usage
Map<Long, Data> dataMap2 = datas.stream()
                .collect(Collectors.toMap(Data::getId, data -> data));
```

## 3. Collectors.toMap() - Function.identity()
* valueMapper에 `Function.identity()` 사용
```java
// Function.identity()
static <T> Function<T, T> identity() {
    return t -> t;
}

// usage
Map<Long, Data> dataMap4 = datas.stream()
                .collect(Collectors.toMap(Data::getId, Function.identity()));
```

## 4. Collectors.toMap() 사용시 Duplicate key Exception
* 2, 3번 방법 사용시 key 중복이 생기면 exception 발생
```java
Exception in thread "main" java.lang.IllegalStateException: java.lang.IllegalStateException: Duplicate key 999
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at java.util.concurrent.ForkJoinTask.getThrowableException(ForkJoinTask.java:593)
	at java.util.concurrent.ForkJoinTask.reportException(ForkJoinTask.java:677)
	at java.util.concurrent.ForkJoinTask.invoke(ForkJoinTask.java:735)
	at java.util.stream.ReduceOps$ReduceOp.evaluateParallel(ReduceOps.java:714)
	at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:233)
	at java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:499)
	at com.company.Main.main(Main.java:133)
Caused by: java.lang.IllegalStateException: Duplicate key 999
	at java.util.stream.Collectors.lambda$throwingMerger$0(Collectors.java:133)
	at java.util.HashMap.merge(HashMap.java:1253)
	at java.util.stream.Collectors.lambda$toMap$58(Collectors.java:1320)
	at java.util.stream.ReduceOps$3ReducingSink.accept(ReduceOps.java:169)
	at java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1374)
	at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:481)
	at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:471)
	at java.util.stream.ReduceOps$ReduceTask.doLeaf(ReduceOps.java:747)
	at java.util.stream.ReduceOps$ReduceTask.doLeaf(ReduceOps.java:721)
	at java.util.stream.AbstractTask.compute(AbstractTask.java:316)
	at java.util.concurrent.CountedCompleter.exec(CountedCompleter.java:731)
	at java.util.concurrent.ForkJoinTask.doExec(ForkJoinTask.java:289)
	at java.util.concurrent.ForkJoinPool$WorkQueue.runTask(ForkJoinPool.java:1056)
	at java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1692)
	at java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:157)
```

### 해결 - mergeFunction parameter 사용
* mergeFunction으로 key 중복시 어떤 value를 사용할지 지정해준다
```java
// 기존 value 사용
// 새로운 value를 사용하려면 (oldVal, newVal) -> newVal
Map<Long, Data> dataMap5 = datas.stream()
                .collect(Collectors.toMap(Data::getId, data -> data, (oldVal, newVal) -> oldVal));
```


## 성능 벤치마크
* code
```java
// generate list
List<Data> datas = Stream.generate(Data::newInstance)
                .limit(100)
                .collect(Collectors.toList());

/******* 1. for-each  ********/
long startTime = System.currentTimeMillis();

Map<Long, Data> dataMap1 = new HashMap<>();
    for(Data data : datas) {
        dataMap1.put(data.getId(), data);
    }

System.out.printf("%-50s during time : %d ms\n", "[for-each]", System.currentTimeMillis() - startTime);


/******* 2. stream  ********/
startTime = System.currentTimeMillis();

Map<Long, Data> dataMap2 = datas.stream()
                .collect(Collectors.toMap(Data::getId, data -> data));

System.out.printf("%-50s during time : %d ms\n", "[stream]", System.currentTimeMillis() - startTime);


/******* 3. stream - Function.identity()  ********/
startTime = System.currentTimeMillis();

Map<Long, Data> dataMap3 = datas.stream()
                .collect(Collectors.toMap(Data::getId, Function.identity()));

System.out.printf("%-50s during time : %d ms\n", "[stream Function.identity()]", System.currentTimeMillis() - startTime);


/******* 4. parallelStream  ********/
startTime = System.currentTimeMillis();

Map<Long, Data> dataMap4 = datas.parallelStream()
                .collect(Collectors.toMap(Data::getId, data -> data));

System.out.printf("%-50s during time : %d ms\n", "[parallelStream]", System.currentTimeMillis() - startTime);


/******* duplicate id  ********/
Data duplicationData = Data.newInstance();
duplicationData.setId(duplicationData.getId() - 1);
datas.add(duplicationData);

startTime = System.currentTimeMillis();

Map<Long, Data> dataMap5 = datas.stream()
                .collect(Collectors.toMap(Data::getId, data -> data, (oldVal, newVal) -> oldVal));

System.out.printf("%-50s during time : %d ms\n", "[stream duplicate id]", System.currentTimeMillis() - startTime);


/******* duplicate id - Function.identity()  ********/
startTime = System.currentTimeMillis();
Map<Long, Data> dataMap6 = datas.stream()
                .collect(Collectors.toMap(Data::getId, Function.identity(), (oldVal, newVal) -> oldVal));

System.out.printf("%-50s during time : %d ms\n", "[stream duplicate id, Function.identity()]", System.currentTimeMillis() - startTime);
```

* List의 item이 100건
```sh
[for-each]                                         during time : 0 ms
[stream]                                           during time : 3 ms
[stream Function.identity()]                       during time : 0 ms
[parallelStream]                                   during time : 5 ms
[stream duplicate id]                              during time : 2 ms
[stream duplicate id, Function.identity()]         during time : 1 ms
```


* List의 item이 1000건
```sh
[for-each]                                         during time : 2 ms
[stream]                                           during time : 6 ms
[stream Function.identity()]                       during time : 2 ms
[parallelStream]                                   during time : 7 ms
[stream duplicate id]                              during time : 2 ms
[stream duplicate id, Function.identity()]         during time : 1 ms
```

* List의 item이 10000건
```sh
[for-each]                                         during time : 7 ms
[stream]                                           during time : 7 ms
[stream Function.identity()]                       during time : 4 ms
[parallelStream]                                   during time : 13 ms
[stream duplicate id]                              during time : 2 ms
[stream duplicate id, Function.identity()]         during time : 3 ms
```

* List의 item이 100000건
```sh
[for-each]                                         during time : 23 ms
[stream]                                           during time : 24 ms
[stream Function.identity()]                       during time : 15 ms
[parallelStream]                                   during time : 33 ms
[stream duplicate id]                              during time : 7 ms
[stream duplicate id, Function.identity()]         during time : 9 ms
```

* List의 item이 1000000건
```sh
[for-each]                                         during time : 104 ms
[stream]                                           during time : 81 ms
[stream Function.identity()]                       during time : 27 ms
[parallelStream]                                   during time : 2996 ms
[stream duplicate id]                              during time : 121 ms
[stream duplicate id, Function.identity()]         during time : 33 ms
```

* List의 item이 10000000건
```sh
[for-each]                                         during time : 3644 ms
[stream]                                           during time : 1125 ms
[stream Function.identity()]                       during time : 5751 ms
[parallelStream]                                   during time : 9596 ms
[stream duplicate id]                              during time : 592 ms
[stream duplicate id, Function.identity()]         during time : 5495 ms
```

### 결론
* 무조건 갯수가 많을 때 parrel stream이 빠른 것은 아닌 것 같다. 어떤 연산을 사용하느냐에 속도가 다른듯



> #### 참고자료 
> * [Java 8 – Convert List to Map](https://www.mkyong.com/java8/java-8-convert-list-to-map/)
> * [Java 8 Streams API – Convert a List to Map](http://codecramp.com/java-8-streams-api-convert-list-map/)