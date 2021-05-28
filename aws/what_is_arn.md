# [AWS] What is ARN(AWS Resource Name)?
> date - 2021.05.28  
> keyworkd - aws, arn  
> AWS resource 사용시 가장 자주 접하는 arn에 대해 정리  

<br>

## AWS Resource란?
* AWS에서 사용할 수 있는 Entity
* EC2 instance, Amazon DynamoDB table, Amazon S3 bucket, AWS IAM User 등이 있다


<br>

## ARN이란?
* `AWS Resource Name`으로 AWS Resource를 식별하는 고유 이름으로 **resource를 참조하는 표준화된 방법**
* AWS API에서 resource를 명시적으로 지정해야 하는 경우 `ARN`을 사용

<br>

### Format
```
arn:partition:service:region:account-id:resource-id
arn:partition:service:region:account-id:resource-type/resource-id
arn:partition:service:region:account-id:resource-type:resource-id
```
* partition
  * aws - AWS region
  * aws-cn - china region
  * aws-us-gov - AWS GovCloud(us) region
* service
  * AWS 제품을 식별하는 namespace
  * s3 - Amazon S3
  * iam - AWS IAM
  * ...
* region
  * AWS region
  * us-east-2 - 미국 동부(오하이오)
  * ap-northeast-2 - 아시아 태평양(서울)
* account-id
  * AWS account ID(e.g. 123456789012)
* resource-id
  * AWS resource ID

#### Example
* AWS IAM
```arn:aws:iam::account-id:root
arn:aws:iam::account-id:user/user-name-with-path
arn:aws:iam::account-id:group/group-name-with-path
arn:aws:iam::account-id:role/role-name-with-path
arn:aws:iam::account-id:policy/policy-name-with-path
arn:aws:iam::account-id:instance-profile/instance-profile-name-with-path
arn:aws:sts::account-id:federated-user/user-name
arn:aws:sts::account-id:assumed-role/role-name/role-session-name
arn:aws:iam::account-id:mfa/virtual-device-name-with-path
arn:aws:iam::account-id:u2f/u2f-token-id
arn:aws:iam::account-id:server-certificate/certificate-name-with-path
arn:aws:iam::account-id:saml-provider/provider-name
arn:aws:iam::account-id:oidc-provider/provider-name
```
* Amazon S3
```
arn:aws:s3:::bucket_name/key_name
arn:aws:s3:::bucket_name/*
```


<br>

## Conclusion
* `ARN`은 AWS resource의 ID로 사용하며 `ARN`을 이해하는 것만으로 resource가 어떤 account에 어떤 region의 service인지 같은 대략적인 속성을 추정할 수 있으므로 이해해두는게 좋다


<br><br>

> #### Reference
> * [Amazon 리소스 이름(ARN) - AWS Docs](https://docs.aws.amazon.com/ko_kr/general/latest/gr/aws-arns-and-namespaces.html)

<br>

> #### Further reading
> * [AWS 용어집](https://docs.aws.amazon.com/ko_kr/general/latest/gr/glos-chap.html)
