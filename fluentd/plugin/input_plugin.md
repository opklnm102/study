# [Fluentd] About Fluentd
> date - 2022.10.23  
> keyword - fluentd, log collector  
> 사내에서 kafka의 event를 AWS S3에 적제하는 작업을 진행하면서 fluentd를 사용했다. 그래서 fluentd에 대해 정리해보고자 함  
> v1.0 기준으로 작성되었다  








Input plugin 중 하나인 in_tail에 대해 정리



## in_tail
```
<source>
  @type tail
  path /var/log/nginx/access.log
  pos_file /var/log/fluent/nginx-access.log.pos
  tag nginx.access
  <parse>
    @type nginx
  </parse>
</source>
```
* tail로 file data를 읽는다
* 파일의 시작부터 읽지 않으며, rotate되어 새로운 파일이 생성된 경우에만 처음부터 읽는다
* 해당 파일의 inode를 추적하기 때문에 `pos_file`을 사용할 경우 fluentd가 재실행되었을 때 파일의 마지막에 읽은 부분부터 다시 처리하게 된다






<br><br>

> #### Reference
> * [tail](https://docs.fluentd.org/input/tail)



## in_forward
```
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>
```

* forward라는 protocol을 사용해 TCP로 data를 수신
* 다른 Fluentd Node로 부터 data를 전달받기 위해 사용
* 전달되는 data의 format은 JSON, Messagepack
* fluentd를 multi process로 실행 했을 때는 각각의 프로세스가 동일한 forward port를 공유한다


<br><br>

> #### Reference
> * [forward](https://docs.fluentd.org/input/forward)














<br><br>

> #### Reference
> * [Input Plugins](https://docs.fluentd.org/input)
