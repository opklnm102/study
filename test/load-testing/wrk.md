# [Test] wrk
> date - 2023.02.06  
> keyworkd - load testing  
> Modern HTTP benchmarking tool인 wrk에 대해 정리  

<br>

## wrk란?
* 간편하게 사용 가능한 HTTP benchmarking tool
* kernel의 epoll, kqueue에 기반한 event 방식으로 동작하므로 저사양에서도 사용 가능
* `-s`로 lua script를 사용할 수 있다


<br>

## Install
```sh
$ brew install wrk
```


<br>

## Usage
```sh
$ wrk -t8 -c400 -d30s <host>

## example
$ wrk -t8 -c400 -d10s http://127.0.0.1:8080/index.html
Running 10s test @ http://127.0.0.1:8080/index.html
  8 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   248.62ms  380.97ms   1.99s    86.34%
    Req/Sec   108.32     62.62   373.00     71.48%
  8537 requests in 10.10s, 250.08MB read
  Socket errors: connect 158, read 0, write 0, timeout 218
  Non-2xx or 3xx responses: 7455
Requests/sec:    845.38
Transfer/sec:     24.76MB
```
* 8개의 thread 실행
* Http Connection 400개를 서버에 연결(thread별 50개의 connection 생성)
* 30초 동안 지속적으로 트래픽 발생
* `Stdev`가 낮을수록 `+/- Stdev`가 높을수록 응답시간이 안정적이라고 볼 수 있다


<br><br>

> #### Reference
> * [wrk - Modern HTTP benchmarking tool](https://github.com/wg/wrk)
