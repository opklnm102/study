# [AWS] Assume IAM Role using the AWS CLI
> date - 2020.05.10  
> keyworkd - aws, cli, iam  
> AWS CLI를 사용하기 위해 IAM User 또는 IAM Role을 사용할 수 있다  
> IAM Role을 assume할 수 있는 IAM User를 사용하여 IAM Role로 AWS CLI를 사용하는 방법을 정리  

<br>

## IAM Role 생성

### 1. IAM Role의 Trust relationships 정의
* IAM Role을 root, IAM User Bob, EC2에서 assume할 수 있도록 relationships policy를 정의
```json
// aws-cli-test-iam-role-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": [
            "arn:aws:iam::xxxxxxxxxxxx:root",
            "arn:aws:iam:xxxxxxxxxxxx:user/Bob"  // 특정 IAM User에게만 부여할 때 사용
        ]
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

<br>

### 2. 정의한 Trust relationships policy를 이용해 IAM Role 생성
```sh
$ aws iam create-role --role-name aws-cli-test-iam-role --assume-role-policy-document file://aws-cli-test-iam-role-trust-policy.json
```

<br>

### 3. IAM Role에 IAM Policy attach
* `ReadOnlyAccess` IAM Policy 연결 후 확인
```
$ aws iam attach-role-policy --role-name aws-cli-test-iam-role --policy-arn "arn:aws:iam::aws:policy/ReadOnlyAccess"

$ aws iam list-attached-role-policies --role-name aws-cli-test-iam-role
```


<br>

## IAM User 생성
* 위에서 생성한 aws-cli-test-iam-role IAM Role을 assume할 수 있는 IAM User를 생성한다
```sh
$ aws iam create-user --user-name Bob
```

<br>

### 1. IAM User Bob에게 IAM Role을 assume할 수 있는 IAM Policy 생성
```json
// aws-cli-test-iam-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAssumeRole",
      "Effect": "Allow",
      "Action": "sts:AssumeRole",  // point..!
      "Resource": [
        "arn:aws:iam:xxxxxxxxxxxx:role/aws-cli-test-iam-role"
      ]
    },
    {
      "Sid": "AllowReadOnlyEC2",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "iam:ListRoles"
      ]
    }
  ]
}
```

* IAM Policy 생성
```sh
$ aws iam create-policy --policy-name aws-cli-test-iam-policy --policy-document file://aws-cli-test-iam-policy.json
```

<br>

### 2. IAM Policy 연결 후 확인
* `attach-user-policy`로 Bob에게 policy를 연결 후 `list-attached-user-policies`로 확인
```sh
$ aws iam attach-user-policy --user-name Bob --policy-arn "arn:aws:iam:xxxxxxxxxxxx:policy/aws-cli-test-iam-policy"

$ aws iam list-attached-user-policies --user-name Bob
```

<br>

## 3. Assume IAM Role
* profile을 지정하거나 default profile을 사용할 수 있다

### AWS CLI Configuration
```sh
$ aws configure

AWS Access Key ID [NONE]: # [requried] access key id 입력
AWS Secret Access Key [NONE]: # [requried] secret key 입력
Default region name [NONE]: # [optional] 공란 enter
Default output format [NONE]: # [optional] 공란 enter
```

### Profile 지정
```sh
# ~/.aws/credentials
[profile cli]
role_arn = arn:aws:iam::xxxxxxxxxxxx:role/aws-cli-test-iam-role
source_arn = bob

