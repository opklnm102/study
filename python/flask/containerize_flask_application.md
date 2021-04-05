# [Flask] Containerize Flask Application
> date - 2021.04.06  
> keyworkd - python, flask, docker, uwsgi, gunicorn    
> flask app을 docker와 docker-compose를 이용해 containerization하는 과정을 정리  
> source code는 [hello-flask](https://github.com/opklnm102/hello-flask)에서 확인할 수 있다  

<br>

## Flask Application 생성
* 아래처럼 간단한 Flask application을 구현
```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()
```

* Flask 내장 서버 실행
```sh
$ python -m flask run --host=0.0.0.0
```

<br>

### Dockerfile 생성
```dockerfile
FROM python:3.8.8-slim-buster

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]

ENTRYPOINT ["./docker-entrypoint"]
```

* build image and run container
```sh
$ docker build -t opklnm102/hello-flask:latest -f ./Dockerfile .

$ docker run --rm -p 5000:5000 opklnm102/hello-flask:latest
```


<br>

## uWSGI
* production에서 Flask 내장 서버가 아닌 WSGI server를 사용하는 것을 권장한다

<br>

### Architecture
* `docker-compose`를 이용해 `Nginx`, `uWSGI`를 아래처럼 구성해보자
```
Client <-> Nginx <-> wsgi <-> Flask
```

<br>

### 1. install uwsgi
```sh
$ pip install uwsgi
```

<br>

### 2. uwsgi start point 생성
```python
from app import app as application

if __name__ == '__main__':
    application.run()
```

* `uwsgi`로 실행할 수 있다
```sh
$ uwsgi --socket 0.0.0.0:5000 --protocol=http -w wsgi
```

* `application`으로 사용하지 않으면 `--callable`을 사용해야 한다
```python
from app import app

if __name__ == '__main__':
    app.run()
```
```sh
$ uwsgi -w wsgi --callable [app name]

## example
$ uwsgi --socket 0.0.0.0:5000 --protocol=http -w wsgi --callable app
```

<br>

### 3. uwsgi configuration 추가
* CLI가 아닌 파일로 설정할 수 있다
```ini
## hello-flask.ini
[uwsgi]
module = wsgi
master = true
wsgi-file = wsgi.py

socket = :5000
chmod-socket = 660
vacuum = true

die-on-term = true
processes = 4
threads = 2

stats = :9091
stats-http = true

max-requests = 5000
buffer-size = 32768
post-buffering = 4096
```

* run
```sh
$ uwsgi hello-flask.ini
```

<br>

### 4. Dockerfile 수정
```dockerfile
FROM python:3.8.8-slim-buster

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
 && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt ./
RUN pip install -r requirements.txt

RUN useradd --create-home app
WORKDIR /home/app
USER app

COPY --chown=app:app . .

EXPOSE 5000 9091

CMD ["uwsgi", "hello-flask.ini"]

ENTRYPOINT ["./docker-entrypoint"]
```

<br>

### 5. docker-compose에 nginx 추가
```yml
version: '3'

services:
  hello-flask:
    image: opklnm102/hello-flask:latest
    ports:
    - "5000:5000"
    - "9091:9091"
    networks:
      - backend
  nginx:
    image: nginx:1.19.9-alpine
    ports:
      - "80:80"
    networks:
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf

networks:
  backend:
    driver: bridge
```

* nginx 설정
```conf
upstream backend {
  server hello-flask:5000;
}

server {
  listen 80;
  server_name  localhost;

  ...

  location / {
    include uwsgi_params;
    uwsgi_pass backend;

    uwsgi_max_temp_file_size 20480m;
    uwsgi_buffering off;
    uwsgi_ignore_client_abort on;
    uwsgi_buffers 2560 160k;
    uwsgi_buffer_size 2560k;
    uwsgi_connect_timeout 30s;
    uwsgi_send_timeout 30s;
    uwsgi_read_timeout 30s;
    uwsgi_busy_buffers_size 2560k;
    uwsgi_temp_file_write_size 2560k;
    proxy_read_timeout 30s;
    proxy_connect_timeout 75s;
  }
}
```

* `docker-compose up`으로 실행하면 완료
```sh
$ docker-compose up
```


<br>

## Gunicorn - Python WSGI HTTP Server for UNIX
* Green Unicorn의 약자로 UNIX용 Python WSGI HTTP server
* pre-fork worker model
* Nginx와 함께 사용
* `uwsgi`보다 빠르고 가볍고, 간단하다

<br>

### Install
```sh
$ pip install gunicorn
```

<br>

### Run
```sh
$ gunicorn [option] [WSGI app]

## example - app in app.y
$ gunicorn --workers 2 --bind :5000 wsgi:app
```
* 자동으로 `gunicorn.conf.py(default config file)`을 읽고 다른 config file을 사용하려면 `gunicorn -c [config file]`을 사용


### Dockerfile 수정
```dockerfile
## As-is
CMD ["uwsgi", "hello-flask.ini"]

## To-be
CMD ["gunicorn", "wsgi:application"]
```

<br>

## gunicorn, uwsgi 앞에 Nginx를 사용하는 이유
* DDos 공격 방지, static resource serving과 buffering 때문에 Nginx를 사용
```
Client <-> wsgi <-> Flask
```
* 위의 architecture에서 client에 response를 전송시 client가 response packet을 천천히 받으면 그 영향이 app server의 process가 block되어 처리량이 감소될 수 있다
* nginx는 app server로부터 response packet을 모두 받을 때 까지 대기하다가 client에게 response를 전송하여 slow client가 생겨도 app server가 block되는 것을 방지할 수 있다


<br><br>

> #### Reference
> * [Build your Python image](https://docs.docker.com/language/python/build-images/)
> * [gunicorn](https://docs.gunicorn.org)
> * [How to Deploy a Flask App on an AWS EC2 Instance](https://chrisdtran.com/deploy-flask-on-ec2/)

<br>

> #### Further reading
> * [Backend Architectures Keywords and References](https://gist.github.com/ragingwind/5840075)
> * [System Architecture to deploy a Django Application with PostgreSQL, nginx and gunicorn on Amazon AWS](http://amazonwebservices21.blogspot.kr/2015/07/system-architecture-to-deploy-django.html)
