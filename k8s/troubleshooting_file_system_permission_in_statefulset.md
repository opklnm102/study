# [k8s] Troubleshooting file system permission in StatefulSet
> date - 2020.08.13  
> keyworkd - Kubernetes, Security Context, file system  
> Kubernetes에서 file system permission issue로 삽질했던 과정을 정리  

<br>

## Issue
* [mongo - Docker Hub](https://hub.docker.com/_/mongo)를 기반으로 MongoDB 생성
* [mongodb 4.1 Dockerfile](https://github.com/docker-library/mongo/blob/c93d83e504/4.1/Dockerfile#L90)을 보면 `chown -R mongodb:mongodb /data/db /data/configdb` 해주는데 mongo container가 root로 실행되어 아래와 같이 생성되어 있었음
```sh
$ ls -al /data/db
drwxrwsr-x. 4 mongodb mongodb       8192 Jun 11 05:52 .
drwxr-xr-x. 4 root    root          4096 May 29 20:27 ..
-rw-rw----. 1 mongodb mongodb         45 May 22 06:27 WiredTiger
-rw-rw----. 1 mongodb mongodb         21 May 22 06:27 WiredTiger.lock
-rw-------. 1 root    mongodb       1084 Jun 11 05:52 WiredTiger.turtle
-rw-rw----. 1 mongodb mongodb     303104 Jun 11 05:52 WiredTiger.wt
-rw-------. 1 root    mongodb       4096 Jun 11 05:51 WiredTigerLAS.wt
```

<br>

> #### WiredTiger.turtle
> * MongoDB data의 metadata를 관리
> * 사라지면 복구할 방법이 없으므로 backup 권장

<br>

* 처음에 `StatefulSet`의 `spec.template.spec.securityContext` 없이 생성하여 root의 process로 실행되어 아래와 같이 file system permission이 할당된 것을 확인할 수 있다
```sh
$ ls -al /data
total 28
drwxr-xr-x. 4 root    root    4096 May 29 20:27 .
drwxr-xr-x. 1 root    root    4096 Jun 11 06:41 ..
drwxr-xr-x. 2 mongodb mongodb 4096 May 29 20:27 configdb
drwxrwsr-x. 5 root    daemon  4096 Jun 11 06:42 db

$ ls -al /data/db
total 4194840
drwxrwsr-x. 5 root daemon       4096 Jun 11 06:42 .
drwxr-xr-x. 4 root root         4096 May 29 20:27 ..
-rw-------. 1 root daemon         45 Jun 11 06:41 WiredTiger
...
```

* `root`로 실행하는 것은 지양하므로 `securityContext`를 지정하여 실행
```yaml
apiVersion: apps/v1
kind: StatefulSet
...
spec:
  template:
    spec:
      securityContext:
        runAsUser: 999  # 999 = mongodb
        runAsGroup: 999
...
```

* `CrashLoopBackOff` 발생
```
mongodb-0   0/2       ContainerCreating   0         0s
mongodb-0   1/2       Error     0         6s
mongodb-0   1/2       CrashLoopBackOff   1         8s
```

* log 확인
```sh
...
2019-06-11T07:08:55.906+0000 I STORAGE  [initandlisten] exception in initAndListen: IllegalOperation: Attempted to create a lock file on a read-only directory: /data/db, terminating  # here
2019-06-11T07:08:55.907+0000 I NETWORK  [initandlisten] shutdown: going to close listening sockets...
2019-06-11T07:08:55.907+0000 I NETWORK  [initandlisten] removing socket file: /tmp/mongodb-27017.sock
2019-06-11T07:08:55.907+0000 I CONTROL  [initandlisten] now exiting
2019-06-11T07:08:55.907+0000 I CONTROL  [initandlisten] shutting down with code:100
```

* [mongodb 3.4.3 Permission denied wiredtiger_kv_engine.cpp 267 error with ubuntu 16 - Stackoverflow](https://stackoverflow.com/a/43154346/6389139)를 참고해 permission을 변경
```sh
$ chown -R mongodb:mongodb /data/db /data/configdb

drwxrwsr-x. 4 mongodb mongodb       8192 Jun 11 07:22 .
drwxr-xr-x. 4 root    root          4096 May 29 20:27 ..
-rw-------. 1 mongodb mongodb         45 Jun 11 06:41 WiredTiger
-rw-------. 1 mongodb mongodb         21 Jun 11 06:41 WiredTiger.lock
...
```

* 그러나 잠시 후 아래와 같이 `WiredTiger.turtle`, `WiredTigerLAS.wt` 파일이 변경됨을 확인할 수 있다
```sh
$ ls -al /data/db

drwxrwsr-x. 4 mongodb mongodb       8192 Jun 11 07:22 .
drwxr-xr-x. 4 root    root          4096 May 29 20:27 ..
-rw-------. 1 mongodb mongodb         45 Jun 11 06:41 WiredTiger
-rw-------. 1 mongodb mongodb         21 Jun 11 06:41 WiredTiger.lock
-rw-------. 1 root    mongodb       1074 Jun 11 07:22 WiredTiger.turtle
-rw-------. 1 mongodb mongodb     344064 Jun 11 07:22 WiredTiger.wt
-rw-------. 1 root mongodb       4096 Jun 11 07:10 WiredTigerLAS.wt
```

* root로 실행된 `mongod` process가 주기적으로 파일을 변경하기 때문에 error 발생
```sh
...
2019-06-11T07:26:14.434+0000 I STORAGE  [initandlisten] Detected data files in /data/db created by the 'wiredTiger' storage engine, so setting the active storage engine to 'wiredTiger'.
2019-06-11T07:26:14.435+0000 I STORAGE  [initandlisten] wiredtiger_open config: create,cache_size=1536M,session_max=20000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000),statistics_log=(wait=0),verbose=(recovery_progress),
2019-06-11T07:26:15.109+0000 E STORAGE  [initandlisten] WiredTiger error (13) [1560237975:109941][1:0x7f62fb0d9a80], wiredtiger_open: __posix_open_file, 715: /data/db/WiredTiger.turtle: handle-open: open: Permission denied Raw: [1560237975:109941][1:0x7f62fb0d9a80], wiredtiger_open: __posix_open_file, 715: /data/db/WiredTiger.turtle: handle-open: open: Permission denied
2019-06-11T07:26:15.110+0000 W STORAGE  [initandlisten] Failed to start up WiredTiger under any compatibility version.
2019-06-11T07:26:15.110+0000 F STORAGE  [initandlisten] Reason: 13: Permission denied
2019-06-11T07:26:15.110+0000 F -        [initandlisten] Fatal Assertion 28595 at src/mongo/db/storage/wiredtiger/wiredtiger_kv_engine.cpp 704
2019-06-11T07:26:15.110+0000 F -        [initandlisten]

***aborting after fassert() failure
```


<br>

## Resolve

### 1. `chown -R mongodb:mongodb`의 결과를 유지
* mongod가 파일을 변경하기 전에 다른 user로 재시작을 해준다
* 아래의 명령어로 container가 종료될 때까지 계속 실행시켜서 종료 직전에도 `WiredTiger.turtle`, `WiredTigerLAS.wt`의 permission을 유지시켜준다
```sh
$ while true; do chown -R mongodb:mongodb /data/db
```

<br>

### 2. Init Containers 이용
* file system permission 처럼 원본 원본 Container가 실행하기 위한 환경을 구성하는데는 `init container`를 활용할 수 있다
```yaml
apiVersion: apps/v1
kind: StatefulSet
...
spec:
  template:
    spec:
      initContainers:
        - name: change-owner-data-dir
          image: busybox
          imagePullPolicy: IfNotPresent
          command: ["sh", "-c", "chown -R 999:999 /data/db"]
          volumeMounts:
            - mountPath: /data/db
              name: mongodb-storage
      containers:
        - name: mongodb
          image: mongo:{tag}
          imagePullPolicy: Always
          securityContext:
            runAsUser: 999
            runAsGroup: 999
          volumeMounts:
            - mountPath: /data/db
              name: mongodb-storage
  volumeClaimTemplates:
    - metadata:
        name: mongodb-storage
...
```

<br>

### 3. fsGroup 사용
* fsGroup으로도 file system permission issue를 해결할 수 있다
```yaml
apiVersion: apps/v1
kind: StatefulSet
...
spec:
  template:
    spec:
      containers:
        - name: mongodb
          image: mongo:{tag}
          imagePullPolicy: Always
          securityContext:
            runAsUser: 999
            runAsGroup: 999
            fsGroup: 999  # here
          volumeMounts:
            - mountPath: /data/db
              name: mongodb-storage
  volumeClaimTemplates:
    - metadata:
        name: mongodb-storage
...
```

<br>

## Conclusion
* Kubernetes에서 file system permission issue를 해결하는데는 다양한 방법이 있다
* `chown` 직접 사용
* `init container` 사용
* `securityContext.fsGroup` 사용


<br><br>

> #### Reference
> * [mongodb - docker hub](https://hub.docker.com/_/mongo)
> * [mongodb 4.1 Dockerfile](https://github.com/docker-library/mongo/blob/c93d83e504/4.1/Dockerfile)
> * [mongodb 3.4.3 Permission denied wiredtiger_kv_engine.cpp 267 error with ubuntu 16 - Stackoverflow](https://stackoverflow.com/a/43154346/6389139)
> * [Init Containers - Kubernetes Docs](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
> * [Configure a Security Context for a Pod or Container - Kubernetes Docs](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
> * [Access via Non-Root User](https://docs.portworx.com/portworx-install-with-kubernetes/storage-operations/create-pvcs/access-via-non-root-users/)
