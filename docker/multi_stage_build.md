# [Docker] Multi Stage Builds
> date - 2020.04.12  
> keyworkd - docker, dockerfile, multi-stage build  
> multi-stage build에 대해 정리


<br>

## Multi Stage Build?
* Docker daemon, client 17.05 이상 필요
* `Dockerfile`의 **최적화, 가독성 향상 등의 유지 관리**에 유용
* 단일 `Dockerfile`에서 복잡한 build 수행 가능


<br>

## Before multi-stage
* 작은 size의 image를 만드는 것은 어렵다
  * `Dockerfile`의 각 명령어는 image layer를 추가
  * layer가 많아짐 -> image가 커짐 -> image registry에서 build, push, pull에 걸리는 시간이 길어짐
  * layer가 적음 -> image가 작아짐 -> **build, deploy가 빨라진다**
* 정말 효율적인 Dockerfile을 작성하려면 shell trick 등을 사용해 **layer를 작게 유지**
  * 각 layer에서 이전 layer에서 필요한 artifacts가 있는지 확인
  * 다음 layer로 넘어가기 전에 필요 없는 artifacts 정리
* multi-stage build 사용전에는 `Builder pattern`을 사용하거나 host system에서 application build 후 runtime image build

<br>

### 현재 layer의 불필요 artifacts 정리
* Bad
```dockerfile
RUN apt-get update \
  && apt-get -y install --no-install-recommends \
    openjdk-8-jdk
RUN rm -rf /var/lib/apt/lists/*
```

* Good
```dockerfile
RUN apt-get update \
  && apt-get -y install --no-install-recommends \
    openjdk-8-jdk \
  && rm -rf /var/lib/apt/lists/*  # here
```
* Bad처럼 다음 `RUN`에서 정리를 하게되면 이전 layer에 이미 존재하기 때문에 image size는 커지기 때문에 같은 layer에서 정리해준다

<br>

### Builder Pattern
* Development, Production의 **`Dockerfile` 2개를 사용**
* `Dockerfile.build`
  * Development `Dockerfile`로 **application build에 필요한 모든 것**이 포함
* `Dockerfile`
  * Production `Dockerfile`로 **application과 runtime**만 포함

<br>

* Dockerfile.build
```dockerfile
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-conunter/
COPY app.go .
RUN go get -d -v golang.org/x/net/html \
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```

* Dockerfile
```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY app .
CMD ["./app"]
```

* Run build
```sh
#!/bin/sh
echo "Building alexellis2/href-conunter:build"

docker build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy \
  -t alexellis2/href-counter:build . -f Dockerfile.build
docker container create --name extract alexellis2/href-counter:build
docker container cp extract:/go/src/github.com/alexellis2/href-counter/app ./app
docker container rm -f extract

echo "Building alexellis2/href-counter:latest"

docker build --no-cache -t alexellis2/href-counter:latest .
rm ./app
```
1. build를 위한 image 생성
2. build를 위한 image로 container 생성
3. build가 끝난 application으로 2번째 image 생성


<br>

## Use multi-stage builds
* 여러 stage를 `FROM`으로 구분하여 사용
  * 각 `FROM`은 서로 다른 base 사용
* stage 마다 temporary image 생성
  * `docker image ls`에는 표시되지 않지만 다른 stage에서 엑세스할 수 있다
* `COPY --from`으로 이전 stage에서 생성한 temporary image의 파일을 복사
* **build에 사용할 image를 만들 필요가 없고, local file system에 artifacts를 추출할 필요가 없다**
* final image에 build dependencies가 없어서 작고 더 효율적인 image를 만들 수 있다
* 더 이상 `Builder Pattern`의 build script를 작성하지 않고 `docker build`면 끝난다

<br>

* Dockerfile
```dockerfile
# build
FROM golang:1.7.3 AS builder
WORKDIR /go/src/github.com/alexellis/href-conunter/
RUN go get -d -v golang.org/x/net/html
COPY app.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# runtime
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/alexellis/href-conunter/app .
CMD ["./app"]
```

