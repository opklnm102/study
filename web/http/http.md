# HTTP

<br>

## HTTP 메시지 구조

| 이름 | 설명 |
|:---:|:---:|
| Start Line | 요청라인 or 상태라인 |
| Header | 생략 가능 |
| Blank Line | 헤더의 끝을 빈줄로 식별 |
| Body | 생략 가능 |

* Request일 때 - Request Line
```sh
GET /book/shakespeare HTTP/1.1  # request line -> method, URI, protocol version
Host: example.com:8080  # Header -> Key:Value
```
* Response일 때 - Status Line
```sh
HTTP/1.1 200 book  # status line -> protocol version, status code, status text
Content-Type: application/json; charset=utf-8
# Blank Line -> Header, Body 구분선
{
   "name":"aaa",
   ...
}
```


<br>

## HTTP 메소드
| 메소드명 | 의미 | CRUD와 매핑되는 역할 |
|:---|:---|:---:|
| GET | 리소스 취득 | Read(조회) |
| POST | 리소스 생성, 리소스 데이터 추가 | Create(생성) |
| PUT | 리소스 변경 | Update(변경) |
| PATCH | 리소스 변경 | Partial Update(부분 변경) |
| DELETE | 리소스 삭제 | Delete(삭제) |
| HEAD | 리소스의 헤더(meta data) 취득 | |
| OPTIONS | 리소스가 서포트하는 메소드 취득 | |
| TRACE | 루프백 시험에 사용 | |
| CONNECT | 프록시 동작의 터널 접속으로 변경| |

<br>

### GET
* `지정한 URI의 정보를 가져오는` 메소드
* 가장 많이 사용
* 클라이언트에서 데이터(이미지, 동영상)를 가져올 때 사용
* URI의 `?뒤에 Key:Value`로 데이터를 보낸다
  * URI 길이 제한 때문에 많은 데이터를 보내기 어렵다
  * 데이터가 주소창에 노출된다
```
GET http://aaa.com/search/?q=aaa&version=1 HTTP/1.1
```
* Response status code
  * 200 OK

<br>

### POST
* `리소스를 생성`하는 메소드
  * ex. 블로그에 글을 등록
* 데이터를 `Body`에 넣는다
* 생성할 리소스에 대한 데이터를 `Request Body`에 넣는다
* HTTP header `Location`에 생성한 리소스의 URI를 응답
* 주로 사용하는 Response HTTP status code
  * 200 OK
    * 리소스가 생성되었고, Body에 리소스가 들어 있을 수 있다
  * 201 Created
    * 리소스 생성되었고, Location header의 URI로 접근

<br>

### PUT
* `리소스를 전체 수정`하는 메소드
  * e.g. 게시글의 전체 내용 수정
* Response header에 Location: URI를 포함하지 않아도 된다
  * client는 요청된 URI를 그대로 사용하는 것으로 간주
* 주로 사용하는 Response HTTP status code
  * 200 OK
    * 리소스가 수정되었고, response body에 리소스가 들어있을 수 있다
  * 204 No Content
    * 리소스가 수정되었고, response body가 없다
    * Client의 요청이 처리되었으므로 Client는 갱신할 필요가 없다

<br>

> #### POST도 리소스를 생성하는데 사용할 수 있다!! 그럼 차이는?  
> * 생성한 리소스에 대한 URI 결정권이 서버측에 있으면 `POST`, 클라이언트에 있으면 `PUT`
> * `PUT`은 멱등성을 가진다
>   * 1번을 보내도, 여러 번을 연속으로 보내도 같은 효과를 보인다. 즉, **side effect가 없다**

<br>

### PATCH
* `리소스를 부분 수정`하는 메소드
  * e.g. 게시글의 제목만 수정
* 주로 사용하는 Response HTTP status code
  * 200 OK
    * 리소스가 수정되었고, response body에 리소스가 들어있을 수 있다
  * 204 No Content
    * 리소스가 수정되었고, response body가 없다
    * Client의 요청이 처리되었으므로 Client는 갱신할 필요가 없다

<br>

### DELETE
* `리소스를 삭제`하는 메소드
* 일반적으로 Response Body가 없다
* 주로 사용하는 Response HTTP status code
  * 200 OK
    * 리소스가 삭제되었고, response body에 status message가 있다
  * 202 Accepted
    * 요청은 성공했지만, 처리가 완료되지 않았다
  * 204 No Content
    * 리소스가 삭제되었고, response body가 없다

<br>

### HEAD
* 특정 리소스를 `GET` method로 요청했을 때의 response header를 요청
  * `GET`에서 실패하는 것은 `HEAD`에서도 실패하므로 리소스 존재 여부 확인에도 사용
* response body가 없어야 하며, 있어도 무시해야 한다
* `Content-Length` 등의 entity header는 포함될 수 있으며 `GET` method의 response body에 대한 내용이 들어간다
* 웹 서버 정보 확인, health check, version check, 리소스 존재 여부 확인 등의 용도로 사용
* `HEAD`의 response가 이전에 caching한 `GET`의 response가 유효하지 않다고 표시할 경우, 새로운 `GET` request를 생성하지 않더라도 cache를 무효화 한다


<br>

