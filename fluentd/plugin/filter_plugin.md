# [Fluentd] About Fluentd
> date - 2022.10.23  
> keyword - fluentd, log collector  
> 사내에서 kafka의 event를 AWS S3에 적제하는 작업을 진행하면서 fluentd를 사용했다. 그래서 fluentd에 대해 정리해보고자 함  
> v1.0 기준으로 작성되었다  







# Filter plugin
* optional plugin
* `<filter>` section으로 설정하며 위에서 아래로 설정된 순서대로 filter가 적용된다
* event stream을 수정하기 위해 사용
* use case
  * 하나 이상의 필드 값을 grepping하여 event filtering
  * 새로운 필드를 추가하여 event를 풍성하게 한다
  * privacy & compliance를 위해 특정 필드를 제거하거나 masking

```
// foo.bar tag가 있는 event는 `grep` filter에 의해 message 필드에 cool이 포함된 event만 filtering되어 `record_transformer` filter로 전달되어 hostname 필드가 추가된다
<filter foo.bar>
  @type grep
  regexp1 message cool
</filter>

<filter foo.bar>
  @type record_transformer
  <record>
    hostname "#{Socket.gethostname}"
  </record>
</filter>
```







## filter_parser
* event record를 parsing하고 parsing된 결과를 다시 event에 적용
* `filter_parser`는 데이터를 파싱하기 위해 Parser plugin을 사용

```
<filter foo.bar>
  @type parser
  key_name log  # parsing할 필드명
  reserve_data true  # parsing 결과를 제외한 필드 유지 여부
  <parse>
    @type regexp
    expression /^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^ ]*) +\S*)?" (?<code>[^ ]*) (?<size>[^ ]*)$/
    time_format %d/%b/%Y:%H:%M:%S %z
  </parse>
</filter>
```

```
# input
time:
injected time (depends on your input)
record:
{"log":"192.168.0.1 - - [05/Feb/2018:12:00:00 +0900] \"GET / HTTP/1.1\" 200 777"}

# result
time
05/Feb/2018:12:00:00 +0900
record:
{"host":"192.168.0.1","user":"-","method":"GET","path":"/","code":"200","size":"777"}
```




<br><br>

> #### Reference
> * [parser](https://docs.fluentd.org/filter/parser)











## filter_grep
* 명시된 필드값에 정규표현식과 매칭되는 값만 필터링
`key` - `<regexp>` section에서 pattern을 적용할 필드명
`pattern` - 정규표현식


```
<filter foo.bar>
  @type grep

  <regexp>
    key message  # pattern이 적용되는 필드명
    pattern /cool/  # regular expression
  </regexp>

  <regexp>
    key hostname
    pattern /^web\d+\.example\.com$/
  </regexp>

  <exclude>
    key message
    pattern /uncool/
  </exclude>
</filter>
```
1. message 필드에 cool 포함
2. hostname 필드에 web<integer>.example.com과 일치
3. message 필드에 uncool을 포함하지 않음
```
# matching
{"message":"It's cool outside today", "hostname":"web001.example.com"}
{"message":"That's not cool", "hostname":"web1337.example.com"}

# mismatching
{"message":"I am cool but you are uncool", "hostname":"db001.example.com"}
{"hostname":"web001.example.com"}
{"message":"It's cool outside today"}
```





<br><br>

> #### Reference
> * [grep](https://docs.fluentd.org/filter/grep)











## filter_record_transformer
* event stream을 다양한 방식으로 변환(필드 추가, 수정, 제거)시 사용
```
<filter nginx.access.*>
  @type record_transformer
  <record>
    worker_name fluentd_multi
    tag ${tag}
    remove_keys sample
  </record>
</filter>
```
* `<record>` section 내부에 `NEW_FIELD: NEW_VALUE` format으로 새로 추가할 필드 명시
* `remove_keys` - 배열 형태로 전달된 필드들을 삭제




<br><br>

> #### Reference
> * [record_transformer](https://docs.fluentd.org/filter/record_transformer)




<br><br>

> #### Reference
> * [Filter Plugins](https://docs.fluentd.org/filter)
