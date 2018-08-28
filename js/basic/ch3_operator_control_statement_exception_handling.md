# Ch3. 연산자, 제어문, 예외처리

## 비교연산자
### ==
* 좌우 표현식의 평가가 동일할 경우 true
* undefined와 null을 동등하다고 평가
* 문자열과 숫자를 비교할 경우 숫자를 문자열로 변환
* 숫자를 불리언과 비교할 경우 true는 1, false는 0으로 변환
* 객체를 숫자 또는 문자열과 비교할 경우 객체의 valueOf() 또는 toString()변환값인 기본 타입값으로 평가

```JavaScript
5 == 5  //true
5 == '5'  //true
true == 1  //true
```

### ===
* 좌우 표현식 평가 동일, 데이터 타입도 같을 경우 true
* ==와 다르게 타입 변환을 하지 않음

```JavaScript
5 === '5'  //false
```

<br>

## 기타 연산자

### delete
지정된 객체의 프로퍼티나 배열의 원소 삭제
```JavaScript
delete arr[2];  //true or false
```

### instanceof
객체 타입 조사
```JavaScript
arr instanceof Array;  //true or false
```

### new
새로운 객체를 생성하고, 생성자 호출
```JavaScript
var arr = new Array();  //참조값 반환
```

### typeof
데이터 타입을 문자열로 반환
```JavaScript
typeof '문자열';  //string
```

### void
값을 무시하고 undefined를 반환
```JavaScript
void 0
```

<br>

## if문
```JavaScript
if (true) {
    //code
} else if(true){
    //code
}else {
    //code
}
```

<br>

## switch
```JavaScript
switch (1) {
    case 1:
        //code
        break;
    default:
        //code
}
```

<br>

## while
```JavaScript
while (true) {
    //code
}
```

<br>

## do..while
```JavaScript
do {
    //code
} while (true);
```

<br>

## for
```JavaScript
    for (var i = 0; i < array.length; i++) {
        array[i]
    }
```

<br>

## for...in
```JavaScript
for (var variable in object) {
    if (object.hasOwnProperty(variable)) {

    }
}
```

<br>

## 예외
* 예외적인 상황이나 에러가 발생했음을 나타내는 객체
* 런타임에서 에러가 발생할 때마다 예외 발생
* throw문으로 명시적 예외 발생
* throw에서 사용하는 표현식의 결과 타입은 대부분 Error객체 혹은 Error객체를 상속받은 객체지만, 에러메시지를 담은 문자열이나 에러코드를 나타내는 숫자값도 유용하게 사용
```JavaScript
throw 표현식;
throw new Error("에러 메시지")
```

### try...catch...finally
* 예외처리 기법
```JavaScript
try {
    /*
    정상적으로 처리되어야할 코드 기술
    실행중 런타임에서 에러, 예외 발생시
    throw문을 통해 예외 직접 발행
    호출한 함수를 통해 예외가 전파
    */
} catch (e) {
    /*
    예외가 발생할 경우만 실행
    예외와 관련된 정보를 변수  e를 통해 참조
    */
} finally {
    /*
    try블록이 모두 실행 완료되거나,
    예외가 발생하여 catch블록이 실행된 후에도
    무조건 실행이 필요한 코드 기술
    */
}
```
