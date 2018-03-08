# [JavaScript] difference var, let, const

## var
* `function-scope`

```js 
for (var i = 0; i < 10; i++) {
    console.log('i', i);
}
console.log('after loop i is ', i);  // after loop i is 10
```
* for()가 끝난 후 i에 10이 저장
   * var가 `hoisting`이 되었기 때문

```js
// error 발생
function counter() {
    for (var i = 0; i < 10; i++) {
        console.log('i', i);
    }
}

counter();
console.log('after loop i is ', i);  // ReferenceError: i is not defined
```
* var는 `function-scope`이므로 function 내에서만 유효

> #### hoisting
> * 변수의 정의가 scope에 따라 선언과 초기화가 분리되는 것
> * 변수의 선언이 초기화나 할당시에 발생하는 것이 아니라 최상위로 끌어올려진다
>    * 변수가 함수내에서 정의되었을 경우, 선언이 함수의 최상위로 끌어올려짐
>    * 함수 외부에서 정의되었을 경우, 전역 context의 최상위로 끌어올려짐
> ```js
> num = 6;
> num + 7;
> var num;  // num의 선언이 끌어올려짐(hoisting)
> ```


### IIFE(immediately invoked function expression)를 사용해 function-scope 만들기
* 항상 function을 만들어 function-scope를 만들 수 없으니 IIFE를 이용

```js
(function () {
    // var i는 여기까지 hoisting
    for (var i = 0; i < 10; i++) {
        console.log('i', i);
    }
})();
console.log('after loop i is', i);  // ReferenceError: i is not defined
```

```js
// function-scope처럼 보이게 만들어주지만 결과가 같지 않다
(function () {
    for (i = 0; i < 10; i++) {
        console.log('i', i);
    }
})();
console.log('after loop i is', i);  // after loop i is 10

// 아래처럼 i가 hoisting이 되어서 global variable되었기 때문
var i;
(function () {
    for (i = 0; i < 10; i++) {
        console.log('i', i);
    }
})();
console.log('after loop i is', i);  // after loop i is 10
```

* 위와 같은 hoisting을 막기 위해 `use strict` 사용
```js
(function () {
    'use strict'
    for(i = 0; i < 10; i++) {
        console.log('i', i);
    }
})();
console.log('after loop i is', i);  // ReferenceRrror: i is not defined
```
* 변수 선언에 할일이 많다..

---

## let, const
* `block-scoped`
* es2015에서 추가
* let
   * 변수 재선언 불가능
   * `mutable` - 재할당 가능
* const
   * 변수 재선언 불가능
   * `immutable` - 재할당 불가능

```js
// 변수 재선언시 error X
var a = 'test'
var a = 'test2'

// hoisting으로 인해 ReferenceError X
c = 'test'
var c

// let
let a = 'test';
let a = 'test2';  // Uncaught SyntaxError
a = 'test3';  // 가능

// const
const b = 'test';
const b = 'test2';  // Uncaught SyntaxError
b = 'test3';  // Uncaught SyntaxError
```


### let, const hoisting
* var가 `function-scope`로 hoisting이 일어난다면, let, const는 `block-scope`로 hoisting이 일어난다

```js
// error case
c = 'test';  // ReferenceError
let c;

// normal case
let d
d = 'test';
```
* tdz(temporal dead zone) 때문에 error 발생
* let은 값을 할당하기 전에 변수가 선언되어 있어야 하는데 그렇지 않기 때문

> runtime type check에 tdz가 필요

```js
const e;  // const 선언과 동시에 값을 할당해야 한다
```


> #### 참고
> * [Hoisting](https://developer.mozilla.org/ko/docs/Glossary/Hoisting)
> * [What is the Temporal Dead Zone?](https://github.com/ajzawawi/js-interview-prep/blob/master/answers/es6/temporal-dead-zone.md)
> * [Why is there a “temporal dead zone” in ES6?](http://2ality.com/2015/10/why-tdz.html)
