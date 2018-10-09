# Ch4. Real time

## 실시간 서비스
* 사용자가 선택한 공연 정보 전달
* 예약 가능한 공연 날짜와 좌석 정보
* 실시간으로 예약 가능한 시간과 좌석정보 반영
* 다른 사용자가 예약 -> 예약 좌성 상황 반영
* 실시간으로 가능한 자리 선택 후 예약

### HTTP 통신
* 요청과 응답 기반
* 다시 요청할 때까지 변경사항 반영 안됨
* HTTP로 실시간 서비스 작성이 힘들다.
  * 공연 정보와 좌석 정보 요청 - 응답
  * 자리 선택 후 예약 요청
  * 다른 사용자의 선 예약으로 인한 예약 불가 응답
  * 다른 자리 선택 후 예약 요청....
* HTTP가 아는 다른 프로토콜 사용
  * TCP

### TCP 통신
* 네트워크 레이어 - Transport Layer
* 스트림을 이용한 실시간 통신
* 소켓을 이용한 네트워크 프로그래밍

### 실시간 서비스 구현
* 소켓(Socket)
* 통신 접점(entry point)
* 소켓 프로그래밍
  * 데이터 그램 소켓 - UDP
  * 스트림 소켓 - TCP

|   | TCP | UDP |
| :---: | :---: | :---: |
| 연결 | 필요 | 불필요 |
| 신뢰성 | O(손실된 데이터 재전송) | X |
| 데이터 흐름 | 혼잡도 제어 | X |
| 속도 | UDP에 비해 느림 | 빠르다 |
| 적용 분야 | 실뢰성 있는 실시간 통신 | 속도 중시형 실시간 통신. 스트리밍 비디오/오디오 |
| 적용 분야 | FTP, HTTP, SMTP  | DNS, DHCP, SNMP |

### TCP
* 연결 지향이므로 연결 과정 필요
* 연결 과정
  1. 서버 소켓 생성, 준비, 대기
  2. 클라이언트 소켓 연결, 소켓간 연결
  3. 데이터 교환
  4. 접속 끊기
* 스트림 기반
  * 보내기 - 스트림에 write
  * 받기 - 스트림에 read

** 그림 넣기 **

### UDP(User Datagram Protocol)
* 비 연결 지향. 연결과정 X
* 신뢰성 X. 데이터 손실 가능. 패킷 확인, 재전송 없음
* 간단한 패킷(데이터 그램)구조. 빠른 전송
* 잘못 전송된 내용을 복구할 필요가 없는 실시간 통신(ex. 스트리밍 오디오/비디오 등)

---

## TCP 실시간 통신 서비스
* net 모듈
  * 소켓 통신을 위한 기본 모듈
  * `var net = require('net')`
  * 클래스
    * net.Server - 소켓 서버
    * net.Socket - 소켓

### TCP 서버
* 서버 생성 및 함수
```JavaScript
var net = require('net');
var server = net.createServer([options] [, connectionListener]);  //서버 생성

server.listen(port [, host][, backlog][, callback]);  //포트에 바인딩하고 클라이언트 접속 대기
server.close([callback]);  //추가 접속을 받지 않는다.
server.getConnections(callback);  //연결 갯수
server.address();  //서버 주소
```
* 이벤트
  * listening - 포트 바인딩, 접속 가능한 상태
  * **connection** - 클라이언트 접속. 리스너는 `createServer()`의 파라미터로 입력 가능
  * close - 서버 닫기(연결된 소켓이 없을 때만 발생)
  * error - 에러

### 소켓 생성과 연결
* 서버 코드
```JavaScript
var server = net.createServer(function(socket){  //connection 리스너. socket - 클라이언트와 연결된 소켓 객체
    console.log('Connect Event', socket.remoteAddress);
});

server.on('listening', function(){
    console.log('Server is listening @', server.address());
});

server.on('close', function(){
    console.log('Server Close');
});
```

* 클라이언트 코드
```JavaScript
var socket = new net.Socket();
var option = {
    host = '127.0.0.1',
    port = 3000
};

socket.connect(option, function(){

});
```

> 소켓은 Duplex Stream
> 읽고 쓰기가 모두 가능!

### 원격 호스트사이의 데이터 교환
* net.Socket 이벤트
  * connect - 원격 소켓 연결
  * data - 읽을 수 있는 데이터 도착
  * end - 원격 호스트의 소켓종료(FIN)
  * timeout - 제한 시간 지남
  * error - 에러
