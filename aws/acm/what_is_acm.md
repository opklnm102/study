
# [ACM] What is ACM
> date - 2022.08.18    
> keyworkd - aws, acm, certificate  
> 
> AWS Certificate Manager에서 Let’s Encrypt, GoGetSSL 같은 외부에서 발급받은 SSL 인증서를 사용하기 위해 import하는 방법을 정리  

<br>


https://www.google.com/search?q=AWS+Certificate+Manager&oq=AWS+Certificate+Manager&aqs=chrome..69i57j0i512l9.1046j0j7&sourceid=chrome&ie=UTF-8





저는 EKS에서 인증서를 cert-manager를 통해 이용하고 있습니다.
사내 모든 서비스가 AWS를 이용하기도 하고..
가끔 갱신하는데 오류 나서 AWS ACM 이용하려고 합니다.

여기서 질문은 AWS 이용하는 걸로 알고 있는 서비스 회사들이 AWS ACM을 이용하지 않는 이유가 뭔가요?
(예전엔 그랬던 것 같은데... 지금 찾아보니 대부분 AWS 인증서를 사용하고 있네요ㅎㅎ
￼
;)
아니면 전에는 사용하지 않았다가 AWS로 바꾼 이유?가 무엇인지 궁금합니다.

개인적으론 AWS ACM의 경우는 AWS 서비스에서만 사용해야 돼서라고 생각되긴 하는데요.
￼


￼hyunmin
기존 인증서->ACM 으로 변경한 이유에 대해서 말해보자면...

ACM은 인증서 관리를 편리하게 해줍니다. email 방식이 아니라 DNS Validation 방식이 나오면서 1년마다 한번씩 교체해주는 프로세스를 완전히 자동화 할 수 있고요.
또한 기존 발급받는 인증서가 3년정도의 기간이었다면 최근에 1년으로 기간이 짧아지면서 인증서 교체에 대한 부담이 증가한 부분이 ACM 사용을 더 적극적으로 이용하게 하는거 같습니다.


ACM을 사용하지 않는 이유는 이미 기존에 인증서로 만들어놓은 프로세스/프로젝트를 AWS 클라우드로 그대로 옮긴다면(예: 서버에 인증서 세팅) 굳이 앞에 ALB등을 추가하고 테스트 하는 작업을 하지 않고도 Lift&Shift 방식으로 옮길때 편리할거 같습니다.

ACM - 비용없음, 자동교체 프로세스 가능등 장점이 많아서 최근엔 대부분 권장하는 추세입니다.




## ACM을 왜써야 하는가?

## 어떤 케이스에 사용할 수 있는가?

AWS에서 웹서버에 HTTPS 설정하기 

AWS CloudFront의 origin으로 HTTP 서버 설정
- Min TTL, Max TTL, default TTL을 0으로 설정
- Route53에서 CNAME을 CloudFront로 설정
- ACM에서 인증서를 받고 Cloudfront에서 설정

ELB에도 ACM 인증서를 설정할 수 있지만 ELB는 시간당 과금되므로 보통 CloudFront가 저렴
k8s라면 cert-manager를 사용 -> lets encrypt 인증서를 3개월마다 갱신
ACM 인증서는 13개월 동안 유효하며, DNS validation이라면 자동으로 갱신된다







AWS 서버 인증서 작업

ACM(Amazon Certificate Manager)으로 하는걸 권장

ACM이 지원 안하는 region은 IAM에 업로드해서 사용할 수 있다
	https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_credentials_server-certs.html



https://docs.aws.amazon.com/acm/latest/userguide/acm-concepts.html#concept-transparency






AWS Certificate Manager(ACM)

certificate를 AWS 내부에서 arn으로 사용하기엔 좋은 서비스인듯??
따로 외부에서 사용하려면... export를 해야하는데
이게 안돼는...?

그런건가;;;





<br>

## Conclusion
* ACM을 사용하면 ELB(Elastic Loadbalancer), CF(CloudFront)에 `ARN`으로 간단하게 SSL을 적용할 수 있으니 AWS를 사용하고, SSL이 필요하다면 ACM을 사용하는게 편리하므로 고려해보자


<br><br>

> #### Reference
> * [인증서 다시 가져오기 - AWS Docs](https://docs.aws.amazon.com/ko_kr/acm/latest/userguide/import-reimport.html)








AWS Certificate Manager(ACM)


소규모 서비스라면 Nginx + **Let's Encrypt**로 SSL을 사용

Let's Encrypt - 3개월마다 갱신 필요


[GoGetSSL](https://www.gogetssl.com/)

ELB와 CloudFront에서만 사용 가능
CF는 virginia region에서 발급 필요

ACM의 SSL/TLS 인증서는 무료
    사설 기관은 비용 지불





ACM은 인증서를 갱신할 때 인증서의 domain name을 public Certificate Transparency(CT) log에 기록
CT logging 옵트 아웃?

*.example.com
    은 a.example.com, b.example.com 등에서 사용할 수 있지만 example.com에서는 사용이 불가하므로

*.example.com, example.com 2개의 도메인 등록



nginx를 사용하면 nginx 마다 하나 하나 적용했던 SSL을 ELB, 

























