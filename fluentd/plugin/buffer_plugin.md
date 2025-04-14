# [Fluentd] About Fluentd
> date - 2022.10.23  
> keyword - fluentd, log collector  
> 사내에서 kafka의 event를 AWS S3에 적제하는 작업을 진행하면서 fluentd를 사용했다. 그래서 fluentd에 대해 정리해보고자 함  
> v1.0 기준으로 작성되었다  




https://www.slideshare.net/tagomoris/fluentd-101
31page 부터 참고



### Buffer
TODO: buffer diagram image 추가

Input Data를 정의해서 받은 Data를 사용자가 작성한 규칙에 의해 필터링해서 Output으로 data를 전달한다

fluentd에선 데이터를 buffer에 담아서 처리
chunk 단위로 buffer를 구성

output할 bottom chunk가 실행되면 새로운 chunk가 queue에 쓰여진다
    실패하면 새로운 chunk가 buffer안에 푸시되지 못한다

실제로 데이터를 받아 output할 데이터를 처리하다 오류가 발생했는데, retry를 일정 시간동안 반복하는데 default가 2일 이었나...? -> 이건 좀 알아봐야 할듯


data를 fluentd로 보내면 chunk 생성
    flush_interval or buffer_chunk_limit이 초과되면 queue로 해당 데이터가 보내진다



```sh
$ ls -alh
total 256M
drwxr-xr-x. 1 fluent root   4.0K Dec 10 15:29 .
drwxr-xr-x. 1 fluent root   4.0K Dec 10 15:25 ..
-rw-r--r--. 1 fluent fluent  13M Dec 10 15:29 search.b57ca51523c982887cddaf5fa17efb144.buffer
-rw-r--r--. 1 fluent fluent   70 Dec 10 15:29 search.b57ca51523c982887cddaf5fa17efb144.buffer.meta
-rw-r--r--. 1 fluent fluent 244M Dec 10 15:29 search.q57ca50936a666008484d406857adcb00.buffer
-rw-r--r--. 1 fluent fluent   72 Dec 10 15:29 search.q57ca50936a666008484d406857adcb00.buffer.meta
```
=> limit size를 넘어가면 다른 파일을 생성한다
=> 그럼 만약 파일이 2개라면 함께 쓰는건가...?



# Buffer plugin
optional
output plugin에서 사용
input에서 넘어온 데이터를 바로 output으로 보내지 않고 buffer를 두어 throttling할 수 있다

buffer에는 chunk들의 집합을 담고 있으며, chunk는 데이터들이 저장된 하나의 Blob 파일

chunk가 가득차게 되었을 때 다음 목적지로 전달

buffer는 내부적으로 chunk를 저장하는 `stage`, 전달되기 전 대기하는 chunk를 보관하는 `queue`로 구성

tag단위로 chunk 생성

`buffer_chunk_limit`만큼 chunk가 쌓이거나 `flush_interval`에 도달하면 Queue로 전달 -> v1.0도 그런지 check



input plugin으로 수집한 데이터를 사용자가 정의한 설정에 의해 filtering 후 output plugin으로 라우팅

TODO: buffer 그림 추가 - https://docs.fluentd.org/v1.0/articles/buffer-plugin-overview


queue가 가득찰 때 2가지 모드 지원
exception
    BufferQueueLimitError 발생
block
    BufferQueueLimitError 해결시 까지 input plugin을 중지시켜 log 수집을 중지한다
다른 처리 방법으로는 Secondary output을 지정할 수 있다
    mongodb에 저장하다가 network 장애 발생시 AWS S3에 저장하고, 나중에 S3 -> mongodb로 수집하는 방식

    ```
    <match pattern>
        @type forward
        ...

        <secondary>
            @type file
            path /var/log/fluent/forward-failed
        </secondary>
    </match>
    ```



chunk 전달 실패에 대한 retry parameter
기본적으로 retry exponential backoff

retry_wait
    최초 retry 전 기다리는 시간
retry_exponential_backoff_base
    재시도 간격을 배수로 증가시키기 위한 기준
retry_type
    `exponential_backoff` - 간격을 배수로 늘려가며 재시도
    `periodic` - 주기적으로 재시도
retry_randomize
    재시도 간격은 기본적으로 random
    false로 고정시킬 수 있다

retry_max_interval
    최대 재시도 간격
retry_max_times와 retry_timeout이 초과하게 되면 queue에 있는 모든 chunk들은 제거된다
retry_timeout
retry_forever
    영원히 재시도 여부
retry_secondary_threshold
    secondary로 재시도하기 위한 threshold








<br><br>

> #### Reference
> * [Buffer Plugins](https://docs.fluentd.org/buffer)
