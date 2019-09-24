# [Go] Use Makefile as task runner
> date - 2019.09.25  
> keyworkd - go, makefile, task runner  
> Makefile을 task runner로 사용하기  

<br>

## Task runner
* project 구성시 고려해야할 것들이 있다
  * 초기 환경 설정
  * 의존성 라이브러리 설치
  * 테스트 실행
  * 빌드
  * ...
* go에서는 이런 task들을 관리하기 위한 task runner로 make가 사용되고 있다

<br>

### Makefile
```sh
# metadata
NAME := myproj
VERSION := $(shell git describe --tags --arev=0)
REVISION := $(shell git rev-parse --short HEAD)
LDFLAGS := -X 'main.version=$(VERSION)' \
           -X 'main.revision=$(REVISION)'
DEP_VERSION="x.y.z"

## setup
setup:
  go get github.com/golang/lint/golint
  go get golang.org/x/tools/cmd/goimports
  curl -L -s https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 -o $GOPATH/bin/dep
  chmod +x $GOPATH/bin/dep
  go get github.com/Songmu/make2help/cmd/make2help

## test
test: deps
  go test ./...

## denpendency install with dep
deps: setup
  dep ensure

update: setup
  dep ensure -update

## lint
lint: setup
  go vet ./...
  for pkg in $$(go list ./...); do \
    golint $$pkg; \
  done

## format source codes
fmt: setup
  goimports -w $$(go list ./...)

## build binary ex. make bin/myproj
bin/%: cmd/%/main.go deps
  go build -ldflags "$(LDFLAGS)" -o $@ $<

clean:
  rm -rf bin/

cleanall: clean
  rm -rm vendor/

## show help
help:
  @make2help $(MAKEFILE_LIST)

.PHONY: setup deps update test lint clean cleanall help
```

* usage
```sh
$ make deps

$ make setup

$ make bin/test
```

<br>

#### task가 복잡해질 경우 shell script로 분리
* shell script
```sh
#!/bin/bash

set -e

go get github.com/golang/lint/golint
go get golang.org/x/tools/cmd/goimports
curl -L -s https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 -o $GOPATH/bin/dep
chmod +x $GOPATH/bin/dep
go get github.com/Songmu/make2help/cmd/make2help
```

* Makefile
```sh
## setup
setup:
  ./setup.sh
...
```


<br>

## Conclusion
* go는 java의 gradle, maven 같이 task runner로 make를 많이 사용한다
* Makefile에 task를 정의해두면 파악하기 좋다

<br><br>

> #### Reference
> * Go 언어 실전 테크닉: Go 언어 특징만 콕 집어 해설한
