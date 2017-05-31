# go tour

## hello world
```go
package main

import "fmt'"

func main() {
    fmt.Println("hello, 안녕")
}
```

## 패키지(Packages)
* 모든 go 프로그램은 패키지로 구성
* 프로그램은 `main 패키지`에서부터 실행
* 패키지 이름은 디렉토리 `경로의 마지막 이름`을 사용
   * ex. path/filepath면 filepath
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println("Happy", math.Pi, "Day")
}
```

## 임포트(imports)
* 여러개의 package를 ()로 감싸서 표현
* 여러번 사용가능
```go
import (
	"fmt"
	"math"
)

// or
import "fmt"
import "math"
```

## 익스포트(Exported names)
* 패키지를 import하면 패키지가 외부로 export한 것들(메소드, 변수, 상수등)에 접근 가능
* `첫문자가 대문자`면 패키지를 사용하는 곳에서 접근할 수 있는 exported name이 된다

```go
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println(math.Pi)
}
```

## 함수

* 기본 형식
```go
func name(paramater...) return type {
    body
}

// ex.
func add(x int, y int) int {
	return x + y
}
```

* 2개 이상의 매개변수가 같은 type일 때, 같은 type을 취하는 마지막 매개변수에만 type을 명시
   * x int, y int -> x, y int
```go
func sub(x, y int) int {
	return x - y
}
```

* Multiple results
   * 하나의 함수는 여러개의 결과 반환 가능
```go
package main

import "fmt"

func swap(x, y string) (string, string) {
	return y, x
}

func main() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}
```

* Named results
   * 반환 값에 이름을 부여하면 변수처럼 사용가능
   * 결과에 이름을 붙이면, 반환 값을 지정하지 않은 return문장으로 결과의 현재 값을 알아서 반환
```go
package main

import "fmt"

func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(split(17))
}
```

## 변수(Variables)
* `var` 키워드 사용
* type은 문장 `끝에 명시`
* 초기화하는 경우 타입 생략
   * 동적 타이핑 - 초기화된 값에 따라 타입 결정
```go
package main

import "fmt"

var x, y, z int
var b bool
var c, python, java = true, false, "no!"  // 동적 타이핑

func main() {
	fmt.Println(x, y, z, b, c, python, java)
}
```

* 변수의 짧은 선언
   * 함수내에서 `:=`를 사용하면 var과 명시적인 타입(e.g. int, bool)을 생략
   * 함수 밖에서는 사용불가
```go
package main

import "fmt"

func main() {
	var x, y, z int = 1, 2, 3
	c, python, java := true, false, "no!"

	fmt.Println(x, y, z, c, python, java)
}
```

## 상수(Constants)
* `const` 키워드 사용
```go
package main

import "fmt"

const Pi = 3.14

func main() {
	const World = "안녕"
	fmt.Println("Hello", World)
	fmt.Println("Happy", Pi, "Day")

	const Truth = true
	fmt.Println("Go rules?", Truth)
}
```

* 숫자형 상수(Numeric Constants)
   * 정밀한 값을 표현할 수 있다
   * type을 지정하지 않은 상수는 context에 따라 type을 가지게 된다
```go
package main

import "fmt"

const (
	Big   = 1 << 100
	Small = Big >> 99
)

func needInt(x int) int {
	return x*10 + 1
}

func needFloat(x float64) float64 {
	return x * 0.1
}

func main() {
	fmt.Println(needInt(Small))   // 21
	fmt.Println(needFloat(Small)) // 0.2
	fmt.Println(needFloat(Big))   // 1.2676506002282295e+29
}
```

## 반복문(for)
* go는 반복문이 for밖에 없다
```go
package main

import "fmt"

func main() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println(sum)
}
```

* 조건문만 표현할 수도 있다
   * while처럼 사용 가능
```go
package main

import "fmt"

func main() {
	sum := 1
	for sum < 1000 {
		sum += sum
	}
	fmt.Println(sum)
}
```

* for에서 조건문을 생략하면 `무한루프`를 표현
```go
package main

func main() {
	for {
	}
}
```

## 조건문(if)
```go
package main

import (
	"fmt"
	"math"
)

func sqrt(x float64) string {
	if x < 0 {
		return sqrt(-x) + "i"
	}
	return fmt.Sprint(math.Sqrt(x))
}

