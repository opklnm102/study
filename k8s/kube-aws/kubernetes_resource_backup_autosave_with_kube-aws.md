# [kube-aws] Kubernetes Resource Backup / Autosave
> date - 2019.02.26  
> keyword - kubernetes, k8s, aws, infrastructure as code  
> kube-aws가 k8s resource를 backup하는 방법을 알아보자


<br>

## kube-resources-autosave란?
* kubernetes resource를 backup하려면 cluster.yaml 수정
```yaml
# cluster.yaml

kubeResourcesAutosave:
  enabled: true
```

* `kube-system` namespace에 Deployment로 `Kubernetes resources의 snapshot을 AWS S3에 upload`하는 Single Pod을 실행
  * 같은 volume을 공유하는 2개의 container로 구성
* Pod이 실행된 시점으로 부터 **24시간 마다** backup
* snapshot은 timestamp로 분류되어 저장
  * ex) 2019-02-13_00-49-27
* 새로운 cluster에서 resource를 복원하기 위해 status, uid 등 여러 필드 생략
* namespace 내부 resource는 namespace 이름으로 그룹화
* namespace 외부 resource는 namespace 폴더와 같은 level의 디렉토리에서 그룹화
* backup은 S3 URI `s3://<your-bucket-name>/kube-aws/clusters/<your-cluster-name>/backup/*`에 저장
* S3와의 연결을 항상 보장하지 못하기 때문에 backup 파일의 exportation/synchronisation은 매번 성공을 보장하지 않는다
  * `Could not connect to the endpoint URL: "https://..."` error로 pusher container가 없을 수 있기 때문에
  * [#591](https://github.com/kubernetes-incubator/kube-aws/issues/591) 참고


<br>

## kube-aws directory 구조
```
└── kube-aws
    └── clusters
        └── my-cluster  # cluster name
            ├── backup
            │   └── 2019-02-13_00-49-27  # yyyy-MM-dd_HH-mm-ss
            │       ├── clusterrolebindings.json
            │       ├── clusterroles.json
            │       ├── default  # namespace
            │       │   ├── componentstatuses.json
            │       │   ├── configmaps.json
            │       │   ├── customresourcedefinitions.json
            │       │   ├── daemonsets.json
            │       │   ├── deployments.json
            │       │   ├── endpoints.json
            │       │   ├── events.json
            │       │   ├── horizontalpodautoscalers.json
            │       │   ├── ingresses.json
            │       │   ├── jobs.json
            │       │   ├── limitranges.json
            │       │   ├── networkpolicies.json
            │       │   ├── persistentvolumeclaims.json
            │       │   ├── poddisruptionbudgets.json
            │       │   ├── pods.json
            │       │   ├── podsecuritypolicies.json
            │       │   ├── podtemplates.json
            │       │   ├── replicasets.json
            │       │   ├── replicationcontrollers.json
            │       │   ├── resourcequotas.json
            │       │   ├── rolebindings.json
            │       │   ├── roles.json
            │       │   ├── secrets.json
            │       │   ├── serviceaccounts.json
            │       │   ├── services.json
            │       │   └── statefulsets.json
            │       ├── namespaces.json
            │       ├── nodes.json
            │       ├── persistentvolumes.json
            │       └── storageclasses.json
            ├── exported
            │   └── stacks
            │       ├── control-plane
            │       │   ├── stack.json
            │       │   └── userdata-controller-7882f2a55f9ebe4ee960f8ea7a493da7bc951939e9dc4b97f993071f039d79b6
            │       ├── default-pool
            │       │   ├── stack.json
            │       │   └── userdata-worker-faca7dc499503b60cbfa5bd215469a9c2ae618ff103dbea679f551cb9b765d45
            │       ├── etcd
            │       │   ├── stack.json
            │       │   └── userdata-etcd-d8e9eb8d9a08298c370be5a1ccc7f4a28dd3896fa34dd6a1b37695b0ca328dd4
            │       ├── network
            │       │   └── stack.json
            │       ├── private-pool
            │       │   ├── stack.json
            │       │   └── userdata-worker-d10e2f0f8836b4d09fe3a4431bdc0f5d83cf66618f7f0ba299224c4d02f4a232
            │       └── stage
            │           └── stack.json
            └── instances
                └── 5aa76e80-fce6-11e8-a359-0e7851ff27a6  # AWS CloudFormation Stack ID postfix
                    └── etcd-snapshots
                        └── snapshot.db
```
* backup - kube-resource-autosaver로 인해 backup 당시의 Cluster 형상의 snapshot이 `.json` format으로 저장되는 위치
* exported/stacks - AWS CloudFormation stack 데이터 저장 위치
* instances - buintin/etcdadm에 의해 etcd snapshot이 저장되는 위치


<br>

## kube-resources-autosave는 2개의 container로 구성
* kube-resources-autosave-dumper, kube-resources-autosave-pusher

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
name: kube-resources-autosave
namespace: kube-system
labels:
  k8s-app: kube-resources-autosave-policy
spec:
replicas: 1
template:
  ...
  containers:
  - name: kube-resources-autosave-dumper
    ...
  - name: kube-resources-autosave-pusher
    ...
  volumes:
  - name: dump-dir
    emptyDir: {}
```


<br>

### kube-resources-autosave-dumper
* cluster 데이터를 **backup하는 역할**
```yaml
- name: kube-resources-autosave-dumper
  mage: k8s.gcr.io/hyperkube-amd64:latest
  command: ["/bin/sh", "-c" ]
  args:
    - |
      set -x ;
      DUMP_DIR_COMPLETE=/kube-resources-autosave/complete ;
      aws configure set s3.signature_version s3v4 ;
      mkdir -p ${DUMP_DIR_COMPLETE} ;
      while true; do
        TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
        DUMP_DIR=/kube-resources-autosave/tmp/${TIMESTAMP} ;
        mkdir -p ${DUMP_DIR} ;
        RESOURCES_OUT_NAMESPACE="namespaces persistentvolumes nodes storageclasses clusterrolebindings clusterroles";
        for r in ${RESOURCES_OUT_NAMESPACE};do
          echo " Searching for resources: ${r}" ;
          /kubectl get --export -o=json ${r} | \
          jq '.items |= ([ .[] |
            del(.status,
                .metadata.uid,
                .metadata.selfLink,
                .metadata.resourceVersion,
                .metadata.creationTimestamp,
                .metadata.generation,
                .spec.claimRef
                )])' > ${DUMP_DIR}/${r}.json ;
        done ;
        RESOURCES_IN_NAMESPACE="componentstatuses configmaps daemonsets deployments endpoints events horizontalpodautoscalers
        ingresses jobs limitranges networkpolicies  persistentvolumeclaims pods podsecuritypolicies podtemplates replicasets
        replicationcontrollers resourcequotas secrets serviceaccounts services statefulsets customresourcedefinitions
        poddisruptionbudgets roles rolebindings";
        for ns in $(jq -r '.items[].metadata.name' < ${DUMP_DIR}/namespaces.json);do
          echo "Searching in namespace: ${ns}" ;
          mkdir -p ${DUMP_DIR}/${ns} ;
          for r in ${RESOURCES_IN_NAMESPACE};do
            echo " Searching for resources: ${r}" ;
            /kubectl --namespace=${ns} get --export -o=json ${r} | \
            jq '.items |= ([ .[] |
              select(.type!="kubernetes.io/service-account-token") |
              del(
                .spec.clusterIP,
                .metadata.uid,
                .metadata.selfLink,
                .metadata.resourceVersion,
                .metadata.creationTimestamp,
                .metadata.generation,
                .metadata.annotations."pv.kubernetes.io/bind-completed",
                .status
              )])' > ${DUMP_DIR}/${ns}/${r}.json && touch /probe-token ;
          done ;
        done ;
      mv ${DUMP_DIR} ${DUMP_DIR_COMPLETE}/${TIMESTAMP} ;
      rm -r -f ${DUMP_DIR} ;
      sleep 24h ;
      done
  livenessProbe:
    exec:
      command: ["/bin/sh", "-c",  "AGE=$(( $(date +%s) - $(stat -c%Y /probe-token) < 25*60*60 ));  [ $AGE -gt 0 ]" ]
    initialDelaySeconds: 240
    periodSeconds: 10
  volumeMounts:
  - name: dump-dir
    mountPath: /kube-resources-autosave
    readOnly: false
