# [Spring Boot] Spring Boot packaging OCI images
> date - 2022.08.07  
> keyworkd - spring boot, buildpacks, oci  
> Spring Boot에서 Buildpacks을 이용해 OCI image 생성에 대한 내용 정리  

<br>

## Buildpacks support
* [Cloud Native Buildpacks (CNB)](https://buildpacks.io/)을 사용해 `bootBuildImage` task에서 [OCI image](https://github.com/opencontainers/image-spec) 생성
* [jib](https://github.com/GoogleContainerTools/jib)처럼 `Dockerfile` 없이 image를 생성하나 docker daemon 필요
* Spring Boot 2.3부터 가능
* layered image를 생성하므로 image cache를 활용해 다음 build time이 단축된다


<br>

## build image
```sh
$ ./gradlew bootBuildImage
```


<br>

## image name custom
* default
```
docker.io/library/${project.name}:${project.version}
```

* custom
```groovy
bootBuildImage {
  imageName = "example.com/library/${project.name}"
}
```


<br>

## publish image
```groovy
bootBuildImage {
  publish = true
    docker {
	  builderRegistry {
	    token = "9cbaf023786cd7..."
	  }
  }
}
```


<br>

## Layered fat jar
* 별도의 설정이 필요해서 `Dockerfile`을 사용해야 하는 경우 build layer cache를 효율적으로 이용하기 위해 fat jar에 대한 최적화가 필요
* `Buildpacks`을 사용하면 자동으로 적용

<br>

### fat jar 구조
```sh
.
├── BOOT-INF
│   ├── classes
│   │   ├── application.properties
│   │   ├── me
│   │   ├── static
│   │   └── templates
│   ├── classpath.idx
│   ├── layers.idx
│   └── lib
│       ├── jackson-annotations-2.13.3.jar
│       ...
├── META-INF
│   └── MANIFEST.MF
└── org
    └── springframework
        └── boot
```
* fat jar는 크게 3가지로 구성
  * Spring application을 시작하기 위한 bootstrap class
  * application code
  * 3rd party libraries
* `spring-boot-jarmode-layertools`는 `layers.idx`의 내용으로 디렉토리를 매핑한다
```sh
- "dependencies":
  - "BOOT-INF/lib/"
- "spring-boot-loader":
  - "org/"
- "snapshot-dependencies":
- "application":
  - "BOOT-INF/classes/"
  - "BOOT-INF/classpath.idx"
  - "BOOT-INF/layers.idx"
  - "META-INF/"


## 아래 명령어 실행시 매핑된 정보로 풀린다
$ java -Djarmode=layertools -jar app.jar extract
```

| Directory | Description |
|:--|:--|
| Dependencies | Spring Boot 등 framework dependencies<br>framework version upgrade시에 변경 |
| Spring Boot Loader | Bean lifecycle 관리를 위해 Spring Boot App을 JVM에 load하는 코드<br>거의 변하지 않는다 |
| Snapshot dependencies | 자주 변경<br>build시마다 최신 snapshot을 가져와야할 수도 있다<br>application code에 가장 가깝다 |
| Application | `src/main/java`로 application code |

* spring boot 2.7.2에서는 default로 layerd가 활성화되어 있어서 이전 버전처럼 별도의 설정이 필요 없고, 아래 설정으로 비활성화할 수 있다
```gradle
tasks.named("bootJar") {
  layered {
    enabled = false  // disable layered mode
  }
}
```

<br>

### Dockerfile 작성
* spring boot multi module을 기준으로 작성
```dockerfile
FROM openjdk:11 AS builder

COPY . .

ARG MODULE=test-api
ARG JAR_FILE=build/libs/app.jar

RUN ./gradlew ${MODULE}:build \
    && java -Djarmode=layertools -jar ${MODULE}/${JAR_FILE} extract

FROM openjdk:11-slim

RUN useradd --create-home -s /bin/bash app
WORKDIR /home/app

USER app

COPY --from=builder --chown=app:app ./dependencies/ ./
COPY --from=builder --chown=app:app ./spring-boot-loader/ ./
COPY --from=builder --chown=app:app ./snapshot-dependencies/ ./
COPY --from=builder --chown=app:app ./application/ ./

EXPOSE 8080

ENTRYPOINT ["java", "${JAVA_OPTS}", "org.springframework.boot.loader.JarLauncher"]
```


<br><br>

> #### Reference
> * [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
> * [Creating Efficient Docker Images with Spring Boot 2.3](https://spring.io/blog/2020/08/14/creating-efficient-docker-images-with-spring-boot-2-3)
> * [layered-archives - Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/#packaging-executable.configuring.layered-archives)
