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



## 규칙 39. Make defensive copies when needed

## 규칙 40. Design method signatures carefully

## 규칙 41. Use overloading judiciously

## 규칙 42. Use varargs judiciously

## 규칙 43. Return empty arrays or collections, not nulls

## 규칙 44. Write doc comments for al exposed API elements




