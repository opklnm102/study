# Ch5. Authentication

## 보안과 인증
* 인증
  * 등록된 사용자 식별
  * 사용자 별 권한
  * 인증 실패
    * status code 401 - unauthorized
    * 다시 로그인 화면으로 이동하기 때문에 보기 힘들다.
* 보안
  * 정보 노출 방지
  * 암호화 등

---

## 쿠키
* 클라이언트의 활동 추적하기
  * 로그인하지 않은 사용자가 쇼핑몰을 사용한다.
  * 쇼핑몰에서 상품을 장바구니에 넣으면?
  * 다음에 쇼핑몰에 방문했을 때, 장바구니는?
  * 장바구니 내용을 브라우저에 기록
* 서버가 웹브라우저에 기록
  * 상품을 장바구니에 담기
  * 쿠키에 장바구니 내용 저장
    * 응답 메시지에 쿠키명령 기록
* 웹브라우저는 쿠키 내용 전송
  * 서버는 요청에서 쿠키 읽기
  * 기존에 기록한 내용 확인

### HTTP 메시지와 쿠키
* 서버 -> 클라이언트
  * 쿠키 기록 응답
  * 메시지 헤더의 Set-Cookie
  * 메시지 예
    * HTTP/1.0 200 OK
    * Content-type: text/html
    * Set-Cookie: name=value;
* 클라이언트 -> 서버
  * 요청 메시지 헤더의 Cookie
  * 메시지 예
    * GET/spec.html HTTP/1.1
    * Host: www.example.com
    * Cookie: name=value;

### 쿠키 다루기

#### HTTP 모듈
* 쿠키 쓰기
  * `res.setHeader('Set-Cookie', 'name=value')`
* 쿠키 읽기
  * 쿠키 값 파싱 코드 필요
  * `req.headers.cookie  //'name=value'`

#### Express
* 쿠키 쓰기/삭제 - Express 기본
  * `res.cookie(name, value [, options])` - 쓰기
  * `res.clearCookie(name [, options])` - 삭제
  * 옵션
    * domain - 쿠키가 적용되는 서버
    * path - 쿠키가 적용되는 경로
    * expire - 쿠키 유효 날짜와 시간
    * maxAge - 쿠키 유효기간(ms)
    * httpOnly - HTTP 프로토콜에서만 사용
    * secure - HTTPS에서만 사용 여부. Boolean
    * signed - 서명 여부. Boolean
