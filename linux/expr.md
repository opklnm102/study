# [Linux] expr - evaluate expression
> date - 2020.03.07  
> keyword - linux, expr  
> 간단한 연산에 사용할 수 있는 expr에 대해서 정리  

<br>

## expr(evaluate expression) 이란?
* **식(expression)을 평가(evaluate)** 후 결과를 stdout으로 출력
* 모든 정수는 10진수로 인식
* 모든 변환 작업에 overflow 확인하고, overflow시 오류 상태로 종료

<br>

### Syntax
```
$ expr [expression]
```

<br>

### expression
* 산술 - `+`, `-`, `*`, `/`, `%`
* 논리 - `|`, `&`
* 관계 - `=`, `!=`, `>=`, `>`, `<`, `<=`
* 문자열 - `:`

<br>

### 연산자와 피연사자는 space로 구분
```sh
$ expr 5+1
5+1

$ expr 5 + 1 
6
```

<br>

### 연산자 중 일부는 특수문자로 `'`, `"`, `\` 필요
```sh
$ expr 5 * 10
expr: syntax error

$ expr 5 \* 10 
50

$ expr 5 '*' 10
50

$ expr 5 "*" 10
50
```

<br>

### `'`을 사용하면 문자열로 인식
```sh
$ expr '5 * 10'
5 * 10
```


<br>

## Example

### Simple Calculation
```sh
$ a=10
$ a=$(expr $a + 1)
11

### other way
$ a=2
$ a=$((a + 1))
$ echo "$a"
3
```

<br>

### `()`로 연산 우선 순위 설정
```sh
$ a=2
$ expr \( $a - 10 \) \* 2
-16
```

<br>

### 변수의 문자 수 출력
```sh
$ expr \( "X$a" : ".*" \) - 1
5

### other way
$ echo "${#a}"
5
```

<br>

### path의 file 이름 출력
```sh
$ full_path=/example/path/find.txt

$ expr "//$full_path" : '.*/\(.*\)'
find.txt

### other way
$ echo "${full_path##*/}"
find.txt
```

<br>

### 연산자 비교
* 연산자로 인식하게 하지 않기 위해 `x`를 사용
```sh
$ a=*
$ expr x$a = x'*'
```

<br>

### 문자열 길이 출력
* 1번째 문자부터 일치 여부를 판단
```sh
$ expr apple : ap 
2

$ expr apple : le
0

$ expr 'apple le' : le
0
```


<br><br>

> #### Reference
> * [expr(1) - Linux man page](https://linux.die.net/man/1/expr)