* net.Socket 함수, 프로퍼티
  * `connect(options[, connectListener])` - 연결
  * `write(data[, encoding][, callback])` - 데이터 쓰기
  * `end([data][, encoding])` - 연결 종료 신호(FIN) 보내기
  * `setKeepAlive([enable][, initialDelay])` - 연결 유지
  * `remoteAddress`, `remotePort` - 원격 호스트 주소와 포트
* 데이터 쓰기
```JavaScript
socket.write('Hello');
```
* 일기
```JavaScript
socket.on('data', function(chunk){
    //데이터 도착
});
socket.on('end', function(){
    //원격 호스트의 종료
});
```

#### Example
* 소켓 서버
```JavaScript
var net = require('net');
var server = net.createServer(function(socket){
    socket.write('Welcome to Socket Server\n');

    //클라이언트의 데이터 전송 이벤트
    socket.on('data', function(data){
        var textMsg = data.toString();
        console.log('Client send: ', textMsg);
    });

    //접속 종료 이벤트
    socket.on('end', function(){
        //클라이언트와 접속 종료
    });
});

server.listen(3000);
```

* 소켓 클라이언트
```JavaScript
var net = require('net');
var socket = new net.Socket();
var option = {
    port: 3000,
    host = '127.0.0.1'
}
socket.connect(option, function(){
    socket.on('data', function(data){
        var str = data.toString();
        console.log('>> ', str);
    });

    socket.on('end',function(){});

    //서버에 데이터 전송
    socket.write('Hello Socket Server!');
    socket.write('bye bye');

    //연결 종료
    socket.end();
});
```

### TCP 채팅 서비스
* 채팅 서비스 준비와 연결
  * 서버 소켓 준비
  * 클라이언트 소켓 연결
  * 소켓을 이용한 데이터 교환
* 채팅 서비스 만들기
  * 1:N 데이터 전달
  * 채팅 관련 명령어 - 닉네임 변경, 1:1 대화, 채팅방 나가기 등등
  * 소켓을 이용한 서비스 - 데이터 전달 + 제어 명령어 전달
* 클라이언트 접속 이벤트 - 소켓 배열 저장
```JavaScript
var clientList = [];
var server = net.createServer(function(socket){
    //클라이언트와 접속한 소켓을 채팅 클라이언트 목록에 추가
    var nickname = 'Guest' + Math.floor(Math.random()*100);
    clientList.push({nickname: nickname, socket: socket});
});
```
* 데이터 도착 이벤트 - 모든 소켓에 쓰기
```JavaScript
socket.on('data', function(data){
    var message = data.toString('UTF-8');
    clientList.forEach(function(client){
        var socket = client.socket;
        socket.write(message);
    });
});
```
* 소켓으로 전송되는 데이터
  * 제어 코드
  * 컨텐츠
* 소켓으로 전송되는 제어코드
  * `data`이벤트에서 주고 받는 데이터를 분석해 채팅 메시지인지 제어 메시지인지 판단 필요
```JavaScript
if(messgae == '\\close'){
    //클라이언트 접속 종료
    socket.end();
}else if(messgae.indexOf('\\rename') != -1){
    //닉네임 변경
}
```

---

### UDP 실시간 서비스
* udp 모듈 - Datagram(dgram)
  * `var dgram = require('dgram')`
* 클래스
  * dgram.Socket
* 소켓 생성
  * type - udp4, udp6
  * dgram.createSocket(type[, callback])
* 함수
```JavaScript
socket.bind([port][, address][, callback]);  //특정 포트와 바인딩
socket.send(buf, offset, length, port, address, [, callback]);  //데이터 전송
socket.close([callback]);  //닫기
//멀티캐스트는 그룹에 가입된 여러 소켓에 패킷을 보낸다.
socket.addMembership(multicastAddress[, multicastInterface]);  //멀티캐스트 그룹 가입
socket.dropMembership(multicastAddress[, multicastInterface]);  //멀티캐스트 그룹 탈퇴
```
* 이벤트
  * listening - 데이터 도착 감시(바인드 이후 발생)
  * message - 데이터 도착
  * close - 소켓 연결 종료
  * error - 에러 발생
* TCP와 다른점
  * 서버, 클라이언트 소켓 구분 없다.
  * 연결 과정 X
  * 스트림 방식이 아니다.
```JavaScript
var socket = dgram.createSocket('udp4');  //소켓 생성

//메시지 받기
socket.bind(3000);
socket.on('message', function(data, rinfo){
    console.log(rinfo.address + '>> ', data.toString('utf8'));
});

//메시지 전송
var message = new Buffer('hello');
socket.send(messgae, 0, message.length, PORT, ADDRESS, CALLBACK);
```

