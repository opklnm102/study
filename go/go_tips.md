# go tips

## 실행

```sh
# 코드 실행 - <file name> 생략시 현재 패키지
$ go run <file name>  # $ go run ex

# 바이너리 빌드
$ go build <file name>  # $ go build ex

# 바이너리 실행
$ ./ex

# 바이너리 제거
$ go clean <file name>  # $ go clean ex
```

### go vet
```sh
$ go vet
```
* 코드상 발생할 수 있는 에러 검사
* 검출할 수 있는 에러 종류
   * Printf 스타일의 함수 호출 시 잘못된 매개변수 지정
   * 메소드 정의시 signature 관련 에러
   * 잘못 구성된 tag
   * composite literal(조합 리터럴) 사용시 누락된 key

### go fmt
* 코드 정리
```go
// before
func main() {
	num := 3

	if num != 1 { fmt.Println("not 1") }
}

// $ go fmt
// after
func main() {
	num := 3

	if num != 1 {
		fmt.Println("not 1")
	}
}
```

### Go 문서화
* 터미널에서 접근하기
```sh
$ go doc tar
```

* 웹사이트로 접근하기
```sh
$ godoc -http=:6060  # localhost:6060으로 접속
```


## 환경 변수
```go
package main

import (
	"fmt"
	"os"
)

func main() {
	// 모든 환경 변수 출력
	for index, env := range os.Environ() {
		fmt.Println(index, env)
	}
}
```

#### 환경변수 R/W
```go
package main

import (
	"fmt"
	"os"
)

func main() {
	// 환경변수 읽기
	usr := os.Getenv("GOPATH")
	fmt.Println(usr)
	// 환경변수 쓰기
	os.Setenv("TestEnv", "ABC")
	fmt.Println(os.Getenv("TestEnv"))
}
```

## Command Line Argument 사용
* `os.Args()`

```go
var Args []string  // slice
```

* example
```go
package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		panic("error: 2개 미만의 argument")
	}

	programName := os.Args[0:1]
	firstArg := os.Args[1:2]
	secondArg := os.Args[2:3]
	allArgs := os.Args[1:]

	fmt.Println(programName, firstArg, secondArg)
	fmt.Println(allArgs)
}
```

#### Command Line Flag 사용
* `flag` 패키지
   * `flag.String(name, default, help text)`
   * `flag.Int()`
   * `flag.Bool()`

```go
package main

import (
	"flag"
	"fmt"
)

func main() {
	file := flag.String("file", "default.txt", "Input file")
	trials := flag.Int("maxtrial", 10, "Max Trial Count")
	isroot := flag.Bool("root", false, "Run as root")

	// option을 parsing하고 pointer var에 저장
	flag.Parse()

	fmt.Println(*file, *trials, *isroot)
}
```

```sh
$ go build

$ ./ex -file=text.txt -maxtrial=3 -root=true
text.txt 3 true

$ ./ex --help
Usage of ./ex:
  -file string
        Input file (default "default.txt")
  -maxtrial int
        Max Trial Count (default 10)
  -root
        Run as root
```

## container

### 이중 연결 리스트
* 리스트 중간에 요소를 `동적으로 추가, 삭제하는 일이 빈번한` 경우 slice보다 유용
* `list.New(`)
   * 리스트를 만들고 포인터를 리턴
* element에 `모든 타입을 혼용`
   * Element.Value가 `interface{}`로 정의되어 있기 때문
   * `strongly typed container`라 할 수 있음

```go
package main

import (
	"container/list"
	"fmt"
)

func main() {
	// 새 이중 연결 리스트 생성
	mylist := list.New()

	// 요소 추가
	mylist.PushBack("A")
	mylist.PushBack(100)
	mylist.PushBack(true)
	mylist.PushFront("A")

	for e := mylist.Front(); e != nil; e = e.Next() {
		fmt.Println(e.Value)
	}
}
```

### Heap
* container/heap
   * heap.Interface를 구현하는 모든 Type에 대해 `MinHeap` 기능을 제공
   * MinHeap은 tree로서 `최소값이 Root`에 위치
   * MinHeap에서 Root로부터 차례로 Pop하게 되면, 가장 작은 값부터 올림차순으로 sort된 값들을 얻게 된다
* heap.Interface를 구현한 새로운 사용자 Type을 만들어야 한다
   * `Len() int` 
      * element의 수
   * `Less(i, j int) bool`
      * 두 element를 비교 e[i] < e[j]
   * `Swap(i, j int)`
      * 두 element를 교체
   * `Push(x interface{})`
      * 새로운 element 추가
   * `Pop() interface{}`
      * 루트로부터 한 element를 읽고 삭제
