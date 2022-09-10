# [Test] vegeta
> date - 2022.09.09  
> keyworkd - load testing  
> 구현한 서비스가 어느 정도의 부하를 견딜 수 있는지 확인하는 load testing에 사용할 수 있는 vegeta에 대해 정리  

<br>

## vegeta란?
* 일정한 속도의 HTTP request를 발생시키기 위한 HTTP load testing tool
* 초당 몇 개의 부하를 버티는지 테스트하고 싶을 때 사용
* CLI와 library 지원 
* [Apache JMeter](https://jmeter.apache.org/), [Locust](https://locust.io/), [k6](https://k6.io)와 동일한 목적으로 사용할 수 있다


<br>

## Install 
### MacOS
```sh
$ brew update && brew install vegeta
```

### Source
* library를 사용해 `go`로 기능 구현 가능
```sh
$ go get -u github.com/tsenart/vegeta
```


<br>

## Usage
```sh
$ vegeta [global flags] <command> [command flags]
```

### 1초에 5번씩 요청
```sh
$ echo "GET <endpoint>" | vegeta attack -rate=5 | vegeta report
```
* report - 결과 보기

<br>

### 10초 동안 1초에 5번씩 요청
```sh
$ echo "GET {{ endpoint }}" | vegeta attack -rate=5 -duration=10s | vegeta report
```

<br>

### 3개의 worker가 10초 동안 1초에 5번씩 요청
```sh
$ echo "GET {{ endpoint }}" | vegeta attack -max-workers=3 -duration=10s -rate=5
```
* max-workers=3 - 3개의 worker
* rate=5 - 1초에 5번
* duration=10s - 10초 동안 요청

<br>

### json format 결과 확인
```sh
$ echo "GET {{ endpoint }}" | vegeta attack -duration=5s | vegeta report -type=json > result.json
```

<br>

### Histogram format 결과 확인
```sh
$ echo "GET {{ endpoint }}" | vegeta attack -duration=5s | vegeta report -type='hist[0, 2ms, 4ms, 6ms, 8ms, 10ms]'
```

<br>

### 파일 입력 사용
```sh
$ vegeta attack -rate=5 -targets targets.txt | vegeta report
```

* targets.txt
```
GET http://user:password@goku:9090/path/to
X-Account-ID: 8675309

DELETE http://goku:9090/path/to/remove
Confirmation-Token: 90215
Authorization: Token DEADBEEF

POST http://goku:9090/things
@/path/to/newthing.json
```

* /path/to/newthing.json
```json
{
  "key1": "value1",
  "key2": "value2"
}
```

<br><br>

> #### Reference
> * [Vegeta - HTTP load testing tool and library. It's over 9000!](https://github.com/tsenart/vegeta)
> * [AWS 기반 웹 및 애플리케이션 서버 부하 테스트: A to Z](https://aws.amazon.com/ko/blogs/korea/how-to-loading-test-based-on-aws)
