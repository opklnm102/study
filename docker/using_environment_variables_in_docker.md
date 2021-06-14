# [Docker] Using environment variables in Docker
> date - 2021.06.14  
> keyworkd - docker, environment variable  
> docker에서 환경 변수를 사용하는 방법을 정리  

<br>

## Docker
```sh
$ docker run -e VAR1 --env VAR2=foo --env-file ./env.list [image] [command]

## example
$ export VAR1=value1
$ export VAR2=value2

$ docker run -e VAR1 --env VAR2 ubuntu env | grep VAR
VAR1=value1
VAR2=value2
```
* `-e`, `--env` - Set environment variables
* `--env-file` - Read in a file of environment variables


<br>

## Docker Compose
* `docker-compose` command가 실행되는 directory의 `.env` 파일에서 자동으로 environment variable을 로딩하고, 해당 파일은 다른 방법으로도 로딩 가능하다
* [CLI environment variables](https://docs.docker.com/compose/reference/envvars/)의 예약어는 적용되지 않는다

<br>

### Priority 
1. Compose file - `docker-compose.yml`에 정의
2. Shell environment variables - `-e`로 정의
3. Environment file - `--env-file`로 정의
4. Dockerfile - `ENV`로 정의
5. Variable is not defined

<br>

### Using the run -e
* docker-compose command에서 환경 변수를 정의
```sh
$ docker-compose run -e [environment variable] [command]

## example
$ docker-compose run -e VAR1=value1 web python console.py
```

<br>

### Using the --env-file
* 환경 변수를 한줄에 하나씩 `variable=value` format으로 모아둔 파일을 사용

```sh
$ docker-compose --env-file [path to the file] [command]

## example
$ docker-compose --env-file ./config/.env.dev up
```

<br>

### Using the environment
* `compose.yml`에 환경 변수를 정의하여 사용
```yaml
web:
  environment:
    - VAR1=value1  # over write
    - DEBUG  # host environment variable인 DEBUG의 value를 그대로 사용
```

<br>

### Using the env_file
* 환경 변수를 모아둔 파일을 사용
```yaml
web:
  env_file:
    - ./config/.env.dev
```


<br>

## Conclusion
* Cloud native application에서 [Config - 12 Factor](https://12factor.net/ko/config)에 기반하여 설정들은 환경 변수에 셋팅하는 것을 권장하고, docker에서 설정하는 법을 알아보았다


<br><br>

> #### Reference
> * [Set environment variables - Docker Docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
> * [Environment variables in Compose - Docker Docs](https://docs.docker.com/compose/environment-variables/)