func main() {
	fmt.Println(sqrt(2), sqrt(-4))
}
```

* if와 짧은 명령 사용하기
   * for처럼 if에서도 조건문 앞에 짧은 문장을 실행할 수 있다
   * if, else의 scope에서만 사용가능
```go
package main

import (
	"fmt"
	"math"
)

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	} else {
		fmt.Printf("%g >= %g\n", v, lim)
	}
	// can't use v here, though
	return lim
}

func main() {
	fmt.Println(
		pow(3, 2, 10),
		pow(3, 3, 20),
	)
}
```

## 연습: 루프와 함수
* 제곱근 함수를 `newton's method`을 이용하여 구현
* newton's method
   * 초기값 z를 선택한 후 `z = z - (z * z - x) / (2 * z)`공식을 이용하여 반복적으로 Sqrt(x)함수의 근사값을 찾아가는 방법
```go
package main

import (
	"fmt"
	"math"
)

func Sqrt(x float64) float64 {
	z := float64(1)
	var preZ = x

	for {
		z = z - (z*z-x)/(2*z)
		if preZ-z < 0.00000000000000000000000000001 {
			break
		}
		preZ = z
	}
	return z
}

func main() {
	fmt.Println(Sqrt(5))
	fmt.Println(math.Sqrt(5))
}
```


## 기본 자료형
* bool
* string
* int, int8, int16, int32, int64
* uint, uint8, uint16, uint32, uint64, uintptr
* byte  // uint8의 다른 이름(alias)
* rune  // int32의 다른 이름(alias), 유니코드 코드 포인트 값을 표현
* float32, float64
* complex64, complex128

```go
package main

import (
	"fmt"
	"math/cmplx"
)

var (
	ToBe   bool       = false     // fd
	MaxInt uint64     = 1<<64 - 1 // f
	z      complex128 = cmplx.Sqrt(-5 + 12i)
)

func main() {
	const f = "%T(%v)\n"  // %T(type), %v(value)
	fmt.Printf(f, ToBe, ToBe)  // bool(false)
	fmt.Printf(f, MaxInt, MaxInt)  // uint64(18446744073709551615)
	fmt.Printf(f, z, z)  // complex128((2+3i))
}
```

## 구조체(Structs)
* struct는 필드(데이터)들의 조합
* type 선언으로 struct의 이름을 지정할 수 있다
* 구조체에 속한 필드(데이터)는 `.`으로 접근

```go
package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	v.X = 4
	fmt.Println(v, v.X)
}
```

## 포인터(Pointers)
* 포인터 연산은 불가능
* 구조체 변수는 구조체 포인터를 이용해서 접근할 수 있다
* 포인터를 이용하는 간접적인 접근은 실제 구조체에도 영향을 미침

```go
package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

func main() {
	p := Vertex{1, 2}
	q := &p   // q는 포인터, p의 주소를 가진다
	q.X = 1e9 // q를 통해 p를 조작
	fmt.Println(p)  // {1000000000 2}
}
```

## 구조체 리터럴(Struct Literals)
* `필드와 값을 나열`해서 구조체를 새로 할당하는 방법
* 원하는 필드를 `{Name: value}`를 통해 할당(필드의 순서 상관X)
* `&`을 사용하면 구조체 리터럴에 대한 포인터를 생성

```go
package main

import "fmt"

type Vertex struct {
	X, Y int
}

var (
	p = Vertex{1, 2}  // has type Vertex
	q = &Vertex{1, 2} // has type *Vertex
	r = Vertex{X: 1}  // Y:0 is implicit
	s = Vertex{}      // X:0 and Y:0
)

func main() {
	fmt.Println(p, q, r, s)  // {1 2} &{1 2} {1 0} {0 0}
}
```

## New()
* new(T)는 모든 필드가 zero value가 할당된 `T타입의 포인터`를 반환
   * zero value - 0(숫자), nil(참조)
* `var t *T = new(T)` or `t := new(T)`

```go
package main

import "fmt"

type Vertex struct {
	X, Y int
}

func main() {
	v := new(Vertex)
	fmt.Println(v) // &{0 0}
	v.X, v.Y = 11, 9
	fmt.Println(v) // &{11 9}
}
```

## 슬라이스(Slices)
* 배열
* `[]T`는 타입T를 가지는 요소의 Slice

