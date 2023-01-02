# [k8s] IAM Roles for Service Accounts(IRSA)?
> date - 2023.01.03  
> keyworkd - kubernetes, k8s, aws, eks, iam  
> IAM Roles for Service Accounts(IRSA)에 대해 정리  

<br>

## Amazon EKS cluster의 Pod에서 AWS 리소스 접근하기
S3 같은 AWS 리소스에 접근하기 위해서는 IAM(Identity and Access Management)을 사용한다. EKS cluster에서는 다음의 3가지 방법으로 사용할 수 있다

* IAM User의 access key를 사용
  * access key의 관리(주기적 변경 등) 및 보안 위험성으로 인해 비추천
* node로 사용하는 EC2 instance에 [instance profiles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)로 IAM Role 할당
  * IMDSv1 허용 필요
  * node 위의 모든 Pod가 동일한 권한을 사용하게 되며, Pod가 많아지면 node의 권한이 점점 많아지게 되어 보안 위험성이 있다
* [IAM Roles for Service Accounts(IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 사용
  * Pod level에서 권한 제어를 할 수 있어서 EKS에서 권장하는 방식
  * add-on 설치 과정에서도 보안을 위해 권장
  * EKS가 아니라면 [kube2iam](https://github.com/jtblin/kube2iam), [kiam](https://github.com/uswitch/kiam) 사용


<br>

## IRSA(IAM Role for Service Account)란?
* OIDC(OpenID Connect)로 Pod에서 사용하는 ServiceAccount에 IAM Role로 AWS 권한을 부여하는 기능
* IAM OIDC identity provider를 통해 IAM과 ServiceAccount까지 서로 restart한 권한 제어 가능
* Pod 생성시 ServiceAccount의 annotation에 `eks.amazonaws.com/role-arn`이 있다면 mutating webhook을 통해 k8s api-server가 IAM OIDC identity provider에게 OIDC 인증을 받고 JWT를 발급받아 Pod에 
`AWS_ROLE_ARN`, `AWS_WEB_IDENTITY_TOKEN_FILE` 환경 변수를 설정하고 `AWS_WEB_IDENTITY_TOKEN_FILE` 경로에 JWT를 저장
```sh
AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token
AWS_ROLE_ARN=arn:aws:iam::<account>:role/<role name>
```

<div align="center">
  <img src="./images/irsa_flow.png" alt="IRSA flow" width="70%" height="70%" />
</div>

1. Pod의 AWS SDK로 S3 bucket list를 조회하기 위한 credentials을 얻기 위해 JWT, IAM Role ARN을 AWS STS로 전달
2. AWS STS는 temporary credentials을 발급이 가능한지 AWS IAM에게 확인 요청
3. AWS IAM은 IAM OIDC identity provider에게 신뢰할 수 있는 JWT인지 확인(IAM OIDC identity provider가 발급한게 맞는지 확인)
4. AWS IAM은 STS에게 credentials 발급 가능하다고 응답
5. AWS STS는 Pod의 AWS SDK에게 temporary credentials을 전달
6. Pod의 AWS SDK는 temporary credentials을 이용해 S3 bucket list 조회 가능


<br>

## IRSA 설정
### 1. EKS cluster OIDC provider 생성
* OIDC provider를 이전에 생성했는지 확인
```sh
$ oidc_id=$(aws eks describe-cluster --name <cluster name> --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5)
$ aws iam list-open-id-connect-providers | grep $oidc_id | cut -d "/" -f4
```

* OIDC provider 생성
```sh
$ eksctl utils associate-iam-oidc-provider --cluster <cluster name> --approve
```

<br>

### 2. AWS IAM Role 생성
* OIDC provider에 대해 trust relationship 설정 및 IAM Role 생성
```sh
$ cat >trust-relationship.json <<EOF
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
          "oidc.eks.<region>.amazonaws.com/id/<xxx>:sub": "system:serviceaccount:<namespace>:<service account>"
        }
      }
    }
  ]
}
EOF

$ aws iam create-role --role-name <role name> \
                      --assume-role-policy-document file://trust-relationship.json
```
> * aud - token을 사용할 수신자(audience)로 AWS STS가 JWT를 사용하여 IAM Role에 대한 temporary credentials을 발급하므로 AWS STS endpoint가 있다
> * sub - subject로 token이 가지는 문맥을 의미하며 사용자의 고유한 보안 이름 및 principal로 사용

* IAM Policy 생성 및 IAM Role에 할당
```sh
$ cat >my-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<bucket name>"
        }
    ]
}
EOF

$ aws iam create-policy --policy-name <policy name> \
                        --policy-document file://my-policy.json

$ aws iam attach-role-policy --role-name <role name> \
                             --policy-arn arn:aws:iam::<account>:policy/<policy name>
```

<br>

### 3. eks.amazonaws.com/role-arn annotation이 추가된 ServiceAccount 생성
```sh
$ cat >my-service-account.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<account>:role/<role name>
EOF

$ kubectl apply -f my-service-account.yaml
```

<br>

### 4. Pod 생성시 ServiceAccount 사용
```sh
$ cat >my-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      serviceAccountName: my-service-account
      containers:
      - name: my-app
        image: public.ecr.aws/nginx/nginx:1.21
EOF

$ kubectl apply -f my-deployment.yaml
```


<br>

## IRSA troubleshooting
EKS cluster의 Pod에서 AWS 리소스에 access denied가 발생한다면 다음의 4가지를 순서대로 확인해보자

1. IRSA가 제대로 설정되어 있지 않은 경우
2. IRSA는 정상이지만, 필요한 IAM Policy가 IAM Role에 할당되지 않은 경우
3. Pod의 AWS SDK가 [Using a supported AWS SDK](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts-minimum-sdk.html) 보다 낮은 버전을 사용한 경우
4. Pod의 AWS SDK가 Pod에 할당된 IAM Role을 사용하지 않은 경우

### 1. IRSA가 제대로 설정되어 있지 않은 경우
* 임시 Pod를 생성한 후 `aws sts get-caller-identity`로 할당된 IAM Role 확인
```sh

$ cat >my-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: irsa-tester
spec:
  selector:
    matchLabels:
      app: irsa-tester
  template:
    metadata:
      labels:
        app: irsa-tester
    spec:
      serviceAccountName: my-service-account
      containers:
      - name: irsa-tester
        image: amazon/aws-cli:latest
        command:
          - /bin/sleep
        args:
          - "3600"
EOF

$ kubectl apply -f my-deployment.yaml
```

### 2. IRSA는 정상이지만, 필요한 IAM Policy가 IAM Role에 할당되지 않은 경우
* IAM Policy 확인하여 원하는 AWS 리소스에 대한 권한이 있는지 확인

### 3. Pod의 AWS SDK가 [Using a supported AWS SDK](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts-minimum-sdk.html) 보다 낮은 버전을 사용한 경우
* AWS SDK의 버전을 확인

### 4. Pod의 AWS SDK가 Pod에 할당된 IAM Role을 사용하지 않은 경우
* 코드를 확인하여 사용하는 IAM Role을 확인

<br>

4가지 방법으로 해결이 안된다면 [Amazon EKS에서 OIDC 공급자 및 IRSA 문제를 해결하려면 어떻게 해야 하나요?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/eks-troubleshoot-oidc-and-irsa)를 살펴보자

<br><br>

> #### Reference
> * [IAM Roles for Service Accounts(IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
> * [Using instance profiles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)
> * [Diving into IAM Roles for Service Accounts](https://aws.amazon.com/ko/blogs/containers/diving-into-iam-roles-for-service-accounts)
> * [Amazon EKS에서 OIDC 공급자 및 IRSA 문제를 해결하려면 어떻게 해야 하나요?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/eks-troubleshoot-oidc-and-irsa)
