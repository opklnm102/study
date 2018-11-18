# [Docker] Docker images dangling
> date - 2018.11.19  
> keyword - docker  
> disk에 쌓여가는 docker image 삭제시 사용했던 `$ docker rmi $(docker images --filter "dangling=true" --quiet --no-trunc)`를 해부하여 진행과정을 살펴보고자 한다

<br>


### Base Environment
```sh
$ docker images
REPOSITORY                           TAG                 IMAGE ID            CREATED             SIZE
opklnm102/my-app                    <none>              c3e7a0f84488        4 months ago        760MB
opklnm102/my-app                    <none>              ac74e1017437        5 months ago        760MB
opklnm102/my-app                    latest              ac74e1017427        5 months ago        760MB
```

<br>


### 1. --filter "dangling=true"
```sh
$ docker images --filter "dangling=true"
REPOSITORY                           TAG                 IMAGE ID            CREATED             SIZE
opklnm102/my-app                    <none>              c3e7a0f84488        4 months ago        760MB
opklnm102/my-app                    <none>              ac74e1017437        5 months ago        760MB
```

* dangling
  * image tree의 leaf image 중 tag가 지정되지 않은 이미지
  * 새로운 build image에서 `repo:tag를 <none>:<none>` 또는 `tag가 없는 것`으로 만들 경우 발생
* `--filter(= -f)` - 조건에 맞는것만 필터링

<br>

### 2. --quiet(= -q)
* image의 숫자 ID만 출력

```sh
$ docker images -f "dangling=true" -q
c3e7a0f84488
ac74e1017437
```


<br>

### 3. --no-trunc
* 출력을 자르지 않는다

```sh
$ docker images -f "dangling=true" -q --notrunc
sha256:c3e7a0f8448893d7988adc6aa41170d12fa26806dae211e1da01a42afdc29509
sha256:ac74e1017437a3a117997d4ff97177ae93bc88548a2d598bab65e94ff87f7fd0
```

최종적으로 위의 hash 값들이 `docker rmi`의 parameter으로 사용하게 된다


<br><br>

> #### Reference
> * [docker images](https://docs.docker.com/engine/reference/commandline/images/#usage)
