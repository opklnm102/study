# Go 기초


## 변수 선언
```go
var <name> <type>
```
* 변수 선언과 동시에 초기화시 `타입 지정 생략` 가능
* `:=`를 사용하여 함수 안에서 `var` 생략 가능
```go
func add() {
    num := 3
}
```
* 여러개의 변수 선언
```go
var (
    i int
    b bool
)
```


## 기본 자료형
* bool
   * true / false
* string
   * `immutable type`
* int, int8, int16, int32, int64
* uint, uint8, uint16, uint32, uint64, uintptr
* byte
   * uint8의 다른 이름(alias)
* rune
   * int32의 다른 이름(alias)
   * 유니코드 코드 포인트 값을 표현
* float32, float64
* complex64, complex128

### 명시적 타입 변환 필요
```go
var i int = 100
var f float32 = float32(i)  // type casting
```

### zero value
* 선언하고 초기화하지 않은 변수는 `zero value로 초기화`
* 숫자 - 0
* bool - false
* string - ""


## 상수
* `const` 키워드 사용
* 값 변경 불가
* 숫자형 상수는 `var`로는 표현할 수 없는(범위를 지정하는 등) 수를 정밀하게 표현
```go
var Big_var = 1 << 100  // overflow
const Big_var = 1 << 100
```
* 타입을 지정하지 않은 상수는 맥락에 따라 타입이 변한다 - 타입 추론


## if문
* 바로 조건문 검사
```go
if <condition> {

}
```

* 조건 검사전 statement(if문 내에서만 사용 가능) 실행
```go
if <statement>; <condition> {

}
```


## switch문
* `break`를 하지 않아도 자동으로 case를 종료
* `fallthrough` - case를 종료하지 않고 계속 수행
```go
switch i {
	case 0:
	case f():
}
```

* type으로 switch 사용 
```go
var t interface{}
t = 10

switch t := t.(type) {
    case bool:
        fmt.Printf("bool %v", t)
    case int:
        fmt.Printf("int %v", t)
}
```


## for
* 반목문은 `for`가 유일
```go
for <init statement>; <condition>; <post statement> {

}
```

* while처럼 사용
```go
for <condition expression> {

}
```

* 무한 루프
```go
for <condition> {

}
```


## 배열
* `[n]T`
   * type T값을 n개 저장하는 배열
```go
var a [10]int
```
* 배열 크기는 1번 설정하면 바꿀 수 없다
* 초기화
```go
var arr = [3]int{1, 2, 3}
```


## Slice
* `[]T`
   * type T원소들에 대한 Slice
* 가변 길이
* 배열을 `동적`인것 처럼 쓸 수 있다
* 배열의 값을 읽거나 수정
* `배열보다 많이 쓴다`

### slice 리터럴
* 길이가 없는 배열 리터럴과 같다
```go
[3]bool{true, true, false}  // 배열 리터럴
[]bool{true, true, false}  // 슬라이스 리터럴
```

### `make([]int, len, cap)`
* `len(slice)`
   * length, slice가 포함하고 있는 원소의 개수
* `cap(slice)`
   * capacity, slice가 가리키는 배열에서 slice의 1번째 원소부터 센 원소 개수
* zero value는 `nil`
* 가리키는 배열이 없으면 length, capacity는 0

### 부분 슬라이스
```go
s := []int{0, 1, 2, 3, 4, 5}
s = s[2:5]  // index 2 ~ 4(5-1)까지 - 2, 3, 4
s = s[2:]  // index 2~ - 2, 3, 4, 5
s = s[:]  // 전체
```

### 확장 
```go
s = append(s, 2, 3)  //  0, 1, 2, 3, 4, 5, 2, 3
```
* capacity가 남아 있는 경우, length를 변경하여 데이터 추가
* capacity를 초과하는 경우, 2배의 capacity를 가지는 새로운 array 생성하고, 기존값 복제 후 슬라이스 할당

### 병합
```go
s1 := []int{1,2}
s2 := []int{3,4}

s1 = append(s1, s2)  // 1, 2, 3, 4
```

### 복사
* 값을 복사하는게 아니라 `포인터를 복사`
```go
copy(s1, s2)  // s2의 포인터를 s1로 복사
```


## range
* for에서 `range`를 쓰면 slice, map을 `이터레이트`할 수 있다
* index나 value가 필요없다면 `_` 사용
```go
for <index>, <value> range <slice or map> {

}
```


## Map
* key, value 자료구조
* 생성
```go
make(map[key type]<value type>)
```
* zero value는 `nil`
* 원소 추가
   * `m[key] = elem`
