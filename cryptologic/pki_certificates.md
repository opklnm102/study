# [Cryptologic] PKI Certificates 
> date - 2019.06.15  
> keyword - cryptologic, rsa, ssl  
> [PKI Certificates and Requirements](https://kubernetes.io/docs/setup/certificates/)를 보고 PKI가 어떤 것의 약자인지 궁금해져서 찾다보니 Public key Infrastructure(공개키 기반)더라... 까먹은거 같아서 정리


<br>

## PKI를 이해하기 위해 알아야할 점
* Message Digest
* Symmetric Key Algorithm
* Asymmetric Key Algorithm

<br>

### Message Digest
* Cryptographic Hash Function
* 긴 메시지를 줄임
* MD5(128 bit), SHA-1(160 bit), SHA-256(256 bit)..
* 같은 파일인지 체크할 때도 사용할 수 있다


### Symmetric Key Algorithm
* 대칭키
* One Key
* Encryption, Decryption시 **같은 key**를 사용
* 3DES(Triple Data Encryption Standard), AES(Advanced Encryption Standard)

```
+-------+           Encrptyion          +--------+
| Plain |    ----------------------->   | Cipher |
| Text  |          symmetric key        |  Text  |
+-------+    <-----------------------   +--------+
                    Decryption
```


### Asymmetric Key Algorithm
* 비대칭키
* Two Key
  * Private Key
  * Public Key
* Encryption, Decryption시 **다른 key**를 사용
* RSA(Rivest, Shamir, Adelman)

#### 암호화
```
+-------+      Public key Encrptyion    +--------+
| Plain |    ----------------------->   | Cipher |
| Text  |          symmetric key        |  Text  |
+-------+    <-----------------------   +--------+
               Private key Decryption
```

#### 전자 서명
```
+-------+      Private key Encrptyion   +--------+
| Plain |    ----------------------->   | Cipher |
| Text  |          symmetric key        |  Text  |
+-------+    <-----------------------   +--------+
               Public key Decryption
```


<br>

## PKI(Public key infrastructure)란?
* Asymmetric Key Algorithm 이용해 암호화 및 전자 서명을 제공하기 위한 시스템
  * Key 한 쌍(Private, Public Key)을 생성
  * Private Key는 개인이 소유
  * Public Key는 만인이 소유할 수 있음
* [RFC 2459 Internet X.509 Public Key Infrastructure](https://www.ietf.org/rfc/rfc2459.txt) spec


<br>

### 주요 기능
* 기밀성 - 암호화를 통한 정보 보호
* 접근 제어 - 선택된 수신자만이 정보에 접근
* 무결성 - 위/변조 방지
* 인증 - 행위자의 신원 확인
* 부인 방지 - 전자서명을 통한 신뢰도 향상(행위자 확인)


#### 기밀성
* 인가되지 않은 방식으로 정보를 획득할 수 없도록 하는 것
* 데이터 전송시 Plain Text를 수신자의 공개키를 이용해 암호화하고, 수신자는 개인키로 복호화하는 방식으로 기밀성 보장

#### 무결성
* 전송된 데이터가 위/변조되지 않았음을 보장하는 것
* **Hash function**과 **Digest** 이용
* Hash function이 **단방향** 인걸 이용해 암호문 전송시 Plain text를 Hash function으로 생성한 Digest 같이 전송하면 수신자도 Plain text를 Hash function을 이용해 생성한 Digest를 수신한 Digest와 비교해서 무결성 보장

#### 인증 및 부인 방지
* 부인 방지 - 행위자의 행위를 사후에 증명하므로써 사실 부인을 방지하는 것
* PKI에서는 **전자 서명**으로 부인 방지를 제공
* 전자 서명 - 수신자에게 송신자가 유효한 사람이라는 것을 증명하기 위해 송신자의 개인키로 암호화하여 전송하면 수신자는 송신자의 공개키로 복호화


<br>

### Scenario
* 암호문을 전송할 사람은 수신자에게 잠그는 키를 요청
* 암호문 수신자는 잠그는 키를 전송할 사람에게 전달
* 암호문을 해독할 수 있는 여는 key는 수신자만 소유하고 있으니 암호문이나 잠그는 키는 탈취 당해도 내용물을 알 수 없다
* 잠그는 키 - 나에게 암호문을 전송할 모든 사람에게 공개시킨다고 하여 공개키(public key)
* 여는 키 - 공개되지 않고 나만 소유하므로 비공개키(private key)
* 공개키를 보내주는 절차가 **key 교환**

| 다음의 일을 하기 위해.. | 누구 것을 사용? | 어떤 키를 사용? |
|:--|:--|:--|
| 암호화된 메시지를 송신 | 수신자의 | 공개키 |
| 암호화된 서명을 송신 | 송신자의 | 개인키
| 암호화된 메시지의 해독 |  수신자의 | 개인키 |
| 암호화된 서명의 해독 | 송신자의 | 공개키 |



### In Real World
* `Symmetric Key Algorithm`이 느리기 때문에 현실에서는 복잡한 구조를 이용

![pki](./images/pki.png)

<br>

### 전자 서명
**보낸 당사자가 보냈다는 것을 확인하는 절차**이기 때문에 Plain Text를 자체를 encrypt할 필요가 없다

![digital sign](./images/digital_sign.png)


<br>

## 구성 요소
* 인증 기관(CA: Certification Authority) - 인증서 발급/검증
* 인증서(Certificate) - public key에 관한 정보를 포함
* 등록 기관(RA: Registration Authority) - CA의 인증을 대행
* 디렉토리(Directory) - 인증서가 보관되어 있는 곳
* 사용자(End Entity) - 인증서를 사용하는 사용자 및 시스템

<br>

### 인증서(Certificate)
* 개인을 구별할 수 있는 정보, 공개키, 신뢰할 수 있는 CA의 비공개키를 이용한 전자 서명이 포함
  * issued 정보
    * CN(Common Name) - domain name(e.g. xx.com)
  * issued의 public key
  * issuer(CA) 정보
    * CN
  * issuer signature
    * CA의 private key로 서명
  * signature algorithm - RSA 
  * 유효 기간
* X.509 V3 표준으로 생성
* 확장자는 `.pem(based 64 encoding)`, `.crt` 등 사용
* Root CA의 인증서는 **Self Signed**

![Certificate](./images/certificate.png)

#### Finger Print
* 인증서의 주요 정보(issued, issued public key...)의 Hash 값

#### Signature
* Finger Print를 issuer(CA)의 private key로 암호화한 값
* signature를 issuer(CA)의 public key로 복호화해서 finger print와 일치하면 인증서와 issued public key의 무결성 검증

#### Self Signed
* issued와 issuer가 동일한 경우
  * 자신의 인증서 hash 값을 자신의 private key로 암호화하여 signature로 사용
* Root CA는 상위 인증 기관이 없기 때문에 스스로 보증
* 특정 CA는 존재하지 않지만, PKI 기반 암호화를 사용하고자 할 경우에도 사용

#### 인증서 서명 요청(CSR: Certificate Signing Request)
* public key, 인증서가 적용되는 도메인에 대한 정보 등 **인증서 발급을 위한 정보**를 담고 있는 인증서 신청 데이터
* 확장자는 `.req`를 사용하고 base 64 encoding

<br>

### 인증 기관(CA: Certification Authority)
* 인증서를 발급하고 검증
  * 등록 기관에 인증서를 발급하고 분배
* 디렉토리에 인증서 취소 목록을 공개
  * 사용자와 등록 기관의 취소 요구를 반영
* 상위 인증 기관이 하위 인증 기관을 인증하는 계층 구조

#### Root CA
* 최상위 CA2
* 가장 신뢰할 수 있는 CA

#### 하위 CA
* 계층내 다른 CA에 인증된 CA

#### Certificate Chain
* 상위 기관이 하위 인증서가 포함하고 있는 공개키를 상위 기관의 비밀키로 암호화 하여 보증 하는 것

![Certificate Chain](./images/certificate_chain.png)

<br>

### 등록 기관(RA: Registration Authority)
* 사용자 등록 및 인증서 분배 등의 역할을 CA로부터 위임 받아 수행
* CA에 인증 및 취소 요청을 전송하고, 디렉토리에서 인증서 목록과 취소 목록 검색 가능

<br>

### 디렉토리(Directory)
* 인증서 및 인증서 취소 목록(Certificate Revocation List) 등 PKI 관련 정보를 저장 및 검색하는 장소
* 인증서, CRL 보관 및 정보를 제공하며 효율적인 검색을 위해 `X.500`, `DAP`, `LDAP`, `FTP` 등 제공

#### 인증서 취소 목록(Certificate Revocation List)
* 분실 또는 유효기간 만료 등의 이유로 신뢰할 수 없는 인증서의 목록

<br>

### 사용자(End Entity)
* **PKI의 최종 사용자 및 시스템**으로 인증서와 private key를 소유
* 서명 생성 및 검증을 위해 인증서 생성, 취소, 갱신을 요구하며 이를 위해 디렉토리로부터 인증서 및 인증서 취소 목록 획득


<br>

## 인증서 파일 형식

### Certificate
* `.crt`, `.pem`
```
-----BEGIN CERTIFICATE-----
MIIDPDCCAiSgAwIBAgIBIjANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdkZXZr
...
-----END CERTIFICATE-----
```

### CSR(Certificate Signing Request)
* `.req`
```
-----BEGIN CERTIFICATE REQUEST-----
MIICYDCCAUgCAQAwGzEZMBcGA1UEAwwQZGV2LWt1YmUtZ2lsYmVydDCCASIwDQYJ
...
-----END CERTIFICATE REQUEST-----
```

### Private Key
* `.key`
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD595gYahIzB7oV
...
-----END PRIVATE KEY-----
```


<br>

## Example
* Root CA certificate와 Root CA certificate로 sign된 SSL certificate 생성해보자

<br>

### 1. Root CA certificate 생성
```sh
$ openssl genrsa -aes256 -out <destination path> <bit>

## example
$ openssl genrsa -aes256 -out rootca.key 2048
Generating RSA private key, 2048 bit long modulus
.......................................................+++
.......................+++
e is 65537 (0x10001)
Enter pass phrase for rootca.key: xxxxxx
Verifying - Enter pass phrase for rootca.key: xxxxxx

## 최소한의 permission 할당
$ chmod 600 rootca.key
```
* private key 탈취에 대비해 **AES256으로 암호화**
* `pass phrase` 분실시 private key를 얻을 수 없으므로 주의!

<br>

### 2. CSR(Certificate Singing Request)을 위한 설정 생성
```sh
## rootca_openssl.conf

[ req ]
default_bits            = 2048
default_md              = sha1
default_keyfile         = rootca.key
distinguished_name      = req_distinguished_name
extensions              = v3_ca
req_extensions          = v3_ca
  
[ v3_ca ]
basicConstraints       = critical, CA:TRUE, pathlen:0
subjectKeyIdentifier   = hash
# authorityKeyIdentifier = keyid:always, issuer:always
keyUsage               = keyCertSign, cRLSign
nsCertType             = sslCA, emailCA, objCA

[req_distinguished_name ]
countryName                     = Country Name (2 letter code)
countryName_default             = KR
countryName_min                 = 2
countryName_max                 = 2

organizationName                = Organization Name (eg, company)
organizationName_default        = My Inc.

organizationalUnitName          = Organizational Unit Name (eg, section)
organizationalUnitName_default  = Condor Project

# SSL 서비스할 domain 명 입력
commonName                      = Common Name (eg, your name or your server's hostname)
commonName_default              = My Self Signed CA
commonName_max                  = 64 
```

<br>

### 3. CSR(Certificate Singing Request) 생성
```sh
$ openssl req -new -key <private key> -out <destination path> -config <csr config>

## example
$ openssl req -new -key rootca.key -out rootca.csr -config rootca_openssl.conf
Enter pass phrase for rootca.key:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [KR]:KR
Organization Name (eg, company) [My Inc.]:.
Common Name (eg, your name or your servers hostname) [My Self Signed CA]:.

## 생성 확인
$ ls
rootca_openssl.conf rootca.csr          rootca.key
```

<br>

### 4. Self signed certificate 생성
```sh
## expierd 1 year
$ openssl x509 -req \
-sha256 \
-days 365 \
-extensions v3_ca \
-set_serial 1 \
-in rootca.csr \
-signkey rootca.key \
-out rootca.crt \
-extfile rootca_openssl.conf
Signature ok
subject=/C=KR
Getting Private key
Enter pass phrase for rootca.key:

## Certificate 생성 확인
$ openssl x509 -text -in rootca.crt

Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=KR, O=lesstif Inc., CN=lesstifs Self Signed CA
        Validity
            Not Before: Jul  7 03:41:07 2019 GMT
            Not After : Jul  6 03:41:07 2020 GMT
        Subject: C=KR, O=lesstif Inc., CN=lesstifs Self Signed CA
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
...
```

<br>

### 5. SSL certificate 생성
* RSA key pair 생성
```sh
$ open genrsa -aes256 -out my.key 2048

Generating RSA private key, 2048 bit long modulus
........................................................................................................+++
............+++
e is 65537 (0x10001)
Enter pass phrase for my.key:
Verifying - Enter pass phrase for my.key:
```

### 6. Pass phrase 제거
* SSL certificate는 암호화가 걸려있으면 매번 `pass phrase`를 입력해야 하는 불편함이 있으므로 제거

```sh
$ cp my.key my.key.enc
$ openssl rsa -in my.key.enc -out my.key

Enter pass phrase for my.key.enc:
writing RSA key

## 최소한의 permission 할당
$ chmod 600 my.key*
```

* my.key
```sh
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAwfnA3/QlsoVk+stz5wnmvnkXqWaFCztK5P845InAgoGC0CL3
vdkoNloMBeo/35AoHsUL15lmroE5JjdfgFW3QhM5gYmw7ByfBJc385bhSHnMgkQY
J+m4sNDi5EaasFQEHatA6/MqOnySVB671tSSFL4n5qZyN6Rwk3p8THOaRgJdURSo
gyUWUbvfxgtzNLLtMkzza0gn+RjhTdgHA4IH2uviKg73XSw9GFRk+irjnwH8PxXT
F/dEOWL122OylQxdMeBPtahZSGXAlV3xv6U0gDZ6UIkchUFDhXKbzgUTrJuUieZ1
/CqXQK0LvIP4TrUGQPdl5ECppztzYcgxGNSk7QIDAQABAoIBAQCJ1xvLSWh8arRu
T6NmG7AfzFcXJuYGLDU1c3QPWyA03SmDFEYuX6FmtihzD5oiGQOZkfavV7AS83sU
ACdaQA8A4j5sIddagaAyl+7Hp4EhioPcUd1Eh56Z72Y8Rzvnb1yZZLe2s85fT2SA
aHKc3+OK3/HkwoTJq43gDxtDDKcldYvRL8xk1upDX9whieZfyBWjeNJtI9oZjCWA
LCt1u8654opR6zrjr1IJE2ElAgWB1LhcOhLkRRDXVfjTMW5RWWQlirTY7dTqEZZv
h2re3jNwnJTu4OuNm6d5yxNlnefRlJEEIfRAx0DHcvFZfmUdyySHo+SYmjrGf/pj
2nYy56mVAoGBAPp1DsuZeiWDb1aA3WqD8gwlY3cBFvUkEtwNxwfCptGxnWtShX3z
LyC0TM7lsXZlebUsYorDhOIGxHhvmrPhumo2DALCTXhn2ZyNmeP2XwUFHalXzF1r
r/Iz6/fPkzxpY/Hun/poUV6VsX/9VQ/evSaXpD/byBCKwL2Tg6EKlXk7AoGBAMZE
tD2URqGSHKCR22jGIllrmb3n9MTXPjGkY12riOcYLSr5veDJBl/2hZ6vpdKtiK7w
V3+uvvjx3Zxj36JaNGI3LO/y+6N4jBgQESyg07Qfw7KxFFVCEBJ2p6/6ojTYlbDX
At4iaPV626iz2Cgeb4IcBcQoFc9KfvW/YJdvozf3AoGBAJD+9crPFpTjK7Djt8uz
iYyYlKXPnq/a64Q0AbavbQ5XCnCYfKn3AKCpYRIijgOiKbzGbmIxYRvNmS60Rda/
5sEYewmZ3WnIjYYBwEbmWgo49PwV1T18W4cXohN8O5ws02y7nihE/l6IwRL84aLn
a5ANGEzT+1YATicyYHD6BKEDAoGBAJEr6RVVpknTZCal5ZNXz/rNcGq+llgyihVr
Gl6RpNIgv6HB7yfRyVsmdDv2vGIAMh51WHvjBW3eGrfR4QNNLSHk6IBg16OgNmPA
D/MvZxNyVqZWRl8O2hnKy4ls6KvtEd3D8ROY+mUTqhZiaJknf9oyjn5MI3v+PevO
TvlTAp2NAoGAJvoyWmmuGVd5KPBwVn3H3wkwext399Vv5Tf6BwG6wT7vjB4oKOCM
Q3zFdu/yMu9JyHeSky6lXWPymysuAWejFhlS32ab9p5zLLwe/0u9SzVojVRxjEBr
Ypw42/iwEdBnpCh8OJOU/Tb3Y2GdCURVopp/YYWHKZ+clgh8DQYWdQk=
-----END RSA PRIVATE KEY-----
```

* my.key.enc
```sh
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,92BF5E8F15A81E064C5B27D47DDCE54D

UUF/6p/63/zNaSViEWh1aGbp+mdf7RWQH192Hdq3iQG9REX0bgkIP08HV2fRxHrW
9yIbhpJWcJttLDTpOEkx7+MFflDP1rEJaG0sLrgYWbZaQjpReXAGAYfmx3+O1cEi
VOQO2vwAnEdaOWmKVucLDG6uC33HhfzmqGlEL3PS006FZvuFoxH5FHSw952dcvC/
67l8Y4v9TA5vUFVY7vCNSXldOLKOj3uXEyEjlw70E/jCEufzn6bv8T7tL+bucP/V
Q2MOguN9riRdI7ifoExVYMblKiXqF5F2UXh5NWLvpx03lpwFD9ojUnq80eacoggo
GQ0fHe8mkkiZ7hvqfwfBJpUWP5SQmGypLJ1Uz+njfG8FLLeOKQ6plzpZJ5KxWm7x
pqW7dmQJ1nZI+lMXFDjRZOqMrZF7b7Zlc/jt/ayl35ipbmxaIhjAbADkchAXqWwa
7fVfxgFvLENV3EWlOMMo5BOiHBtkfMOKLSh7WTWidyeq16v13lVL0XXA0VUqNrFM
9bWEaCqhkbzRLGGRYVxfbj0B93LY4Rqo4q47G5RMPYuCFfr0K66sKdEocxMJw0zt
Cs/lydjBp5nUjnLrNteE9mh2AylzUR6gvOyU6BKAc/l3iTf/qG4QKVbtWOrPACfz
y8lyHwl1KuKY5qqLhl0DNZhz+pN8rJiNXLOo1zWb0chRNGgm2uxJX+r44GFllXiA
FY/4EtcH42winEm1QYKy2Tv2yA2PYBCbZjmh0OsHwjEZC/6/5+9/kdua2E+QPJI3
zO4hfiqoO5GRk2ZWt7ucJIuIbFmr0BaHds5dE7naH+H94rdYcjClQ5Vjl0c92ssR
bIDnVqQrutzKlw9mabCEmoPR2rJ61/5B81Cf+lgafn4+YMX75R4eDkbI7ejDOTtU
7mcYMR+RzhiV5jGhZ6gzvE54+8XO4B3ncnDCccEbAKfhFJIlsd0I7LR+Yu4Ru5Ov
W2+u3ZT+AOv41Tv/lCidstH8acam933TSb18eEKS+oNBGYnppiwVBem5JTqfXPwt
jQXHaO2Pxi0P0SgxnKnZL3msXE8EmRGAGcWSNKImj4JECP6I9RSeFXRss9ox1ALg
IdC5FHaYsQYuGwKNmqV0wokoqFuCL0knlrCvh3UWurObDN/huZdZciztGwHSnpft
zk75z9O+99mEsJ+XQIzBM4lEgOirNSFnuBI0PwoSoOJt1Y9iq5Ate6SKvDI74Ndt
N6WlyrNYdtmG1gehTmo49jUsb8lFZ8z0Vw8xXRCH9KdRCyxD01udV/BoPDxsV4fo
KP9XmoZe681xJBuxNOOr+MrABGvcuL7SOMiIqKX2fN4zY+f+JgSihjcfjfVt3w/M
XtGW6Z+HYc+WmlGJJQx77p5cpsdgVbU7nFR8ftzsyjW5i2KPfav4a3+fjRqGp9Wm
1lTkSBhsCYT1wTbaSbtgkcUFBf1Kv1NkIX1pLZ6AmnmVHFw3moXVRusq5DM/ocR2
QcApFWHYCkvyfJP7qdsqvu+u76BC2bPTqA2CKM4N9vLZQQ5OGcoseaW/J+h1x9qg
F742E6Kr1iSaPQLJ+Tou8PH4847cK9XOkEKDiiEClzDa91UVLAwTFXWYb/ExXXnn
-----END RSA PRIVATE KEY-----
```

<br>

### 7. CSR(Certificate Singing Request)을 위한 설정 생성
```sh
## my_openssl.conf

[ req ]
default_bits            = 2048
default_md              = sha1
default_keyfile         = rootca.key
distinguished_name      = req_distinguished_name
extensions              = v3_user
## 인증서 요청시에도 extension이 들어가면 authorityKeyIdentifier 를 찾지 못해 에러가 나므로 막아둔다.
## req_extensions = v3_user
 
[ v3_user ]
# Extensions to add to a certificate request
basicConstraints        = CA:FALSE
authorityKeyIdentifier  = keyid,issuer
subjectKeyIdentifier    = hash
keyUsage                = nonRepudiation, digitalSignature, keyEncipherment
## SSL 용 확장키 필드
extendedKeyUsage        = serverAuth,clientAuth
subjectAltName          = @alt_names

[ alt_names]
## Subject AltName의 DNSName field에 SSL Host 의 도메인 이름을 적어준다
DNS.1                   = www.my.com
DNS.2                   = my.com
DNS.3                   = *.my.com  # multi domain
 
[req_distinguished_name ]
countryName                     = Country Name (2 letter code)
countryName_default             = KR
countryName_min                 = 2
countryName_max                 = 2

organizationName                = Organization Name (eg, company)
organizationName_default        = My Inc.

organizationalUnitName          = Organizational Unit Name (eg, section)
organizationalUnitName_default  = My SSL Project

# SSL 서비스할 domain 명 입력
commonName                      = Common Name (eg, your name or your server's hostname)
commonName_default              = my.com
commonName_max                  = 64
```

### 8. CSR(Certificate Singing Request) 생성
```sh
$ openssl req -new -key <private key> -out <destination path> -config <csr config>

## example
$ openssl req -new -key my.key -out my.csr -config my_openssl.conf

You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [KR]: KR
Organization Name (eg, company) [My Inc.]: My Self Signed CA
Organizational Unit Name (eg, section) [My SSL Project]:
Common Name (eg, your name or your servers hostname) [my.com]: *.my.com
```

### 9. Certificate 생성
* Root CA private key로 signing
```sh
## expierd 1 year
$ openssl x509 -req \
-sha256 \
-days 365 \
-extensions v3_user \
-in my.csr \
-CA rootca.crt \
-CAcreateserial \
-CAkey rootca.key \
-out my.crt \
-extfile my_openssl.conf

Signature ok
subject=/C=KR/O=My Inc./OU=My SSL Project/CN=my.com
Getting CA Private Key
Enter pass phrase for rootca.key:

## 생성 확인
$ openssl x509 -text -in my.crt

Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 12919331681305346756 (0xb34aafb6efa7c2c4)
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=KR
        Validity
            Not Before: Jul  7 03:06:41 2019 GMT
            Not After : Jul  6 03:06:41 2020 GMT
        Subject: C=KR, O=My Inc., OU=My SSL Project, CN=my.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
...
```


<br><br>

> #### Reference
> * [PKI - Wiki](http://wiki.wikisecurity.net/wiki:pki)
> * [[PKI] 보안에서 말하는 PKI 의 기본 개념 간단 설명](https://crazia.tistory.com/entry/PKI-PKI-%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EA%B0%9C%EB%85%90-%EA%B0%84%EB%8B%A8-%EC%84%A4%EB%AA%85)
> * [RSA 인증서(Certification)와 전자서명(Digital Sign)의 원리](https://rsec.kr/?p=426)
> * [OpenSSL 로 ROOT CA 생성 및 SSL 인증서 발급](https://www.lesstif.com/pages/viewpage.action?pageId=6979614)
