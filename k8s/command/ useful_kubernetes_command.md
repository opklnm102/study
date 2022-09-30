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
* restarted Pod의 이전 log 확인
```sh
$ kubectl logs [pod name] --previous
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


<br>

## 현재 배포된 image 조회
```sh
$ kubectl get deployment [deployment name] -o=jsonpath='{$.spec.template.spec.containers[:1].image}'
```


<br>

## container image 업데이트
```sh
$ kubectl set image deployment [deployment name] [container name]=[image]

## example
$ kubectl set image deployment test-app app=opklnm102/test-app:1.0.0
```


<br>

## 배포 내역 조회
* revision history를 조회
```sh
$ kubectl rollout history deployment [deployment name]

## kubectl rollout history deployment test-app
deployments "test-app"
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
...
```

* 특정 revision에 배포된 image 정보를 포함한 상세 정보 조회
```sh
$ kubectl rollout history deployment [deployment name] --revision=[revision number]
 
## example
$ kubectl rollout history deployment test-app --revision=2
```


<br>

## replica 개수 변경하기
```sh
$ kubectl scale deployment [deployment name] --replicas=[replica count]

## example
$ kubectl scale deployment test-app --replicas=2
```


<br>

## Pod 강제 제거하기
```sh
$ kubectl delete pods [pod name] --grace-period=0 --force
```


<br>

## Command line argument에 environment variables 사용하기
```yaml
...
  command: ["bin/test-cli"]
  args: ["--host=$(HOST)", "--port=$(PORT)"]
  env:
    - name: HOST
      value: "test.example.com"
    - name: PORT
      value: "5000"
```


<br>

## Pod의 resources.requests, limits 조회
```sh
$ kubectl get pods [pod name] -o jsonpath='{range .spec.containers[*]}{"Container Name: "}{.name}{"\n"}{"Requests:"}{.resources.requests}{"\n"}{"Limits:"}{.resources.limits}{"\n"}{end}'

## 모든 Pod의 resource 조회
for pod in $(kubectl get pods -o jsonpath={.items..metadata.name}); do
  kubectl get pods $pod  -o jsonpath='{range .spec.containers[*]}{"Container Name: "}{.name}{"\n"}{"Requests:"}{.resources.requests}{"\n"}{"Limits:"}{.resources.limits}{"\n"}{end}';
done
```


<br><br>

> #### Reference
> * [Deployment](https://kubernetes.io/ko/docs/concepts/workloads/controllers/deployment)