* 값 가져오기
   * `elem = m[key]`
* 원소 제거
   * `delete(m, key)`
* 키 존재 확인
   * `elem, ok = m[key]`
   * m에 key가 있으면 ok = true


## 패키지
* 코드의 `모듈화`, `재사용` 기능 제공
* 패키지를 사용해 `컴포넌트 작성`
* 패키지를 활용해 프로그램 작성을 권장

### main 패키지
* 컴파일러가 실행 프로그램으로 만든다
* main 패키지 안의 `main()`이 프로그램의 시작점이 된다
* 패키지를 라이브러리로 만들 때에는 main패키지나 main()을 사용하면 안된다

### 패키지 import
* import시 컴파일러는 GOROOT, GOPATH를 검색해 패키지를 찾는다
   * `GOROOT/pkg` - 표준 패키지
   * `GOPATH/pkg` - 3rd party 패키지
* 패키지 내의 함수, 구조체, 인터페이스 등의 이름이 `대문자로 시작되면 public`으로 사용
* `소문자`면 패키지 내부에서만 사용 가능

### init()
* 패키지 실행시 호출되는 함수
* 초기화 작업을 해준다
```go
package testlib

var pop map[string]string

func init() { // 패키지 로드시 map 초기화
	pop = make(map[string]string)
}
```

## 함수
* 함수도 값이기 때문에 다른 값처럼 사용
   * 변수에 대입, 인자로 넘기기 등

### 정의
```go
func <name>(<parameter...>) <return type> {
	
}

// example
func add(x int, y int) int {

}
```

* 같은 타입일 경우 1번만 명시 가능
```go
func add(x, y int) int { 

}
```

* 가변 인자
```go
func say(msg ...string) {
    for _, s := range msg {
        fmt.Println(s)
    }
}

func main() {
    say("t", "a", "b", "c")
}
```

### 여러가지 리턴 방법
#### 1. return type 명시
```go
func calc(x, y int) (int, int){
	var sum = x + y
	var sub = x - y
	return sum, sub
}
```

#### 2. return할 변수 선언
```go
func calc(x, y int) (sum, sub int){
	sum = x + y
	sub = x - y
	return  // 미리 정해놓은 sum, sub를 return한다
}
```

### 익명함수
* 함수명이 없다
* 함수 전체를 `변수에 할당`하거나 다른 함수의 `파라미터`에 직접 정의
```go
func main() {
	sum := func(n ...int) int {  // 익명 함수
		s := 0
		for _, i := range n {
			s += i
		}
		return s
	}

	result := sum(1, 2, 3, 4, 5)
	fmt.Println(result)
}
```

### 일급함수
* Go에서 함수는 일급함수로서 `기본타입과 동일 취급`
* 다른 함수로 파라미터로 전달하거나 리턴값으로도 사용 가능
```go
func calc(f func(int, int) int, a int, b int) int {
    result := f(a, b)
    return result
}

func main() {
    add := func(i, j int) int {
        return i + j
    }

    r1 := calc(add, 10, 20)
    fmt.Println(r1)

    r2 := calc(func(x, y int) int { return x - y }, 10, 20)
    fmt.Println(r2)
}
```

### type을 사용한 함수 원형 정의
* 원형 정의의 중복을 제거
* `Delegate`
   * 함수의 원형을 정의하고 함수를 타 메소드에 전달하고 리턴받는 기능
```go
type calculator func(int, int) int

func calc(f calculator, a int, b int) int {
    result := f(a, b)
    return result
}
```

### 클로져
* 자기 body `외부에 있는 변수를 참조`하는 함수
* 함수가 자신이 참조하는 변수에 접근하거나 값을 변경하는 경우, 함수가 변수에 `bound`되었다고 한다
```go
func adder() func(int) int {
    sum := 0
    return func(x int) int {
        sum += x
        return sum
    }
}

func main() {
    pos, neg := adder(), adder()  // 서로 다른 sum을 가진다
}
```

## 포인터
* 포인터는 변수의 `메모리 주소`를 저장
* `*T`는 T value의 포인터, zero value는 `nil`
* `&`연산자는 피연산자의 포인터를 생성, `*`연산자는 포인터가 가리키는 값 참조
* C와 달리 포인터 연산은 불가능
```go
func main(){
	i, j := 42, 2701

	p := &i
	*p = 21  // i = 21
}
```

## 구조채
```go
type <name> struct {

}
```

