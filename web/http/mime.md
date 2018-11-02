# [HTTP] MIME(Multipurpose Internet Mail Extensions)
> date - 2018.11.03  
> keyword - http, mime
> http의 기본인 MIME에 대해 정리

<br>

## MIME(Multipurpose Internet Mail Extensions)린?
* e-mail을 위한 인터넷 표준 포맷
* e-mail 전송 프로토콜인 `SMTP`는 7비트 ASCII 코드만을 지원
* ASCII 코드로 표현할 없는 영어 이외의 언어, 바이너리 데이터(이미지, 동영상)로는 전송할 수 없다
* 인코딩(바이너리 -> ASCII 코드로 변환)과 데이터 종류를 MIME 타입으로 정의
  * MIME 타입에 따라 변환 후 전송
  * 수신측에서 MIME 타입을 확인 후 디코딩(ASCII 코드 -> 바이너리로 변환)
* e-mail에 사용하기 위해 등장했지만 HTTP에서도 전송 데이터를 표현하기 위해 사용

[mime example](./images/mime_example.png)

### Sample
```
From: "Sender Name" <sender@example.com>
To: recipient@example.com
Subject: Customer service contact info
Content-Type: multipart/mixed;
    boundary="a3f166a86b56ff6c37755292d690675717ea3cd9de81228ec2b76ed4a15d6d1a"

--a3f166a86b56ff6c37755292d690675717ea3cd9de81228ec2b76ed4a15d6d1a
Content-Type: multipart/alternative;
    boundary="sub_a3f166a86b56ff6c37755292d690675717ea3cd9de81228ec2b76ed4a15d6d1a"

--sub_a3f166a86b56ff6c37755292d690675717ea3cd9de81228ec2b76ed4a15d6d1a
Content-Type: text/plain; charset=iso-8859-1
Content-Transfer-Encoding: quoted-printable

Please see the attached file for a list of customers to contact.

--sub_a3f166a86b56ff6c37755292d690675717ea3cd9de81228ec2b76ed4a15d6d1a
Content-Type: text/html; charset=iso-8859-1
Content-Transfer-Encoding: quoted-printable

<html>
<head></head>
<body>
<h1>Hello!</h1>
...
```
* 이 메시지는 multipart/mixed로 여러부분(본문, 첨부파일)으로 이루어져 있음을 표현
  * 수신 클라이언트가 각 부분을 개별적으로 처리해야 함을 나타낸다

<br>

## MIME 타입이란?
* client에게 전송된 문서의 다양성을 알려주기 위한 메커니즘
* web에서 파일의 확장자는 의미가 없기 때문에 서버에서 올바른 MIME 타입으로 전송하도록 설정하는게 중요하다
* 브라우저들은 리소스를 download 받았을 때 해야할 기본 동작이 무엇인지 결정하기 위해 MIME 타입을 사용
* `/`로 구분된 타입과 서브타입으로 구성
  * `type/subtype`
    * type - 카테고리, 개별 혹은 멀티파트
    * subtype - 각각의 타입에 한정
* `Content-Type`에 MIME 타입 선언


### 개별 타입

| type | description | example |
|:--|:--|:--|
| text | text를 포함하는 모든 파일 | text/plain, text/html, text/css, text/javascript |
| image | 이미지 파일 | image/gif, image/png, image/jpeg, image/bmp, image/webp |
| audio | 오디오 파일 | audio/midi, audio/mpeg, audio/webm, audio/ogg, audio/wav |
| video | 비디오 파일 | video/webm, video/ogg |
| application | 모든 종류의 이진 데이터 | application/octet-stream, application/pkcs12, application/json, application/pdf, application/xml |

* 특정 subtype이 없는 텍스트 파일의 경우 `text/plain` 사용
* 알려진 subtype이 없는 이진 파일은 `application/octet-stream` 사용


### MultiPart
* 합성된 문서를 표현
  * 각각 다른 MIME 타입을 지닌 개별적인 파트들로 이루어진 문서
* multipart/form-data
  HTML Forms와 POST와 함께 사용
* multipart/byteranges
  전체 문서의 하위 집합만을 전송하기 위한 206(Partial Content)과 사용
* 위 2개를 제외하고는 HTTP가 처리할 수 없기 때문에 브라우저로 바로 전달된다

<br>

> #### Reference
> * [MIME 타입 - MDN web docs](https://developer.mozilla.org/ko/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
> * [[HTTP] MIME Type(Multipurpose Internet Mail Extensions)](https://dololak.tistory.com/130)
> * [Amazon SES API를 사용하여 원시 이메일 보내기](https://docs.aws.amazon.com/ko_kr/ses/latest/DeveloperGuide/send-email-raw.html)
> * [MIME Wikipedia](https://ko.wikipedia.org/wiki/MIME)
