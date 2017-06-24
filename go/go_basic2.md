# Go 기초2

## 파일 읽고 쓰기
* `os 패키지` 사용
* `os.Open(path)` - 파일 열기
* `os.Create(path)` - 파일 생성
* `file.Read(buf)` - 파일 읽기
* `file.Write(buf)` - 파일 쓰기
```go
package main

import (
	"io"
	"os"
)

func main() {
	// 입력파일 열기
	fi, err := os.Open("1.txt")
	if err != nil {
		panic(err)
	}
	defer fi.Close()  // 관행

	// 출력파일 생성
	fo, err := os.Create("2.txt")
	if err != nil {
		panic(err)
	}
	defer fo.Close()

	buff := make([]byte, 1024)

	// 루프
	for {
		// 읽기
		cnt, err := fi.Read(buff)
		if err != nil && err != io.EOF {
			panic(err)
		}

		// 끝이면 루프 종료
		if cnt == 0 {
			break
		}

		// 쓰기
		_, err = fo.Write(buff[:cnt])
		if err != nil {
			panic(err)
		}
	}
	fo.sync()  // 안정적인 스토리지에 쓰기를 플러시
}
```

### ioutil
* I/O 관련한 편리한 유틸리티를 제공하는 패키지
* 입력 파일이 매우 크지 않은 경우, `ReadFile()`, `WriteFile()`를 사용
```go
package main

import "io/ioutil"

func main() {
	// 파일 읽기
	bytes, err := ioutil.ReadFile("1.txt")
	if err != nil {
		panic(err)
	}

	// 파일 쓰기
	err = ioutil.WriteFile("2.txt", bytes, 0)
	if err != nil {
		panic(err)
	}
}
```

### bufio
* 많은 작은 읽기의 효율성과 패키지가 제공하는 추가적인 읽기 메소드 덕분에 유용할 수 있는 `버퍼링된 리더`를 구현
```go

package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
	f, err := os.Open("/tmp/dat")
	check(err)
	defer f.Close()

	// Read
	r := bufio.NewReader(f)
	b, err := r.Peek(5)
	check(err)
	fmt.Printf("5 bytes: %s\n", string(b))

	fo, err := os.Oepn("/w_file")
	check(err)
	defer fo.Close()

	// Write
	w := bufio.NewWriter(fo)  // 버퍼링된 writer
	n, err := w.WriteString("buffered\n")
	check(err)
	fmt.Printf("wrote %d bytes\n", n)
	w.Flush()  // 모든 버퍼링된 작업이 라이터에 적용되었는지 확인
}
```


## http.Get()
* `http 패키지`는 웹 관련 클라이언트, 서버 기능 제공
* 웹 페이지나 데이터를 가져오는데 사용
```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// GET 호출
	resp, err := http.Get("http://csharp.news")
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	// 결과 출력
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%s\n", string(data))
}
```

### Request시 헤더 추가
* `http.Get()`은 Request 스트림을 추가하는 것과 같은 세밀한 컨트롤을 할 수 없는 단점이 있다
* `Request객체를 직접 생성`해서 http.Client객체를 통해 호출

```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// Request 객체 생성
	req, err := http.NewRequest("GET", "http://csharp.news", nil)
	if err != nil {
		panic(err)
	}

	// 필요시 헤더 추가 기능
	req.Header.Add("User-Agent", "Crawler")

	// Client객체에서 Request 실행
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// 결과 출력
	bytes, _ := ioutil.ReadAll(resp.Body)
	str := string(bytes) // 바이트를 문자열로
	fmt.Println(str)
}
```

## http.Post()
* `http.Post(URL, MIME, io.Reader)`

```go
package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	reqBody := bytes.NewBufferString("Post plain text")
	resp, err := http.Post("http://httpbin.org/post", "text/plain", reqBody)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	// Response 체크
	respBody, err := ioutil.ReadAll(resp.Body)
	if err == nil {
		str := string(respBody)
		fmt.Println(str)
	}
}
```