```go
package main

import "fmt"

func main() {
	p := []int{2, 3, 5, 7, 11, 13}
	fmt.Println("p ==", p) // p == [2 3 5 7 11 13]

	for i := 0; i < len(p); i++ {
		fmt.Printf("p[%d] == %d\n", i, p[i])
	}
}
```

### slicing slices
* slice는 재분할 가능
* 같은 slice을 가리키는(point) 새로운 slice를 만들수 도 있다
* `s[lo:hi]` -> lo ~ (hi-1)의 요소를 포함하는 슬라이스
* `s[lo:lo]` -> empty slice
* `s[lo:lo+1]` -> 하나의 요소를 가짐

```go
package main

import "fmt"

func main() {
	p := []int{2, 3, 5, 7, 11, 13}
	fmt.Println("p==", p)            // p == [2 3 5 7 11 13]
	fmt.Println("p[1:4] ==", p[1:4]) // p[1:4] == [3 5 7]

	// missing low index implies 0
	fmt.Println("p[:3] ==", p[:3]) // p[:3] == [2 3 5]

	// missing high index implies len(s)
	fmt.Println("p[4:] ==", p[4:]) // p[4:] == [11 13]
}
```

### slice 만들기
```go
make([]T, len, capacity)
```

```go
package main

import "fmt"

func printSlice(s string, x []int) {
	fmt.Printf("%s len=%d cap=%d %v\n", s, len(x), cap(x), x)
}

func main() {
	a := make([]int, 5)  // 0을 할당한 배열을 생성하고, 그것을 참조
	printSlice("a", a) // a len=5 cap=5 [0 0 0 0 0]
	b := make([]int, 0, 5)  // make()의 3번째 매개변수로 capacity를 제한
	printSlice("b", b) // b len=0 cap=5 []
	c := b[:2]
	printSlice("c", c) // c len=2 cap=5 [0 0]
	d := c[2:5]
	printSlice("d", d) // d len=3 cap=3 [0 0 0]
}
```

### 빈 슬라이스
* slice의 zero value는 nil
   * nil slice - 길이, 최대크기 0
* [Go Slices: usage and internals](https://blog.golang.org/go-slices-usage-and-internals)

```go
package main

import "fmt"

func main() {
	var z []int
	fmt.Println(z, len(z), cap(z)) // [] 0 0
	if z == nil {
		fmt.Println("nil!")
	}
}
```

## Range()
* for문에서 range()로 `slice, map을 순회`할 수 있다
* `_`를 이용해 index, value를 무시

```go
package main

import "fmt"

var pow = []int{1, 2, 4, 8, 16, 32, 64, 128}

func main() {
	for i, v := range pow {
		fmt.Printf("2**%d = %d\n", i, v)
	}

	pow := make([]int, 10)
	// index만 사용
	for i := range pow {
		pow[i] = 1 << uint(i)
	}
	// value만 사용
	for _, value := range pow {
		fmt.Printf("%d\n", value)
	}
}
```

### 연습: 슬라이스
```go
// go tour 36
package main

import "code.google.com/p/go-tour/pic"

func Pic(dx, dy int) [][]uint8 {
	var arr = make([][]uint8, dy)
		for x := range arr {
			 arr[x] = make([]uint8, dx)

			 for y := range arr[x] {
				 arr[x][y] = uint8(x^y)
			  }
		}
	return arr
}

func main() {
	pic.Show(Pic)
}
```

## 맵(Maps)
* `key, value` 자료구조
* 사용하기전 반드시 `make()` -> new가 아님
* make()를 수행하지 않은 nil에는 값을 할당할 수 없다
```go
make(map[key]value)
```

```go
package main

import "fmt"

type Vertex struct {
	Lat, Long float64
}

var m map[string]Vertex

func main() {
	m = make(map[string]Vertex)
	m["Bell Labs"] = Vertex{
		40.68433, -74.39967,
	}
	fmt.Println(m["Bell Labs"])
}
```

### 맵 리터럴(Map literals)
* 구조체 리터럴과 비슷하지만 `key를 반드시 지정`
* 가장 상위타입이라면 리터럴에서 `type 생략`가능

```go
package main

import "fmt"

type Vertex struct {
	Lat, Long float64
}

var m = map[string]Vertex{
	"Bell Labs": Vertex{
		40.68433, -74.39967,
	},
	"Google": {
		37.42202, -122.08404,
	},
}

func main() {
	fmt.Println(m)
}
```

### Mutating Maps
* 맵 m의 요소를 삽입하거나 수정하기
   * `m[key] = elem`
* 요소 값 가져오기
   * `elem = m[key]`
* 요소 지우기
   * `delete(m, key)`
* 키의 존재 여부 확인하기
   * `elem, ok = m[key]`
   * elem은 타입에 따라 zero value
   * ok는 m에 key가 존재하면 true, 아니면 false

```go
package main

import "fmt"

func main() {
	m := make(map[string]int)

	m["Answer"] = 42
	fmt.Println("The value:", m["Answer"])  // The value: 42

	m["Answer"] = 48
	fmt.Println("The value:", m["Answer"])  // The value: 48

	delete(m, "Answer")
	fmt.Println("The value:", m["Answer"])  // The value: 0

	v, ok := m["Answer"]
	fmt.Println("The value:", v, "Present?", ok)  // The value: 0 Present? false
}
```

### 연습 : 맵
* WordCount()를 구현
* s라는 문자열 내에서 각각의 '단어'의 등장 횟수를 나타내는 맵 반환

```go
// go tour 41
package main

import (
	"strings"
	"fmt"
	"code.google.com/p/go-tour/wc"
)

func WordCount(s string) map[string]int {
	words := strings.Fields(s)

	m := make(map[string]int)

	for _, word := range words {
		if m[word] != 0 {
			m[word] += 1
		} else {
			m[word] = 1
		}
	}
	return m
}

func main() {
	wc.Test(WordCount)

	// for word, count := range WordCount("d d f g h a fe e t e q") {
	// 	fmt.Println(word, count)
	// }
}
```

## Function values
* 함수도 값이다
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	hypot := func(x, y float64) float64 {
		return math.Sqrt(x*x + y*y)
	}

	fmt.Println(hypot(3, 4))
}
```

### Function closures
* 함수는 `full closures`

```go
package main

