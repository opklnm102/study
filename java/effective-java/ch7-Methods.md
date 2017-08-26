# Ch7. Methods
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 메소드 설계에 대하여 알아보자

## 규칙 38. Check parameters for validity(인자의 유효성을 검사하라)

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



## 규칙 39. Make defensive copies when needed(필요하다면 방어적 복사본을 만들라)

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

## 규칙 41. Use overloading judiciously

## 규칙 42. Use varargs judiciously

## 규칙 43. Return empty arrays or collections, not nulls

## 규칙 44. Write doc comments for al exposed API elements




