# [Elastic] Elastalert - Easy & Flexible Alerting With ElasticSearch
> date - 2021.01.28  
> keyworkd - elastic, alert, elastalert  
> Elasticsearch의 data 기반으로 alerting을 할 수 있는 Elastalert에 대해 알아보자  


<br>

## About ElastAlert?
* ElasticSearch에서 특정 pattern(anomalies, spikes 등)의 data에 대한 Alerting을 위한 simple framework
* 모든 버전의 Elasticsearch에서 동작
* rule type에 맞는 usecase에 따라 작성하는데, `filter`에서 사용할 query정도만 수정하면 사용할 수 있을정도로 간단
* rule type과 alerts 2가지 component로 동작
  * Elasticsearch에 주기적으로 query하여 rule type에 전달하고, rule에 match되면 alert 발생
* rule은 query, rule type, alerts로 구성
* 중복 알람 처리 등의 정책 지정 가능
  * `realert` 사용
* ElastAlert의 status를 Elasticsearch에 저장하여 `Reliability`를 보장


<br>

## Rule Types
Elasticsearch에서 반환된 data를 처리
* Any
* Blacklist
* Whitelist
* Change
* Frequency
* Spike
* Flatline
* New Term
* Cardinality
* Metric Aggregation
* Spike Aggregation
* Percentage Match

<br>

### Any
* Match on any event matching a given filter
* query가 반환하는 모든 hit는 alert을 생성

<br>

### Blacklist
* Match when a certain field matches a blacklist
* 특정 field의 값이 blacklist에 있으면 match
* required options
  * `compare_key` - blacklist와 비교하는데 사용할 field, field가 null이면 해당 event가 무시 
  * `blacklist` - blacklist values
```yaml
blacklist:
  - value1
  - value2
  - "!file /tmp/blacklist1.txt"
  - "!file /tmp/blacklist2.txt"
```

<br>

### Whitelist
* Match when a certain field matches a whitelist
* `Blacklist`와 유사하게 동작, 특정 field가 whitelist에 포함되지 않은 경우 match
* required options
  * `compare_key` - whitelist와 비교하는데 사용할 field
  * `ignore_null` - true면 `compare_key` field가 없는 event는 무시
  * `whitelist` - whitelist values
```yaml
whitelist:
  - value1
  - value2
  - "!file /tmp/whitelist.txt"
  - "!file /tmp/whitelist.txt"
```

<br>

### Change
* Match when a field has two different values within some time
* 특정 field를 monitoring하고 변경되면 match
* required options
  * `compare_key` - 변경 사항을 monitoring할 field
  * `ignore_null` - true면 `compare_key` field가 없는 event는 무시
  * `query_key` - query key별로 적용되기 때문에 반드시 존재해야한다
* `timeframe` - 해당 기간이 지나면 `compare_key`의 이전 값을 잊어버린다

<br>

### Frequency
* Match where there are at least X events in Y time
* 주어진 timeframe에 일정 수 이상의 event가 있을 때 match
* required options
  * `num_events` - alert을 trigger하는 event 수
  * `timeframe` - `num_events`가 발생해야하는 시간
* optional options
  * `use_count_query`
    * true면 count API를 사용하여 document를 download하지 않는다
    * 수만개의 document가 예상되는 경우에 사용하여 overhead를 감소시킬 수 있다
    * `doc_type` 설정 필요
  * `doc_type`
    * 검색할 document의 `_type` 지정
  * `use_terms_query`
    * aggregation query로 `query_key`와 일치하는 document count를 조회
    * `doc_type`, `query_key` 설정 필요
  * `terms_size`
    * `use_terms_query`와 함께 사용
    * query당 반환되는 max terms count(default. 50)
  * `query_key`
    * document count는 `query_key` 마다 저장
    * `query_key`의 값이 동일하다면 `num_events` document만 alert trigger
  * `attach_related`
    * `related_event`에 관련된 event를 추가

<br>

### Spike
* Match when the rate of events increases or decreases
* 지정된 기간 동안의 event volume이 이전 기긴보다 `spike_height`만큼 크거나, 작으면 match
* `reference`, `current`라 부르는 2개의 sliding windows 사용하여 현재와 기준 빈도를 비교
* required options
  * `spike_height`
    * 이전 `timeframe` 대비 마지막 `timeframe`의 event 수 비율
  * `spike_type`
    * up - event 수가 `spike_height`배 더 높을 때 match
    * down - reference number가 current number 보다 `spike_height` 높다는 것을 의미
    * both - up, down 중 하나가 일치
  * `timeframe`
    * 해당 기간 동안 비율을 평균화
    * `hours: 1`은 current window가 current ~ 1시간 전, reference window가 1시간 전 ~ 2시간 전임을 의미
