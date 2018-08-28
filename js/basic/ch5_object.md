# Ch5. 객체

## 객체의 정의
* 이름과 값으로 구성된 프로퍼티들의 집합
* 모든 객체는 `Object`를 상속

<br>

## 객체를 정의하는 방법
### 객체 리터럴 사용
```JavaScript
var point = {x: 20, y: 30};
var student = {
    name: 'Dong',
    age: 20
    toString: function(){
        return '{' + this.name + ' ' + this.age + '}';
    }
};
```

### new Object() 사용
```JavaScript
var point = new Object();  //객체 리터럴 {}와 같이 빈 객체 생성
point.x = 20;
print.y = 30;
```

<br>

## 생성자
* 객체를 만들기 위한 **틀**
* 원하는 타입의 객체를 생성하고 초기화하기 위해 생성자 직접 정의
* `this`가 나타내는 객체를 초기화
* 구현시 return문 사용X
```JavaScript
function Point(x, y){
    this.x = x;
    this.y = y;
    this.toString = function(){
        return '{' + this.x + ' ' + this.y + '}';
    }
}

var point = new Point(10, 30);
```

<br>

## new, this
* `new 연산자`가 생성하는 객체에는 아무런 프로퍼티도 정의되어 있지 않음
* 객체 생성이후 new연산자는 지정된 생성자 함수를 호출하여 인자 전달, 방금 생성된 객체도 `this`를 통해 전달
* 생성자는 `this`를 사용하여 객체 초기화. **this 생략 불가능**

<br>

## 프로토타입 객체
* 모든 객체는 프로토타입이라 불리는 객체를 내부적으로 참조
* 프로토타입 객체의 실체는 `new Object()`를 통해 생성한 `Object` 객체
* 메소드나 상수를 위치시키에 적합
* 객체는 프로토타입 객체에 있는 프로퍼티를 상속
* 조금 더 효율적으로 메소드 추가 가능
* `new`는 빈 객체를 생성하고, 해당 객체의 `prototype`을 생성자의 `prototype`값을 이용해 설정
* 모든 함수에는 `prototype`프로퍼티가 있으며, 함수가 정의될 때 생성되고 초기화 됨
* 프로토타입 객체는 생성자와 연결되고, 생성자를 통해 생성되는 객체들은 프로토타입 객체의 프로퍼티를 똑같이 상속
* 코드의 중복을 줄여 메모리 사용량 줄일 수 있다.
* 프로토타입의 코드가 변경되어도 기존 객체들이 바로 사용 가능
```JavaScript
Rectangle.prototype.area = function(){
    return this.width * this.height;
};
```

<br>

## constructor 속성
* 모든 객체는 생성자를 참조하는 constructor 프로퍼티를 가지고 있음
* 객체의 타입 판단, 생성 가능
```JavaScript
var point1 = new Point(2, 3);
var point2 = new porint1.constructor(2, 3);
```

<br>

## 네임스페이스
* 네임스페이스 구조 지원X
* 빈객체를 이용해 네임스페이스와 같은 기능 제공할 수 있음
* 정의하기 위해 구현 코드가 없는 생성자 작성, 생성자에 프로퍼티를 추가하는 것과 동일한 방법으로 하위의 생성자 정의
* 네임스페이스를 사용해 하위 생성자로 객체를 생성할 경우, 네임스페이스를 포함한 풀네임으로 생성자를 호출해야 한다.