```go
package main

import (
	"container/heap"
	"fmt"
)

type IntHeap []int

func (h IntHeap) Len() int {
	return len(h)
}

func (h IntHeap) Less(i, j int) bool {
	return h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(element interface{}) {
	*h = append(*h, element.(int))
}

func (h *IntHeap) Pop() interface{} {
	old := *h
	n := len(old)
	element := old[n-1]
	*h = old[0 : n-1]
	return element
}

func main() {
	h := &IntHeap{2, 1, 7}
	heap.Init(h)
	fmt.Println(*h) // 1 2 7

	heap.Push(h, 4)
	heap.Push(h, 10)

	fmt.Println(*h) // 1 2 7 4 10

	// 1 2 4 7 10
	for h.Len() > 0 {
		m := heap.Pop(h)  // pop시 위치가 재정렬
		fmt.Print(m, " ")
	}
}
```

## 프로그램 실행시간 측정
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 시작 시간
	startTime := time.Now()

	// Task 실행
	for i := 0; i < 1000; i++ {
		println("Hello")
	}

	// 경과시간
	elapsedTime := time.Since(startTime)
	// elapsedTime := time.Now().Sub(startTime)

	fmt.Printf("실행시간 %s\n", elapsedTime)
}
```

## 체널을 이용한 비동기 로깅
```go
package main

import (
	"os"
	"strconv"
	"time"
)

// 비동기 로깅
var logChannel chan string

func logSetup(logFile string) {
	// 로그 파일이 없으면, 생성
	if _, err := os.Stat(logFile); os.IsNotExist(err) {
		f, _ := os.Create(logFile)
		f.Close()
	}

	logChannel = make(chan string, 100)

	// 체널을 통한 비동기 로깅
	go func() {
		// 체널이 닫힐 때까지 메시지를 받으면 로깅
		for msg := range logChannel {
			f, _ := os.OpenFile(logFile, os.O_WRONLY|os.O_APPEND, 0666)
			f.WriteString(time.Now().String() + " " + msg + "\n")
			f.Close()
		}
	}()
}

func main() {
	logSetup("./logfile.txt")

	go func() {
		for i := 1; i < 20; i++ {
			n := strconv.Itoa(i)
			logChannel <- n
		}
	}()

	go func() {
		for i := 100; i < 120; i++ {
			logChannel <- strconv.Itoa(i)
		}
	}()

	time.Sleep(1 * time.Second)
	close(logChannel)
}
```


## Timers
* 미래의 한 시점에 `무언가를 하고싶을 때` 사용
* timer는 미래의 한 이벤트를 나타낸다
* 해당 시각에 알림을 주는 `channel`을 반환
* timer가 만료되기 전에 취소 가능

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	timer1 := time.NewTimer(time.Second * 2)

	<-timer1.C
	fmt.Println("Timer 1 expired")

	timer2 := time.NewTimer(time.Second)
	go func() {
		<-timer2.C
		fmt.Println("Timer 2 expired")
	}()
	stop2 := timer2.Stop()
	if stop2 {
		fmt.Println("Timer 2 stopped")
	}
}
```


## Tickers
* 일정한 간격으로 `무언가를 반복하고자 할 때` 사용
* timer와 유사한 메커니즘 사용
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ticker := time.NewTicker(time.Millisecond * 500)
	go func() {
		for t := range ticker.C {
			fmt.Println("Tick at", t)
		}
	}()

	time.Sleep(time.Millisecond * 1600)
	ticker.Stop()
	fmt.Println("Tiker stopped")
}
```


## Go에서 상태를 관리하는 법
* channel을 통한 통신
* atomic counters
* mutex

### channel을 통한 통신
* 가장 기본적인 메커니즘
* ex. 고루틴 + channel을 이용한 `worker pool` 구현
```go
// 총 작업시간은 5초지만, worker가 동시에 실행되고 있기 때문에 전체작업은 2초
package main

import (
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Println("worker", id, "started job", j)
		time.Sleep(time.Second)
		fmt.Println("worker", id, "finished job", j)
		results <- j * 2
	}
}

func main() {
	// worker에 작업을 보내고 결과값을 받을 channel
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results) // 처음에는 job이 없어서 blocking
	}

	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	for a := 1; a <= 5; a++ {
		<-results
	}
}
```

### atomic counters
* 여러개의 고루틴에서 접근되는 atomic counters를 위한 `sync/atomic 패키지` 사용

```go
package main

