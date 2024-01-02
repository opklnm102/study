# [Fluentd] CRI log pattern not matched issue
> date - 2024.01.02  
> keyword - fluentd, opensearch  
> 2023-06-25에 발생한 fluentd에서 opensearch로 로그 저장 장애 troubleshooting 내용 정리    

<br>

## Requirement

### Dependency
| Name | Version |
|:--|:--|
| [Fluentd](https://www.fluentd.org) | v1.15.2 |
| [fluent-plugin-opensearch](https://github.com/fluent/fluent-plugin-opensearch) | v1.0.8 |

### Log pipeline
```
fluentd(collector) -> kafka -> fluentd(aggregator) -> opensearch
```


<br>

## Issue
* fluent-plugin-opensearch를 이용한 Opensearch에 로그 저장이 불가한 장애가 발생


<br>

## Why?


### 왜 로그가 적재되고 있지 않았을까?
* log
```sh
2023-06-25 08:12:47 +0000 [warn]: #0 dump an error event: error_class=ArgumentError error="string length (321) exceeds the limit 128" location="/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:592:in `parse'" tag="opensearch_plugin.output.time.error" time=2023-06-25 08:12:47.973902579 +0000 record={"tag"=>"kubernetes", "time"=>2023-06-25 08:12:13.696079846 +0000, "format"=>nil, "value"=>"2023-06-25T07:33:47.703621806Z stdout F 2023-06-25 07:33:47 +0000 [warn]: #0 dump an error event: error_class=Fluent::Plugin::OpenSearchErrorHandler::OpenSearchError error=\"400 - Rejected by OpenSearch\" location=nil tag=\"kubernetes\" time=2023-06-25 07:32:36.400725967 +0000 record={\"time\"=>\"2023-06-25T07:20:29.254029757Z"}
 
2023-06-25 08:12:47 +0000 [warn]: #0 dump an error event: error_class=Fluent::Plugin::OpenSearchErrorHandler::OpenSearchError error="400 - Rejected by OpenSearch" location=nil tag="kubernetes" time=2023-06-25 08:12:12.283460139 +0000 record={"time"=>"2023-06-25T07:33:53.065857437Z stdout F 2023-06-25 07:33:53 +0000 ...}
```

* [fluent-plugin-opensearch out_opensearch.rb L592](https://github.com/fluent/fluent-plugin-opensearch/blob/v1.0.8/lib/fluent/plugin/out_opensearch.rb#L592C5-L592C32)를 보면 DateTime.parse()에서 에러 발생
```ruby
Proc.new { |value|
  value = convert_numeric_time_into_string(value) if value.is_a?(Numeric)
  DateTime.parse(value)  // here
}
```


* kafka의 kubernetes topic에 time 필드가 이상한 데이터가 해당 시간대에 다수 적재되어 있는 것을 확인
```json
{
   "time":"2023-06-25T07:13:06.655286035Z stdout F 2023-06-25 07:13:06 +0000 [warn]: #0 dump an error event: error_class=ArgumentError error=\"string length (319) exceeds the limit 128\" location=\"/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:592:in `parse'\" tag=\"opensearch_plugin.output.time.error\" time=2023-06-25 07:13:06.655103727 +0000 record={\"tag\"=>\"kubernetes\", \"time\"=>2023-06-25 07:13:05.228516541 +0000, \"format\"=>nil, \"value\"=>\"2023-06-25T07:13:00.6331179Z",
   "stream":"stdout",
   "log":"2023-06-25 07:13:00 +0000 [warn]: #0 dump an error event: error_class=Fluent::Plugin::OpenSearchErrorHandler::OpenSearchError error=\\\"400",
}
```
* kafka에 time 필드가 이상한 데이터를 fluentd가 opensearch로 indexing 과정에서 ArgumentError가 발생하고 이 로그는 다시 fluentd가 읽어서 kafka로 보내고 이게 반복되어 opensearch로 적재될 수 없는 로그가 대량으로 발생

<br>

### 왜 Kafka kubernete topic에 time 필드가 이상한 데이터가 들어갔을까?
* fluentd에서 의심되는 로그를 발견
```sh
2023-06-25 07:12:31 +0000 [warn]: #0 pattern not matched: "2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1,...}"
```

#### 설정
* multi_format parser를 사용 중
* json parser는 k8s 1.24 이전에 container runtime으로 docker를 사용했을 때의 log를 위한 parser
* regexp parser는 k8s 1.24에 container runtime으로 containerd(CRI format)를 사용했을 때의 log를 위한 parser
```conf
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/es-containers.log.pos
  read_from_head false
  tag kubernetes.*
 
  <parse>
    @type multi_format
 
    <pattern>
      format json
      time_key time
      time_type string
      time_format "%Y-%m-%dT%H:%M:%S.%NZ"
      keep_time_key true
    </pattern>
 
    <pattern>
      format regexp
      expression /^(?<time>.+) (?<stream>stdout|stderr)( (?<logtag>.))? (?<log>.*)$/
      time_format '%Y-%m-%dT%H:%M:%S.%N%:z'
      keep_time_key true
    </pattern>
  </parse>
</source>
```

* fluentd에서 의심되는 로그가 실제로 node의 /var/log/containers/ 에 파일로 다음과 같이 쌓인다
```sh
2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1,...}
```

* 그러면 최초 log를 보면 다음과 같다
```sh
{\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1,...}
```

* 최초 log가 CRI log로 저장되면(이후 최초 CRI log라 명명)
```sh
2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1...}
```

* 이걸 fluentd가 읽으면 pattern not matched warning 발생(이후 pattern not matched log라 명명)
```sh
2023-06-28 04:55:08 +0000 [warn]: #0 pattern not matched: "2023-06-25T07:12:31Z stdout F {\\\"@timestamp\\\":\\\"2023-06-25T16:12:30.999+09:00\\\",\\\"@version\\\":1,...}"
```

* 위의 log가 CRI log로 저장되면(이후 pattern not matched CRI log라 명명)
```sh
2023-06-24T04:00:11.547070667Z stdout F 2023-06-25 07:12:31 +0000 [warn]: #0 pattern not matched: "2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1,...}"
```

* 이걸 fluentd가 읽어 kafka에 아래와 같이 time 필드가 오염된 상태로 들어가고, consume하여 opensearch로 indexing할 때 DateTime.parse()에서 ArgumentError 발생
```json
{
   "time":"2023-06-24T04:00:11.547070667Z stdout F 2023-06-25 07:12:31 +0000 [warn]: #0 pattern not matched: \"2023-06-25T07:12:31Z",  // here
   "stream":"stdout",
   "log":"{\\\"@timestamp\\\...."]}"
}
```

<br>

### 왜 fluentd는 kafka에 time 필드가 오염된 데이터를 적재했을까?
log를 제대로 parsing하는지 비교해보자

| regex	| log |	parsing result |	Etc |
|:--|:--|:--|:--|
| /^(?<time>.+) (?<stream>stdout\|stderr)( (?<logtag>.))? (?<log>.*)$/ 	| 최초 CRI log | 	정상 | 현재 사용 중 | 
| | pattern not matched CRI log	|  time 필드 비정상 | | 
| /^(?<time>.+?) (?<stream>stdout\|stderr) [^ ]* (?<log>.*)$/ | 최초 CRI log | 정상 | |
| | pattern not matched CRI log	| 정상 | | 	
| /^(?<time>[^ ]+) (?<stream>stdout\|stderr) (?<logtag>[^ ]*) (?<log>.*)$/	| 최초 CRI log	| 정상	| | 
| | pattern not matched CRI log	| 정상 | |

정리해보면 현재 사용 중인 regex는 최초 CRI log에는 문제가 없지만 파생된 2번째 CRI log에서는 문제가 있음을 확인

<br>

### 왜 최초 log를 parsing하지 못하여 pattern not matched가 발생 했을까?
* 다시 최초 CRI log 봐보자
```sh
2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1...}
```
* 다른 CRI log를 봐보자
```sh
2023-06-24T04:00:11.547070667Z stdout F 2023-06-25 07:12:31 +0000 [warn]: #0 pattern not matched: "2023-06-25T07:12:31Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1,...}"
```
* 위 log들의 time format이 다른것을 확인할 수 있다
  * 최초 CRI log -> 2023-06-25T07:12:31Z
  * 다른 CRI log -> 2023-06-24T04:00:11.547070667Z
* 현재 사용하는 time format은 time_format '%Y-%m-%dT%H:%M:%S.%N%:z'로 fractional seconds(초 단위 이하의 시간, ms부터)까지 처리하고 있는데 fractional seconds가 생략되어 pattern not matched 가 발생한 것
* time format에 맞게 2023-06-25T07:12:31Z -> 2023-06-25T07:12:31.123456789Z로 수정 후 정상 동작을 확인
```sh
2023-06-25T07:12:31.123456789Z stdout F {\"@timestamp\":\"2023-06-25T16:12:30.999+09:00\",\"@version\":1....
```
CRI logging시에 [src/time/format.go L128 stdFracSecond9](https://go.googlesource.com/go/+/refs/tags/go1.14.5/src/time/format.go#128)를 사용하게 되면 마지막 자리의 0은 생략하게되고, 우연하게 2023-06-25T07:12:31.000000000Z에 logging하면 2023-06-25T07:12:31Z로 저장한다
```go
...
stdFracSecond0                                 // ".0", ".00", ... , trailing zeros included
stdFracSecond9                                 // ".9", ".99", ..., trailing zeros omitted
...
```
관련해서 [Container logs with timestamp are getting trailing zeroes trimmed #72292](https://github.com/kubernetes/kubernetes/issues/72292) 이슈가 있고, 패치는 되었다고하는데... 현재 EKS v1.24.14-eks-c12679a 사용 중


<br>

## Resolve
* regexp parser의 regex 수정
```
/^(?<time>.+) (?<stream>stdout|stderr)( (?<logtag>.))? (?<log>.*)$/    ->    /^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<log>.*)$/
```

<br>

### +@ 변경 사항
* 불필요한 docker log format을 위한 parser 제거
* opensearch에 stack_trace가 하나의 document로 저장되게 fluentd log format json으로 변경

<br>

### As-is
```conf
<system>
  log_level "#{ENV['LOG_LEVEL'] ? ENV['LOG_LEVEL'] : 'info'}"
