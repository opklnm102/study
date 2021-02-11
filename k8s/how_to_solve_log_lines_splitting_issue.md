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
    ...
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<filter kubernetes.**>
  @type lift_json
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
    "log": "{\"@timestamp\":\"2021-02-08T19:17:14.145+09:00\",\"@version\":1,\"message\":\"aa aa aa aa\", ...\"stack_tract\":\"java.lang.IllegalAccessException: test\n\tat...",
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
* `/var/log/containers/*.log`의 raw log 확인시 짤려 있지 않다
```json
{"log":"{\"@timestamp\":\"2021-02-08T19:17:14.145+09:00\",\"@version\":1,\"message\":\"aa aa aa aa\", ...\"stack_tract\":\"java.lang.IllegalAccessException: test\n\tat... java.base/java.lang.Thread.run(Thread.java:834)\\n\"\n","stream":"stdout","time":"2021-02-08T10:49:46.744922591Z"}
```
* [log message is split when using fluentd logging driver #34620](https://github.com/moby/moby/issues/34620)를 보면 Docker chunks는 16K에서 message를 write 한다고 한다
* docker에서 16K 씩 log를 write했을 때 fluentd에서 읽기 때문에 짤려서 적재되는 것이므로 fluentd에서 [fluent-plugins-nursery/fluent-plugin-concat](https://github.com/fluent-plugins-nursery/fluent-plugin-concat)를 이용해 연결해야 한다

<br>

### Docker 18.06 이전
* `\n(newline)`을 감지하고, 분할된 log 사이에 new line을 추가하지 않는다
```conf
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/containers.log.pos
  read_from_head false
  tag kubernetes.*

  <parse>
    ...
  </parse>
</source>

## Concatenate multi-line logs (>=16KB)
<filter kubernetes.**>
  @type concat
  key log
  use_first_timestamp true
  multiline_end_regexp /\n$/  # here
  separator ""
</filter>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<filter kubernetes.**>
  @type lift_json
</filter>

<match kubernetes.**>
  ...
</match>
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

### Fluentd log driver를 사용하면 아래 설정으로 처리 가능
* [fluentd log driver. failed parse last partial message in fluentd #38951 #38952](https://github.com/moby/moby/pull/38952)
* [37889 partial metadata #38065](https://github.com/moby/moby/pull/38065)
```conf
<filter>
  @type concat
  key log
  partial_key partial_last  # here
  partial_value false  # here
  separator ""
  use_first_timestamp true
</filter>
```

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
    "@version": 1,
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

<br>

> #### Further reading
> * [Logging Architecture - Kubernetes Docs](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