import "fmt"

func adder() func(int) int {  // adder()은 closure 반환
	sum := 0  // 각각의 closure는 자신만의 sum 변수를 가진다
	return func(x int) int {
		sum += x
		return sum
	}
}

func main() {
	pos, neg := adder(), adder()
	for i := 0; i < 10; i++ {
		fmt.Println(
			pos(i),
			neg(-2*i),
		)
	}
}
```

### 연습: 피보나치 클로져
```go
// go tour 44
// 0 1 1 2 3 5 8 13 21...
package main

import "fmt"

// fibonacci is a function that returns
// a function that returns an int
func fibonacci() func() int {
	n1 := 0
	n2 := 0

	return func() int {
		n3 := n2 + n1
		n1 = n2
		n2 = n3
		if n2 == 0 {
			n1 += 1
		}
		return n3
	}
}

func main() {
	f := fibonacci()
	for i := 0; i < 10; i++ {
		fmt.Println(f())
	}
}
```

## Switch
* case의 실행을 마치면 알아서 break
* `fallthrough`로 끝나는 case는 제외
```go
package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	fmt.Println("Go runs on")
	switch os := runtime.GOOS; os {
	case "darwin":
		fmt.Println("OS X")
	case "linux":
		fmt.Println("Linux")
		fallthrough
	default:
		fmt.Println("%s.", os)
	}

	today := time.Now().Weekday()
	fmt.Println(today)
}
```

### switch에서 조건을 생략하면 switch true
* 긴 if-then-else를 깔끔하게 작성 가능
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Now()
	switch {
	case t.Hour() < 12:
		fmt.Println("Good morning!")
	case t.Hour() < 17:
		fmt.Println("Good afternoon")
	default:
		fmt.Println("Good evening")
	}
}
```

### 연습: 복소수의 세제곱근
```go
// go tour 48
package main

import "fmt"

func Cbrt(x complex128) complex128 {
	var z complex128 = 1
	for i := 0; i < 1000000; i++ {
		z = z - (z*z*z-x)/(3*z*z)
	}
	return z
}

func main() {
	fmt.Println(Cbrt(2))
}
```

