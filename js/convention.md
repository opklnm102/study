# [JavaScript] JavaScript Style Guide and Coding Conventions

## Variable Names
* camelCase
* 시작은 글자로
```JavaScript
firstName = "john"
price = 19.33;
```

<br>

## Spaces Around Operators
* 항상 `연산자` 다음에 스페이스, `,`다음에 스페이스
```JavaScript
var x = y + z;
var arr = ["a", "b", "c"];
```

<br>

## Code Indentation
* 코드블럭은 `4스페이스`
```JavaScript
function toCelsius(fahrenheit) {
    return (5 / 9) * (fahrenheit - 32);
}
```

<br>

## Statement Rules
* 간단한 문장 끝에 `;`
```JavaScript
var values = ["Volvo", "Saab", "Fiat"];

var person = {
    firstName: "John",
    lastName: "Doe",
    age: 50,
};
```
* 복잡한 문장 끝에는 `;`없이

### 함수
```JavaScript
function toCelsius(fahrenheit) {
    return (5 / 9) * (fahrenheit - 32);
}
```

### 반복문
```JavaScript
for (i = 0; i < 5; i++) {
    x += i;
}
```

### 조건문
```JavaScript
if (time < 20) {
    greeting = "Good day";
} else {
    greeting = "Good evening";
}
```

---

<br>

> #### Reference
> * [JavaScript Style Guide and Coding Conventions](http://www.w3schools.com/js/js_conventions.asp)