```
* `kubectl get --export -o=json <resource>`, `jq`로 cluster 정보를 추출한다
  * namespace 외부 resouce backup 후 namespace 내부 resource backup, 그리고 livenessProbe에서 사용할 `probe-token` 파일 생성
  * probe-token이 생성된지 25시간 이상지나면 backup에 이상이 발생한걸로 판단하고 container를 kill하기 위해 사용


<br>

### kube-resources-autosave-pusher
* kube-resources-autosave-dumper가 backup한 데이터를 **S3로 upload하는 역할**
```yaml
- name: kube-resources-autosave-pusher
  image: quay.io/coreos/awscli:master
  command: ["/bin/sh", "-c" ]
  args:
    - |
      set -x ;
      DUMP_DIR_COMPLETE=/kube-resources-autosave/complete ;
      while true; do
        for FILE in ${DUMP_DIR_COMPLETE}/* ; do
          aws s3 mv ${FILE} s3://{{ .KubeResourcesAutosave.S3Path }}/$(basename ${FILE}) --recursive && rm -r -f ${FILE} && touch /probe-token ;
        done ;
        sleep 1m ;
      done
  livenessProbe:
    exec:
      command: ["/bin/sh", "-c",  "AGE=$(( $(date +%s) - $(stat -c%Y /probe-token) < 25*60*60 ));  [ $AGE -gt 0 ]" ]
    initialDelaySeconds: 240
    periodSeconds: 10
  volumeMounts:
  - name: dump-dir
    mountPath: /kube-resources-autosave
    readOnly: false
```
* 1분마다 `/kube-resources-autosave/complete`에 backup한 데이터가 있다면 S3에 upload 후 데이터 삭제, 그리고 livenessProbe에서 사용할 `probe-token` 파일 생성
  * probe-token이 생성된지 25시간 이상지나면 upload에 이상이 발생한걸로 판단하고 container를 kill하기 위해 사용


<br><br>

> #### Reference
> * [Kubernetes Resource Backup / Autosave - kube-aws docs](https://kubernetes-incubator.github.io/kube-aws/add-ons/cluster-resource-backup-to-s3.html)