## Status Code
| 상태코드 | 의미 | 셜명 |
|:----|:----|:----|
| 1xx | Informational | 임시 응답, 계속 진행하라는 의미 |
| 2xx | Success | 클라이언트의 요청이 서버에서 성공적으로 처리 |
| 200 | OK(성공) | 서버가 요청을 정상 처리 <br> GET에서 정상 처리 |
| 201 | Created <br> (생성) | 요청이 정상 처리되어 리소스 생성 <br> 응답 헤더 Location에 새로운 리소스의 절대 URI를 기록 |
| 202 | Accepted <br> (허용) | 요청은 접수했지만 처리가 완료되지 않음 <br> 클라이언트는 응답 헤더의 Location, Retry-After를 참고하여 다시 요청 |
| 204 | No Content | 요청이 정상 처리되고 Response Body 없음 <br> PUT, PATCH, DELETE에서 정상 처리 <br> Client의 요청대로 처리가 되었으니 Client는 갱신할 필요가 없다 |
| 3xx | Redirection | 요청을 처리하기위해 추가적인 동작 필요 <br> 받은 URI로 다시 요청 |
| 301 | Moved Permanently <br> (영구 이동) | 지정한 리소스가 새로운 URI로 이동 <br> 이동할 곳의 새로운 URI는 응답 헤더 Location에 기록 |
| 303 | See Other <br> (다른 위치 보기) | 다른 위치로 요청 <br> 요청에 대한 처리 결과를 응답 헤더 Location에 표시된 URI에서 GET으로 취득 가능 <br> POST요청 처리 후 결과화면으로 리다이렉트 시킬 경우 자주 사용 |
| 307 | Temporary Redirect <br> (임시 리다이렉션) | 임시로 리다이렉션 요청이 필요 |
| 4xx | Client Error | 클라이언트의 요청 메시지에 오류가 있을 경우 |
| 400 | Bad Request <br> (잘못된 요청) | 파라미터를 잘못 넣었을 경우 |
| 401 | Unauthorized <br> (권한 없음) | 지정한 리소스에 대한 액세스 권한이 없을 경우 인증 필요 <br> 응답 헤더 WWW-Authenticate에 필요한 인증 방식을 지정 |
| 403 | Forbidden(금지됨) | 지정한 리소스에 대한 액세스 금지 |
| 404 | Not Found | 지정한 리소스를 찾을 수 없을 경우 |
| 5xx | Server Error | 서버 측 사정에 의해서 메시지 처리에 문제가 발생한 경우 <br> 서버의 부하, DB 처리과정 오류, 서버에서 Exception 발생 |
| 500 | Internal Server Error | 서버쪽에서 에러 발생 |
| 502 | Bad Gateway | Gateway 또는 Proxy 역할을 하는 서버가 그 뒷단의 서버로부터 잘못된 응답을 받을 경우 |
| 503 | Service Unavailable | 현재 서버에서 서비스를 제공할 수 없을 경우 |


<br>

## Header

### Request Header
| 헤더 필드 | 의미 |
|:---|:---|
| Accept | Response시 클라이언트가 허용하는 콘텐츠 유형 <br> ex. Accept: text/html이면 서버는 클라이언트에게 HTML유형의 콘텐츠를 응답 |
| Accept-Charset | 서버로부터 전달 받고 싶은 문자열 셋 설정 <br> ex. Accept-Charset: utf-8이면 서버는 클라이언트에게 utf8로 응답 |
| Authorization | 기본 인증 자격을 서버로 전송하는데 사용 |
| Cookie | 서버가 클라이언트에게 쿠키를 심어 놓았다면 해당 필드로 전송. 여러개면 `;`로 구분 <br> ex. 쿠키가 2개라면 cookie: first_cookie=hello; second_cookie=world |
| Content-Length | 콘텐츠 길이 |
| Content-Type | 콘텐츠 유형 설정 <br> ex. x-www-form-urlencoded <br> multipart/form-data(파일 전송) |
| Host | 서버의 이름. 포트번호와 함께 사용. 포트번호 생략시 80 포트 사용 |
| Referer | 페이지 요청시 이전 페이지 주소를 전달하기 위해 사용 |
| User-Agent | 클라이언트에 대한 설명 정보 |
| X-Forwarded-For(XFF) | Client의 IP를 식별하기 위한 정보 |

<br>

### Response Header
| 헤더 필드 | 의미 |
|:---|:---|
| Allow | 클라이언트의 요청방법을 서버에서 지원하고 있음을 의미 |
| Content-Length | 응답본문의 길이 |
| Content-Type | 응답 본문의 콘텐츠 타입 |
| Date | 현재 시간(GMT) |
| Location | 리다이렉션으로 사용. 클라이언트에게 다음에 요청해야할 URL을 알려준다 |
| Server | 응답하는 서버의 도메인 이름 |
| Set-Cookie | 클라이언트에 쿠키를 설정하도록 하여, 같은 응답에 여러 Set-Cookie를 보냄 |
| WWW-Authenticate | 서버에서 허락하는 인증 체계에 대한 정보 |


<br>

## URI
* 구조
```
<schema name> : <계층적인 부분>[? <질의> ][ # <fragment> ]

// example
http://www.example.com?search=xxx#summary
```

<br>

### X-Forwarded-For(XFF)
* Client의 IP를 식별하기 위한 정보
* L4(Loca balancers, Proxy server, caching server) 장비가 있을 경우 L4의 IP를 웹 로그에 남기게 된다
  * Client IP -> L4 -> WAS
* 이때 header의 `X-Forwarded-For`로 Client IP를 알 수 있다
* `,`를 구분자로 사용
  * 1번째 IP로 Client를 식별
  * X-Forwarded-For: client, proxy1, proxy2


<br><br>

> #### Reference
> * [MDN Web Docs](https://developer.mozilla.org/ko/docs/Web/HTTP)