import (
	"fmt"
	"sync/atomic"
	"time"
)

func main() {
	var ops uint64 = 0 // 항상 양수인 counter

	// 동시 업데이트 시뮬레이션 - 1ms마다 counter를 증가시키는 고루틴 50개
	for i := 0; i < 50; i++ {
		go func() {
			for {
				atomic.AddUint64(&ops, 1) // 원자적으로 증가

				time.Sleep(time.Millisecond)
			}
		}()
	}

	time.Sleep(time.Second) // ops가 누적되도록 기다림

	// counter가 다른 고루틴에 의해 증가되는 도중에 안전하게 사용하기 위해 복사
	opsFinal := atomic.LoadUint64(&ops)
	fmt.Println("ops:", opsFinal)
}
```

### mutex
* `좀 더 복잡한 상태`에 대해서 여러개의 고루틴이 데이터에 안전하게 접근할 수 있는 메커니즘
```go
package main

import (
	"fmt"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	var state = make(map[int]int)

	var mutex = &sync.Mutex{} // state에 대한 접근을 동기화

	// read, write가 얼마나 이루어지는지 tracking
	var readOps uint64 = 0
	var writeOps uint64 = 0

	for r := 0; r < 1000; r++ {
		go func() {
			total := 0
			for {
				key := rand.Intn(5)
				mutex.Lock() // 상호배제 접근 보장을 위한 Lock
				total += state[key]
				mutex.Unlock() // 상호배제 접근 보장을 위한 Unlock
				atomic.AddUint64(&readOps, 1)

				time.Sleep(time.Millisecond)
			}
		}()
	}

	for w := 0; w < 10; w++ {
		go func() {
			for {
				key := rand.Intn(5)
				val := rand.Intn(100)
				mutex.Lock()
				state[key] = val
				mutex.Unlock()
				atomic.AddUint64(&writeOps, 1)
				time.Sleep(time.Millisecond)
			}
		}()
	}

	time.Sleep(time.Second)

	readOpsFinal := atomic.LoadUint64(&readOps)
	fmt.Println("readOps:", readOpsFinal)
	writeOpsFinal := atomic.LoadUint64(&writeOps)
	fmt.Println("writeOps:", writeOpsFinal)

	mutex.Lock()
	fmt.Println("state:", state)
	mutex.Unlock()
}
```

### 동일한 상태 관리 작업을 `고루틴과 channel의 내장 동기화 기능`만을 가지고 구현
* `channel기반 접근법`은 `통신을 통한 메모리 공유`와 `정확히 한 고루틴이 각 데이터의 일부를 소유`한다는 아이디어에 기반
* 상태는 `1개의 고루틴`이 소유
   * 데이터가 동시 접근으로인해 손상되지 않음을 보장
* 상태의 R/W를 위해 소유중인 고루틴으로 메시지를 보내고 응답을 받는다
* mutex 기반보다 조금 더 복잡
* 유용한 경우
   * 다른 channel들이 관련되어 있는 경우
   * error가 발생하기 쉬운 `다중 mutex`들을 관리하는 
```go
package main

import (
	"fmt"
	"math/rand"
	"sync/atomic"
	"time"
)

// 상태를 소유한 고루틴이 응답하기 위한 방법을 캡슐화
type readOp struct {
	key  int
	resp chan int
}

type writeOp struct {
	key  int
	val  int
	resp chan bool
}

func main() {
	var readOps uint64 = 0
	var writeOps uint64 = 0

	reads := make(chan *readOp)
	writes := make(chan *writeOp)

	go func() {
		var state = make(map[int]int)
		for {
			select {
			case read := <-reads:
				read.resp <- state[read.key]
			case write := <-writes:
				state[write.key] = write.val
				write.resp <- true
			}
		}
	}()

	for r := 0; r < 100; r++ {
		go func() {
			for {
				read := &readOp{
					key:  rand.Intn(5),
					resp: make(chan int)}
				reads <- read                 // read request
				<-read.resp                   // read response
				atomic.AddUint64(&readOps, 1) // 연산 횟수 count
				time.Sleep(time.Millisecond)
			}
		}()
	}

	for w := 0; w < 10; w++ {
		go func() {
			for {
				write := &writeOp{
					key:  rand.Intn(5),
					val:  rand.Intn(100),
					resp: make(chan bool)}
				writes <- write // write request
				<-write.resp    // write response
				atomic.AddUint64(&writeOps, 1)
				time.Sleep(time.Millisecond)
			}
		}()
	}

	time.Sleep(time.Second)

	readOpsFinal := atomic.LoadUint64(&readOps)
	fmt.Println("readOps:", readOpsFinal)
	writeOpsFinal := atomic.LoadUint64(&writeOps)
	fmt.Println("writeOps:", writeOpsFinal)
}
```


## Rate limiting
* 리소스 이용을 제어하고 서비스의 품질을 유지하기위한 중요한 메커니즘
* Go는 고루틴, channel, tickers로 지원

```go
// example. request handling을 제한
package main