#### 멀티캐스트
* 그룹에 포함된 여러 호스트에 메시지 보내기
* 그룹에 가입 -> `socket.addMembership()`
* IP 대역
  * D클래스 대역 - `224.0.0.0 ~ 239.255.255.255`
* 멀티 캐스트 보내기
```JavaScript
var socket = dgram.createSocket('udp4');

//멀티캐스트 주소로 메시지 보내기
socket.send(msg, 0, msg.length, 3000, '224.0.0.114', function(err){
    if(err){
        console.error('UDP Message send error: ', err);
        return;
    }
    console.log('UDP Message Send Success');
});
```

* 멀티 캐스트 받기
```JavaScript
var socket = dgram.createSocket('udp4');
socket.bind(3000);

socket.on('listening', function(){
    //멀티캐스트 주소로 가입
    socket.addMembership('224.0.0.114');
});

//메시지 이벤트
socket.on('message', function(msg, rinfo){
    console.log(rinfo.address, '>> ', msg.toString());
});
```

## socket.io를 이용한 실시간 웹서비스

### [socket.io](http://socket.io/)
* 호환되는 기술 자동 선택
  * 다양한 실시간 서비스를 위한 기술 중 서버/클라이언트 사이에서 사용가능한 기술을 자동 선택해서 사용
  * 하나의 방법으로 모든 브라우저를 지원하는 것과 같은 효과
* 설치
  * `npm install socket.io`

#### HTTP 방식의 한계
* socket
  * 데스크탑 Application
  * 모바일 Application
  * ~~웹 브라우저~~
    * 웹 브라우저에서는 소켓 사용 불가능
* 실시간 웹 서비스를 위한 다양한 기술 시도
  * ajax, polling, long polling
  * web socket
  * 문제는 다양한 웹 브라우저 - 모든 브라우저에서 동작하도록 하려면 2~3가지 기술을 사용해야 하는 어려움

#### socket.io 서버와 클라이언트
* socket.io는 HTTP 서버와 함께 동작
* 서버
  * HTTP 서버
  * socket.io 서버
* 클라이언트(웹 브라우저)
  * HTTP 클라이언트
  * socket.io 클라이언트

#### socket,io 서비스
* 서비스 시작
  * HTTP 서버 준비
  * socket.io 서버 준비
  * socket.io 클라이언트 요청 - HTML로 응답
  * socket.io 클라이언트 초기화 및 서버 접속

*** 그림 삽입 ppt755 ***

#### 실시간 서비스를 위한 서버 준비
* 두 서버 준비
  * 웹 서버 -> http, express
  * socket.io 서버
    * http 서버와 연결
* 연결 이벤트
  * `connection`

* HTTP 서버와 socket.io 서버 준비
```JavaScript
//http 서버
var http = require('http');
var httpServer = http.createServer(function(req, res){
    res.end('socket.io Sample');
});
httpServer.listen(3000);

//socket.io 서버
//var Server = require('socket.io');
//var io = new Server(httpServer);

var io = require('socket.io')(httpServer);  //축약
```

* Express와 socket.io 서버 준비
```JavaScript
var express = require('express');
var http = require('http');

var app = express();
var httpServer = http.Server(app);  //request 이벤트 핸들러로 express객체 입력
httpServer.listen(8080);

var io = require('socket.io')(httpServer);
```

#### socket.io 클라이언트
* socket.io 클라이언트 준비
  * HTTP 서버에게 socket.io 초기화 HTML 요청
  * HTML 로딩 - 스크립트 로딩
  * socket.io 클라이언트 초기화
  * socket.io 서버 연결
* 서버의 socket.io 클라이언트 html 응답
```JavaScript
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
});
```
* 스크립트 로딩
  * 서버 모듈 로딩 or CDN
  * <script src="/socket.io/socket.io.js"></script>
  * <script src="https://cdn.socket.io/socket.io-1.3.7.js"></script>
* 클라이언트 소켓 클래스
  * io(url:String, opts:Object):Socket
* 소켓 생성, 연결
  * `var socket = io();`
* socket.io 클라이언트 이벤트
  * `connect` - 서버와 연결
  * `error` - 연결 에러
  * `disconnect` - 연결 끊김
  * `reconnetc`, `reconnecting`, `reconnect_error, ...` - 재접속
  * 서버와 연결 끊어지면 자동 재접속 시도

