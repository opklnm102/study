# [Nginx] alert setrlimit(RLIMIT_NOFILE, n) failed (1: Operation not permitted)
> date - 2021.05.26  
> keyworkd - nginx, file limit  
> nginx에서 나온 setrlimit(RLIMIT_NOFILE) alert을 해결한 과정을 정리  

<br>

## Requirement

### Dependency
```
Nginx 1.20.1
```


<br>

## Issue
Nginx에서 아래와 같은 alert log를 확인하여 원인을 살펴보게 되었다
```sh
2021/05/25 06:17:15 [alert] 6#6: setrlimit(RLIMIT_NOFILE, 100000) failed (1: Operation not permitted)
2021/05/25 06:17:15 [alert] 7#7: setrlimit(RLIMIT_NOFILE, 100000) failed (1: Operation not permitted)
...
```


<br>

## Resolve
### 1. OS open file limit 확인
```sh
$ cat /proc/sys/fs/file-max
3235996

$ ulimit -a | grep 'open files'
open files                      (-n) 1048576
```
* `ulimit -a`로 확인할 수 있는 OS limit를 넘으면 `(24: Too many open files)`가 발생하나 이번 case와는 다르다

<br>

### Nginx configuration 확인
```conf
user nginx;
worker_rlimit_nofile 100000;
...
```
* `worker_rlimit_nofile`는 worker process의 maximum number of open files(RLIMIT_NOFILE) 설정으로 이것이 원인인 것으로 확인되어 증가시켜주고 해결!

<br>

> #### Recommended worker_rlimit_nofile?
> [Nginx worker_rlimit_nofile](https://stackoverflow.com/questions/37591784/nginx-worker-rlimit-nofile)에서 `worker_rlimit_nofile`의 권장하는 값을 확인
> ```
> worker_rlimit_nofile = (worker_connections x worker_processes) x 2
> ```
> 각 connection은 client와 proxy server로 2개의 file descriptor를 사용하기 때문에 위와 같이 설정해준다


<br><br>

> #### Reference
> * [worker_rlimit_nofile - Nginx Docs](http://nginx.org/en/docs/ngx_core_module.html#worker_rlimit_nofile)
> * [Nginx worker_rlimit_nofile](https://stackoverflow.com/questions/37591784/nginx-worker-rlimit-nofile)
