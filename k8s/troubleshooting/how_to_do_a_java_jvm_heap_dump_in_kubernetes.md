# [k8s] How to do a Java/JVM heap dump in Kubernetes
> date - 2022.10.15  
> keyworkd - kubernetes, jvm, heap  
> java application은 request를 처리를 위한 object를 할당하기 위해 일정 수준의 memory가 필요한데 GC(Garbage Collection) 후에도 memory가 부족하다면 memory leak을 의심해 볼 수 있다  
> memory leak 발생시 지나치게 많이 존재하는 object를 찾기 위해 heap dump를 분석해야하는데 heap dump를 만드는 방법에 대해 정리해본다  

<br>

## jps
* jps를 통해 JVM process 조회하여 pid를 확인한다
```sh
$ jps

1 app.jar
...

## -v로 argument 확인
$ jps -v
1 app.jar -XX:+UseG1GC ...
```


<br>

## Manual Process

### 1. traffic을 받는 서비스에서 제외
* traffic이 많거나 heap memory가 큰 경우 jmap 명령 수행시 application이 일시 정지되어 장애가 발생할 수 있으므로 서비스에서 제외해야한다
```sh
## label을 제거하여 서비스에서 제외한다
$ kubectl label pod <pod name> app-
```

<br>

### 2. jmap으로 heap dump 생성 및 local로 다운로드
* JVM process의 memory map 확인시 사용하며 heap memory를 dump하여 분석해볼 수 있다
```sh
## dump all object in heap
$ jmap -dump:live,format=b,file=<file name>.hprof <pid>

## dump live object in heap
$ jmap -dump:format=b,file=<file name>.hprof <pid>

## container의 heap dump 생성 후 local로 복사
## Pod에서 file path와 pid는 다를 수 있으나, pid는 일반적으로 1
$ kubectl exec -it <pod name> -c <container name> -- jmap -dump:live,format=b,file=dump.hprof 1 \
  && kubectl cp -c <container name> <namespace>/<pod name>:/home/app/dump.hprof ~/dump.hprof
```

* memory usage, gc monitoring
```sh
## -h10 - 10줄마다 header print
## -t - timestamp print
$ jstat -gc -h10 -t <pid> <interval>

## 10000ms마다 print
$ jstat -gc -h10 -t 6705 10000
```

* thread dump - https://fastthread.io
```sh
$ jstack <pid> >> <file name>
```

<br>

### 3. 서비스에 추가
* 서비스에 추가하여 traffic을 보낸다
```sh
$ kubectl label pod <pod name> app=<app name>
```


<br>

## Automation Process

### Pod lifecycle hook에서 jmap을 사용해서 heap dump 생성
* PVC를 사용해 데이터를 보관하며, Pod 종료시에 무조건 heap dump가 생성되므로 필요할 경우에만 설정하여 사용해야한다
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oom-test
spec:
  template:
    spec:
      containers:
        - name: oom-test
          image: <your image>
          lifecycle:
            preStop:
              exec:
                command:
                  - sh
                  - -c
                  - "jmap -dump:live,format=b,file=/dumps/$(hostname).hprof 1"
          volumeMounts:
            - mountPath: /dumps
              name: heap-dumps
      terminationGracePeriodSeconds: 600
      volumes:
        - name: heap-dumps
          persistentVolumeClaim:
            claimName: oom-test
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: oom-test
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: default
  resources:
    requests:
      storage: 5Gi
