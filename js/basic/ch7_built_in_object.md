# Ch7. 내장 객체

## Array
* 배열을 다루기 위한객체
* 배열의 원소에 대한 추가, 삭제, 정렬 등의 조작 기능 제공
* `new`와 생성자를 통해 객체를 생성할 수 있지만, 리터럴로도 많이 사용
* 자동으로 크기가 증가됨
```JavaScript
//생성
var arr = new Array('kim', `lee`);
var arr = new Array();
var arr = new Array(10);
var arr = ['kim', 'lee'];
var arr = [];
```

| 멤버 | 설명 |
| :---: | :---: |
| concat(arr) | arr을 현재 배열에 연결 |
| join(sep) | 배열의 원소를 구분문자열 sep로 연결해 문자열 반환 |
| slice(start, [,end]) | start부터 end-1의 원소로 배열을 생성하여 반환 |
| splice(start, cnt [,rep [,...]]) | start부터 cnt개의 원소를 rep...로 치환 |
| pop() | 배열 끝의 원소를 꺼내 배열에서 삭제 |
| push(data1 [,...]) | 배열 끝에 원소 추가 |
| shift() | 배열 처음에서 원소를 꺼내 삭제 |
| unshift(data1, [,...]) | 배열 처음에 원소 추가 |
| reverse() | 역순으로 정렬 |
| sort([func]) | 오름차순 정렬, func는 같으면 0, >면 1, <면 -1을 반환하는 콜백함수 |
| length | 배열의 크기 |
| toString() |  [원소1, 원소2, ...]형식의 문자열 반환 |

<br>

## String
* 문자열을 다루기 위한 wrapper객체
* 문자열의 검색, 부분 문자열의 추출, 변환 등의 조작 기능 제공
* `new`와 생성자를 이용해 객체를 생성할 수 있지만, 리터럴로 표현하는 것이 일반적
```JavaScript
var greeting = new String('hello');
var greeting = `hello`;
```

| 멤버 | 설명 |
| :---: | :---: |
| indexOf(stbstr [,start]) | start부터 정방향으로 substr과 일치하는 인덱스 반환 |
| lastIndexOf(substr [,start]) | start부터 역방향으로 substr과 일치하는 인덱스 반환 |
| charAt(n) | n번 인덱스의 문자 반환 |
| slice(start [,end]) | start에서 end-1 사이의 문자 반환 |
| substring(start [,end]) | start에서 end-1 사이의 문자를 반환 |
| substr(start [,cnt]) | start에서 cnt개의 문자 반환 |
| split(str [,limit]) | 문자열을 str로 분할하여 결과를 배열로 반환(limit는 최대 분할 수) |
| match(reg) | 정규표현 reg로 문자열 검색, 일치한 부분문자열 반환 |
| replace(reg, rep) | 정규표현 reg로 문자열 검색, 일치한 부분 rep로 치환 |
| search(reg) | 정규표현 reg로 문자열 검색, 일치한 처음위치 반환 |
| toLowerCase() | 소문자 치환 |
| toUpperCase() | 대문자 치환 |
| concat(str) | 문자열 뒤에 str을 연결한 새로운 문자열 반환 |
| length | 문자열 길이 반환 |

<br>

## Number
* 숫자를 다루기 위한 wrapper객체
* `new`와 생성자를 이용해 객체를 생성할 수 있지만, 리터럴로 표현하는 것이 일반적
```JavaScript
var num = new Number(100);
var num = 100;
```

| 멤버 | 설명 |
| :---: | :---: |
| MAX_VALUE | 최대값(생성자의 프로퍼티) |
| MIN_VALUE | 최소값(생성자의 프로퍼티) |
| NaN | 숫자값 아님(생성자의 프로퍼티) |
| NEGATIVE_INFINITY | 음수의 무한대(생성자의 프로퍼티) |
| POSITIVE_INFINITY | 양수의 무한대(생성자의 프로퍼티) |
| toString(n) | n진수값으로 변환 |
| toExponential(n) | 지수형식으로 변환(n은 소수점 이하의 행수) |
| toFixed(n) | 소수점 이하 자리수 n에 맞춰 변환(자리수가 부족한 경우 0으로 채움) |
| toPrecision(n) | 전체 유효 자리수 n에 맞춰 변환(자리수가 부족한 경우 0으로 채움) |

<br>

## Math

| 멤버 | 설명 |
| :---: | :---: |
| abs(n) | 절대값 |
| max(n1, n2) | 둘 중 큰값 |
| min(n1, n2) | 둘 중 작은값 |
| pow(base, n) | base의 n제곱 |
| random() | 0~1사이의 난수 |
| ceil(n) | n이상의 최소 정수 |
| floor(n) | n이하의 최대 정수 |
| round(n) | 반올림 값 |
| SQRT1_2 | 1/2의 제곱근 |
| SQRT2 | 2의 제곱근 |
| sqrt(n) | n의 제곱근 |
| PI | 원주율 |

<br>

## Date
* `new`와 생성자를 통해 객체 생성
* 1970년 1월 1일 0시 0분 0초를 기준으로 시각을 관리.
* 월 지정값은 0 ~ 11
```JavaScript
var d = new Date();
var d = new Date(`2012/12/10`);
var d = new Date(2012, 11, 10, 22, 10, 33, 500);
```

<br>

## JSON
* JavaScript에서 객체를 Plain Text로 표현하는 방식
* 시스템간의 데이터 교환 수단으로 사용(XML보다 용량이 작고, 파싱에 걸리는 시간이 절약)
* Web환경에 최적화되어 있는 JavaScript에서 바로 객체화해 사용할 수 있기 때문에 **생산성과 편의성이 높음**
* 숫자, 문자열, 불리언, 배열, 객체를 표현할 수 있음
* `JSON.parse()`를 이용해 JSON문자열을 파싱하고 JavaScript객체로 변환
* `JSON.stringify()`를 이용해 JavaScript객체를 JSON문자열로 변환
```JSON
{
    "name": "dong",
    "age": 12,
    "items":[
        {"item": 3},
        {"item": 4}
    ]
}
```
