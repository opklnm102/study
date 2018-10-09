# Ch2. Express

## Express
* 경량 HTTP 웹 프레임워크
  * 요청과 응답
  * 미들웨어 사용
  * 템플릿 엔진
* 설치
  * `npm install express`
* Express 애플리케이션 생성
```JavaScript
var express = require('express');
var app = express();
//var app = require('express')();  //1줄로 요약 가능

app.listen(3000);  //서버 시작
```

* HTTP 모듈 서버와 함께 Express 사용
  * HTTP 서버의 `요청 이벤트 핸들러를 Express객체`로 설정
```JavaScript
var http = require('http');
var express = require('express');
var app = express();

http.createServer(app).listen(3000);  //서버 시작
```

### Express 요청
* 요청 분석
  * `req.query` - 쿼리문자열
  * `req.path` - 요청 URL중 경로
  * `req.params` - URL의 파라미터
  * `req.cookie` - 요청 메시지 내 쿠키(쿠키 파서 필요)
  * `req.body` - 요청 메시지 바디 분석(바디 파서 필요)

### Express 응답
* 다양한 응답 메소드
  * `res.json()` - JSON응답 메시지 전송
    * `JSON내장객체`와 `stringfy()` 대신 사용
  * `res.redirect()` - 리다이렉션 응답 전송
  * `res.render()` - 템플릿으로 렌더링
  * `res.send()` - `JSON`, `HTML`, `Buffer` 전송, 메시지 헤더에 `Content-Type`자동 설정
  * `res.sendStatus()` - 상태 코드와 상태 메시지 전송
  * `res.status()` - 상태 코드 설정. 응답 메소드 종료X
  * `res.download()` - 파일 다운로드

---

## Express 미들웨어
* 미들웨어 기반의 프레임워크
  * connect
  * Express
* 미들웨어 - 요청 분석, 처리하는 모듈
  * 작은 단위 모듈
  * 요청과 응답 처리 함수 형태

### `Express`는 다수의 미들웨어 조합으로 동작
* 다음 미들웨어 실행
```JavaScript
app.use(function(req, res, next){
    console.log('Hello');

    //다음 미들웨어가 동작하도록 호출
    //실행 조건에 맞지 않는 미들웨어는 실행되지 않는다.
    next();  
});
```

* 미들웨어 연속
```JavaScript
//콘솔에 로그를 남기는 미들웨어 - 다음 미들웨어 실행
app.use(function(req, res, next){
    var now = new Date();
    console.log(now.toDateString() + ' -url: ' + req.url);

    next();  //다음 미들웨어 호출
});

//응답을 하는 미들웨어 - 다음 미들웨어 실행X
app.use(function(req, res){
    res.send('Hello');
});
```

* 미들웨어 스택 - 하나의 요청에 다수의 미들웨어
```JavaScript
//두 미들웨어를 스택 형태로 설정
app.use(logger, sayHello);

function logger(req, res, next){
    //Todo: 로그 남기기
    next();  //next()를 호출 해야 다음 미들웨어 실행
}

//다음 실행될 미드루에어가 없으면 next()를 사용하지 않아도 된다.
function sayHello(req, res){
    //Todo: 응답하기
}
```

### `Express`앱의 요청 다루기
  * 하나의 미들웨어에서 요청 분석 응답 마무리
  * 여러 미들웨어를 거쳐서 요청과 응답 마무리

### 사용 설정(mount)
  * `app.use([미들웨어])`
    * 모든 종류의 요청에 동작
    * 특정 요청에만 동작하려면, **경로**, **HTTP 메소드**를 이용해 라우팅 로직 작성
  * `app.use([path ,] function [, function...])`
    * path - 경로(default, '/')
  ```JavaScript
  app.use(function(req, res){
      res.send('Hello');
  });

  // HTTP 메소드 별 미들웨어 설정
  app.get('/movies', showMovieList);
  app.post('/movies', addMovieInfo);
  app.put('/movies/:id', updateMovieInfo);
  ```

