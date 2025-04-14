# [Fluentd] About Fluentd
> date - 2022.10.23  
> keyword - fluentd, log collector  
> 사내에서 kafka의 event를 AWS S3에 적제하는 작업을 진행하면서 fluentd를 사용했다. 그래서 fluentd에 대해 정리해보고자 함  
> v1.0 기준으로 작성되었다  



# Parser plugin
* optional plugin
* 전달 받은 데이터를 파싱하기 위해 `<parse>` section 사용
* `<source>`(input plugin), `<match>`(output plugin), `<filter>`(filter plugin) 내부에 정의
* plugins
  * regexp
  * apache2
  * nginx
  * syslog
  * csv
  * tsv
  * json
  * none




## parser_regexp 
```
<parse>
  @type regexp
  expression /^\[(?<logtime>[^\]]*)\] (?<name>[^ ]*) (?<title>[^ ]*) (?<id>\d*)$/
  time_key logtime
  time_format %Y-%m-%d %H:%M:%S %z
  types id:integer
</parse>
```

```
# input
[2013-02-28 12:00:00 +0900] alice engineer 1

# result
time:
1362020400 (2013-02-28 12:00:00 +0900)

record:
{
  "name" : "alice",
  "title": "engineer",
  "id"   : 1
}
```

* 정규 표현식으로 데이터를 파싱할 수 있는 Parser
* `expression`에 정규표현식 명시
  * 반드시 최소 1개 이상의 named capture(?<NAME>PATTERN)가 있어야한다
* `time_key`를 통해 event time으로 사용할 필드를 지정할 수 있다
* `time_format`으로 format 지정
* `timezone`으로 timezone 설정
* [fluentular](https://fluentular.herokuapp.com), [regex101](https://regex101.com)에서 정규 표현식이 원하는대로 작동하는지 확인할 수 있다

<br><br>

> #### Reference
> * [regexp](https://docs.fluentd.org/parser/regexp)





## parser_none
```
<parse>
  @type none
  message_key message  // default
</parse>
```

```
# input
Hello world. I am a line of log!

# result
time:
1362020400 (current time)

record:
{"message":"Hello world. I am a line of log!"}
```
* `message_key`에 정의된 단일 필드를 사용하여 라인을 있는 그대로 parsing하며 data의 parsing/structuring을 연기하기 위한 것
* data를 필터/가공하지 않고 다음 plugin이나 다른 Fluentd Node로 전달시 사용
* output plugin에서 [string_value](https://docs.fluentd.org/formatter/single_value) formaater와 함께 자주 사용된다




<br><br>

> #### Reference
> * [none](https://docs.fluentd.org/parser/none)




<br><br>

> #### Reference
> * [Config: Parse Section](https://docs.fluentd.org/configuration/parse-section)
> * [Parser Plugins](https://docs.fluentd.org/parser)
