# Ch4. 함수

## 역할
* 호출 루틴으로서의 함수
  * 호출에 의해 실행
* 데이터로서의 함수
  * 변수, 객체 프로퍼티, 배열 원소에 저장될 수 있고, 매개변수의 전달 값, 다른 함수의 반환값으로도 이용
* 메소드로서의 함수
  * 객체 프로퍼티에 저장되어 객체를 통해 호출하는데 사용
* 생성자 함수
  * new 연산자와 함께 사용하여 객체를 생성하고 초기화하는데 사용

<br>

## 정의하는 방법

1. function을 이용
```JavaScript
function add(op1, op2){
    return op1 + op2;
};
```

2. 함수 리터럴을 이용
```JavaScript
var add = function(op1, op2){
    return op1 + op2;
};
```

3. function 생성자를 이용해 함수 정의
```JavaScript
var add = new function('op1','op2','return op1 + op2;');
```

<br>

## Scope
코드에서 변수를 참조할 수 있는 해당 변수의 유효범위

### Local Scope
* 함수 내의 코드에서만 접근 가능
* 지역변수

### Global Scope
* 코드 전체에서 접근 가능
* 전역변수

> 블록({}) Scope가 존재하지 않는다.

<br>

## 매개변수
* 생략이 가능한 매개변수는 끝에 위치해 임의로 생략가능하게 만드는 것이 중요
```JavaScript
function sum(array, start, end) {

    if(!start)
        start = 0;
    if(!end)
        end = array.length;
}
```

* **객체를 전달** 해 매개변수의 순서에 상관없이 값을 자유롭게 활용
```JavaScript
function add(arg) {
    return arg.op1 + arg.op2;
}
var obj = [op1: 4, op2: 5];
add(obj);
```

* **함수를 전달** 해 콜백메소드, 이벤트 처리 핸들러 구성시 사용
```JavaScript
var calculator = {
    add: function(x, y){
        return x + y;
    }
    sub: function(x, y){
        return x - y;
    }
    mul: function(x, y){
        return x * y;
    }
    div: function(x, y){
        return x / y;
    }
}

function operator1(operator, operand1, operand2){
    return operator(operand1, operand2);
}

function operator2(operatorName, operand1, operand2){
    if((typeof calculator[operatorName]) == 'function'){
        return calculator[operatorName](operand1, operand2);
    }
}
```

<br>

## 함수 리터럴을 전달하는 익명함수
* 함수 리터럴을 이용해 정의한 함수
* 변수, 객체 프로퍼티에 저장하거나, 함수의 인자, 반환값으로 주로 사용
* **클로저** 구성할 때 사용
```JavaScript
var calculator = {
    operate: function(method, op1, op2){
        if(typeof method == 'function'){
            if(typeof op1 != 'number' || typeof op2 != 'number')
                throw new Error('operate(): 숫자 전달');
            return method(op1, op2);
        }
    }
}

var result = calculator.operate(function(x,y){ return x + y;}, 2, 3);

//익명함수 즉시 호출기법. x,y에 2,3이 들어간다.
var result2 = (function(x,y){ return x + y;})(2,3);
```

<br>

## 중첩함수(inner function)
* 함수내에서만 호출, 외부에서 직접 호출 불가
* 특정함수에서만 필요한 기능을 외부에 노출시키지 않고 구현, 객체지향의 정보은닉 특징 구현
* 클로저 구현의 핵심
```JavaScript
function circle(radius) {
    var pi = 3.14;

    function area(r) {
        return r * r * pi;  //내부 변수에 접근 가능
    }

    return area(radius);  //중첩함수는 내부에서만 호출 가능
}
```

<br>

## Scope Chain
* Local Scope는 함수단위로 관리, 이 Local Scope를 관리하는 객체를 **호출 객체**
* 함수의 매개변수, 지역변수가 호출객체의 프로퍼티
* Global Scope를 나타내는 객체를 **전역객체, Root 객체** 라고 함
* 전역변수, 전역함수는 전역 객체의 프로퍼티와 메소드
* `var`없이 변수를 선언하면 전역 객체에 등록되 전역변수로 사용
* Scope Chain은 전역객체와 함수 호출시 생성된 호출객체를 생성 순서대로 연결한 리스트
* 함수는 함수가 호출되는 시점을 기준으로 Scope Chain에 연결되어 있는 모든 것들에 접근가능

