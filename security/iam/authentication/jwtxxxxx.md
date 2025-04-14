


refresh token
- https://velog.io/@park2348190/JWT%EC%97%90%EC%84%9C-Refresh-Token%EC%9D%80-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%9C%EA%B0%80
-> 서버에서 다 방어해야해서 jwt는 구현 복잡도를 높인다


refresh token 탈취
만료 기간까지 위험
1. DB에 유저별로 access/refresh token 1:1로 매핑 저장
2. 정상 유저는 access token 사용하여 접근
3. 공격자는 탈취한 refresh token으로 access token 발급 시도
4. access token이 만료되지 않았을 경우, refresh token이 탈취당했다고 가정하고 두 토큰 폐기
5. 유저의 재로그인 필요
6. 로그인시 access/refresh token 발급



JWT가 쿠키보다 좋은 점?
표준이여서 istio-proxy 등 여러곳에 호환된다
session storage가 불필요하여 서버 부하가 적고 구성이 간편
-> 보안이 약해지고 network 소모가 커진다



JWT를 안써도 refresh token, access token을 분리하는건 일반적인 접근
OAuth는 스펙상 그 둘의 분리를 강제화
JWT는 토큰 포맷
JWT를 쓴다고 access/refresh token 분리가 강제되는게 아니다


웹의 사용자 인증 용도라면 쿠키보다 나은점이 없다고 본다






client가 적의 손에 있는 이상 유출은 반드시되고
유출되었을 때의 대응을 생각하다보면 JWT의 장점은 사라지고 단점만 남는다
폐기 토큰을 기억하고 매번 체크하면 세션보다 나을게 없다
base64 encoded라서 까보면 정보가 나오니
만료시간 넣고 -> 서버에서 만료시간 검증?
해커가 키를 바꿔넣었다? refresh token이랑 비교해서 둘다 만료
결국 늘 페어로 검증해야하니 이게 무슨 바보같은 짓인가...




JWT
- stateless auth
- identity platform에서 직접 구현하지말고 저희를 쓰세요!
  - Auth0
  - Google Cloud Identity
  - AWS Cognito
  

세션이 토큰 방식과 큰 차이가 없다
session이 session key 탈취당하면, jwt가 이상할뿐

session key 탈취는 서버가 털렸을 떄만?
-> session key는 클라가 보통 쿠키로 가지고 있는다
-> 클라가 session key를 안보내면 못찾는다



jwt는 hmac으로 사용자가 가지고 있는 값의 참/거짓을 서버에서 검증하는 방식
서버에서는 특정 키로 사용자가 보낸 값을 복호화해서 데이터를 검증
-> redis 등을 통해 모든 서버가 session id에 대한 값을 공유할 필요가 없다를 의미
`.`을 기준으로 가운데 부분은 base64로 복호화하면 쉽게 볼 수 있는 json 평문

PW를 적으면 안된다..
-> JWT에 대한 이해를 세션으로 하고 있으면 안된다
hmac key길이를 매우 적게해서 쉽게 복호화되기도 한다





JWT는 session의 대안으로써 등장한 개념
session 서버를 둘 수 있다면 session이 편하고
JWT를 쓴다면 JWT를 쓸 수 있는 요구 사항인지 검토할 필요가 있다
allow/deny list나 동시 로그인 수 제한이 필요하다면 사실상 session을 재발명하는 수순으로 진화함

session, jwt 둘다 개념일뿐이라 cookie, header 등 무엇을 기반으로 구현하든 관계 없음



순간 부하가 굉장히 심한 환경에서 선택
serverless에서는 많이 사용
상시 가동되는 서버가 없다면? 적절하다
정상적인 토큰인지만 알아도 충분한 경우 고려
role/permission 변경이 실시간 반영되야한다면 곤란











oauth란?
https://www.google.co.kr/search?q=oauth&oq=oauth&aqs=chrome..69i57j69i60j69i65j69i60l2.159j0j7&sourceid=chrome&ie=UTF-8

