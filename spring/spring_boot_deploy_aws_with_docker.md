# [SpringBoot + Docker] Spring Boot Deploy AWS with Docker
> spring boot 기반의 application을 docker image로 build하여 aws에 배포하는 방법을 정리

## Require
* jdk 1.8
* AWS에 EC2 생성

> ## Spring Boot는 Docker랑 찰떡 궁합
> * 배포된 `jar`를 포함한 도커 이미지를 컨네이터로 생성
> * 원하는 시점에 원하는 만큼의 컨테이너를 손쉽게 증감 가능
> * Scale-Out에 손쉬운 대응이 가능함

## Docker Install
* 리눅스 배포판 종류를 자동으로 인식하여 도커패키지를 설치해주는 스크립트 제공
```sh
# wget 옵션 참고 - http://coffeenix.net/board_print.php?bd_code=168
$ sudo wget -qO- https://get.docker.com/ | sh

# 설치하면 hello-world이미지도 자동 설치, 사용하지 않을것이므로 모두 삭제
$ sudo docker rm 'sudo docker ps -aq'
$ sudo docker rmi hello-world

# sudo를 매번 입력하지 않기 위해 현재 계정을 docker 그룹에 포함(root 권한과 동일하므로 꼭 필요한 계정만 포함)
$ sudo usermod -aG docker ${USER}
$ sudo service docker restart
```

## Dockerfile 작성
* 프로젝트 내부에 `Dockerfile`생성
* `Dockerfile`를 기반으로 `Docker Image를 생성`한다
```sh
# src/main/docker/Dockerfile에 생성(어디든 상관없음, 관리를 위해 Project안에 만드는걸 추천)
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ADD spring-boot-docker-0.1.0.jar app.jar
RUN sh -c 'touch /app.jar'
ENV JAVA_OPTS=""
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar" ]
```

## build.gradle에 스크립트 작성
```gradle
buildscript {
    ...
    dependencies {
        ...
        classpath('se.transmode.gradle:gradle-docker:1.2')
    }
}

group = 'opklnm102'  // docker 사용자 이름

...
apply plugin: 'docker'

task buildDocker(type: Docker, dependsOn: build) {
    push = true  // dockerhub push after image build. require login -> $ docker login
    applicationName = jar.baseName
    dockerfile = file('src/main/docker/Dockerfile')
    doFirst {
        copy {
            from jar
            into stageDir
        }
    }
}
``` 

## Build
* `opklnm102/spring-boot-docker`라는 이미지 생성
```sh
$ ./gradlew build buildDocker
```

## AWS EC2 인스턴스에 접속
```sh
$ chmod 600 <xxx.pem>
$ ssh -i <xxx.pem> <user name>@<EC2 IP or DNS>
```

## EC2에 Docker 설치
* 위에 작성한 내용과 동일하게 Docker를 설치한다

## Docker에 spring boot image 설치
```sh
$ docker pull <image name>
```

## 컨테이너 생성 및 실행
* 도커 이미지 빌드하고 push하려면 docker hub에 로그인 필요!!
   * `$ docker login`
   * group - 도커 사용자 이름이 된다
```sh
# docker run -p <host port>:<container port> -t <image name>
$ docker run -p 8080:8080 -t <image name>

# port 연결 확인
$ docker port <container id>
```

## 테스트
*__http://<EC2 IP>:8080__* 로 접속

> #### 참고
> [Amazon EC2에서 Docker 사용하기](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter10/01)
> [EC2 인스턴스에 접속하기](http://pyrasis.com/book/TheArtOfAmazonWebServices/Chapter04/04)  
> [도커(Docker) 튜토리얼: 깐김에 배포까지](http://blog.nacyot.com/articles/2014-01-27-easy-deploy-with-docker/#toc-qqqqimageqqqqqqq)  
> [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)  
