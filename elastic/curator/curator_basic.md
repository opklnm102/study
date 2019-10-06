# [Elastic] Curator Basic
> date - 2019.10.06  
> keyworkd - elasticsearch, elastic  
> elasticsearch의 index 정리를 위해 주로 사용하는 curator에 대해 정리  
> Elastic Curator 5.8 기준

<br>

## Curator란?
* Elasticsearch의 **index curate(manage) tool**
* 매일 index를 create, backup, delete해야 할 때 curator로 해당 프로세스를 자동화할 수 있다
  * e.g. log를 1달 이상 Elasticsearch에 보관하지 않는 경우 disk space 확보를 위해 index 삭제가 필요한 경우
* **curator의 다양한 filter**로 60일 이전에 생성된 index, 완료되지 않은 snapshot 등 **특정 기준에 맞는 index와 snapshot을 찾는데 유용**
* CLI tool과 [API](https://curator.readthedocs.io/en/latest/)를 제공

<br>

### Curator CLI
```sh
$ curator [--config CONFIG.yml] [--dry-run] ACTION_FILE.yml

## example
$ curator --help
Usage: curator [OPTIONS] ACTION_FILE

  Curator for Elasticsearch indices.

  See http://elastic.co/guide/en/elasticsearch/client/curator/current

Options:
  --config PATH  Path to configuration file. Default: ~/.curator/curator.yml
  --dry-run      Do not perform any changes.
  --version      Show the version and exit.
  --help         Show this message and exit.
```
* `--config CONFIG.yml` - 설정 파일(default. ~/.curator/curator.yml
* `--dry-run` - ACTION_FILE.YML을 simulate 하고, 결과는 log file 또는 stdout로 출력

<br>

### Curator API
* Curator CLI와 동일한 코드를 사용하고, 내부적으로 [Elasticsearch Python API](https://www.elastic.co/guide/en/elasticsearch/client/python-api/current/index.html)를 사용
* **Curator API와 Elasticsearch Python API를 사용해 다양한 작업을 수행하는 script를 작성**할 수 있다

<br>

### Curator로 할 수 있는 것
* Add/remove indices from an alias
  * [alias](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/alias.html) action 사용
* Change shard routing allocation
  * [allocation](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/allocation.html) action 사용
* Close indices
  * [close](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/close.html) action 사용
* Create index
  * [create index](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/create_index.html) action 사용
* Delete indices
  * [delete indices](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/delete_indices.html) action 사용
* Delete snapshots
  * [delete snapshots](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/delete_snapshots.html) action 사용
* Open closed indices
  * [open](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/open.html) action 사용
* forceMerge indices
  * [forcemerge](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/forcemerge.html) action 사용
* reindex indices, including from remote clusters
  * [reindex](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/reindex.html) action 사용
* Change the number of replicas per shard for indices
  * [replicas](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/replicas.html) action 사용
* rollover indices
  * [rollover](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/rollover.html) action 사용
* Take a snapshot(backup) of indices
  * [snapshot](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/snapshot.html) action 사용
* Restore snapshots
  * [restore](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/restore.html) action 사용


<br>

## curator and ILM(Index Lifecycle Management)

### ILM
* 시간에 따른 index 관리를 자동화
  * index의 **time-oriented phase에 따라 policy 적용**
  * curator의 동작 방식인 execution time analysis보다 나은 방법
* shard size 및 performance 등의 기준으로 작업을 수행할 수 있다
* [Managing the index lifecycle - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html)
* Elasticsearch 6.6부터 basic license로 제공

#### ILM Actions
* time-oriented phases
  * Hot
  * Warm
  * Cold
  * Delete
* policy actions
  * Set Priority
  * Rollover
  * Unfollow
  * Allocate
  * Read-Only
  * Force Merge
  * Shrink
  * Freeze
  * Delete

<br>

### ILM or curator
* 많은 Elastic Stack component가 기본적으로 ILM을 사용하므로 **curator보다는 ILM 사용 권장**

<br>

### ILM and curator
* 함께 사용 가능
* curator는 ILM policy와 충돌하지 않도록 ILM policy에 연관된 index는 제외하고 동작
  * `allow_ilm_indices` 설정으로 제어


<br>

## Install curator
* [Installation - Curator Docs](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/installation.html)에 pip 등을 활용한 설치 방법이 나오지만 여기서는 docker를 사용

### Dockerized
* official image는 [진행 중](https://github.com/elastic/curator/issues/528)이므로 [elastic/curator](https://github.com/elastic/curator)의 Dockerfile로 직접 build하거나 [bobrik/curator](https://hub.docker.com/r/bobrik/curator)를 사용

```sh
$ docker run --rm opklnm102/dockerized-curator:latest --help
Usage: curator [OPTIONS] ACTION_FILE
...
```


<br>

## Configuration

### Environment Variables
* runtime시 `configuration file`, `action file`에서 environment variable로 대체 된다
```
${VAR}

## default value 설정
${VAR:default_value}
```

<br>

#### Example
| Config source | Environment setting | Config after replacement |
|:--|:--|:--|
| unit: ${UNIT} | export UNIT=days | unit: days |
| unit:: ${UNIT} | - | unit: |
| unit: ${UNIT:days} | - | unit: days |
| unit: ${UNIT:days} | export UNIT=hours | unit: hours

<br>

> #### Unsupported use cases
> * value는 반드시 environment variable를 사용
> * 아래와 같은 text 조합은 지원하지 않는다
> ```
> logfile: ${LOGPATH}/extra/path/information/file.log
> ```

<br>

### Action File
```yaml
actions:
  1:
    action: ACTION1  # curator가 index에서 수행할 작업
    description: OPTIONAL DESCRIPTION  # action, filter로 수행할 작업을 설명(optional)
    options:  # action에서 사용될 설정
      option1: value1
      ...
      optionN: valueN
      continue_if_exception: False
      disable_action: True
    filters:  # 조건에 맞는 index, snapshot를 선택하기 위해 사용
    - filtertype: *first*
      filter_element1: value1
      ...
      filter_elementN: valueN
    - filtertype: *second*
      filter_element1: value1
      ...
      filter_elementN: valueN
  2:
    action: ACTION2
    ...
  3:
  ...
```
* root key `actions` 하위 숫자 아래에 `action` 정의
* 각 action은 순서대로 완료된 후 수행된다
* `alias action`은 `add`, `remove`의 추가 high-level element가 있다


<br>

## Configuring
```yaml
client:
  hosts:
    - 127.0.0.1  # 127.0.0.1:9200을 사용
    - 10.0.0.1:9201
  port: 9200  # default. 9200
  url_prefix:
  use_ssl: False  # default. False
  certificate: /path/to/file  # CA certificate
  client_cert: /path/to/file  # client certificate(public key)
  client_key: /path/to/file  # client key(private key)
  aws_key:  # AWS IAM access key
  aws_secret_key:  # AWS IAM secret access key
  aws_region: 
  aws_sign_request:
  ssl_no_validate: False
  http_auth: user:passward
  timeout: 30
  master_only: False

logging:
  loglevel: INFO  # CRITICAL, ERROR, WARNING, INFO(default), DEBUG
  logfile: /path/to/file
  logformat: default  # default, json, logstash
  blacklist: ['elasticsearch', 'urllib3']  # logging에서 제외
```

### logformat
* default
```
2016-04-22 11:53:09,972 INFO      Action #1: ACTIONNAME
```
* json, logstash
```
{"@timestamp": "2016-04-22T11:54:29.033Z", "function": "cli", "linenum": 178,
"loglevel": "INFO", "message": "Action #1: ACTIONNAME", "name": "curator.cli"}
```


<br>

## [Define Action](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/actions.html)
* curator가 index에서 수행할 작업 정의
  * Alias
  * Allocation
  * Close
  * Cluster Routing
  * Create Index
  * Delete Indices
  * Delete Snapshots
  * Forcemerge
  * Index Settings
  * Open
  * Reindex
  * Replicas
  * Restore
  * Rollover
  * Shrink
  * Snapshot
* 생성된 snapshot은 삭제만 할 수 있다

```yaml
actions:
  1:
    action: delete_indices
    description: >-
      Delete indices older than 10 days (based on index name), for logstash-
      prefixed indices. Ignore the error if the filter does not result in an
      actionable list of indices (ignore_empty_list) and exit cleanly.
    options:
    filters:
      - filtertype: pattern
        kind: prefix
        value: logstash-
        exclude:
      - filtertype: age
        source: name
        direction: older
        timestring: '%Y.%m.%d'
        unit: days
        unit_count: 10
        exclude:
```


<br>

### Alias
* alias에서 index 추가/제거
* `add`/`remove`의 filter로 추가/제거할 index를 정의
* atomic action이므로 즉시 수행
* `extra_settings`을 사용해 `add`에 추가 설정 가능
  * `remove`에서는 무시된다

```yaml
action: alias
description: "Add/Remove selected indices to or from the specified alias"
options:
  name:
  extra_settings:
    filter:
      term:
        user: kimchy
add:
  filters:
  - filtertype: ...
remove:
  filters:
  - filtertype: ...
```

> filtering된 alias를 생성 전에 field가 mapping에 존재하는지 확인
> alias에 filtering, routing 추가는 [Alias API - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/indices-aliases.html) 참고


#### Required settings
* name

#### Optional settings
* warn_if_no_indices
* extra_settings
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: alias
    description: >-
      Alias indices from last week, with a prefix of logstash- to 'last_week',
      remove indices from the previous week
    options:
      name: last_week
      warn_if_no_indices: False
      disable_action: True
    add:
      filters:
      - filtertype: pattern
        kind: prefix
        value: logstash-
        exclude:
      - filtertype: period
        period_type: relative
        source: name
        range_from: -1
        range_to: -1
        timestring: '%Y.%m.%d'
        unit: weeks
        week_starts_on: sunday
    remove:
      filters:
      - filtertype: pattern
        kind: prefix
        value: logstash-
      - filtertype: period
        period_type: relative
        source: name
        range_from: -2
        range_to: -2
        timestring: '%Y.%m.%d'
        unit: weeks
        week_starts_on: sunday
```


<br>

### Allocation
* index의 shard routing allocation을 변경
* [Index-level shard allocation filtering - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/shard-allocation-filtering.html) 참고

```yaml
action: allocation
description: "Apply shard allocation filtering rules to the specified indices"
options:
  key: ...
  value: ...
  allocation_type: ...
  wait_for_completion: True
  max_wait: 300
  wait_interval: 10
filters:
- filtertype: ...
```
* `wait_for_completion`이 True면 curator가 shard routing이 완료될 때 까지 기다린다
  * `max_wait: -1`이면 무한정 대기
  * `wait_interval`에 설정된 시간마다 polling

#### Required settings
* key

#### Optional settings
* allocation_type
* value
* wait_for_completion
* max_wait
* wait_interval
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: allocation
    description: >-
      Apply shard allocation routing to 'require' 'tag=cold' for hot/cold node
      setup for logstash-indices older than 3 days, based index_creation date
    options:
      key: tag
      value: cold
      allocation_type: require
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 3
```


<br>

### Close
* index를 **close하고, 연관된 alias를 제거**

```yaml
action: close
description: "Close selected indices"
options:
  delete_aliases: False
filters:
- filtertype: ...
```

#### Optional settings
* delete_aliases
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: close
    description: >-
      Close indices older than 30 days (based on index name), for logstash-
      prefixed indices
    options:
      delete_aliases: False
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 30
```


<br>

### Cluster Routing
* index의 shard routing allocation을 변경
* [Cluster level shard allocation](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/shards-allocation.html) 참고

```yaml
action: cluster_routing
description: "Apply routing rules to the entire cluster"
options:
  routing_type:
  value: ...
  setting: enable
  wait_for_completion: True
  max_wait: 300
  wait_interval: 10
```
* `wait_for_completion`이 True면 curator가 shard routing이 완료될 때 까지 기다린다
  * `max_wait: -1`이면 무한정 대기
  * `wait_interval`에 설정된 시간마다 polling

#### Required settings
* routing_type
* value
* setting
  * 향후 확장성을 대비한 필드로 **5.7에서는 항상 enable**

#### Optional settings
* wait_for_completion
* max_wait
* wait_interval
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: cluster_routing
    description: >-
      Disable shard routing for the entire cluster
    options:
      routing_type: allocation
      value: none
      setting: enable
      wait_for_completion: True
      disable_action: True
  2:
    action: (any othre action details go here)
    ...
  3:
    action: cluster_routing
    description: >-
      Re-enable shard routing for the entire cluster
    options:
      routing_type: allocation
      value: all
      setting: enable
      wait_for_completion: True
      disable_action: True
```


<br>

### Create Index
* 다양한 방법으로 named index 생성

#### Manual naming
```yaml
action: create_index
description: "Create index as named"
options:
  name: myindex
  ...
```

#### Python strftime
* `name`에 python strftime 사용
* [strftime - Curator Docs](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/option_name.html#_strftime) 참고
```yaml
action: create_index
description: "Create index as named"
options:
  name: 'myindex-%Y.%m'
  ...
```

#### Date Math
* `name`에 Elasticsearch date math 사용
* [date math - Curator Docs](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/option_name.html#_date_math_2) 참고
```yaml
action: create_index
description: "Create index as named"
options:
  name: '<logstash-{now/d+1d}>'
  ...
```

#### Extra Settings
* index setting, mapping 등 설정 추가
* [Create index API - Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/indices-create-index.html) 참고
```yaml
action: create_index
description: "Create index as named"
options:
  name: myindex
  extra_settings:
    settings:
      number_of_shards: 1
      number_of_replicas: 0
    mappings:
      type1:
        properties:
          field1:
            type: string
            index: not_analyzed
```

#### Required settings
* name

#### Optional settings
* extra_settings
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: create_index
    description: Create the index as named, with the specified extra settings
    options:
      name: myindex
      extra_settings:
        settings:
          number_of_shards: 2
          number_of_replicas: 1
      disable_action: True
```


<br>

### Delete Indices
* index를 delete
* **index가 많거나** **node 당 shard 수가 많은** cluster라면 delete가 오래 걸릴 수 있으므로 timeout 조절이 필요할 수 있다

```yaml
action: delete_indices
description: "Delete selected indices"
options:
  timeout_override: 300
  continue_if_exception: False
filters:
- filtertype: ...
```

### Optional settings
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: delete_indices
    description: >-
      Delete indices older than 45 days (based on index name), for logstash-
      prefixed indices. Ignore the error if the filter does not result in an
      actionable list of indices (ignore_empty_list) and exit cleanly
    options:
      ignore_empty_list: True
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 45
```


<br>

### Delete Snapshots
* repository에서 snapshot 제거
* snapshot이 진행 중인 경우 retry_count, retry_interval만큼 시도

```yaml
action: delete_snapshots
description: "Delete selected snapshots from repository"
options:
  repository: ...
  retry_interval: 120
  retry_count: 3
filters:
- filtertype: ...
```

#### Required settings
* repository

#### Optional settings
* retry_interval
* retry_count
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: delete_snapshots
    description: >-
      Delete snapshots from the selected repository older than 45 days
      (based on creation_date), for 'curator-` prefixed snapshots
    options:
      repository:
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: curator-
      exclude:
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 45
```


<br>

### Forcemerge
* force merge를 수행해 shard당 `max_num_segments`로 merge한다
* force merge는 **부하가 큰 작업**이므로 index에 더 이상 document가 추가되지 않을 때 수행해야 하고, peak time은 피해야 한다


```yaml
action: forcemerge
description: >-
  Perform a forceMerge on selected indices to 'max_num_segments' per shard
options:
  max_num_segments: 2
  timeout_override: 21600
  delay: 120
filters:
- filtertype: ...
```
* merge 사이에 `delay`를 주어 cluster를 정지시킬 수 있다

#### Required settings
* max_num_segments

#### Optional settings
* delay
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: forcemerge
    description: >-
      forceMerge logstash- prefixed indices older than 2 days (based on index creation_date) to 2
      segments per shard. Delay 120 seconds between each forceMerge operation to allow the cluster to quiesce. Skip indices that have already been forcemerged to the minimum number of segments to aviod reprocessing.
    options:
      max_num_segments: 2
      delay: 120
      timeout_override:
      continue_if_exception: False
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
      exclude:
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 2
      exclude:
    - filtertype:
      max_num_segments: 2
      exclude:
```


<br>

### Index Settings
* index의 설정을 업데이트

```yaml
action: index_settings
description: "Change settings for selected indices"
options:
  index_settings:
    index:
      refresh_interval: 5s
  ignore_unavailable: False
  preserve_existing: False
filters:
- filtertype: ...
```

* elasticsearch도 할 수 있다
```json
// dotted notation
PUT /indexname/_settings
{
  "index.blocks.read_only": true
}

// structure
PUT /indexname/_settings
{
  "index": {
    "blocks": {
      "read_only": true
    }
  }
}
```

#### Optional settings
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action
* ignore_unavailable
* preserve_existing

#### Example
```yaml
actions:
  1:
    action: index_settings
    description: >-
      Set Logstash indices older than 10 days to be read only (block writes)
    options:
      disable_action: True
      index_settings:
        index:
          blocks:
            write: True
      ignore_unavailable: False
      preserve_existing: False
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
      exclude:
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 10
```


<br>

### Open
* index open

```yaml
action: open
description: "open selected indices"
options:
  continue_if_exception: False
filters:
- filtertype: ...
```

#### Optional settings
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: open
    description: >-
      Open indices older than 30 days but younger than 60 days (based on index name), for
      logstash- prefixed indices
    options:
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
      exclude:
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 30
    - filtertype: age
      source: name
      direction: younger
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 60
```


<br>

### Reindex
* 많은 option이 있고, 시작하기에는 `request_body` docs를 보는게 좋다
```yaml
actions:
  1:
    description: "Reindex index1 into index2"
    action:
    options:
      wait_interval: 9
      max_wait: -1
      request_body:
        source:
          index: index1
        dest:
          index: index2
    filters:
    - filtertype: none
```

#### Required settings
* request_body

#### Optional settings
* refresh
* remote_aws_key
* remote_remote_aws_regison
* remote_certificate
* remote_client_cert
* remote_client_key
* remote_filters
* remote_ssl_no_validate
* remote_url_prefix
* request_body
* requests_per_second
* slices
* timeout
* wait_for_active_shards
* wait_for_completion
* max_wait
* wait_interval
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action


#### Example
* manually selected reindex of a single index
```yaml
actions:
  1:
    action: reindex
    description: "Reindex index1 into index2"
    options:
      disable_action: True
      wait_interval: 9
      max_wait: -1
      request_body:
        source:
          index: index1
        dest:
          index: index2
    filters:
    - filtertype: none
```

* manually selected reindex of a multiple indices
```yaml
...
    options:
      request_body:
        source:
          index: ['index1', 'index2', 'index3']
        dest:
          index: new_index
...
```

* filter selected indices
```yaml
actions:
  1:
    action: reindex
    description: >-
      "Reindex all daily logstash indices from March 2017 into logstash-2017.03"
    options:
      ...
      request_body:
        source:
          index: REINDEX_SELECTION
        dest:
          index: logstash-2017.03
    filters:
    - filtertype:
      kind: prefix
      value: logstash-2017.03.
```

* reindex from remote
```yaml
actions:
  1:
    action: reindex
    options:
      ...
      request_body:
        source:
          remote:
            host: http://otherhost:9200
            username: myuser
            password: mypass
          index: index1
        dest:
          index: index1
```

* reindex from remote with filter selected indices
```yaml
actions:
  1:
    action: reindex
    options:
      ...
      request_body:
        source:
          remote:
            host: http://otherhost:9200
            username: myuser
            password: mypass
          index: REINDEX_SELECTION
        dest:
          index: logstash-2017.03
      remote_filters:
      - filtertype: pattern
        kind: prefix
        value: logstash-2017.03.
    filters:
    - filtertype: none
```

* manually selected reindex of a single index with query
```yaml
actions:
  1:
    action: reindex
    options:
      ...
      request_body:
        source:
          query:
            range:
              timestamp:
                gte: "now-1h"
          index: index1
        dest:
          index: index2
    filters:
    - filtertpe: none
```


<br>

### Replicas
* replica count를 설정
```yaml
action: replicas
description: >-
  Set the number of replicas per shard for selected indices to 'count'
options:
  count: ...
  wait_for_completion: True
  max_wait: 600
  wait_interval: 10
filters:
- filtertype: ...
```

#### Required settings
* count

#### Optional settings
* wait_for_completion
* max_wait
* wait_interval
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: replicas
    description: >-
      Reduce the replica count to 0 for logstash- prefixed indices older than 10 days(based on index creation_date)
    optionos:
      count: 0
      wait_for_completion: True
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 10
```


<br>

### Restore
* repository의 snapshot을 이용해 index를 복구
```yaml
actions:
  1:
    action: restore
    description: >-
      Restore all indices in the most recent snapshot with state SUCCESS.
      Wait for the restore to complete before contineing. Do not skip the repository
      filesystem access check. Use the other options to define the index/shard settings for the restore.
    options:
      repository:
      # If name is blank, the most recent snapshot by age will be selected
      name:
      # If indices is blank, all indices in the snapshot will be restored
      indices:
      wait_for_completion: True
      max_wait: 3600
      wait_interval: 10
    filters:
    - filtertype: state
      state: SUCCESS
      exclude:
    - filtertype: ...
```

#### Renaming indices on restore
```yaml
actions:
  1:
    action: restore
    description: >-
      ...
    options:
      repository:
      name:
      indiecs:
      rename_pattern: 'index(.+)'
      rename_replacement: 'restored_index$1'
      wait_for_completion: True
      max_wait: 3600
      wait_interval: 10
```
* index-2017.03.01 index 복구시 restored_index-2017.03.01로 rename 한다

#### Extra settings
* `extra setting`을 사용하여 index setting 등을 추가로 설정할 수 있다
```yaml
actions:
  1:
    action: restore
    ...
    options:
      extra_settings:
        index_settings:
          number_of_replicas: 0
    ...
```

#### Required settings
* repository

#### Optional settings
* name
* include_aliases
* indices
* ignore_unavailable
* include_global_state
* partial
* rename_pattern
* extra_settings
* wait_for_completion
* max_wait
* skip_repo_fs_check
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: restore
    description: >-
      Restore all indices in the most recent snapshot with state SUCCESS.
      Wait for the restore to complete before contineing. Do not skip the repository
      filesystem access check. Use the other options to define the index/shard settings for the restore.
    options:
      repository:
      # If name is blank, the most recent snapshot by age will be selected
      name:
      # If indices is blank, all indices in the snapshot will be restored
      indices:
      include_aliases: False
      ignore_unavailable: False
      include_global_state: False
      partial: False
      rename_pattern:
      rename_replacement:
      extra_settings:
      wait_for_completion: True
      skip_repo_fs_check: True
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: curator-
    - filtertype: state
      state: SUCCESS
```


<br>

### Rollover
* 조건이 맞으면 [Elasticsearch Rollover API](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/indices-rollover-index.html)를 사용해 index를 생성
```yaml
action: rollover
description: >-
  Rollover the index associated with alias 'aliasname', which should be in the from of prefix-00001
  (or similar), or prefix-YYYY.MM.DD-1
options:
  name: aliasname
  conditions:
    max_age: 1d
    max_docs: 1000000
    max_size: 5gb
```
* `max_age`, `max_docs`, `max_size` 중 하나 이상의 조합할 수 있고, 여러개 중 하나라도 일치하면 rollover 발생
  * default value가 없으므로 비어있으면 curator가 error 발생

#### Extra settings
* `extra setting`을 사용하여 index setting 등을 추가로 설정할 수 있다

```yaml
action: rollover
options:
  ...
  extra_settings:
    index.number_of_shards: 3
    index.number_of_replicas: 1
...
```

#### Required settings
* name
  * alias name
* max_age
  * rollover를 trigger하지 않는 age
  * default X
  * 값을 지정하지 않으면 error
* max_docs
  * rollover를 trigger하지 않는 document count
  * default X
  * 값을 지정하지 않으면 error
* max_size
  * rollover를 trigger하지 않는 size
  * default X
  * 값을 지정하지 않으면 error
  * Elasticsearch 6.1.0부터 지원

#### Optional settings
* extra_settings
* new_index
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: restore
    description: >-
      Rollover the index associated with alias 'aliasname', which should be in the format of 
      prefix-00001(or similar), or prefix-YYYY.MM.DD-1
    options:
      disable_action: True
      name: aliasname
      conditions:
        max_age: 1d
        max_docs: 1000000
        max_size: 50g
      extra_settings:
        index.number_of_shards: 3
        index.number_of_replicas: 1
```


<br>

### Shrink
* cluster의 total shard count를 줄이는 좋은 방법
* [몇가지 조건 필요](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-shrink-index.html#_shrinking_an_index)
  * index는 반드시 read-only marked
  * index의 모든 shard(primary or replica)의 copy하여 동일한 node에 relocated
  * cluster health **green**
  * target index가 있으면 안된다
  * target index의 primary shard count는 source index의 primary shard count와 동일해야 한다
  * source index는 target index보다 더 많은 primary shard를 가져야 한다
  * target index는 **single shard에 들어갈 수 있는 maximum document count인 2,147,483,519**를 넘어서는 안된다
  * shrink process에서 기존 index의 second copy를 수용할 수 있는 여유 disk 공간 필요
* curator는 모든 조건을 충족하지 않으면 shrink를 수행하지 않는다
* source index를 target index로 축소
  * 이름은 `shrink_prefix` + source index name + `shrink_suffix`
  * `number_of_shards` 만큼의 primary shard와 `number_of_replicas` 만큼의 replica shard로 축소

* `DETERMINISTIC`이 지정되지 않았다면 `shrink_node`로 식별된 node에서 발생
  * curator는 여유 공간이 가장 많은 node를 선택
  * 여러 index 수행시 node 선택 process가 반복되어 특정 node에서만 진행하지 않는다
* shrink 후 source index 제거 가능
  * `delete_after`로 제어
  * source index를 제거하지 않으면, curator는 read-only setting과 shard allocation routing을 제거하고 shrink node에 할당 후 shard의 rerouting 중지 후 계속 진행

#### Required settings
* shrink_node

#### Optional settings
* continue_if_exception
* ignore_empty_list
* copy_aliases
* delete_after
* disable_action
* extra_settings
  * `settings`와 `alias`만 허용
* node_filters
* number_of_shards
* number_of_replicas
* post_allocation
  * shrink 후 target index에 shard routing이 수행되고, 그동안 curator는 대기
* shrink_prefix
* shrink_suffix
* timeout_override
* wait_for_active_shards
* wait_for_completion
* wait_for_rebalance
* max_wait
* wait_interval

#### Example
```yaml
actions:
  1:
    action: shrink
    description: >-
      Shrink logstash indices oler than 21 days on the node with the most available space, 
      excluding the node named 'not_this_node'
      Delete each source index after successful shrink, then reroute the shrunk index with the 
      provided parameters
    options:
      disable_action: True
      ignore_empty_list: True
      shrink_node: DETERMINISTIC
      node_filters:
        permit_masters: False
        exclude_nodes: ['not_this_node']
      number_of_shards: 1
      number_of_replicas: 1
      shrink_prefix:
      shrink_suffix: '-shrink'
      delete_after: True
      post_allocation:
        allocation_type: include
        key: node_tag
        value: cold
      wait_for_active_shards: 1
      extra_settings:
        settings:
          index.codec: best_compression
      wait_for_completion: True
      wait_for_rebalance: True
      wait_interval: 9
      max_wait: -1
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 21
```


<br>

### Snapshot
* name, name pattern으로 표시된 repository에 index의 snapshot 생성

#### Required settings
* repository

#### Optional settings
* name
* ignore_unavailable
* include_global_state
* partial
* wait_for_completion
* max_wait
* wait_interval
* skip_repo_fs_check
* ignore_empty_list
* timeout_override
* continue_if_exception
* disable_action

#### Example
```yaml
actions:
  1:
    action: snapshot
    description: >-
      Snapshot logstash- prefixed indices older than 1 day (based on index 
      creation_date) with the default snapshot name pattern of 'curator-%Y%m%d%H%M%S'
      Wait for the snapshot to complete. Do not skip the repository filesystem access check
      Use the other options to create the snapshot
    options:
      repository:
      # Leaving name blank will result in the default 'curator-%Y%m%d%H%M%S'
      name:
      ignore_unavailable: False
      include_global_state: True
      partial: False
      wait_for_completion: True
      skip_repo_fs_check: False
      disable_action: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: logstash-
    - filtertype: age
      source: creation_date
      direction: older
      unit: days
      unit_count: 1
```


<br>

## Options

### allocation_type

### allow_ilm_indices

### continue_if_exception
`continue_if_exception`보다 `ignore_empty_list` 사용
`continue_if_exception`는 empty list 이외의 exception만 catch
empty list는 새로운 cluster거나 index pattern이 추가될 때 발생할 수 있다

True
  exception logging 후 다음 action 수행
default False



### disable_action
현재 action을 무시
큰 설정 파일에서 작업을 일시적으로 비활성화하는데 유용
default. False


### ignore_empty_list
index, filtering에 따라 empty list가 될 수 있는데 empty list는 error condition

True
  INFO log
  exit action
False(default)
  ERROR log
  exit code 1 curator



### timeout_override
일부 action에만 default 설정

close - 180
delete_snapshots - 300
forcemerge - 21600
resotre - 21600
snapshot - 21600

wait_for_completion 사용시 새로운 polling 동작에 대해 client timeout을 줄이거나 방지해야 하는 forceMerge action 등에 유용





## Filters
원하는 index/snapshot을 선택하는 방법
filter chain은 AND 연산
OR 연산을 하고 싶으면 filtertype pattern으로 regex를 사용
```yaml
filters:
- filtertype: pattern
  kind: regex
  value: '^(alpha-|bravo-|charlie-).$'
```

* filtertype 정의 필수, 여러개 가능
```yaml
filters:
- filtertype: first
  setting1: ...
  ...
  settingN: ...
- filtertype: second
  setting1: ...
  ...
  settingN: ...
```

index filtertypes
  age
  alias
  allocated
  closed
  count
  empty
  forcemerged
  kibana
  none
  opened
  pattern
  period
  space

snapshot filtertypes
  age
  count
  none
  pattern
  period
  state


### age
age를 기준으로 filtering
exclude 사용 가능
epoch time 기준

| unit | seconds | Note |
|:--|:--|:--|
| seconds | 1 | 1 second |
| minutes | 60 | 60 seconds |
| hours | 3600 | 60 * 60 |
| days | 86400 | 24 * 60 * 60 |
| weeks | 604800 | 7 * 24 * 60 * 60 |
| months | 2592000 | 30 * 24 * 60 * 60 |
| years | 31536000 | 365 * 24 * 60 * 60 |

```yaml
- filtertype: age
  source: creation_date
  direction: older
  unit: days
  unit_count: 3
```
index/snapshot의 생성 날짜와 `current epoch time - 3 * 86400`를 비교해 오래된 경우 실행 가능한 목록에 유지


name-based ages



creation_date-based ages




field_stats-based ages




#### Required settings


#### Dependent settings


#### Optional settings













<br>

## 
crontab이나 kubernetes cronjob으로 등록해서 사용

### crontab
TODO
`crontab -e`
```
00 8 * * * root curator /path/delete_index.yml --config /path/curator.yml
```


### kubernetes cronjob
TODO



<br>

## Conclusion
TODO: write the conclusion


<br><br>


> #### Reference
> * [elastic/curator](https://github.com/elastic/curator)
> * [Curator Reference - Elastic Docs](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/index.html)
