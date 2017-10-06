# Ch7. Methods
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 메소드 설계에 대하여 알아보자


* [38. Check parameters for validity](#규칙-38-check-parameters-for-validity)
* [39. Make defensive copies when needed](#규칙-39-make-defensive-copies-when-needed)
* [40. Design method signatures carefully](#규칙-40-design-method-signatures-carefully)
* [41. Use overloading judiciously](#규칙-41-use-overloading-judiciously)
* [42. Use varargs judiciously](#규칙-42-use-varargs-judiciously)
* [43. Return empty arrays or collections, not nulls](#규칙-43-return-empty-arrays-or-collections-not-nulls)
* [44. Write doc comments for all exposed API elements](#규칙-44-write-doc-comments-for-all-exposed-api-elements)


## 규칙 38. Check parameters for validity
> 인자의 유효성을 검사하라

### 대부분의 메소드와 생성자는 인자로 사용할 수 있는 값을 제한한다
* ex
   * index는 음수가 될수 없다
   * 객체 참조는 null이 될 수 없다
* 제한들은 문서로 남긴다
* 메소드 앞부분에서 유효성 검사
   * 오류는 가급적 빨리 탐지해야 한다
   * 적절한 예외를 통해 깔끔하고 신속하게 오류 검출

### 하지 않으면?
* 실행 도중 exception 발생
* 실행이 되지만 잘못된 결과
* 추적하기 어려워짐

#### public 메소드라면 `@throws`를 사용해서 문서화
```java
/**
* (this mod m)인 BigInteger 반환
* 
* @param m mod 연산을 수행할 값. 반드시 양수
* @return this mod m
* @throws ArithmeticException (m <= 0)일 때
*/
public BigInteger mod(BigInteger m){
    if(m.signum() <= 0){
        throw new ArithmeticException("Modulus <= 0: "+ m);
    }
    ...
}
```

#### public이 아닌 메소드라면 `assertion` 이용
* 메소드 호출이 일어나는 상황을 통제할 수 있으므로, 유효한 인자가 전달될 것이다
```java
private static void sort(long a[], int offset, int length) {
    assert a != null;
    assert offset >= 0 && offset <= a.length;
    assert length >= 0 && length <= a.length - offset;
    ...
}
```

> assertion
> 클라이언트가 패키지를 어떻게 이용하건 확증 조건은 항상 참이 되어야 한다고 주장하는 것
> 조건이 만족되지 않으면 `AssertionError` 발생
> 활성화되지 않은 assertion은 실행되지 않으므로 비용은 0


#### 호출된 메소드에서 바로 이용하진 않지만 나중을 위해 보관되는 인자의 유효성 검사도 중요
```java
static List<Integer> intArrayAsList(final int[] a){
    // 여기서 체크를 안하면, return된 List를 참조할 경우 NPE가 발생되어, 추적하기 어려워짐
    if(a == null) {  
        throw new NullPointerException();
    }
        
    return new AbstractList<Integer>() {
        @Override
        public Integer get(int index) {
            return a[index];
        }

        @Override
        public int size() {
            return a.length;
        }

        @Override
        public Integer set(int index, Integer element) {
            int oldVal = a[index];
            a[index] = element;
            return oldVal;
        }
    };
}
```

### 메소드가 실제 계산을 수행하기 전에 유효성 검사를 하는 것의 예외
* 오버헤드가 너무 크거나, 계산 과정에서 자연스럽게 유효성 검사가 이루어지는 경우


### 정리
* 메소드나 생성자를 구현할 때 인자에 제한이 있는지 따져보자
* 있다면, `문서`에 남기고, `메소드 앞부분`에서 유효성 검사
* 메소드는 가능하면 일반적으로 적용될 수 있도록 설계
* 인자에 대한 제약이 적을수록 좋다



## 규칙 39. Make defensive copies when needed
> 필요하다면 방어적 복사본을 만들라

### 클래스의 클라이언트가 불변식을 망가뜨리기 위해 최선을 다할 것이라는 가정하에, 방어적으로 프로그래밍
```java
public class Period {
    
    private final Date start;
    private final Date end;

    public Period(Date start, Date end) {
        if(start.compareTo(end) > 0){
            throw new IllegalArgumentException(start + " after " + end);
        }
        this.start = start;
        this.end = end;
    }

    public Date getStart() {
        return start;
    }

    public Date getEnd() {
        return end;
    }
}
```
* 변경이 불가능해 보이고, 기간 시작점이 기간 끝점 이후일 수 없다는 불변식도 만족되는 것처럼 보인다
* Date가 변경 가능 클래스라는 점을 이용하면 불변식을 깨뜨릴 수 있다
```java
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
end.setYear(78);  // p의 내부를 변경
```

### 생성자로 전달되는 변경 가능 객체를 반드시 방어적으로 복사해서 컴포넌트로 이용
```java
public Period(Date start, Date end) {
    this.start = new Date(start.getTime());
    this.end = new Date(end.getTime());

    // 유효성 검사는 복사본에 대해서 시행
    if(this.start.compareTo(this.end) > 0){
       throw new IllegalArgumentException(this.start + " after " + this.end);
    }
}
```
* 유효성 검사는 복사본에 대해서 시행
   * 다른 thread가 인자를 변경해버리는 일을 방지
* 인자로 전달된 클래스가 상속가능할 경우, 복사본을 만들 때 clone()을 사용하지 않는다
   * final 클래스가 아니므로 `java.util.Date`를 반환한다는 보장이 없다
   * 공격을 위한 클래스를 만들어 private static으로 참조할 수 있다

### getter를 통한 공격 방지
```java
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
p.getEnd().setYear(78);  // p의 내부를 변경
```

* getter에서 복사본을 생성한다
   * 내부 객체는 Date가 확실하므로 clone() 사용 가능
```java
// 수정
public Date getStart(){
    return new Date(start.getTime());
}

public Date getEnd(){
    return new Date(end.getTime());
}
```

### 정리
* 내부 컴포넌트에 대한 참조를 return하기 전에 복사본을 return할지 생각해봐야한다
* 객체의 컴포넌트로는 가능하다면 `변경 불가능한` 객체를 사용해야 한다
   * 방어적 복사본에 신경 쓸 필요가 없다
* 방어적 복사가 오버헤드가 너무 크고, 클라이언트가 부적절하게 변경하지 않는다는 보장이 있다면, 문서에 명시하고 넘어갈 수 있다


## 규칙 40. Design method signatures carefully
> 메소드 시그너처는 신중하게 설계하라

### 메소드 이름은 신중하게 고르라
* 모든 이름은 standard naming convention을 따라야 한다
* 이해하기 쉬우면서, 같은 패키지 안의 다른 이름들과 일관성 유지
* 좀더 널리 합의된 사항에도 부합하는 이름을 고르는 것


### 편의 메소드를 제공하는데 너무 열 올리지 마라
* 모든 메소드는 `맡은 일이 명확하고 거기에 충실`해야 한다
* 클래스, 인터페이스가 수행해야 하는 동작 각각에 대해서 기능적으로 완전한 메소드를 제공하라
   * 클래스에 메소드가 너무 많으면 학습, 사용, 테스트, 유지보수 등의 모든 측면에서 어렵다
   * 인터페이스의 경우 문제는 더 심각


### parameter를 길게 만들지 마라
* 4개 이하가 되도록 애쓰라
* 너무 길면 기억하지 못하고, 문서를 계속 봐야 한다
* `자료형이 같은 parameter가 길게 연결된 parameter list`는 특히 더 위험
   * parameter 순서를 바꾸더라도 컴파일러가 인식하지 못하므로 오동작


#### 메소드 parameter를 줄이기 위한 방법
##### 1. 여러 메소드로 나누기
* 각각은 원래 parameter의 일부만 취한다
   * 주의하지 않으면 너무 많은 메소드가 생길 수 있지만, 제대로만 하면 `직교성 향상을 통해 줄일` 수도 있다

##### 2. helper class를 만들어 parameter들을 그룹별로 나누기
* 보통 helper class는 static 멤버 클래스
* 자주 등장하는 parameter가 별도의 entity를 나타낼 때 쓰면 좋다
> ex. 카드의 숫자와 모양을 인자로 받는 메소드  
> 한장의 카드를 나타내는 hepler class를 만들어서, parameter로 활용하면 API뿐만 아니라 클래스 내부 구조도 좋아질 것이다

##### 3. builder pattren으로 객체 생성 대신 메소드 호출에 적용
* 모든 parameter를 표현하는 클래스를 정의하고, setter를 여러번 호출할 수 있도록하면 좋다
   * parameter들 가운데 상당수는 옵션일 경우
   * setter는 parameter 하나, 여러개를 설정
   * 원하는 parameter가 설정되고 나면 해당 객체의 `execute()`를 호출해 최종적인 유효성 검사를 실행한 뒤 실제 계산 진행


### parameter의 자료형으로는 클래스보다 인터페이스가 좋다
* parameter로 HashMap보다는 Map을 써라
   * Map의 하위 구현 클래스를 모두 parameter로 쓸 수 있다
* 클래스를 사용하면 특정한 구현에 종속
* parameter가 다른 객체라면 변환하고 복사하는 비용까지 생긴다


### parameter 자료형으로 boolean을 쓰는 것보다 원소가 2개인 enum을 쓰는 것이 낫다
* 읽기 편한 코드가 된다
* 새로운 값을 추가하기 쉽다
* 메소드 추가도 가능



## 규칙 41. Use overloading judiciously
> 오버로딩할 때는 주의하라

```java
// Set, List, Unknown Collection을 순서대로 출력하지 않을까..?
public class CollectionClassifier {

    public static String classify(Set<?> set) {
        return "Set";
    }

    public static String classify(List<?> list) {
        return "List";
    }

    public static String classify(Collection<?> collection) {
        return "Unknown Collection";
    }

    public static void main(String[] args) {
        Collection<?>[] collections = {
                new HashSet<>(),
                new ArrayList<>(),
                new HashMap<String, String>().values()
        };

        for (Collection<?> collection : collections) {
            System.out.println(classify(collection));
        }
    }
}
```
* Unknown Collection만 3번 출력
   * `classify()`가 오버로딩되어 있지만, `오버로딩된 메소드 가운데 어떤 것이 호출될지는 컴파일 시점에 결정되기 때문`

> 오버로딩된 메소드는 `정적(static)`으로 선택되지만, 오버라이딩된 메소드는 `동적(dynamic)`으로 선택되기 때문  
> 오버라이딩된 메소드의 경우 선택 기준은 메소드 호출 대상 객체의 자료형

### 해결 : 하나로 합치고 instanceof 사용
```java
public static String classify(Collection<?> collection) {
    return collection instanceof Set ? "Set" :
           collection instanceof List ? "List" :
           "Unknown Collection";
}
```
* 오버라이딩이 일반적 규범이라면, 오버로딩은 예외에 해당
   * 오버로딩은 classify()처럼 예측하기 힘들다

### 오버로딩을 사용할 때는 `혼란스럽지 않게 사용할 수 있도록 주의`
#### 1. 같은 수의 parameter를 갖는 2개의 오버로딩 메소드를 API에 포함시키지 않기
* 같은 수의 parameter를 가지고 있으면 혼란스러울 수 있다

#### 2. 오버로딩하지 않고 메소드 이름으로 나타내기
```java
// before
public void write(boolean b){
}

// after
public void writeBoolean(boolean b){
}
```
* writeXX()에 대응하는 readXX()를 만들 수 있다
* 생성자라면, 정적 팩토리 메소드를 사용

### parameter가 casting될 경우
```java
// 원하는 결과
// [-3, -2, -1] [-3, -2, -1]
public class SetList {

    public static void main(String[] args) {
        Set<Integer> set = new TreeSet<>();
        List<Integer> list = new ArrayList<>();

        for (int i = -3; i < 3; i++) {
            set.add(i);
            list.add(i);
        }
        for (int i = 0; i < 3; i++) {
            set.remove(i);  // boolean remove(Object o);
            list.remove(i);  // E remove(int index);
        }
        System.out.println(set + " " + list);  // [-3, -2, -1] [-2, 0, 2]
    }
}
```

#### 수정
```java
for (int i = 0; i < 3; i++) {
    set.remove(i);
    list.remove((Integer)i);
}
```
* List에는 `remove(Object o)`와 `remove(int index)`가 있기 때문에 혼란을 야기한다

### 정리
* 메소드를 오버로딩할 수 있다고 해서 반드시 해야하는 것은 아니다
* parameter 수가 같은 메소드의 오버로딩은 피해야한다
* casting만 추가하면 같은 인자 집합으로 여러 오버로딩 메소드를 호출할 수 있는 상황은 피하자
* 같은 parameter면 똑같이 동작하도록 구현해야한다 



## 규칙 42. Use varargs judiciously
> varargs는 신중히 사용하라

### varargs(가변 인자) 메소드
* 임의 개수의 인자를 처리하는 메소드를 만들어야할 때 효과적
* `printf()`, `reflection`에서 많이 사용
```java
static int sum(int... args) {
    int sum = 0;
    for (int arg : args) {
        sum += arg;
    }
    return sum;
}
```

### 1개 이상의 paramter가 필요할 경우
```java
// 실행시점에 배열 길이 검사
static int min(int... args) {
    if (args.length == 0) {
        throw new IllegalArgumentException("Too few arguments");
    }
    int min = args[0];
    for (int i = 1; i < args.length; i++) {
        if (args[i] < min) {
            min = args[i];
        }
    }
    return min;
}
```
* 문제점
   * parameter 없이 호출 가능
   * runtime error
   * args 유효성 검사 필요
   * min을 Integer.MAX_VALUE로 초기화하지 않으면 for-each 사용 불가
   * 가독성 떨어짐

#### 개선 - parameter를 2개로 선언
```java
static int min(int firstArg, int... remainingArgs) {
    int min = firstArg;
    for (int arg : remainingArgs) {
        if (arg < min) {
            min = arg;
        }
    }
    return min;
}
```

### 배열을 인자로 받는 메소드는 반드시 varargs를 사용해야 하는 것은 아니다
* varargs는 정말로 임의 개수의 인자를 처리할 수 있는 메소드를 만들어야 할 때만 사용
* varargs 메소드를 호출할 때 마다 배열이 만들어지고 초기화 된다
   * 성능이 중요하다면 신중해야 한다
```java
// 95%는 2개이하의 인자가 전달된다면 아래처럼 최적화
public void foo(){ }
public void foo(int a1){ }
public void foo(int a1, int a2){ }
public void foo(int a1, int a2, int...remaing){ }
```
* `EnumSet`의 정적 팩토리 메소드들은 위의 기법을 통해 enum 집합 생성비용을 낮춘다

### 정리
* varargs 메소드는 parameter 수가 가변적인 메소드를 정의할 때 편리하지만, 남용되면 곤란하다



## 규칙 43. Return empty arrays or collections, not nulls
> null 대신 빈 배열이나 컬렉션을 반환하라

### 값이 없을 때 null을 반환하는 경우
```java
private final List<Cheese> cheesesInStock = ...;

public Cheese[] getCheeses() {
    // 값이 하나도 없는 상황을 특별하게 처리할 이유는 없다
    // null을 처리하기 위해 클라이언트의 코드가 추가된다
    if(cheesesInStock.size() == 0) {
        return null;
    }
    ...
}

// client
Cheese[] cheeses = shop.getCheeses();
if(cheeses != null && Arrays.asList(cheeses).contains(Cheese.STILTON)){
    ...
}
```
* null을 반환하면, null 처리를 위한 불필요한 코드가 추가된다
* null 처리 코드를 추가하는 것을 잊어버릴 수 있다
* null을 반환하면 배열이나 컬렉션을 반환하는 메소드를 복잡하게 만든다

### 개선 - 빈 배열이나 컬렉션 반환
```java
private final List<Cheese> cheesesInStock = ...;

// 불변 객체이므로, 하나만 생성해서 공유
private static final Cheese[] EMPTY_CHEESE_ARRAY = new Cheese[0];

public Cheese[] getCheeses() {
    return cheesesInStock.toArray(EMPTY_CHEESE_ARRAY);
}

public List<Cheese> getCheeseList() {
    if(cheesesInStock.isEmpty()) {
        return Collections.emptyList();  // 항상 똑같은 List를 반환
    } else {
        return new ArrayList<Cheese>(cheesesInStock);
    }
}
```

### 정리
* 배열, 컬렉션 반환 메소드에서 빈 배열이나 컬렉션을 반환하는 대신 null을 반환해야 할 이유가 없다
* `빈 배열, 컬렉션을 반환해라`



## 규칙 44. Write doc comments for all exposed API elements
> 외부에 제공하는 모든 API 요소에 대해 문서화 주석을 넣자

### 사용 가능한 API라면 반드시 문서화
* 외부에 제공하는 모든 `클래스`, `인터페이스`, `생성자`, `메소드`, `필드`의 선언부 앞에 문서화 주석을 넣어야 한다
* 유지보수하기 쉬운 코드를 작성하려면 `외부에 공개되지 않는(public이 아닌)` 클래스, 인터페이스, 생성자, 메소드, 필드에도 문서화 주석을 작성해야 한다

### 문서화 방법
* 클래스, 인터페이스의 어떤 멤버나 생성자도 `동일한 요약설명을 가져서는 안된다`

#### 메소드
* 메소드가 수행하는 `동작을 설명하는 완전한 동사구`
   * ex. `Collection.size() - Returns the number of elements in this collection`
* 메소드의 문서화 주석에는 메소드와 클라이언트 사이의 계약을 `간략하게 설명`
* 어떻게 일을 처리하는가 보다는 `무슨 일을 하는지`를 나타내야 한다
* 모든 `사전 조건(precondition)`(메소드를 호출하기 위해 반드시 만족되어야 하는 것), `사후 조건(postcondition)`(메소드 호출이 성공적으로 완료된 후에 만족해야 할 것들)을 열거
   * 사전 조건
      * unchecked 예외에 대해 `@throws` 태그에서 자동으로 기술
      * `@param` 태그의 매개변수와 함께 설명될 수 있다
* 메소드의 `부작용(side effect)`도 문서화
   * side effect
      * 시스템 상태에 눈에 띄는 변화
   * ex. 백그라운드 쓰레드를 시작시킨다면, thread safety를 기술
* `@param`, `@return`
   * 매개변수나 반환값에 나타나는 값을 설명하는 명사구
* `@throws`
   * 해당하는 예외가 발생하는 조건을 설명하는 문구
```java
/**
 * <p>This method is <i>not</i>guaranteed to run in constant
 * time . In some imp1ementations it may run in time proportiona1
 * to the e1ement position .
 *
 * @param index index of e1ement to return; must be
 *              non-negative and 1ess than the size of this 1ist
 * @return the e1ement at the spec ified position in this 1i st
 *         IndexOutOfBoundsException if the index is out of range 
 * ({@codeindex<011 index>=this.size()}) 
 */
E get(int index) ;
```


#### 클래스, 인터페이스, 필드
* 클래스, 인터페이스, 필드가 나타내는 것을 `명사구`로 설명
   * ex. `TimerTask - task that can be scheduled for one-time or repeated execution by a Timer`

#### 제네릭
* `모든 타입의 매개변수`가 문서화되었는지 확인
```java
/**
* ...
* @param <K> the type of keys maintained by this map
* @param <V> the type of mapped values
*/
public interface Map<K, V> {
    ...
}
```

#### enum
* `타입`, `public 메소드`, `상수`들이 문서화되었는지 확인
```java
public enum Phase  {
    // 고체
    SOLID,

    // 액체 
    LIQUID,

    // 기체 
    GAS;
}
```

#### annotation
* annotaion 자신, 모든 멤버가 문서화되었는지 확인
```java
/**
 * Indicates that a method declaration is intended to override a
 * method declaration in a supertype. If a method is annotated with
 * this annotation type compilers are required to generate an error
 * message unless at least one of the following conditions hold:
 *
 * <ul><li>
 * The method does override or implement a method declared in a
 * supertype.
 * </li><li>
 * The method has a signature that is override-equivalent to that of
 * any public method declared in {@linkplain Object}.
 * </li></ul>
 *
 * @author  Peter von der Ah&eacute;
 * @author  Joshua Bloch
 * @jls 9.6.1.4 @Override
 * @since 1.5
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface Override {
}
```

#### 패키지
* `package-info.java`에 기술
* 패키지 수준의 문서화 주석
* `패키지 선언`과 `패키지 annotation`을 포함

#### thread safety
* thread safe를 문서화

#### serializability
* 직렬화 가능하다면, 직렬화 형태 문서화


### 정리
* 문서화 주석은 API를 문서화하는 가장 좋고 효율적인 방법
* 모든 외부 API에 대해 문서화 주석의 사용을 반드시 고려
* 표준을 따르는 일관성 있는 스타일 채택
* 주석 내부에 HTML 사용 가능
   * HTML 메타 문자는 이스케이프 처리