https://ko.wikipedia.org/wiki/OAuth

jwt란?

https://www.google.co.kr/search?q=difference+between+OAuth+and+JWT+https%3A%2F%2Fstackoverflow.com%2Fquestions%2F34784644%2Fwhat-is-the-difference-between-oauth-&oq=difference+between+OAuth+and+JWT+https%3A%2F%2Fstackoverflow.com%2Fquestions%2F34784644%2Fwhat-is-the-difference-between-oauth-&aqs=chrome..69i57.249j0j7&sourceid=chrome&ie=UTF-8


https://stackoverflow.com/questions/34784644/what-is-the-difference-between-oauth-based-and-token-based-authentication


> oAuth는 oauth고, jwt는 jwt다



JWT를 안서도 refresh token, access token을 분리하는 건 일반적인 접근
OAuth spec상 분리를 강제화

JWT는 token format일뿐 access/refresh token과는 관련이 없다


refresh token이 session 기반으로 서버만 들고
access token은 client주는게 별로?









RoR 세션은 평문+shared secret을 사용한 대칭키 암호화 방식
-> shared secret 털리면 모든 토큰이 털린다

JWT는 authentication flow를 바꾸는게 아니라
PKI를 사용해서 client side token format의 보안 이슈를 해결하기 위해 등작

token format과 token lifecycle은 독립적인 문제

PHP -> RoR -> OAuth -> OIDC 역사 순으로 세션이 어떻게 발전했는지 쭉보면 좋다
OAuth가 JWT 안쓰는데 access/refresh token을 나눠서 쓰고,
JWT를 쓰면 refresh token을 따로 안나눌 수 있다

signature + base64 + JSON or encrypt + base64 + CBOR 대신 사용할 수 있는게 JWT


--------------------
Q1: JWT가 뭐야?

JWT는 두 개체가 정보 조각들("claims")을 안전하게 통신하기 위해 만들어진 개방형 표준 (https://datatracker.ietf.org/doc/html/rfc7519) 이야. 

JWT에는 3가지 정보가 담겨있어

1. 머리말 (이 토큰을 인증하는 방법)
2. 정보 조각 (JSON으로 쓴다!)
3. 인증 (이 토큰이 날조되지 않았다는 증거)




Q2: JWT는 어떻게 쓰여지고 있어?

무상태 세션을 구현할 때 많이 쓰여. 일반적인 세션 구현은 DB에 상태 저장이 필요하지만, JWT는 토큰에 모든 정보를 담아, DB 조회가 필요가 없지!
Daniel Lee
@dylayed
·
1월 31일
Q3: 보안 전문가들이 JWT를 쓰지 말라고 하던데?

JWT 표준은 보안 표준으론 질 떨어진다는 의견이야. 몇 가지 이유를 보면:

1) JWT 머리말에 토큰 인증 방법 중 하나가 none"인데, 인증하지 않는 방법이 인증 방법이라는 게 어처구니없지. 실제 이를 악용한 공격도 있어.

2) 인증 방법을 머리말에 명시하게 됨으로 해커들에게 너무나 쉬운 취약점을 내주고 있어. 실제로 널리 쓰이는 JWT 라이브러리는 벌써 몇 번이나 취약점 패치를 해야 했지. (https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)


3) 인증된 토큰을 쉽게 차단할 방법이 없어. 토큰이 탈취된 걸 알아도, 인증이 만료가 될 때까지 기다리거나, DB에 차단된 토큰 리스트를 저장해야 하는데... 후자를 채택하면 결국 "무상태 세션"이 아니게 되니 JWT의 메리트가 떨어지지.

결론: JWT는 날카로운 칼 같아서 쉽게 베이는데, 사용자 인증처럼 중요한 과정에 쓰이는게 불편하다!

가 보안 전문가들의 의견이야.

대부분 전문가들은 사용자 세션은 framework에 내장된 상태 세션 라이브러리를 사용하는걸 권장해.

