# Ch6. Security

## 보안
* 사용자 가입과 로그인
  * 가입 - 사용자 정보를 저장
  * 로그인 - 사용자 정보를 전송
* 비밀번호 저장
  * 비밀번호 암호화 저장
  * 복호화 필요하지 않다. - 암호화된 비밀번호끼리 비교
* 네트워크 데이터 전송
  * 데이터 암호화 - 전달
  * 전달받은 암호화 데이터 복호화

### 암호화 종류
* 복호화 불가능
* 복호화 가능
> * 암호화(encryption)
>   * 원본 데이터를 변조해서 알 수 없도록 변환
> * 복호화(decryption)
>   * 암호화된 데이터에서 원본 데이터(평문) 얻기

### 사용자 비밀번호 암호화 저장
* 복호화 불필요
* 해시(Hash)

### 사용자 개인 정보 전송
* 복호화 필요
* 대칭/비대칭 키 암호화
* HTTPS

---

## 해시
* 단방향으로 생성하는 값, 함수
  * 복호화 불가능
* 특징
  * 고정 크기의 해시값
  * 입력값이 같으면 해시값도 같다.
  * 해시값이 같아도 입력값(평문)이 같다는 보장이 없다.
* MD5(128bit), SHA1(160bit), SHA2(256, 512, ...)

---

## 사용자 인증 정보 암호화

### Example
* 전송 데이터 에러 검사 - checksum
  * 다운로드한 파일의 해시값을 이용해 변조 파악
* 비밀번호 저장
  * 비밀번호의 해시값 저장
```JavaScript
var password = req.body.password;
var user = User.findOne(username);
if(hash(password) == user.pw){
    //인증 성공
}
```

### 해시 암호 공격
* 사전, 자주 사용하는 암호 기반의 해시 테이블(레인보우 테이블) 준비
* 사용자의 해시암호와 비교
* 무차별 입력(brute force), 룩업 등
* 사용자의 암호에 `소금(salt)` 치기
  * `hash(사용자 암호 + 임의의 문자)`
    * `hash('charlie' + 'i')`
  * 레인보우 테이블 사용불가
* `salt` 사용시 주의
  * 사용자마다 다른 `salt` 사용
  * `salt`는 충분히 길게
    * 짧은 `salt` -> 레인보우 테이블 준비 가능
    * 예측 가능한 `salt` 사용하지 말 것

| ID | SALT | PW |
| :---: | :---: | :---: |
| user1 | sdfdf23 | dfjlsdjfsdufh234ji3jifdsf |
| user2 | j34li5l | fgfdgdfgfdgdfgsd5656jsd7s |

### 사용자 인증
* (사용자 입력 값 + SALT)의 해시 == DB에 저장된 해시
```JavaScript
var password = req.body.password;
var user = user.findOne(username);
if(hash(password + user.salt) == user.pw){
    //인증 성공
}
```

### 해시 모듈
* crypto - 기본
* bcrypto - 확장
  * `npm install bcrypto`

### crypto 모듈
* Hash 기능
  * `crypto.getHashes()`
  * `crypto.createHash(algorithm)`
* Hash 알고리즘
  * md5, sha1, sha256, sha512
* Hash 객체는 readable/writable stream
* Hash 함수
  * `hash.update(data[, input_encoding])` - 값 입력
  * `hash.digest([encoding])` - 값 얻기

```JavaScript
var sha1 = crypto.createHash('sha1');  //sha1 알고리즘을 이용한 해시 생성
sha1.update('hello');  //해시할 값 입력
var digest = sha1.digest('hex');  //해시값을 hex 인코딩으로 얻어오기  
```

### 사용자 암호 저장
* crypto모듈의 Hash와 Salt
```JavaScript
function signup(id, pw, name){
    var sha1 = crypto.createHash('sha1');

    //Salting
    var salt = crypto.randomBytes(5).toString('hex');
    sha1.update(pw + salt);
    var hashedPw = sha1.digest('hex');
    //Todo: hashedPw DB에 저장
}
```