[profile bob]
aws_access_key_id=xxxxxxxxxxxx
aws_secret_access_key=xxxxxxxxxxxxxxx
```
```sh
$ aws s3 ls --profile cli
```
* AWS CLI는 background에서 `bob profile`의 credential을 자동으로 찾아 `sts:AssumeRole`을 사용해 `cli profile`의 temporary credentials을 요청
* source profile에는 `sts:AssumeRole` 권한 필요
* IAM Role에는 source profile이 IAM Role을 사용할 수 있도록 trusted relationship 필요

<br>

> #### source profile
> * background에서 `sts:AssumeRole`을 사용해 IAM Role의 temporary credentials을 요청
> * Local - `source_profile`로 IAM User, IAM Role 사용
>   * IAM User - access key
>   * IAM Role - temporary credentials
> * AWS EC2 instance, ECS container면 `credential_source` 사용
>   * Environment - 환경 변수에서 source_credentials 검색
>   * Ec2InstanceMetadata - Amazon EC2 instance profile에 연결된 IAM Role을 사용
>   * EcsContainer - Amazon ECS container에 연결된 IAM Role을 사용

<br>

### Default profile 사용
* assume한 role을 default profile로 사용하기 위해 script를 작성

```sh
#!/usr/bin/env bash
#
# Dependencies:
#   brew install awscli jq
#
# Setup:
#   chmod 700 ./aws-assume-role
#
# Usage:
#   ./aws-assume-role [AWS IAM User name] [AWS IAM Role name] [MFA token code]

set -e

usage() {
  cat <<-EOM
Usage: ${0##*/} [AWS IAM User name] [AWS IAM Role name] [MFA token code]
EOM
  exit 1
}

if [[ $# -lt 3 ]]; then
  usage
fi

AWS_IAM_USER_NAME=${1}
SERIAL_NUMBER="arn:aws:iam::xxxxxxxxxxxx:mfa/${AWS_IAM_USER_NAME}"
ROLE_NAME=${2}
ROLE_ARN="arn:aws:iam::xxxxxxxxxxxx:role/${ROLE_NAME}"
TOKEN_CODE=${3}

# backup IAM User credentials
if [[ ! -f $HOME/.aws/credentials.${AWS_IAM_USER_NAME} ]]; then
  cat $HOME/.aws/credentials | grep "default" -A 2 > $HOME/.aws/credentials.${AWS_IAM_USER_NAME}
fi

# set IAM User credentials
export AWS_ACCESS_KEY_ID=$(cat $HOME/.aws/credentials.${AWS_IAM_USER_NAME} | grep 'aws_access_key_id' | awk '{print $3}')
export AWS_SECRET_ACCESS_KEY=$(cat $HOME/.aws/credentials.${AWS_IAM_USER_NAME} | grep 'aws_secret_access_key' | awk '{print $3}')

# assume role
ASSUME_ROLE=$(aws sts assume-role --role-arn ${ROLE_ARN} \
                                  --role-session-name ${ROLE_NAME} \
                                  --serial-number ${SERIAL_NUMBER} \
                                  --token-code ${TOKEN_CODE} \
                                  --duration-seconds 14400)

# config
echo -e "[default]\noutput=json\nregion=ap-northeast-1" > $HOME/.aws/config

# credentials
echo "[default]" > $HOME/.aws/credentials
echo "${ASSUME_ROLE}" | jq -r '.Credentials | .["aws_access_key_id"]=.AccessKeyId | .["aws_secret_access_key"]=.SecretAccessKey | .["aws_session_token"]=.SessionToken | del(.AccessKeyId,.SecretAccessKey,.SessionToken,.Expiration) | to_entries[] | "\(.key)=\(.value)"' >> $HOME/.aws/credentials
```

* run script
```sh
$ ./aws-assume-role Bob aws-cli-test-iam-role 123456

$ aws sts get-caller-identity
{
    "UserId": "xxxxxxxxxxxx",
    "Account": "xxxxxxxxxxxx",
    "Arn": "arn:aws:sts::xxxxxxxxxxxx:assumed-role/aws-cli-test-iam-role"
}

$ aws sts get-caller-identity
## credentials expired
An error occurred (ExpiredToken) when calling the GetCallerIdentity operation: The security token included in the request is expired
```


<br>

## Conclusion
* IAM User의 credentials(access key)은 자동으로 expired되지 않지만 IAM Role의 temporary credentials은 expired되므로 보안적으로 더 좋다
* IAM User에 많은 권한을 할당하기보다는, 역할에 맞게 최소한의 권한을 IAM User에 부여한 뒤 IAM Role을 사용하는 것을 권장


<br><br>

> #### Reference
> * [AWS CLI를 사용하여 IAM 역할을 위임하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/iam-assume-role-cli/)
> * [AWS CLI의 IAM 역할 사용](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-configure-role.html)
