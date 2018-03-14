# [Java] How to initialize a HashMap
> enum 생성자에 Map을 초기화하는 일 때문에 이리저리 삽질을 해서, HashMap을 초기화하는 방법을 정리해보고자 함


## Local Variable
```java
public Map<String, String> localMap() {
    Map<String, String> map = new HashMap<>();
    map.put("key1", "value1");
    map.put("key2", "value2");
    
    // map을 immutable하게 하기 위함
    return Collections.unmodifiableMap(map);
}
```


## Instance Variable
```java
public class MapTest {

    private Map<String, String> instanceMap = new HashMap<>();
    
    {
        instanceMap.put("key1", "value1");
        instanceMap.put("key2", "value2");
    }
}
```


## Static Variable
```java
public class MapTest {

    private static Map<String, String> staticMap = new HashMap<>();

    static {
        staticMap.put("key1", "value1");
        staticMap = Collections.unmodifiableMap(staticMap);
    }
}
```


## Double Brace
```java
public Map<String, String> doubleBrace() {
    return new HashMap<String, String>() {{
        put("key1", "value1");
        put("key2", "value1");
    }};
}
```
* 1번째 `{}`는 anonymous inner class 생성
* 2번째 `{}`는 anonymous inner class instance가 생성되면 실행되는 instance initializer block
   * static initializer는 class loader가 class load 완료시 실행
   * http://docs.oracle.com/javase/specs/jls/se5.0/html/classes.html#8.6
   * instance initializer는 `생성자 이전에 실행`되기 떄문에 주의
   * super class 생성자보다 먼저 실행되지는 않는다
* final class가 아닐 때만 작동


## Guava
```java
public Map<String, String> guavaBuilder() {
    return ImmutableMap.<String, String>builder()
        .put("key1", "value1")
        .put("key2", "value2")
        .build();
}

public Map<String, String> guavaOf() {
    return ImmutableMap.of("key1", "value1", "key2", "value2");
}
```

## Java8
```java
public Map<String, String> stdJava8() {
    return Collections.unmodifiableMap(Stream.of(
        new AbstractMap.SimpleEntry<>("key1", "value1"),
        new AbstractMap.SimpleEntry<>("key2", "value2"))
    .collect(Collectors.toMap(AbstractMap.SimpleEntry::getKey, AbstractMap.SimpleEntry::getValue)));
}

// static method로 가독성 향상
public static <K, V> Map.Entry<K, V> entry(K key, V value) {
    return new AbstractMap.SimpleEntry<>(key, value);
}

public static <K, V> Collector<Map.Entry<K, V>, ?, Map<K, V>> entriesToMap() {
    return Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue);
}

public static <K, V> Collector<Map.Entry<K, V>, ?, ConcurrentMap<K, V>> entriesToConcurrentMap() {
    return Collectors.toConcurrentMap(Map.Entry::getKey, Map.Entry::getValue);
}

public static Map<String, String> extJava8() {
    return Collections.unmodifiableMap(Stream.of(
        entry("key1", "value1"),
        entry("key2", "value2"))
    .collect(entriesToMap()));
}
```


> #### 참고
> * [How to directly initialize a HashMap (in a literal way)?](https://code.i-harness.com/en/q/67cc33)
> * [Java 8, Initializing Maps in the Smartest Way](http://minborgsjavapot.blogspot.kr/2014/12/java-8-initializing-maps-in-smartest-way.html)
> * [Double Brace Initialization](http://wiki.c2.com/?DoubleBraceInitialization)