### `Express`의 미들웨어
* 애플리케이션 수준의 미들웨어
  * `Express` 애플리케이션에 결합
* 라우터 수준의 미들웨어
  * `라우터`에 결합
* 에러 처리
* 빌트인
  * `Express`와 함께 설치
  * `express.static`
* 써드파티
  * 별도 설치 필요
  * `cookie-parser`
    * 쿠키 분석
  * `body-parser`
    * 바디 분석

### 미들웨어 동작 순서
* 보통
  * 파비콘 처리 미들웨어
  * 로깅
  * 정적 파일
  * 서비스 미들웨어

## 정적 리소스 요청 처리 미들웨어
* `express.static`

### 생성
* `express.static(root [, options])`
* 옵션
  * etag - etag 사용여부(default, true)
  * lastModified - Last-Modified 헤더 사용(default, true)
  * maxAge - max-age 메시지 헤더(default, 0)
  * index - 경로 요청시 기본 제공 파일(default, index.html)

### 정적 파일 서비스
* 경로 정보 파라미터 필수
  * `app.use(express.static('images'))`
  * 정적 파일 요청
    * SERVER-ADDRESS/images/cat.jpg -> ./images/cat.jpg
* 정적 파일 위치 설정 - 다수 가능
  * 첫번째 미들웨어 서비스 실패 - 다음 미들웨어 진행
```JavaScript
app.use(express.statis('public'));  //public폴더에서 찾는다.
app.use(express.static('files'));  //public에 없으면 files에서 찾는다. 없으면 이후 미들웨어 진행
```
* 가상 경로 설정
  * `app.use('/static', express.static('images'))`
  * 정적 파일 요청
    * SERVER-ADDRESS/static/cat.jpg -> ./images/cat.jpg

---

## Express 라우팅

### 라우팅
* 요청을 요청 처리 미들웨어로 분배
  * 요청에 맞는 미들웨어가 동작하도록
* 라우팅 종류
  * **HTTP Method**
    * path - 요청 경로, callback - 요청 담당 미들웨어
    * `app.all(path, callback[, callback ...])` - 모든 HTTP Method
    * `app.get(path, callback[, callback ...])`
    * `app.post(path, callback[, callback ...])`
    * `app.put(path, callback[, callback ...])`
    * `app.delete(path, callback[, callback ...])`
  * **URL 경로**
  * **URL 경로 + HTTP Method**

  ```JavaScript
  app.get('/', function(req, res){
      res.send('GET request, /');
  });

  app.post('/', function(req, res){});

  app.put('/user/1', function(req, res){});

  app.all('/all', function(req, res){});
  ```

### 동적 파라미터
* `app.get('/user/:item' [, callback])`
  * `/user/1234`, `/user/abc`
* 파라미터값 얻기
  * `req.params.item`
* 다수의 동적 파라미터 사용 가능
```JavaScript
app.get('/user/:id', function(req, res){
    var userId = req.params.id;
    ...
});

app.get('movies/:movieId/:actor', function(req, res){  //2개의 동적 파라미터
    var movieId = req.params/movieId;
    var actor = req.params/actor;
    ...
});
```
* 주의
  * /user/:item
  * /user/sample
  * 라우팅 경로 겹침
    * 앞 순위 미들웨어가 담당
    * 순서 조절 필요
    * /user/sample
    * /user/:item

### 경로에 정규식 사용
* ? - 문자 존재하거나 생략
* + - 1번이상 반복
* * - 임의의 문자
```JavaScript
// /abcd, acd
app.get('/ab?cd', function(req, res){});

// /abcd, abbcd, abbbcd
app.get('/ab+cd', function(req, res){});

// /abcd, abxcd, abRABDOMcd, ab123cd
app.get('/ab*cd', function(req, res){});

// /abe, abcde
app.get('/ab(cd)?e', function(req, res){});
```

### `express`의 `route()`
* 같은 경로에 메소드만 다른 라우팅 작성 가능
```JavaScript
app.route('/book')
    .get(function(req, res){
        //Todo: GET
    })
    .post(function(req, res){
        //Todo: POST
    })
    .put(function(req, res){
        //Todo: PUt
    });
```

