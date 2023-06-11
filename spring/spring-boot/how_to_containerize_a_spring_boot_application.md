# [Spring Boot] How to containerize a Spring Boot application
> date - 2023.06.11  
> keyworkd - spring boot, containerize, container image  
> spring boot application을 containerize하는 내용 정리  

<br>

## Project structure
* project는 gradle multi module로 구성
```sh
├── feed-app
│   ├── Dockerfile
│   ├── build.gradle
│   └── src
├── ranking-app
│   ├── Dockerfile
│   ├── build.gradle
│   └── src
├── build.gradle
├── gradle
│   └── wrapper
├── gradlew
├── gradlew.bat
└── settings.gradle
```


<br>

## 1. Basic
* jar를 copy하여 image 생성하는 기본적인 버전
```dockerfile
FROM eclipse-temurin:17-jdk

COPY feed-app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```
```sh
$ ./gradlew :feed-app:build -x test
$ docker build -f feed-app/Dockerfile -t feed-app .
```

<br>

## 2. Spring Boot Layer Index
* buidl layer cache를 효율적으로 이용하기 위해 Layered fat jar 사용
* Layered fat jar는 source code, dependency 등이 jar로 packaging되어 build layer cache를 이용하지 못하는 단점을 해결
```dockerfile
FROM eclipse-temurin:17-jdk

RUN useradd --create-home -s /bin/bash app
WORKDIR /home/app
USER app

ARG EXTRACTED=feed-app/build/extracted
COPY --chown=app:app ${EXTRACTED}/dependencies/ ./
COPY --chown=app:app ${EXTRACTED}/spring-boot-loader/ ./
COPY --chown=app:app ${EXTRACTED}/snapshot-dependencies/ ./
COPY --chown=app:app ${EXTRACTED}/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```
```sh
$ ./gradlew :feed-app:build -x test
$ mkdir -p feed-app/build/extracted
$ java -Djarmode=layertools -jar feed-app/build/libs/*.jar extract --destination feed-app/build/extracted
$ docker build -f feed-app/Dockerfile -t feed-app .
```

<br>

## 3. Multi-stage builds
* [multi-stage builds](https://docs.docker.com/build/building/multi-stage)를 사용해 small size image 생성

| Image | Size |
|:--|:--|
| eclipse-temurin:17-jdk | 1.03GB |
| multi-stage build + eclipse-temurin:17-jdk | 495MB |
| multi-stage build + eclipse-temurin:17-jre | 305MB |

```dockerfile
FROM eclipse-temurin:17-jdk as builder

WORKDIR /workspace/app
COPY . /workspace/app

RUN ./gradlew :feed-app:build -x test \
    && mkdir -p target/extracted  \
    && java -Djarmode=layertools -jar /workspace/app/feed-app/build/libs/*.jar extract --destination target/extracted

FROM eclipse-temurin:17-jre

RUN useradd --create-home -s /bin/bash app
WORKDIR /home/app
USER app

ARG EXTRACTED=/workspace/app/target/extracted
COPY --from=builder --chown=app:app ${EXTRACTED}/dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/spring-boot-loader/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/snapshot-dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```
```sh
$ docker build -f feed-app/Dockerfile -t feed-app .
```


<br>

## 4. Dependency caching
* gradle dependency caching layer를 추가해 build 속도를 향상시킨다
* build.gradle의 내용이 변경되어 dependency에 변경 사항이 있을 때만 dependency 최신화하여 source code만 수정시에는 [3. Multi-stage builds](#3-multi-stage-builds) 보다 빠른 속도를 보인다
```dockerfile
FROM eclipse-temurin:17-jdk as builder

WORKDIR /workspace/app

## dependencies
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ ./gradle/
COPY feed-app/build.gradle ./feed-app/
RUN ./gradlew build -x test > /dev/null 2>&1 || true

## build binary
COPY feed-app/ ./feed-app/
RUN ./gradlew :feed-app:build -x test \
    && mkdir -p target/extracted  \
    && java -Djarmode=layertools -jar /workspace/app/feed-app/build/libs/*.jar extract --destination target/extracted

FROM eclipse-temurin:17-jre

RUN useradd --create-home -s /bin/bash app
WORKDIR /home/app
USER app

ARG EXTRACTED=/workspace/app/target/extracted
COPY --from=builder --chown=app:app ${EXTRACTED}/dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/spring-boot-loader/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/snapshot-dependencies/ ./
COPY --from=builder --chown=app:app ${EXTRACTED}/application/ ./

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```
```sh
$ docker build -f feed-app/Dockerfile -t feed-app .
```


<br><br>

> #### Reference
> * [[Spring Boot] Spring Boot packaging OCI images](./spring_boot_packaging_oci_images.md)
> * [Spring Boot Docker](https://spring.io/guides/topicals/spring-boot-docker)
> * [4.4.6. Packaging Layered Jar or War - Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/#packaging-executable.configuring.layered-archives)
> * [12.1.1. Layering Docker Images - Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#container-images.efficient-images.layering)