* optional options
  * ...

<br>

### Flatline
* Match when there are less than X events in Y time
* total event 수가 `timeframe` 동안 `threshold` 미만일 때 match
* required options
  * `threshold`
    * alert이 발생 기준
  * `timeframe`
    * `threshold` 확인할 기간
* optional options
  * ...

<br>

### New Term
* Match when a never before seen term appears in a field
* field에 새로운 값이 나타날 때 match
* ElastAlert 시작시 aggregation query로 field의 모든 terms을 수집
* required options
  * `fields`
    * `new_term`을 monitoring할 field list
    * 설정되지 않으면 `query_key`를 사용
* optional options
  * ...

<br>

### Cardinality
* Match when the number of unique values for a field is above or below a threshold
* timeframe 내에 특정 field의 unique value의 total count가 높거나 낮을 때 match
* required options
  * `timeframe`
    * unique value가 계산되는 기간 
  * `cardinality_field`
    * cardinality를 계산할 field
  * `max_cardinality`
    * data의 cardinality가 `max_cardinality`보다 높으면 alert trigger
  * `min_cardinality`
    * data의 cardinality가 `min_cardinality`보다 낮으면 alert trigger
* optional options
  * ...

<br>

### Metric Aggregation
* `buffer_time` 내에 metric이 threshold 보다 높거나 낮을 때 match
* required options
  * `metric_agg_key`
    * metric이 계산될 field 
  * `metric_agg_type`
    * `metric_agg_key`에서 metric aggregation할 type
    * `min`, `max`, `avg`, `sum`, `cardinality`, `value_count` 중 하나여야 한다
  * `doc_type`
    * 검색할 document의 `_type`
  * `max_threshold`
    * metrics이 `max_threshold` 보다 높으면 alert trigger
  * `min_threshold`
    * metrics이 `min_threshold` 보다 낮으면 alert trigger
* optional options
  * ...

<br>

### Spike Aggregation
* Metric Aggregation + Spike

<br>

### Percentage Match
* `buffer_time` 내 일치하는 bucket의 document 비율이 threshold보다 높거나 낮을 때 match
* required options
  * `match_bucket_filter`
    * Elasticsearch filter DSL
    * main query filter에서 반환된 document의 subset과 일치해야하는 bucket에 대한 filter를 정의
  * `doc_type`
    * 검색할 document의 `_type`
  * `min_percentage`
    * 일치하는 document의 %가 설정된 값보다 작으면 trigger
  * `max_percentage`
    * 일치하는 document의 %가 설정된 값보다 높으면 trigger
* optional options
  * ...


<br>

## Alerts

### Alert type
* Email
* Jira
* Slack
* AWS SNS
* ...


<br>

## Enhancements
* alert을 intercept하여 수정할 수 있다
* `elastalert/enhancements.py`의 `BaseEnhancement`의 subclass여야한다
```python
# DropMatchException을 사용해 충족되는 경우 drop
class MyEnhancement(BaseEnhancement):
  def process(self, match):
    # Drops a match if "field_1" == "field_2"
    if match['field_1'] == match['field_2']:
      raise DropMatchException()
```
* `match_enhancements` option으로 rule에 추가
```yaml
match_enhancements:
- module.file.MyEnhancement
```

<br>

### Example
* domain field가 있으면 domain_whois_link 추가

#### module 생성
```sh
$ mkdir elastalert_modules
$ cd elastalert_modules
$ touch __init__.py
```

#### module 작성
```python
# my_enhancements.py
from elastalert.enhancements import BaseEnhancement

class MyEnhancement(BaseEnhancement):
    def process(self, match):
        if 'domain' in match:
            url = "https://who.is/whois/%s" % (match['domain'])
            match['domain_whois_link'] = url
```

#### module을 rule configuration file에 추가
```yaml
match_enhancements:
- "elastalert_modules.my_enhancements.MyEnhancement"
```


<br>