## 메소드
* go에는 클래스가 없다
* struct에 메소드를 구현
* `method receiver`는 func와 method name 사이에 인자로 들어간다
```go
func (method receiver) funcName() returnValue {
	...
}
```
* method receiver를 이용해서 struct와 struct의 데이터를 처리할 method를 `연결`해서 struct에 대한 메소드를 만든다
```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

func (v *Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func main() {
	v := &Vertex{3, 4}
	fmt.Println(v.Abs())
}
```

### 메소드는 struct뿐만 아니라 아무 type에나 붙일 수 있다
* `다른 패키지`에 있는 타입이나 `기본 타입`들에 메소드를 붙이는 것은 `불가능`
```go
package main

import (
	"fmt"
	"math"
)

type MyFloat float64

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

func main() {
	f := MyFloat(-math.Sqrt2)
	fmt.Println(f.Abs())
}
```

## 포인터 리시버를 가지는 메소드
* 메소드는 이름이 있는 type, 이름이 있는 type의 pointer와 연결
* pointer receiver를 사용하는 이유
   1. 메소드가 호출될 때 마다 값이 복사되는 것(큰 구조체인 경우 값이 복사되는 것은 비효율적)을 방지하기 위함
   2. 메소드에서 리시버 포인터가 가르키는 값을 수정하기 위함

```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

// func (v Vertx)로 값을 인자로 두면 값이 복사되므로 변화가 없다.
// v *Vertex -> pointer receiver
func (v *Vertex) Scale(f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func (v *Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func main() {
	v := &Vertex{3, 4}
	v.Scale(5)
	fmt.Println(v, v.Abs())
}
```

## 인터페이스
* 메소드의 집합
* 메소드들의 구현되어 있는 타입의 값은 모두 인터페이스 타입의 값이 될 수 있다
```go
package main

import (
	"fmt"
	"math"
)

type Abser interface {
	Abs() float64
}

func main() {
	var a Abser
	f := MyFloat(-math.Sqrt2)
	v := Vertex{3, 4}

	a = f  // a MyFloat implements Abser
	a = &v // a *Vertex implements Abser
	// a = v  // a Vertex, does Not

	fmt.Println(a.Abs())
}

type MyFloat float64

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

type Vertex struct {
	X, Y float64
}

func (v *Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
```

### 인터페이스 암시적으로 충족됩니다
* type이 인터페이스의 메소드를 구현하면 인터페이스를 구현한게 된다 -> 명시적으로 선언할게 따로 없다
* 암시적 인터페이스는 인터페이스를 정의한 패키지로부터 구현 패키지를 분리 -> 의존성 제거

```go
package main

import (
	"fmt"
	"os"
)

type Reader interface {
	Read(b []byte) (n int, err error)
}

type Writer interface {
	Write(b []byte) (n int, err error)
}

type ReadWriter interface {
	Reader
	Writer
}

func main() {
	var w Writer

	// os.Stdout implements Writer
	w = os.Stdout

	fmt.Fprintf(w, "hello, writer\n")
}
```

## error
* 에러 문장으로 자신을 표현할 수 있는 모든 것은 모두 에러
```go
type error interface {
	Error() string
}
```
* fmt 패키지의 다양한 출력 루틴들은 error의 출력할 때 자동으로 이 메소드를 호출

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

### 연습: 에러
```go
// Sqrt에서 error값을 반환하도록 수정
// Sqrt는 복소수를 지원하지 않기 때문에 음수가 주어지면 nil이 아닌 error 반환
// go tour 56
package main

import (
	"fmt"
)

type ErrNegativeSqrt float64

func (e ErrNegativeSqrt) Error() string {
	return fmt.Sprintf("cannot Sqrt negative number: %v", float64(e))
}

func Sqrt(x float64) (float64, error) {
	if x < 0 {
		return x, ErrNegativeSqrt(x)
	}
	z := float64(1)
	var preZ = x

	for {
		z = z - (z*z-x)/(2*z)
		if preZ-z < 0.00000000000000000000000000001 {
			break
		}
		preZ = z
	}
	return z, nil
}

func main() {
	fmt.Println(Sqrt(2))
	fmt.Println(Sqrt(-2))
}
```

## 웹 서버
* packgae http는 `http.Handler를 구현한 어떤값`을 사용하여 HTTP request를 제공
```go
package http

type Handler interface {
	ServeHTTP(w ResponseWriter, r *Request)
}
```

