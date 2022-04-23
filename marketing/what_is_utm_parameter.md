# [Marketing] What is UTM parameter?
> date - 2022.04.23  
> keyword - marketing, google analytics  
> 대부분의 서비스의 링크 공유시 확인할 수 있는 utm_source parameter에 대해 궁금해서 찾아본 내용을 정리  
> utm_source는 UTM parameter 중 하나로 UTM parameter에 대해 알아보았다  

<br>

## UTM(Urchin Tracking Module) parameter란?
```
https://www.example.com?utm_source=summer-mailer&utm_medium=email&utm_campaign=summer-sale
```
* **광고 캠페인의 성과를 측정하기 위해 사용되는 parameter**로 특정 웹사이트에 접근하는 트래픽이 어떤 경로를 통해 유입된 것인지 파악하는데 활용
* social app에서 캠페인을 운영하는 경우 가장 많은 수익을 창출하는 고객의 유입을 이끄는 app이 무엇인지 파악
* email, 동영상 광고, 인앱 광고를 통해 여러 버전의 캠페인을 운영하는 경우 결과를 비교하여 어느 마케팅이 효과적인지 파악할 수 있다


<br>

## UTM parameter 종류

| | utm_source | utm_medium | utm_campaign | utm_content | utm_term |
|:--|:--|:--|:--|:--|:--|
| 검색 광고 | google | cpc | class-flash-sale-21 | limited-offer | digital-marketing |
| 외부 사이트 | mobiinside | referral | class-flash-sale-21 | column | |
| 소셜 미디어 | facebook | orgnic-social | class-flash-sale-21 | limited-offer | stock-1080x1080 |
| 소셜 미디어 | tiktok | orgnic-social | class-flash-sale-21 | limited-offer | logo-1080x1080 |
| 이메일 | stibee | newsletter | class-flash-sale-21 | featured | hero-banner |

<br>

### utm_source(required)
* 트래픽을 보내는 광고주, 사이트, 검색 엔진 등 어디서 유입되었는지에 대한 정보
  * google, naver, facebook

<br>

### utm_medium(required)
* 광고, 마케팅 체널 등 어떠한 매체를 통해 유입되었는지에 대한 정보
  * CPC, 배너, 이메일 뉴스 레터

<br>

### utm_campaign(required)
* 캠페인 이름, 슬로건, 프로모션 코드 등으로 어떤 마케팅 캠페인(할인 쿠폰 등 사용자를 유혹시킨 요소)을 통해 유입되었는지에 대한 정보
  * summer_sale, discount_coupon

<br>

### utm_term
* 캠페인 키워드로 사용자의 검색어, 광고 키워드 등 어떤 키워드를 통해 유입되었는지에 대한 정보
  * 카페, 슬랙스

<br>

### utm_content
* 동일한 컨텐츠/광고 내의 요소를 식별하는데 사용
* 캠페인 내에서 광고 소재로 쓰인 내용이 다를 때 활용하는 정보
* 하나의 광고에 2가지 클릭 유도 링크가 있는 경우 utm_content를 사용하여 각각 다른 값을 설정하면 어떤 버전이 더 효과적인지 확인할 수 있다
  * 10%_세일, 라스트_세일


<br><br>

> #### Reference
> * [맞춤 URL을 사용해 캠페인 데이터 수집하기](https://support.google.com/analytics/answer/1033863?hl=ko#zippy=%2C%EC%9D%B4-%EB%8F%84%EC%9B%80%EB%A7%90%EC%97%90-%EB%82%98%EC%99%80-%EC%9E%88%EB%8A%94-%EB%82%B4%EC%9A%A9%EC%9D%80-%EB%8B%A4%EC%9D%8C%EA%B3%BC-%EA%B0%99%EC%8A%B5%EB%8B%88%EB%8B%A4)
