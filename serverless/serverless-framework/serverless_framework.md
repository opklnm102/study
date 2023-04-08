# [Serverless] Serverless Framework
> date - 2023.04.07  
> keyworkd - serverless, aws, lambda, api gateway  
> serverless framework에 대해 정리  

<br>

## serverless란?
* server를 관리할 필요 없이 application에만 집중할 수 있는 cloud native development model로 자세한 내용은 [여기](../what_is_serverless.md)에서 확인

<br>

## Serverless Framework(SLS)란?
* 쉽게 serverless architecture를 배포하고 운영하기 위한 toolkit
* Django, Flask 기반의 API를 만들 수 있는 [Zappa](https://github.com/zappa/Zappa)와 [AWS SAM(Serverless Application Model)](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)과 다르게 AWS, Microsoft Azure, GCP(Google Cloud Platform), Knative, Fn 등 다양한 플랫폼을 지원하고, API Gateway 같은 다른 serverless service를 통합할 수 있어서 복잡한 아키텍처에 적합
* local testing이 가능해서 디버깅이 쉽다
* ELB + EC2 -> API Gateway + Lambda 전환하는 등 신규로 API Gateway + Lambda를 배포한다면 추천
  * serverless로 인한 비용 절감과 scaling에 대한 고민이 필요 없다

<br>

### 왜 사용해야하는가?

#### 생산성
API Gateway + Lambda를 만들기 위한 과정이 자동화되고 코드화되므로 **생산성**이 올라간다

* As-is
```
Lambda handler 코딩 -> zip으로 압축 -> Lambda에 업로드 -> API Gateway를 Lambda와 연결 -> API Gateway endpoint를 Route53에 등록
```

* To-be
```
Lambda handler 코딩 -> serverless 설정 -> serverless deploy
```

#### Lock-in
* 아래와 같이 CSP 마다 다른 서비스들을 추상화하여 간편한 설정만으로 사용할 수 있게 제공

| Type | AWS | Azure | GCP |
|:--|:--|:--|:--|
| Object storage | [S3](https://aws.amazon.com/s3) | [Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) | [Cloud Storage](https://cloud.google.com/storage) |
| Functions |	[Lambda](https://aws.amazon.com/lambda) | [Cloud Functions](https://azure.microsoft.com/en-us/products/functions/) | [Functions](https://cloud.google.com/functions) |
| API management | [API Gateway](https://aws.amazon.com/api-gateway)| [API Management](https://azure.microsoft.com/en-us/products/api-management) | [Cloud Endpoints](https://cloud.google.com/endpoints) |
| Provisioning | [CloudFormation](https://aws.amazon.com/cloudformation)	| [Automation](https://learn.microsoft.com/en-us/azure/automation/overview)	| [Deployment Manager](https://cloud.google.com/deployment-manager) |

<br>

#### 단점
* plan을 볼 수 없다
* CSP의 Provisioning service를 사용하기 때문에 단점도 같이 가져간다
  * AWS CloudFormation stack update 실패시 특정 케이스에서 rollback 되지 않아 약간의 변경 후 재배포 필요

<br>

### serverless.yml 가능한 설정
* S3 bucket
* API Gateway
* IAM Role
* Lambda
* CloudWatch Event
* VPC, Subnet, NAT, Security Group
* IoT
* DynamoDB
* ...


<br>

## Concepts

### Functions
* microservice처럼 실행 및 배포의 독립적인 단위
* 데이터를 DB에 저장, DB에서 파일 처리, 예약된 작업 수행 등을 하는 배포된 코드

<br>

### Events
* functions은 event에 의해 trigger
* event는 다른 AWS resource에서 발생
  * API Gateway URL의 HTTP request
  * S3 bucket에 upload file
  * CloudWatch schedule
  * SNS topic message
  * CloudWatch alert
  * ...
* Lambda function에서 event를 구성하면 serverless framework가 해당 event에 필요한 API Gateway endpoint 같은 resource를 자동으로 생성

<br>

### Resources
* function에서 사용하는 AWS infrastructure components
  * DynamoDB table
  * S3 bucket
  * SNS topic
  * CloudFormation에서 정의할 수 있는 모든 것은 serverless framework에서 지원

<br>

### Services
* framework의 구성 단위
* 여러개의 service로 하나의 application을 구성할 수도 있고, project로 구성할 수 있다
* `serverless deploy`로 service를 배포할 수 있다
```yaml
service: users

functions:
  usersCreate:
    events:
      - httpApi: 'PORT /users/create'
  usersDelete:
    events:
      - httpApi: 'DELETE /users/delete'
```

<br>

### Plugins
* serverless framework의 불편한 부분을 다양한 plugin을 사용해 편해질 수 있다
```yaml
## serverless.yml
plugins:
  - serverless-offline
  - serverless-secrets
  ...
```

| Plugin | Description |
|:--|:--|
| [serverless-webpack](https://www.serverless.com/plugins/serverless-webpack) | webpack은 빌드 과정에 손댈 수 있고, 설정 손대지 않고 production까지 가는건 쉽지 않다<br>다양한 webpack plugin에 묻어가면 편하다 |
| [serverless-dotenv-plugin](https://www.serverless.com/plugins/serverless-dotenv-plugin) | dotenv |
| [serverless-domain-manager](https://www.serverless.com/plugins/serverless-domain-manager) | api gateway, rout53에 도메인을 등록해준다 |
| [serverless-layers](https://www.serverless.com/plugins/serverless-layers) | 자주 변경되는 비즈니스 코드와 자주 변경되지 않는 라이브러리의 layer를 분리 |
| [serverless-offline](https://www.serverless.com/plugins/serverless-offline) | REST API 테스트를 위해서는 AWS Lambda 배포 필요<br>local에서 동작시켜 invoke local 대신 사용 가능 |
| [serverless-offline-sns](https://www.serverless.com/plugins/serverless-offline-sns) | localstack을 사용하면 SNS를 로컬에 띄어서 테스트 가능하지만 docker 없이 하고 싶을 때 사용 |
| [serverless-offline-sqs](https://github.com/flocasts/serverless-offline-sqs) | offline SQS |
| [serverless-offline-scheduler](https://www.serverless.com/plugins/serverless-offline-scheduler) | Scheduled Lambda를 로컬 환경에서 동작하게 해준다 |
| [serverless-prune](https://www.serverless.com/plugins/serverless-prune-plugin) | 오래된 function version 정리 |
| [serverless-secrets](https://www.serverless.com/blog/aws-secrets-management) | 환경변수로 credentials을 관리할 수 있고, AWS에서는 환경변수보다는 AWS KMS를 사용하는 것을 권장 |


<br>

## Usage

### Install
```sh
$ npm i -g serverless

## version 3
$ npm i -g serverless@3
```

<br>

### Init
* AWS Credential 설정
```sh
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

* init
```sh
$ serverless create --template <template>

## example
$ serverless create --template aws-nodejs
```

<br>

### package
* serverless 배포시 zip으로 배포되며 include, exclude pattern 지정 가능
* Lambda는 [container image 지원](https://www.serverless.com/blog/container-support-for-lambda)
```yaml
package:
  patterns:
    - '!node_modules/**'
    - '!.env*'
    - '!package-lock.json'
```
```sh
$ serverless package
```

<br>

### Deploy
* [init](#init)에서 생성된 serverless.yml에 필요한 설정을 추가
```yaml
service: my-service

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  memorySize: 128
  timeout: 30
  versionFunctions: true
  stage: ${env:STAGE, 'dev'}
  region: ap-northeast-2
  stackTags:
    service: my-service
    environment: ${self:provider.stage}
  deploymentBucket:
    blockPublicAccess: true
    skipPolicySetup: true
    name: my-service-bucket
    maxPreviousDeploymentArtifacts: 10
  deploymentPrefix: serverless
  iam:
    role: arn:aws:iam::<account>:role/my-service
  logRetentionInDays: 14
  logs:
    restApi:
      accessLogging: false
      executionLogging: false
      fullExecutionData: false
      role: arn:aws:iam::<account>:role/my-service
      roleManagedExternally: true
  apiGateway:
    description: my service api  

useDotenv: true
package:
  patterns:
    - '!node_modules/**'
    - '!.env*'
    - '!package-lock.json'

functions:
  my-service:
    handler: index.handler  # handler set in AWS Lambda
    name: ${self:service}-${self:provider.stage}  # Deployed Lambda name
    description: my service api
    runtime: nodejs18.x  # default is provider runtime
    reservedConcurrency: 5  # default AWS account concurrency limit
    memorySize: 512
    timeout: 10
    events:
      - http:
          path: /
          method: get
          integration: lambda
          response:
            statusCodes:
              200:
                pattern: ''
          cors:
            origin: '*'
            headers:
              - Content-Type
              - X-Amz-Date
              - Authorization
              - X-Api-Key
              - X-Amz-Security-Token
              - X-Amz-User-Agent
            allowCredentials: false
            cacheControl: 'max-age=600, s-maxage=600, proxy-revalidate'
    role: arn:aws:iam::<account>:role/my-service
    vpc:
      securityGroupIds:
        - sg-xxxxxxxxxx
      subnetIds:
        - subnet-xxxxxxxxxx
        - subnet-xxxxxxxxxx
    tags:
      service: my-service
      environment: ${self:provider.stage}
    environment:
      STAGE: ${self:provider.stage}
```

* index.js
```js
export const handler = async (event, context) => {
  return await getHelloMessage()
}

async function getHelloMessage () {
  console.info("start")
  return await delay(3000).then(() => {
    return {
      statusCode: 200,
      body:  {
          message: 'Hello',
        }
    }
  })
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
```
* package.json
```json
{
  "name": "app",
  "version": "1.0.0",
  "description": "",
  "main": "handler.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
  },
  "type": "module"
}
```

* deploy
```sh
$ serverless deploy

$ serverless deploy --verbose
```

<br>

### Invoking function
* -f(or --function)
```sh
$ serverless invoke -f <function name>

## invoke and display logs
$ serverless invoke -f <function name> --log
```

<br>

### Local testing
```sh
## Local function invocation
$ serverless invoke local --function <function name>

## local function invocation with data
$ serverless invoke local --function <function name> --data '{"a":"bar"}'

## local function invocation with data from standard input
$ node dataGenerator.js | serverless invoke local --function <function name>

## local function invovation with data passing
$ serverless invoke local --function <function name> --path lib/data.json
```

<br>

### Logs
* AWS CloudWatch에 저장된 로그 확인
```sh
$ serverless logs -f <function name>

## tail logs
$ serverless logs -f <function name> --tail
```

<br>

### Remove
```sh
$ serverless remove
```


<br>

## CI/CD with GitHub Actions
* .github/workflows/deploy.yaml 추가
```yaml
name: Deploy serverless app

on:
  push:
    branches:
      - master
      - develop

jobs:
  deploy:
    name: deploy
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - name: serverless deploy
        uses: serverless/github-action@v3.1
        with:
          args: deploy --verbose
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### monorepo
* monorepo일 경우 branch name과 working-directory를 이용
```sh
.
├── example
│   ├── node-api-gw
│   │   ├── Makefile
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── index.js
│   │   ├── node_modules
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── serverless.yml
│   ├── node-basic
│   │   ├── Makefile
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── index.js
│   │   └── serverless.yml
...
```
```yaml
name: Deploy node-api-gw

on:
  push:
    branches:
      - master
      - develop
      - feature/node-api-gw*

jobs:
  deploy:
    name: deploy
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]
    defaults:
      run:
        working-directory: ./example/node-api-gw

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - name: serverless deploy
        uses: serverless/github-action@v3.1
        with:
          args: deploy --verbose
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

<br>

### serverless/github-action 살펴보기
* nikolaik/python-nodejs를 base image로 사용하여 `npm i -g serverless@3.x`를 실행하는 간단한 actions
```dockerfile
FROM nikolaik/python-nodejs:python3.10-nodejs16-slim

LABEL version="1.0.0"
LABEL repository="https://github.com/serverless/github-action"
LABEL homepage="https://github.com/serverless/github-action"
LABEL maintainer="Serverless, Inc. <hello@serverless.com> (https://serverless.com)"

LABEL "com.github.actions.name"="Serverless"
LABEL "com.github.actions.description"="Wraps the Serverless Framework to enable common Serverless commands."
LABEL "com.github.actions.icon"="zap"
LABEL "com.github.actions.color"="red"

RUN npm i -g serverless@3.x
ENTRYPOINT ["serverless"]
```


<br><br>

> #### Reference
> * [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
> * [Github Action for Serverless](https://github.com/serverless/github-action)
> * [Setup CI/CD for your AWS Lambda with Serverless Framework and GitHub Actions](https://dev.to/aws-builders/setup-cicd-for-your-aws-lambda-with-serverless-framework-and-github-actions-4f12)
