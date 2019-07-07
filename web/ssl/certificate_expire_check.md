# [SSL] Certificate expire check
> date - 2019.07.08  
> keyword - certificate, ssl  
> 인증서 만료일 확인하는 법을 알아보자

<br>

## 인증서 정보 확인
* 인증서의 전체 정보 확인
```sh
$ openssl x509 -in <certificate> -noout -text

## example
$ openssl x509 -in my.pem -noout -text

Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
    Signature Algorithm: sha1WithRSAEncryption
        Issuer: C=KR, O=My, CN=My Self Signed CA
        Validity
            Not Before: Jul  7 10:01:55 2019 GMT
            Not After : Jul  6 10:01:55 2020 GMT
        Subject: C=KR, O=My, CN=My Self Signed CA
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
...
```


<br>

## 유효기간 확인
* 인증서의 유효기간을 확인
```sh
$ openssl x509 -in <certificate> -noout -dates

## example
$ openssl x509 -in my.pem -noout -dates

notBefore=Dec 10 10:23:19 2018 GMT
notAfter=Dec  5 10:23:22 2038 GMT
```


<br>

## 만료일 확인
* 인증서의 만료일만 확인
```sh
$ openssl x509 -in <certificate> -noout -enddate

## example
$ openssl x509 -in my.pem -noout -enddate

notAfter=Dec  5 10:23:22 2038 GMT
```


<br>

## 만료일 검증
* `-checkend`로 만료일을 검증하고, * expired먄 return **1**, not expired면 return **0**
```sh
$ openssl x509 -checkend <seconds> -noout -in <certificate path>

## example
$ openssl x509 -checkend 86400 -noout -in my.pem

$ openssl x509 -checkend $((60 * 60 * 24 * 365)) -in my.pem
Certificate will not expire  # or Certificate will expire
```


<br>

## 도메인의 인증서 유효기간 확인
```sh
$ echo '' | openssl s_client -connect <Domain>:443 | openssl x509 -noout -dates

## example
$ echo '' | openssl s_client -connect google.com:443 | openssl x509 -noout -dates

depth=1 C = US, O = Google Trust Services, CN = Google Internet Authority G3
verify error:num=20:unable to get local issuer certificate
verify return:0
DONE
notBefore=Jan 29 14:58:00 2019 GMT
notAfter=Apr 23 14:58:00 2019 GMT
```


<br>

## 만료일 순으로 인증서 나열
```sh
#!/usr/bin/env bash

CERTIFICATE_PATH=${1}

for CERTIFICATE in $(find ${CERTIFICATE_PATH} -name *.pem); do
  printf "%s: %s\n" \
  "$(date -jf "%b %e %H:%M:%S %Y %Z" "$(openssl x509 -enddate -noout -in ${CERTIFICATE} | cut -d= -f 2)" +"%Y-%m-%d")" \
  ${CERTIFICATE}
done | sort

## result
2020-07-06: my.pem
...
```


<br>

## 인증서 유효기간 확인 script
```sh
#!/usr/bin/env bash

# Show certificate expire at
# ./shell <dir>

set -e

err() {
  (>&2 echo "${1} Exiting...")
  exit 1
}

if [ -z "${1}" ]; then
  err "input plz certificate path"
fi

CERTIFICATE_PATH=${1}

for CERTIFICATE in $(find ${CERTIFICATE_PATH} -name *.pem); do
  echo ${CERTIFICATE}
  openssl x509 -in ${CERTIFICATE} -noout -dates
done

## result
my.pem
notBefore=Jan 29 14:58:00 2019 GMT
notAfter=Apr 23 14:58:00 2019 GMT
...
```


<br><br>

> #### Reference
> * [SSL 인증서 만료일 확인](https://zetawiki.com/wiki/SSL%EC%9D%B8%EC%A6%9D%EC%84%9C_%EB%A7%8C%EB%A3%8C%EC%9D%BC_%ED%99%95%EC%9D%B8)
> * [bash 이란 - PEM으로 인 코드 된 인증서에서 SSL 인증서 만료일을 확인하는 방법](https://code.i-harness.com/ko-kr/q/144fabd)
