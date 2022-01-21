# [Docker] Setting timezone in python image
> date - 2022.01.21  
> keyworkd - docker, python  
> python docker image의 timezone을 변경하는 방법을 정리

<br>

## How?
3가지 방법이 있다

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

### 2. Dockerfile에서 /etc/localtime, /etc/timezone 수정 
```dockerfile
ENV TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```
* `alpine` 같은 경량화 image에는 `/usr/share/zoneinfo`가 없어서 host에서 COPY
```
ENV TZ=America/Los_Angeles
COPY /usr/share/zoneinfo/$TZ /etc/localtime
```


<br>

### 3. Dockerfile에서 TZ 환경 변수 설정
```dockerfile
RUN apk add --no-cache tzdata  # alpine에서 해당 라인이 필요할 수도 있음
ENV TZ America/Los_Angeles
```


<br>

## Result. timezone 확인
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
> * [How to set the timezone when using the Python Alpine Docker image](https://www.peterspython.com/en/blog/how-to-set-the-timezone-when-using-the-python-alpine-docker-image)
> * [Docker Container time & timezone (will not reflect changes)](https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes)
