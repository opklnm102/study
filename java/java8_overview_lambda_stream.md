# [Java] Java8 Overview Lambda, Stream API
> [Java8 overview](http://www.slideshare.net/devsejong/8-0-java8-overview) </br>
> [Java8 Stream API](http://www.slideshare.net/devsejong/8-2-stream-api) </br>
> [Java8 Stream API Advance](http://www.slideshare.net/devsejong/3-stream-api-advance) </br>
> 위의 자료들을 마크다운으로 정리 -  빠진 내용있음</br>
> 생성일자: 2016.12.16 </br>
> 수정일자: yyyy.MM.dd


## Java8
* 함수형 프로그래밍
  * 람다 표현식
  * 디폴트 메소드
  * 메소드 레퍼런스
* 스트림 API
  * 병렬 처리
* JodaTime을 개선한 Date API
  * 동시성 API 개선

## 얻을 수 잇는 것
* 간결함
* 가독성
* 성능(멀티 스레드)


## 정리
* 함수가 일급(first class)이 되었다
  * `Lambda`를 통해 익명클래스 단순화
  * `Method Reference`로 `Lambda`를 보다 간단하게 작성
* `Default Method` 추가
  * `Interface`에 메소드 바디를 제공
* `Stream`기능 추가
  * 복잡한 컬렉션 조작을 단순화
  * 기존에 복잡했던 병렬처리도 쉽게 구현 가능


# Lambda Expression
* Lambda
  * 익명함수 Block의 메모리상 주소값
* Method reference
  * Method Block의 메모리상 주소값

## 람다식 사용
* `(람다 파라미터) -> 람다로직`

### 람다식의 작성
```java
* (int n, String str) -> { return str + n; } /* 구문블럭 */

* (int n, String str) -> str + n /* 식 */

* (n, str) /* 타입추론 */ -> str + n

* str /* 단일 인자 괄호 생략 */-> str + 1

* () /* 빈인자 */ -> "Hello, World!"

* () -> {}
```

### Example
#### Runnable
```java
// Java7 - 익명클래스
    Runnable r = new Runnable() {
        @Override
        public void run() {
            System.out.print("hello");
        }
    };
        
// Java8 - 람다식
Runnable r = () -> System.out.print("hello");
```

#### 정렬
```java
// Java7
ArrayList<Product> products = new ArrayList<>();
Collections.sort(products, new Comparator<Product>() {
    @Override
    public int compare(Product o1, Product o2) {
        return Integer.compare(o1.getPrice(), o2.getPrice());
    }
});

// Java8
ArrayList<Product> products = new ArrayList<>();
Collections.sort(products, 
    (o1, o2) -> Integer.compare(o1.getPrice(), o2.getPrice()));
```

## Method Reference 사용
* `객체or클래스 :: 메소드`
```java
// product -> product.getPrice() => Product::getPrice
products.stream()
    .map(Product::getPrice)
    .map(price -> price * 1000);
```


## Default method
* `default` 키워드를 사용하면 interface에 메소드를 바로 설정 가능
* 기존의 구현체 구조를 변경하지 않고도 새로운 기능 추가 가능
```java
// Ex. Iterable<T> interface
public interface Iterable<T> {
    /**
     * Returns an iterator over elements of type {@code T}.
     * @return an Iterator.
     */
    Iterator<T> iterator();
    
   /**
     *
     * @param action The action to be performed for each element
     * @throws NullPointerException if the specified action is null
     * @since 1.8
     */
    default void forEach(Consumer<? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }
    ...
 ```

## 함수형 인터페이스
* 하나의 추상 메소드를 가진 인터페이스만 람다로 사용 
* `default method`가 여럿 있더라도, 추상메소드가 하나일 경우
* Interface 내부에 선언된 ***유일한 메소드에 람다의 몸체가 정의***
* `@FunctionalInterface`로 명시적으로 표기


# Stream API
* 스트림이란 한번에 한개씩 만들어지는 ***연속적인 데이터들의 모임***
* 작업을 ***높은 수준으로 추상화***해서 스트림으로 만들어 처리할 수 있다.
* 조립할 수 있음
  * 메소드들을 연결, 복잡한 연산을 처리하는 로직을 쉽고 유연하게 작성 가능
* 스트림을 조작할 수 있는 다양한 메소드 지원
  * `filter()`
  * `map()`
  * `limit()`
  * `collect()`
* 스트림 파이프라인을 이용해서 ***추상화된 병렬 처리***가 가능
  * `parallel()`만 쓰면 병렬로 데이터 처리 가능

### Example
* 가격이 1000이하의 상품을 정렬한 뒤 이름 출력
 ```java
// Java7
for(Product p : products){
    if(p.getPrice() <= 1000){
        lowPriceProducts.add(p);
    }
}
// 정렬
Collections.sort(lowPriceProducts, new Comparator<Product>() {
    @Override
    public int compare(Product o1, Product o2) {
        return Integer.compare(o1.getPrice(), o2.getPrice());
    }
});
// 이름 추출
List<String> lowPriceProductNames = new ArrayList<>();
for(Product p : lowPriceProducts){
    lowPriceProductNames.add(p.getName());
}

// Java8
lowPriceProductNames = products.stream()
    .filter(p -> p.getPrice() <= 1000)
    .sorted((o1, o2) -> Integer.compare(o1.getPrice(), o2.getPrice()))
    .map(Product::getName)
    .collect(Collectors.toList());

// Java8 - 병렬처리
lowPriceProductNames = products.stream()
            .parallel()  // 병렬로 처리
            .filter(p -> p.getPrice() <= 1000)
            .sorted((o1, o2) -> Integer.compare(o1.getPrice(), o2.getPrice()))
            .map(Product::getName)
            .collect(Collectors.toList());
 ```    

* 가장 비싼 금액 찾기
```java
products.stream()
    .max((o1, o2) -> Integer.compare(o1.getPrice(), o2.getPrice()))
    .get();
```

* price를 기준으로 나누기기
```java
Map<String, List<Product>> groupedProduct = products.stream()
    .collect(Collectors.groupingBy(p -> {
        if(p.getPrice() <= 1000){
            return "low";
        }else{
            return "high";
        }
    })); 
```
      

## 컬렌션 vs 스트림 API
* 컬렉션과 스트림 모두 연속된 요소 형식의 값을 저장하는 자료형 인터페이스
* 둘다 순차적으로 요소에 접근
* 가장 큰 차이 - 데이터를 언제 계산하느냐
  * 컬렉션 - 각 계산식을 만날때마다 데이터가 계산된다.
    * 자료를 저장하는데 특화
    * 연산과정 직접작성
    * 순차적으로 진행
  * 스트릠 - 최종연산이 실행될 때 데이터가 계산된다.
    * 요소들을 연산하기 위한 자료형
    * 연산은 라이브러리가 알아서
    * 종결연산 메소드에서 한꺼번에 진행

### 데이터 접근 측면
* 컬렉션
  * 주요관심사 - 자료구조이므로 데이터에 접근, 읽기, 변경, 저장같은 연산(직접 데이터 핸들링)
  * 데이터에 접근하는 방법을 직접 작성
* 스트림
  * 주요관심사 - filter(), sorted(), map()처럼 계산식(람다)의 표현(계산식을 JVM으로 던진다)
  * 데이터에 접근하는 방법이 추상화
### 데이터 계산 측면
* 컬렉션
  * 작업을 위해 Iterator로 모든 요소를 순환
  * 메모리에 모든 요소가 올라간다
  * 모든 요소가 메모리에 올라가 있는 상태에서 요소를 누적시키며 결과를 계산
  * 메모리 사용량 up, 연산속도 down   
* 스트림
  * 계산식(알고리즘 or 람다)을 미리 적어두고 계산시에 람다로 JVM에 넘긴다
  * 내부에서 요소를 어떻게 메모리에 올리는지는 관심사가 아니다
  * 계산 요청시 결과가 바로 리턴
  * 메모리 사용량 down, 연산속도 up

## 스트림 API 특징    
### 스트림 연산은 2가지로 구분
* 중간연산 - filter(), map(), limit()는 서로 연결되어 파이프라인 형성
  * 파이프라인으로 연결되어 선언식이 최종연산으로 전달
* 최종연산 - collect()로 마지막 파이프라인을 수행후 완료
  * 중간연산 정보를 스트림으로 입력받아 최종연산에서 한번에 처리
### Optional
* 값이 있거나 없는 경우를 표현하기위한 클래스
```java
private Optional<Product> product;
// Null이 나온다는 것을 경고
if(product.isPresent()){
    product.get();
}
// 값이 없을 경우 기본값 설정 가능
product.orElse(new Product("default"));
```

* null이 아니면서 price가 1000이상이면 high 출력
```java
// Java7
Product product;
if(product != null && product.getPrice() >= 1000){
    //Todo: ...
}

// Java8
Optional<Product> product;
product.filter(product -> product.getPrice() >= 1000)
    .ifPresent(() -> {
        //Todo: ...
    });
```
        
## 스트림 API 활용

### 스트림 API 데이터 연산
#### 필터링/슬라이싱
* `filter()` - Predicate를 인자로 받아 참인 요소만을 반환
```java
products.stream()
       .filter(product -> product.getPrice() >= 1000)
       .collect(Collectors.toList());
```  
* distinct() - 유일한 값 반환
 ```java
products.stream()
       .distinct()
       .forEach(System.out::println);
```
* limit() - 지정된 숫자만큼 반환
```java
products.stream()
        .limit(3)
       .collect(Collectors.toList());
```
* skip() - 지정된 숫자를 무시하고 나머지 반환
```java
products.stream()
        .skip(3)
        .collect(Collectors.toList());
```
 
#### 매핑
* `map()` - 스트림의 T객체 U로 변환. 파라미터로 Function<T, U> 사용
```java
products.stream()
        .map(Product::getPrice)
        .reduce((price1, price2) -> price1 + price2);
```
* `flatMap()` - 각 요소의 값을 분해하여 스트림으로 변환

#### 검색/매칭
* `anyMatch()` - Predicate가 적어도 한 요소와 일치하는지 확인
```java
products.stream()
        .filter(product -> product.getPrice() >= 1000)
        .anyMatch(product -> product.getPrice() >= 1200);
```
* `allMatch()` - Predicate가 모든 요소와 일치하는지 확인
```java
products.stream()
        .filter(product -> product.getPrice() >= 1000)
        .allMatch(product -> product.getPrice() >= 1200);
```
* `allMatch()` - Predicate가 모든 요소와 불일치하는지 확인
```java
products.stream()
        .filter(product -> product.getPrice() >= 1000)
        .noneMatch(product -> product.getPrice() >= 1200);
```
* `findAny()` - 현재 스트림에서 임의의 요소 반환
```java
 products.stream()
        .filter(product -> product.getPrice() >= 1000)
        .findAny();
```
* `findFirst()` - 현재 스트림에서 첫번째 요소 반환
```java
products.stream()
        .filter(product -> product.getPrice() >= 1000)
        .findFirst();
```
            
#### 리듀싱
* `reduce[연산]` - reduce(init, operator) or reduce(operator) 형태로 사용
```java
products.stream()
        .map(Product::getPrice)
        .reduce(0, (price1, price2) -> price1 + price2);
```  
* `reduce[최대값, 최소값]`
```java
 Arrays.asList(3, 4, 5, 6, 7, 8, 8)
        .stream()
        .reduce(0, Integer::max);
```
        
#### 정렬
* `sort()` - Comparator를 사용. 스트림의 요소를 정렬
```java
Arrays.asList(3, 4, 5, 6, 7, 8, 8)
            .stream()
            .sorted(Integer::compareTo);
```

#### 스트림 생성
* `Stream.fo(data..)`
```java
Stream.of(3, 4, 5, 6, 7, 8, 8);
```            
* `Stream.iterator(seed, operator)`
```java
Stream.iterate(0, n -> n + 2)
            .limit(10)
            .forEach(System.out::print);
```         
* `Stream.generate(() -> T)`
```java
Stream.generate(Math::random)
            .limit(10)
            .forEach(System.out::print);
```          
* `Arrays.stream(Array[])`
```java
int[] numbers = {3, 4, 5, 6, 7, 8, 8};
Arrays.stream(numbers)
             .sum();
```
            
#### 기본형 특화 스트림
* 숫자집합 스트림에서 sum()을 제공하지 않는다.
```java
Arrays.asList(3, 4, 5, 6, 7, 8, 8)
                .stream()
                .sum();  // X
```
* reduce를 사용하여 데이터를 연산할 수 있지만 직관적이지 않다
```java
Arrays.asList(3, 4, 5, 6, 7, 8, 8)
                .stream()
                .reduce(0, Integer::sum);
```
* Autoboxing에 따른 성능저하
##### 숫자형일 경우 3가지의 특화 스트림 제공
* IntStream
* LongStream
* DoubleStream

##### 숫자형일 경우 사용가능한 메소드 제공
```java 
IntSummaryStatistics statistics = IntStream.rangeClosed(1, 100)
                                         .summaryStatistics();
```

##### 필요에 따라 Wrapper타입으로 변환 가능
```java
IntStream.rangeClosed(1, 100)
                .boxed()  // Boxing
                .reduce(0, Integer::sum);
```  

##### 생성
```java
IntStream.of(1, 2, 3);  // 1, 2, 3
                IntStream.iterate(0, i -> i + 2).limit(3);  // 0, 2, 4
                IntStream.range(1, 3);  // 1, 2
                IntStream.rangeClosed(1, 3);  // 1, 2, 3
```
                
### 데이터 수집하기
* 통화별로 트랜잭션을 그룹화한 다음 해당 통화의 합계를 계산
  * `Map<Currency, Integer>` 반환
* 트랜잭션을 나라별로 그룹화 한뒤, 각 트랜잭션의 5000이상일 경우를 구분하여 리스트로 반환
  * `Map<String, Map<Boolean, List<Transaction>>>` 반환
```java
// 각 트랜잭션을 Currency로 분류하여 반환
Map<Currency, Integer> resultCurrencies = new HashMap<>();
for(Transaction transaction : transactions){
    Currency currency = transaction.getCurrency();
        List<Transaction> transactionsForCurrency = resultCurrencies.get(currency);

        if(transactionsForCurrency == null){
            transactionsForCurrency = new ArrayList<>();
            resultCurrencies.put(currency, transactionsForCurrency);
        }
        transactionsForCurrency.add(transaction);
    }

// 각 트랜잭션을 Currency로 묶은 다음 반환
Map<Currency, List<Transaction>> transactionsByCurrencies =
    transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getCurrency));
```
    
#### Collector 소개
* `collect()`
  * Stream ***최종연산 메소드***
  * collect 종결연산 메소드 스트림의 결과를 수집
  * 인자로 Collector<T, A, R>의 구현체를 받는다.
  * Collector에서 결과값에 대한 연산작업 정의
* Collectors
  * 자주 사용되는 Collector의 구현체를 제공하는 팩토리 메소드들의 집합 클래스
  * 스트림 요소를 하나의 값으로 리듀스 또는 요약
  * 스트림 요소 그룹화
  * 스트림 요소 분할
    
#### 리듀싱과 요약
* 각 요소의 값을 줄여가며, 하나의 결과값을 반환
* 각 요소들의 최대값, 최소값, 평균등의 값을 도출

* `maxBy()`, `minBy()` - 최대, 최소값 도출
```java
Product mostPriceProduct = products.stream()
                .collect(Collectors.maxBy(Comparator));
```

* `summingInt()`, `summingLong()`, `sumingDouble()` - 합 도출
* `averageInt()`, `averageLong()`, `averageDouble()` - 평균 도출
```java
Product mostPriceProduct = products.stream()
                 .collect(Collectors.summingInt(Product::getPrice));
```

* `summarizingInt()` - 합계, 평균, 최소값, 최대값의 정보를 한꺼번에 가져온다.
```java
Product mostPriceProduct = products.stream()
                 .collect(Collectors.summarizingInt(Product::getPrice));
```
* `joining()` - 문자열 연결
```java
String productNames = products.stream()
                 .map(Product::getName)
                 .collect(Collectors.joining(", "));
```
* `reducing()` - 펙토리 메소드를 사용하면 연산 내부 로직을 직접 정의할 수 있다.
```java
int productPriceTotal = products.stream()
                 .collect(Collectors.reducing(
                         0, /* 연산의 시작값 */
                         p -> p.getPrice(), /* 연산의 대상이되는 값 추출*/
                         (i, j) -> {i + j})); /* BinaryOperator로 두값을 합침 */
        
Optional<Product> maxPriceProduct = products.stream()
            .collect(Collectors.reducing(
            /* BinaryOperator 연산 진행 */
            (p1, p2) -> p1.getPrice() > p2.getPrice() ? p1 : p2
            ));
```       

#### 그룹화
* `groupingBy()` - 각 요소들의 조건에 따라 묶은 결과값을 만든다.
```java
Map<Product.Status, List<Product>> productByType = products.stream()
                 .collect(Collectors.groupingBy(Product::getStatus));
```
* 2번째 파라미터로 Collector 사용 가능
  * 추가적인 그룹화나 갯수를 세는 등의 작업 가능
  ```java
  Map<Product.Status, List<Product>> productByType = products.stream()
                 .collect(Collectors.groupingBy(
                         Product::getStatus, 
                         Collectors.counting()));

  Map<Product.Status, List<Product>> productByType = products.stream()
                .collect(Collectors.groupingBy(
                        Product::getStatus,
                        Collectors.groupingBy(Product::isSellerInfo)));
  ```
* `collectingAndThen()` - 결과값 재가공
```java
//Todo:
```

#### 분할 - Predicate를 분류함수로 사용하는 그룹화 기능
```java
// false = [ pork, beef, chicken, prawns, salmon ]
// true = [ french fries,rice, season fruit, pizza ]
Map<Boolean, List<Dish>> partitionedMenu = Dish.menu.stream()
            .collect(Collectors.partitioningBy(Dish::isVegetarian));
// false = {FISH=[prawns, salmon], MEAT =[pork, beef, chicken]}
// true ={OTHER=[french fries,rice, season fruit, pizza]}
Map<Boolean, Map<Type, List<Dish>> partAndGroupDishes = Dish.menu.stream()
                .collect(Collectors.partitioningBy(
                        Dish::isVegetarian,
                        Collectors.groupingBy(Dish::getType)));    
```
        
#### Collector 인터페이스와 구현
```java
//Todo: 추후 각 메소드들의 역할을 알아보자...
public interface Collector<T, A, R> {
   
    Supplier<A> supplier();

    BiConsumer<A, T> accumulator();
   
    BinaryOperator<A> combiner();

    Function<A, R> finisher();

    Set<Characteristics> characteristics();
}
```

## 병렬스트림 사용하기
```java
Stream.iterate(1, i -> i + 1)
        .parallel()  // 병렬 연산
        .limit(3)
        .reduce(0, Integer::sum);
```

### 병렬로 처리하기 전 데이터를 작은 단위로 잘라낸다.

if(태스크가 충분히 작거나 더 이상 분할할 수 없으면){
        순차적으로 태스크 계산
} else {
    태스크를 두 서브 태스크로 분할
    태스크가 다시 서브 태스크로 분할되도록 재귀 호출
    모든 서브태스크의 연산이 완료될때까지 기다림
    각 서브 태스크의 결과를 합침
}
    
### 병렬스트림은 결코빠르지 않다.
* 처리과정
  1. 스레드를 만들고 초기화
  2. 데이터를 여러개의 청크로 분리
  3. 각 스레드에 청크를 할당하고 계산
  4. 각 스레드의 결과를 하나로 병합
    
### Example
* 1 ~ 10,000,000까지 값을 더하는 로직은 for-loop방식이 훨씬빠르다
```java
// 10ms 소요
    public static long iterativeSum(long n){
        long result = 0;
        for(long i=0; i<=n; i++){
            result += i;
        }
        return result;
    }
    // 140ms 소요
    public static long sequentialSum(long n){
        return Stream.iterate(1L, i -> i + 1)
                .limit(n)
                .reduce(Long::sum)
                .get();
```

* 병렬 스트림으로 실행했을 때 오히려 낮은 성능
  * `iterate()`가 박싱된 객체 생성 -> 언박싱 비용필요
  * `iterate()`는 독립적인 청크로 분할하기 어려워 병렬로 실행X
```java
// 142ms 소요
    public static long parallelSum(long n){
        return Stream.iterate(1L, i -> i + 1)
                .limit(n)
                .parallel()
                .reduce(Long::sum)
                .get();
```
* LongStream + 고정크기로 성능개선
  * `rangeClosed()`사용시 기본형을 직접사용하므로 박싱, 언박싱 비용 X
  * 범위가 고정되어 있으므로 쉽게 청크를 분할
  ```java
  // 20ms
  public static long rangedSum(long n){
          return LongStream.rangeClosed(1, n)
                .reduce(Long::sum)
                .getAsLong();
  }
  ```
* 드디어!! for-loop보다 ***비용이 결코 작지 않다***
```java
// 4ms
    public static long parallelRangedSum(long n){
        return LongStream.rangeClosed(1, n)
                .parallel()
                .reduce(Long::sum)
                .getAsLong();
    }
```

### 측정하라 - 병렬스트림은 항상 순차스트림보다 빠르지 않다.
* `Boxing` 주의
  * AutoBoxing, AutoUnBoxing은 성능을 크게 저하시킨다.
  * 기본형 특화 스트림을 사용하는 것이 좋다
* 병렬 스트림에서 성능이 떨어지는 연산이 존재
  * `limit()`, `findFirst()`처럼 요소의 순서에 의존하는 연산
* 소량의 데이터라면 병렬스트림이 도움되지 않는다
  * 병렬화과정에서 생기는 부가비용을 상쇄할만큼의 이득을 얻지 못하기 때문
* 스트림을 구성하는 자료구조가 적절한지 확인
  * ArrayList는 LinkedList보다 효율적으로 분리 가능
* 스트림의 특성과 파이프라인의 중간연산이 스트림의 특성을 어떻게 바꾸느냐에 따라서 분해과정의 성능이 달라질 수 있다
  * 필터연산이 있을 경우 크기를 예측할 수 없으므로 효과적인 스트림처리가 되지 않는다.
* 최종연산과정에서 병합비용을 살펴보아라
  * 병합비용이 비싸다면 병렬스트림으로 얻은 성능의 이익이 서브스트림의 부분결과 합치는 과정에서 상쇄될 수 있다


### 정리
* `collect()`는 스트림의 ***최종연산***
  * `Collector구현체`에 따라서 연산하여 최정결과를 만들어낸다
* 자주사용되는 Collector구현체를 모아놓은 Collectors를 제공
  * 그룹화, 평균값등의 다양한 작업 가능
  * 다수준의 그룹화나 분할작업에도 유연하게 대응 가능
* 필요에 따라 커스텀 Collector를 구현 가능
  * 스트림은 간단하게 병렬처리방식으로 변경 가능
  * 항상빠른것이 아니므로, 병렬로 처리할 경우 유의할 것 
