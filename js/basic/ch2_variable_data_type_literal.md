# Ch2. 변수, 데이터 타입, 리터럴

## `<script>`와 자바스크립트 - 자바스크립트 코드의 실행

1. 스크립트 코드 파싱(전역 스코프)
2. 스크립트 코드 실행
3. 함수 호출
4. 함수 파싱(함수 스코프)
5. 함수 실행

<br>

## JavaScript 출력 - HTML에서 JavaScript기술 방식

### 인라인 스크립트 방식

* `<script>` 아래 JavaScript 코드를 직접 작성
```HTML
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <script type="text/JavaScript">
    document.writeln("fdfd")
  </script>
</body>
</html>
```

### 외부 스크립트 방식
```HTML
//ex2.html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
    <script src="ex2.js" charset="utf-8"></script>
</body>
</html>
```

```JavaScript
//ex2.js
document.writeln("fdfd");
```

JavaScript 코드를 외부 파일(확장자 .js)에 작성하고 이 파일의 이름을 `<script>`의 `src`속성 값으로 지정

> 하나의 `<script>`안에서 외부 스크립트와 인라인 스크립트는 동시에 작성 불가(인라인 내용 무시)
`<script>`는 `<head>` or `<body>` 아래에 작성 가능

<br>

## 문장 규칙
1. 문장 끝에 `;`
2. 대소문자 구별
3. 문장에서 화이트 스페이스(tab, space) 문자 무시

<br>

## 주석
* `//` 단일 행
* `/* ... */` 블록

<br>

## 변수 선언, var
* `var`키워드를 이용해 변수 선언
> var 변수명[=초기값];

```JavaScript
var a;
var b = 6;
var c = f;
```

선언시 초기값을 지정하지 않을 경우, 값을 저장할 때까지 그 변수는 **undefined** 상태
`var`는 생략 가능하지만, 스코프 문제가 발생할 수 있으므로 지양

<br>

## 식별자 규칙
* 첫번째 문자는 `[A-Za-z_$]`만 사용
* 나머지 문자는 `[A-Za-z_$0-9]`만 사용
* 예약어는 사용할 수 없다
```JavaScript
var kor_score
```

<br>

## Data Type

### 기본형

#### 숫자
* 정수, 실수 구분하지 않는다
* 8바이트 크기의 실수로 표현
```JavaScript
var num = 10;
```

#### string
* 유니코드 문자, 숫자, 문장부호들의 시퀀스로 텍스트 표현
* `''`나 `""`로 둘러싸 표현
* 단일 문자는 길이가 1인 string으로 표현
```JavaScript
var str = "string1";
```

#### boolean
* true/false의 진리값 표현

#### null
* 보통 참조 타입과 함께 쓰여, 어떠한 객체도 나타내지 않는 특수한 값으로 사용

#### undefined
* 변수는 선언되었으나 값이 할당된 적이 없는 변수에 접근하거나, 존재하지 않는 객체 프로퍼티에 접근할 경우 반환되는 값

### 참조형

#### array
* 데이터 값들의 모음
* 0부터 시작하는 인덱스
* `[]`로 인덱스의 값을 사용
```JavaScript
var point = {x: 300, y: 400};
```

#### object
* 이름이 붙은 값(property)들의 모음
* `.property 이름`, `[property 이름]`로 접근
```JavaScript
var arr = [10, 20, 30];
```

#### function
* 객체 property에 할당될 수 있는 실행가능한 코드를 가지고 있는 데이터 타입

<br>

## 리터럴(Literal)
프로그램의 코드 상에 데이터의 값을 표현하는 방식

### JavaScript의 리터럴

#### 객체 리터럴
* 메소드: 함수가 프로퍼티에 저장될 경우 프로퍼티명이 메소드명이 됨
```JavaScript
var point = {"x": 300, "y": 200};
var rectangle = {
    topLeft:{x:300, y:200},
    bottomRight: {x:350, y:280},
    size: function(){
        return (this.bottomRight.x - this.topLeft.x) * (this.bottomRight.y - this.topLeft.y);
    }
};
```

#### 함수 리터럴
* 어떤 입력 값을 이용해 미리 정의된 로직을 처리하여 결과를 반환하는 구조
* 객체 프로퍼티에도 할당될 수 있는 **실행가능한 코드 값**
* 객체 프로퍼티에 저장된 함수를 객체의 메소드라 부름
* 함수도 데이터 타입의 하나로 다룰 수 있기 때문에 변수, 배열, 객체 프로퍼티에 저장할 수 있으며, 다른 **함수의 전달 인자**로 넘겨줄 수도 있음(**콜백 메커니즘**에 사용)
* return이 없으면 undefined값 반환
```JavaScript
var add = function(op1, op2){
    return op1 + op2;
};
```

#### boolean 리터럴
* true/false를 표현
```JavaScript
var isOpened = false;  //false
!isOpened  //true
score >= 70
```

#### undefined
* 변수가 선언은 되었지만 값이 할당된 적이 없는 변수에 접근하거나, 존재하지 않는 객체 프로퍼티에 접근할 경우 반환되는 값
* 논리 false, 산술 Nan, 문자열 "undefined"로 변환되어 연산

#### null
* 예약어
* 참조타입과 함께 쓰임, 어떠한 객체도 나타내지 않는 특수한 값
* 논리 false, 산술 0, 문자열 "null"로 변환되어 연산
```JavaScript
var a;  //변수 선언, undefined
var obj = {};
obj.prop;  //obj애 orop는 없으므로 undefined
obj = null;  //객체 참조 제거
```
