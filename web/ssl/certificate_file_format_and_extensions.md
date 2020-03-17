# [SSL] Certificate file format and extensions
> date - 2020.03.18  
> keyword - certificate, x509  
> pem과 같은 certificate file의 format에 대해 정리

<br>

## .der(Distinguished Encoding Representation)
* **binary로 encoding**된 X.509 ASN.1 key


<br>

## .pem(Privacy Enhanced Mail)
* X.509 v3 format
* **Base64 encoding**된 X.509 ASN.1 key로 Base64로 encoding된 `.der`과 같다
  * `openssl x509 -inform der -in to-convert.der -out converted.pem`으로 변환 가능
* certificate(public key), private key, CSR(Certificate Signing Request)등을 저장하는데 사용

<br>

### format
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----

## or
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```


<br>

## .key
* PKCS(Public Key Cryptography Standards)#8 중 일부로 **private key만을 포함**하는 `.pem` 파일


<br>

## .cert, .crt, .cer
* 다른 확장자를 가진 `.pem` or `.der`


<br>

## .p12, .pfx, .pkcs12
* PKCS(Public Key Cryptography Standards)#12 형식으로 [RFC 7292](https://tools.ietf.org/html/rfc7292)
* **public key와 pricate key를 함께 포함하고 password로 암호화**된 container 형식
* `.pem`과 달리 암호화되어 있어서 내용을 확인하려면 password 필요
* `openssl`로 public key, private key가 있는 `.pem`으로 변환 가능
```sh
$ openssl pkcs12 -in file-to-convert.p12 -out converted-file.pem -nodes
```


<br>

## OpenSSL을 이용한 certificate 변환
* pem -> der
```sh
## certificate
$ openssl x509 -outform DER -in file-to-convert.pem -out converted-file.der

## private key
$ openssl rsa -in file-to-convert.pem -pubout -outform DER -out converted-file.der
```

* der/cer -> pem
```sh
$ openssl x509 -inform der -in file-to-convert.der -out converted-file.pem

$ openssl x509 -in file-to-convert.pem -outform PEM -out converted-file.pem
```


* pem -> p7b(pkcs#7)
```sh
$ openssl crl2pkcs7 -nocrl -certfile file-to-convert.pem -out converted-file.p7b -certfile root-chain.cer
```

* cer/private key -> pfx(pkcs#12)
```sh
$ openssl pkcs12 -export file-to-convert.cer -inkey private.key -out converted-file.pfx -certfile root-chain.cer
```


<br>

> #### X.509
> * PKI(public key infrastructure)에 대한 표준(RFC 5280)
> * public key certificate의 format, revocation list, certificate chain validation algorithm 등을 정의
> * X.509 certificate - RFC 5280에 따라 encoding되거나 signing된 디지털 문서


<br><br>

> #### Reference
> [Pem 파일이란 무엇이며 다른 OpenSSL 생성 키 파일 형식과 어떻게 다릅니까?](https://qastack.kr/server/9708/what-is-a-pem-file-and-how-does-it-differ-from-other-openssl-generated-key-file)
> * [Convert Certificate Format](https://www.securesign.kr/guides/SSL-Certificate-Convert-Format)
