# [k8s] How To Restart Kubernetes Pods
> date - 2021.03.14  
> keyworkd - kubernetes, pod restart  
> Kubernetes의 pod를 rolling restart하는 방법에 대해 정리  

<br>

## 1. Rolling restart
* Kubernetes v1.15 이상에서 사용 가능한 `kubectl rollout restart`를 이용
```sh
$ kubectl rollout restart deployment/$deployment_name  # or deployment [deployment name]

deployment.apps/$deployment_name restarted


## rollout check
$ kubectl rollout status deployment/$deployment_name

Waiting for deployment "$deployment_name" rollout to finish: 0 of 1 updated replicas are available...
deployment "$deployment_name" successfully rolled out
```


<br>

## 2. Using annotations
* v1.15 이상의 `kubectl rollout restart` command가 동작하는 방식으로 annotations을 업데이트한다
  * [Kubernetes/kubectl/pkg/polymorphichelpers/objectrestarter.go](https://github.com/kubernetes/kubectl/blob/master/pkg/polymorphichelpers/objectrestarter.go#L32)

```sh
$ kubectl patch deployment/$deployment_name -p \
          "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date +'%Y-%m-%dT%H:%M:%S')\"}}}}}"

## 수정된 annotation 확인
$ kubectl get pods $pod_name | grep 'kubectl.kubernetes.io/restartedAt'

Annotations:  kubectl.kubernetes.io/restartedAt: 2021-03-16T10:53:31
```


<br>

## 3. Using Environment Variables
* `kubectl set env`로 환경 변수를 추가/수정하여 Pod를 restart 시킨다
```sh
$ kubectl set env deployment/$deployment_name DEPLOY_DATE="$(date +'%Y-%m-%dT%H:%M:%S')"  # or deployment [deployment name]

deployment.apps/$deployment_name env updated
```


<br>

## 4. Scaling the Number of Replicas
* `kubectl scale` 사용
```sh
## read current replicas
$ DESIRED_REPLICAS=$(kubectl get deployment/$deployment_name -o jsonpath='{.spec.replicas}')

## scale-in
$ kubectl scale deployment/$deployment_name --replicas=0

## scale-out
$ kubectl scale deployment/$deployment_name --replicas=$DESIRED_REPLICAS
```

<br>

### label selector 이용
* label selector를 이용해 grouping된 pod들을 한번에 조정할 수 있다
```sh
$ kubectl scale deployment -l app=$app_name --replicas=0
```

<br>

## Conclusion
* 때때로 Pod를 restart하는게 가장 빠른 문제 해결 방법일 수 있으므로 위에 나열된 4가지 방법 중 적절한 것으로 조치해보자


<br><br>

> #### Reference
> * [Rollout Restart Kubernetes Deployment from Java using YAKC](https://blog.marcnuri.com/rollout-restart-deployment-from-java/)
> * [How To Restart Kubernetes Pods](https://phoenixnap.com/kb/how-to-restart-kubernetes-pods)
> * [Kubernetes/kubectl/pkg/polymorphichelpers/objectrestarter.go](https://github.com/kubernetes/kubectl/blob/master/pkg/polymorphichelpers/objectrestarter.go#L32)
