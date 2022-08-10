# [k8s] Useful kubernetes command
> date - 2022.08.10  
> keyworkd - kubernetes, kubectl, k8s  
> kubernetes 사용시 유용한 command 정리  

<br>

## 한줄 명령어로 curl을 사용할 수 있는 1회용 Pod 생성
```sh
$ kubectl run curl -it --rm --image curlimages/curl -- sh
```

<br>

## Pod log 확인
* label을 이용하여 Pod log 확인시 default로 14개 Pod의 log stream만 확인할 수 있어 `--max-log-requests`를 사용
```sh
$ kubectl logs -f --tail=200 -l app=zk --max-log-requests 50
```


<br>

## rollout
```sh
## pod rolling restart
$ kubectl rollout restart deployment.apps/test-app

## rollout status
$ kubectl rollout status deployment.apps/test-app

## rollback
$ kubectl rollout undo deployment.apps/test-app

## 특정 revision으로 rollback 
$ kubectl rollout undo deployment.apps/test-app --to-revision=2
```


<br>

## test pod terminate
```yaml
kind: Pod
apiVersion: v1
metadata:
  name: terminated-pod
  namespace: default
spec:
  containers:
  - name: test-pod
    image: gcr.io/google_containers/busybox:1.24
    command:
    - "/bin/sh"
    args:
    - "-c"
    - "sleep 5 && exit 1"
  restartPolicy: "Never"
```


<br>

## DNS로 Pod 찾기
```sh
## DNS 조회가 가능한 파드 만들기 
$ kubectl run dnsutils --image=tutum/dnsutils --generator=run-pod/v1 --command -- sleep infinity 

## 새 파드로 DNS 조회 하기 
$ kubectl exec dnsutils nslookup bluayer-headless # 파드들의 IP를 보여준다
```


<br><br>

> #### Reference
> * [Deployment](https://kubernetes.io/ko/docs/concepts/workloads/controllers/deployment)
