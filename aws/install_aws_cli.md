# [AWS] install AWS CLI
> date - 2018.11.13  
> keyword - aws  
> macOS에서 AWS CLI 설치하는 법 정리

<br>

* AWS CLI는 python이 필요
* maxOS는 python이 pre-built되어 있다
```sh
$ python --version

Python 2.7.10
```

## Install
```sh
$ brew update && brew install awscli
...

# install check
$ aws --version

aws-cli/1.16.40 Python/3.7.0 Darwin/17.7.0 botocore/1.12.30
```


## AWS CLI 사용을 위해 설정하기
```sh
$ aws configure

AWS Access Key ID : xxxxx
AWS Secret Access Key : xxx
Default region name [None]:  
Default output format [None]:  
```

* $HOME/.aws/credentials에 위에 입력한 내용이 기록되어 AWS CLI에서 사용된다
```
[default]
aws_access_key_id = xxxxx
aws_secret_access_key = xxx
```


<br>

> #### Reference
> * [AWS: Installing AWS Client using Homebrew](https://www.chrisjmendez.com/2017/02/18/aws-installing-aws-client-using-homebrew/)
> * [macOS에 AWS Command Line Interface를 설치합니다](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-install-macos.html)

<br>

> #### Read more
> * [MFA 토큰을 사용하여 AWS CLI를 통한 AWS 리소스 액세스를 인증하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/authenticate-mfa-cli/)
