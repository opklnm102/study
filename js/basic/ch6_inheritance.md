# Ch6. 상속

## 객체 생성 과정
1. `new`로 빈객체 생성
2. 생성자는 `this`를 통해 전달된 새로운 객체에 생성자에 작성된 **프로퍼티, 메소드**를 추가하는 초기화 작업 수행
3. 새로운 객체의 `prototype` 프로퍼티에 생성자의 `prototype` 프로퍼티값이 전달되어 객체와 생성자는 동일한 프로토타입 객체를 참조
4. `this`가 가리키는 객체 반환

<br>

## 프로토타입 체인과 프로토타입 멤버 상속
* `prototype`기반의 상속 메커니즘
* 객체를 생성하면 생성자의 `prototype`객체에 정의된 멤버를 상속
* 객체의 `prototype`객체와 Object()생성자의 `prototype`객체가 연결되어 있음
* `prototype chain`: 객체를 거쳐 `prototype`객체로 멤버를 검색할 수 있는 연결
* 멤버에 대한 검색 순서
> 객체 -> prototype 객체 -> Object()의 prototype객체

### Object 객체의 주요 멤버
* constructor: 생정자 참조
* toString(): 문자열 표현 반환
* valueOf(): 기본형 표현 반환
* hasOwnProperty(prop): prop를 갖고 있는가?(prototype객체의 프로퍼티는 false반환)
* propertyIsEnumerable(prop): for...in으로 prop프로퍼티/메소드를 열거할 수 있는가?
* isPrototypeOf(obj): 호출객체가 obj객체의 프로토타입인가?
> 구현하지 않으면 Object객체(모든 JavaScript객체에 상속)의 prototype멤버를 사용

### Function 객체의 주요 멤버
* toString(): 함수를 정의하는 코드 반환
* apply(obj, [arg1, arg2, ...])
* call(obj, arg1, arg2, ...)
> obj - this에 할당. null인경우 전역 객체가 할당

* 모든 함수는 Function객체의 prototype 멤버 상속
* 모든 함수의 prototype객체는 Object객체의 prototype 상속
* 모든 생성자는 Object객체의 prototype 객체를 상속

```JavaScript
//프로토타입 체인과 프로토타입 멤버 상속

//Car생성자의 prototype객체는 new와 Object생성자 호출을 통해 생성된 객체
//prototype객체의 constructor는 자동으로 Car생성자를 참조
var Car = function(){}  //Car 생성자 정의
Car.prototype = {  //Car prototype 정의
    startEngine: function(){
        document.writeln("xxxxx");
    }
}

//K5생성자의 prototype객체는 new와 Object생성자 호출로 통해 생성된 객체,
//prototype객체의 constructor는 자동으로 K5생성자를 참조
var K5 = function(){};  //K5 생성자 정의

//K5() 생성자의 prototype 프로퍼티가 new와 Car() 생성자를 통해 생성된 객체를
//참조하면 Car() 생성자의 prototype 멤버를 상속
K5.prototype = new Car();  //K5 prototype 정의

//prototype객체가 Car() 생성자를 통해 만들어졌기 때문에 constructor는
//Car() 생성자를 참조하게 된다. 따라서 constructor를 K5() 생성자로 변경
K5.prototype.constructor = K5;
```

<br>

## 객체 멤버 상속
* prototype멤버 뿐만 아니라 특정 객체의 멤버를 상속해야 하는 경우 Function 객체의 `apply(), call()`을 사용해 `constructor chaining을` 구현
* 상위 생성자의 멤버를 new와 하위 생성자를 통해 생성할 객체의 멤버로 추가하는 객체 멤버 상속을 수행
* prototype객체의 프로퍼티를 제거하는 과정 필요

```JavaScript
//객체 멤버 상속을 위해 Function() 생성자의 apply(), call()을 사용해 구현 하는 생성자 체이닝

//constructor
var Car = function(){
    this.fuel = f;
    this.isDriving = false;
};

//prototype
Car.prototype = {
    startEngine: function(){
        this.fuel -=5;
        this.isDriving = true;
    }
};

var K5 = function(f, m){
    //객체 멤버 상속
     Car.apply(this, [f]);  //또는 Car.call(this, f)
     this.model = m;
};

K5.prototype = new Car();
K5.prototype.constructor = K5;
//이 정보는 prototype쪽에 없어도 되므로 제거
delete K5.prototype.fuel;
delete K5.prototype.isDriving;

//오버라이딩
K5.prototype.startEngine = function(){
    this.fuel -= 5;  //K5 생성자 내에 존재하는 fuel 변경
}

var k5 = new K5(1000, '2013년형');
k5.startEngine();
```

<br>

## 객체의 타입 검사
* 타입에 대한 제약이 약해 타입 검사 필요
* prototype 상속을 한 객체를 사용할 때 typeof, instanceof, constructor, toString() 등의 도움 필요

```JavaScript
//typeof, instanceof, constructor를 이용한 객체 타입 검사

function checkType(ojb){
    //null일 경우 문자열 'null' 반환
    if(obj == null)
        return 'null';

    var type = typeof obj;

    //typeof의 반환 값이 'object'이 아닐경우 type값을 반환
    if(type != 'object')
        return type;

    //obj.toString()의 결과 저장
    var str = Objcet.prototype.toString.call(obj);

    //생성자 이름 추출
    var constructor = str.substring(8, str.length - 1);

    //'Object'일 경우엔 constructor 프로퍼티까지 조사
    if(constructor != 'Object')
        return constructor;

    //셀제 Object타입일 경우 constructor값 반환
    if(obj.constructor == Objcet)
        return constructor;

    //사용자 정의 객체의 생성자의 prototype에 정의해 놓은 constructorname
    //프로퍼티가 있으면 constructorname을 반환
    if('constructorname' in obj.constructor.prototype)
        return obj.constructor.prototype.constructorname;

    return '객체 타입을 알 수 없습니다.';
}

var Parent = function(){};
Parent.prototype.constructorname = 'Parent';

var Child = function(){};
Child.prototype = new Parent();
Child.prototype.constructor = Child;
Child.prototype.constructorname = 'Child';

var child = new Child();

document.writeln('checkType(child): ' + checkType(child) + '<br/>');
```
