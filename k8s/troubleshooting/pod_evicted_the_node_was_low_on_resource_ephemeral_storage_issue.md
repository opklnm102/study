# [k8s] Pod Evicted The node was low on resource: ephemeral-storage issue
> date - 2022.07.26  
> keyworkd - k8s, kubernetes, evicted, ephemeral storage  
> Pod Evicted로 인한 이슈를 정리  

<br>

## Requirement

### Dependency
```
kubernetes 1.20
```


<br>

## Issue
Pod 실행 중 아래 메시지와 함꼐 종료되는 현상 발생  
```sh
29m   Warning   Evicted      pod/test-xxxxx        The node was low on resource: ephemeral-storage. Container app was using 25756Ki, which exceeds its request of 0.
29m   Normal    Killing      pod/test-xxxxx        Stopping container jenkins
```

시간이 흐르고 나타난 다른 event에서 node의 DiskPressure가 원인임을 파악  
```
15m   Warning   Evicted      pod/test-xxxxx        The node had condition: [DiskPressure]
```

node의 root filesystem의 용량 부족 -> pod evicted로 ephemeral-storage 제거해 용량 확보라는 프로세스가 동작하면서 Pod 종료가 일어났던 것
```sh
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs         16G     0   16G   0% /dev
tmpfs            16G     0   16G   0% /dev/shm
tmpfs            16G  956K   16G   1% /run
tmpfs            16G     0   16G   0% /sys/fs/cgroup
/dev/nvme0n1p1   60G   53G  7.2G  89% /
tmpfs           3.1G     0  3.1G   0% /run/user/1002
```


<br>

## Resolve
해결법으로는 3가지 방식으로 접근할 수 있다

1. kubelet의 eviction thresholds 증가
2. 부족한 리소스 증설
3. 불필요 리소스 정리를 통한 여유 확보

이번에는 node에 비정상으로 종료된 garbage container로 인해 용량이 부족했던거라 모두 정리하여 해결


<br><br>

> #### Reference
> * [Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)