* 구조체의 필드는 `.`으로 접근
```go
type Vertex struct {
	X, Y int
}

func main(){
	v1 = Vertex{1, 2}
	v2 = Vertex{X:1}  // 특정 필드만 초기화
}
```

### 생성자 함수
```go
type dict struct {
	data map[int]string
}

// constructor
func newDict() *dict {
	d := dict{}
	d.data = map[int]string{}
	return &d  // 포인터 전달
}

func main(){
	dic := newDict()
	dic.data[1] = "A"
}
```

### 메소드
* Go에는 클래스가 없는 대신 `리시버 인자를 갖는 함수`로 메소드를 정의
```go
func (<receiver>) <name> <return type>{

}
```

* 포인터 리시버는 `값과 포인터 모두 접근` 가능
```go
var v Vertex
v.Scale(5)  // 값으로 접근

p := &v
p.Scale(10)  // 포인터로도 접근
```

* 포인터 리시버를 쓰는 이유
   1. 메소드 내부에서 리시버가 가리키는 값을 바꾸고 싶다
   2. 메소드가 호출될 때, 값이 copy되는 것을 피하고 싶다
      * 큰 구조체의 경우 `copy하는 것이 오버헤드`가 될 수 있으므로

## 인터페이스
* 메소드의 집합
* interface는 `type이 구현해야 하는 method(prototype) 정의`
* type이 interface를 구현하기 위해서는 `interface가 가지는 메소드를 구현`
```go
type <name> interface {
    <function>
}
```
* example
```go
// interface 정의
type Shape interface {
    area() float64
    perimeter() float64
}

// Rect 정의
type Rect struct {
    width, height float64
}

// interface 구현
func (r Rect) area() float64 {
    return r.width * r.deight
}
func (r Rect) perimeter() float64 {
    return 2 * (r.width + r.height)
}

func showArea(shapes ...Shape){
    for _, s := range shapes {
        a := s.area()  // interface method 호출
    }
}
```

### Empty interface
```go
interface{}
```
* 메소드가 하나도 없는 인터페이스
* `어떤 타입이든 저장` 가능
* `타입을 알 수 없는 값을 처리`할 때 사용
```go
func main(){
    var i interface{}
    describe(i)

    i = 42
    describe(i)

    i = "hello"
    describe(i)
}

func describe(i interface{}){
    fmt.Printf("(값, 타입) :(%v, %T)", i, i)
}
```

## Error
```go
type error interface {
	Error() string
}
```
* error는 `error interface를 통해` 주고 받는다
* error interface를 구현하는 Custom Error를 만들 수 있다

```go
package main

import (
	"fmt"
	"time"
)

type MyError struct {
	When time.Time
	What string
}

func (e *MyError) Error() string {
	return fmt.Sprintf("at %v, %s", e.When, e.What)
}

func run() error {
	return &MyError{
		time.Now(),
		"it didn't work",
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Println(err)
	}
}
```


## 지연실행 defer
* 특정 문장, 함수를 `defer를 호출하는 함수가 리턴하기 직전`에 실행
* finally처럼 마지막에 `clean up 작업`을 위해 사용
```go
package main

import "os"
import "fmt"

func main() {
	f, err := os.Open("1.txt")
	if err != nil {
		panic(err)
	}

	// main 마지막에 파일 close 실행
	defer f.Close()

	// 파일 읽기
	bytes := make([]byte, 1024)
	f.Read(bytes)
	fmt.Println(len(bytes))
}
```

## panic()
* 현재 함수를 `즉시 멈추고` defer를 모두 실행한 후 즉시 리턴
* call stack을 타고 올라가며 상위 함수에도 적용
   * 마지막에는 프로그램이 에러를 내고 종료
```go
package main

import (
	"fmt"
	"os"
)

func openFile(fn string) {
	f, err := os.Open(fn)
	if err != nil {
		panic(err)
	}
	// 파일 close 실행됨
	defer f.Close()
}

func main() {
	openFile("invalid.txt")
	fmt.Println("Done") // 실행 안됨
}
```

## recover()
* panic()에 의한 `패닉상태를 정상`으로 되돌린다
```go
package main

import (
	"fmt"
	"os"
)

func openFile(fn string) {
	// defer. panic 호출시 실행됨
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("open error", r)
		}
	}()

	f, err := os.Open(fn)
	if err != nil {
		panic(err)
	}
	// 파일 close 실행됨
	defer f.Close()
}

func main() {
	openFile("invalid.txt")
	fmt.Println("Done")  // 실행됨
}
```

## 동시성