### 로그인 함수
* 사용자 입력 암호와 저장된 값 비교
```JavaScript
function login(id, pw) {
    var sha1 = crypto.createHash('sha1');
    var salt = user.salt;  //DB에 저장된 salt값 얻기
    sha1.update(pw + salt);
    var digest = sha1.digest('hex');

    //Salting한 암호와 사용자 암호 비교
    if(user.pw == digest){
        //로그인 성공
    }    
}
```

---

## 암호화
* 암호화 종류
  * 대칭 암호(symmetric cryptography)
  * 비대칭 암호(Asymmetric cryptography)

### 대칭 암호(symmetric cryptography)
* 같은 key로 암/복호화
* 키를 분배해야 한다.
  * 노출 가능성 있다.
* 알고리즘
  * DES(Data Encryption Standard)
    * 56bit
    * AES로 대체
  * AES(Advanced Encryption Standard)
    * Rijndael 알고리즘
* 암호화 클래스 - Cipher
  * `crypto.createCipher(알고리즘, 키)`
  * `crypto.update()` - 암호화할 값 입력
  * `crypto.final()` - 암호화된 값 얻기
```JavaScript
//AES128
var key = 'Secret Key';
var cipher = crypto.createCipher('aes128', key);  //암호화 객체

//메시지 암호화
var message = 'hello world';
var encrypted = cipher.update(message, 'utf8', 'hex');
encrypted += cipher.final('hex');
```
* 복호화 클래스 - Decipher
  * `crypto.createDecipher()`
  * `decipher.update()`
  * `decipher.final()`
```JavaScript
var decipher = crypto.createDecipher('aes128', key);  //복호화 객체

//암호 메시지 복호화
var decrypted = decipher.update(msg, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

### 비대칭 암호(Asymmetric cryptography)
* 서로 다른 key(개인키, 공개키)로 암/복호화
  * 개인키(private key) - 공개 안함
* 개인키로 암호화 -> 공개키로 복호화
* 공개키로 암호화 -> 개인키로 복호화
  * 암호화된 데이터가 노출되더라도 개인키가 없으면 복호화 불가능
* 대칭 암호에 비해서 느리다.

---

## 보안 서버 만들기
* HTTPS(HTTP over SSL)
  * 데이터 암호화 통신
* SSL
  * 넷스케이프 SSL -> IETF의 TLS
  * 대칭키 방식
* SSL 인증서
  * 서비스를 제공하는 서버의 정보
  * 신뢰성 있는 인증기관(CA)의 서버인증
  * 서버 공개키 - 비대칭 암호화용
* 대칭, 비대칭 모두 사용
  * 비대칭 - 대칭 암호화 키 교환에 사용

### 인증서 발급
* 공인된 인증 기관에서 발급
  * 유료
  * 인증 기관 - Verisign, Comodo
* 사설 인증서 발급
  * 키와 인증서 생성 프로그램 - openssl
  * http://www.openssl.org
  * 경고 발생

### 사설 인증서로 보안 서버 만들기
* 필요한 것
  * 키
  * 인증서
* 단계
  1. 개인키 생성
    * `openssl genrsa -out key.pem 2048`
  2. 키에서 인증서 발급 요청(csr) 생성
    * `openssl req -new -key key.pem -out req.csr`
  3. 인증서 발급 요청에서 인증서 발급 승인
    * `openssl x509 -req -in req.csr -signkey key.pem -out cert.pem -days 365`
    * 유효기간 365일로한 x509포맷의 인증서 발급
* https 모듈 사용
* 보안서버 생성
  * `https.createServer(option, [REQUEST LISTENER])`
  * 옵션
    * key
    * cert
    * passphrase - 개인키 암호

#### https 서버
```JavaScript
var options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
https.createServer(options, function(req, res){}).listen(3001);
http.createServer(function(req, res){}).listen(3000);
```

#### express
```JavaScript
var express = require('express');
var app = express();

//HTTP 요청
var server = http.createServer(app);
server.listen(3000);

//HTTPS 요청
var options = { key:..., cert: ...};
var secureServer = https.createServer(options, app);
secureServer.listen(3001);
```

### 보안 서버 의무화
* 영리 목적의 개인정보 수집 서비스
* 무료 인증서 발급
  * https://www.startssl.com
  * https://letsencrypt.org
* 유료 인증서 발급
  * verisign
  * symantec
  * comodo

---
