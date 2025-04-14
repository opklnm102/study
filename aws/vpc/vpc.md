

AWS VPC 설정을 보니, IPv4대역을 10.0.0.0/16까지 밖에 설정하지 못하게 되어 있어 궁금증이 생겼습니다.
RFC에서는 10.0.0.0/8까지로 명시되어 있긴한데, AWS에서 /16까지만 지원하는 이유가 뭘까요?
또, EKS에서는 ENI 특성상 Pod들도 VPC PrivateIP를 할당받아 이용하는 것으로 아는데, 
VPC IP할당량 최대치가 10.0.0.0/16이라면 
단일 EKS 클러스터를 큰 규모로 운용하는 회사의 경우 팟이나 리소스에 할당해줄 IP가 모자라는 일이 발생하지는 않는지 궁금합니다!


/16이면 약 65000개 IP 이용 가능
아주 큰 서비스라 IP가 부족해진다면?
    새로운 VPC 추가
        https://aws.amazon.com/ko/premiumsupport/knowledge-center/eks-multiple-cidr-ranges/
    IPv6 이용
        https://youtu.be/1DF6yIFIx14
        https://aws.amazon.com/ko/blogs/korea/amazon-elastic-kubernetes-service-adds-ipv6-networking/
    
    

Pod CIDR
    GKE - CNI에서 별도의 CIDR 제공
    EKS - 추가 CIDR를 사용


