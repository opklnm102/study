# [Security] What is IAM(identity and access management)?
> date - 2023.01.07  
> keyword - iam  
> IAM에 대해 정리  

<br>

## 인증, 권한 인증이란?
* 인증은 알고 있는 정보, 가지고 있는 정보, 신체적인 정보를 사용하여 사용자의 신원(identity)이 정확한지 확인하는 프로세스
  * 알고 있는 정보 - 오직 사용자만 기억할 수 있는 정보(패스워드, PIN 코드 등)
  * 가지고 있는 정보 - 오직 사용자만 가지고 있는 정보(확인용 모바일 앱의 코드, 보안 토큰 등)
  * 신체적인 정보 - 사용자만 제공할 수 있는 신체 요소(지문, 망막 스캔, 음성 인식 등)
* 권한 인증은 사용자에게 특정 기능/리소스에 접근할 수 있는 권한을 부여하는 프로세스
  * e.g. 파일 다운로드 허용, 관리자 기능 접근 허용
  * 사용자가 자신에게 부여된 권한에 따라 기능/리소스에 접근할 수 있는 권한을 인증하려면 먼저 identity를 인증해야한다


<br>

## IAM이란?
* 적합한 사용자와 디바이스만 필요할 때 원하는 애플리케이션, 리소스, 시스템에 접근할 수 있도록 허용하는 시스템
* 다양한 애플리케이션과 디바이스, 위치 및 사용자를 대상으로 리스소(애플리케이션, API, 클라우드 서비스, 데이터, 서버 등)에 대한 접근을 제어할 수 있으며, 사용자의 로그인을 수집하여 기록, 모든 사용자의 identity를 관리, 접근 권한 할당, 할당/제거 프로세스 감시 등을 할 수 있다
  * e.g. 애플리케이션에 로그인할 떄 IAM을 통해 사용자의 identity를 안전하게 보호
* 각 사용자의 identity와 접근 수준을 확인할 수 있는 다양한 정책과 서비스 및 기술도 IAM에 포함
* 관리자가 사용자의 권한을 제어하고 모니터링할 수 있다
* 사용자에 대한 신뢰 여부를 인증한 후 필요한 접근 수준에 따라 권한을 인증해야한다


<br>

## IAM tool
* SSO(Single Sign-On) - 사용자가 각 서비스마다 일일이 로그인할 필요 없이 1개의 계정을 사용해 자신을 안전하게 인증할 수 있게 해주는 tool로 다수의 비밀번호를 기억할 필요가 없다
* MFA(Multi-Factor Authentication) - 사용자의 identity를 확인할 수 있게 해주는 tool로 지식, 소유, 생체 인식으로 구성되는 다수의 인증 요소를 제공해야한다
* Lifecycle Management(LCM) - 늘어나는 사용자들을 쉽게 관리할 수 있는 tool로 사용자의 접근을 확인하여, 비활성 사용자를 관리할 수 있다

<br><br>

> #### Reference
> [IAM(Identity and Access Management)이란 무엇인가?](https://www.okta.com/kr/blog/2021/04/what-is-identity-and-access-management-iam)
> * [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