## Example
* [example_rules](https://github.com/Yelp/elastalert/tree/master/example_rules) 참고

<br>

### Running ElastAlert for the First Time with Docker
#### Directory Structure
```
.
├── Dockerfile
├── README.md
├── config
│   └── elastalert.yaml
├── docker-entrypoint.sh
└── rules
    └── example-rule.yaml
```

#### Dockerfile
```dockerfile
FROM python:3.6.12-alpine

LABEL maintainer="opklnm102 <opklnm102@gmail.com>"

USER root

ENV ELASTALERT_VERSION 0.2.4

RUN apk --update upgrade \
      && apk add gcc libffi-dev musl-dev python3-dev openssl-dev tzdata libmagic \
      && pip install elastalert==$ELASTALERT_VERSION \
      && apk del gcc libffi-dev musl-dev python3-dev openssl-dev \
      && rm -rf /var/cache/apk/*

RUN adduser -D elastalert
WORKDIR /home/elastalert

COPY config/* config/
COPY rules/* rules/
COPY docker-entrypoint.sh ./

RUN chown -R elastalert:elastalert /home/elastalert

USER elastalert

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["elastalert", "--config=config/elastalert.yaml"]
```

#### Configuration
* [Rule Configuration Cheat Sheet](https://elastalert.readthedocs.io/en/latest/ruletypes.html?highlight=frequency#rule-configuration-cheat-sheet) 참고
```yaml
# The elasticsearch hostname for metadata writeback
# Note that every rule can have its own elasticsearch host
es_host: example.elasticsearch.com

# The elasticsearch port
es_port: 9200

# This is the folder that contains the rule yaml files
# Any .yaml file will be loaded as a rule
rules_folder: rules

# How often ElastAlert will query elasticsearch
# The unit can be anything from weeks to seconds
run_every:
  minutes: 1

# ElastAlert will buffer results from the most recent
# period of time, in case some log sources are not in real time
buffer_time:
  minutes: 15

# Optional URL prefix for elasticsearch
# es_url_prefix: elasticsearch

# Connect with TLS to elasticsearch
use_ssl: True

# Verify TLS certificates
verify_certs: True

# GET request with body is the default option for Elasticsearch.
# If it fails for some reason, you can pass 'GET', 'POST' or 'source'.
# See http://elasticsearch-py.readthedocs.io/en/master/connection.html?highlight=send_get_body_as#transport
# for details
# es_send_get_body_as: GET

# Option basic-auth username and password for elasticsearch
es_username: elastalert
es_password: xxxxxxxxxxxx

# The index on es_host which is used for metadata storage
# This can be a unmapped index, but it is recommended that you run
# elastalert-create-index to set a mapping
writeback_index: elastalert_status

# If an alert fails for some reason, ElastAlert will retry
# sending the alert until this time period has elapsed
alert_time_limit:
  days: 1

slack_webhook_url: "https://hooks.slack.com/services/xxxxxxx/xxxxxxxxx"
slack_channel_override: "#example-slack-channel"
slack_username_override: "ElastAlert"
```

#### Define Rules
```yaml
# Alert when the rate of events exceeds a threshold

# (Required)
# Rule name, must be unique
name: PaymentServiceError

# (Required)
# Type of alert.
# the frequency rule type alerts when num_events events occur with timeframe time
type: frequency

# (Required)
# Index to search, wildcard supported
index: payment-%Y.%m.%d*

use_strftime_index: true

# (Required, frequency specific)
# Alert when this many documents matching the query occur within a timeframe
num_events: 1

# (Required, frequency specific)
# num_events must occur within this amount of time to trigger an alert
timeframe:
  hours: 1

# (Required)
# A list of Elasticsearch filters used for find events
# These filters are joined with AND and nested in a filtered query
# For more info: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl.html
filter:
- query_string:
    query: 'app:"payment-service" AND log:"error"'

# (Required)
# The alert is use when a match is found
alert:
- "slack"
```

#### Run container
```sh
$ docker run opklnm102/elastalert
```


<br><br>

> #### Reference
> * [Yelp/elastalert GitHub](https://github.com/Yelp/elastalert)
> * [ElastAlert - Easy & Flexible Alerting With Elasticsearch Docs](https://elastalert.readthedocs.io/en/latest/index.html)
> * [ElastAlert: Alerting At Scale With Elasticsearch, Part 1](https://engineeringblog.yelp.com/2015/10/elastalert-alerting-at-scale-with-elasticsearch.html)
> * [ElastAlert: Alerting At Scale With Elasticsearch, Part 2](https://engineeringblog.yelp.com/2016/03/elastalert-part-two.html)
