# [Shell Script] Scripts To Rule Them All
> date - 2019.02.03  
> keyword - shell script  
> Scripts To Rule Them All에 대해 정리  

<br>

* script를 이름으로 일정한 패턴으로 표준화
* 각 script는 작업 단위로 분리
* 다른 script에서 호출 가능
* 중복된 작업을 정리할 수 있ㄷ


<br>

## script/bootstrap
* 프로젝트의 `종속성을 충족`시키기 위해서만 사용
* Homebrew package, npm package 등
* 필요한 모든 종속성이 설치되었는지 확인 및 설치
* [script/bootstrap](https://github.com/github/scripts-to-rule-them-all/blob/master/script/bootstrap) 참고

```sh
#!/bin/sh

# script/bootstrap: Resolve all dependencies that the application requires to run

set -e

cd "$(dirname "$0")/.."

if [ -f "Brewfile" ] && [ "$(uname -s)" = "Darwin" ]; then
  brew bundle check >/dev/null 2>&1 || {
    echo "==> Installing Homebrew dependencies..."
    brew bundle
  }
fi

...
```

<br>

## script/setup
* 초기 상태로 설정하는데 사용
* `clone 후`나 `초기 상태로 reset할` 때 사용
* bootstrap이 잘 동작하는지 확인할 때 유용

```sh
#!/bin/sh

# script/setup: Set up application for the first time after cloning, or set it back to the initial first unused state

set -e

cd "$(dirname "$0")/.."

script/bootstrap

echo "==> Setting up DB..."

# reset database to a fresh state
...
```


<br>

## script/update
* git pull 후 필요한 작업 수행
  * DB migration 실행 등
* 일반적으로 `script/bootstrap`은 여기서 실행

```sh
#!/bin/sh

# script/update: Update application to run for its current checkout

set -e

cd "$(dirname "$0")/.."

script/bootstrap

echo "==> Updating DB..."
...
```


<br>

## script/server
* application 시작하는데 사용
  * Web Application이면 추가 process도 시작
* `script/update`는 application 시작 전에 호출

```sh
#!/bin/sh

# script/server: Launch the application and any extra required processes locally

set -e

cd "$(dirname "$0")/.."

# ensure everything in the app is up to date
script/update

test -z "$ENV" && ENV='development'

# boot the app and any other necessary processes
systemctl start nginx

./bin/server
```


<br>

## script/test
* application의 test suite를 실행
* file path를 argument로 사용하는게 좋은 패턴
* `Linting`도 test로 간주될 수 있으므로 시작 부분에 위치시킨다
* `script/cibuild`에서 호출하므로 환경에 따른 설정 필요
  * development 환경에서 script/update로 최신 상태 유지

```sh
#!/bin/sh

# script/test: Run test suite for application. Optionally pass in a path to an individual test file to run a single test

set -e

cd "$(dirname "$0")/.."

[ -z "$DEBUG" ] || set -x

PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
export PROJECT_ROOT

if [ "$ENV" = "test" ] || [ "$PROJECT_ENV" = "test" ]; then
  script/setup
else
  export ENV="test" PROJECT_ENV="test"
  script/update
fi

echo "==> Running tests.."

if [ -n "$1" ]; then
  # pass argument to test call. This is useful for calling a single test
  bin/test test "$1"
else
  bin/test test
fi
```


<br>

## script/cibuild
* CI server에서 사용
* test 실행전 환경에 맞는 작업 실행
* test는 script/test를 호출해 간단히 실행


```sh
#!/bin/sh

# script/cibuild: Setup environment for CI to run tests. This is primarily designed to run on the continuous integration server

set -e

cd "$(dirname "$0")/.."

echo "Tests started at..."
date "+%H:%M:%S"

# setup environment
export PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
export ENV="test"

# run tests
echo "Running tests..."
date "+%H:%M:%S"

script/test
```

<br>

## script/console
* application console을 여는데 사용
* argument로 환경을 넘겨 환경에 맞는 console을 여는게 좋은 패턴
* 요청된 환경에 대해 console을 여는데 필요한 모든 것을 구성하고 실행

```sh
#!/bin/sh

# script/console: Launch a console for the application. Optionally allow an environment to be passed in to let the script handle the specific requirements for connecting to a console for that environment

set -e

if [ -n "$1" ]; then

  if [ "$1" = "production" ]; then
    heroku run rails console --app heroku-app-name
  elif [ "$1" = "staging" ]; then
    heroku run rails console --app heroku-app-name-staging
  else
    echo "Sorry, I don't know how to connect to the '$1' environment"
    exit 1
  fi
else
  script/update
  bin/rails console
fi
```


<br><br>

> #### Reference
> * [Scripts To Rule Them All](https://github.com/github/scripts-to-rule-them-all)
