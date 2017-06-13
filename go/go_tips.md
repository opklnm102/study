# go tips

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

