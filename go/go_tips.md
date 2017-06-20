# go tips

## 실행

```sh
# 코드 실행
$ go run ex

# 바이너리 빌드
$ go build ex

# 바이너리 실행
$ ./ex
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