## http.PostForm()
* `Form 데이터`를 보내는데 유용한 메소드
```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
)

func main() {
	resp, err := http.PostForm("http://httpbin.org/post", url.Values{"Name": {"Lee"}, "Age": {"10"}})
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	// Response 체크
	respBody, err := ioutil.ReadAll(resp.Body)
	if err == nil {
		str := string(respBody)
		fmt.Println(str)
	}
}
```

## Json 데이터 Post
* `encoding/json`로 마샬링
* MIME 타입을 `application/json`
```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type Person struct {
	Name string
	Age  int
}

func main() {
	person := Person{"Alex", 10}
	pbytes, _ := json.Marshal(person) // json marshal

	buff := bytes.NewBuffer(pbytes)
	resp, err := http.Post("http://httpbin.org/post", "application/json", buff)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err == nil {
		str := string(respBody)
		fmt.Println(str)
	}

	var dat = Person{}
	json.Unmarshal(pbytes, &dat) // json unMarshal
	fmt.Println(dat)
}
```

## XMl 데이터 Post
* `encoding/xml`로 마샬링
* MIME 타입을 `application/xml`
```go
package main

import (
	"encoding/xml"
)

type Person struct {
	Name string
	Age  int
}

func main() {
	person := Person{"Alex", 10}
	pbytes, _ := xml.Marshal(person) // xml marshal
	buff := bytes.NewBuffer(pbytes)
	resp, err := http.Post("http://httpbin.org/post", "application/xml", buff)
	// ...
}
```

## Json 인코딩
* encoding/json 패키지의 `Marshal(struct or map)` 이용
* `struct, map type`을 인코딩

## json 디코딩
* encoding/json 패키지의 `Unmarshal(json data, struct or map)` 이용

```go
package main

import (
	"encoding/json"
	"fmt"
)

type Member struct {
	Name   string
	Age    int
	Active bool
}

func main() {
	mem := Member{"Alex", 10, true}

	// json 인코딩
	jsonBytes, err := json.Marshal(mem)
	if err != nil {
		panic(err)
	}

	// json 바이트를 문자열로 변경
	jsonString := string(jsonBytes)

	fmt.Println(jsonString)

	// json 디코딩
	var mem2 Member
	err2 := json.Unmarshal(jsonBytes, &mem2) // 매칭되는 필드가 없다면 무시
	if err != nil {
		panic(err2)
	}

	fmt.Println(mem.Name, mem.Age, mem.Active)
}
```

### json key name custom
* 구조체 선언부에 `태그`를 사용
```go
package main

import (
	"encoding/json"
	"fmt"
)

// 태그를 사용하여 json field명을 custom
type Response struct {
	Page   int      `json:"page"`
	Fruits []string `json:"fruits"`
}

func main() {
	resD := &Response{
		Page:   1,
		Fruits: []string{"apple", "peach", "pear"}}
	resB, _ := json.Marshal(resD)
	fmt.Println(string(resB))
}
```


## SQL DB 활용
* `database/sql` 패키지 사용
* RDB들에게 공통적으로 사용되는 인터페이스 제공
   * DB 연결
   * 쿼리 실행
   * DML 명령 수행
   * ...
