# [Security] About OTP
> date - 2019.06.17  
> keyword - fintech, otp  
> Multi-Factor Authentication에서 사용하는 otp에 대해 알아보자

<br>

## OTP(One Time Password)
* 무작위로 생성되는 **일회용 난수를 패스워드**로 이용하는 사용자 인증 방식
* 로그인시 **일회성 패스워드를 생성**하여 인증
* **동일한 패스워드를 반복 사용**함으로써 발생되는 보안 취약점을 개선하기 위해 도입
* 온라인 뱅킹 등 전자 금융 거래, 여러 서비스 로그인에서 사용
* OTP 생성기를 소지해야하는 불편함 존재


<br>

## OTP 생성기 종류
* 소형 단말기 모양의 토큰형
* 신용카드 모양의 카드형
* 모바일 OTP(MOTP)


<br>

## OTP 방식
* 버튼을 눌러서 생성
* 1분마다 자동으로 생성하는 시간동기 방식
* 4자리 패스워드 입력시 생성하는 방식

TODO: OTP 생성 방식 코드 추가


<br><br>

> #### Reference
> * [핀테크용어사전 OTP](https://m.blog.naver.com/koreafintech/220456454563)