### 고루틴
```go
go f(x, y, z)  // 새로운 고루틴 실행
```
* Go runtime이 담당하는 `경량 쓰레드`
* 같은 주소 공간을 쓰기 때문에 shared memory에 접근할 때 `동기화 필요`
* 비동기적으로(asynchronously) 함수 루틴 실행, 여러 코드를 동시에(concurrently) 실행
* os 쓰레드보다 훨씬 가볍게 비동기 Concurrent 처리를 구현하기 위해 만든 것
   * 고루틴들은 os쓰레드와 1:1로 대응되지 않고, Multiplexing으로 훨씬 적은 os쓰레드를 사용
* `체널`을 통해 고루틴간 통신을 쉽게 할 수 있다
```go
func say(s string){
    for i:=0; i<5; i++ {
        fmt.Println(s)
    }
}

func main(){
    say("1")  // 동기
    go say("2")  // 비동기
    go say("3")  // 비동기
    say("4")  // 동기
}
```

#### 익명 함수 고루틴
```go
package main

import (
	"fmt"
	"sync"
)

func main() {
    var wait sync.WaitGroup // WaitGroup 생성
    wait.Add(2)             // 2개의 고루틴을 기다림

    // 익명함수를 사용한 고루틴
    go func() {
        defer wait.Done() // 끝나면 Done() 호출
        fmt.Println("Hello")
    }()

    // 익명함수에 파라미터 전달
    go func(msg string) {
        defer wait.Done() // 끝나면 Done() 호출
        fmt.Println(msg)
    }("Hi")

    wait.Wait() // 고루틴이 모두 끝날 때까지 대기
}
```

### 다중 CPU처리
* GO는 디폴트로 `1개의 CPU`를 사용
* 여러개의 고루틴을 만들더라도, 1개의 CPU에서 작업을 `시분할`하여 처리(Concurrent 처리)
* 멀티 코어 CPU의 경우 Parallel 처리 가능
   * `runtime.GOMAXPROCS(number of cpu)`
> #### 참고 자료
> [Concurrency is not parallelism](https://blog.golang.org/concurrency-is-not-parallelism)   
> 동시성은 하나의 일을 많이 처리 하는 것   
> 평행성은 많은 일을 하는 것

### 체널
* 파이프
* `<-`를 통해 값을 주고받을 수 있다
* 별도의 동기화, condition variable 설정 없이 고루틴 사용 가능
   * 디폴트로 상대방이 준비된 후 값을 주고받을 수 있기 때문에

#### Unbuffered Channel
```go
ch := make(chan <type>)  // 
ch <- v  // 체널 ch를 통해 v를 보냄
v := <- ch  // ch로부터 값을 전달받아, v에 할당
```
* 수신자가 데이터를 받을 때까지 `송신자가 데이터를 보내는 체널에 블락`

#### Buffered Channel
```go
ch := make(chan <type>, <buffer size>)
```
* 전송시
   * 버퍼가 꽉 찰 때까지 블락
* 수신시
   * 다 빌 때까지 블락
* 수신자가 받을 준비가 되어 있지 않을지라도 `지정된 버퍼만큼 데이터를 보내고 다른 일 수행` 가능

#### 체널 파라미터
* 일반적으로 송수신을 모두하는 체널을 전달
* 해당 체널로 송신 or 수신만할 것인지 지정 가능
   * 송신 - `(ch chan <- string)`
   * 수신 - `(ch <- chan string)`
   * 용도와 다르게 사용하면 에러

### Range Close
* sender가 더 이상 보낼 값이 없어 체널을 닫으면 receiver가 알아챌 수 있어야 한다
```go
v, ok := <- ch
```
* 더이상 받을 값이 없고, 닫혔다면 `ok는 false`
* `sender만 체널을 닫는다`
   * receiver가 체널을 닫아, 닫힌 체널에 데이터를 전송하면 패닉 발생
* 파일과 다름
   * 보통은 닫을 필요가 없고 `보낼 값이 없다`는 뜻을 전달하는 의미에서 닫는다
```go
for i: range ch {  // ch가 닫힐 때 까지 계속 값을 받는다

}
```

### select
* 고루틴은 적어도 하나의 case가 실행될 수 있을 때까지 블락
* case가 준비되면 case를 실행하는데, 여러 case가 준비된 경우 `무작위`로 실행
* 준비된 case가 없을 경우 `default case`가 실행
* `블락 없이` 값을 주거나 받을 때 사용
```go
select {
    case i := <- ch:
        // i를 사용
    default:
        // ch로 부터 받는게 블락
}
```
