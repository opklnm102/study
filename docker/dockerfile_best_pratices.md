# [Docker] Dockerfile Best pratices
> date - 2020.04.06  
> keyworkd - docker, dockerfile  
> Dockerfile 작성을 위한 best pratice를 정리  

<br>

## Incremental build time
* image rebuild시 cache를 활용하는 것이 build time에 중요
* caching은 필요하지 않은 build step을 skip
* caching을 이용해 변경되지 않은 **build step을 skip**

<br>

### 1. Order matters for caching
```dockerfile
FROM debian
# COPY . /app  # remove
RUN apt-get update
RUN apt-get-y install openjdk-8-jdk ssh vim
COPY . /app  # here
CMD ["java", "-jar", "/app/target/app.jar"]
```
* build step 순서 중요
* 파일을 변경하거나 라인을 수정하여 step cache가 invalidate 되면 후속 cache step이 중단되기 때문
* caching optimize를 위해 **자주 변경되는 step을 마지막에 사용**

<br>

### 2. More specific COPY to limit cache busts
```dockerfile
FROM debian
RUN apt-get update
RUN apt-get-y install openjdk-8-jdk ssh vim
# COPY . /app  # remove
COPY target/app.jar /app  # here
CMD ["java", "-jar", "/app/target/app.jar"]
```
* 필요한 것만 `COPY`
* 가능하면 `COPY` 사용을 피하라
* ccopy하는 파일이 변경되면 cache가 invalidate
* **관련 없는 파일의 변경이 cache에 영향을 미치지 않게** copy target을 구체적으로 사용

<br>

### 3. Identity cacheable units such as apt-get update & install
```dockerfile
FROM debian
# RUN apt-get update  # remove
# RUN apt-get-y install openjdk-8-jdk ssh vim  # remove
RUN apt-get update \
  && apt-get -y instal \
    openjdk-8-jdk ssh vim  # here
COPY target/app.jar /app
CMD ["java", "-jar", "/app/target/app.jar"]
```
* 각 `RUN` 명령어는 cachable unit
* 하나의 `RUN`으로 연결하여 **항상 최신 package를 설치하도록 한다**


<br>

## Reduce Image size
* image size가 작을수록 deploy speed가 빠르고, 취약점이 작을 수 있으므로 image size는 중요

<br>

### 1. Remove unnecessary dependencies
```dockerfile
FROM debian
RUN apt-get update \

# before
  && apt-get -y instal \
    openjdk-8-jdk ssh vim

# after
  && apt-get -y instal --no-install-recommends \
    openjdk-8-jdk
...
```
* 불필요한 dependency 제거
* debugging tool 설치 X
  * 필요한 경우 설치
* package manager(e.g. apt)는 실제로는 불필요한 dependency도 설치한다
  * `apt`에서는 `--no-install-recommends`로 불필요 dependency install 방지할 수 있다


<br>

### 2. Remove package manager cache
```dockerfile
FROM debian
RUN apt-get update \
  && apt-get -y instal --no-install-recommends \
    openjdk-8-jdk \
  && rm -rf /var/lib/apt/lists/*  # here
...
```
* image에 package manager의 cache가 포함되므로 설치와 동일한 `RUN` 명령어에서 cache도 제거해준다
  * 다른 `RUN`에서 제거해도 image size는 줄어들지 않는다
* **multi-stage build**도 image size 감소에 유용한 방법


<br>

## Maintainability

### 1. Use official images when possible
```dockerfile
FROM debian  # remove
RUN apt-get update \  # remove
  && apt-get -y instal --no-install-recommends \  # remove
    openjdk-8-jdk \  # remove
  && rm -rf /var/lib/apt/lists/*  # remove
FROM openjdk
...
```
* official image는 모든 install step과 best practice가 적용되어 있으므로 maintenance에 유리
* 여러 image를 사용하는 경우 **동일한 base image를 사용하면 layer를 공유**할 수 있다

<br>

### 2. Use more specific tags
```dockerfile
FROM openjdk  # remove
FROM openjdk:8  # here
...
```
* `latest` tag는 편리하지만 시간이 지남에 따라 변경될 수 있기 때문에 사용하지 않는 편이 좋다
  * 암시적인 버전 변경으로인한 side effect 발생 가능성
  * Kubernetes에서는 `imagePullPolicy`에 따라 새로운 image가 download 안될 수 있다
  * image cache를 활용할 수 없어 매번 Registry에서 download하는 비효율 발생
* 대신 base image에 specific tag 사용

<br>

### 3. Look for minimal flavors
| Repository | TAG | SIZE |
|:--|:--|:--|
| openjdk | 8 | 624MB |
| openjdk | 8-jre | 443MB |
| openjdk | 8-jre-slim | 204MB |
| openjdk | 8-jre-alpine | 83MB |

* 위의 tag 중 일부는 minimal flavors이므로 image size가 작다
* slim variant
  * Debian에서 최소한의 package만 포함
  * GNU libc 사용
* alpine variant
  * Alpine Linux 기반
  * musl libc 사용
    * 호환성 문제가 발생할 수 있지만 대부분의 경우 문제가 없다


<br>

## Reproducibility
* 위의 `Dockerfile`의 `jar`는 host에서의 build로 가정되어 있지만 container의 이점을 잃기 때문에 적절하지 않다
* 아래에서는 container의 이점을 살릴 수 있는 방법을 설명

<br>

