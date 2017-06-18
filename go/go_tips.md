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
