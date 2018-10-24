# [Redis] Redis install
> date - 2018.10.25  
> keyword - redis, monitoring  
> macOS에서 redis client 설치하는 법 정리

<br>

```sh
$ brew update

$ brew install redis
```

* check
```sh
# redis server stop
$ redis-cli ping
Could not connect to Redis at 127.0.0.1:6379: Connection refused

# redis server running
$ redis-cli ping
PONG
```

<br>

> #### Reference
> * [How to Install Redis on macOS El Capitan / Sierra / High Sierra / Mojave etc…](https://medium.com/@djamaldg/install-use-redis-on-macos-sierra-432ab426640e)