#### Example
* 서버
```JavaScript
var io = require('socket.io')(server);
io.on('connection', function(socket){
    console.log('클라이언트 접속');
});
```
* 클라이언트
```JavaScript
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();  //소켓을 생성하면 자동으로 서버에 접속 시도

  //서버와 성공적으로 연결되면 connect 이벤트 발생
  socket.on('connect', function(arg){
      console.log('server connect');
  });
</script>
```

---

### 데이터 교환
* 메시지 주고 받기 - 이벤트 기반
  * 메시지 이벤트 정의
* 메시지 전송
  * 이벤트 발생 - `socket.emit()`
  * `socket.emit('EVENT', data)`
* 메시지 수신
  * 이벤트 리스너 등록 - `socket.on()`
  * `socket.on('EVENT', function(data){})`

#### 이벤트를 이용해서 데이터 주고 받기
* 서버에 이벤트 등록 - 클라이언트에서 이벤트 발생
* 클라이언트 이벤트 등록 - 서버에서 이벤트 발생
* 서버에서의 이벤트 발생
  * 소켓 하나에 이벤트 발생
    * `socket.emit('Direct Event', [데이터])`
  * 연결된 모든 소켓에 이벤트 발생
    * `socket.io.emit('Broadcast Event', [데이터])`  //io.emit()로도 가능

```JavaScript
socket.emit('hello', {message:'Welcome'});
socket.on('howAreYou', function(data){
    var msg = data['message'];
});
```
```JavaScript
socket.on('hello', function(data){
    var msg = data['message'];
});
socket.emit('howAreYou', {message: 'Welcome'})
```

---

### 네임스페이스와 룸
* socket.io 기본 연결
  * 소켓과 1:1 - `socket.emit()`
  * 모든 소켓과 통신 - `socket.io.emit()`
* 1:N 통신
  * 개별 소켓과 1:1 통신 N번 반복
  * 네임 스페이스
  * 룸

#### 네임스페이스
* 같은 네임스페이스에서만 메시지를 주고 받음
* 기본 네임스페이스 - `/`
  * 서버
    * `var io = require('socket.io')(server)`
  * 클라이언트
    * `var socket = io()`
* 커스텀 네임스페이스 - `/NAME-SPACE`
  * 서버
    * `var nsp = io.of('/Custom-Namespace')`
  * 클라이언트
    * `var nsp = io('/Custom-Namespace')`

#### Example
* 서버
```JavaScript
//기본 네임 스페이스
var io = require('socket.io')(server);

//네임 스페이스
var system = io.of('system');
system.on('connection', function(socket){
    console.log('System namespace');
});
system.emit('message', 'Notice!');
```
* 클라이언트
```JavaScript
//기본 네임 스페이스
var socket = io();

//커스텀 네임 스페이스를 이용한 연결
var sysNsp = io('http:/myserver.com/system');  //서버 주소까지 입력
sysNsp.on('connect', function(){
    console.log('System namespace connect');
});
sysNsp.on('message', function(data){
    alert('System message: ' + data);
});
```

#### 룸(room)
* 네임스페이스 내 체널
* 같은 룸에서만 데이터 교환
* 룸에 입장(join), 여러 룸에 입장 가능
* 룸에서 떠나기(leave)
* 룸 접속/떠나기
  * `Socket#join(name:String[, fn:Function]):Socket` - 특정 룸에 입장
  * `Socket#leave(name:String[, fn:Function]):Socket` - 룸에서 떠나기
  * 서버에서 동작
    * 클라이언트에서 호출할 수 없기 때문에 이벤트를 발생시켜 서버에서 호출
* 룸 이벤트
  * `Socket#to(room:String):Socket` - 특정 룸에만 이벤트 발생

#### Example
* 서버
```JavaScript
var room;

//채팅창 입장
socket.on('joinRoom', function(data){
    //기존 방에서 나오기
    socket.leave(room);

    //새로운 채팅방 입장
     room = data.room;
     socket.join(room);
});

//채팅 메시지. 룸으로(to) 전송
socket.on('chatInput', function(data){
    io.to(room).emit('chatMessage', chat);  //특정 룸에 이벤트 발생
});
```

* 클라이언트
```JavaScript
//룸에 입장, 이벤트 발생
socket.emit('joinRoom', {room: room});

//채팅 메시지 수신
socket.on('chatMessage', function(data){
    var msg = data['msg'];
    var nick = data['nick'];
    var str = nick + ':' + msg;

    //채팅 메시지
    $('#message').append($('<li>').text(str));
});
``

---