import (
	"fmt"
	"time"
)

func main() {
	requests := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		requests <- i
	}
	close(requests)

	limiter := time.Tick(time.Millisecond * 200) // rate limiter

	for req := range requests {
		<-limiter // channel 수신으로 blocking, rate limit가 된다
		fmt.Println("request", req, time.Now())
	}
	burstyLimiter := make(chan time.Time, 3)

	// 전반적으로는 rate limit를 유지하면서 bursts of requests하고 싶은 경우
	// limiter channel을 버퍼링
	for i := 0; i < 3; i++ { // 최대 3개의 이벤트를 bursting
		burstyLimiter <- time.Now()
	}

	go func() {
		for t := range time.Tick(time.Millisecond * 200) {
			burstyLimiter <- t
		}
	}()

	burstyRequests := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		burstyRequests <- i
	}
	close(burstyRequests)

	// 처음 3개는 bursting의 이점 가진다
	for req := range burstyRequests {
		<-burstyLimiter
		fmt.Println("request", req, time.Now())
	}
}
```


## 정렬
* sort 패키지는 `내장 타입`, `사용자 정의 타입`을 위한 정렬을 구현하고 있다
```go
package main

import (
	"fmt"
	"sort"
)

func main() {
	strs := []string{"c", "a", "b"}
	sort.Strings(strs)
	fmt.Println("Strings:", strs)

	ints := []int{7, 2, 4}
	sort.Ints(ints)
	fmt.Println("Ints:   ", ints)

	// 정렬 여부 확인
	s := sort.IntsAreSorted(ints)
	fmt.Println("Sorted:  ", s)
}
```

### 함수를 사용한 정렬
* 해당하는 Type 필요
* sort.Interface - Len, Less, Swap를 구현
   * Len, Swap은 일반적으로 Type에 따라 유사
   * Less가 실제 커스텀 `정렬 로직을 갖는다`
```go
package main

import (
	"fmt"
	"sort"
)

type ByLength []string

func (s ByLength) Len() int {
	return len(s)
}
func (s ByLength) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s ByLength) Less(i, j int) bool {
	return len(s[i]) < len(s[j])
}
func main() {
	fruits := []string{"peach", "banana", "kiwi"}
	sort.Sort(ByLength(fruits)) // casting하고 사용
	fmt.Println(fruits)
}
```


## 컬렉션 함수
* Go에서는 제네릭을 지원하지 않는다
* 필요한 경우 컬렉션 함수를 제공하는게 일반적
```go
package main

import "fmt"
import "strings"

// 문자열 t의 1번째 index 반환
func Index(vs []string, t string) int {
	for i, v := range vs {
		if v == t {
			return i
		}
	}
	return -1
}

// 문자열 t가 존재하면 true
func Include(vs []string, t string) bool {
	return Index(vs, t) >= 0
}

// 슬라이스의 문자열중 하나가 조건 f를 만족하면 true
func Any(vs []string, f func(string) bool) bool {
	for _, v := range vs {
		if f(v) {
			return true
		}
	}
	return false
}

// 슬라이스의 문자열 모두가 조건 f를 만족하면 true
func All(vs []string, f func(string) bool) bool {
	for _, v := range vs {
		if !f(v) {
			return false
		}
	}
	return true
}

// 슬라이스에서 조건 f를 만족하는 모든 문자열을 포함하는 새로운 슬라이스 반환
func Filter(vs []string, f func(string) bool) []string {
	vsf := make([]string, 0)
	for _, v := range vs {
		if f(v) {
			vsf = append(vsf, v)
		}
	}
	return vsf
}

