# Ch11. Serialization
> Effective Java를 읽으며 공부했던 내용을 정리한다  
> 직렬화 API는 직렬화(객체를 바이트 스트림으로 encoding)하고, 역직렬화(encoding된 바이트 스트림으로부터 객체를 복원)하는 프레임워크를 제공한다  
> 직렬화는 원격 통신을 위한 표준 영속 데이터 포맷 제공하며, `serialization proxy pattren`은 객체 직렬화의 많은 함정을 피하게 해준다  


* [74. Implement Serializable judiciously](#규칙-74-implement-serializable-judiciously)
* [75. Consider using a custom serialized form](#규칙-75-consider-using-a-custom-serialized-form)
* [76. Write readObject methods defensively](#규칙-76-write-readobject-methods-defensively)
* [77. For instance control, perfer enum types to readResolve](#규칙-77-for-instance-control-perfer-enum-types-to-readresolve)
* [78. Consider serialization proxies instead of serialized instances](#규칙-78-consider-serialization-proxies-instead-of-serialized-instances)


## 규칙 74. Implement Serializable judiciously
> Serializable을 분별력 있게 구현하자

* 클래스의 인스턴스가 직렬화 가능하려면 `implements Serializable`을 추가
* 너무 간단해 별로 `할게 없는 것처럼 오해`를 한다
* 직렬화 가능하도록 만드는 비용은 무시 가능하지만, `유지보수 비용은 무시할 수 없다`
* 필드가 외부 API의 일부가 되므로, 정보 은닉의 효력을 상실
* 기본 직렬화 형태를 사용하고 나중에 클래스의 내부 구현을 변경한다면, 변경으로 인해 직렬화 형태가 호환되지 않을 수 있다
* `ObjectOutputStream.putFields()`, `ObjectInputStream.readFields()`를 사용하여 원래 직렬화 형태를 유지하면서 `내부 구현을 변경`할 수 있다
   * 사용 방법이 어렵고, 코드가 지저분헤진다
   * 그러므로 `직렬화 형태를 신중하게 설계`


### Serializable을 구현하는 비용

#### 1. 직렬화를 수반하면서 클래스 진화를 제약하는 예
* serial version UID -> stream unique identifier
* 직렬화 가능한 모든 클래스는 `고유 식별 번호`를 갖는다
* serial version UID를 명시적으로 선언하지 않으면, 시스템에서 `런타임시 자동으로 생성`
   * 클래스의 모든 코드가 영향을 준다
   * UID를 명시적으로 선언하지 않으면 내부 구현 변경시 호환성이 깨지게 된다

#### 2. 결함과 보안상의 허점을 증대시킨다
* 객체는 생성자를 사용해 생성
* serialization은 `언어 영역을 벗어나는 방식`으로 객체를 생성
* `JVM이 자동으로 해주는 기본적인 역직렬화` 또는 `메소드 오버라이딩으로 독자적인 역직렬화`시 감춰진 생성자 사용
* 감춰진 생성자에서 해야할 것
   * 모든 불변 규칙이 지켜지는지 확인
   * 외부 공격자가 접근하지 못하도록 방지
   * 기본 메커니즘에 의존하면 불변성 및 불법적인 접근에 취약

#### 3. 새 버전의 클래스 배포 부담 증가
* 구버전과의 `호환성이 유지`되는지 test
* test 분량 - `직렬화 가능 클래스 수 x 배포판 수`
* 이진 호환성 + 의미적 호환성도 test해야해서 자동화할 수 없다



### Serializable의 구현은 쉽게 결정할 일이 아니다
* 직렬화는 실질적인 이점을 제공
* `객체 전송, 영속성 직렬화`에 의존하는 프레임워크와 관계되는 클래스 -> 필수
* `Value Class(Date, BigInteger)` -> 필수
* thread pool과 같은 `활동적인 개체를 나타내는 클래스` -> 구현 필요 X
* 상속을 위해 설계된 class, interface -> 구현(implements, extends) 필요 X
   * class를 상속받거나 interface를 구현하려는 누군가에게 부담이 된다
   * 모든 class, interface가 Serialiable를 구현할 경우에는 괜찮다



### Serializable를 구현하면서 상속을 위해 설계된 클래스
* `Throwable`
   * RMI(remote method invocation)시 발생된 exception을 서버로부터 클라이언트에게 전달해야 하기 때문
* `Component`
   * GUI compoment들이 전송, 저장, 복구될 수 있어야 하기 때문
* `HttpServlet`
   * session status를 caching할 수 있어야 하기 때문


### 직렬화 가능하고 확장 가능하면서 인스턴스 필드를 갖는 Class를 만들 때 주의할 점
* 인스턴스 필드들이 `default 값으로 초기화`되는 경우(정수 0, boolean false, 객체 참조 null) 불변 규칙이 깨진다면, `readObjectNoData()`를 반드시 추가
```java
private void readObjectNoData() throws InvalidObjectException {
    throw new InvalidObjectException("Stream data required");
}
```


### Class에서 Serialiable을 구현하지 않는다는 결정을 할 경우 주의사항
* 상속을 위해 설계된 클래스 `직렬화 불가능` -> 서브 클래스 `직렬화 불가능`
* 특히, 접근 가능한 default 생성자를 수퍼 클래스가 제공하지 않는다면 불가능
   * 상속을 위해 설계된 대부분의 클래스들은 상태를 갖지 않으므로, 생성자 추가는 어렵지 않다
* 불변 규칙이 이미 확립된 객체를 생성하는 것이 가장 좋은 방법
* 클라이언트가 제공하는 데이터가 불변 규칙을 확립하는데 필요하다면 default 생성자의 사용은 배제된다
* 다른 생성자가 default 생성자와 초기화 메소드를 추가하면, 클래스의 상태만 복잡하게 만들게 된다


#### 자신은 직렬화 불가능하지만, 직렬화 가능한 서브 클래스를 허용하는 클래스에 매개변수 없는 생성자를 추가하는 방법
```java
// 생성자가 1개 존재할 경우
public AbstractFoo(int x, int y) {
    ...
}

// 자신은 직렬화 불가능하지만, 직렬화 가능한 서브 클래스를 허용하는 클래스
public abstract class AbstractFoo {
    private int x, y;  // 인스턴스 상태

    // 초기화 추적에 사용
    private enum State { NEW, INITIALIZING, INITIALIZED };
    private final AtomicReference<State> init = new AtomicReference<>(State.NEW);

    public AbstractFoo(int x, int y) {
        initialize(x, y);
    }

    // readObject()에서 인스턴스의 상태를 초기화
    protected AbstractFoo(){}
    protected final void initialize(int x, int y) {
        if(!init.compareAndSet(State.NEW, State.INITIALIZING)) {
            throw new IllegalStateException("Already initialized");
        }
        this.x = x;
        this.y = y;
        ... // 원래 생성자의 일 수행
        init.set(State.INITIALIZED);
    }

    // 내부 상태로의 접근 제공 -> 서브 클래스의 writeObject()로 직렬화 가능
    protected final int getX() {
        checkInit();
        return x;
    }

    protected final int getY() {
        checkInit();
        return y;
    }

    // 모든 public, protected 인스턴스 메소드에서 호출해야 한다
    private void checkInit() {
        if(init.get() != State.INITIALIZED) {
            throw new IllegalStateException("Uninitialized");
        }
    }
    ...
}

// 상태가 있고 직렬 불가능한 클래스의 직렬화 가능한 서브 클래스
public class Foo extends AbstractFoo implements Serializable {
    private void readObject(ObjectInputStream s) throws IOException, ClassNotFoundException {
        s.defaultReadObject();

        // 수퍼 클래스의 상태를 직접 역직렬화하고 초기화
        int x = s.readInt();
        int y = s.readInt();
        initialize(x, y);
    }

    private void writeObject(ObjectOutputStream s) throws IOException {
        s.defaultWriteObject();

        // 수퍼 클래스의 상태를 직접 직렬화
        s.writeInt(getX());
        s.writeInt(getY());
    }

    // 직렬화 메커니즘에서 사용 X
    public Foo(int x, int y) {
        super(x, y);
    }

    private static final long serialVersionUID = 129329324343L;
}
```

### inner class에서는 Serialiable을 구현 X
* inner class는 컴파일러가 생성한 `syntheic field`를 사용
   * enclosing instance에 대한 `참조`와 유효범위에 있는 `지역 변수들의 값` 저장
* 익명의 내부 클래스나 지역 내부 클래스처럼 필드들이 클래스와 어떻게 대응되는지 명시 X
   * 내부 클래스의 기본 직렬화 형태는 정의가 불분명
* static 멤버 클래스는 Serialiable을 구현 가능


### 정리
* Serialiable interface의 구현은 쉽지 않다
* 상속을 위한 클래스는 특별히 주의 필요
   * 서브 클래스에서 직렬화 가능하게, 불가능하게 하는 것을 절충한 설계 관점 필요
   * 접근 가능한 default 생성자를 제공 -> 서브 클래스에서 Serialiable 구현 가능



## 규칙 75. Consider using a custom serialized form

## 규칙 76. Write readObject methods defensively

## 규칙 77. For instance control, perfer enum types to readResolve

## 규칙 78. Consider serialization proxies instead of serialized instances