### 라우터 수준의 미들웨어
* `express.Router([options])`
* `라우터 객체`를 이용하면, 라우팅 로직 코드만 별도로 분리해서 작성할 수 있다.
```JavaScript
var app = express();
var router = exprss.Router();

router.get('/hello', sayHello);
router.get('/howAreYou/:who', sayThankYou);
```
* 라우팅 로직 별도 분리
```JavaScript
// router.js
var express = require('express');
var router = express.Router();

router.get('/hello', sayHello);
router.get('/howAreYou/:who', sayThankYou);
module.exports = router;
```
* 라우팅 로직 설정
```JavaScript
// app.js
var app = require('express')();
var router = require('./router');
app.use(router);
//app.use(require('./router'));  // 1줄 요약
```

## 에러 처리 미들웨어
* `Express` 에러 처리 방법
  * 미들웨어 내부에서 처리
    * 각각 미들웨어에서 에러 처리
    * 에러 처리 로직이 제각각
    * 에러 처리 코드 중복
  * 에러 처리 미들웨어에게 위임
    * 일관된 에러 처리 가능
* 에러 처리 미들웨어로 에러 전달
  * 에러 처리 미들웨어는 미들웨어 중 후순위
    * app.use(요청 처리 미들웨어1)
    * app.use(요청 처리 미들웨어2)
    * app.use(에러담당 미들웨어)
```JavaScript
app.use(function(req, res, next){
    var error = new Error('에러 메시지');
    error.code = 100;
    return next(error);
});
```

### 환경별 에러 처리
* 에러 정보 출력
  * 개발 중 - 에러 발생 위치, 경위를 알림, 메일로 전달
  * 운영 중 - 사용자에게 친숙한 에러 메시지 전달
* 개발 환경 설정
```sh
//Window
$ set NODE_ENV=product
$ node myapp.js

// LINUX
$ NODE_ENV=product node myapp.js
$ NODE_ENV=development node myapp.js
```
* 환경 설정 읽기
  * `app.get('env')`
* 환경별 에러 처리 코드
```JavaScript
if(app.get('env') === 'development'){
    app.use(function(err, req, res, next){
        res.end(err.stack);
    });
}else{
    app.use(function(err, req, res, next){
        res.status(err.code || 500);
        res.end('잠시 후 다시 시도해주세요.');
    });
}
```

## Express 써드 파티 미들웨어

