# [k8s] How to solve log lines splitting issue
> date - 2021.02.10  
> keyworkd - kubernetes, docker, log, fluentd  
> Kubernetes에 구성된 log pipeline에서 간헐적으로 log가 짤려서 적재되는 이슈에 대해 정리

<br>

## Requirement

### Dependency
* Amazon EKS
  * Kubernetes version - 1.18
  * Platform version - eks.3
* Docker
```sh
$ docker version
...
Server:
 Engine:
  Version:          19.03.6-ce
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.13.4
  Git commit:       369ce74
  Built:            Fri May 29 04:01:57 2020
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.3.2
  GitCommit:        ff48f57fc83a8c44cf4ad5d672424a98ba37ded6
 runc:
  Version:          1.0.0-rc92
  GitCommit:        ff819c7e9184c13b7c2607fe6c30ae19403a7aff
 docker-init:
  Version:          0.18.0
  GitCommit:        fec3683
```
* Docker Log Driver
```sh
$ docker info --format '{{.LoggingDriver}}'

json-file
```
* Fluentd v1.11.x
```conf
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/containers.log.pos
  read_from_head false
  tag kubernetes.*

  <parse>
    @type multi_format
    
    # for docker
    <pattern>
      format json
      time_key time
      time_type string
      time_format "%Y-%m-%dT%H:%M:%S.%NZ"
      keep_time_key true
    </pattern>

    # for containerd 
    <pattern>
      format regexp
      expression /^(?<time>.+) (?<stream>stdout|stderr)( (?<logtag>.))? (?<log>.*)$/
      time_format '%Y-%m-%dT%H:%M:%S.%N%:z'
      keep_time_key true
    </pattern>
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<match kubernetes.**>
  ...
</match>
```

<br>