// 기존 슬라이스에 있는 각각의 문자열에 함수 f를 적용한 결과값드을 포함하는 새로운 슬라이스 반환
func Map(vs []string, f func(string) string) []string {
	vsm := make([]string, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}

func main() {
	var strs = []string{"peach", "apple", "pear", "plum"}

	fmt.Println(Index(strs, "pear"))
	fmt.Println(Include(strs, "grape"))

	fmt.Println(Any(strs, func(v string) bool {
		return strings.HasPrefix(v, "p")
	}))

	fmt.Println(All(strs, func(v string) bool {
		return strings.HasPrefix(v, "p")
	}))

	fmt.Println(Filter(strs, func(v string) bool {
		return strings.Contains(v, "e")
	}))

	fmt.Println(Map(strs, strings.ToUpper))
}
```


## 문자열 함수
```go
package main

import (
	"fmt"
	s "strings"
)

var p = fmt.Println

func main() {
	p("Contains: ", s.Contains("test", "es"))
	p("Count: ", s.Count("test", "t"))
	p("HasPrefix: ", s.HasPrefix("test", "te"))
	p("HashSuffix: ", s.HasSuffix("test", "st"))
	p("Index: ", s.Index("test", "e"))
	p("Join: ", s.Join([]string{"a", "b", "c"}, "-"))
	p("Repeat: ", s.Repeat("a", 5))
	p("Replace: ", s.Replace("foo", "o", "0", -1))
	p("Replace: ", s.Replace("foo", "o", "0", 1))
	p("Split: ", s.Split("a-b-c-d-e", "-"))
	p("ToLower: ", s.ToLower("TEST"))
	p("ToUpper: ", s.ToUpper("test"))
	p()

	p("Len: ", len("hello"))
	p("Char: ", "hello"[1])
}
```

```sh
Contains:  true
Count:  2
HasPrefix:  true
HashSuffix:  true
Index:  1
Join:  a-b-c
Repeat:  aaaaa
Replace:  f00
Replace:  f0o
Split:  [a b c d e]
ToLower:  test
ToUpper:  TEST

Len:  5
Char:  101
```


## 문자열 포맷팅
```go
package main

import (
	"fmt"
	"os"
)

type point struct {
	x, y int
}

func main() {
	p := point{1, 2}
	// 구조체 출력
	fmt.Printf("%v\n", p) // {1 2}

	// 구조체의 필드명까지
	fmt.Printf("%+v\n", p) // {x:1 y:2}

	// 해당 값을 생성하는 코드 스니펫
	fmt.Printf("%#v\n", p) // main.point{x:1, y:2}

	// type 출력
	fmt.Printf("%T\n", p) // main.point

	// boolean
	fmt.Printf("%t\n", true) // true

	// 10진수
	fmt.Printf("%d\n", 123) // 123

	// binary
	fmt.Printf("%b\n", 14) // 1110

	// character
	fmt.Printf("%c\n", 33) // !

	// 16진수
	fmt.Printf("%x\n", 456) // 1c8

	// 10진수 실수
	fmt.Printf("%f\n", 78.9) // 78.900000

	fmt.Printf("%e\n", 123400000.0) // 1.234000e+08
	fmt.Printf("%E\n", 123400000.0) // 	1.234000E+08

	fmt.Printf("%s\n", "\"stirng\"") // "stirng"

	// 쌍따음표로 묶을 때
	fmt.Printf("%q\n", "\"stirng\"") // "\"stirng\""
	fmt.Printf("%x\n", "hex this")   // 6865782074686973

	// 포인터의 표현
	fmt.Printf("%p\n", &p) // 0xc42000e260

	fmt.Printf("|%6d|%6d|\n", 12, 345) // |    12|   345|

	fmt.Printf("|%6.2f|%6.2f|\n", 1.2, 3.45)   // |  1.20|  3.45|
	fmt.Printf("|%-6.2f|%-6.2f|\n", 1.2, 3.45) // |1.20  |3.45  |
	fmt.Printf("|%6s|%6s|\n", "foo", "b")      // |   foo|     b|
	fmt.Printf("|%-6s|%-6s|\n", "foo", "b")    // |foo   |b     |

	s := fmt.Sprintf("a %s", "string")
	fmt.Println(s) // a string

	fmt.Fprintf(os.Stderr, "an %s\n", "error") // an error
}
```


## 정규 표현식
```go
package main

import (
	"bytes"
	"fmt"
	"regexp"
)

func main() {
	// 패턴이 문자열과 일치하는지?
	match, _ := regexp.MatchString("p([a-z]+)ch", "peach")
	fmt.Println(match) // true

	// compile된 regexp 구조체를 사용하는게 좋다
	r, _ := regexp.Compile("p([a-z]+)ch")

	fmt.Println(r.MatchString("peach")) // true

	// 정규식과 일치하는 문자열 찾기
	fmt.Println(r.FindString("peach punch")) // peach

	// 1번째로 매칭되는 문자열의 1번째, 마지막 inedx return
	fmt.Println(r.FindStringIndex("peach punh")) // [0 5]

	// 전체 패턴, 부분 일치 정보 모두 포함 ex. p([a-z]+)ch, ([a-z]+)의 정보
	fmt.Println(r.FindStringSubmatch("peach punch")) // [peach ea]

	// index return
	fmt.Println(r.FindStringSubmatchIndex("peach punch")) // [0 5 1 3]

	// 모든 일치 항목 찾기
	fmt.Println(r.FindAllString("peach punch pinch", -1)) // [peach punch pinch]

	fmt.Println(r.FindAllStringSubmatchIndex("peach punch pinch", -1)) // [[0 5 1 3] [6 11 7 9] [12 17 13 15]]

	// 일치 항목의 갯수 제한
	fmt.Println(r.FindAllString("peach punch pinch", 2)) // [peach punch]

	// byte도 사용 가능
	fmt.Println(r.Match([]byte("peach"))) // true

	// 정규식으로 상수를 만들 때
	r = regexp.MustCompile("p([a-z]+)ch")
	fmt.Println(r) // p([a-z]+)ch

	fmt.Println(r.ReplaceAllString("a peach", "<fruit>")) //a <fruit>

	// 일치된 항목을 변형
	in := []byte("a peach")
	out := r.ReplaceAllFunc(in, bytes.ToUpper)
	fmt.Println(string(out)) // a PEACH
}
```


## 시간
* times, durations에 대한 광범위한 지원 제공
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	p := fmt.Println

	now := time.Now()
	p(now) // 2017-06-24 14:20:53.252012036 +0900 KST

	then := time.Date(
		2009, 11, 17, 20, 34, 58, 651387237, time.UTC)
	p(then) // 2009-11-17 20:34:58.651387237 +0000 UTC

	p(then.Year())       // 2009
	p(then.Month())      // November
	p(then.Day())        // 17
	p(then.Hour())       // 20
	p(then.Minute())     // 34
	p(then.Second())     // 58
	p(then.Nanosecond()) // 651387237
	p(then.Location())   // UTC

	p(then.Weekday()) // Tuesday

	// 1번째값이 2번째 값보다 어떤지 검사
	p(then.Before(now)) // true
	p(then.After(now))  // false
	p(then.Equal(now))  // false

	// duration
	diff := now.Sub(then)
	p(diff) // 66608h49m31.34521462s

	// 다양한 단위로 계산
	p(diff.Hours())       // 66608.82537367073
	p(diff.Minutes())     // 3.996529522420244e+06
	p(diff.Seconds())     // 2.397917713452146e+08
	p(diff.Nanoseconds()) // 239791771345214620

	// 미래로
	p(then.Add(diff)) // 2017-06-24 05:24:29.996601857 +0000 UTC

	// 과거로
	p(then.Add(-diff)) // 2002-04-13 11:45:27.306172617 +0000 UTC
}
```

### 타임 스탬프
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	secs := now.Unix()        // timestamp sec
	nanos := now.UnixNano()   // timestamp ns
	millis := nanos / 1000000 // timestamp ms는 없기 때문에 계산

	fmt.Println(now)    // 2017-06-24 14:35:15.246434365 +0900 KST
	fmt.Println(secs)   // 1498282515
	fmt.Println(millis) // 1498282515246
	fmt.Println(nanos)  // 1498282515246434365

	// timestamp time으로 변환
	fmt.Println(time.Unix(secs, 0))  // 2017-06-24 14:35:15 +0900 KST
	fmt.Println(time.Unix(0, nanos)) // 2017-06-24 14:35:15.246434365 +0900 KST
}
```

### 시간 포맷팅 / 파싱
* 패턴 기반의 `레이아웃`을 통해 지원
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	p := fmt.Println

	t := time.Now()
	p(t.Format(time.RFC3339)) // 2017-06-24T14:59:39+09:00

	t1, _ := time.Parse(time.RFC3339, "2012-11-01T22:08:41+00:00")
	p(t1) // 2012-11-01 22:08:41 +0000 +0000

	p(t.Format("3:04PM"))                           // 2:59PM
	p(t.Format("Mon Jan _2 15:04:05 2006"))         // Sat Jun 24 14:59:39 2017
	p(t.Format("2006-01-02T15:04:05.999999-07:00")) // 2017-06-24T14:59:39.534068+09:00
	form := "3 04 PM"
	t2, _ := time.Parse(form, "8 41 PM")
	p(t2) // 0000-01-01 20:41:00 +0000 UTC

	fmt.Printf("%d-%02d-%02dT%02d:%02d-00:00\n",
		t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second()) // 2017-06-24T14:59-00:00

	// 잘못된 형식의 input이면 error return
	ansic := "Mon Jan _2 15:04:05 2006"
	_, e := time.Parse(ansic, "8:41PM")
	p(e) // %!(EXTRA int=39)parsing time "8:41PM" as "Mon Jan _2 15:04:05 2006": cannot parse "8:41PM" as "Mon"
}
```


