# [Docker] Dockerfile Best pratices
> date - 2020.04.06  
> keyworkd - docker, dockerfile  
> Dockerfile 작성을 위한 best pratice를 정리  

<br>

## General guidelines and recommendations
### Create ephemeral containers
* 최소한의 configuration만으로 container를 교체할 수 있도록 ephemeral container를 생성해야한다

<br>

### Understand build context
```sh
## build context - current directory
$ docker build -t helloapp:v1 .

## build context - other direcotry
$ docker build --no-cache -t helloapp:v2 -f dockerfiles/Dockerfile context
```

* build context - `docker build` 명령을 실행하는 current working directory
* 기본적으로 build context의 `Dockerfile`을 사용하지만 `-f` 로 변경할 수 있다
* 어디의 `Dockerfile`을 사용하는지에 관계없이 build context의 contents는 Docker daemon에 전송된다
  * image build에 불필요한 파일이 포함되면 build context 및 image size가 증가해 build/pull/push time, container starting time이 증가할 수 있다
  * [.dockerignore file](https://docs.docker.com/engine/reference/builder/#dockerignore-file) 사용 추천
* build context size는 `docker build`시 아래와 같은 메시지에서 확인
```sh
Sending build context to Docker daemon 187.8MB
```

<br>

### Pipe Dockerfile through stdin
* `stdin`을 통해 `Dockerfile`을 piping하여 build할 수 있다
* `Dockerfile`을 disk에 쓰지 않아서 일회성 build에 유용
```sh
$ echo -e `FROM busybox\nRUN echo "hello world"` | docker build -

## or
$ docker build -<<EOF
FROM busybox
RUN echo "hello world"
EOF
```

#### local filesystem + stdin Dockerfile
```sh
$ docker build [options] -f- [build context]

## example
$ docker build -t my-image:latest -f- . <<EOF
FROM busybox
COPY somefile.txt ./
RUN cat /somefile.txt
EOF
```

#### remote filesystem + stdin Dockerfile
```sh
$ docker build -t my-image:latest -f- https://github.com/docker-library/hello-world.git <<EOF
FROM busybox
COPY somefile.txt ./
RUN cat /somefile.txt
EOF
```


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
  && apt-get -y install \
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
  && apt-get -y install \
    openjdk-8-jdk ssh vim

# after
  && apt-get -y install --no-install-recommends \
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
  && apt-get -y install --no-install-recommends \
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
  && apt-get -y install --no-install-recommends \  # remove
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
  * [.dockerignore file](https://docs.docker.com/engine/reference/builder/#dockerignore-file) 참고

<br>

### dockerignore rule
| Rule | Behavior |
|:--|:--|
| `# comment` | ignored |
| `*/temp*` | /somedir/temp, /somedir/temporary.txt 제외 |
| `*/*/temp*` | /some/sub/temporary.txt 제외 |
| `temp?` | /tempa, tempb 제외 |
| `**/*.txt` | 모든 txt 제외 |
| !README.md | README.md 포함 |

<br>

## 1 container, 1 process
* 1개의 image에 1개의 process로 사용
* nginx, java 등을 **하나의 image에 넣지 말고 분리**
  * `nginx`를 다른 Loadbaalncer(e.g. envoy, haproxy)로 변경할 경우 유연하게 대응
  * 하나의 component에 대해 변경이 필요할 경우 투명하게 관리
  * Kubernetes에서 lifecycle에 맞게 동작시킬 수 있다


<br>

## Create ephemeral containers
* minimum set up & configuration으로 사용 가능한 **ephemeral container**로 생성
* [Twelve-Factor 6 Processes](https://12factor.net/processes) 참고


<br>

## Pipe Dockerfile through stdin
* local, remote build context로 `stdin`을 통해 Dockerfile을 piping하여 build 가능
* Dockerfile을 disk에 저장할 필요 없는 1회성 build에 유용
```sh
$ echo -e 'FROM busybox\nRUN echo "hello"' | docker build -
```

* stdin에서 `Dockerfile`을 사용하여 image build
```sh
$ docker build -<<EOF
FROM busybox
RUN echo "hello"
EOF
```
* 위의 방법으로 `COPY`, `ADD` 사용시 **no such file or directory** 발생하여 사용할 수 없지만 아래 방법으로는 가능
```sh
$ docker build -t myimage:latest -f- . <<EOF
FROM busybox
COPY somefile.txt .
RUN cat /somefile.txt
EOF
```

<br>

### remote git repository를 사용하여 build
* `git clone`하여 build context로 daemon에 전달하므로 `git`이 설치되어 있어야 한다
```sh
$ docker build -t myimage:latest -f- https://github.com/docker-library/hello-world.git <<EOF
FROM busybox
COPY hello.c .
EOF
```


<br>

## Using Pipes
* `|` 사용시 마지막 exit code만 평가하므로 `set -o pipefail`을 사용하여 전체 명령 성공시 build되도록 하는게 좋다
```dockerfile
# Bad
RUN wget -O -https://some.site | wc -l > /number

# Good
RUN set -o pipefail && wget -O -https://some.site | wc -l > /number
```


<br>

## ADD or COPY
* 기능적으로 비슷하지만 일반적으로 `COPY`를 권장
* `COPY`는 local file을 container로 복사하는 기능만 있지만 `ADD`는 tar 추출 및 remote URL support 기능이 있기 때문에 `ADD`의 tar auto-extraction이 필요하지 않다면 `COPY`를 사용
* image layer 때문에 `ADD [remote url]` 보다는 `curl` or `wget` 권장
```dockerfile
# Bad
ADD https://example/big.tar.xz /usr/src/things
RUN tar -xJf /usr/src/things/big.tar.xz -C /usr/src/things
RUN make -C /usr/src/things all

# Good
RUN mkdir -p /usr/src/things \
  && curl -SL https://example/big.tar.xz \
  | tar -xJC /usr/src/things \
  && make -C /usr/src/things all
```


<br>

## CMD
* `CMD ["executable", "param1", "param2"...]`로 사용
* `ENTRYPOINT`의 동작을 잘 알고 있지 않다면 `CMD ["param1", "param2"...]`으로 사용하지 않는게 좋다
```dockerfile
CMD ["java", "-jar", "app.jar"]
CMD ["python", "run.py"]
```


<br>

## ENTRYPOINT
* 가장 좋은 용도는 `ENTRYPOINT`로 image main command를 설정하고 `CMD`에 default flag를 사용
```dockerfile
ENTRYPOINT ["s3cmd"]
CMD ["--help"]
```

* 추가 작업이 필요할 경우 `ENTRYPOINT`에 helper script를 사용
```sh
#!/bin/bash
set -e

if [ "$1" = 'postgres' ]; then
  chown -R postgres "$PGDATA"

  if [ -z "$(ls -A "$PGDATA")" ]; then
    gosu postgres initdb
  fi

  exec gosu postgres "$@"
fi

exec "$@"
```

```dockerfile
COPY ./dokcer-entrypoint.sh /
ENTRYPOINT ["/dokcer-entrypoint.sh"]
CMD ["postgres"]
```

* `ENTRYPOINT`를 사용할 경우 추가 flag를 전달할 수 있다
```sh
$ docker run postgres --help

$ docker run --rm -it postgres bash
```


<br>

## sudo 사용 X
* sudo 사용일 필요할 경우 `gosu` 사용


<br>

## ONBUILD
* 부모 dockerfile이 자식 dockerfile에게 제공되는 명령어
  * 하위 dockerfile의 모든 명령보다 먼저 ONBUILD가 먼저 실행
* 부모 dockerfile을 기본 이미지로 사용하는 자식 dockerfile에서 반드시 진행되어야 하는 파일 복사나, 환경 변수 설정과 같은 작업을 자동화할 때 사용
* [ONBUILD](https://docs.docker.com/engine/reference/builder/#onbuild)에서 ADD, COPY 사용시 리소스가 누락되면 이미지 빌드에 실패할 수 있으니 주의 필요


<br>

## SHELL
* dockerfile에서 shell command 사용 사능
```dockerfile
SHELL ["/bin/bash", "-c", "ls"]
```


<br>

## Metadata 생성
* docker image는 모든 파일을 `tar`로 압축한 후 metadata를 추가한 것
* metadata로 사용자들에게 유용한 정보를 제공
```dockerfile
FROM ubuntu:latest  
LABEL maintainer="Your Name <youremail@example.com>"  
LABEL description="This is a simple Dockerfile example that uses the LABEL and EXPOSE instructions."  
RUN apt-get update && \  
apt-get install -y nginx  
EXPOSE 80  
CMD ["nginx", "-g", "daemon off;"]
```
* EXPOSE - 어떤 port가 노출되는지를 나타내며 실제 network에는 영향이 없다
* LABEL - docker inspect로 확인할 수 있으며 이미지의 목적, 작성자 등 다양한 용도로 활용


<br>

## A few language-specific best pratices

### Golang
* Compile, then COPY binary
```dockerfile
# build
FROM golang:1.7.3 AS builder
WORKDIR /example/
RUN go get -d -v golang.org/x/net/html
COPY app.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# runtime
FROM scratch
WORKDIR /home/app/
COPY --from=builder /example/main .
ENTRYPOINT ["/home/app/main"]
```

* Run build
```sh
$ docker build -t my-docker-image:1.0.0 .
```

<br>

> #### scratch
> * Special, **empty `Dockerfile`**
> * Docker 1.5.0부터 `FROM scratch`는 layer를 만들지 않는다
> * debian, busybox처럼 **base image로 사용**
> * binary만 실행하는 minimal image build시 사용
> ```dockerfile
> FROM scratch
> COPY hello /
> CMD ["/hello"]
> ```

<br>

### Ruby
```dockerfile
# Pin your base image version
# Use only trusted or official base images
# Minimize image size by opting for small base images when possible
# Use multi-stage builds to reduce the size of your image
# Use multi-stage builds to avoid leaking secrets inside your docker history
FROM ruby:2.5.5-alpine AS builder

# Avoid leaking secrets inside your image
# Fetching private dependencies via a Github token intected through the gitconfig
# Use multi-stage builds to aviod leaking secrets inside your docker history
ARG GITHUB_TOKEN

# Group commands by how likely they are to change individually
# Place the least likely to change commands at the top
RUN apk add --update \
  build-base \
  libxml2-dev \
  libxslt-dev \
  git

# Pin application dependencies (Gemfile.lock)
COPY Gemfile Gemfile.lock ./

RUN git config --global url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/some-user".insteadOf git@github.com:some-user \
  && git config --global --add url."https://${GITHUB_TOKEN}:x-oauth-basic@github.com/some-user".insteadOf ssh://git@github \
  && bundle install --without development test \
  && rm ~/.gitconfig

FROM ruby:2.5.5-alpine
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/

# Avoid running your application as root
RUN adduser -D app
USER app
WORKDIR /home/app

# When running COPY or ADD (as a different user) use --chown
COPY --chown=app . ./

# When setting the CMD instruction, prefer the exec format over the shell format
CMD ["bundle", "exec", "rackup"]
```

* Run build
```sh
$ docker build --build-arg GITHUB_TOKEN=xxx -t my-docker-image:1.0.0 .
```

<br>

### Python
```dockerfile
FROM python:3.8.2-slim-buster AS base

FROM base AS builder
WORKDIR /install

COPY requirement.txt .
RUN pip install -r requirement.txt

FROM base

COPY --from=builder /install /usr/local
RUN useradd --create-home app
WORKDIR /home/app
USER app
COPY src .
CMD ["gunicorn", "-w 4", "main:app"]
```

<br>

### Node.js
* .dockerignore에 npm-debug.log 추가
* `node_modules` caching이 중요
* package.json이 변경될 경우에만 run npm install
* `npm start`가 아닌 `node index.js`로 signal을 node process가 수신하도록 한다
```dockerfile
# build
FROM node:12.16.2 AS builder
WORKDIR /usr/src/app
COPY package* .
RUN npm install --production
COPY src/ src/

# lint
FROM node:12.16.2 AS linting
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/src .
RUN npm lint

# static Analysis
FROM newtmitch/sonar-scanner:latest as sonarqube
COPY --from=builder /usr/src/app/src /root/src

# unit testing
FROM node:12.16.2 AS unit-tests
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
RUN npm test

# accessibility tests
FROM node:12.16.2 AS access-tests
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
RUN npm access-tests

# runtime
FROM node:12.16.2
WORKDIR /usr/src/app
USER app
COPY --from=builder /usr/src/app/dest .
COPY --from=builder /usr/src/app/package* .
EXPOSE 3000
CMD ["node", "index.js"]
```

<br>

### Java
* Golang 같이 build stage와 runtime stage를 분리하여 final image에는 binary만 실행

```dockerfile
# build
FROM openjdk:14-jdk-slim AS builder

ENV APP_HOME=/home/app
WORKDIR $APP_HOME

COPY build.gradle settings.gradle gradlew $APP_HOME
COPY gradle $APP_HOME/gradle
RUN ./gradlew build || return 0
COPY . .
RUN ./gradlew build

# runtime
FROM openjdk:14-jre-slim

ENV APP_HOME=/home/app
WORKDIR $APP_HOME

COPY --from=builder $APP_HOME/build/libs/app.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```

* 위 image는 gradlew를 사용하므로 gradle dependency에 변경이 생기면 `RUN ./gradlew build || return 0`에서 gradle download time이 발생
  * Java image download time + gradle download time + application build time이 소요
  * gradle image를 builder image로 사용하면 gralde download time을 최적화할 수 있다

```dockerfile
# build
FROM gradle:8-jdk21 AS builder

ENV APP_HOME=/home/app
WORKDIR $APP_HOME

COPY build.gradle settings.gradle $APP_HOME
RUN gradle build --no-daemon || return 0
COPY . .
## spring boot 3.2
RUN gradle build --no-daemon \
    && mkdir -p target/extracted  \
    && java -Djarmode=layertools -jar /home/app/build/libs/*.jar extract --destination target/extracted

# runtime
FROM eclipse-temurin:21-alpine

ENV APP_HOME=/home/app

RUN addgroup -g 3000 app  \
    && adduser -u 1000 -G app -S app
USER app
WORKDIR $APP_HOME

ARG EXTRACTED=${APP_HOME}/target/extracted
COPY --from=builder --chown=app:app ${EXTRACTED}/dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/spring-boot-loader/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/snapshot-dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

#### image build time 비교
* 위처럼 gradle depdency cache 사용 안할시 매번 58s 소요되므로 gradle depdency cache 여부에 따른 build time 비교해보자

| | gradlew | gradlew + --no-daemon | Gradle image | Gradle image + --no-daemon |
|:--|:--|:--|:--|:--|
| non cached gradle dependency | 79s | 76s | 62s | 62s |
| cached gradle dependency | 34s | 33s | 32s | 30s |

* 정리해보면 container image cache + gradle depdency cache + grade image + --no-daemon을 사용하면 최적의 build time을 가져갈 수 있다


<br><br>

> #### Reference
> * [Intro Guide to Dockerfile Best Pratices](https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/?fbclid=IwAR0cNHNRuE3HSHT61iI-Zo3iFTqBa90H8pOpbFjvDGWlk95euOJeEvW_jF0)
> * [Docker Best Pratices](https://medium.com/banksalad/docker-best-practices-8b4f28ab3a65)
> * [Add --chown to WORKDIR](https://github.com/moby/moby/issues/36408)
> * [Creating Effective Images - Youtube](https://www.youtube.com/watch?v=pPsREQbf3PA&feature=youtu.be)
> * [Creating Effective Images - Abby Fuller - DevOpsDays Tel Aviv 2017 - Slideshare](https://www.slideshare.net/DevopsCon/creating-effective-images-abby-fuller-devopsdays-tel-aviv-2017)
> * [scratch - Docker Hub](https://hub.docker.com/_/scratch)
> * [Best pratices when writing a Dockerfile for a Ruby application](https://lipanski.com/posts/dockerfile-ruby-best-practices)
> * [Broken by default: why you should avoid most Dockerfile example](https://pythonspeed.com/articles/dockerizing-python-is-hard/)
> * [Java Example with Gradle and Docker - codefresh.io](https://codefresh.io/docs/docs/learn-by-example/java/gradle/)
> * [Best pratices for writing Dockerfiles - Docker Docs](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
> * [10 Secrets to Improve Your Dockerfile](https://aws.plainenglish.io/10-secrets-to-improve-your-dockerfile-40ac54aa5bf2)
