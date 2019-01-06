# [Travis CI] About Travis CI
> date - 2019.01.06  
> keyword - continuous integration  
> Travis CI를 셋팅하던 중 build job lifecycle 등 TravisCI에 대해 좀 더 알기 위해 정리

<br>

## Travis CI란?
TODO: 2019.01.06 메인 페이지의 이미지도 삽입하기


<br>

## Travis CI의 job은 2가지 주요 부분으로 구성
* install
* script


<br>


## The job lifecycle
> git checkout 후 

### 1. install `apt addons`
* optional

### 2. install `cache components`
* optional

### 3. `before_install`
* dependency 구성을 위해 필요한 작업 수행
  * dependency management tool 설치 등

```yaml
...
env:
  - DEP_VERSION="0.5.0"

before_install:
  # Download the binary to bin folder in $GOPATH
  - curl -L -s https://github.com/golang/dep/releases/download/v${DEP_VERSION}/dep-linux-amd64 -o $GOPATH/bin/dep
  # Make the binary executable
  - chmod +x $GOPATH/bin/dep
...
```

### 4. `install`
* dependency package 구성
* 언어별로 dependency management tool이 다르기 때문에 script를 제공하면 `.travis.yml`을 재사용할 수 있다
```yaml
install:
  - ./install-dependencies.sh
```

### 5. `before_script`
* build 수행 전 필요한 작업 수행

### 6. `script`
* build script 실행
* 복잡한 build script는 파일로 만들어 실행하자

```yaml
# simple build script
script:
  - ./pre-commit
  - go test

# complex build script
script:
  - ./ci/test-with-cover.sh
```

### 7. `before_cache`
* optional
* 기존 cache 정리 작업 수행

### 8. `after_success` or `after_failure`
* build 결과에 대한 추가 작업 수행
* `$TRAVIS_TEST_RESULT`로 결과에 접근할 수 있다

### 9. `before_deploy`
* optional
* deploy 전 필요 작업 수행

### 10. `deploy`
* optional
* build 결과물을 Heroku, AWS, Docker Hub 등에 배포하기 위해 Continuous Deploy Provier를 사용해 정의
* build가 깨지면 skip한다
* Provier를 사용해 배포시 빌드 중 변경 내용을 삭제하지 않도록 아래 설정 추가
```yaml
deploy:
  skip_cleanup: true
```

### 11. `after_deploy`
* optional
* deploy 결과 노티 등 작업 수행

### 12. `after_script`


<br>

> before_deploy, after_deploy는 deploy provider 전후에 실행  
> 여러 deploy provider가 있는 경우 여러번 실행된다


<br>

## Breaking the Build
* job lifecycle의 처음 4단계 중 하나가 실패하면 build가 깨진다
* `before_install`, `install`, `before_script`
  * build가 error가 생겨 즉시 중지
* `script`
  * build failed로 masking
* `after_success`, `after_failure`, `after_script`, `after_deploy`는 build 결과에 영향을 주지 않지만, 시간 초과시에는 build failed로 masking


<br>

## Deployment
TODO: 2019.01.06 [Deployment - Travis CI Docs](https://docs.travis-ci.com/user/deployment) 참고해 내용 추가


<br><br>

> #### Reference
> * [Job Lifecycle - Travis CI Docs](https://docs.travis-ci.com/user/job-lifecycle/)
> * [Deployment - Travis CI Docs](https://docs.travis-ci.com/user/deployment)