### 파비콘 미들웨어
* [serve-favicon](https://github.com/expressjs/serve-favicon)
* 설치
  * `npm install serve-favicon`
* 생성
  * `favicon(path, options)`
  * path - favicon경로
* 미들웨어 중 앞 순위로 설정
* 사용
```JavaScript
var express = require('express');
var favicon = require('serve-favicon');

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
```

### 로그 남기기
* 로그
  * 개발용, 버그 분석
  * 사용자 행위 기록
  * 운영 기록
* 로그 기록 매체
  * 콘솔에 출력
  * 파일, DB에 기록
  * email, sms 등

#### 로그 남기기 - Console
* `console.info('info message')`
* `console.log('log message')`
* `console.warn('warn message')`
* `console.error('error message')`

#### 로그 미들웨어 - [morgan](https://github.com/expressjs/morgan)
* 간단한 설정
* 요청과 응답을 자동으로 로그 남기기
  * GET / 200 0.232 ms - 11
  * GET / 400 0.943 ms - 7
* 설치
  * `npm install morgan`
* 설정
  * `morgan(format, options)`
* 로그 포맷
  * combined
  * common - addr, user, method, url, status, res
  * dev - method, url, status, response-time, res
  * short, tiny
* 사용
```JavaScript
var morgan = require('morgan');
app.use(morgan('dev'));
```
* 미들웨어 중 앞 순위로 설정
  * 파비콘 미들웨어 이후

#### 로그 미들웨어 - [winston](https://github.com/winstonjs/winston)
* 파일로 남기기, DB에 저장
  * `express`의 미들웨어로 동작하지 않음
* email, sms, 알림 서비스 사용
* 서비스 운영 시 콘솔을 항상 볼 수 없다.
* 설치
  * `npm install winston`

##### 기본 로그 기능
* 모듈 로딩
  * `var winston = require('winston')`
* 로그 함수
  * `log(level, MESSAGE)`
  * `info(MESSAGE)`
  * `warn(MESSAGE)`
  * `error(MESSAGE)`
```JavaScript
var winston = require('winston');

winston.info('info message');
winston.warn('warning message');
winston.error('error message');

//log와 레벨 지정
winston.log('info', 'info message');
winston.log('warn', 'warn message');
```

#### 로그 기록 매체 - Transport
* 기본 제공 Transport(Core Transports)
  * console
  * file
  * http
* Transport 추가/삭제
```JavaScript
winston.add(winston.transports.File, {filename: 'service.log'});
winston.remove(winston.transports.Console);
```
* 파일로 기록하기
```JavaScript
winston.add(winston.transports.File, {filename: 'service.log'});

winston.info('info message', data);
winston.error('error message');
```
* Transport를 사용하는 로거 생성
```JavaScript
var logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
        //하나의 logger가 다수의 File Transport를 설정할 수 있고 name으로 구분
        new winston.transports.File({
            name: 'error-logger',  
            filename: 'service-error.log',
            level: 'error'
        })
    ]
});
logger.error('error message');
logger.info('info message');
```

* 별도 설치 transports
  * DailyRotateFile
  * CouchDB, Redis, MongoDB
  * Mail transport
  * Notification Service(Amazon sns)
* 검색
  * `npm search winston`

##### 날짜별로 로그 파일 남기기 - [DailyRotateFile](https://github.com/winstonjs/winston-daily-rotate-file)
* 설치
  * `npm install winston-daily-rotate-file`
* 사용
  * `winston.add(require('winston-daily-rotate-file'), options)`
```JavaScript
var winston = require('winston');

winston.add(require('winston-daily-rotate-file'), {datePattern: 'yyyyMMdd', filename: 'service.log.'});

winston.info('info message');
winston.error('error message');
```

### 바디 파서 - [body-parser](https://github.com/expressjs/body-parser)
* 메시지 바디 분석 미들웨어
* 설치
  * `npm install body-parser`
* 바디 메시지 인코딩 타입
  * json
  * raw
  * text
  * urlencoded
* 멀티파트 지원 안됨
  * formidable, multer 등 써드파티 미들웨어 사용

#### JSON 바디 파서
* `bodyParser.json(options)`
  * inflate - 압축된 메시지 바디 다루기(default, true)
  * limit - 바디 메시지 크기(default, 100kb)
  * strict - JSON의 루트 항목이 배열이나 객체만 접수(default, true)
* 사용
  * `app.use(bodyParser.json())`

#### urlencoded 바디 파서
* `bodyParser.urlencoded(options)`
  * extended - true먄 기본 모듈 querystring로 파싱
  * parameterLimit - 메시지 바디 내 파라미터 개수 제한(default, 1000)
  * inflate, limit - JSON 바디파서 옵션과 동일
* 사용
  * `app.use(bodyParser.urlencoded({ extended: false}))`

#### 바디 파서의 결과
* 파싱 결과 - `req.body`
* JSON, urlencoded 모두 적용
* `req.body`를 사용하는 미들웨어보다 먼저 동작하도록 설정

### 메소드 오버라이드
* HTML 폼에서 GET/POST외 다른 메소드 사용가능
* 폼의 method(GET/POST) 메소드를 다른 메소드로 덮어쓰기
* 쿼리 문자열로 덮어쓸 메소드 전달
  * POST/?resource_method=DELETE
* 설치
  * `npm install method-override`
* 설정
  * `app.use(methodOverride('_method'))`

## Express 템플릿 엔진

### Express 템플릿

### 템플릿 엔진 EJS

### 템플릿 엔진 Jade



















---