상태 세션으로 인해 DB 부하가 걱정될 정도로 커져서 무상태 세션이 매력적으로 보인다면, 보안 전문가와 함께 무상태 세션 구현에 도전하도록 하고.



Q4: 그럼 JWT는 절대 쓰면 안돼?

그건 아냐! 소셜 로그인의 기반이 되는 OpenID Connect 규격은 ("Google 계정으로 로그인" 그거) JWT로 계정 정보를 통신하도록 명시돼있어.

언어/프레임워크에 귀속되지 않은 개방형 표준이 별로 없긴해. 그중 JWT가 그나마 제일 지원이 잘 되는 편이지.



Q5: JWT 대체자는 있어?

Paseto (https://paseto.io)

Macaroon (https://research.google/pubs/pub41892/)

Biscuit (https://biscuitsec.org)

여러 시도가 있는데, 아까 말했다시피 JWT처럼 지원이 빵빵하진 않아.

결국 JWT를 비교적 안전하게 사용하려는 노력이 계속될거 같긴해.


더 자세히 알아보고 싶다면:

http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/

https://securitycryptographywhatever.buzzsprout.com/1822302/9020991-what-do-we-do-about-jwt-feat-jonathan-rudenberg




----------------------------------------------------------------------
JWT는 지속적인 세션용으로는 적합하지 않다
서버나 서비스 간 인증 정보를 받은 뒤에는, 일반적인 방식의 세션 인증으로 전환해서 사용하는게 좋다
지속적으로 사용하고 싶다면 아주 짧은 유효시간(1시간 이내)을 두고 refresh token으로 갱신해가면서 사용하는게 좋다
refresh token을 이용하는 것도 client에서 사용하지 못하도록 막고(보안 상), code 인증 등을 통해서 server to server로 다시 refresh token을 발급받아 사용하는게 일반적
보안상 문제가 많고, 그걸 해결하려면 서버측에서 세션처럼 처리해야되고... 스펙이나 사용 방법이 개선된게 현재의 상태






## 쿠키

### 장점
- sub domain에서 동일한 세션을 사용할 수 있다
- 저장 공간이 작다
- 브라우저에서 관리
- client side js 조작이 줄어든다

### 단점
- site 간 위조 공격(CSRF)
- 서버에 저장해야하므로 scaling 이슈가 있다
- API 인증으로는 좋지 않음

## 토큰

### 장점
- 유연하며 사용 간단
- cross platform 대응
- 다양한 client에서 대응

### 단점
- 토큰 누출시 권한 제거가 어려움
  - deny list를 관리해야하는데, 그러면 stateless가 아니게됨
- 쿠키보다 공간을 많이 사용함
- JWT 내부 정보는 토큰 생성시의 데이터이므로 최신 데이터를 반영하지 않을 수 있음



session id를 쿠키에 저장하는 것처럼 JWT도 쿠키에 저장해서 세션으로 사용할 수 있다


쿠키는 서버와 클라이언트가 공유하는 저장소
거기에 어떤 것을 담을지는 유저의 몫

JWT는 양방향 토큰의 인코딩 규약일 뿐. 쿠키에 담을지, 헤더에 담을지, url에 담을지, body에 담을지는 유저의 몫

----

🔒 왜 보안 전문가들은 JWT를 싫어할까?

요즘 로그인 구현 튜토리얼을 보면 오랫동안 사용되던 백엔드에서 직접 stateful한 로그인 세션을 유지하는 방법이 아닌 JWT 규격을 사용한 무상태 세션을 구현 방법이 많이 보입니다. 소셜 로그인 구현에 쓰이는 OpenID Connect 프로토콜도 역시 JWT 규격을 채택하기도 했죠.

그렇다면 왜 보안 전문가들은 JWT를 싫어하는 걸까요?

가장 큰 이유는 다른 보안 표준과 비교해 치명적인 실수를 하기 쉬운 표준이기 때문입니다:

예를 들어 WT 토큰 인증 방법 중 하나는 "none"인데요, 이를 명시하면 토큰의 인증을 아예 스킵해 버립니다! 테스트 상황에선 쓸만 하겠지만, 토큰의 보안을 제거 하는 방법이 너무 쉬운 보안 규격이라는 지적이죠. 실제 이를 악용한 공격도 많이 있습니다.

더 크게 보면 무상태 세션에 대한 큰 취약점 때문에 JWT가 욕을 먹는 상황도 있습니다. 바로 인증된 토큰을 쉽게 차단할 방법이 없기 때문인데요. 토큰이 탈취된 걸 알아도, 인증이 만료가 될 때까지 기다리거나, DB에 차단된 토큰 리스트를 저장해야 하는데... 후자를 채택하면 결국 "무상태 세션"이 아니게 되니 JWT의 메리트가 떨어지죠.

결론은 - JWT는 날카로운 칼 같아서 쉽게 베이는데, 사용자 인증처럼 중요한 과정에 쓰이는게 불편하다!가 보안 전문가들의 의견 같습니다.










https://if1live.github.io/posts/anti-pattern-using-jwt-to-remove-server-to-server-api/


https://tecoble.techcourse.co.kr/post/2021-10-20-refresh-token/





먼저 OAuth는 직접 사용자로 부터 직접 ID, Password 등을 통해 인증을 처리하지 않고, 기존의 구글 등 다른 웹사이트 상의 본인 정보를 이용하여 또 다른 웹사이트 또는 어플리케이션에 접근 권한을 위임하기 위한 인증 절차입니다.
2.0은 그 절차에 대한 버젼을 의미하구요.

OAuth 인증 과정 중 발급받은 AccessToken 은 OAuth 인증 서버와 상호간 인증 처리를 마치고 OAuth 서버와 통신을 위한 토큰입니다. 구글을 예로 들면 발급받은 AccessToken 으로 구글에 로그인한 본인 정보를 조회한다든지 구글에서 제공하는 API들을 사용할 수 있는거죠. 따라서 일부 서비스에서는 단순 로그인을 위한 용도로만 쓸지 (OAuth Key), 다양한 API들을 사용하는 용도로 쓸지 (App Key) 를 구분하기도 한답니다.

OAuth 인증은 보통 Id나 이메일 등 사용자의 유니크한 식별값을 획득하는 것으로 그 절차가 마무리 됩니다. 유니크한 식별값이 우리 DB상에 없다면 신규 사용자로 판단하여 가입 절차를 밟게 하거나 기존에 다른 방식의 계정이 있었다면 계정연동을 하게 하면 됩니다. 만약 우리 DB에 있다면 기존 사용자이므로 해당 사용자가 정상적으로 로그인했다고 판단하고 서비스 인증을 처리하면 됩니다. 인증관리는 인증세션을 열 수도 있고, 쿠키를 발급할 수도 있고 JWT Token 등을 발급할 수도 있습니다.

만일 JWT방식의 AccessToken을 발급하기로 했다면 이제 프론트나 별도 APP에서 우리 서비스의 API를 호출할 때 이 Access Token을 요청 헤더에 포함시켜 API를 사용할 수 있게 됩니다.

추가로 JWT 방식은 사용이 간편하고 Token의 위변조가 힘들어 많이 사용 됩니다만 단점도 있습니다. Token내 정보는 누구든지 쉽에 알 수 있기 때문에 사용자의 민감한 정보는 담으면 안됩니다. 또한 한번 발급한 Token은 만료가 되기전까지는 폐기할 수 없기 때문에 이에 따른 추가적인 다양한 대안들을 마련해야 할 수도 있습니다. 그리고 JWT Token 발급 시 사용된 SecretKey를 알아내면 악의적인 목적으로 Token을 무단을 발급하거나 위변조가 가능하므로 Vault 도입 등 시크릿키 관리에도 신경써야 합니다.

