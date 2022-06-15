# [Container] distroless - 🥑 Language focused docker images, minus the operating system
> date - 2022.06.15  
> keyworkd - container, security  
> GoogleContainerTools/distroless에 대해 정리

<br>

## What is distroless?
* standard Linux distribution에서 package manager, shell, other tool이 없고, 언어에 집중한 slim image
  * Go - gcr.io/distroless/static
  * Java - gcr.io/distroless/java11-debian11
  * Python - gcr.io/distroless/python3
  * Node.js - gcr.io/distroless/nodejs:18
* `gcr.io/distroless/base image`는 glibc 기반
  * 현재 Debian 11(bullseye) 기반이고 향후 최신 Debian 버전으로 변경된다
* Go, Rust application 등의 실행에 적합
* ca-certificates 등 TLS/SSL 관련 라이브러리 등 필요한 최소한의 라이브러리만 포함
* 일반 image로 build 후, runtime image로 사용하면 application image size를 최소화할 수 있다
* 취약점이 발생할 수 있는 불필요한 것들을 제외함으로써 보안성 향상과 image size가 작다
* [Bazel](https://bazel.build/) or multi-stage Dockerfile을 사용해서 distroless application image를 생성


<br>

## Usage
*  multi-stage Dockerfile 사용
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

## Debug image
* busybox를 제공하는 `:debug` image를 사용
```dockerfile
FROM gcr.io/distroless/python3-debian11:debug
COPY . /app
WORKDIR /app
CMD ["hello.py", "/etc"]
```


<br>

## Vulnerability scan
* distroless 기반의 application image에서 Vulnerability scanning시 standard linux distribution 보다 취약점이 적게 발견되는 것을 확인할 수 있다

### trivy
```sh
$ trivy image --severity CRITICAL opklnm102/hello-echo:latest
...

opklnm102/hello-echo:latest (debian 11.3)

Total: 0 (CRITICAL: 0)

home/nonroot/hello-echo (gobinary)

Total: 0 (CRITICAL: 0)
```

<br>

### grype
```sh
$ grype opklnm102/hello-echo:latest
 ✔ Vulnerability DB        [no update available]
 ✔ Loaded image
 ✔ Parsed image
 ✔ Cataloged packages      [16 packages]
 ✔ Scanned image           [0 vulnerabilities]

No vulnerabilities found
```


<br><br>

> #### Reference
> * [GoogleContainerTools/distroless - GitHub](https://github.com/GoogleContainerTools/distroless)