## 난수
* `math/rand` 패키지 사용
```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	// 0 <= n < 100 사이의 난수
	fmt.Print(rand.Intn(100), ",")
	fmt.Print(rand.Intn(100))
	fmt.Println() // 81, 87

	// 0.0 <= f < 1.0 사이의 난수
	fmt.Println(rand.Float64()) // 0.6645600532184904

	// 5.0 <= f < 10.0 사이의 난수
	fmt.Print((rand.Float64()*5)+5, ",")
	fmt.Print((rand.Float64() * 5) + 5)
	fmt.Println() // 7.1885709359349015,7.123187485356329

	// 변화하는 seed 필요
	// 안전하려면 srypto/rand 사용
	s1 := rand.NewSource(time.Now().UnixNano())
	r1 := rand.New(s1)

	fmt.Print(r1.Intn(100), ",")
	fmt.Print(r1.Intn(100))
	fmt.Println() // 30,82

	s2 := rand.NewSource(42)
	r2 := rand.New(s2)
	fmt.Print(r2.Intn(100), ",")
	fmt.Print(r2.Intn(100))
	fmt.Println() // 5,87
	s3 := rand.NewSource(42)
	r3 := rand.New(s3)
	fmt.Print(r3.Intn(100), ",")
	fmt.Print(r3.Intn(100))
	fmt.Println() // 5, 87
}
```

