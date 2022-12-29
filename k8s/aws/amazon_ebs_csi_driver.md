# [k8s] Amazon EBS CSI Driver
> date - 2022.12.29  
> keyworkd - kubernetes, k8s, aws, eks, ebs  
> Amazon EBS CSI Driver에 대해 정리  

<br>

## Amazon EBS(Elastic Block Store) CSI(Container Storage Interface) Driver란?
* Amazon EKS가 persistent volume을 위해 사용하는 Amazon EBS volume의 lifecycle를 관리할 수 있게한다
  * CSI Driver의 자체 lifecycle을 통해 자체 릴리즈, EOL 등을 통해 더 나은 유지 관리 가능
* CSI Driver를 사용하면 Kubernetes release와 CSI Driver release 주기를 분리할 수 있어 in-tree Amazon EBS plug-in 사용이 중단되었다
  * Amazon EKS 1.23 이후에는 기본적으로 활성화
  * 1.22 -> 1.23으로 업그레이드 전에 Amazon EBS CSI Driver를 설치해야 서비스 중단이 발생하지 않는다
* Amazon EBS CSI Driver가 AWS API 호출에 필요한 IAM 권한 필요
* Fargate Pod에는 volume을 붙일 수 없다
* Amazon EKS에서는 Amazon EBS CSI Driver의 alpha 기능을 지원하지 않는다
* Amazon EBS CSI Driver의 snapshot 기능을 사용하려면 [CSI Snapshotter](https://github.com/kubernetes-csi/external-snapshotter) 설치 필요
  * [CRD](https://github.com/kubernetes-csi/external-snapshotter/tree/master/client/config/crd) -> [RBAC](https://github.com/kubernetes-csi/external-snapshotter/blob/master/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml) -> [CSI Snapshotter Controller](https://github.com/kubernetes-csi/external-snapshotter/blob/master/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml)

<br>

### in-tree plugin -> Amazon EBS CSI Driver로 마이그레이션
* Amazon EBS CSI Driver 설치 후 StorageClass provisoner를 `kubernetes.io/aws-ebs` -> `ebs.csi.aws.com`로 수정하면 Amazon EBS CSI Driver를 사용하고, `kubernetes.io/aws-ebs`를 사용하면 in-tree plugin을 사용하게 된다
  * `kubernetes.io/aws-ebs`로 생성된 pv를 제어하려면 cluster를 1.23으로 업그레이드하거나 [Migrating Amazon EKS clusters from gp2 to gp3 EBS volumes](https://aws.amazon.com/ko/blogs/containers/migrating-amazon-eks-clusters-from-gp2-to-gp3-ebs-volumes)에 따라 재성성해주면 된다
* default volumn type이 gp2 -> gp3로 변경됨에 따라 gp3를 사용하도록 설정
* fsType -> csi.storage.k8s.io/fstype로 수정
* zone -> allowedTopologies로 수정
```yaml
## as-is
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: default
provisioner: kubernetes.io/aws-ebs
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: ext4
  type: gp2
  zone: ap-northeast-2c

## to-be
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: default
provisioner: ebs.csi.aws.com
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: ext4
  type: gp3
allowedTopologies:
  - matchLabelExpressions:
      - key: topology.ebs.csi.aws.com/zone
        values:
          - ap-northeast-2c
```

<br>

## Amazon EBS CSI Driver 설정하기

### 1. Amazon EBS CSI Driver가 사용할 IAM Role 생성
* AWS API를 호출하기 위해 필요

#### cluster의 OIDC provider url 확인
```sh
$ aws eks describe-cluster --name <my-cluster> \
                           --query "cluster.identity.oidc.issuer" \
                           --output text

https://oidc.eks.<region-code>.amazonaws.com/id/<xxx>
```
* 결과가 None이라면 [Creating an IAM OIDC provider for your cluster](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)를 진행

#### IAM Role 생성
* [IRSA(IAM Roles for service accounts)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 설정을 위해 OIDC provider에 대해 trust relationship 설정
```json
// aws-ebs-csi-driver-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account>:oidc-provider/oidc.eks.<region>.amazonaws.com/id/<xxx>"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.<region>.amazonaws.com/id/<xxx>:aud": "sts.amazonaws.com",
          "oidc.eks.<region>.amazonaws.com/id/<xxx>:sub": "system:serviceaccount:kube-system:ebs-csi-controller-sa"
        }
      }
    }
  ]
}
```

* IAM Role 생성
```sh
$ aws iam create-role --role-name <role name> \  # e.g. amazon-ebs-csi-driver-iam-role 
                      --assume-role-policy-document file://aws-ebs-csi-driver-trust-policy.json
```

* AWS managed IAM Policy인 `arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy` 연결
```sh
$ aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
                             --role-name <role name>  # e.g. amazon-ebs-csi-driver-iam-role 
```

#### Amazon EBS volume 암호화에 custom KMS key를 사용할 경우
```json
// kms-key-for-encryption-on-ebs.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:CreateGrant",
        "kms:ListGrants",
        "kms:RevokeGrant"
      ],
      "Resource": ["custom-key-id"],
      "Condition": {
        "Bool": {
          "kms:GrantIsForAWSResource": "true"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": ["custom-key-id"]
    }
  ]
}
```
```sh
$ aws iam create-policy --policy-name <policy name> \  # e.g. amazon-ebs-csi-driver-kms-iam-policy
                        --policy-document file://kms-key-for-encryption-on-ebs.json

$ aws iam attach-role-policy --policy-arn arn:aws:iam::<account>:policy/<policy name> \  # e.g. amazon-ebs-csi-driver-kms-iam-policy
                             --role-name <role name>  # e.g. amazon-ebs-csi-driver-iam-role 
```

#### `ebs-csi-controller-sa` ServiceAccount에 annotation 추가
* [IRSA(IAM Roles for service accounts)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 설정하기 위해 위에서 생성한 IAM Role을 넣어준다
```sh
$ kubectl -n kube-system annotate serviceaccount ebs-csi-controller-sa eks.amazonaws.com/role-arn=arn:aws:iam::<account>:role/<role name>
```

* result
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ebs-csi-controller-sa
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account>:role/<role name>
```

* ebs-csi-controller를 재시작 하면 IAM Role을 사용하게 된다
```sh
$ kubectl rollout restart deploy ebs-csi-controller -n kube-system
```

<br>

### 2. Amazon EBS CSI Driver 설치
* Amazon EBS CSI Driver와 csi controller(csi-provisioner, csi-attacher 등)가 실행되며 ebs-csi-controller(Deployment)는 AWS API로 **EBS volume 생성**하고 ebs-csi-node(DaemonSet)가 **Pod에 volume 연결**한다

#### Install
* kustomize
```sh
$ kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.14"
```

* helm
```sh
$ helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
$ helm repo update
$ helm upgrade --install aws-ebs-csi-driver \
               --namespace kube-system \
               aws-ebs-csi-driver/aws-ebs-csi-driver
```

#### Check
* aws-ebs-csi-driver와 관련된 k8s api 확인
```sh
$ kubectl api-resources | grep "storage.k8s.io/v1"

volumesnapshotclasses                          snapshot.storage.k8s.io/v1               false        VolumeSnapshotClass
volumesnapshotcontents                         snapshot.storage.k8s.io/v1               false        VolumeSnapshotContent
volumesnapshots                                snapshot.storage.k8s.io/v1               true         VolumeSnapshot
csidrivers                                     storage.k8s.io/v1                        false        CSIDriver
csinodes                                       storage.k8s.io/v1                        false        CSINode
csistoragecapacities                           storage.k8s.io/v1beta1                   true         CSIStorageCapacity
storageclasses                    sc           storage.k8s.io/v1                        false        StorageClass
volumeattachments                              storage.k8s.io/v1                        false        VolumeAttachment
```

* aws-ebs-csi-driver 확인
```sh
## or kubectl get po -n kube-system -l "app.kubernetes.io/name=aws-ebs-csi-driver,app.kubernetes.io/instance=aws-ebs-csi-driver"
$ kubectl get po -n kube-system -l 'app in (ebs-csi-controller,ebs-csi-node,snapshot-controller)'  
NAME                                 READY   STATUS    RESTARTS   AGE
ebs-csi-controller-7764f5dcd-7hhhz   5/5     Running   0          3m55s
ebs-csi-node-26ndq                   3/3     Running   0          3m55s
...

$ kubectl get csidrivers
NAME              ATTACHREQUIRED   PODINFOONMOUNT   STORAGECAPACITY   TOKENREQUESTS   REQUIRESREPUBLISH   MODES        AGE
ebs.csi.aws.com   true             false            false             <unset>         false               Persistent   3m22s
```

<br>

### 3. Dynamic Volume Provisioning
* `dynamic-volume-provisioning.yaml`를 생성
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
# https://kubernetes.io/docs/concepts/storage/storage-classes/#aws-ebs
# https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/parameters.md
parameters:
  csi.storage.k8s.io/fstype: xfs
  type: io1
  iopsPerGB: "50"
  encrypted: "true"
allowedTopologies:
- matchLabelExpressions:
  - key: topology.ebs.csi.aws.com/zone
    values:
    - us-east-2c
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ebs-claim
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-sc
  resources:
    requests:
      storage: 4Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: centos
    command: ["/bin/sh"]
    args: ["-c", "while true; do echo $(date -u) >> /data/out.txt; sleep 5; done"]
    volumeMounts:
    - name: persistent-storage
      mountPath: /data
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: ebs-claim
```

* k8s object 생성
```sh
$ kubectl apply -f dynamic-volume-provisioning.yaml

persistentvolumeclaim/ebs-claim created
pod/app created
storageclass.storage.k8s.io/ebs-sc created
```

* check
```sh
$ kubectl get pvc
```

* cleanup
```sh
$ kubectl delete -f dynamic-volume-provisioning.yaml
```


<br>

## Tagging
* CSI driver는 관리하는 volume에 자동으로 CSIVolumeName, CSIVolumeSnapshotName, ebs.csi.aws.com/cluster 등의 tag를 추가

### StorageClass Tagging
* prefix `tagSpecificaftion`가 있는 경우 dynamic provisioned volume에 tag를 추가
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
parameters:
  tagSpecificaftion_1: "key1=value1"
  tagSpecificaftion_2: "key2=hello world"
  tagSpecificaftion_3: "key3="
  tagSpecificaftion_env: "env=test"
```
* result
```
key1=value1
key2=hello world
key3=<empty string>
env=test
```

<br><br>

> #### Reference
> * [Amazon EBS CSI driver - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)
> * [Amazon Elastic Block Store (EBS) CSI driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)
> * [IRSA(IAM Roles for service accounts)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
> * [CSI Snapshotter](https://github.com/kubernetes-csi/external-snapshotter)
> * [Installation](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/install.md)
> * [Kubernetes Examples](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/tree/master/examples/kubernetes)
> * [Migrating Amazon EKS clusters from gp2 to gp3 EBS volumes](https://aws.amazon.com/ko/blogs/containers/migrating-amazon-eks-clusters-from-gp2-to-gp3-ebs-volumes)