```go
package main

import (
	"fmt"
	"net/http"
)

type Hello struct{}

func (h Hello) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello!")
}

func main() {
	var h Hello
	http.ListenAndServe("localhost:4000", h)
}
```

### 연습: HTTP 핸들러
```go
// go tour 58
package main

import (
	"fmt"
	"net/http"
)

type String string

type Struct struct {
	Greeting string
	Punct    string
	Who      string
}

func (s String) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, s)
}

func (s *Struct) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, s.Greeting, s.Punct, s.Who)
}

func main() {
	// your http.Handle calls here
	http.Handle("/string", String("I'm a frayed knot."))
	http.Handle("/struct", &Struct{"Hello", ":", "Gophers!"})
	http.ListenAndServe("localhost:4000", nil)
}
```

## 이미지
```go
package image

type Image interface {
	ColorModel() color.Model
	Bounds() Rectangle
	At(x, y int) color.Color
}
```
* color.Model, color.Color는 인터페이스지만 color.RGBA, color.RGBAModel을 사용함으로써 인터페이스를 무시할 수 있다

```go
package main

import (
	"fmt"
	"image"
)

func main() {
	m := image.NewRGBA(image.Rect(0, 0, 100, 100))
	fmt.Println(m.Bounds())
	fmt.Println(m.At(0, 0).RGBA)
}
```

### 연습: 이미지
```go
// go tour 60
package main

import (
	"code.google.com/p/go-tour/pic"
	"image"
	"image/color"
)

type Image struct{}

func (i Image) ColorModel() color.Model {
	return color.RGBAModel
}

func (i Image) Bounds() image.Rectangle {
	return image.Rect(0, 0, 100, 100)
}

func (img Image) At(x, y int) color.Color {
	return color.RGBA{uint8(x * y), uint8(x * y), 255, 255}
}

func main() {
	m := Image{}
	pic.ShowImage(m)
}
```

```go
/*
go tour 61
스트림을 수정하여 다른 io.Reader를 감싸는 io.Reader는 흔한 패턴
예컨대, gzip.NewReader 함수는 io.Reader (gzip으로 압축된 데이터의 스트림) 를 가지고, io.Reader (압축 해제된 데이터의 스트림) 를 구현한 `*gzip.Reader`를 반환합니다.
ROT13 치환 암호화를 모든 알파벳 문자에 적용함으로써 스트림을 수정하며 io.Reader 를 구현하고 io.Reader 로 부터 읽는 rot13Reader 를 구현하십시오.
rot13Reader 타입은 당신을 위해 제공됩니다. 이 타입의 Read 함수를 구현함으로써 io.Reader 을 만들어 보십시오.
*/
package main

import (
	"bytes"
	"io"
	"os"
	"strings"
)

type rot13Reader struct {
	r io.Reader
}

func (reader *rot13Reader) Read(p []byte) (n int, err error) {
	tmp1 := make([]byte, 10)
	n, err = reader.r.Read(tmp1)
	tmp2 := bytes.Map(func(r rune) rune {
		switch {
		case ('a' <= r && r <= 'z'):
			return 'a' + (r-'a'+13)%26
		case ('A' <= r && r <= 'Z'):
			return 'A' + (r-'A'+13)%26
		default:
			return r
		}
	}, tmp1)
	copy(p, tmp2)
	return
}

func main() {
	s := strings.NewReader(
		"Lbh penpxrq gur pbqr!")
	r := rot13Reader{s}
	io.Copy(os.Stdout, &r)
}
```

## 동시성

### Go routines
* go runtime에 의해 관리되는 `경량 스레드`
   * `go f(x, y, z)`  // 새로운 고루틴 시작
   * 현재의 고루틴에서 f,x,y,z가 evaluation되고, 새로운 고루틴에서 f가 execution됩니다.
* 고루틴은 `동일한 주소공간에서 실행`되므로, `공유 자원`으로의 접근은 반드시 `동기화`되어야 한다
* `sync package`가 동기화를 위한 유용한 기본 기능 제공
```go
package main

import (
	"fmt"
	"time"
)

func say(s string) {
	for i := 0; i < 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Println(s)
	}
}

func main() {
	go say("world")
	go say("1")
	say("hello")
}
```

