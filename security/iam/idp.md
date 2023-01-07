# [Security] What is IdP(Identity Provider)?
> date - 2023.01.08  
> keyword - idp, identity  
> identity provider에 대해 정리  

<br>

## Identity Provider(IdP)란?
* 보안 주체에 대한 ID(identity)를 생성, 관리하고 federation or distributed network에서 의존하는 application에 인증 서비스를 제공하는 시스템
  * e.g. Google, Facebook 로그인
* web application <---(federated)---> trusted identity provider
  * web application은 신뢰할 수 있는 IdP(trusted identity provider)에 의존하여 federated identity를 사용해 인증 서비스를 사용한다
* SSO(Single Sign-On)을 사용하여 다른 웹사이트에 접근할 수 있도록 하는 trusted identity provider
  * SSO는 암호 피로도를 줄여 사용성을 향상시키며 잠재적인 attack surface를 줄임으로써 더 나은 보안을 제공


<br>

## IdP workflow
IdP workflow는 불과 몇 초 이내에 완료되기 때문에 사용자는 백그라운드에서 실행되는 작업을 알지 못한다
* 요청(request) - 사용자가 다른 로그인(Google, Facebook 등)에서 자격 증명(credentials, e.g. id/pw)을 입력
* 인증(verification) - IdP가 해당 사용자가 권한을 가지고 있는지 확인
* 허용(unlocking) - 사용자에게 원하는 기능에 대한 접근이 허용되고, 방문 내역이 저장된다


<br>

## IdP가 해결할 수 있는 문제
* 비밀번호 피로도
  * 늘어나는 비밀번호를 기억해야하는 피로도를 감소시켜준다
  * 사용자들은 메모장 등에 비밀번호를 기록하기도하므로 위험에 노출될 가능성이 있다
* 늘어나는 사용자 관리
  * 내부 직원, 외부 고객 등에게 맞춤형 로그인을 구현하려면 오래 걸리므로 IdP를 사용해 통일
* 로그인 피로도
  * 사용해야하는 서비스마다 매번 다른 방식으로 로그인을 할 필요 없이 로그인 한번으로 모든 서비스에 접근할 수 있다


<br>

## IdP 종류
* IndieAuth identity provider
* OpenID provider
* SAML identiy provider

<br>

### IndieAuth identity provider
* IndieAuth - OAuth 2.0을 사용하는 open standard decentralized authentication protocol
* 서비스에서 URL로 표시되는 사용자의 identity를 확인하고, 리소스에 접근할 수 있는 access token을 얻을 수 있다
* 사용자의 ID는 자신의 사이트이거나 3rd party authorization endpoint에 위임될 수 있는 선호하는 IdP에 연결된다

<br>

### OpenID provider
* OIDC(OpenID Connect) - OAuth 위에 있는 계층
* OpenID Provider -  특별한 유형의 OAuth 2.0 인증 서버로 RESTful HTTP API를 통해 JSON-formatted identity token을 발급

<br>

### SAML identity provider
* SAML(Security Assertion Markup Language) - security domain 간에 인증 및 권한 부여 데이터를 교환하기 위한 profiles
* SAML identity provider - 특별한 유형의 인증 기관으로 SAML의 SSO profile과 authentication assertions을 발급
* SAML service provider - SAML identity provider가 발급한 authentication assertions을 사용하는 서비스


<br>

## IdP 서비스

### AWS IAM identity provider
* AWS 외부에서 사용자 identity를 관리하고 있다면, AWS IAM User를 사용하는 대신 AWS IAM identity provider 사용하여 외부 사용자 자격증명에 AWS 리소스 권한 부여
  * 외부 사용자 자격 증명 - 사용자가 Facebook, Google과 같은 IdP를 통해 로그인하여 발급 받은 credentials
* AWS IAM User access key 같은 long-term security credentials을 발급할 필요가 없으므로 AWS account를 안전하게 보호할 수 있다
* IAM identity provider entity를 생성하여 AWS account와 IdP 간에 신뢰 관계(trust relationship) 설정 필요
* OIDC(OpenID Connect), SAML(Security Assertion Markup Language) 2.0과 호환되는 IdP 지원

<br>

### AWS IAM Identity Center
* 여러 AWS account와 application 대한 권한을 중앙에서 관리할 수 있는 서비스
* AWS Single Sign-On의 후속 서비스


<br><br>

> #### Reference
> * [Identity providers and federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers.html)
> * [Identity provider](https://en.wikipedia.org/wiki/Identity_provider)
> * [Identity Providers (IdPs): What They Are and Why You Need One](https://www.okta.com/identity-101/why-your-company-needs-an-identity-provider)
