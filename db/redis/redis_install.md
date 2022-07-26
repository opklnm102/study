# [Redis] Redis install
> date - 2018.10.25  
> keyword - redis, monitoring  
> macOS에서 redis client 설치하는 법 정리

<br>

## Install
### brew
```sh
$ brew install redis
```

<br>

### container image
* .zshrc, .bash_profile, .bashrc 등에 alias or function으로 단축키 추가
```sh
## alias
alias redis-cli="docker run -it --rm redis:3.2 rediscli"

## function
redis-cli() {
  docker run -it --rm redis:3.2 rediscli "$@"
}
```


<br>

## check
```sh
## redis server stop
$ redis-cli ping
Could not connect to Redis at 127.0.0.1:6379: Connection refused

## redis server running
$ redis-cli ping
PONG


## remote redis access
$ redis-cli -h [redis endpoint]
```


<br><br>

> #### Reference
> * [How to Install Redis on macOS El Capitan / Sierra / High Sierra / Mojave etc…](https://medium.com/@djamaldg/install-use-redis-on-macos-sierra-432ab426640e)
