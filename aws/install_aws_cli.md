# [AWS] Install AWS CLI
> date - 2018.11.13  
> keyword - aws  
> macOS에서 AWS CLI 설치하는 법 정리

<br>

* AWS CLI는 python에 dependency를 가지고 있다
* maxOS는 python이 pre-built되어 있다
```sh
$ python --version

Python 2.7.10
```
* `brew`를 사용하면 필요한 dependency가 함께 설치되고, `docker`를 사용하면 dependency가 함께 packaging되어 있어서 신경쓰지 않아도 된다

<br>

## Install

### Use brew
```sh
$ brew update && brew install awscli
...

# install check
$ aws --version

aws-cli/1.16.40 Python/3.7.0 Darwin/17.7.0 botocore/1.12.30
```

<br>

### Use docker
#### basic usage
```sh
$ docker run --rm -it amazon/aws-cli [command]
```

#### access host credentials, config
```sh
$ docker run --rm -it -v ~/.aws:/root/.aws amazon/aws-cli [command]
```

#### access host file system, credentials, config
```sh
$ docker run --rm -it -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli [command]
```

#### usage AWS_PROFILE environment variable
```sh
$ docker run --rm -it -v ~/.aws:/root/.aws -v $(pwd):/aws -e AWS_PROFILE amazon/aws-cli [command]
```

#### docker command 단축
* `alias` 사용
```sh
$ cat << EOF >> $HOME/.zshrc

### aws-cli
alias aws='docker run --rm -it -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli'

EOF
```


<br>

## AWS CLI 사용을 위해 설정하기
```sh
$ aws configure

AWS Access Key ID : xxxxx
AWS Secret Access Key : xxx
Default region name [None]:  
Default output format [None]:  
```

* `$HOME/.aws/credentials`에 위에 입력한 내용이 기록되어 AWS CLI에서 사용된다
```
[default]
aws_access_key_id = xxxxx
aws_secret_access_key = xxx
```


<br><br>

> #### Reference
> * [AWS: Installing AWS Client using Homebrew](https://www.chrisjmendez.com/2017/02/18/aws-installing-aws-client-using-homebrew/)
> * [AWS CLI 설치, 업데이트 및 제거 - AWS Docs](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-chap-install.html)

<br>

> #### Read more
> * [MFA 토큰을 사용하여 AWS CLI를 통한 AWS 리소스 액세스를 인증하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/authenticate-mfa-cli/)