## 숫자 파싱
* strconv 패키지 사용
```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	f, _ := strconv.ParseFloat("1.234", 64) // 64는 어느 bit까지의 정밀도를 의미
	fmt.Println(f)                          // 1.234

	i, _ := strconv.ParseInt("123", 0, 64) // 0은 문자열을 파싱함을 의미
	fmt.Println(i)                         // 123

	d, _ := strconv.ParseInt("0x1c8", 0, 64) // 16진수
	fmt.Println(d)                           // 456

	u, _ := strconv.ParseUint("789", 0, 64)
	fmt.Println(u) // 789

	// 10진수 int parsing
	k, _ := strconv.Atoi("135")
	fmt.Println(k) // 135

	_, e := strconv.Atoi("wat")
	fmt.Println(e) // strconv.Atoi: parsing "wat": invalid syntax
}
```

## URL 파싱
```go
package main

import (
	"fmt"
	"net"
	"net/url"
)

func main() {
	s := "postgres://user:pass@host.com:5432/path?k=v#f"

	u, err := url.Parse(s)
	if err != nil {
		panic(err)
	}

	fmt.Println(u.Scheme) // postgres

	fmt.Println(u.User)            // user:pass
	fmt.Println(u.User.Username()) // user
	p, _ := u.User.Password()
	fmt.Println(p) // pass

	fmt.Println(u.Host) // host.com:5432
	host, port, _ := net.SplitHostPort(u.Host)
	fmt.Println(host) // host.com
	fmt.Println(port) // 5432

	fmt.Println(u.Path)     // /path
	fmt.Println(u.Fragment) // f

	fmt.Println(u.RawQuery) // k=v
	m, _ := url.ParseQuery(u.RawQuery)
	fmt.Println(m)         // map[k:[v]]
	fmt.Println(m["k"][0]) // v
}
```


## SHA-1 Hash
* binary나 TLOB에 대해 짧은 식별자를 계산하기 위해 자주 사용
* ex
   * git revision control system에서 버저닝된 파일과 디렉토리를 식별하기 위해 사용
* `crypto/*` 패키지에서 여러가지 해시 함수를 구현
* 해시 생성 패턴
   1. sha1.New()
   2. sha1.Write(bytes)
   3. sha1.Sum([]byte{})
```go
package main

import (
	"crypto/sha1"
	"fmt"
)

func main() {
	s := "sha1 this string"

	h := sha1.New()

	h.Write([]byte(s))

	bs := h.Sum(nil) // 기존 byte slice에 덧붙이기 위해 사용, 보통은 필요X

	fmt.Println(s)
	fmt.Printf("%x\n", bs) // 16진수로 출력
}
```


