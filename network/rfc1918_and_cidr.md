# [Network] RFC1918 and CIDR
> date - 2019.09.30  
> keyword - network, private ip, cidr  
> Amazon VPC(Virtual Private Cloud) 생성에 관련된 CIDR와 RFC1918에 대해 정리  

<br>

## [RFC1918](https://tools.ietf.org/html/rfc1918) - Address Allocation for Private Internets
* Private internet에서 IP Address 할당에 과련된 Spec
* Public IP와의 충돌을 방지하기 위함

<br>

### IP address range
| IP range | CIDR | Etc |
|:--:|:--:|:--:|
| 10.0.0.0 ~ 10.255.255.255 | 10.0.0.0/8 | 10/8 prefix |
| 172.16.0.0 ~ 172.32.255.255 | 172.16.0.0/12 | 172.16/12 prefix |
| 192.168.0.0 ~ 192.168.255.255 | 192.168.0.0/16 | 192.168/16 prefix |


<br>

## CIDR
* IPv4 address를 효율적으로 사용하게 함
* `x.x.x.x/y` 형식
  * y - subnet mask를 2진수로 바꾸었을 때 1의 개수
  * e.g. 255.255.255.0을 2진수로 바꾸면 11111111.11111111.11111111.00000000 -> 1이 24개 -> x.x.x.x/24
* 사용할 수 있는 IP address = 2^(32 - y)개
  * e.g. 2^(32-24) = 2^8 = 256개
* [CIDR to IPv4 Conversion](https://www.ipaddressguide.com/cidr)에서 쉽게 계산할 수 있다

<br>

| CIDR | IP range | IP address count |
|:--:|:--:|:--:|
| 10.1.0.0/8 | 10.0.0.0 ~ 10.255.255.255 | 16,777,216(2^(32-8) = 2^24)개 |
| 10.1.0.0/20 | 10.1.0.0 ~ 10.1.15.255 | 4,096(2^(32-20) = 2^12)개 |
| 10.0.0.0/24 | 10.0.0.0 ~ 10.0.0.255 | 256(2^(32-24) = 2^8)개 |
| 10.1.0.0/24 | 10.1.0.0 ~ 10.1.0.255 | 256(2^(32-24) = 2^8)개 |
| 10.1.0.0/32 | 10.1.0.0 | 1(2^(32-32) = 2^0)개 |


<br><br>

> #### Reference
> * [RFC1918](https://tools.ietf.org/html/rfc1918)
> * [CIDR to IPv4 Conversion](https://www.ipaddressguide.com/cidr)
