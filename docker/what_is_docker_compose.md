# [Docker] What is docker compose
> date - 2022.08.03  
> keyword - docker, container, compose  
> docker compose에 대해 정리  

<br>

## Docker Compose
* 다중 container application을 정의, 공유할 수 있도록 개발된 도구
* Docker CLI로 각자 제어하는게 아닌 `docker-compse up/down` 명령어와 설정 파일을 사용해 선언적 방식으로 dependency, runtim을 사용할 수 있다

<br>

## Sample
* docker-compose.yml
```yaml
version: "3.9"
services:
  app:
    image: %IMAGE%
    ports:
      - "8080:8080"
    restart: always
    volumes:
      - .:/app
      - logvolume:/var/log
    depends_on:
      - redis  # redis container와 통신도 가능
    env_file: .env  # environment 저장 파일
    environment:
      - TZ=Asia/Seoul
  redis:
    image: redis:6.2
volumes:
  logvolume: {}
```

* compose-setting.sh
```sh
#!/bin/bash
 
sed -ie "s/%IMAGE%/$1/" docker-compose.yml # 1번째 parameter로 docker-compose.yml의 %IMAGE%를 치환
```

* run
```sh
$ compose-setting.sh test-app:1.0.0
```


<br>

## image build
```sh
$ docker compose build [--no-cache]
```


<br>

## 시작시 image build
```sh
$ docker compose up --build
```

<br>

## testing 환경 자동화하기
```sh
$ docker compose up -d  # running background

$ ./run-tests

$ docker compose down
```


<br>

## profile을 사용하여 local 개발 환경과 application 실행 구분하기
* 아래 명령어 실행하면 local-dev profile이 설정된 redis만 시작하므로 application은 IDE에서 실행해주면 된다
```sh
$ docker compose up --profile local-dev
```
```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - .:/code
      - logvolume:/var/log
    links:
      - redis
    environment:
      - ENV=local
  redis:
    image: redis:6.2
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "6379"]
      interval: 30s
      timeout: 10s
      retries: 5
    profiles:
      - local-dev
volumes:
  logvolume: {}
```


<br>

## application에서 dependency 실행 대기
* `depends_on`은 container 시작을 보장할뿐 실행 후 사용 가능할 떄 까지의 시간을 보장하지 않기 때문에 [wait-for-it](https://github.com/vishnubob/wait-for-it)이나 직접 script를 작성하여 대기 실행을 구현해줘야 한다

### [wait-for-it](https://github.com/vishnubob/wait-for-it)을 Dockerfile에 추가하여 사용
```dockerfile
...
ADD    https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /
...
```

```yaml
...
services:
  app:
    command:
      - bash
      - -c
      - |
        /wait-for-it.sh db:3306 -t 10
        java -jar app.jar
```

<br>

### script 구현
```sh
#!/bin/bash
set -e

RETRY_COUNT=30

function test_mysql {
  if [ -n "${MYSQL_USERNAME}" ] && [ -n "${MYSQL_PASSWORD}" ] && [ -n "${MYSQL_HOST}" ]; then
    /usr/bin/mysqladmin -u${MYSQL_USERNAME} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} ping --connect_timeout=10
  fi
}

function test_redis {
 if [ -n "${REDIS_HOST}" ] && [ -n "${REDIS_PORT}" ]; then
   redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" PING
 fi
}

function test_kafka {
 if [ -n "${KAFKA_PORT}" ] && [ -n "${KAFKA_HOST}" ]; then
   nmap -p "${KAFKA_PORT}" "${KAFKA_HOST}"
 fi
}

echo "Checking MySQL(${MYSQL_HOST})"

count=0
until ( test_mysql  ); do
  count=$((count+1))
  if [ ${count} -gt ${RETRY_COUNT} ]
  then
    echo "Failed to start required services."
    exit 1
  fi
  echo "Checking the services(retry = ${count})"
  sleep 5
done

echo "Checking Redis(${REDIS_HOST})"

count=0
until ( test_redis  ); do
  count=$((count+1))
  if [ ${count} -gt ${RETRY_COUNT} ]
  then
    echo "Failed to start required services."
    exit 1
  fi
  echo "Checking the services(retry = ${count})"
  sleep 5
done

echo "Checking Kafka(${MYSQL_HOST})"

count=0
until ( test_kafka  ); do
  count=$((count+1))
  if [ ${count} -gt ${RETRY_COUNT} ]
  then
    echo "Failed to start required services."
    exit 1
  fi
  echo "Checking the services(retry = ${count})"
  sleep 5
done

exec "$@"
```

```sh
## environment variables
MYSQL_HOST=xxx
MYSQL_USERNAME=xxx
MYSQL_PASSWORD=xxx
REDIS_HOST=xxx
REDIS_PORT=xxx
KAFKA_HOST=xxx
KAFKA_PORT=xxx

$ ./wait-for-deps.sh [run application]

## example
$ ./wait-for-deps.sh java -jar app.jar
```


<br><br>

> #### Reference
> * [Control startup and shutdown order in Compose](https://docs.docker.com/compose/startup-order/)
> * [vishnubob/wait-for-it](https://github.com/vishnubob/wait-for-it)
