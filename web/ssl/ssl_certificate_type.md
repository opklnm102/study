# [SSL] SSL Certificate Type
> date - 2019.11.03  
> keyworkd - ssl, certificate  
> Wildcard와 Multi-Domain, PositiveSSL과 EssentialSSL, Comodo와 Sectigo 등 SSL Certificate 선택 과정에서 알아본 것을 정리

<br>

## SSL Certificate Selection Criteria
* SSL certificate 발급 사업자는 Comodo(Sectigo), GoDaddy 등 다양하고, 사업자별로 가격이 다르다
* SSL certificate는 표준에 의해 작동하기 때문에 브랜드별 기술적 차이는 없으므로 제품 인증 방식(DV, OV, EV)별 배상금, 발급이 빠르고 편리함에 따라서 선택


<br>

## Single name SSL Certificate
* 1개의 도메인에 SSL 적용 가능
* www.example.com로 발급 했다면 **root(apex) domain**인 `example.com`에도 적용 가능


<br>

## Multi-Domain SSL Certificate
* 1개의 certificate에 **여러개의 FQDN(Fully Qualified Domain Name)에 SSL 적용 가능**
  * example.com으로 등록시 www.example.com은 FQDN이 다르므로 SSL을 적용할 수 없다
  * www.example.com으로 등록시 root(apex) domain인 example.com은 FQDN이 다르므로 SSL을 적용할 수 없다
* www.example.com, www.example.net과 같이 여러 root domain을 사용하는 경우 certificate 관리에 유용
* **SAN(Subject Alternative Names)** 또는 **UCC(Unified Communications Certificates)**라고도 한다
* RFC 국제 표준 X.509 extension
* 여러개의 FQDN마다 각각 발급 받는것보다 Multi SSL 1개 적용이 비용/관리에 유리한 경우에 사용
* FQDN 수가 많아질수록 certificate size가 커진다
  * SSL 페이지 접속시, client는 `server/chain certificate` 정보를 받아오기 때문에 certificate size가 커지면 트래픽 증가에 따른 부하 상황에서 속도 지연이 발생할 수 있다
* FQDN 추가는 재발급을 통해서만 가능
  * single name SSL Certificate와 동일한 제약



<br>

### Certificate 내용
```
CN: example.com
...
DNS Name= example.com
DNS Name= www.example.com
DNS Name= mail.example.com
...
```


<br>

## Wildcard SSL Certificate
* FQDN에 `*`를 사용해 SSL을 적용할 수 있는 certificate
  * **Unlimited Subdomains**
  * Unlimited server licensing
* certificate domain(CN, DNS name)이 `*.example.com` 형식
  * 불가능한 형식
    * `a.*.example.com` - 중간 단계에 `*`
    * `*.*.example.com` - 여러 단계의 `*`
* Multi/SAN certificate의 일종
* RFC 국제 표준 X.509 extension
* Subdomain 마다 각각 발급 받는것보다 Wildcard SSL 1개 적용이 비용/관리에 유리한 경우에 사용
* 1개의 wildcard만 포함
* 여러 wilecard를 사용하려면 `Multi-Domain Wildcard SSL Certificate` 사용

<br>

### Certificate 내용
```
CN: *.example.com
...
DNS Name= *.example.com
DNS Name= example.com
...
```


<br>

## Multi-Domain Wildcard SSL Certificate
* 1개의 certificate로 여러 wildcard domain에 SSL을 적용할 수 있다
* 가장 넓은 범위의 certificate
  * 그만큼 비싸다
* *.example.com과 *.sub.example.com으로 등록시
  * www.example.com, a.sub.example.com 등 보호
  * FQDN 적용으로 root(apex) domain인 example.com은 보호되지 않는다


<br>

## EV(Extended Validation) SSL Certificate
* 사용자들이 한눈에 신뢰를 가질 수 있도록 **브라우저의 주소창에 녹색**으로 표시
* 까다로운 인증 절차 필요


<br>

## FQDN(Fully Qualified Domain Name)
* 명확한 도메인 표기법으로 **전체 도메인**을 표기
  * FQDN(host name + domain name) - www.example.com
  * host name - www
  * domain name - example.com


<br>

## Comodo PositiveSSL Wildcard SSL
* 가장 저렴
* SHA2 hash algorithm으로 256bit 보호 기능
* unlimited free reissue
* unlimited Subdomain

<br>

## Comodo EssentialSSL Wildcard SSL
* PositiveSSL과 **TrustLogo** 삽입 방식 차이가 있다
  * PositiveSSL - `<img src=""/>`로 삽입
  * EssentialSSL - SSL 도메인 확인용 javascript로 동적으로 제공


<br><br>

> #### Reference
> * [Sectigo/Comodo Positive와 Essential SSL 인증서 차이](https://www.securesign.kr/guides/kb/43)
> * [FQDN(Fully Qualified Domain Name)이란?](https://www.securesign.kr/guides/kb/51)
