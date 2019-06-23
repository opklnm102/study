# [SSL] Domain Authentication
> date - 2019.06.23  
> keyword - certificate, ssl  
> 도메인에 대한 인증서 발급 과정 중 도메인 소유권 인증에 대해 알아보자

<br>

CA(Certificate authority)에서 사용자 사이트에 대한 인증서를 발급하려면 요청한 도메인에 대한 소유권(or 제어권)이 있는지 확인이 필요

<br>

## Authentication Type
* DCV(Domain Control Validated) Authentication
* OV(Organization Validated) Authentication


<br>

## DCV(Domain Control Validated) Authentication
* 도메인 소유/관리 권한에 대해 간단한 검증


<br>

### 인증서 내용
```
CN = *.hanbirocom
OU = COMODO SSL Wildcard
OU = Domain Control Validated
```


<br>

### DCV Authentication 방법
* Email
* DNS
* HTTP

<br>

#### Email 인증
* 도메인의 **WHOIS에 등록되어 있는 메일 주소로 인증 메일을 발송**하여 도메인 소유자임을 증명하는 방법

<br>

#### DNS 인증
* Name Server에 인증 기관에서 요청하는 **CNAME record를 추가**함으로써 도메인 소유자임을 증명하는 방법
* Name Server에서 TTL 값이 클 경우 확인에 지연이 발생할 수 있다
* 인증 후 CNAME record 삭제 가능
* e.g. mydomain.kr 도메인에 대하여 SSL 인증서를 신청하는 경우, 다음과 같은 record를 추가
```
2BFC3EB125196143870E74FCABC98BD.mydomain.kr.   CNAME      038CEC510DBB4ABCD55B9A59DE3728EA3D7.comodoca.com.
```
* CNAME record 추가 후 자체 테스트 필요
* 하나의 record로 도메인 이름이 동일한 여러 인증서를 생성할 수 있다
  * e.g. 여러 region에서 동일한 인증서 생성, 삭제한 인증서 교체
* ACM(AWS Certificate Manager)은 DNS 인증을 한 ACM 인증서를 자동으로 갱신
  * 인증서가 사용 중이고, DNS record가 존재하는 경우
  * 무한으로 갱신 가능
* Email 인증보다 훨씬 손 쉽게 자동화 가능

<br>

#### HTTP 인증
* Web Site root에 **인증 파일을 업로드**하여 증명하는 방법
* firewall 주의
* URL이 redirect 되면 안된다


<br>

## OV(Organization Validated) Authentication
* DCV 검증 뿐만 아니라 인증서를 신청한 기관(기업)에 대한 **실존 여부**까지 검증
* CA의 서류 심사, 전화 인증 필수
* DCV보다 오래 걸림
* 인증서 상세 정보에 기관 정보 추가 표시
* 높은 보안성이 요구되는 금융, 포털, 공공기관 등에 권장



<br>

### 인증서 내용
```
CN = www.hanbiro.com
OU = PremiumSSL
OU = HanbiroSSL
O = Hanbiro, Inc.
STREET = Boseong B/D 5F, 1425-1, Seocho-dong
L = Seocho-gu
S = Seoul
PostalCode = 631712
C = KR
```




<br><br>

> #### Reference
> * [Comodo 인증서 DCV 확인 및 설정 방법](https://www.comodossl.co.kr/products/comodo-ssl-dcv.aspx)
> * [DNS를 사용하여 도메인 소유권 확인 - AWS Docs](https://docs.aws.amazon.com/ko_kr/acm/latest/userguide/gs-acm-validate-dns.html)
