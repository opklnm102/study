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

### cluster.yaml 생성
* Pre-Requisites에서 생성한 정보를 이용
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
* 지금 생성된 cluster.yaml에서 필요한 옵션들을 수정한다


### credentials 생성
* Node간 통신, cluster administer를 위한 TLS assets
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
Writing 1675 bytes to credentials/apiserver-key.pem
Writing 1115 bytes to credentials/kube-controller-manager.pem
Writing 1675 bytes to credentials/kube-controller-manager-key.pem
Writing 1103 bytes to credentials/kube-scheduler.pem
Writing 1675 bytes to credentials/kube-scheduler-key.pem
Writing 1168 bytes to credentials/worker.pem
Writing 1675 bytes to credentials/worker-key.pem
Writing 1119 bytes to credentials/admin.pem
Writing 1675 bytes to credentials/admin-key.pem
Writing 1147 bytes to credentials/etcd.pem
Writing 1675 bytes to credentials/etcd-key.pem
Writing 1094 bytes to credentials/etcd-client.pem
Writing 1675 bytes to credentials/etcd-client-key.pem
Creating a symlink from etcd-trusted-ca.pem to ca.pem
Writing 1675 bytes to credentials/apiserver-aggregator-key.pem
Writing 1086 bytes to credentials/apiserver-aggregator.pem
Writing 44 bytes to credentials/kubelet-tls-bootstrap-token
Writing 1675 bytes to credentials/service-account-key.pem
Writing 0 bytes to credentials/tokens.csv
Writing 227 bytes to credentials/encryption-config.yaml
Writing 1675 bytes to credentials/ca-key.pem
Creating a symlink from worker-ca-key.pem to ca-key.pem
Writing 1675 bytes to credentials/kiam-server-key.pem
Writing 1184 bytes to credentials/kiam-server.pem
Writing 1675 bytes to credentials/kiam-agent-key.pem
Writing 1086 bytes to credentials/kiam-agent.pem
Writing 1070 bytes to credentials/kiam-ca.pem
--> Verifying the result
```

### CloudFormation stack templates & user data 생성
* 생성된 파일들을 기반으로 cluster를 deploy한다
```sh
$ kube-aws render stack
Success! Stack rendered to ./stack-templates.

Next steps:
1. (Optional) Validate your changes to cluster.yaml with "kube-aws validate"
2. (Optional) Further customize the cluster by modifying templates in ./stack-templates or cloud-configs in ./userdata.
3. Start the cluster with "kube-aws up".
```

### cluster deploy전에 유효성 검사
* TLS assets, CloudFormation stack templates, user data 사용해 cluster를 구성하기 위하 asset을 생성하고 validation, S3 Bucket에 upload 한다
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