### channels
* `<-`(체널 연산자)를 이용해 값을 주고 받을 수 있는, `타입이 존재하는 파이프`
* 데이터가 화살표 방향에 따라 흐른다
```go
ch <- v  // v를 ch로 보낸다
v := <- ch  // ch로부터 값을 받아서 v로 넘긴다
```
* 맵, 슬라이스처럼 사용되기 전에 생성되어야한다
   * `ch := make(chan int)`
* 기본적으로, 송/수신은 상대편이 `준비될 때까지 블록`
   * 고루틴이 명시적인 락이나 조건없이도 동기화 될 수 있도록 돕는다
```go
package main

import "fmt"

func sum(a []int, c chan int) {
	sum := 0
	for _, v := range a {
		sum += v
	}
	c <- sum // send sum to c
}

func main() {
	a := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(a[:len(a)/2], c) // 반반 나눠서 하는듯
	go sum(a[len(a)/2:], c)
	x, y := <-c, <-c // receivce from c

	fmt.Println(x, y, x+y)
}
```

### 버퍼링되는 채널
* 채널은 버퍼링 될 수 있다
* `make(chan int, buffer size)`
   * ch := make(chan int, 100)
* 버퍼링되는 채널로의 송신은 `버퍼가 꽉찰 때 까지 블록`
* 수신측은 `버퍼가 비어있을 경우 블록`
```go
package main

import "fmt"

func main() {
	c := make(chan int, 3)
	c <- 1
	c <- 2
	fmt.Println(<-c)
	fmt.Println(<-c)
	c <- 3 // 주석처리하면 print되지 않는다
}
```

### Range와 Close
* 데이터 송신측은 더이상 `보낼 값이 없다는 것을 알리기 위해` 체널을 close할 수 있다
* 수신측은 다음과 같이 수신 코드에 2번째 인자를 줌으로써 체널이 닫혔는지 테스트할 수 있다
   * `v, ok := <-ch`
   * 체널이 이미 닫혔고 더이상 받을 값이 없다면 ok는 false가 됩니다
* 송신측만 체널을 닫을 수 있다
   * 수신측에선 불가능
* 이미 닫힌 체널에 데이터를 보내면 패닉 발생
* 체널은 파일과 다르다
   * 항상 닫을 필요 X
* 체널을 닫는 행위는 range 루프를 종료시켜야 할 때처럼 오로지 수신측에게 더이상 보낼 값이 없다고 말해야 할때만 행해지면 된다

```go
package main

import (
	"fmt"
)

func fibonacci(n int, c chan int) {
	x, y := 0, 1
	for i := 0; i < n; i++ {
		c <- x
		x, y = y, x+y
	}
	close(c)
}

func main() {
	c := make(chan int, 10)
	go fibonacci(cap(c), c)
	for i := range c {  // 체널이 닫힐 때까지 계속해서 값을 받는다
		fmt.Println(i)
	}
}
```

### select
* 고루틴이 `다수의 통신 동작으로부터 수행 준비를 기다릴 수 있게` 한다
* case로 받는 통신 동작들 중 하나가 수행될 수 있을 때 까지 수행을 블록
* 다수의 체널이 동시에 준비되면 그 중 `하나를 무작위로 선택`
```go
package main

import "fmt"

func fibonacci(c, quit chan int) {
	x, y := 0, 1
	for {
		select {
		case c <- x:
			x, y = y, x+y
		case <-quit:
			fmt.Println("quit")
			return
		}
	}
}

func main() {
	c := make(chan int)
	quit := make(chan int)
	go func() {
		for i := 0; i < 10; i++ {
			fmt.Println(<-c)
		}
		quit <- 0
	}()
	fibonacci(c, quit)
}
```

### select의 default case
* 현재 수행준비가 완료된 case가 없을 때 수행
* blocking 없이(비동기적인) 송/수신을 하고자 할 때 default case를 사용

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	tick := time.Tick(1e8)
	boom := time.After(5e8)
	for {
		select {
		case <-tick:
			fmt.Println("tick")
		case <-boom:
			fmt.Println("Boom")
			return
		default:  // boom, tick으로 부터의 수신이 없는 상태
			fmt.Println("     .")
			time.Sleep(5e7)
		}
	}
}
```

### 연습: 동등한 이진 트리
```go
// go tour 69. 
https://go-tour-kr.appspot.com/#69
추후 진행..
```
