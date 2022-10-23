# [Fluentd] How to extract startup time from log and separately indexing
> date - 2022.10.23  
> keyword - fluentd, log aggregator  
> Fluentd를 이용하여 log aggregator layer에서 metrics filter 기능처럼 log에서 값을 추출하여 여러 storage에 저장하는 방법을 정리  

<br>

## Issue
* JSON format의 Spring log에서 JVM running for xx.xxx의 startup time을 추출하여 Elasticsearch에 별도로 indexing 해야한다
```json
{
   "@timestamp":"2022-10-20T15:57:06.421+09:00",
   "message":"Started ApiApplication in 96.397 seconds (JVM running for 97.531)",
   "logger_name":"com.example.ApiApplication",
   "thread_name":"main",
   "level":"INFO"
}
```


<br>

## Resolve
### log message에서 startup time parsing
2가지 방법이 있다
#### 1. [record_transformer](https://docs.fluentd.org/filter/record_transformer) 사용
```conf
<label @sample>
  <filter sample>
    @type record_transformer
    enable_ruby true
    remove_keys message,logger_name,thread_name,level
    <record>
      startup_time ${record["message"].split.last.delete(')').to_f}  # message string split -> last 추출 -> ')' 제거 -> float로 변환
    </record>
  </filter>
</label>
```
* result
```
2022-10-21 08:53:00.044110000 +0000 sample: {"@timestamp":"2022-10-20T15:57:06.421+09:00","startup_time":97.531}
```

#### 2. [record_modifier](https://github.com/repeatedly/fluent-plugin-record-modifier) 사용
* `record_transformer` 보다 더 빠르다
```conf
<label @sample>
  <filter sample>
    @type record_modifier
    whitelist_keys @timestamp,startup_time  # remove_keys로 일일이 제거를 안해도 된다
      <record>
        startup_time ${record["message"].split.last.delete(')').to_f}
      </record>
  </filter>
</label>
```
* result
```
2022-10-21 09:51:35.086621900 +0000 sample: {"@timestamp":"2022-10-20T15:57:06.421+09:00","startup_time":97.531}
```

<br>

### 원본 log와 startup time log를 각각 indexing
2가지 방법이 있다

#### 1. Re-route Event to Other Label
* copy, relabel을 사용하여 event를 다른 label로 보낸다
  * [out_copy](https://docs.fluentd.org/output/copy)
  * [out_relabel](https://docs.fluentd.org/output/relabel) - tag를 다시 작성하지 않고, label에 event를 보낸다
* configuration
```conf
<label @SAMPLE>
  <match sample>
    @type copy
    <store>
      @type elasticsearch
      host <host>
      port <port>
      logstash_format true
      logstash_prefix application-log
    </store>
    <store>
      @type relabel
      @label @STARTUP_METRICS
    </store>
  </match>
</label>

<label @STARTUP_METRICS>
  <filter sample>
    @type record_modifier
    whitelist_keys @timestamp,startup_time
    <record>
      startup_time ${record["message"].split.last.delete(')').to_f}
    </record>
  </filter>

  <match sample>
    @type elasticsearch
    host <host>
    port <port>
    logstash_format true
    logstash_prefix application-startup-time
  </match>
</label>
```

#### 2. Reroute Event by Tag
* [fluent-plugin-route](https://github.com/tagomoris/fluent-plugin-route) plugin 사용
  * luent-plugin-route는 tag를 다시 작성하고 다른 match, label에 event를 다시 보낸다
* plugin 설치 필요
```sh
$ fluent-gem install fluent-plugin-route
```

* configuration
```conf
<label @SAMPLE>
  <match sample>
    @type route
    remove_tag_prefix sample
    add_tag_prefix log.event

    <route **>
      copy
    </route>
    <route **>
      copy
      @label @STARTUP_METRICS
    </route>
  </match>

  <match log.event.**>
    @type elasticsearch
    host <host>
    port <port>
    logstash_format true
    logstash_prefix application-log
  </match>
</label>

<label @STARTUP_METRICS>
  <filter log.event.**>
    @type record_modifier
    whitelist_keys @timestamp,startup_time
    <record>
      startup_time ${record["message"].split.last.delete(')').to_f}
    </record>
  </filter>

  <match log.event.**>
    @type elasticsearch
    host <host>
    port <port>
    logstash_format true
    logstash_prefix application-startup-time
  </match>
</label>
```

<br>

### Result
더 빠르다는 `record_modifier`와 relabel로 더 직관적인 `Re-route Event to Other Label`을 사용한 방법으로 결정
* full configuration
```conf
<system>
  log_level "#{ENV['LOG_LEVEL'] ? ENV['LOG_LEVEL'] : 'info'}"
</system>

## monitoring
<source>
  @type monitor_agent
  bind 0.0.0.0
  port 24220
</source>

## fluentd log
<label @FLUENT_LOG>
<match fluent.*>
@type stdout
</match>
</label>

<source>
  @type sample
  sample {"@timestamp":"2022-10-20T15:57:06.421+09:00","message":"Started ApiApplication in 96.397 seconds (JVM running for 97.531)","logger_name":"com.example.ApiApplication","thread_name":"main","level":"INFO"}
  tag sample
  @label @sample
</source>

<label @SAMPLE>
  <match sample>
    @type route
    remove_tag_prefix sample
    add_tag_prefix log.event

    <route **>
      copy
    </route>
    <route **>
      copy
      @label @STARTUP_METRICS
    </route>
  </match>

  <match log.event.**>
    @type elasticsearch
    host <host>
    port <port>
    logstash_format true
    logstash_prefix application-log
  </match>
</label>

<label @STARTUP_METRICS>
  <filter log.event.**>
    @type record_modifier
    whitelist_keys @timestamp,startup_time
    <record>
      startup_time ${record["message"].split.last.delete(')').to_f}
    </record>
  </filter>

  <match log.event.**>
    @type elasticsearch
    host <host>
    port <port>
    logstash_format true
    logstash_prefix application-startup-time
  </match>
</label>
```


<br><br>

> #### Reference
> * [Re-route Event to Other Label](https://docs.fluentd.org/configuration/routing-examples#re-route-event-to-other-label)
> * [Reroute Event by Tag](https://docs.fluentd.org/configuration/routing-examples#reroute-event-by-tag)
> * [out_copy](https://docs.fluentd.org/output/copy)
> * [out_relabel](https://docs.fluentd.org/output/relabel)
> * [out_elasticsearch](https://docs.fluentd.org/output/elasticsearch)
> * [fluent-plugin-route](https://github.com/tagomoris/fluent-plugin-route)
