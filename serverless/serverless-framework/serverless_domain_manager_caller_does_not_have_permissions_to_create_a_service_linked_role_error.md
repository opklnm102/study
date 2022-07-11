# [Serverless] serverless-domain-manager Caller does not have permissions to create a Service Linked Role Error
> date - 2022.07.11  
> keyworkd - serverless, aws, lambda, domain  
> serverless framework에서 serverless-domain-manager 사용시 겪은 에러에 대해 정리  

<br>

## Issue. serverless create_domain에서 AccessDeniedException: Caller does not have permissions to create a Service Linked Role Error
```sh
$ sls create_domain

Serverless: Invoke create_domain
Serverless Domain Manager: Error:  test.example.com does not exist
Serverless: [AWS acm 200 1.072s 0 retries] listCertificates({
  CertificateStatuses: [ 'PENDING_VALIDATION', 'ISSUED', 'INACTIVE', [length]: 3 ]
})
Serverless Domain Manager: Error: test.example.com:  AccessDeniedException: Caller does not have permissions to create a Service Linked Role.
Serverless Domain Manager: Error: test.example.com:  Error: Failed to create custom domain test.example.com

 Error ---------------------------------------------------

  Error: Unable to create domain test.example.com
      at ServerlessCustomDomain.<anonymous> (/opt/app/node_modules/serverless-domain-manager/dist/src/index.js:182:23)
      at Generator.throw (<anonymous>)
      at rejected (/opt/app/node_modules/serverless-domain-manager/dist/src/index.js:6:65)
      at processTicksAndRejections (internal/process/task_queues.js:93:5)

  Get Support --------------------------------------------
     Docs:          docs.serverless.com
     Bugs:          github.com/serverless/serverless/issues
     Issues:        forum.serverless.com

  Your Environment Information ---------------------------
     Operating System:          linux
     Node Version:              14.16.0
     Framework Version:         2.29.0
     Plugin Version:            4.5.0
     SDK Version:               n/a
     Components Version:        3.7.3
```

<br>

## Why?
* [AccessDeniedException: Caller does not have permissions to create a Service Linked Role #112 - amplify-education/serverless-domain-manager](https://github.com/amplify-education/serverless-domain-manager/issues/112)를 보면 아래 권한이 필요하다고 함
* [Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)는 처음 사용시 linked role을 생성하는 process가 있어서 처음 생성시 `iam:CreateServiceLinkedRole` 권한 필요

<br>

### Service-Linekd Roles란?
* AWS service에 직접 연결된 고유한 유형의 IAM Role
* 해당 service에 사전 정의되어 있으며, 다른 AWS service를 자동으로 호출하기 위해 필요한 모든 권한을 보유
* 연결된 AWS service는 `Service-Linked Role`을 자동으로 만들고 수정하며 삭제할 수 있다
* 사용자가 직접 생성 및 삭제 가능
  * `iam:CreateServiceLinkedRole` 필요
* 생성시 기본 policy가 자동 적용
  * trust relationships, policy 수정 및 다른 IAM에 연결 불가
* Role에 관련된 service resource를 제거해야 Role을 제거할 수 있도록 보호됨
* `Service-Linked Roles`을 사용하는 AWS Service List
  * [AWS IAM으로 작업하는 서비스](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html)에 서비스 연결 역할이 `예`로 표시


<br>

## Resolve
* 사용하는 IAM Role에 아래의 권한 추가
```json
...
"Effect": "Allow",
Action: [
   "iam:CreateServiceLinkedRole"
],
"Resource": [
   "!Sub arn:aws:iam::${AWS::AccountId}:role/aws-service-role/ops.apigateway.amazonaws.com/AWSServiceRoleForAPIGateway"
]
```


<br><br>

> #### Reference
> * [AccessDeniedException: Caller does not have permissions to create a Service Linked Role #112 - amplify-education/serverless-domain-manager](https://github.com/amplify-education/serverless-domain-manager/issues/112)
> * [AWS IAM으로 작업하는 서비스](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html)
