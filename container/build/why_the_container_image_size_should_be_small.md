# [Container] Why the container image size should be small
> date - 2022.06.15  
> keyworkd - container, security, performance  
> container image가 작아야하는 이유에 대해 정리

<br>

## image size 증가에 따라 나타나는 문제
image size는 아래와 같은 요인을 통해 image build부터 container 실행에 걸리는 시간에 영향을 준다
* image build 소요 시간
* registry에 image push 소요 시간
* container를 실행할 host에서 image pull 소요 시간
* container를 실행시키는 시간

위 요인은 다음과 같은 문제를 일으킬 수 있다
* cluster를 구성하는 node의 disk size 낭비
* CI 소요 시간
* 개발 중 시행착오 소요 시간 증가로 인한 생산성 저하
* auto scaling으로 container가 투입되는 소요 시간 증가(image pull + container start time에 영향)
대규모 트래픽 시스템에서는 auto scaling을 통해 새로운 node가 투입되는데, 이때 node에 얼마나 빨리 container를 배포할 수 있는지가 중요
* memory footprint, image size가 커질수록 더 많은 memory 사용
* 불필요한 것들이 포함되어 image size가 증가했다면 불필요한 것으로 인한 취약점 발생 요인 증가
* image registry에 부하 증가
* 취약성을 확인하는 시간 증가


<br>

## image size가 작아야하는 이유
결국 시간이 증가함에 따라 생산성과 효율성이 떨어지기 때문에 가벼운 image는 개발 효율 개선에도 효과적이다
* image build 소요 시간 감소
* image push 소요 시간 감소
* auto scaling 소요 시간 감소
* 더 적은 memory 사용
* 더 적은 disk 사용
* 취약점이 발생할 수 있는 불필요한 것들을 제외함으로써 보안성 향상
  * 보안 위협이 증가함에 따라 취약점들을 제거하는 것이 어느때보다 중요, container security scanner 사용해서 취약점 확인
  * image size도 작아진다


<br>

## 가벼운 container image 만들기
* image에는 application binary와 dependency library, tool이 포함, 이 size를 줄이면 image size를 줄일 수 있다
  * multistage build로 쉽게 가능
* 아래 요소는 CI 등을 통해 지속적으로 모니터링 필요
  * 불필요한 파일 제거
  * 불필요한 프로그램 최소화
  * dependency library 최소화
  * web application의 assets(e.g. image) size 최소화

<br>

### .dockerignore 활용
* 불필요한 파일이 image에 포함되지 않도록 제외하는데 사용
```
.git
.idea
*.log
...
```

<br>