* 쿠키 읽기
  * [쿠키파서](https://github.com/expressjs/cookie-parser) 모듈
  * `npm install cookie-parser`
  * `req.cookies`

```JavaScript
var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());  //쿠키 파서 설정

//쿠키 기록하기
res.cookie('last', '2015.8.5');
res.cookie('visit', '2');

//쿠키 읽기
var last = req.cookies.last;
var visit = req.cookies.visit;
```

### 서명 쿠키
* 쿠키의 값은 메시지 헤더에 기록되고 그대로 노출되기 때문에 변조의 위험성이 크다.
* 쿠키 변조 방지
  * `signed=s%3AOriginalValue.XWrxfjdlkfjeuhfldjfdffdf34343fd`
* 서명된 쿠키 사용하기
  * 쿠키 파서 설정
    * `app.use(cookieParser('SECRET_KEY'))`
  * 쿠키 쓰기
    * `res.cookie('signed', 'OrignalValue', {signed:true})`
  * 쿠키 읽기
    * `req.signedCookies.signed`

```JavaScript
app.use(function(req, res){
    //방문 횟수를 저장하기위한 visit 쿠키
    var visit = parseInt(req.cookies.visit);
    if(!visit){
        visit = 0;
    }
    visit = visit + 1;
    res.cookie('visit', visit);

    //최종 방문 날짜를 기록하는 last 쿠키
    var now = new Date();
    //YYYY.MM.DD
    var last = now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate();
    res.cookie('last', last);

    var info = {visit: visit, last: last};
    res.json(info);
});
```

### 쿠키의 문제
* 메시지 크키가 커진다 - 느려진다.
* 다른 웹브라우저로 접속하면?
* 보안에 취약
  * 서명된 쿠키가 노출

---

## 세션
* 서버에 정보 저장(메모리, DB)
* 클라이언트는 세션 식별 정보(세션 ID)
* 세션 ID를 쿠키에 기록
  * 쿠키에 세션 ID만 기록하면 되므로 메시지 크기가 커지지 않는다.

### 세션 읽고 쓰기
* 세션 모듈 - `express-session`
  * `npm install express-session`
```JavaScript
var express = require('express');
var session = require('express-session');

var app = express();
app.use(session(OPTION));
```
* 옵션
  * name - 세션 ID의 키 이름(쿠키). 기본값은 connect.sid
  * resave - 변경이 없어도 저장
  * secret - 세션 ID 서명
  * saveUninitialized - 세션 초기화전에도 저장
  * store - 세션 저장소(DB를 이용할 때)
  * cookie - 쿠키 파서 옵션. 쿠키 파서 없이 사용 가능
* 세션 접근
  * `req.session`
* 세션 ID
  * `var sessionID = req.sessionID`
* 세션 쓰기
  * `req.session.visit = '123'`
* 세션 읽기
  * `var visit = req.session.visit`

### 세션 저장
* 세션 - 서버에 기록
  * 서버 재시작 -> 세션 기록 삭제
  * 서버 메모리
  * 서버 클러스터링
* 세션을 DB에 저장
  * 세션은 서버에 저장되므로 서버의 저장 공간을 차지하는 단점
  * 서버의 메모리는 서비스 운영에 매우 중요한 공간이므로 세션을 기록하는 용도로 사용할 수는 없다.
  * 모든 클라이언트가 항상 동시에 접속하는 것도 아니기 때문
* Session Store 모듈
  * `connect-mongo`
    * `npm install connect-mongo`
  * `connect-redis`
```JavaScript
var sessionStoreOptions = {
    url: 'mongodb://localhost:27017/session'
};
app.use(session({
    store: new MongoStore(sessionStoreOptions)
}));
```

---

## 인증을 사용하는 서비스 작성
* 서비스 중
  * 공개된 기능 - 인증 필요없는 API
    * 상품 검색
    * 상품 정보 보기
  * 개인화된 기능 - 인증 필요 API
    * 구매 내역
    * 장바구니

### 로그인 요청
* POST
* /login
* 바디 인코딩 - urlencoded
* 바디 내용 - id, pw

### 개인 페이지 요청
* /personal
* 로그인된 사용자만 접근 가능
* 로그인 요청(POST /login)에서의 상태 유지 - 세션

### example
```JavaScript
var express = require('express');
var session = require('express-session');  //세션
var bodyParser = require('body-parser');  //바디파서

var app = express();
app.use(bodyParser.urlencoded({extended: false}));  //urlencoded 바디파서 설정
app.use(session(OPTION));  //세션 설정

//라우팅
app.post('/login', handleLogin);
app.get('/personal', showPersonalPage);

app.listen(3000);

//로그인 요청
function handleLogin(req, res){
    var id = req.body.id;
    var pw = req.body.pw;

    if(id === 'user' && pw === '1234'){
        req.session.userid = id;  //세션 기록
        res.send('Login Success');
    }else{
        res.send('Login Fail');
    }
}

//개인 페이지 요청
function showPersonalPage(req, res){
    var id = req.session.userid;  

    if(id){  //세션에 사용자의 인증정보가 있는지 확인
        res.send('Private Page for ' + id);
    }else{
        res.sendStatus(401);
    }
}
```

---

## Passport를 이용한 인증

### 인증
* 인증 작성하기
  * 서비스 내 직접 인증 기능 작성(Local Auth)
  * 3자 인증 기능 사용(OAuth)
  * OpenID

#### 로컬 인증(Local Auth)
* 서비스 자체에서 사용자 가입
* 사용자 로그인 기능
* 사용자 정보 관리(암호 변경, 암호 찾기 등)
* 필요한 점
  * ID/PW가 서버와 클라이언트 메시지에 담겨서 이동
  * 서버에 ID/PW 저장
  * 사용자 정보 암호화
  * 보안 통신 필요 - HTTPS

#### 3자 인증(OAuth)
* 다른 서비스에 등록된 사용자의 인증 정보 사용
* 직접 가입/로그인 절차가 없음
* ID/PW 노출 위험 적다.
  * 토큰 사용
* 다른 서비스에서 토큰 발급

##### OAuth 시나리오
** 823 그림 들어감 **
* 새로운 서비스 사용하기
  * 새로운 사용자라면, 인증하라고 요청
  * 서비스 키 제공(client_id, secret)
* 가입된 서비스에 3자 인증 요청
  * 가입된 서비스에 인증
  * 인증 정보(토큰)를 새로운 서비스에 전달
* 가입된 서비스에 인증 상황 문의
  * 인증된 사용자인지 문의
  * 서비스 사용 가능

---

### [Passport](http://passportjs.org/)
* 인증 모듈
  * Passport
    * `npm install passport`
  * everyauth

#### Passport 다루기 절차
1. 모듈 로딩과 초기화
```JavaScript
var passport = require('passport');
app.use(passport.initialize());  //초기화
```

2. Strategy 설정
  * 인증 기능을 작성하는 인증용 모듈
  * `passport-local`
  * `passport-facebook`

```JavaScript
var Strategy = require('passport-strategy').Strategy;
passport.use(new Strategy(function(username, password, done){}));
```

3. 인증
  * 인증 성공시
    * 성공 메시지와 코드
    * 성공 페이지 이동(웹)
  * 인증 실패시
    * 실패 메시지와 코드
    * 로그인 페이지(웹)

```JavaScript
app.post('/login', passport.authenticate('local'));  //passport에 설정된 Strategy 인증 모듈 동작. 파라미터로 Strategy이름
```

4. 세션 기록과 읽기
  * 요청마다 세션기록과 읽기
    * `passport.authenticate` 이후 세션 기록(serializeUser)
    * 일반 요청마다 세션에서 읽기(descrializeUser)
  * 세션에서 읽어온 데이터
    * `req.user`
```JavaScript
passport.serializeUser(function(user, done){  //passport.authenticate()에서 인증 성공시 자동 호출
    //세션에 사용자 정보 기록    
});  
passport.descrializeUser(function(id, done){  //요청때마다 자동 호출
    //세션에 기록된 사용자 정보 얻어오기
});
```
5. 사용자 정보
> 인증 기능에는 사용자의 정보를 다루는 것까지 고려

---

### Local Auth
* 로컬 인증 용 Strategy
  * `passport-local`
* 설치
  * `npm install passport-local`
* 모듈 로딩과 Strategy 로딩
  * `var LocalStrategy = require('passport-local').Strategy`
* `var strategy = new LocalStrategy(OPTION, function(username, password, done){})`
  * 옵션
    * `passReqToCallback` - 요청 객체(req)를 파라미터로 전달
    * `usernameField`, `passwordField` - 사용자 ID, PW에 해당하는 필드 이름
  * 인증 콜백 구현
    * 성공 - `done(null, USER-INFO)`
    * 실패 - `done(null, false, FAILURE-INFO)`

```JavaScript
var LocalStrategy = require('passport-local').Strategy;
var strategy = new LocalStrategy(function(username, password, done){
    if(username == 'user' && password == '1234'){
        //인증 성공
        var userInfo = {name: 'user', email: 'use@mail.com'};
        return done(null, userInfo);
    }

    //인증 실패
    done(null, false, {message: 'Incorect ID/PW'});  //실패하면 사용자정보 대신 false
});

//패스포트에서 사용하기
passport.use(strategy);
```

#### 인증 요청과 인증 함수 동작
* 인증 요청(Post /login)
* Local Strategy의 인증 함수 동작
  * `passport.authenticate(Strategy, Option, Callback)`
  * 옵션
    * `session` - 세션 사용여부(default, true)
    * `successRedirect`, `failureRedirect` - 인증 성공/실패시 전환될 주소

```JavaScript
passport.authenticate('local', function(err, user, info){
    if(user){
        console.log('로그인 성공');
    }else{
        console.log('로그인 실패');
    }
});
```

#### 인증 결과, 인증 요청의 응답
* 웹
  * 로그인 성공 - 성공 페이지 이동
  * 로그인 실패 - 로그인 페이지 그대로
  * 페이지 이동을 서버가 담당(redirect)
```JavaScript
//콜백을 사용하지 않고도 이동 가능
//인증 성공 -> /myhome
//인증 실패 -> /login
app.post('/login', passport.authenticate('local', {successRedirect: '/myhome',
failureRedirect: '/login'}));
```

* 앱
  * 로그인 성공 - 성공 코드와 메시지
  * 로그인 실패 - 실패 코드와 메시지
  * 페이지 이동은 앱 담당
```JavaScript
//passport.authenticate('local')와 다른 미들웨어 2개를 스택으로 작성
//인증 성공 -> 200, success. 2번째 미들웨어 동작
//인증 실패 -> 401, unauthorized. 2번째 미들웨어 동작 안함
app.post('/login', passport.authenticate('local'), function(req, res){
    res.end('로그인 성공');
});
```
> 인증의 결과로 페이지 이동, 상태코드 반환만한다면 authenticate() 옵션 설정만으로도 가능

#### 인증 정보 유지 - 세션
* 인증 성공 -> 세션 기록
  * passport.serializeUser()
```JavaScript
passport.serializeUser(function(user, done){
    done(null, user);  //user(Strategy의 인증함수에서 전달)

    //사용자 id로 저장
    //done(null, user.id);  //id로 접근
});
```
* 클라이언트 요청 -> 세션에서 인증 정보 읽기
  * passport.descrializeUser()
```JavaScript
passport.descrializeUser(function(user, done){
    //사용자 정보 복원
    done(null, user);

    //id에서 사용자 정보 찾기
    //var user = findUser(id);  //사용자 정보 찾기
    //done(null, user);
});
```
* 세션에 기록된 사용자 정보 접근 방법
  * `req.user`
* 세션 사용 설정 코드
```JavaScript
var express = require('express');
var app = express();

//세션 모듈 설정
var session = require('express-session');
app.use(session({
    secret: 'Secret Key',
    resave: false,
    saveUninitialized: true
}));

//패스포트 설정
var passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());
```

#### 인증이 필요한 곳
* 마이 홈
* 장바구니
* 주문 내역
* 요청 처리할 때마다 인증 여부 확인
  * `req.isAuthenticated()`

#### 인증이 필요한 API 접근
```JavaScript
app.get('/myHome', isAuthenticated, function(req, res){
    //사용자 정보 접근
    var user = req.user;
    //인증된 상태
    res.render('myHome');
});

function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        //인증된 상태면 다음 미들웨어 실행
        return next();
    }
    //인증된 상태가 아니면 /login로 이동
    res.redirect('/login');
}
```

#### 로그아웃 - 세션 삭제
```JavaScript
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});
```

#### 실제 서비스에 인증을 적용하기 위해 필요한 기능
* 사용자 등록 요청
  * GET /register - 사용자 등록 페이지 요청
  * POST /signin - 사용자 등록 요청
* 인증 관련 요청
  * GET /login - 로그인 페이지 요청
  * POST /login - 로그인 요청
  * GET, DELETE /logout - 로그아웃 요청
* 사용자 정보 다루기
  * 사용자 찾기 - 인증
  * 사용자 등록 - 사용자 등록
  * 로그인 PW변경, 찾기

#### 기능별로 별도의 모듈 작성
* 사용자 정보를 다루는 User 모듈
* 사용자 찾기, 회원가입, 로그인 등
  * 사용자에 대한 기능을 모아 **별도의 모듈로 작성**
```JavaScript
User.findOne = function(id){};  //사용자 찾기
User.registerUser = function(id, name, password){};  //사용자 등록
```
```JavaScript
var strategy = new LocalStrategy(function(username, password, done){
    var user = User.findOne(username);
    if(!user){
        return done(null, false, {message: '사용자가 없습니다.'});
    } else if(user.password != password){
        return done(null, false, {message: '비밀번호가 다릅니다.'});
    }

    done(null, user);
});
```

---

### Facebook OAuth
* strategy - `passport-facebook`
  * `npm install passport-facebook`
* facebook에 서비스(앱) 등록
* 페이지 이동 발생
  * 인증 요청 - 서비스 -> 페이스북 페이지로
  * 사용자 승인/거부 -> 페이스북 페이지 -> 서비스로
  * redirect 주소 필요
* 설정
  * host 주소 - 콜백 URL과 같아야 함.

#### 웹
* 웹에서 OAuth는 페이지 전환이 2번 발생
  * 인증을 위해 페이스북 페이지로 전환
  * 승인시 개발자 페이지에 입력한 주소로 전환 - 서비스 페이지
    * 이후 토큰을 이용해 해당 범위의 동작
* FB 인증 함수
```JavaScript
var FacebookStrategy = require('passport-facebook').Strategy;
var fbStrategy = new FacebookStrategy({
    cliendID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    CallbackURL: CALLBACK_URL
}, function(accessToken, refreshToken, profile, done){
    var id = profile.id;
    var name = profile.displayName;
    var email = profile.email[0].value;

    //사용자 체크 - 새로운 사용자? -> 사용자 등록
    var user = User.findOne(id);
    if(!user){
        User.registerUser(id, name, email, picture, accessToken);
    }
});

passport.use(fbStrategy);
```
* 로그인 요청
  * `<a href="/auth/facebook">FB 로그인</a>`
* 로그인 요청 처리
```JavaScript
app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));
```
* 인증 요청시 SCOPE
  * 읽기 권한 - email(기본), public_profile, friend
  * 쓰기 권한 - create_content, ...
* CallbackURL에 의한 GET 요청
```JavaScript
app.get('/auth/facebook/callback', passport.authenticate('facebook',
{successRedirect: '/', failureRedirect: '/'}));
```

#### 모바일 앱
* SNS 인증 - FaceBook 앱에서 담당
* 콜백 불필요
  * 페이지 전환이 이루어지지 않아서
* 모듈
  * `passport-facebook-token` Strategy

---