* Run build
```sh
$ docker build -t alexellis/href-conunter:latest .
```

<br>

### Target stage
* 매번 모든 stage를 build할 필요 없이 특정 stage만 build
  * 특정 build stage debugging에 사용
  * `debug stage`로 사용
    * 모든 debugging symobols or tool이 활성화된 lean production stage
  * `testing stage`로 사용
    * test data가 필요한 test stage로 사용하고, real data가 필요한 production은 다른 stage를 사용

```sh
$ docker build --target builder -t alexellis2/href-counter:latest .
```


<br>

### Use an external image as a stage
* `COPY --from`에서 local, remote image의 artifacts 사용 가능
```dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

<br>

### Use a previous stage as a new stage
* `FROM`으로 이전 stage의 중단된 부분을 참조하여 사용 가능
```dockerfile
FROM alpine:latest AS builder
RUN apk --no-cache add build-base

FROM builder AS build1
COPY source1.cpp source.cpp
RUN g++ -o /binary source.cpp

FROM builder AS build2
COPY source2.cpp source.cpp
RUN g++ -o /binary source.cpp
```


<br>

## Example

### 1. Spring Boot, node.js, react.js
* Frontend - node.js, react.js
* Backend - Spring Boot
  * standalone jar
  * Deployed to standalone JDK container

```dockerfile
FROM node:12.16.1 AS frontend
WORKDIR /usr/src/example/app/react-app
COPY react-app .
RUN npm install  # install dependencies
RUN npm run build  # build

FROM maven:3.6.3 AS apiserver
WORKDIR /usr/src/example
COPY pom.xml .
RUN mvn -B -f pom.xml -s /usr/share/maven/ref/settings-docker.xml dependency:resolve  # install dependencies
COPY . .
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml package -DskipTests  # build

FROM java:8-jdk-alpine
WORKDIR /static
COPY --from=frontend /usr/src/example/app/react-app/build/ .
WORKDIR /app
COPY --from=apiserver /usr/src/example/target/example-0.0.1.jar .
ENTRYPOINT ["java", "-jar", "/app/example-0.0.1.jar"]
CMD ["--spring.profile.active=postgres"]
```
* node.js image를 사용해 javascript, css 등의 frontend build
* maven image를 사용해 jar build
* JDK image에서 build된 것들 복사하여 runtime만 포함하도록 image 생성


<br>

## image build에서 test를 제외하여 pure build로 유지
* 상황에 따라 test는 Dockerfile 외부의 build image에서 실행할 수 있다

### As-is
```dockerfile
FROM node:10-alpine AS builder
...
RUN npm install \
    && npm run build \
    && npm run test \
    && npm run coverage

FROM node:10-alpine AS app
WORKDIR /app
COPY --from=builder /app/dist/src/ ./
COPY package*.json ./
RUN npm install --only=prod
EXPOSE 8000
ENTRYPOINT node /app/index.js   
```

<br>

### To-be
```dockerfile
FROM node:10-alpine AS builder
...
RUN npm install \
    && npm run build  # remove npm run test and coverage

FROM node:10-alpine AS app
...
```

```sh
$ docker run -it builder /bin/bash -c 'npm run test && npm run coverage'
```


<br>

## Advanced multi-stage build patterns

### Alias for a common image
* alias를 사용해 base image에 대한 관리를 단순화할 수 있다
#### As-is
```dockerfile
FROM alpine:3.6
...

FROM alpine:3.6
...

FROM alpine:3.6
...
```

#### To-be
```dockerfile
FROM alpine:3.6 AS alpine

FROM alpine  # alpine:3.6
...

FROM alpine  # alpine:3.6
...

## or
ARG ALPINE_VERSION=3.6

FROM alpine:${ALPINE_VERSION} AS alpine

FROM alpine  # alpine:3.6
...
```

### build arguments in --from
```dockerfile
ARG src=stage-0

FROM alpine AS build-stage-0
...

FROM build-${src}

# or 
COPY --from=build-${src}
```


<br><br>

> #### Reference
> * [Multi-Stage Builds](https://www.docker.com/blog/multi-stage-builds/)
