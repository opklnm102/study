# [Cloud] What is CloudEvents
> date - 2023.01.22  
> keyworkd - cloud, cloud native, event  
> event data 표준인 CloudEvents에 대해 정리  

<br>

## CloudEvents란?
* event는 어디에나 있지만 event publisher 마다 event를 다르게 설명하기 때문에 일관성 등에 문제가 있어
일관성 있고, 일반적인 방식으로 event data를 사용할 수 있게 만든 specification
  * e.g. cloud provider 종속적이지 않은 event processing
* [CNCF(Cloud native Computing Foundation)](https://www.cncf.io/projects/cloudevents)의 project로 event identification & routing에 도움 되도록 event metadata, location을 표준화
* [Argo Events](https://github.com/argoproj/argo-events), [Debezium](https://debezium.io), [Knative Eventing](https://knative.dev/docs/eventing) 등에서 사용


<br>

## Specification
```json
{
  "specversion" : "1.0",
  "type" : "com.github.pull_request.opened",
  "source" : "https://github.com/cloudevents/spec/pull",
  "subject" : "123",
  "id" : "A234-1234-1234",
  "time" : "2018-04-05T17:31:00Z",
  "comexampleextension1" : "value",
  "comexampleothervalue" : 5,
  "datacontenttype" : "text/xml",
  "data" : "<much wow=\"xml\"/>"
}
```

<br>

### Required Attributes
| Name | Type | Description | Example |
|:--|:--|:--|:--|
| id  | String | `source` + `id`로 event 고유성 확인에 사용하므로 producer 내에서 고유한 값을 사용 | `UUID`, producer event counter |
| source | URI | event가 발생한 context를 식별 | https://github.com/cloudevents, /cloudevents/spec/pull/123 |
| specversion | String | CloudEvents version | 1.0 |
| type | String | event 유형을 설명하는 값<br>routing, observability, policy enforcement 등에 사용 | com.github.pull_request.opened, com.example.object.deleted.v2 |
> 다양한 attributes가 있으니 [CloudEvents spec](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)을 참고

<br><br>

> #### Reference
> * [cloudevents](https://cloudevents.io/)
> * [CloudEvents - Version 1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)
