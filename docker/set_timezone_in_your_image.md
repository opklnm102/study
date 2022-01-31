# [Docker] Set timezone in your image
> date - 2022.01.31  
> keyworkd - docker, container, timezone
> docker image에서 timezone을 설정하는 방법을 정리

<br>

## TL;DR
```dockerfile
...
ENV TZ="Asia/Seoul"

## if ubuntu
RUN apt update \
    && apt install -y --no-install-recommends  \
       tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && dpkg-reconfigure -f noninteractive tadata  # or echo $TZ > /etc/timezone
```


<br>

## How?
2가지 방법이 있다

<br>

### 1. container run시 host volume 공유
* host의 timezone을 따라갈 경우 사용
```sh
$ docker run -v "/etc/timezone:/etc/timezone:ro" -v "/etc/localtime:/etc/localtime:ro" [image]
```

* 위 방법 사용시 container에서 `/erc/localtime` 수정시 read only option으로 아래의 error가 발생할 수 있다
```sh
ln: cannot remove ‘/etc/localtime’: Device or resource busy
```

<br>

### 2. Dockerfile에서 timezone 정의

#### Debian, Alpine
```dockerfile
...
ENV TZ="Asia/Seoul"

# alpine에서 아래 라인이 필요할 수도 있음
RUN apk add --no-cache tzdata
```

#### Ubuntu
```dockerfile
...
ENV TZ="Asia/Seoul"

RUN apt update \
    && apt install -y --no-install-recommends  \
       tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && dpkg-reconfigure -f noninteractive tadata  # or echo $TZ > /etc/timezone
```
* `dpkg-reconfigure`가 /etc/localtime으로 /etc/timezone을 설정


<br>

## Result. Python image에서 timezone 확인
* `time`으로 확인
```python
import time
time.tzname  # ('KST', 'KST')

from datetime import datetime
datetime.now()  # datetime.datetime(2021, 12, 20, 12, 34, 25, 529200)
datetime.utcnow()  # datetime.datetime(2021, 12, 20, 3, 34, 39, 66615)
```

* log로 확인
```
2021-12-20 12:35:56,468 (MainThread) ...
```

<br><br>

> #### Reference
> * [Set timezone in your docker image](https://dev.to/0xbf/set-timezone-in-your-docker-image-d22)
> * [Back to the Future — Handling different timezones between Docker container and host](https://medium.com/hotels-com-technology/back-to-the-future-af4431aa6e97)
> * [How to set the timezone when using the Python Alpine Docker image](https://www.peterspython.com/en/blog/how-to-set-the-timezone-when-using-the-python-alpine-docker-image)
> * [Docker Container time & timezone (will not reflect changes)](https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes)
