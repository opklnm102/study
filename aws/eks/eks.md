# [Amazon EKS(Elastic Kubernetes Service)](https://docs.aws.amazon.com/eks/)




AWS EKS: 쿠버네티스의 효율적인 관리와 운영을 위한 서비스
Kubernetes는 구글에서 개발한 오픈 소스 플랫폼으로, 컨테이너 기반 애플리케이션의 배포, 스케일링, 그리고 운영을 자동화합니다. Amazon Web Services (AWS)의 Elastic Kubernetes Service (EKS)는 이러한 k8s(Kubernetes)의 기능을 효율적으로 활용할 수 있도록 설계된 관리형 서비스입니다.

EKS는 인프라 구성, 서버 관리, 백업 등의 복잡한 작업을 AWS가 대신 처리하므로, 사용자는 컨테이너화된 애플리케이션의 배포와 운영에 집중할 수 있습니다. 이는 내부적으로 자체 k8s 클러스터를 유지보수하는 데 드는 시간과 노력을 크게 절약해 줍니다.

주요 특징은 다음과 같습니다.
1. 관리형 서비스: AWS는 컨트롤 플레인을 자동으로 패치하며 백업과 복구를 지원합니다.
2. 자동 스케일링: AWS의 Elastic Load Balancing(ELB)와 통합되어 애플리케이션의 트래픽에 따라 자동으로 리소스를 조정합니다.
3 통합성: VPC, IAM, RDS 등 AWS의 다양한 서비스와 쉽게 연동됩니다.
4. 이식성과 호환성: 표준 k8s 환경을 지원하므로, 온프레미스나 다른 클라우드 서비스에서 작동하는 k8s 애플리케이션을 쉽게 마이그레이션 할 수 있습니다.

EKS는 k8s 컨트롤 플레인의 가용성, 확장성 및 보안을 최적화하여, 사용자는 AWS 인프라의 성능, 규모, 신뢰성 및 가용성을 최대한 활용할 수 있습니다. 관리 부담을 AWS에게 맡기고 더 빠르게 애플리케이션을 배포하고 안정적으로 운영할 수 있게 됩니다.








Amazon EKS managed node group, 이제 EC2 Launch templates and 사용자 지정 AMI 지원
> https://aws.amazon.com/ko/about-aws/whats-new/2020/08/amazon-eks-managed-node-groups-now-support-ec2-launch-templates-custom-amis/
2020-08-17

EC2 instance 설정을 launch template을 사용하여 사용자 지정하도록 지원
launch template으로 강화된 수준의 특별한 보안, 규정 준수 요건을 준수하면서, cluster의 node를 간편하게 추가하고 업데이트할 수 있다

- EKS managed node group
worker node의 provisioning과 lifecycle 관리를 자동화
cluster에 node를 추가하고, 업데이트하기 위해 여러 AWS를 선택하거나 구성할 필요가 없다
launch template
	instance 시작시 명령을 실행하기 위한 볼륨 암호화, Security Group, Tag, user-data 등의 EC2 설정을 선언형 방식으로 수정하도록 지원
지금까지는 관리형 Node Group API를 ㅗㅇ해 제한적인 instance 수준의 사용자 지정 옵션만 제공
launch template이 통합됨에 따라 EC2 설정 및 node provisioning, draining, EKS upgrade와 같은 운영 작업을 offload 가능

user-data로는 지원할 수 없는 복잡한 요구사항이 있거나 Amazon Linux2 이외의 OS로 node를 실행해야하는 경우 사용자 지정 AMI를 사용