</system>
...
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/containers.log.pos
  read_from_head false
  tag kubernetes.*
 
  <parse>
    @type multi_format
 
    <pattern>
      format json
      time_key time
      time_type string
      time_format "%Y-%m-%dT%H:%M:%S.%NZ"
      keep_time_key true
    </pattern>
 
    <pattern>
      format regexp
      expression /^(?<time>.+) (?<stream>stdout|stderr)( (?<logtag>.))? (?<log>.*)$/
      time_format '%Y-%m-%dT%H:%M:%S.%N%:z'
      keep_time_key true
    </pattern>
  </parse>
</source>
```

<br>

### To-be
```conf
<system>
  log_level "#{ENV['LOG_LEVEL'] ? ENV['LOG_LEVEL'] : 'info'}"
  <log>
    format json
  </log>
</system>
...
 
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/containers.log.pos
  read_from_head false
  tag kubernetes.*
 
  <parse>
    @type regexp
    expression /^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<log>.*)$/
    time_format '%Y-%m-%dT%H:%M:%S.%N%:z'
    keep_time_key true
  </parse>
</source>
```


<br><br>

> #### Reference
> * [fluent-plugin-opensearch out_opensearch.rb L592](https://github.com/fluent/fluent-plugin-opensearch/blob/v1.0.8/lib/fluent/plugin/out_opensearch.rb#L592C5-L592C32)
> * [Support containerd log format #412 - fluentd-kubernetes-daemonset](https://github.com/fluent/fluentd-kubernetes-daemonset/issues/412#issuecomment-1192725531)
> * [src/time/format.go L128 stdFracSecond9](https://go.googlesource.com/go/+/refs/tags/go1.14.5/src/time/format.go#128)
> * [Container logs with timestamp are getting trailing zeroes trimmed #72292](https://github.com/kubernetes/kubernetes/issues/72292)
