# [Fluentd] About Fluentd
> date - 2022.10.23  
> keyword - fluentd, log collector  
> 사내에서 kafka의 event를 AWS S3에 적제하는 작업을 진행하면서 fluentd를 사용했다. 그래서 fluentd에 대해 정리해보고자 함  
> v1.0 기준으로 작성되었다  




# Outpup plugin
* `<match>` section으로 정의
* buffering, flushing 설정은 `<buffer>` 내부에 정의

* buffering, flushing에는 3가지 모드 제공
  * **Non-Buffered** mode - buffer에 담지 않고 즉시 내보낸다
  * **Synchronous Buffered** mode - `stage`라는 buffer chunk에 담고, chunk를 queue로 쌓아서 처리
  * **Asynchronous Buffered** mode - Synchronous Buffered와 동일하지만 chunk를 async로 생성
* buffer chunk에 key를 지정해 key와 동일한 이름의 데이터를 분리해 chunk에 담도록 설정할 수 있다
* 데이터를 data store로 전달
  * MongoDB
  * Amazon S3
  * ...










## output_stdout
* data를 stdout(표준 출력)으로 내보낸다
* Fluentd 초기 설정시 debugging 용도로 자주 사용
```
<match pattern>
  @type stdout
</match>
```

* sample
```
# <time> <tag> <record>
2017-11-28 11:43:13.814351757 +0900 tag: {"field1":"value1","field2":"value2"}
```






## output_forward
https://www.slideshare.net/tagomoris/f - 36page부터 참고


다른 Fluentd Node로 데이터 전달시 사용
반드시 1개 이상의 `<server>` section 필요
load balancing, fail over, replication 설정 가능

```
<match **>
  @type forward

  <server>
    name another.fluentd1
    host 127.0.0.1
    port 24224
    weight 60
  </server>

  <server>
    name another.fluentd2
    host 127.0.0.1
    port 24225
    weight 40
  </server>
</match>
```

* Load Balancing
    weight - load balancing 가중치
* Failover
    send_timeout - 데이터 전달시 timeout(default. 60s)
    hard_timeout - 데이터를 전달할 서버를 찾기 위한 timeout(default. `send_timeout`과 동일)
    heartbeat_interval - default 1s
    phi_threshold - 서버 탐지 실패시 사용할 threshold, `heartbeat_interval`보다 커야한다
* Replication
    `<secondary>` - 모든 서버를 사용할 수 없을 때 backup 설정
    [output_copy](https://docs.fluentd.org/v1.0/articles/out_copy)로 데이터를 복사해 여러 다른 output으로 전달할 수 있다



<br><br>

> #### Reference
> * [forward](https://docs.fluentd.org/output/forward)





<br><br>

> #### Reference
> * [stdout](https://docs.fluentd.org/output/stdout)





<br><br>

> #### Reference
> * [Output Plugins](https://docs.fluentd.org/output)