### 가벼운 base image 사용
* base image로 [distroless](https://github.com/GoogleContainerTools/distroless), [scratch](https://hub.docker.com/_/scratch) 등 가벼운 image를 사용하면 전체적으로 가벼워진다

#### [scratch](https://hub.docker.com/_/scratch)
* 아무것도 들어있지 않은 base image
  * 아무것도 들어있지 않아서 application을 build하기에는 어려워 실효성이 떨어질 수 있다
* image pull은 불가능하고, `FROM scratch`로 사용
* 모든 image의 base image
```dockerfile
# debian:bullseye-slim
# https://github.com/debuerreotype/docker-debian-artifacts/blob/337f494fae12a1db13a003cea38e74f43d312ee6/bullseye/slim/Dockerfile

FROM scratch
ADD rootfs.tar.xz /
CMD ["bash"]
```

#### [busybox](https://hub.docker.com/_/busybox)
* 임베디드 시스템에서 많이 사용하는 Linux distribution
* echo, ls 등 기본 utility tool을 갖추고 있음에도 image size가 매우 작다
* 다른 OS와 다르게 단일 binary `/bin/busybox`에 모든 utility tool 포함
* base image로 사용시 `scratch`와 거의 차이가 나지 않는다
* utility tool이 포함되어 있어서 `scratch`보다 편의성이 높다
```dockerfile
FROM busybox
COPY ./my-static-binary /my-static-binary
CMD ["/my-static-binary"]
```

#### [alpine](https://hub.docker.com/_/alpine)
* 표준 C 라이브러리 구현체인 `musl`과 BusyBox 기반의 경량 Linux distribution
* 보안, 간결함, 리소스 효율을 중시
* package manager가 존재하면서 가벼운 배포판으로 인기가 높다
  * package manager - `apk`
  * image size - 약 5MB

```dockerfile
FROM alpine:3.14
RUN apk add --no-cache mysql-client
ENTRYPOINT ["mysql"]
```

#### [Distroless](./distroless)
* standard Linux distribution에서 package manager, shell, other tool이 없고, 언어에 집중한 slim image
```dockerfile
FROM golang:1.17-alpine AS builder

WORKDIR /

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -a -installsuffix cgo -o /app cmd/server/main.go

FROM gcr.io/distroless/static AS runner

WORKDIR /home/nonroot
USER nonroot:nonroot

COPY --from=builder /app ./

CMD ["./app"]
```


<br>

## Slim(Slim toolkit)
* image size를 줄일 수 있는 간편한 도구인 [Slim(toolkit)](https://github.com/slimtoolkit/slim)을 사용
```sh
$ slim build <image>

## e.g.
$ slim build my/sample-app
```

<br>

## Vulnerabilities 비교
* [grype](https://github.com/anchore/grype) 기준

| image | vulnerabilities |
|:--|:--|
| python:3.10.5 | 1066 |
| python:3.10.5-slim | 86 |
| python:3.10.5-alpine | 0 |


#### python:3.10.5
```sh
$ grype python:3.10.5
 ✔ Vulnerability DB        [no update available]
 ✔ Loaded image
 ✔ Parsed image
 ✔ Cataloged packages      [430 packages]
 ✔ Scanned image           [1066 vulnerabilities]
NAME                          INSTALLED              FIXED-IN     TYPE  VULNERABILITY     SEVERITY   
apt                           2.2.4                               deb   CVE-2011-3374     Negligible  
binutils                      2.35.2-2                            deb   CVE-2018-9996     Negligible  
...
```

#### python:3.10.5-slim
```sh
$ grype python:3.10.5-slim
 ✔ Vulnerability DB        [no update available]
 ✔ Pulled image
 ✔ Loaded image
 ✔ Parsed image
 ✔ Cataloged packages      [108 packages]
 ✔ Scanned image           [86 vulnerabilities]
NAME              INSTALLED           FIXED-IN     TYPE  VULNERABILITY     SEVERITY
apt               2.2.4                            deb   CVE-2011-3374     Negligible
bsdutils          1:2.36.1-8+deb11u1               deb   CVE-2022-0563     Negligible
...
```

#### python:3.10.5-alpine
```sh
$ grype python:3.10.5-alpine
 ✔ Vulnerability DB        [no update available]
 ✔ Pulled image
 ✔ Loaded image
 ✔ Parsed image
 ✔ Cataloged packages      [39 packages]
 ✔ Scanned image           [0 vulnerabilities]
No vulnerabilities found
```


<br>

## Conclusion
* 지금까지 가벼운 container image를 왜 사용해야하는지에 대해 알아보았다
* 시간, 비용 측면에서의 효율성과 보안을 위해서 가벼운 container image를 사용하는 것을 추천한다


<br><br>

> #### Reference
> * [당신의 컨테이너 이미지가 더 작아야 하는 이유를 알고 계시나요?](https://www.nginxplus.co.kr/best-practices/building-smaller-container-images/)
> * [scratch](https://hub.docker.com/_/scratch)
> * [busybox](https://hub.docker.com/_/busybox)
> * [alpine](https://hub.docker.com/_/alpine)
> * [GoogleContainerTools/distroless - GitHub](https://github.com/GoogleContainerTools/distroless)
