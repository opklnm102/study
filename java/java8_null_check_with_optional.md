# [Java8] Null check with Optional
> date - 2018.08.02  
> keyword - java8, optional
> null 처리를 위해 java8에 도입된 optional에 대해 좋은 글을 보고 정리

<br>

## Null
* 탄생 당시 `존재하지 않는 값`을 표현할 수 있는 가장 편리한 방법
* 그 후 제안자는 자신의 생각이 10억불 짜리 큰 실수였고, null을 만든 것을 후회

<br>

## NPE(NullPointerException)
* 코드 베이스 곳곳에 깔려있는 지뢰
* compile time에는 발견되지 않고, `runtime`에 펑펑 터진다
  * static code analyzer로 발견할 수 있지만, 100%는 안된다

```java
// 주문
class Order {
    private Long id;
    private Date date;
    private Member member;
    ...
    /*
     NPE에 노출된 메소드
     member가 null
     member.getAddress()가 null
     member.getAddress().getCity()가 null => 여기서 NPE가 발생하진 않지만, 사용처로 전파되므로 위험
    */
    public String getCityOfMember() {
        return member.getAddress().getCity();
    }
}

// 회원
class Member {
    private Long id;
    private String name;
    private Address address;
    private LocalDateTime createdAt;
    ...
}

// 주소
class Address {
    private String street;
    private String city;
    private String zipcode;
    ...
}
```

## NPE 방지하기
* null check로 인해 가독성 저하..

### 1. nested null check
```java
public String getCityOfMemberNestedNullCheck() {
    if (member != null) {
        Address address = member.getAddress();

        if (address != null) {
            String city = address.getCity();

            if (city != null) {
                return city;
            }
        }
    }
    return "";
}
```
* 객체 탐색에 null check, 들여쓰기 때문에 가독성 저하

### 2. 가독성은 높지만, 결과를 여러곳에서 리턴
```java
public String getCityOfMemberWithoutNull() {
    if (member == null) {
        return "";
    }
    Address address = member.getAddress();

    if (address == null) {
        return "";
    }
    String city = address.getCity();

    if (city == null) {
        return "";
    }
    return city;
}
```

---

<br>

## Optional
* 함수형 언어는 `존재할지 안 할지 모르는 값`을 표현할 수 있는 별개의 타입을 가지고 있다
* `존재할지 안 할지 모르는 값`을 제어할 수 있는 여러 API 제공

### Java8의 Optional<T>
* `존재할 수`도 있는 객체를 wrapping하는 wrapper class

#### 효과
* 고통스러운 null 처리를 `직접하지 않고 Optional 클래스에 위임`
* `null일 수`도 있다고 명시적으로 표현

### 변수명
* 접두어 maybe - Optional<Order> maybeOrder
* 접두어 otp - Optional<Order> optOrder
* class명 그대로 - Optional<Order> order
* 접미어 optional - Optional<Order> orderOptional

<br>

## Optional 생성

### Optional.empty()
```java
public static<T> Optional<T> empty() {
    @SuppressWarnings("unchecked")
    Optional<T> t = (Optional<T>) EMPTY;
    return t;
}
```

### Optional.of(value)
* value가 null일 경우, 내부의 `Objects.requireNonNull(value)`로 인해 NPE 발생

```java
private Optional(T value) {
    this.value = Objects.requireNonNull(value);
}

public static <T> Optional<T> of(T value) {
    return new Optional<>(value);
}
```

### Optional.ofNullable(value)
* value가 null이면 Optional.empty() 반환
```java
public static <T> Optional<T> ofNullable(T value) {
    return value == null ? empty() : of(value);
}
```

<br>

## optional 사용하기

### Optional.get()
* value가 null이면 `NoSuchElementException` 발생

```java
public T get() {
    if (value == null) {
        throw new NoSuchElementException("No value present");
    }
    return value;
}

// usage
optOrder.get();
```

### Optional.orElse(value)
* value가 null이면 인자의 value 반환

```java
public T orElse(T other) {
    return value != null ? value : other;
}

// usage
optOrder.orElse(Order.EMPTY);
```

### Optional.orElseGet(Supplier)
* value가 null이면 인자의 supplier 호출
* supplier를 사용하므로 `lazy`하게 동작
        
```java
public T orElseGet(Supplier<? extends T> other) {
    return value != null ? value : other.get();
}

// usage
optOrder.orElseGet(() -> Order.EMPTY);
```

### Optional.orElseThrow()
* 인자의 supplier로 생성된 exception throw
```java
public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier) throws X {
    if (value != null) {
        return value;
    } else {
        throw exceptionSupplier.get();
    }
}

// usage
optOrder.orElseThrow(NoSuchElementException::new);
```