```

<br>

### `-XX:+HeapDumpOnOutOfMemoryError` 사용
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oom-test
spec:
  template:
    spec:
      containers:
        - name: oom-test
          image: <your image>
          env:
            # Cloud Native Buildpacks 기반 image로 JAVA_TOOL_OPTIONS으로 java option 설정
            - name: JAVA_TOOL_OPTIONS
              value: |
                -XX:+HeapDumpOnOutOfMemoryError
                -XX:HeapDumpPath=/dumps/dump.hprof
          volumeMounts:
            - name: heap-dumps
              mountPath: /dumps
          # emptyDir로 container 사이에 volume 공유
        - name: ship-heap-dump
          image: amazon/aws-cli:2.8.3
          command: ["/bin/sh", "-c"]
          args:
            - |
              amazon-linux-extras install -y epel &&
              yum install -y inotify-tools gzip &&
              inotifywait -m /dumps -e close_write | while read path action file; do gzip "$path$file"; aws s3 cp "$path$file.gz" "s3://${S3_BUCKET_NAME}/${HOSTNAME}.hprof.gz"; done;
          volumeMounts:
            - name: heap-dumps
              mountPath: /dumps
          env:
            - name: S3_BUCKET_NAME
              value: "<your Amazon S3 bucket>"
      volumes:
        - name: heap-dumps
          emptyDir: {}
```
* java option에 `-XX:+HeapDumpOnOutOfMemoryError`, `-XX:HeapDumpPath=dump.hprof`을 사용하여 `java.lang.OutOfMemoryError: Java heap space` 발생시 heap dump를 생성
* `inotifywait`를 사용하여 heap dump file write 완료시 Amazon S3 bucket으로 업로드한다
* `gzip`을 사용하면 file size가 큰 경우 network bandwidth, 속도 등에서 이득을 볼 수 있으므로 사용하길 추천한다

#### custom image 생성
* `amazon/aws-cli` image에 `inotify-tools`, `gzip`이 설치되어 있지 않아 startup이 느리므로 custom image 생성 후 사용하는 것도 가능하다
```dockerfile
FROM amazon/aws-cli:2.8.3

RUN amazon-linux-extras install -y epel \
    && yum install -y inotify-tools gzip \
    && yum clean all
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oom-test
spec:
  template:
    spec:
      containers:
        - name: oom-test
          image: <your image>
          env:
            # Cloud Native Buildpacks 기반 image로 JAVA_TOOL_OPTIONS으로 java option 설정
            - name: JAVA_TOOL_OPTIONS
              value: |
                -XX:+HeapDumpOnOutOfMemoryError
                -XX:HeapDumpPath=/dumps/dump.hprof
          volumeMounts:
            - name: heap-dumps
              mountPath: /dumps
          # emptyDir로 container 사이에 volume 공유
        - name: ship-heap-dump
          image: <your custom aws-cli image>
          imagePullPolicy: Always
          command: ["/bin/sh", "-c"]
          args:
            - |
              inotifywait -m /dumps -e close_write | while read path action file; do gzip "$path$file"; aws s3 cp "$path$file.gz" "s3://${S3_BUCKET_NAME}/${HOSTNAME}.hprof.gz"; done;
          volumeMounts:
            - name: heap-dumps
              mountPath: /dumps
          env:
            - name: S3_BUCKET_NAME
              value: "<your Amazon S3 bucket>"
      volumes:
        - name: heap-dumps
          emptyDir: {}
```


####
* java container log
```java
Picked up JAVA_TOOL_OPTIONS: -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/dump.hprof ...
...
java.lang.OutOfMemoryError: Java heap space
Dumping heap to /dumps/dump.hprof ...
Heap dump file created [1172049464 bytes in 7.072 secs]
Terminating due to java.lang.OutOfMemoryError: Java heap space
```

* ship-heap-dump container log
```sh
Setting up watches.
Watches established.
upload: ../dumps/dump.hprof.gz to s3://<your bucket>/oom-test-687556b4dd-nn9ms.hprof.gz
```


<br>

## Conclusion
* 수동/자동으로 java heap memory dump를 생성하는 방법을 알아보았고, 상황에 맞는 방법으로 생성한 dump file을 Intellij IDEA에서 분석해보면 된다


<br><br>

> #### Reference
> * [How to get a heap dump from Kubernetes k8s pod?](https://stackoverflow.com/questions/64121941/how-to-get-a-heap-dump-from-kubernetes-k8s-pod)
> * [How to do a Java/JVM heap dump in Kubernetes](https://danlebrero.com/2018/11/20/how-to-do-java-jvm-heapdump-in-kubernetes/)
> * [How to Dump OOMKilled Process on Kubernetes](https://medium.com/@pamir.erdem/how-to-dump-oomkilled-process-on-kubernetes-b77cccf421a2)
