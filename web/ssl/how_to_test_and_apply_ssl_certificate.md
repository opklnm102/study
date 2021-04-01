# [SSL] How to test and apply SSL Certificate
> date - 2021.04.01  
> keyworkd - ssl, certificate  
> SSL 인증서 적용 절차와 test하는 방법에 대해 정리  

<br>

## SSL 인증서 적용 절차

### 일반적인 절차
```
SSL 인증서 생성 -> 서버에 인증서 적용 및 test -> CNAME 추가
```

### 예외적인 절차
* managed service(e.g. Akamai CPS)에서 SAN(Subject Alternative Names) 인증서를 사용하고, CNAME 추가까지 완료된 후에 SSL 인증서 에러를 발견하여 SAN(Subject Alternative Names) 인증서에 도메인 추가시 자동으로 적용해주는 경우
```
서버에 인증서 적용 -> CNAME 추가 -> SSL 인증서 생성 -> 자동 적용
```

<br>

> Akamai CPS에서 CNAME record가 존재하고, auto validate `on`이면 최초 인증은 필요 없다


<br>

## 일반적인 경우에 test
* 실제 트래픽을 보내기 전에 해당 도메인에 대하여 SSL 인증서 설정에 이상이 없는지 확인
* CNAME record 추가시 트래픽이 유입되므로 그전에 인증서에 대한 test 필요

### 1. CNAME record를 생성할 도메인에 매핑된 IP 확인
```sh
$ dig +short test.opklnm102.me
12.51.39.1
123.53.36.13
```

### 2. /etc/hosts에 내용 추가
* CNAME record를 생성할 도메인과 IP를 매핑하는 과정
```sh
## /etc/hosts

12.51.39.1 real.opklnm102.me
```

### 3. /etc/hosts 적용 확인
* `ping` 사용
```sh
$ ping real.opklnm102.me

PING real.opklnm102.me (12.51.39.1): 56 data bytes
64 bytes from 12.51.39.1: icmp_seq=0 ttl=54 time=6.223 ms
64 bytes from 12.51.39.1: icmp_seq=1 ttl=54 time=4.830 ms
...
```

* 제대로 적용되어 있지 않다면 `Unknown host` 발생
```sh
$ ping real.opklnm102.me
ping: cannot resolve real.opklnm102.me: Unknown host
```

### 4. 적용된 인증서 확인
* `CN`에 적용한 인증서가 표시되면 정상
```sh
$ curl -sSv https://real.opklnm102.me 2>&1 | grep subject:
*  subject: CN=real.opklnm102.me
```


<br>

## Conclusion
* 일반적인 경우 SSL 인증서 적용시 인증서 에러를 확인하기 위해 local에서 test를 진행하는게 안전하므로 꼭 수행하자


<br><br>

> #### Reference
> * [Akamai CPS(Certificate Provisioning System)](https://learn.akamai.com/en-us/webhelp/certificate-provisioning-system/getting-started-with-the-certificate-provisioning-system/GUID-F4E138EA-6472-491A-BF8D-8CE9C85AD263.html)
> * [CPS workflow](https://learn.akamai.com/en-us/webhelp/certificate-provisioning-system/getting-started-with-the-certificate-provisioning-system/GUID-F4284C56-94B0-46F4-AC2F-89670A96691A.html)
