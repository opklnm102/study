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

<br><br>

> #### Reference
> * [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/)
> * [Creating Efficient Docker Images with Spring Boot 2.3](https://spring.io/blog/2020/08/14/creating-efficient-docker-images-with-spring-boot-2-3)