```JavaScript
//1. 전역 레벨의 파싱결과 전역객체에 프로퍼티 x, outer가 정의
var x = '전역 객체의 프로퍼티';
function outer(){
    var y = 'outer함수의 호출객체에 등록되어 있는 프로퍼티';

    function inner(){
        var z = 'inner함수의 호출객체에 등록되어 있는 프로퍼티';
        document.writeln('x' + x + '<br/>');
        document.writeln('y' + y + '<br/>');
        document.writeln('z' + z + '<br/>');
    }

    //3. 함수레벨의 파싱결과 inner함수에 대한 호출객체에 arguments프로퍼티가 초기화,
    //z가 정의
    //outer함수의 호출객체와 inner함수의 호출 객체 간에 스코프체인이 연결되고,
    //inner함수의 코드 실행
    //x는 전역객체, y는 outer호출객체, z는 inner호출객체에 접근해 값을 취한다.
    inner();
}

//2. 함수레벨의 파싱결과 outer함수에 대한 호출객체에 arguments프로퍼티가 초기화,
//y와 inner가 정의
//전역객체와 outer함수의 호출 객체 간에 스코프체인이 열결된 후,
//outer함수의 코드를 실행
outer();
```

<br>

## 콜백함수
* 직접 호출하는 함수가 아닌 **어떤 특정시점이나 조건을 만족했을 때** 호출될 수 있도록 라이브러리 함수(메인에서 호출하는 함수)의 인자로 전달되는 함수
* 비동기 프로그래밍(ex. Node.js), 이벤트 핸들러에 사용하는 메커니즘

```JavaScript
function main(){
    var array = [];

    for(var i=0; i<10; i++){
        array[i] = Math.cell(Math.random() * 45);
    }

    //array: data
    //even, odd: callback method
    work(array, even, odd);
}

//callback method even. 짝수 발견시마다 인덱스 출력
function even(idx, num){
    document.writeln((idx + 1) + '번째 데이터는 짝수 ' + num + '입니다.');
}

//callback method odd. 홀수 발견시마다 인덱스 출력
function odd(idx, num){
    document.writeln((idx + 1) + '번째 데이터는 홀수 ' + num + '입니다.');    
}

function work(data, callback1, callback2){
    for(var i=0; i<data.length; i++){
        if(data[i]%2 == 0)
            callback1(i, data[i]);
        else
            callback2(i, data[i]);
    }
}

//main함수 호출
main();
```

<br>

## 클로저
* 함수의 호출객체와 연결된 스코프 체인(실행될 코드와 함수의 유효범위)의 조합
* 함수의 지역변수에 대한 중첩함수를 만들면 **비공개 속성과 접근자 메소드**를 구현
* JavaScript가 객체지향의 정보은닉을 실현할 수 있는 기법

```JavaScript
//1. 전역 레벨의 파싱결과 전역객체에 프로퍼티 makeId, id가 정의
function makeId(){
    var lastId = 0;

    return function(){ return ++ lastId; };
}

//2. 함수레벨의 파싱 결과 makeId()에 대한 호출 객체에 arguments 프로퍼티가 초기화 되고, 프로퍼티 lastId가 정의되고,
//전역객체와 makeId()의 호출객체 간에 스코프체인이 연결된 후,
//makeId()가 실행되고, id는 익명함수를 반환받는다.
var id = makeId();

//3. 함수레벨의 파싱결과 id함수에 대한 호출 객체에 arguments 프로퍼티가 초기화되고, makeId함수의 호출객체와 id함수의 호출객체 간에 스코프 체인이 연결되고,
//id함수의 코드를 실행
//이때 lastId는 makeId()의 호출객체에 접근해서 값을 취한다.
document.writeln('id ' + id());
```
