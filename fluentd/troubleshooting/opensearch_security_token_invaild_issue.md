# [Fluentd] Opensearch security token invaild issue
> date - 2024.01.02  
> keyword - fluentd, opensearch  
> 2023-01-05에 발생한 fluentd에서 opensearch로 로그 저장 장애 troubleshooting 내용 정리    

<br>

## Requirement

### Dependency
| Name | Version |
|:--|:--|
| [Fluentd](https://www.fluentd.org) | v1.15.2 |
| [fluent-plugin-opensearch](https://github.com/fluent/fluent-plugin-opensearch) | v1.0.8 |


<br>

## Issue
* fluent-plugin-opensearch를 이용한 Opensearch에 로그 저장이 불가한 장애가 발생


<br>

## Why?

### fluentd의 로그 확인
* http 403 forbidden error로 인해 opensearch에 indexing을 하지 못하고 있는게 원인으로 fluentd를 재시작한 후 정상화된 것을 확인
```sh
2023-01-04 21:23:44 +0000 [warn]: #0 Could not communicate to OpenSearch, resetting connection and trying again. [403] {"message":"The security token included in the request is invalid"}
2023-01-04 21:23:44 +0000 [warn]: #0 Remaining retry: 9. Retry to communicate after 2 second(s).
2023-01-04 21:23:48 +0000 [warn]: #0 Could not communicate to OpenSearch, resetting connection and trying again. [403] {"message":"The security token included in the request is invalid"}
2023-01-04 21:23:48 +0000 [warn]: #0 Remaining retry: 8. Retry to communicate after 4 second(s).
...
2023-01-04 21:40:44 +0000 [warn]: #0 Could not communicate to OpenSearch, resetting connection and trying again. [403] {"message":"The security token included in the request is invalid"}
2023-01-04 21:40:44 +0000 [warn]: #0 Remaining retry: 1. Retry to communicate after 512 second(s).
2023-01-04 21:42:24 +0000 [warn]: #0 failed to write data into buffer by buffer overflow action=:block
2023-01-04 21:57:43 +0000 [warn]: #0 Could not communicate to OpenSearch, resetting connection and trying again. [403] {"message":"The security token included in the request is invalid"}
2023-01-04 21:57:43 +0000 [warn]: #0 Remaining retry: 0. Retry to communicate after 1024 second(s).
2023-01-04 21:57:43 +0000 [warn]: #0 Could not communicate to OpenSearch after 10 retries. [403] {"message":"The security token included in the request is invalid"}
2023-01-04 21:57:43 +0000 [warn]: #0 got unrecoverable error in primary and no secondary error_class=Fluent::Plugin::OpenSearchError::RetryableOperationExhaustedFailure error="Could not communicate to OpenSearch after 10 retries. [403] {\"message\":\"The security token included in the request is invalid\"}"
  2023-01-04 21:57:43 +0000 [warn]: #0 suppressed same stacktrace
2023-01-04 21:57:43 +0000 [warn]: #0 bad chunk is moved to /tmp/fluent/backup/worker0/object_be0/5f1730f6035d2c8a6af8d93519ce2011.log
...
```

<br>

### 왜 Cloud not communicate to OpenSearch... 403 The security token included in the request is invaild가 발생했을까?

#### 설정
```conf
...
  <endpoint>
    url "#{ENV['ES_HOST'] ? ENV['ES_HOST'] : '127.0.0.1'}"
    region "#{ENV['AWS_REGION']}"
    assume_role_arn "#{ENV['AWS_ROLE_ARN']}"
  </endpoint>
 
  ## connection
  request_timeout 30s
  resurrect_after 5s
  reload_connections false
...
```
* request_timeout 30s - request가 30초가 넘어가면 실패하도록 설정
* resurrect_after 5s - 커넥션이 끊어진 후 설정된 시간 후에 커넥션을 재생성한다. 커넥션이 끊어진 후 5초 후에 재생성
* reload_connections false - true면 10,000 reqeust마다 커넥션을 재생성한다. false로 설정하여 커넥션을 재생성하지 않도록 설정
* assume_role_arn - opensearch에 연결하기 위해 어떤 IAM Role의 권한을 사용할지 지정, AWS STS로 부터 temporary credentials을 발급받는다


#### [Expiring AWS credentials](https://github.com/fluent/fluent-plugin-opensearch#expiring-aws-credentials) 옵션
* 특정 간격으로 credentials을 갱신하는 옵션으로 [#24](https://github.com/fluent/fluent-plugin-opensearch/issues/24) , [#46](https://github.com/fluent/fluent-plugin-opensearch/issues/46) 의 이슈로 인해 [#52](https://github.com/fluent/fluent-plugin-opensearch/pull/52)에서 refresh_credentials_interval가 추가되었음
```conf
<endpoint>
  url https://CLUSTER_ENDPOINT_URL
  region eu-west-1
  refresh_credentials_interval 3h # default is 5h (five hours).
</endpoint>
```
* configure는 fluentd 시작시 최초에만 호출되어 refresh_credentials_interval(default. 5h) 마다 동작하는 타이머가 등록되어 credentials을 가져온다
```ruby
// https://github.com/fluent/fluent-plugin-opensearch/blob/main/lib/fluent/plugin/out_opensearch.rb#L346
def configure(conf)
  ...
  # If AWS credentials is set, consider to expire credentials information forcibly before expired.
  @credential_mutex = Mutex.new
  if @endpoint
    @_aws_credentials = aws_credentials(@endpoint)
 
    if @endpoint.refresh_credentials_interval
      timer_execute(:out_opensearch_expire_credentials, @endpoint.refresh_credentials_interval) do
        log.debug('Recreate the AWS credentials')
 
        @credential_mutex.synchronize do
          @_os = nil
          @_aws_credentials = aws_credentials(@endpoint)
        end
      end
    end
  end
```
* 현재 사용하는 IAM Role maximum session duration은 4h라서 1시간 동안 공백이 있음
* refresh_credentials_interval > IAM Role maximum session duration(e.g. 10h > 12h)여도 The security token included in the request is expired 발생
* refresh_credentials_interval에 관련된 [#68](https://github.com/fluent/fluent-plugin-opensearch/issues/68)가 있고 credentials provider 생성시 duration_seconds을 사용하도록 [#78](https://github.com/fluent/fluent-plugin-opensearch/pull/78)에서 수정 중
  * duration_seconds - 세션의 기간, 관리자의 설정보다 낮아야하므로 1h ~ 12h까지 설정 가능. 설정 안하면 default 1시간이라 temporary credentials은 1시간 동안 유지
* [#74](https://github.com/fluent/fluent-plugin-opensearch/issues/74)를 보면 문제가 token refresh에 관련된 것이 아니라 detached/terminated token을 갱신할 책임이 있는 timer가 문제라고 하며, timer에서 일시적인 network 오류 발생시 retry가 필요하다는 의견이 있음
```ruby
# 관련 로그
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/sign.rb:30:in `signer_for'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/sign.rb:94:in `initialize'
Unexpected error raised. Stopping the timer. title=:out_opensearch_expire_credentials error_class=Aws::Errors::MissingCredentialsError error="unable to sign request without credentials set"
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/transfer_encoding.rb:26:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/sign.rb:40:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/sign.rb:30:in `new'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/helpful_socket_errors.rb:12:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/sign.rb:104:in `rescue in initialize'
/usr/lib/ruby/gems/3.1.0/gems/fluentd-1.15.2/lib/fluent/plugin_helper/event_loop.rb:93:in `block in start'
/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:236:in `new'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/param_converter.rb:26:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/checksum_algorithm.rb:111:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/user_agent.rb:13:in `call'
/usr/lib/ruby/gems/3.1.0/gems/fluentd-1.15.2/lib/fluent/plugin_helper/timer.rb:80:in `on_timer'
/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:349:in `block in configure'
/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:236:in `aws_credentials'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/assume_role_credentials.rb:53:in `initialize'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/refreshing_credentials.rb:30:in `initialize'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/jsonvalue_converter.rb:16:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/endpoint_discovery.rb:84:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/recursion_detection.rb:18:in `call'
/usr/lib/ruby/gems/3.1.0/gems/fluentd-1.15.2/lib/fluent/plugin_helper/thread.rb:78:in `block in thread_create'
/usr/lib/ruby/gems/3.1.0/gems/cool.io-1.7.1/lib/cool.io/loop.rb:88:in `run_once'
/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:349:in `synchronize'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/seahorse/client/plugins/endpoint.rb:47:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/checksum_algorithm.rb:136:in `call'
/usr/lib/ruby/gems/3.1.0/gems/fluent-plugin-opensearch-1.0.8/lib/fluent/plugin/out_opensearch.rb:351:in `block (2 levels) in configure'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/seahorse/client/plugins/request_callback.rb:71:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-sts/plugins/endpoints.rb:41:in `call'
/usr/lib/ruby/gems/3.1.0/gems/cool.io-1.7.1/lib/cool.io/loop.rb:88:in `run'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/seahorse/client/plugins/response_target.rb:24:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/seahorse/client/plugins/raise_response_errors.rb:16:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/endpoint_pattern.rb:30:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/http_checksum.rb:19:in `call'
Timer detached. title=:out_opensearch_expire_credentials
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/assume_role_credentials.rb:65:in `refresh'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-sts/client.rb:842:in `assume_role'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/seahorse/client/request.rb:72:in `send_request'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/response_paging.rb:12:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/idempotency_token.rb:19:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/param_validator.rb:26:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/query/handler.rb:30:in `call'
/usr/lib/ruby/gems/3.1.0/gems/aws-sdk-core-3.166.0/lib/aws-sdk-core/plugins/retry_errors.rb:360:in `call'
```

<br>

### 왜 refresh_credentials_interval과 IAM Role의 maximum session duration의 공백이 있는데 바로 발생하지 않았을까?
* aws credentials을 가져오는 코드를 살펴보자
```ruby
// https://github.com/fluent/fluent-plugin-opensearch/blob/main/lib/fluent/plugin/out_opensearch.rb#L219
def aws_credentials(conf)
  credentials = nil
  unless conf[:access_key_id].empty? || conf[:secret_access_key].empty?
    credentials = Aws::Credentials.new(conf[:access_key_id], conf[:secret_access_key])
  else
    if conf[:assume_role_arn].nil?
      aws_container_credentials_relative_uri = conf[:ecs_container_credentials_relative_uri] || ENV["AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"]
      if aws_container_credentials_relative_uri.nil?
        credentials = Aws::SharedCredentials.new({retries: 2}).credentials rescue nil
        credentials ||= Aws::InstanceProfileCredentials.new.credentials rescue nil
        credentials ||= Aws::ECSCredentials.new.credentials
      else
        credentials = Aws::ECSCredentials.new({
                        credential_path: aws_container_credentials_relative_uri
                      }).credentials
      end
    else
      if conf[:assume_role_web_identity_token_file].nil?
        credentials = Aws::AssumeRoleCredentials.new({
                        role_arn: conf[:assume_role_arn],
                        role_session_name: conf[:assume_role_session_name],
                        region: sts_creds_region(conf)
                      }).credentials
      else
        credentials = Aws::AssumeRoleWebIdentityCredentials.new({
                        role_arn: conf[:assume_role_arn],
                        web_identity_token_file: conf[:assume_role_web_identity_token_file],
                        region: sts_creds_region(conf)
                      }).credentials
      end
    end
  end
  raise "No valid AWS credentials found." unless credentials.set?
 
  credentials
end
```
* assume_role_arn이 설정되어 있으면 Aws::AssumeRoleCredentials을 사용하여 credential 발급, 없으면 Aws::InstanceProfileCredentials을 사용하여 [EC2 instance profile](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)을 사용  
* Aws::AssumeRoleCredentials과 Aws::InstanceProfileCredentials을 살펴보자
  * AssumeRoleCredentials - 현재 가지고 있는 credentials로 AWS STS로 temporary credentials을 가져오는 방식

```ruby
// https://github.com/aws/aws-sdk-ruby/blob/version-3/gems/aws-sdk-core/lib/aws-sdk-core/assume_role_credentials.rb#L23
module Aws
  # An auto-refreshing credential provider that assumes a role via
  # {Aws::STS::Client#assume_role}.
  #
  #     role_credentials = Aws::AssumeRoleCredentials.new(
  #       client: Aws::STS::Client.new(...),
  #       role_arn: "linked::account::arn",
  #       role_session_name: "session-name"
  #     )
  #     ec2 = Aws::EC2::Client.new(credentials: role_credentials)
  #
  # If you omit `:client` option, a new {Aws::STS::Client} object will be
  # constructed with additional options that were provided.
  #
  # @see Aws::STS::Client#assume_role
  class AssumeRoleCredentials
 
    include CredentialProvider
    include RefreshingCredentials
...
    @client = client_opts[:client] || STS::Client.new(client_opts)
...
    def refresh
      c = @client.assume_role(@assume_role_params).credentials  // AWS STS에서 credentials 획득
      @credentials = Credentials.new(
        c.access_key_id,
        c.secret_access_key,
        c.session_token
      )
      @expiration = c.expiration
    end
...
```

* InstanceProfileCredentials - EC2 instance profile을 기반으로 EC2 IMDS(Instance Metadata Service)로 temporary credentials을 가져오는 방식
```sh
$ curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<role name>
{
  "Code" : "Success",
  "LastUpdated" : "2023-01-05T07:43:40Z",
  "Type" : "AWS-HMAC",
  "AccessKeyId" : "xxxxxxxxxxx",
  "SecretAccessKey" : "xxxxxxxxxxx",
  "Token" : "xxxxxxxxxxx",
  "Expiration" : "2023-01-05T14:11:36Z"  // 6시간 후
}
```
```ruby
// https://github.com/aws/aws-sdk-ruby/blob/version-3/gems/aws-sdk-core/lib/aws-sdk-core/instance_profile_credentials.rb#L14
module Aws
  # An auto-refreshing credential provider that loads credentials from
  # EC2 instances.
  #
  #     instance_credentials = Aws::InstanceProfileCredentials.new
  #     ec2 = Aws::EC2::Client.new(credentials: instance_credentials)
  class InstanceProfileCredentials
    include CredentialProvider
    include RefreshingCredentials
...
```
AssumeRoleCredentials, InstanceProfileCredentials은 CredentialProvider와 RefreshingCredentials를 구현하여 CredentialProvider.credentials -> RefreshingCredentials.refresh -> IMDS or AWS STS에서 credentials을 가져온다  
즉 생성된 AssumeRoleCredentials, InstanceProfileCredentials을 이용하여 credentials을 사용할 때마다 credentials의 expiration을 확인하여 갱신을 시도하기 때문  

aws-sdk-java에서 SesClient, S3Client 등을 만들면 내장된 CredentialsProvider에서 credentials을 가져오기 때문에 자동으로 갱신되어 token expire issue는 발생하지 않는다  

aws-sdk-ruby도 동일하게 구현되어 있으나 fluent-plugin-opensearch에서는 Aws::AssumeRoleCredentials.new().credentials를 사용하여 Opensearch client에 provider를 전달하는게 아닌 credentials을 전달하므로 자동으로 갱신할 수 없기 때문에 주기적으로 Aws::AssumeRoleCredentials.new().credentials로 credentials을 가져오거나  

아래처럼 Aws::Sigv4::Signer 생성시 credentials provider를 넘겨주면 자동으로 갱신하게 된다

```ruby
// https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/Sigv4/Signer.html
// https://github.com/opensearch-project/opensearch-ruby/tree/main/opensearch-aws-sigv4
 
require 'faraday_middleware/aws_sigv4'
 
signer = Aws::Sigv4::Signer.new(service: 'es',
                                region: 'us-west-2',
                                credentials_provider: Aws::InstanceProfileCredentials.new)  // or Aws::AssumeRoleCredentials.new(role_arn: <role arn>, region: <region>), other credential provider
...
-----------------------------------------------------------------------------------------
require 'opensearch-aws-sigv4'
require 'aws-sigv4'
 
signer = Aws::Sigv4::Signer.new(service: 'es',
                                region: 'us-west-2',
                                credentials_provider: Aws::InstanceProfileCredentials.new)  // or Aws::AssumeRoleCredentials.new(role_arn: <role arn>, region: <region>), other credential provider
 
client = OpenSearch::Aws::Sigv4Client.new({ log: true }, signer)
 
client.cluster.health
 
client.transport.reload_connections!
 
client.search q: 'test'
```


<br>

## Resolve
* 해당 이슈를 빠르게 인지할 수 있게 log:"The security token included in the request is invalid"에 대해 alert 추가
* 현재 버전의 구현체에서는 aws-sdk-ruby의 자동 갱신을 사용하지 않으므로 아래처럼 설정하여 timer에 의한 갱신과 token expire 에러 발생 후 재연결이 작동하도록 설정
```conf
...
  <endpoint>
    url "#{ENV['ES_HOST'] ? ENV['ES_HOST'] : '127.0.0.1'}"
    region ap-northeast-2
    assume_role_arn "#{ENV['AWS_ROLE_ARN']}"
    refresh_credentials_interval 3h
  </endpoint>
 
  ## connection
  request_timeout 120s
  resurrect_after 5s
  reload_connections false
  reconnect_on_error true
  reload_on_failure true
...
```
* assume_role_arn - IMDSv2를 사용하게되면 AWS STS에서 credentials을 가져와야하므로 사용
* refresh_credentials_interval 3h - IAM Role의 maximum session duration이 4h이라 1h가 작은 값을 설정
* request_timeout 120s으로 증가
* reconnect_on_error true - 에러 발생후 다음 전송시 커넥션을 재생성, 기본적으로 host unreachable exception시에만 재연결한다
* reload_on_failure true - node ip를 다시 로드할 때 유용하다. true면 failover를 빠르게 인식함


<br><br>

> #### Reference
> * https://github.com/fluent/fluent-plugin-opensearch#expiring-aws-credentials
> * https://github.com/fluent/fluent-plugin-opensearch/issues/68
> * https://github.com/fluent/fluent-plugin-opensearch/pull/78
> * https://github.com/fluent/fluent-plugin-opensearch/issues/74
> * https://github.com/aws/aws-sdk-ruby/blob/version-3/gems/aws-sdk-core/lib/aws-sdk-core/assume_role_credentials.rb
> * https://github.com/winebarrel/faraday_middleware-aws-sigv4
> * https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/Sigv4/Signer.html
> * https://github.com/opensearch-project/opensearch-ruby/tree/main/opensearch-aws-sigv4
