# [Go] Project directory structure
> date - 2019.09.25  
> keyworkd - go  
> go project의 디렉토리 구조에 대해 정리  

<br>

## 디렉토리 구조
```sh
myproj
├── Makefile  # build 정의 외에도 task runner로도 이용
├── myproj.go  # source code
├── myproj.test.go  # test code
├── type1.go  # type 정의
├── type1.test.go
├── logger/  # 필요한 경우 sub package 이용
│    └── logger.go  # package logger
├── cmd/  # executable binary source code
│    └── myproj  # package main
│        └── main.go
├── internal/  # 외부에서 사용 못하도록할 package
├── testdata/  # fixture 등 test data
└── _tools/  # go 이외의 shell script 등
```

<br>

### 파일 분할
* type을 정의하고, 메소드를 정의할 경우 해당 코드를 하나의 파일로 분할

#### Example type Cat, type Dog 생성시
* myproj.go
  * endpoint
* cat.go
  * type Cat struct {...}의 정의와 메소드 정의
* dog.go
  * type Dog struct {...}의 정의와 메소드 정의

<br>

### package 분할
* package는 이름 그대로 한꾸러미로 이용 가능한 단위
* package의 구성요소는 type을 정의하고, **type마다 파일을 나누는게 좋다**
* 하나의 repository에 많은 package가 필요한 경우는 거의 없다
  * package 분할을 잘못했거나, 하나의 package로 구현하고 싶은 것이 너무 커졌을 경우
* 독립적인 라이브러리로써 다른 프로젝트에서의 사용 여부가 package를 분할하는 판단 기준
  * e.g. logger


### subpackage import
* `$GOPATH/src`를 기준으로 **절대 경로** 사용
```go
import "github.com/myname/myproj/logger"
```


<br><br>

> #### Reference
> * Go 언어 실전 테크닉: Go 언어 특징만 콕 집어 해설한
