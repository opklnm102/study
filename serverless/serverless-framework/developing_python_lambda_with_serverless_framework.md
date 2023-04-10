# [Serverless] Developing python lambda with serverless framework
> date - 2023.04.10  
> keyworkd - serverless, aws, lambda, python  
> python과 serverless framework로 lambda 개발하는 내용 정리  

<br>

## 개발 환경 구성
* serverless framework는 node.js 필요, lambda는 python으로 개발할 것이므로 python + node.js가 필요
* container로 환경을 구성하려면 node.js image에 python을 설치하거나 python image에 node.js를 설치하는 것도 쉽진 않다
* [How to Install Python 3.8 on Debian 10](https://linuxize.com/post/how-to-install-python-3-8-on-debian-10)를 참고하여 node.js image에 python 설치시 오래 걸리고, pyenv로 설치하면 조금 더 빠르나 pyenv 설정 추가가 필요
```dockerfile
FROM node:18.15.0

RUN npm install -g serverless@3.30.1 \
    && curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash \
    && SHELL_CONFIG=~/.bashrc \
    && echo 'export PATH="${HOME}/.pyenv/bin:${PATH}"' >> ~/.bashrc \
    && echo 'if which pyenv > /dev/null; then eval "$(pyenv init -)"; fi'  >> ${SHELL_CONFIG} \
    && echo 'if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi' >> ${SHELL_CONFIG} \
    && . ${SHELL_CONFIG} \
    && pyenv install 3.9.16 \
    && pyenv global 3.9.16

WORKDIR /opt/app
```

* [Github Action for Serverless](https://github.com/serverless/github-action)에서 사용하는 [nikolaik/python-nodejs](https://hub.docker.com/r/nikolaik/python-nodejs)를 사용하면 된다
```dockerfile
FROM nikolaik/python-nodejs:python3.9-nodejs18

RUN npm install -g npm && \
    npm install -g serverless@3.30.1

WORKDIR /opt/app
```


<br>

## Bundling dependencies
* 3rd-party dependencies가 필요하다면 [serverless-python-requirements](https://github.com/serverless/serverless-python-requirements) 사용

<br>

### Install
* 아래 명령어를 사용하면 `package.json`, `serverless.yml`의 plugins에 자동으로 추가되고 `sls deploy`를 실행하면 requirements.txt, Pipfile에 지정된 dependency를 bundle로 제공한다
```sh
$ sls plugin install -n serverless-python-requirements
```

* package.json
```json
{
  "devDependencies": {
    "serverless-python-requirements": "^6.0.0"
  }
}
```

* serverless.yml
```yaml
plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true  # or false
```


<br>

## Serverless Rules를 이용해 검증

### [Serverless Rules](https://github.com/awslabs/serverless-rules)
* infrastructure as code template이 recommended practices에 따르는지 검증하는데 사용
* `cfn-lint`, `tflint` plugin 제공
* CI/CD pipeline에서 guardrails로 recommended practices에 대한 빠른 피드백을 받을 수 있다

<br>

### Install
```sh
$ pip install cfn-lint cfn-lint-serverless
```

<br>

### Usage
```sh
# Generate CloudFormation templates
$ sls package

# Run cfn-lint against the CloudFormation template
$ cfn-lint .serverless/cloudformation-template-update-stack.json -a cfn_lint_serverless.rules
```


<br>

## serverless framework로 배포하기
> [python-basic](https://github.com/opklnm102/serverless-docker/tree/main/example/python-basic) 참고

* serverless.yml
```yaml
service: aws-python-project

frameworkVersion: '3'

provider:
  name: aws
  runtime: python3.9

useDotenv: true
package:
  patterns:
    - '!./**'
    - 'handler.py'

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true

functions:
  hello:
    handler: handler.hello
```

* handler.py
```py
import json


def hello(event, context):
    body = {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
```

* deploy
```sh
$ sls deploy
```


<br><br>

> #### Reference
> * [Serverless Python Requirements](https://github.com/serverless/serverless-python-requirements)
> * [How to Handle your Python packaging in Lambda with Serverless plugins](https://www.serverless.com/blog/serverless-python-packaging)
> * [Github Action for Serverless](https://github.com/serverless/github-action)
> * [nikolaik/python-nodejs](https://hub.docker.com/r/nikolaik/python-nodejs)
> * [Serverless Rules](https://github.com/awslabs/serverless-rules)
> * [AWS CloudFormation Linter](https://github.com/aws-cloudformation/cfn-lint)