## Base64 인코딩
```go
package main

import (
	b64 "encoding/base64"
	"fmt"
)

func main() {
	data := "abc123!?$*&()'-=@~"

	// 표준 base64
	sEnc := b64.StdEncoding.EncodeToString([]byte(data))
	fmt.Println(sEnc) // YWJjMTIzIT8kKiYoKSctPUB+

	sDec, _ := b64.StdEncoding.DecodeString(sEnc)
	fmt.Println(string(sDec)) // abc123!?$*&()'-=@~
	fmt.Println()

	// URL 호환 base64로 인코딩, 디코딩
	uEnc := b64.URLEncoding.EncodeToString([]byte(data))
	fmt.Println(uEnc) // YWJjMTIzIT8kKiYoKSctPUB-. 후미가 다름
	uDec, _ := b64.URLEncoding.DecodeString(uEnc)
	fmt.Println(string(uDec)) // abc123!?$*&()'-=@~
}
```


## Line Filter
* stdin으로 입력을 읽고, 처리한 후, 결과를 stdout으로 출력하는 프로그램
* ex. grep, sed
```go
// 입력받은 소문자를 대문자로 출력
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {

	scanner := bufio.NewScanner(os.Stdin)

	for scanner.Scan() {
		ucl := strings.ToUpper(scanner.Text())
		fmt.Println(ucl)
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
```

## 프로세스

### 프로세스 생성
* `exec.Command()` - 외부 프로세스 표현
* `exec.Output()` - 커맨드 실행, 종료 대기, output을 가져온다
```go
package main

import (
	"fmt"
	"io/ioutil"
	"os/exec"
)

func main() {
	dateCmd := exec.Command("date")

	dateOut, err := dateCmd.Output()
	if err != nil {
		panic(err)
	}
	fmt.Println("> date")
	fmt.Println(string(dateOut))

	// stdin으로 pipe하여 stdout에서 output을 가져오는 복잡한 케이스
	grepCmd := exec.Command("grep", "hello")

	grepIn, _ := grepCmd.StdinPipe()   // stdin pipe
	grepOut, _ := grepCmd.StdoutPipe() // stdout pipe
	grepCmd.Start()
	grepIn.Write([]byte("hello grep\ngoodbye grep"))
	grepIn.Close()
	grepBytes, _ := ioutil.ReadAll(grepOut)
	grepCmd.Wait()

	fmt.Println("> grep hello")
	fmt.Println(string(grepBytes))

	// bash -c. 전체 커맨드를 담은 문자열을 하나로 프로세스 생성
	lsCmd := exec.Command("bash", "-c", "ls -a -l -h")
	lsOut, err := lsCmd.Output()
	if err != nil {
		panic(err)
	}
	fmt.Println("> ls -a -l -h")
	fmt.Println(string(lsOut))
}
```

### 프로세스 실행
* 프로세스 전체를 다른 프로세스로 대체하고 싶을 때
* `os/exec` 사용
* Unix의 fork를 제공하지 않는다
* 고루틴을 이용하여 프로세스를 생성하거나 exec하여 fork의 대부분의 use case를 다룰 수 있다
```go
package main

import (
	"os"
	"os/exec"
	"syscall"
)

func main() {
	// 절대 경로 찾기
	binary, lookErr := exec.LookPath("ls")
	if lookErr != nil {
		panic(lookErr)
	}

	args := []string{"ls", "-a", "-l", "-h"}

	env := os.Environ()

	// 프로세스가 대체된다
	execErr := syscall.Exec(binary, args, env)
	if execErr != nil {
		panic(execErr)
	}
}
```

### Unix signal 처리
* signal 알림은 os.Signal값을 channel에 보내는 방식으로 동작
```go
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	// 지정한 signal을 받을 수 있는 channel을 받고 등록
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// signal을 받기 위한 blocking gorutine
	go func() {
		sig := <-sigs
		fmt.Println()
		fmt.Println(sig)
		done <- true
	}()

	fmt.Println("awaiting signal")
	<-done
	fmt.Println("exiting")
}
```

```sh
go run signal.go
awaiting signal
^C
interrupt
exiting
```

### 종료
* `os.Exit`를 이용하여 프로그램을 지정된 status로 즉시 종료
* 0이 아닌 다른 status로 종료하고 싶다면 사용
```go
package main

import (
	"fmt"
	"os"
)

func main() {
	// defer는 os.Exit()를 이용할 때에는 작동하지 않는다
	defer fmt.Println("!")

	os.Exit(3)
}
```