<br>

## Optional 효과적으로 사용하기

### 메소드의 반환값이 존재하지 않을 때 전통적인 처리 패턴
* `null`을 반환하거나 `exception throw`

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}
```

* HashMap은 값이 없으면 null을 반환 
* null check 필요
```java
Map<Integer, String> map = new HashMap<>();
String value = map.get(1);
int length = value == null ? 0 : value.length();
```

* optional 사용
```java
Optional<String> optStr = Optional.ofNullable(map.get(1));
int length = optStr.map(String::length).orElse(0);
```



### Optional 사용의 안좋은 경우
```java
public String getCityOfMemberOptioalBad() {
    Optional<Member> optMember = Optional.ofNullable(member);

    if (optMember.isPresent()) {
        Optional<Address> optAddress = Optional.ofNullable(optMember.get().getAddress());

        if (optAddress.isPresent()) {
            Optional<String> optCity = Optional.ofNullable(optAddress.get().getCity());

            if (optCity.isPresent()) {
                return optCity.get();
            }
        }
    }
    return "";
}
```
* 이럴 꺼면 왜 사용하는거냐.... 중첩 if문으로 위랑 다를바가 없다..!


### Optional을 잘 사용하려면?
* stream 처럼 사용하기
* optional을 `최대 1개의 원소를가지고 있는 특별한 stream`이라고 생각
* map(), flatMap(), filter() 지원

#### map()
```java
public<U> Optional<U> map(Function<? super T, ? extends U> mapper) {
    Objects.requireNonNull(mapper);
    if (!isPresent())
        return empty();
    else {
        return Optional.ofNullable(mapper.apply(value));
    }
}
```

* usage - 주문자의 도시 이름 조회하기
```java
public String getCityOfMemberOptioalGood() {
    return Optional.ofNullable(member)
            .map(Member::getAddress)
            .map(Address::getCity)
            .orElse("");
}
```
* Optional<Member> => Optional<Address> => Optional<String> 순으로 변환
* null이면 empty()로 변환


#### filter()
```java
public Optional<T> filter(Predicate<? super T> predicate) {
    Objects.requireNonNull(predicate);
    if (!isPresent())
        return this;
    else
        return predicate.test(value) ? this : empty();
}
```

* usage - 일정 시간 내 가입한 맴버의 주소를 조회
```java
// before
Address getAddressOfMemberWithBad(int min) {
    if (member != null
            && member.getCreatedAt() != null
            && member.getCreatedAt().toEpochSecond(ZoneOffset.UTC) > LocalDateTime.now().minusMinutes(min).toEpochSecond(ZoneOffset.UTC)) {

        if (member.getAddress() == null) {
            return member.getAddress();
        }
    }
    return null;
}

// after
Optional<Address> getAddressOfMemberWithFilterGood(int min) {
    return Optional.ofNullable(member)
            .filter(m -> m.getCreatedAt().toEpochSecond(ZoneOffset.UTC) > LocalDateTime.now().minusMinutes(min).toEpochSecond(ZoneOffset.UTC))
            .map(Member::getAddress);
}
```
* filter() 사용하면 if 없이 method chaining만으로도 값을 구할 수 있어 가독성 향상
* Optional 리턴으로 null일 수도 있다고 명시적 표현


#### Optional을 사용한 exception 처리
```java
private List<String> cities = Arrays.asList("Seoul", "Busan", "Daejeon");

public void setDate(Date date) {
    
    String city = getCity(3);
    int length = city == null ? 0 : city.length();

    Optional<String> otpCity = getCityOptional(3);
    int length = otpCity.map(String::length).orElse(0);
    otpCity.ifPresent(c -> c.length());
}

public String getCity(int index) {
    try {
        return cities.get(index);
    } catch (ArrayIndexOutOfBoundsException e) {
        return null;
    }
}

public Optional<String> getCityOptional(int index) {
    try {
        return Optional.ofNullable(cities.get(index));
    } catch (ArrayIndexOutOfBoundsException e) {
        return Optional.empty();
    }
}
```

---

<br>

> #### 참고
> * [자바8 Optional 1부: 빠져나올 수 없는 null 처리의 늪](http://www.daleseo.com/java8-optional-before/)
> * [자바8 Optional 2부: null을 대하는 새로운 방법](http://www.daleseo.com/java8-optional-after/)
> * [자바8 Optional 3부: Optional을 Optional답게](http://www.daleseo.com/java8-optional-effective/)