> [SQLDrivers](https://github.com/golang/go/wiki/SQLDrivers)

* `sql.DB`
   * 가장 중요한 Type
   * `sql.Open(driver, Connection)`로 sql.DB 객체를 얻는다

```go
package main

import "database/sql"

func main() {

	// sql.DB 객체 db 생성
	db, err := sql.Open("mysql", "root:pwd@tcp(127.0.0.1:3306)/testdb")

	// db 닫기
	defer db.Close()

	// select
	rows, err := db.Query("SELECT id, name FROM test")

	// insert
	db.Exec("INSERT INTO test(id, name) VALUES (1, 'Alex')")
}
```

### MySQL
* 드라이버 설치
```sh
$ go get github.com/go-sql-driver/mysql
```

* 하나의 row를 리턴할 경우 `QueryRow()`
* 복수개의 row를 리턴할 경우 `Query()`
* 실제 데이터를 변수에 할당하기 위해서 `Scan()` 사용
* 다음 row로 이동하기 위해 `Next()` 사용
```go
package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"  // '_' -> 직접 사용 제한
	"log"
)

func main() {
	// sql.DB 객체 생성
	// 실제 DB connection은 query 등과 같이 실제로 연결이 필요한 시점에 이루어진다
	db, err := sql.Open("mysql", "ethan:1234@tcp(127.0.0.1:3307)/TEST")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close() // 반드시 닫는다(지연하여 닫기)

	// 하나의 Row를 갖는 SQL 쿼리
	var name string
	err = db.QueryRow("SELECT name FROM parent WHERE id = 1").Scan(&name)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(name)

	// 복수 Row를 갖는 SQL 쿼리
	var id int
	var age string
	rows, err := db.Query("SELECT id, age FROM parent WHERE id >= ?", 1)
	if err != nil {
		log.Fatal(err)
	}

	for rows.Next() {
		err := rows.Scan(&id, &age)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(id, age)
	}
}
```

### Prepared Statement 사용
* `placeholder`를 가진 sql을 미리 준비시키는 것
* statement를 호출할 때 준비된 sql문을 빠르게 실행하도록 하는 기법
* `sql.DB.Prepare()`로 placeholder를 가진 sql을 미리 준비
* `sql.Stmt 객체의 Exec(), Query(), QueryRow()`를 사용하여 준비된 sql을 실행
   * `Exec()` - DML과 같이 리턴되는 데이터가 없는 경우
   * `Query()`, `QueryRow()` - 리턴되는 데이터가 있는 경우

```go
package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	db, err := sql.Open("mysql", "ethan:1234@tcp(127.0.0.1:3307)/TEST")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Prepared statement 생성
	stmt, err := db.Prepare("UPDATE parent SET name=? WHERE id=?")
	checkError(err)
	defer stmt.Close()

	// Prepared Statement 실행
	_, err = stmt.Exec("Tom", 1) // placeholder 파라미터 순서대로 전달
	checkError(err)
	_, err = stmt.Exec("Jack", 2)
	checkError(err)
	_, err = stmt.Exec("Shawn", 3)
	checkError(err)

	result, err := stmt.Exec("Ethan", 4)
	checkError(err)

	n, err := result.RowsAffected() // 갱신된 레코드 수
	if n == 1 {
		fmt.Println("1 row inserted")
	}

	id, err := result.LastInsertId() // 추가된 id
	if id != 0 {
		fmt.Println(id)
	}
}
```

### MySQL 트랜잭션
* 복수개의 sql문을 하나의 트랜잭션으로 묶기 위하여 `sql.DB의 Begin()` 사용
   * `sql.Tx` 객체를 리턴
* 트랜잭션은 복수 개의 sql문을 실행하다 중간에 에러가 발생하면 `rollback`, 모두 성공해야 `commit`
   * commit을 위해 `Tx.Commit()`
   * rollback을 위해 `Tx.Rollback()`
```go
package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

func main() {
	db, err := sql.Open("mysql", "ethan:1234@tcp(127.0.0.1:3307)/TEST")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 트랜잭션 시작
	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer tx.Rollback() // 중간에 에러시 rollback

	// insert
	_, err = db.Exec("INSERT INTO parent(name, age) VALUES (?, ?)", "Jack", 32)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec("INSERT INTO parent(name, age) VALUES (?, ?)", "Data", 23)
	if err != nil {
		log.Fatal(err)
	}

	// 트랜잭션 commit
	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
	}
}
```

## 간단한 HTTP 서버
* `net/http` 패키지
* 웹 관련 서버, 클라이언트 기능 제공
* http 서버를 만들기 위해 중요한 메소드
   * `ListenAndServe(port, ServeMux)`
      * 지정된 포트에 웹서버를 열고 클라이언트 Request를 받아 새 고루틴에 작업을 할당
      * ServeMux - nil일 경우 DefaultServeMux 사용.
   * `Handle(), HandleFunc()` - 요청된 Request Path에 어떤 Request 핸들러를 사용할지 지정하는 라우팅 역할
```go
package main

import (
	"net/http"
)

func main() {
	http.HandleFunc("/hello", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("Hello World"))
	})

	http.ListenAndServe(":5000", nil)
}
```

### http.Handle(url pattren, http.Handler interface)

```go
type Handler interface {
	ServeHTTP(ResponseWriter, *Request)
}
```

* example
```go
package main

import (
	"net/http"
)

type testHandler struct {
	http.Handler
}

func (h *testHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	str := "Your Request Path is " + req.URL.Path
	w.Write([]byte(str))
}

func main() {
	http.Handle("/", new(testHandler))

	http.ListenAndServe(":5000", nil)
}
```

### 간단한 static 파일 핸들러
* HTML, Image 등 static 파일 요청을 핸들
```go
package main

import (
	"io/ioutil"
	"net/http"
	"path"
	"path/filepath"
	"runtime"
)

type staticHandler struct {
	http.Handler
}

func (h *staticHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	localPath := path.Dir(filename) + "/static" + req.URL.Path
	content, err := ioutil.ReadFile(localPath)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(http.StatusText(404)))
		return
	}

	contentType := getContentType(localPath)
	w.Header().Add("Content-Type", contentType)
	w.Write(content)
}

func getContentType(localPath string) string {
	var contentType string
	ext := filepath.Ext(localPath)

	switch ext {
	case ".html":
		contentType = "text/html"
	case ".css":
		contentType = "text/css"
	case ".js":
		contentType = "application/javascript"
	case ".png":
		contentType = "image/png"
	case ".jpg":
		contentType = "image/jpeg"
	default:
		contentType = "text/plain"
	}
	return contentType
}

func main() {
	http.Handle("/", new(staticHandler))

	http.ListenAndServe(":5000", nil)
}
```

### http.FileServer를 사용한 간단한 핸들러
* 정적인 파일들을 웹서버에서 클라이언트로 그대로 전달
* `http.FileServer()`는 해당 디렉토리 내의 모든 정적 리소스를 1:1로 매핑하여 전달
   * ServeHTTP() 핸들러처럼 세밀한 제어 불가

```go
package main

import (
	"net/http"
	"path"
	"runtime"
)

func main() {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	http.Handle("/", http.FileServer(http.Dir(path.Dir(filename)+"/static")))
	// http.Handle("/static", http.FileServer(http.Dir("static")))
	http.ListenAndServe(":5000", nil)
}
```

## Go Web Framework
* Request와 Handler를 매핑하는 `routing` 기능
* request 파라미터들을 Handler의 파라미터에 연결하는 `data binding` 기능
* request 상태를 유지하는 `context` 기능
* Handler에서 자주 쓰이는 공통된 기능을 제공하는 `middleware` 기능 등을 갖추고 있다

### [Revel - A high-productivity web framework for the Go language](https://revel.github.io/)

## install
```sh
# GOPATH에 설치
$ go get github.com/revel/revel

# revel 실행파일 설치
$ go get gibhub.com/revel/cmd/revel

# myapp이라는 프로젝트 생성 - GOPATH 아래에만 생성 가능
$ revel new myapp

# 파일 구조
$ tree myapp
myapp/
├── README.md
├── app
│   ├── controllers  // App controllers
│   ├── init.go      // Interceptor registration
│   ├── routes  	 // Reverse routes(generated code)
│   ├── tmp
│   │   └── main.go
│   └── views  		 // Templates
├── conf
│   ├── app.conf  	 // Main config files
│   └── routes  	 // Routes definition
├── messages 		 // message file
├── public  		 // static files
│   ├── css
│   ├── fonts
│   ├── img
│   └── js
└── tests  			 // Test suites

# myapp 실행
$ revel run myapp
```

> #### 더보면 좋을 자료
> * https://github.com/diyan/go-web-framework-comparsion
> * http://kasw.blogspot.kr/2014/10/pythongolang-web-framework.html
> * https://wikinote.bluemir.me/golang/choose-web-framework
> * https://thenewstack.io/a-survey-of-5-go-web-frameworks/


## SMTP 이메일 보내기
```go
package main

import (
	"net/smtp"
)

func main() {
	// 메일서버 로그인 정보 설정
	auth := smtp.PlainAuth("", "sender@live.com", "pwd", "smtp.live.com")

	from := "sender@live.com"
	to := []string{"receover@live.com"} // 복수 수신자 가능

	// 메시지 작성
	headerSubject := "Subject: 테스트\r\n"
	headerBlank := "\r\n"
	body := "메일 테스트입니다.\r\n"
	msg := []byte(headerSubject + headerBlank + body)

	// 메일 보내기
	err := smtp.SendMail("smtp.live.com:587", auth, from, to, msg)
	if err != nil {
		panic(err)
	}
}
```

## Logging
* `log` 패키지의 `Print*()`를 사용하면 Stdout에 출력

```go
package main

import "log"

func main() {
	// log.SetFlags(0)        // 날짜/시간 제거
	log.Println("Logging") // 2017/06/10 14:46:08 Logging
}
```

### Logger interface
* log 패키지는 여러가지 로거들을 지원하기 위해 Logger interface 지원
* `log.New(io.Writer, prefix, flag)`
   * 새로운 로거 만들기
   * io.Writer
      * os.Stdout, os.Stderr, 파일 포인터 등
   * prefix
      * 로그 출력의 가장 처음에 적는 prefix
   * flag
      * log.LstdFlags - 표준
      * log.Ldate - 날짜
      * log.Ltime - 시간
      * log.Lshortfile, log.Llongfile - 파일 위치

```go
package main

import (
	"log"
	"os"
)

func run() {
	myLogger.Print("Test")
}

var myLogger *log.Logger

func main() {
	myLogger = log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime)

	run()

	myLogger.Println("End of Program")
}
```

### 파일 로그
* log.New()의 1번째 파라미터로 `file pointer`를 넣어준다
```go
package main

import (
	"log"
	"os"
	"path"
	"runtime"
)

var myLogger *log.Logger

func run() {
	myLogger.Print("Test")
}

func main() {
	// log file open
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	fpLog, err := os.OpenFile(path.Dir(filename)+"/logfile.txt", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer fpLog.Close()

	myLogger = log.New(fpLog, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)

	run()

	myLogger.Println("End of Program")
}
```

### 로그 파일을 사용하는 좀 더 간편한 방법
* 표준로거를 파일로거로 변경하는 방식
   * 표준로거의 출력위치를 로그파일로 변경
* Logger를 전역변수에 지정할 필요가 없으며, 기존 log를 그대로 사용
```go
package main

import (
	"log"
	"os"
	"path"
	"runtime"
)

func main() {
	// log file open
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	fpLog, err := os.OpenFile(path.Dir(filename)+"/logfile.txt", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer fpLog.Close()

	// 표준 Logger를 fileLog로 변경
	log.SetOutput(fpLog)

	log.Println("End of Program")
}
```

### 복수 타겟 로깅
* `io.MultiWriter` 사용
```go
package main

import (
	"io"
	"log"
	"os"
	"path"
	"runtime"
)

func main() {
	// log file open
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("No caller information")
	}

	fpLog, err := os.OpenFile(path.Dir(filename)+"/logfile.txt", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer fpLog.Close()

	// 파일과 화면에 같이 출력하기 위해 MultiWriter 생성
	multiWriter := io.MultiWriter(fpLog, os.Stdout)
	log.SetOutput(multiWriter)

	log.Println("End of Program")
}
```

## 테스트
* 테스트 프레임워크 내장
```sh
# 현재 폴더에 있는 *_test.go 파일들을 테스트 코드로 인식하고 일괄적으로 실행
$ go test
```

* 테스트 메소드 형식
```go
func TestXxx(t *testing.T) {

}
```

* test할 메소드 생성
   * 같은 패키지에 위치해야 한다
```go
// calc/calc.go
package calc

func Sum(a ...int) int {
	sum := 0
	for _, i := range a {
		sum += i
	}
	return sum
}
```

```go
// calc/calc_test.go
package calc_test

import (
	"calc"
	"testing"
)

func TestSum(t *testing.T) {
	s := calc.Sum(1, 2, 3)

	if s != 6 {
		t.Error("Wrong result")
	}
}
```

```sh
# go test를 할려면 패키지가 GOPATH에 있어야 한다
$ cd calc
$ go test
# test result...
```