### 1. Build from source in a consistent environment
```dockerfile
FROM openjdk:8-jre-alpine  # remove
FROM maven:3.6-jdk-8-alpine  # here
WORKDIR /app
COPY app.jar /app  # remove
COPY pom.xml .
COPY src ./src
RUN mvn -e -B package
CMD ["java", "-jar", "/app/app.jar"]
```
* application build에 필요한 요소 식별
  * Maven
  * JDK
* `mvn -e -B package`
  * `-e` - 오류 표시
  * `-B` - non-interactive batch mode
* environment 일관성 이슈는 해결했지만, `pom.xml`의 모든 dependency fetch하는 이슈 발생

<br>

### 2. Fetch dependencies in a separate step
```dockerfile
FROM maven:3.6-jdk-8-alpine
WORKDIR /app
COPY pom.xml .
RUN mvn -e -B dependency:resolve  # here
COPY src ./src
RUN mvn -e -B package
CMD ["java", "-jar", "/app/app.jar"]
```
* cacheable unit을 고려하여 fetching dependencies는 source code가 아닌 `pom.xml`의 변경에만 의존하도록 한다
* 모든 dependency fetch 이슈는 해결되었지만, runtime에 불필요한 build time dependency가 image에 포함되고, 그로 인해 image size 증가 이슈 발생

<br>

### 3. Use multi-stage builds to remove build dependencies(recommended Dockerfile)
* As-is
```dockerfile
FROM maven:3.6-jdk-8-alpine
WORKDIR /app
COPY pom.xml .
RUN mvn -e -B dependency:resolve  # here
COPY src ./src
RUN mvn -e -B package
CMD ["java", "-jar", "/app/app.jar"]
```

* To-be
```dockerfile
# build time step
FROM maven:3.6-jdk-8-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -e -B dependency:resolve  # here
COPY src ./src
RUN mvn -e -B package

# runtime step
FROM openjdk:8-jre-alpine
COPY --from=builder /app/target/app.jar /
CMD ["java", "-jar", "/app.jar"]
```
* built time step
  * `multi-stage build`는 여러 `FROM`으로 인식
  * 각 `FROM`은 새로운 step을 시작
  * `AS`로 이름 지정
  * 일관성있는 환경에서 모든 build dependency가 포함
* runtime step
  * runtime에 필요한 요소만 포함
  * `build time step`은 cache되지만 최종 image에는 존재하지 않는다

<br>

> #### multi-stage build
> * build time dependency 제거를 위한 solution


<br>

## mkdir + cd
* 특정 폴더에서 작업할 때 `mkdir + cd`보다는 `WORKDIR` 사용
```dockerfile
# bad
RUN mkdir -p /some/directory && \
    cd /some/directory

# or
RUN mkdir -p /some/directory
WORKDIR /some/directory

# good
WORKDIR /some/directory
```
* Docker 1.10부터 `RUN`, `ADD`, `COPY`만 Layer를 생성하므로 Layer에 대한 고민 없이 `WORKDIR` 사용
* `WORKDIR`로 폴더 생성시 `USER`가 무시되므로 아래와 같은 방법 사용
```dockerfile
USER foo
RUN mkdir /some/directory
WORKDIR /some/directory
```

<br>

## exec form
* `CMD`의 경우 **shell form**과 **exec form** 사용 가능
```dockerfile
# shell form
CMD node server.js

# exec form
CMD ["node", "server.js"]
```
* shell form 사용시 `/bin/sh -c node server.js`로 실행
* `SIGTERM` 같은 **signal이 executable로 전달되지 않을 수 있기 때문에 exec form 사용 권장**


<br>

## Transparency Matters
* image build시 **항상 동일한 image가 생성되도록 dependency 관리**
* python에서 아래와 같이 dependency를 관리하면 모두 실행 시점의 **최신 버전이 설치**되므로 항상 동일한 image가 생성되지 않는다
```
# requirements.txt
mysqlclient
numby>=1.7.0
```

<br>

### Solution: specific dependency
```
# python requirements.txt
mysqlclient==1.4.2
numby==1.16.4

# Alpine
apk add [dependency]=[version]

# Debian
[apt-get|aptitude] install [dependency]=[version]

# CentOS
yum install [dependency]-[version]
```


<br>

## Keep It Light
* 꼭 필요한 파일만 image로 생성
* `.dockerignore` 미사용시 폴더를 복사하는 경우 의도하지 않은 파일이 image에 포함될 수 있기 때문에 **명시적으로 파일을 복사하거나 `.dockerignore`를 사용**


<br>

## 1 container, 1 process
* 1개의 image에 1개의 process로 사용
* nginx, java 등을 **하나의 image에 넣지 말고 분리**
  * `nginx`를 다른 Loadbaalncer(e.g. envoy, haproxy)로 변경할 경우 유연하게 대응
  * 하나의 component에 대해 변경이 필요할 경우 투명하게 관리
  * Kubernetes에서 lifecycle에 맞게 동작시킬 수 있다


<br><br>

> #### Reference
> * [Intro Guide to Dockerfile Best Pratices](https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/?fbclid=IwAR0cNHNRuE3HSHT61iI-Zo3iFTqBa90H8pOpbFjvDGWlk95euOJeEvW_jF0)
> * [Docker Best Pratices](https://medium.com/banksalad/docker-best-practices-8b4f28ab3a65)
> * [Add --chown to WORKDIR](https://github.com/moby/moby/issues/36408)
