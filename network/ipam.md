# [Network] IPAM(IP Address Management)
> date - 2021.12.05  
> keyworkd - network, ip, ipam, cni  
> [amazon-vpc-cni-k8s](https://github.com/aws/amazon-vpc-cni-k8s)의 ipamd를 보고 정리

<br>

## IPAM(IP Address Management)
* IP, Domain name, network 관리 등을 구현하는 solution
* IP를 자동으로 부여하고 쉽게 찾을 수 있도록 도와준다
* `DNS(Domain Name Server)`와 `DHCP(Dynamic Hosting Configuration Protocol)`의 성능과 확장성, 가용성을 높여준다


<br>

## amazon-vpc-cni-k8s에서의 동작
[amazon-vpc-cni-k8s의 ipamd(IP address management daemon)](https://pkg.go.dev/github.com/aws/amazon-vpc-cni-k8s@v1.10.1/pkg/ipamd)는 node에서 다음을 담당

* ENI(Elastic network interfaces) 생성, ENI를 EC2에 연결, secondary IP를 network interface에 할당
* Pod에 IP를 할당하기 위한 available secondary IP warm-pool 유지
  * 빠른 Pod networking 설정을 위해 warm-pool 사용
* Pod에 warm-pool의 IP 할당
  * `kubelet`에서 ADD Pod request 수신시


<br><br>

> #### Reference
> * [Pod networking (CNI)](https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html)
> * [aws/amazon-vpc-cni-k8s - GitHub](https://github.com/aws/amazon-vpc-cni-k8s)
