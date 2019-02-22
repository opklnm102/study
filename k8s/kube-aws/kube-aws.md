# [kube-aws] Getting Started kube-aws
> date - 2019.02.14  
> keyword - kubernetes, k8s, aws, infrastructure as code  
> 사내에서 k8s를 AWS에 provisioning하기 위해 사용하고 있는 kube-aws에 대해 알아보자  

<br>

## kube-aws란?
* Kubernetes on AWS
* AWS에서 kubernetes cluster를 declaratively manage를 위한 CLI Tool
  * cluster의 create, update, destroy 지원
* apply 전에 변경사항 review 가능
* multi-AZ deployment와 Node Pools를 이용한 Highly available, scalable kubernetes cluster 구축
* 기존에 존재하는 VPC에 배포
  * 운영중인 VPC에서 kubernetes로 마이그레이션할 때 유용
* 다양한 AWS service 지원
  * CloudFormation
  * KMS
  * Auto Scaling
  * Spot Fleet
  * EC2
  * ELB
  * S3
  * ...
* Kubernetes Incubator project


<br>

## Pre-Requisites
* [AWS CLI](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-install.html)
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [EC2 Key Pair](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
  * ??
* Route53의 hosted-zone-id, DNS Name
* [KMS Key](https://docs.aws.amazon.com/ko_kr/kms/latest/developerguide/create-keys.html)의 ARN
  * ??
* [S3 Bucket](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/gsg/CreatingABucket.html)
  * kube-aws의 asset이 저장될 위치
* EC2 instance type은 t2.medium 이상을 사용
  * Memory와 CPU를 사용하는 heapster, dashboard 같은 default component를 포함하기 때문
  * controller, etcd는 1x m3.medium의 spec이 필요, HA를 위해서는 3x m3.medium 필요
* HA를 위해 최소 3 etcd, 2 controller, 2 worker node 필요

### VPC ID, Route Table ID 등의 기존에 존재하던 AWS Resource를 제공하면 변경이 없도록 동작
* 제공된 리소스로 정상 동작하는지 확인 필요
* 제공하지 않으면 kube-aws가 생성
* kube-aws가 수정하는 것
  * host zone에 k8s API endpoint의 record set 추가
  * VPC에 하나 이상의 subnet 추가
  * Route Table에 하나 이상의 subnet 연결
* 기존 AWS Resource에 대한 다른 구성은 kube-aws를 사용하기 전에 미리 구성해야 한다

#### 기존 VPC ID를 설정하면
* internet gateway or NAT gateway 추가 필요
  * fleet, hypterkube, etcd, awscli, cfn-signal, cfn-init 같은 필수 프로세스를 실행하는데 필요한 docker image 또는 ACIs를 가져올 수 없어서 모든 Node를 시작할 수 없기 때문
* Route Table에 0.0.0.0/0을 internet gateway로 routing하도록 수정
* Route Table, subnet에 `kubernetes.io/cluster/$CLUSTER_NAME: shared` 추가 필요
  * type=LoadBalancer의 k8s service에 해당하는 ELB를 만들지 못하기 때문
* cluster 생성 전 VPC에 `DNS Hostnames`를 enable
  * etcd Node가 서로 통신할 수 없어서 cluster가 동작하지 않기 때문

> 자세한건 [cluster.yaml](https://github.com/kubernetes-incubator/kube-aws/blob/master/builtin/files/cluster.yaml.tmpl) 참고


<br>

## 1. Configure

### Download kube-aws
```sh
$ KUBE_AWS_VERSION="v0.12.3"
$ PLATFORM="darwin-amd64"

$ curl -L "https://github.com/kubernetes-incubator/kube-aws/releases/download/${KUBE_AWS_VERSION}/kube-aws-${PLATFORM}.tar.gz" | tar zx

$ sudo mv ${PLATFORM}/kube-aws /usr/local/bin
$ kube-aws --help
```
* `curl -L <download link>` - Github는 파일 저장소로 redirect시키기 때문에 `-L` 필요


<br>

### Configure AWS credentials
* 아래 방법 중 하나로 AWS CLU를 사용하기 위한 credentials을 설정

#### 1. Configure command
```sh
$ aws configure

AWS Access Key ID [None]: MY_ACCESS_KEY
AWS Secret Access Key [None]: MY_SECRET_KEY
Default region name [None]: us-west-2
Default output format [None]: text
```

#### 2. Config file
* `~/.aws/credentials`에 아래 내용 추가
* `aws configure`로 하는 것을 직접하는 방법
```sh
[default]
aws_access_key_id = MY_ACCESS_KEY
aws_secret_access_key = MY_SECRET_KEY
```

#### 3. Environment variables
```sh
export AWS_ACCESS_KEY_ID=MY_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=MY_SECRET_KEY
```

* 기존에 설정한 configure profile을 `AWS_PROFILE`를 이용해 사용할 수 있다
```sh
$ AWS_PROFILE=my-profile kube-aws init ...
```

* Multi-Factor Authentication(MFA)를 사용하면 Session Token을 사용
```sh
export AWS_SESSION_TOKEN=MY_SESSION_TOKEN
```

### Test Credentials
* 위에서 설정한 credentials이 제대로 동작하는지 확인
```sh
$ aws ec2 describe-instances
```


<br>

## 2. Render
* AWS CLI를 사용

### Cluster parameters
* cluster launch에 필요한 조건들을 구성

#### EC2 key pair
* EC2 instance에 ssh access를 위한 인증키로 사용
* 각 CoreOS node에 public key가 설정된다
* key-pair로 같은 region의 EC2 instance에만 접근 가능

#### KMS key
* Cluster의 TLS asset을 암호화하는데 사용
* 기존 KMS Key를 사용하려면 arn을 사용
* AWS Console or AWS CLI로 생성 후 `KeyMetadata.Arn` 기억
```sh
$ aws kms --region=ap-northeast-1 create-key --description="kube-aws assets"
{
    "KeyMetadata": {
        "AWSAccountId": "xxxxxxxxxxxxx",
        "KeyId": "xxxxxxxxx",
        "Arn": "arn:aws:kms:us-west-1:xxxxxxxxx:key/xxxxxxxxxxxxxxxxxxx",
        "CreationDate": 1550749534.95,
        "Enabled": true,
        "Description": "kube-aws assets",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "KeyState": "Enabled",
        "Origin": "AWS_KMS",
        "KeyManager": "CUSTOMER"
    }
}
```

#### External DNS Name
* Cluster API에 접근할 수 있는 DNS hostname
* DNS hostname으로 internet을 통해 다른 network에서 연결 가능
* API server에 대한 TLS certificate를 제공하는데 사용
* Cluster가 생성되면 internet-facing ELB에서 TLS-secured API 노출
* kube-aws는 `--hosted-zone-id`를 통해 지정된 Route53 host zone에 ELB에 대한 ALIAS record 생성
  * 수동으로 ALIAS record, CNAME record를 설정하려면 `--no-record-set`을 사용
* ELB public endpoint 확인
```sh
$ kube-aws status

./stgbin/kube-aws status
Cluster Name:           xxxx
Controller DNS Names:   xxxx-Con-APIEndpo-1AJX9JJS3T7OZ-156749563.ap-northeast-1.elb.amazonaws.com
```

#### S3 Bucket
* kube-aws가 생성한 large stack template을 CloudFormation으로 전송하는데 사용
* 기존에 있는 bucket을 사용할 경우 URI를 제공하면 된다
* AWS Console or AWS CLI로 생성
```sh
## us-east-1
$ aws s3api --region=us-east-1 create-bucket --bucket <my-bucket-name>
{
  "Location": "/<my-bucket-name>"
}

## other region
$ aws s3api create-bucket --bucket <my-bucket-name> --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1
```


<br>

### Initialize an asset directory
* cluster 기본 설정 파일인 `cluster.yaml` 생성
  * 필요한 옵션들을 수정할 수 있다
* KMS arn, EC2 key pair name, DNS name, s3 bucket을 사용
```sh
$ kube-aws init \
  --cluster-name=my-cluster-name \
  --region=us-west-1 \
  --availability-zone=us-west-1a \
  --hosted-zone-id=ZBN159WIK8JJD \
  --external-dns-name=my-cluster-endpoint \
  --key-name=ec2-key-pair-name \
  --kms-key-arn="arn:aws:kms:us-west-1:xxxxxxxx:key/xxxxxxxxxxxxxxx" \
  --s3-uri=s3://my-kube-aws-assets-bucket/

Success! Created cluster.yaml

Next steps:
1. (Optional) Edit cluster.yaml to parameterize the cluster.
2. Use the "kube-aws render" command to render the CloudFormation stack template and coreos-cloudinit userdata.
```

<br>

### Render contents of the asset directory
* Node간 통신, cluster administer를 위한 TLS assets 생성

#### TLS identities & certificate authority 생성
* 간단한 방법이지만 production에는 권장하지 않는다
```sh
$ kube-aws render credentials --generate-ca

Generating credentials...
-> Generating new TLS CA
-> Generating new assets
--> Summarizing the configuration
    Kubelet TLS bootstrapping enabled=false, TLS certificates managed by kube-aws=true, CA key required on controller nodes=false
--> Writing to the storage
Writing 1070 bytes to credentials/ca.pem
Creating a symlink from worker-ca.pem to ca.pem
Writing 1302 bytes to credentials/apiserver.pem
...
--> Verifying the result
```


#### certificate signing authority를 제공
* 제공된 certificate signing authority에 대한 TLS credential 생성
* 권장하는 방법
```sh
$ kube-aws render credentials --ca-cert-path=/path/to/ca-cert.pem --ca-key-path=/path/to/ca-key.pem
```
* 암호화된 CA key인 경우 암호를 묻는 메시지 표시
  * `KUBE_AWS_CA_KEY_PASSPHRASE`를 설정해 자동화 가능

#### PKI infrastructure가 있는 경우 
* TLS asset을 생성해서 `credentials/`에 저장하고 사용할 수 있다
```sh
$ ls -R credentials/

admin-key.pem  apiserver-key.pem   ca-key.pem
admin.pem      apiserver.pem       ca.pem
```

<br>

### Render cluster assets
* CloudFormation stack templates & user data 생성
* 생성된 파일들을 기반으로 cluster를 deploy한다
* credentials에는 TLS secrets, access token이 있으므로 암호화하거나 안전한 저장소에 보관
* kube-aws가 생성한 인증서는 유효기간이 90일, CA는 365일이므로 production에는 독립적으로 PKI를 설정하는게 좋다
  * [Certificates and Keys](https://kubernetes-incubator.github.io/kube-aws/getting-started/step-2-render.html#certificates-and-keys) 참고

```sh
$ kube-aws render stack
Success! Stack rendered to ./stack-templates.

Next steps:
1. (Optional) Validate your changes to cluster.yaml with "kube-aws validate"
2. (Optional) Further customize the cluster by modifying templates in ./stack-templates or cloud-configs in ./userdata.
3. Start the cluster with "kube-aws up".

$ tree
.
├── cluster.yaml
├── credentials
│   ├── admin-key.pem
│   ├── admin.pem
│   ├── apiserver-aggregator-key.pem
│   ├── apiserver-aggregator.pem
│   ├── apiserver-key.pem
│   ├── apiserver.pem
│   ├── ca-key.pem
│   ├── ca.pem
│   ├── encryption-config.yaml
│   ├── etcd-client-key.pem
│   ├── etcd-client.pem
│   ├── etcd-key.pem
│   ├── etcd-trusted-ca.pem -> ca.pem
│   ├── etcd.pem
│   ├── kiam-agent-key.pem
│   ├── kiam-agent.pem
│   ├── kiam-ca.pem
│   ├── kiam-server-key.pem
│   ├── kiam-server.pem
│   ├── kube-controller-manager-key.pem
│   ├── kube-controller-manager.pem
│   ├── kube-scheduler-key.pem
│   ├── kube-scheduler.pem
│   ├── kubelet-tls-bootstrap-token
│   ├── service-account-key.pem
│   ├── tokens.csv
│   ├── tokens.csv.enc
│   ├── tokens.csv.fingerprint
│   ├── worker-ca-key.pem -> ca-key.pem
│   ├── worker-ca.pem -> ca.pem
│   ├── worker-key.pem
│   └── worker.pem
├── kubeconfig
├── stack-templates
│   ├── control-plane.json.tmpl
│   ├── etcd.json.tmpl
│   ├── network.json.tmpl
│   ├── node-pool.json.tmpl
│   └── root.json.tmpl
└── userdata
    ├── cloud-config-controller
    ├── cloud-config-etcd
    └── cloud-config-worker
```


<br>

### Customizations to your cluster
* asset을 수정하고 `render, validate`로 cluster customization


#### Customize infrastructure
* cluster.yaml
  * cluster 설정 파일
  * userdata와 CloudFormation stack에 template으로 구성된 configuration parameter가 들어있다
  * worker 수
  * 생성된 모든 resource에 tag 지정
  * 기존 VPC내에 cluster 생성
  * controller와 worker의 volume size 변경
* userdata/
  * cloud-config-controller
  * cloud-config-etcd
  * cloud-config-worker
  * [cloud-init](https://github.com/coreos/coreos-cloudinit) cloud-config userdata가 들어있다
  * CoreOS는 cluster를 생성하는데 필요한 다양한 파일, script, systemd action을 cloud-config를 통한 automated provisioning 지원
  * 이런 파일들은 cluster configuration parameter로 template화 되고 CloudFormation stack template에 포함되어 있다
  * 일반적인 사용
    * [mounting ephemeral disk](https://coreos.com/os/docs/latest/mounting-storage.html)
    * [allow pods to mount RDB](https://github.com/coreos/coreos-kubernetes/blob/master/Documentation/kubelet-wrapper.md#allow-pods-to-use-rbd-volumes) or [iSCSI volumes](https://github.com/coreos/coreos-kubernetes/blob/master/Documentation/kubelet-wrapper.md#allow-pods-to-use-iscsi-mounts)
    * [allowing access to insecure container registries](https://coreos.com/os/docs/latest/registry-authentication.html#using-a-registry-without-ssl-configured)
    * [use host DNS configuration instead of a public DNS server](https://github.com/coreos/coreos-kubernetes/blob/master/Documentation/kubelet-wrapper.md#use-the-hosts-dns-configuration)
    * [changing your CoreOS auto-update settings](https://coreos.com/os/docs/latest/cloud-config.html#update)
* stack-template.json
  * cluster와 관련된 모든 AWS resource를 포함한 AWS CloudFormation stack 설명
  * JSON 형식
  * userdata처럼 configuration parameter로 template화 되어 있다
  * 일반적인 사용
    * AutoScaling rules and timing 조정
    * instance IAM roles
    * 초기 설정이상의 security group 구성
* credentials/
  * cluster의 encrypted/unencrypted TLA assets과 kubectl을 통해 cluster API에 access하기 위해 pre-configured `kubeconfig`가 들어 있다
  * [Static Token File - k8s docs](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#static-token-file)에 나온 것처럼 `tokens.csv`에 access token을 지정할 수 있다

#### Kubernetes Container Runtime
* container runtime으로 rkt 선택 가능
* rkt를 사용하려면 `CoreOS >= v1151.0.0`이고 runtime flag를 수정해야 한다
```yaml
# cluster.yaml

containerRuntime: rkt
releaseChannel: stable
```

#### Calico network policy
* Calico로 [network policy](https://kubernetes.io/docs/concepts/services-networking/network-policies/)를 제공할 수 있게 선택 가능
* 다른 pod, namespaces 등이 서로 통신할 수 있는 방법을 제한하고 제어한다
* rule은 cluster가 시작된 후 관리할 수 있지만 미리 켜야한다

```yaml
# cluster.yaml

useCalico: true
```

#### Route53 Host Record
* `kube-aws init`시 `--hosted-zone-id`를 지정하면 기존 Route53 hosted zone에서 controller의 ELB에 대한 ALIAS record 생성할 수 있다
* `--no-record-set`을 사용해 `kube-aws init`한 경우 cluster.yaml을 수정 필요
```yaml
apiEndpoints:
- name: default
  dnsName: kubernetes.staging.example.com
  loadBalancer:
    hostedZone:
      id: A12BB3CDE422
...
```
* `createRecordSet`이 true가 아닌 경우 deployer는 cluster 생성 후 Controller Node를 관리하는 ELB로 externalDNSName을 라우팅 가능하게 만드는 작업을 담당

#### Multi-AZ Clusters
* Cluster를 여러 Availability Zone에 `확산`시킨다

##### EBS & Persistent Volumes 주의 사항
* Multi-AZ Cluster에 배포된 모든 pod은 [Persistent Volume Claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims)을 통해 volume을 mount해야 한다
* Node가 multi zone에 분산되어 있는 경우 Pod spec에 EBS id를 지정하면 오작동할 수 있다
* [Multiple Zones - k8s docs](https://kubernetes.io/docs/setup/multiple-zones/) 참고


##### [cluster-autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)와 multi-AZ cluster를 배치할 때 주의사항
* Auto Scaling Group에서 여러 AZ로 확산시키지 않도록 하거나 cluster-autoscaler가 Node를 확장하는 동안 불안정해진다
  * 불충분한 zone에 Node를 확장하는데 불필요한 시간이 많이 걸린다
* cluster-autoscaler란?
  * Worker Node 수를 자동으로 조정하는 Tool
  * Cluster에 Pod을 실행할 리소스가 부족한 경우
  * 너무 오래 사용되지 않은 Node는 삭제되고, Pod은 다른 Node로 옮겨진다
* Auto Scaling Group이 1개의 AZ에 있어야 cluster-autoscaler가 동작한다
* multi-AZ에 workload를 분산하려면 각 Auto Scaling Group에 대해 cluster-autoscaler를 사용해 여러 Auto Scaling Group을 설정
* cluster-autoscaler는 `AZ를 인식하지 못한다`
  * Auto Scaling Group은 multi-AZ에 instance를 포함하도록 구성할 수 있지만 cluster-autoscaler는 원하는 AZ에 Node를 안정적으로 추가할 수 없다
  * AWS Auto Scaling이 cluster-autoscaler의 제어를 벗어나는 Node를 추가할 영역을 결정하기 때문

##### cluster-autoscaler가 필요없는 cluster
* auto-scaling이 필요 없거나 AWS-native auto scaling(Auto Scaling Group, CloudWatch alarms, scaling policy 조합)만 필요한 경우
* cluster.yaml에 서로 다른 AZ에 있는 subnet 정의

```yaml
subnets:
  - availabilityZone:
    instanceCIDR: "10.0.0.0/24"
  - availabilityZone:
    instanceCIDR: "10.0.1.0/24"
```
* Auto Scaling Group의 `DesiredCapacity`가 증가할 때 Node를 추가할 AZ와 subnet을 선택한다는 의미

##### cluster-autoscaler가 필요한 cluster
* `[Node Pool](https://github.com/kubernetes-incubator/kube-aws/blob/master/docs/getting-started/step-5-add-node-pool.md)`을 사용해야 한다


#### Certificates and Keys
* `kube-aws render`는 kubernetes를 안전하게 작동시키는데 필요한 TLS infrastructure를 초기화하면서 시작
* 기존에 key/certificate management system을 가지고 있다면 rendering 후 TLS asset을 덮어쓸 수 있다

* `kube-aws up`은 cluster stack 생성시 사용한 `credentials/`에서 찾은 TLS asset을 사용
  * ca(certificate authority)
  * k8s API Server, worker를 위한 signed server certificates
  * 관리용 signed client certificate

##### APIServerCert, APIServerKey
* kube-apiserver에 부여된 certificate & key
* cluster 외부 client에도 제공되므로 `external DNS name에 유효`해야 한다
* cluster 내부에서 `k8s API request를 라우팅하는 NDS name에 유효`해야 한다
* deployer는 Master Node의 Public IP에 대한 external DNS name의 라우팅을 보장해야 한다
  * kube-aws는 DNS zone을 관리하지 않기 때문에
* certificate에는 아래의 SANs(Subject Alternative Names)이 있어야 한다
  * cluster에서 application이 k8s API로 라우팅하는데 사용
  * 127.0.0.1
  * 10.0.0.50
  * 10.3.0.1
  * kubernets.default
  * kubernets.default.svc
  * kubernets.default.svc.cluster.local

##### WorkerCert, WorkerKey
* Worker instance의 kubelet에 부여된 certificate & key
* 모든 Worker에 공유되므로 모든 Worker hostname에 유효해야 한다
  * us-east-1 region이라면 SAN에 `*.*.compute.internal` 또는 `*.ec2.internal`을 사용

##### CACert
* Cluster의 다른 certificate에 서명하는데 사용
* 암호화되지 않은채로 `credentials/`에 저장되지만 CloudFormation template에 포함되기 전에 Amazon KMS를 사용하여 암호화된다
* 모든 key와 certs는 반드시 `base64-encoded & .pem`

<br>

### Render and validate cluster assets
* customization 후 새로운 설정으로 asset re-render 필요
```sh
$ kube-aws render credentials

$ kube-aws render stack
```


#### cluster deploy전에 유효성 검사
* TLS assets, CloudFormation stack templates, user data 사용해 cluster를 구성하기 위하 asset을 생성하고 validation, S3 Bucket에 upload 한다
* stack이 실행되기 전 중요한 단계
```sh
$ kube-aws validate

"credentials/kubelet-tls-bootstrap-token.enc" is not up-to-date. kube-aws is regenerating it from "credentials/kubelet-tls-bootstrap-token"
"credentials/encryption-config.yaml.enc" is not up-to-date. kube-aws is regenerating it from "credentials/encryption-config.yaml"
"credentials/apiserver-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/apiserver-key.pem"
"credentials/kube-controller-manager-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/kube-controller-manager-key.pem"
"credentials/kube-scheduler-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/kube-scheduler-key.pem"
"credentials/worker-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/worker-key.pem"
"credentials/admin-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/admin-key.pem"
"credentials/etcd-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/etcd-key.pem"
"credentials/etcd-client-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/etcd-client-key.pem"
"credentials/apiserver-aggregator-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/apiserver-aggregator-key.pem"
"credentials/service-account-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/service-account-key.pem"
"credentials/worker-ca-key.pem.enc" is not up-to-date. kube-aws is regenerating it from "credentials/worker-ca-key.pem"
Validating UserData and stack template...
generating assets for control-plane, etcd, network, default-pool, private-pool
Validation Report: {
  Capabilities: ["CAPABILITY_NAMED_IAM","CAPABILITY_AUTO_EXPAND"],
  CapabilitiesReason: "The following resource(s) require capabilities: [AWS::CloudFormation::Stack]",
  Description: "kube-aws Kubernetes cluster stage"
}
{
  Description: "kube-aws network stack for stage"
}
{
  Capabilities: ["CAPABILITY_IAM"],
  CapabilitiesReason: "The following resource(s) require capabilities: [AWS::IAM::ManagedPolicy]",
  Description: "kube-aws control plane stack for stage",
  Parameters: [{
      Description: "The name of a network stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "NetworkStackName"
    },{
      Description: "The name of an etcd stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "EtcdStackName"
    }]
}
{
  Capabilities: ["CAPABILITY_IAM"],
  CapabilitiesReason: "The following resource(s) require capabilities: [AWS::IAM::ManagedPolicy]",
  Description: "kube-aws etcd stack for stage",
  Parameters: [{
      Description: "The name of a network stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "NetworkStackName"
    }]
}
{
  Capabilities: ["CAPABILITY_IAM"],
  CapabilitiesReason: "The following resource(s) require capabilities: [AWS::IAM::ManagedPolicy]",
  Description: "kube-aws node pool stack for stage default-pool",
  Parameters: [{
      Description: "The name of a network stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "NetworkStackName"
    },{
      Description: "The name of an etcd stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "EtcdStackName"
    }]
}
{
  Capabilities: ["CAPABILITY_IAM"],
  CapabilitiesReason: "The following resource(s) require capabilities: [AWS::IAM::ManagedPolicy]",
  Description: "kube-aws node pool stack for stage private-pool",
  Parameters: [{
      Description: "The name of a network stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "NetworkStackName"
    },{
      Description: "The name of an etcd stack used to import values into this stack",
      NoEcho: false,
      ParameterKey: "EtcdStackName"
    }]
}
stack template is valid.

Validation OK!
```


<br>

## Launch
```sh
$ kube-aws apply

This operation will create/update the cluster. Are you sure? [y,n]: y
...
```

<br>

## Tear Down
* cluster가 내려가고 CloudFormation stack 제거된다
```sh
$ kube-aws destroy
```


<br><br>

> #### Reference
> * [kube-aws docs](https://kubernetes-incubator.github.io/kube-aws/)
> * [AWS CLI 구성 - AWS docs](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-configure.html)
> * [s3api create-bucket - AWS CLI docs](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-bucket.html)
> * [cloud-init](https://github.com/coreos/coreos-cloudinit)
> * [Persistent Volume - k8s docs](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims)
> * [Multiple Zones - k8s docs](https://kubernetes.io/docs/setup/multiple-zones/)
