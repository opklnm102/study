# [Template] Rendering templates with envsubst
> date - 2023.03.09  
> keyword - envsubst, template  
> templating에 사용할 수 있는 envsubst 정리  

<br>

## envsubst
```sh
$ envsubst [option] [shell format]
```
* shell format string에서 환경 변수를 대체한다
* `$VARIABLE` `${VARIABLE}` 패턴을 찾아 대체하고 참조될 환경 변수가 없으면 빈 문자열로 대체


<br>

## Example
### Simple
* welcome.txt으로 템플릿 작성
```
Hello user $USER. It's time to say $HELLO!
```

* 터미널에서 명령어 실행
```sh
$ export HELLO="good morning"
$ envsubst < welcome.txt
Hello user hue. It's time to say good morning!
```

* script로 실행
```sh
#!/bin/bash
HELLO="good morning"

cat welcome.txt | envsubst
```

<br>

### Nginx configuration
* nginx.conf.template
```conf
http {
  server {
    server_name ${SERVER_NAME};
    listen ${HOST}:${PORT};
    error_page 500 502 503 504 /50x.html;
    location / {
      root html;
    }
  }
}
```

```sh
#!/bin/bash
export SERVER_NAME=localhost
export HOST=127.0.0.1
export PORT=80

envsubst < nginx.conf.template > nginx.conf
```


<br><br>

> #### Reference
> * [envsubst(1) - Linux man page](https://linux.die.net/man/1/envsubst)
> * [Linux envsubst Command with Examples](https://www.baeldung.com/linux/envsubst-command)
> * [Using Environment Variables in Nginx Config File](https://www.baeldung.com/linux/nginx-config-environment-variables)
