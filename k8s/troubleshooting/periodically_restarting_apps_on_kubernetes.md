# [k8s] Periodically restarting apps on Kubernetes
> date - 2023.02.05  
> keyworkd - kubernetes, pod  
> memory leak 같이 시간이 오래걸리는 이슈 발생시 시간을 벌기 위해 주기적으로 재시작하기도 한다. k8s에서 어떻게 할 수 있을지에 대해 정리  

<br>

## livenessProbe 이용
* 아래의 livenessProbe를 추가하면 1시간 후 매분마다 시간을 확인하여 3AM인 경우 재시작
```yaml
livenessProbe:
  exec:
    command:
    - sh
    - -c
    - exit $(test $(date +%H) -eq 3 && echo 1 || echo 0)
  failureThreshold: 1
  initialDelaySeconds: 3600
  periodSeconds: 60
```

<br>

## CronJob 이용
* [bitnami/kubectl](https://hub.docker.com/r/bitnami/kubectl/) image를 이용하며 k8s api의 권한은 RBAC으로 할당해준다
```yaml
kind: ServiceAccount
apiVersion: v1
metadata:
  name: periodically-restart-test
  namespace: test
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: periodically-restart-test
  namespace: test
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    resourceNames: ["${DEPLOYMENT}"]
    verbs: ["get", "patch", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: periodically-restart-test
  namespace: test
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: periodically-restart-test
subjects:
  - kind: ServiceAccount
    name: periodically-restart-test
    namespace: test
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: periodically-restart-test
  namespace: test
spec:
  schedule: "@daily"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      backoffLimit: 1
      activeDeadlineSeconds: 600
      template:
        spec:
          restartPolicy: Never
          serviceAccountName: periodically-restart-test
          containers:
            - name: kubectl
              image: bitnami/kubectl
              command:
                - "kubectl"
                - "rollout"
                - "restart"
                - "deployment/${DEPLOYMENT}"
```

* rollout status로 restart를 기다릴 수 있다
```yaml
command:
 - bash
 - -c
 - >-
   kubectl rollout restart deployment/${DEPLOYMENT} &&
   kubectl rollout status deployment/${DEPLOYMENT}
```

<br>

## 특정 로그가 발생하면 재시작
* 아래와 같은 로그가 발생했을 때 재시작해준다
```sh
2023-02-02 15:41:35 +0000 [warn]: #0 Could not communicate to OpenSearch, resetting connection and trying again. [403] {"message":"The security token included in the request is expired"}
...
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: restart-test
  namespace: test
data:
  restart.sh: |-
    #!/bin/sh

    kubectl logs --tail=10 deployment/${DEPLOYMENT} | grep -q "The security token included in the request is expired"
    if [ $? -eq 0 ]; then
      kubectl rollout restart deployment/${DEPLOYMENT} \
        && kubectl rollout status deployment/${DEPLOYMENT}
    fi
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: restart-test
  namespace: test
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    resourceNames: ["${DEPLOYMENT}"]
    verbs: ["get", "patch", "list", "watch"]
  - apiGroups: [ "" ]
    resources: [ "pods" ]
    verbs: [ "get", "list" ]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get", "list", "watch"]
---
kind: ServiceAccount
apiVersion: v1
metadata:
  name: restart-test
  namespace: test
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: restart-test
  namespace: test
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: restart-test
subjects:
  - kind: ServiceAccount
    name: restart-test
    namespace: test
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: restart-test
  namespace: test
spec:
  schedule: "* * * * *"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      backoffLimit: 1
      activeDeadlineSeconds: 600
      template:
        spec:
          restartPolicy: Never
          serviceAccountName: restart-test
          containers:
            - name: kubectl
              image: bitnami/kubectl
              command:
                - /etc/script/restart.sh
              volumeMounts:
                - mountPath: /etc/script
                  name: script
          volumes:
            - name: script
              configMap:
                name: restart-test
                defaultMode: 0555
```

<br>

## Conclusion
* bitnami/kubectl image를 사용하여 재시작을 자동화하는 예시들을 살펴보았다. 위의 예시들을 응용하면 다양한 케이스의 자동화에 대해 도움이 될 수 있으면 좋겠다


<br><br>

> #### Reference
> * [Periodically restarting apps on Kubernetes](https://developer20.com/periodically-restarting-apps-on-k8s)
> * [Running Automated Tasks with a CronJob - Kubernetes Docs](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs)
> * [How to schedule pods restart](https://stackoverflow.com/questions/52422300/how-to-schedule-pods-restart)
> * [Restart Kubernetes pod based on log occurrence](https://medium.com/@hansrajrami/restart-kubernetes-pod-based-on-log-occurrence-e04980875be1)
> * [Restart kubernetes pod if a log line exists](https://serverfault.com/questions/1102768/restart-kubernetes-pod-if-a-log-line-exists)
