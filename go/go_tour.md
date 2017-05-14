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


