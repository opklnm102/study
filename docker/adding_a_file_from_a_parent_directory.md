# [Docker] Adding a file from a parent directory
> date - 2021.04.02  
> keyworkd - docker, copy  
> Dockerfile에서 parent path의 파일 참조시 실패하는 이슈에 대하여 정리  

<br>

## Requirement

### Dependency
* Docker version 20.10.5

<br>

## Issue
* Directory structure
```
.
├── docker-entrypoint.sh
└── product-api
    └── Dockerfile
```

* Dockerfile
```dockerfile
...
COPY ../docker-entrypoint.sh ./
...
```

위와 같이 설정 후 docker build시 not found로 build fail
```sh
$ docker build -t test-image:latest .

failed to compute cache key: "/docker-entrypoint.sh" not found: not found
```


<br>

## Resolve
* build context를 parent로 사용하고, `Dockerfile`의 경로를 지정하여 파일을 참조할 수 있도록 수정
```dockerfile
...
COPY ../docker-entrypoint.sh ./
...
```

```sh
## docker build -t <image tag> -f <Dockerfile path> <context>
$ docker build -t test-image:latest -f ./Dockerfile ../
```


<br>

## Conclusion
* docker build시 parent path를 참조할 수 없으니 build context를 신경써야 한다

<br><br>

> #### Reference
> * [Docker: adding a file from a parent directory](https://stackoverflow.com/questions/24537340/docker-adding-a-file-from-a-parent-directory)
