# [Fluentd] Fluentd duplcate logging issue
> date - 2021.03.02  
> keyword - fluentd, log  
> fluentd v1.11.x에서 log가 중복으로 streaming되는 이슈와 해결법에 대해 정리  

<br>

## Requirement

### Dependency
* Fluentd v1.11.x

<br>

## Issue
```conf
## fluentd log
<label @FLUENT_LOG>
  <match fluent.*>
    @type stdout
  </match>
</label>
```

```sh
2021-02-09 09:00:29 +0000 [info]: #0 stats - namespace_cache_size: 2, pod_cache_size: 32, pod_cache_watch_misses: 422, pod_cache_watch_ignored: 84, namespace_cache_api_updates: 7, pod_cache_api_updates: 7, id_cache_miss: 7, pod_cache_watch_delete_ignored: 92, pod_cache_watch_updates: 120
2021-02-09 09:00:29.303664260 +0000 fluent.info: {"message":"stats - namespace_cache_size: 2, pod_cache_size: 32, pod_cache_watch_misses: 422, pod_cache_watch_ignored: 84, namespace_cache_api_updates: 7, pod_cache_api_updates: 7, id_cache_miss: 7, pod_cache_watch_delete_ignored: 92, pod_cache_watch_updates: 120"}
```
* log에서 확인할 수 있듯 fluentd의 log가 fluentd output plugin을 통해 processing되어 2번 logging되는 현상 발견


<br>

## Resolve
* `fluent.*` tag일 경우 `null` output plugin을 사용하여 logging에서 제외시킨다
```conf
## fluentd log
<label @FLUENT_LOG>
  <match fluent.*>
    @type null
  </match>
</label>
```

```sh
2021-02-09 09:12:01 +0000 [info]: #0 stats - namespace_cache_size: 8, pod_cache_size: 310, pod_cache_watch_updates: 14, namespace_cache_api_updates: 3, pod_cache_api_updates: 3, id_cache_miss: 3, pod_cache_watch_delete_ignored: 5, pod_cache_watch_misses: 12, pod_cache_watch_ignored: 3, pod_cache_host_updates: 310, namespace_cache_host_updates: 8
```