## Issue
* 아래와 같이 **특정 size를 넘어가면 log가 분할**되어 `Elasticsearch`에 적재되는 현상 발생
```json
{
  "_index": "test-kubernetes-2021.02.08",
  "_type": "fluentd",
  "_source": {
    "log": "{\"@timestamp\":\"2021-02-08T19:17:14.145+09:00\",\"message\":\"aa aa aa aa\", ...\"stack_tract\":\"java.lang.IllegalAccessException: test\n\tat...",
    "stream": "stdout",
    "time": "2021-02-08T10:17:14.14575541Z",
    "docker": {
      "container_id": "3739948ea3f1ffcbb77db38a236c1c2928e0b07a82ce5e62fda05f36ea3d5b8a"
    },
    "kubernetes": {
      "container_name": "test-app",
      ...
    },
    "tag": "kubernetes"
    ...
  },
  ...
}

{
  "_index": "test-kubernetes-2021.02.08",
  "_type": "fluentd",
  "_source": {
    "log": "...java.base/java.lang.Thread.run(Thread.java:834)\\n\"\n",
    "stream": "stdout",
    "time": "2021-02-08T10:17:14.14575541Z",
    "docker": {
      "container_id": "3739948ea3f1ffcbb77db38a236c1c2928e0b07a82ce5e62fda05f36ea3d5b8a"
    },
    "kubernetes": {
      "container_name": "test-app",
      ...
    },
    "tag": "kubernetes"
    ...
  },
  ...
}
```
Elasticsearch에 적재된 log에 [fabric8io/fluent-plugin-kubernetes_metadata_filter](https://github.com/fabric8io/fluent-plugin-kubernetes_metadata_filter)가 추가한 kubernetes field는 정상적인 것으로 보아 container log를 `tail`로 읽어오는 fluentd에 이슈가 있는 것으로 추정


<br>

## Resolve

### 로그 확인
#### Amazon EKS 1.21
* container runtime - docker
* `/var/log/containers/*.log`의 raw log 확인시 짤려 있지 않다
```json
{"log":"{\"@timestamp\":\"2021-02-08T19:17:14.145+09:00\",\"message\":\"aa aa aa aa\", ...\"stack_tract\":\"java.lang.IllegalAccessException: test\n\tat... java.base/java.lang.Thread.run(Thread.java:834)\\n\"\n","stream":"stdout","time":"2021-02-08T10:49:46.744922591Z"}
```

#### Amazon EKS 1.24
* container runtime - containerd
* `/var/log/containers/*.log`의 raw log 확인시 짤려 있다
```sh
# 첫번째 로그
2023-02-13T14:54:31.97498056Z stdout P {"@timestamp":"2023-02-13T23:54:31.974+09:00","message":"error...","stack_tract":"ava.lang.IllegalAccessException: test...
...

# 두번째 로그 - 첫버째 로그의 짤린 부분이 이어진다
2023-02-13T14:54:31.975032605Z stdout F tpMethodFilter.java:93)\n\tat org.springframework.web.
...
java.base/java.lang.Thread.run(Thread.java:834"}
```

* log format을 보면 docker에서는 json parser에 의해, containerd에서는 regexp parser에 의해 parsing
* [log message is split when using fluentd logging driver #34620](https://github.com/moby/moby/issues/34620), [Docker Partial Message Use Case](https://docs.fluentbit.io/manual/pipeline/filters/multiline-stacktrace#docker-partial-message-use-case)를 보면 container runtime(e.g. docker, containerd)의 로그를 사용하는 경우 16KB 제한을 초과하여 분할된다
  * application에서 100,000개의 로그 라인을 보내면 7개의 부분 메시지로 분할되어 저장된다
  * read/write에 영향을 받으므로 json format으로 하나의 json으로 저장되도 read시에 16KB씩 분할되어 읽어지고, write시에도 16KB씩 분할되어 저장된다
* [fluent-plugins-nursery/fluent-plugin-concat](https://github.com/fluent-plugins-nursery/fluent-plugin-concat)를 이용해 연결해주면 된다
* concat filter가 multiline의 끝을 인식하지 못하면 flush timeout error가 발생하므로 log format에 맞춰서 설정해줘야한다
```sh
2023-02-01 06:29:57 +0000 [warn]: #0 dump an error event: error_class=Fluent::Plugin::ConcatFilter::TimeoutError error="Timeout flush: kubernetes.var.log.containers.
...
2023-02-01 06:29:57 +0000 [info]: #0 Timeout flush: kubernetes.var.log.containers.
...
```

<br>

### Docker 18.06 이전
* json format으로 logging되며 아래 설정한 json parser에 의해 parsing 된다
```sh
{"log":"[2023-02-01 06:03:37,190] INFO [GroupMetadataManager brokerId=1004] Removed 0 expired offsets in 0 milliseconds. (kafka.coordinator.group.GroupMetadataManager)\n","stream":"stdout","time":"2023-02-01T06:03:37.191058367Z"}
```

* `\n(newline)`을 감지하고, 분할된 log 사이에 new line을 추가하지 않는다
```conf
<source>
  ...
  <parse>
    @type multi_format
    
    # for docker
    <pattern>
      format json
      time_key time
      time_type string
      time_format "%Y-%m-%dT%H:%M:%S.%NZ"
      keep_time_key true
    </pattern>
  </parse>
</source>

## Concatenate multi-line logs (>=16KB)
<filter kubernetes.**>
  @type concat
  key log  # parser에서 처리된 log를 key로 인식
  use_first_timestamp true
  multiline_end_regexp /\n$/  # here
  separator ""
</filter>
```

<br>

### Docker 19.03+
* `use_partial_metadata`를 감지하고, 분할된 log 사이에 new line을 추가하지 않는다  
```conf
<filter>
  @type concat
  key log
  use_partial_metadata true  # here
  separator ""
</filter>
```

<br>

### containerd/cri in Kubernetes
* Amazon EKS 1.24부터 containerd를 container runtime으로 사용
* cri log format으로 logging되며 regexp parser에 의해 parsing 된다
```conf
<source>
  @type tail
  path /var/log/containers/*.log
  tag k8s
  @label @CONCAT
  <parse>
    @type regexp
    expression /^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<message>.*)$/
    time_format %Y-%m-%dT%H:%M:%S.%L%z
  </parse>
</source>

<label @CONCAT>
  ## Concatenate multi-line logs (>=16KB)
  <filter k8s>
    @type concat
    key message  # regexp parser에서 처리된 message를 key로 인식
    separator ""

    # fluent-plugin-concat 2.5.0 사용할 경우
    use_partial_cri_logtag true  # here
    partial_cri_logtag_key logtag  # here
    partial_cri_stream_key stream  # here

    # fluent-plugin-concat 2.4.0 사용할 경우
    partial_key logtag
    partial_value P
  </filter>
  <match k8s>
    @type relabel
    @label @OUTPUT
  </match>
</label>

<label @OUTPUT>
  <match>
    @type stdout
  </match>
</label>
```

#### CRI log format
* [Support containerd log format #412](https://github.com/fluent/fluentd-kubernetes-daemonset/issues/412#issuecomment-636536767), [kubelet의 log 관련 코드](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kuberuntime/logs/logs.go#L125-L169), [CRI-O의 로그 관련 코드](https://github.com/cri-o/cri-o/blob/f58419d6cf462070a0c3727ad2dc554ef151e832/conmon/conmon.c#L499-L509)를 보면 CRI는 모든 log line이 `timestamp, stream, logtag message` format 남는다
```sh
2016-10-06T00:17:09.669794202Z stdout P log content 1-1
2016-10-06T00:17:09.669794203Z stdout F log content 1-2
2016-10-06T00:17:09.669794203Z stderr F log content 2

## example
2023-01-31T22:46:07.635701791Z stdout F [2023-01-31 22:46:07,635] INFO [GroupMetadataManager brokerId=1001] Removed 0 expired offsets in 0 milliseconds. (kafka.coordinator.group.GroupMetadataManager)
```
* log buffer(16KB)의 로그를 저장할 때 newline으로 끝나지 않으면 logtag를 `P`로 저장
  * P - partial log가 있음을 의미
  * F - log의 마지막 부분임을 의미
* logtag P를 만나면 다음 F를 만날 때 까지 로그를 붙여줘야한다는 의미


<br>

### Result
```json
{
  "_index": "test-kubernetes-2021.02.08",
  "_type": "fluentd",
  "_source": {
    "stream": "stdout",
    "time": "2021-02-08T10:49:46.744922591Z",
    "docker": {
      "container_id": "3739948ea3f1ffcbb77db38a236c1c2928e0b07a82ce5e62fda05f36ea3d5b8a"
    },
    "kubernetes": {
      "container_name": "test-app",
      ...
    },
    "@timestamp": "2021-02-08T19:49:46.744+09:00",
    "message": "aa aa aa",
    "logger_name": "com.xxxx.xxxController",
    "thread_name": "http-nio-8080-exec-3",
    "level": "ERROR",
    "level_value": 40000,
    "stack_trace": "java.lang.IllegalAccessException: test\n\tat... java.base/java.lang.Thread.run(Thread.java:834)\\n\"\n", 
    "tag": "test-kubernetes"
  },
  ...
}
```


<br>

## Docker log driver 확인하는 방법
* [Configure logging drivers](https://docs.docker.com/config/containers/logging/configure/)
```sh
$ sudo docker info --format '{{.LoggingDriver}}'

json-file
```


<br>

## Conclusion
* Docker에서 container의 stdout에 write하는 log를 node에 write하는 chunk size는 16K
* 16K보다 큰 log는 log driver or log service에서 결합해줘야 한다


<br><br>

> #### Reference
> * [Configure logging drivers](https://docs.docker.com/config/containers/logging/configure/)
> * [Make the log lines splitting configurable #34855](https://github.com/moby/moby/issues/34855)
> * [log message is split when using fluentd logging driver #34620](https://github.com/moby/moby/issues/34620)
> * [Supporting docker log splitting in Kubernetes logging integrations #52444](https://github.com/kubernetes/kubernetes/issues/52444)
> * [fluent-plugins-nursery/fluent-plugin-concat](https://github.com/fluent-plugins-nursery/fluent-plugin-concat)
> * [fluentd log driver. failed parse last partial message in fluentd #38951 #38952](https://github.com/moby/moby/pull/38952)
> * [37889 partial metadata #38065](https://github.com/moby/moby/pull/38065)
> * [fabric8io/fluent-plugin-kubernetes_metadata_filter](https://github.com/fabric8io/fluent-plugin-kubernetes_metadata_filter)
> * [Support containerd log format #412](https://github.com/fluent/fluentd-kubernetes-daemonset/issues/412#issuecomment-636536767)
> * [kubelet의 log 관련 코드](https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/kuberuntime/logs/logs.go#L125-L169)
> * [CRI-O의 로그 관련 코드](https://github.com/cri-o/cri-o/blob/f58419d6cf462070a0c3727ad2dc554ef151e832/conmon/conmon.c#L499-L509)

<br>

> #### Further reading
> * [Logging Architecture - Kubernetes Docs](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
