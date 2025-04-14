# [AWS IAM(Identity and Access Management)](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/introduction.html)





# AWS IAM

역할 전환

switch role 페이지로 이동할 수 있는 링크를 보낼 수 있음
계정 ID, 역할이 저장된 계정 별칭 및 역할 이름을 사용자에게 제공
-> 콘솔에서 스위치 가능

IAM User로 로그인 할때만 role switch 가능
	root account로는 불가능

> 콘솔에서 externalId 값이 필요한 role로 switch 불가능
> externalId 파라미터를 지원하는 AssumeRole API로만 가능

개별 사용자에게 직접 권한을 부여하지 않는게 best pratice
관리를 더 쉽게 하려면 IAM Group에 policy를 배정하고, 권한을 부여한 다음 적절한 그룹의 구성원인 사용자들을 생성하는걸 권장

콘솔에서 role switch하는 경우 항상 원래 자격 증명을 사용하여 전환을 승인
IAM User, SAML 연동 role, 웹 자격 증명 연동 Role 중 어느것으로 로그인하는지 여부에 관계 없이 적용


https://signin.aws.amazon.com/switchrole?account=daily&roleName=Album-role-ukdqwqzo2vgkfijc6qlhivh4se-master&displayName=AAA


account - AWS account id or accout alias
roleName - role name
displayName - optional

Role에 신뢰 관계에 등록이 필요함.....
그냥 만들면 안됨...





iam role 생성
trusted entity 등록
iam user에 해당 role assume 추가




