# Ch1. Node.js

## [npm](https://www.npmjs.com/)
* 노드 패키지 관리자
* node.js 생태계의 확장모듈 검색, 설치, 업데이트등을 쉽게 할 수 있다.
* 모듈 설치, 삭제(확장 모듈)
* 모듈 검색
* 모듈 정보
* 패키지 정보 작성

### npm 주요 옵션
| 옵션 | 설명 |
| :---: | :---: |
| init | 패키지 준비, package.json 생성 |
| install | 패키지에 필요한 모듈 설치 |
| install [package name] | 개별 패키지 설치 |
| list | 설치된 모듈 목록 보기 |
| info [module name] | 모듈 정보 |
| search [module name] | 모듈 검색 |
| update [module name] | 모듈 업데이트|
| uninstall [module name] | 모듈 삭제 |

### npm init
package.json 생성
```sh
$ npm init
```

### npm install
* 현재 디렉토리의 `package.json` 파일에 열거된 모든 모듈을 `local node_modules` 디렉토리에 설치
* 올바른 환경 제공, 의존성 문제 해결로 빠르게 빌드하고 구동할 수 있게 해준다.

#### npm install `<module name>` --save
* 모듈 설치 및 package.json dependencies에 추가
```sh
$ npm install express --save
```

#### npm install `<module name>` `@Version`
* 해당 모듈의 가장 최신 버전을 `local node_modules` 디렉토리에 설치
* 버전 명시시 특정 버전 설치
```sh
$ npm install colors
```

#### npm install `<module name>` --global(-g)
* 전역 설치
```sh
//express App Server(파일 구조와 보일러플레이트 코드)를 생성해주는 모듈
$ npm install express-generator --global(-g)
```

### npm search　`<module name>`
* 터미널에서 npm 레지스트리를 질의하는 빠른 방법 제공
```sh
//'markdown'이라는 문구를 포함한 사용가능한 노드 모듈 출력
$ npm search markdown
```

### npm docs `<module name>`
* 패키지 세부사항 검색(인기도, 의존성 목록 등)

> 전역 모듈과 지역 모듈 중
> * 지역 모듈 권장
>   * 개발에 필수 라이브러리
>   * 특정 버전 모듈에 의존적인 상황
> * 유틸성은 전역 설치 권장
>   * 테스트용, Node.js 애플리케이션 실행 유틸
>   * mocha, nodemon, express-generator 등

---

## 패키지 정보
* 패키지 설정 파일
  * package.json
  * npm init으로 생성
  * 패키지에 대한 정보 입력

### package.json
```json
{
  "name": "test",  //모듈 이름(node, js가 들어가면 안됨, url로 사용가능한 문자만)
  "version": "1.0.0",
  "description": "test",
  "main": "index.js",
  "scripts": {  //npm run test 실행시 아래문구 출력(노드명령, 쉘스크립트 사용)
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {  //의존성 모듈(>=, ~, ^를 조합해 버전 명시)
    "express": "^4.14.0"
  }
}
```

---

## 모듈 만들기
* 소스 코드 분리
  * 모듈
* 모듈 작성 방법
  * `module.exports`
* 모듈 사용하기
  * 모듈 로딩 - `require()`

### require()
* 제공된 인자에 맞는 JavaScript를 실행
* 인자로 모듈이름을 넣으면 모듈이 제공하는 함수와 값이 담긴 객체 반환
* DB초기화, 로그 싱글톤 생성, 내장 타입과 객체변경과 같은 **한번만 동작하는** 코드를 위해 사용
```JavaScript
//파일 경로 명시
var customModule = require('./dong/custom-module');
```

### 모듈 탐색 절차
1. 명시된 모듈이 핵심 모듈인지 확인
2. 현재 디렉토리의 node_modules 디렉토리 검사
3. 디렉토리를 하나 거슬러 올라가 node_modules 디렉토리가 있다면 그안을 살핀다.
4. 최상위 디렉토리에 도달할 떄까지 반복
5. 전역 디렉토리 검사
6. 모듈을 찾을 수 없으므로 오류를 던진다.

### 모듈 작성
노드에서 exports(), require(), module()를 자주보는데 구현코드는 찾을 수 없다.
노드가 수행하는 모든 JavaScript코드는 다음과 같은 형태로 감싸진다.
```JavaScript
(function(exports, require, module, __filename, __dirname){
    //작성한 코드가 이안에 들어간다.
});
```
* 변수가 우연히 전역으로 선언되지 못하게 막아준다.

#### mmm.js 모듈 작성
```JavaScript
// mmm.js
exports.add = add;  //외부에 공개 선언
exports.now = Date.now();

function add(num1, num2){  //공개　O
    return parseInt(num1, 10) + parseInt(num2, 10);
}

function factorial(num){  //공개 X
    if(num == 0){
        return 1;
    }else{
        return num * factorial(num - 1);
    }
}
```

#### mmm.js 모듈 테스트
```JavaScript
var m = require('./mmm');

console.log(m.add(3,5));
```

### 모듈 캐시
* 노드 모듈 시스템은 특정 모듈을 **처음 호출**하면 그 결과를 **캐시**
* 여러번 호출하더라도 항상 **같은 인스턴스 반환**

### npm link
해당 모듈에 전역 심볼릭 링크 설정
1. 사용할 모듈을 새로운 디렉토리에 옮기고 `$npm init`으로 package.json을 생성하고 `$npm link` 실행(새로운 이름 입력)
2. 사용할 디렉토리로 돌아가 `$npm link <module name>`
3. `var m = require('module name');`으로 수정하여 사용한다.

---

## 노드란?

* **Non-blocking**, **Asynchronous** I/O
* 싱글 쓰레드
* Event Driven
* 크롬 V8 엔진 사용
* Event Loop 사용
* 당장 처리하지 못하는 작업을 담아두기 위해 여러개의 Queue를 관리(이벤트, 타이머, 인터벌, 즉시실행 큐 등)
* Event Loop의 각 사이클마다 하나이상의 작업을 큐에서 가져와 수행
* 각 사이클은 **틱** 이라고 알려진 더 작은 단계로 구성

> Callback
>
> 연산이 끝나거나 오류가 발생할 경우 수행되는 함수</br>
> 다른 사용자가 대기 시간으로 불편함을 겪게 만드는 대신, 연산이 시작될 때 콜백 함수를 등록</br>
> I/O가 완료되면 시작시 등록해둔 콜백 함수 수행

### Asynchronous I/O
* 시간이 걸리는 I/O
  * 하드디스크 접근
  * DB 서버
  * 네트워크를 이용해서 다른 서비스 접근
* I/O 동작이 끝날 때까지 대기 - 동기식
  * A실행 - A결과 - B실행 - B결과
  * 실행이 끝나고 다음 실행
  ```JavaScript
  //동기식 함수 구현
  function add(i, j){
      return i + j;
  }
  //동기식 함수 사용
  var result = add(1, 2);
  console.log("Result: ", result);
  ```
* I/O 동작이 끝날 때까지 대기하지 않음 - 비동기식
  * A실행 - B실행 - (B결과) - (A결과)
  * 실행 결과가 끝날때까지 기다리지 않는다.
  ```JavaScript
  //비동기식 함수 구현
  function add(i, j, callback){
      var result = i + j;
      callback(result);
  }
  //비동기식 함수 사용
  add(1, 2, function(result){
      console.log("Result:", result);
  });
  ```

  ---

### 비동기 연산의 결과를 전달하는 방식
* Callback 함수
* Event emitter(이벤트 전송자)
* Async - Flow Control
* Promise - Chain

#### Callback 함수
* 비동기 함수의 인자로 전달되며, 비동기식 연산이 완료되면 연산 결과와 함께 호출되는 함수
* callback 함수를 마지막 인자로 넣는다.

```JavaScript
var fs = require('fs');

fs.readFile('README.md', 'utf-8', function(error, data){
    if(error){
        return console.error(error);
    }

    console.log(data);  //파일 내용
});
```

#### Callback Hell
* callback이 중첩(연속된 호출)되어 가독성이 떨어지는 현상
  * task1 실행 후 task2 실행 - 이미지 업로드 후 DB에 저장
  * task1 실행 결과를 이용해 task2 실행 - 다수의 이미지에서 썸네일 생성 후 업로드
* 익명 callback대신 이름있는 callback을 사용하고, 구조화를 잘하면 피할 수 있다.
```JavaScript
//callback hell
task1(a, b, function(err, result1){
    task2(c, function(err, result2){
        task3(d, e, f, function(err, result3){
            task4(h, i, function(result4){
                //비동기 동작
            });  //task4
        });  //task3
    });  //task2
});  //task1

//callback hell 탈출 -> 이름있는 callback + 구조화
//그러나 별로 도움이 되지않는다. -> 흐름제어 모듈인 async, promise 사용
task1('a', 'b', task1Callback);

function task1Callback(result){
    task2('c', task2Callback);
}

function task2Callback(result){
    //task3 호출
}
```

---

#### Event emitter
* 이벤트를 발행(publish)하는 객체

##### 이벤트 발행
* `emitter.emit(event[, arg1][, arg2][, ...])`
  * event - 이벤트 이름
  * arg - 리스너 함수의 파라미터
  * emit함수 호출 결과 - true(이벤트 처리), false(이벤트 처리 안됨)
  ```JavaScript
  process.emit('exit', 0);  //리스너 함수의 파라미터로 0전달
  ```

##### 커스텀 이벤트
```JavaScript
var events = require('events');
var EventEmitter = events.EventEmitter;
//위 2줄. 아래 1줄로 요약
//var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

emitter.on('count', function(n) {
    console.log('occur custom event', n);
});

emitter.emit('start');  
emitter.emit('count', 1);
```

##### EventEmitter 상속
```JavaScript
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Counter(){
    var self = this;

    EventEmitter.call(this);  //EventEmitter 생성자 호출
    var count = 0;

    this.start = function(){
        this.emit('start');

        setInterval(function(){
            self.emit('count', count);
            ++count;
            }, 1000);
    };
}

util.inherits(Counter, EventEmitter);  //상속 설정
```

##### 이벤트 듣기
* 이벤트가 의미 있으려면 구독자가 최소 하나는 있어야 한다.
* 이벤트 리스너 설정
  * `emitter.on(event, listener)`
  * `emitter.addListener(event, listener)` - on()과 같음
  * `emitter.once(event, listener)` - 일회성 리스너
* 이벤트 리스너 삭세
  * `emitter.removeListener(event, listener)`
* 최대 이벤트 핸들러 개수(기본 10개)
  * `emitter.setMaxListeners(n)` - 최대 등록 가능한 리스너 갯수 설정
  * `emitter.getMAxListeners()` - 최대 등록 가능한 리스너 갯수 확인

```JavaScript
//리스너 설정후 이벤트 발생
var counter = new Counter();  //Counter 이벤트 전송자 인스턴스 생성

counter.on('start', function(){
    console.log('start event');
});

counter.on('count', function(count){
    console.log('count = ' + count);
});

counter.start();

//한번만 동작
counter.once('start', function(){
    console.log('start event');
});

counter.start();
```

##### 예외 처리
* error 이벤트 발생
* 처리되지 않는 error 이벤트는 프로그램의 비정상 종료시킬지 모르므로 각별히 주의
```JavaScript
//처리되지 않는 error 이벤트 발생
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

//error 객체를 잡지 않으면 process 객체가 uncaughtException 이벤트 발생
//process객체 - 현재 동작 중인 프로세스와 상호작용하기 위해 제공하는 전역객체
//uncaughtException - 심각한 문제, 종료하는게 낫다
emitter.emit('error', new Error('our error is bad and we feel bad'));

//on()을 사용한 error 이벤트 처리
emitter.on('error', function(error){
    console.error(error.message);
    process.exit(-1);  //프로그램 종료
});

emitter.emit('error', new Error('our error is bad and we fell bad'));
```

---


### [Async](https://www.npmjs.com/package/async) - Flow Control
* 비동기 동작의 흐름 제어
* 설치
  * `npm install async`
* 대표적인 기능
  * 행위 순서 제어
    * series, seriesEach
    * parallels
    * waterfall
  * 콜렉션(배열, 객체) - 비동기 순회 동작
    * each, eachSeries, eachLimit
    * forEachOf
    * map, filter
    * reject, reduct
    * ...


#### 순차 실행
* `series(tasks, [callback])`
* callback 호출 - 다음 태스크로 진행
  * 완료 콜백으로 동작 결과 전달
  * 태스크 완료 - 다음 태스크 실행
```JavaScript
async.series([
    function task1(callback){  //태스크1, 함수
        //에러 발생
        //callback(err, null);  //다음 태스크 실행X, 마무리 콜백으로 에러 전달

        //태스크 성공
        callback(null, 'result1');  //다음 태스크 실행, 완료 콜백으로 결과 전달
    },
    function task2(callback){
        callback(null, 'result2');
    },
    function task3(callback){
        callback(null, 'result3');
    }
    ], function(err, results){  //완료 콜백
        if(err){
            //태스크 진행 중 에러: callback(err, null);
            return;
        }

        //마무리 동작
        //results - 각 태스크의 결과가 배열 형태로 전달
        //results: ['result1', 'result2', 'result3']
    });
```
* 태스크로 정보를 전달하려고 할 때: async.waterfall
  * `waterfall(tasks, [callback])` - series()와 사용 방법은 비슷
  * 비동기 태스크간에 데이터를 전달할 수 있다는 특징
  * 다음 태스크로 전달할 값을 콜백의 파라미터로
```JavaScript
async.waterfall([
    function task1(callback){
        callback(null, 'value');
    },
    function task2(arg, callback){
        callback(null, 'value1', 'value2');
    },
    function task3(arg1, arg2, callback){
        callback(null, 'result');
    }],
    function(err, results){
        //code
});
```

#### 동시 실행
* `parallel(tasks, [callback])`
* 여러 태스크를 동시에 실행
* 모든 태스크를 맞치면 완료 콜백
```JavaScript
async.parallel(
    [
        function task1(callback){
            callback(null, 'task1 result');
        },
        function task2(callback){
            callback(null, 'task2 result');
        },
        function task3(callback){
            callback(null, 'task3 result');
        }
    ],
    function(err, results){  //모든 태스크를 완료했을 때의 콜백
        console.log('all task exit, results: ', results);  //['task1 result', 'task2 result', 'task3 result',]
    }
);
```

#### 콜렉션과 비동기 동작
* 콜렉션 내 각 항목을 사용하는 비동기 동작
  * 다수의 파일(배열)을 비동기 API로 읽기
  * 다수의 파일을 비동기 API로 존재하는지 확인
* `each(array, iterator[, callback])`
```JavaScript
async.each(array, function(item, callback){
    //item(배열의 개별 항목)을 사용하는 비동기 태스크
    callback(null);  //태스크가 끝나거나, 에러 발생할 떄 호출
}, function(err){  //모든 비동기 태스크 완료 or 에러 발생시 동작
    //async.each 완료
});
```

---

#### [Promise](https://www.promisejs.org/) - Chain
* 아직 알려지지 않은 값을 표현하는 객체
* 비동기식 함수와 관련된 계약(contract)으로 생각
* JavaScript ES6에 추가
  * Node.js 4.x 이후부터 모듈 설치 필요 없음
* Promise 상태
  * pending(미결), unfulfilled(미이행) - 동작 완료 전
  * fulfilled(이행) - 비동기 동작 성공
  * rejected(거절) - 동작 실패

##### Promise 생성
```JavaScript
var promise = new Promise(function(resolve, reject){
    //비동기 동작
    if(err){
        reject(err);  //거절 callback, 관례상 Error객체만 전달
    }else{
        resolve('promise fulfilled');  //이행 callback
    }
});
```

##### Promise 이후 동작 - then
```JavaScript
new Promise(task).then(resolve, rejected);
function resolve(result){
    //fulfilled 상태일 때 콜백
}
function rejected(err){
}
    //rejected 상태일 때 콜백
```

##### 비동기식 코드에서 Promise 사용하기
```JavaScript
var fs = require('fs');

function task(){
    return new Promise(function(resolve, reject){
        fs.readFile('README.md', 'utf-8', function(err, data){
            if(err){
                reject(err);
            }
            resolve(data);
        });
    });
}

//promise then() 사용
promise.then(function(result){  //성공 callback
    console.log(result);
    }, function(error){  //실패 callback(생략 가능)
        return console.error(error.message);
});
```

##### Promise 연쇄
```JavaScript
promise.then(function(result){
    console.log(result);
    return 'THE END!';
}).then(function(result){  //result에 THE END!가 전달
    console.log(result);
}).catch(function(error){  //reject 이벤트 처리
    console.error(error.message);
}).then(function(){  //결과와 무관하게 무조건 수행
    console.log('END!!');  
});
```

---

## 핵심 모듈
* 프로세스 환경
  * os - OS에 대한 정보를 구하는 함수 제공
  * process - 프로세스에 대한 정보를 담고 있는 전역객체
  * cluster - 여러 노드 프로세스를 실행하는 클러스터 기능 제공
* 파일과 경로, URL
  * fs - 파일을 다루는 함수 제공
  * path - 파일 경로를 다루는 함수 제공
  * URL - URL을 다루는 함수 제공
  * querystring - URL의 쿼리 문자열을 다루는 함수 제공
  * stream - 스트림을 다루기 위한 추상 인터페이스
  * readline - 스트림에서 라인단위로 읽는 기능 제공
* 네트워크
  * http - http서버 및 클라이언트 기능 제공
  * https - https서버 및 클라이언트 기능 제공
  * net - 비동기 네트워크 통신 기능 제공
  * dgram - UDP의 Datagram Sockets 통신 기능 제공
  * dns - DNS를 다루는 함수 제공
* utility - 타입 검사, 포맷팅 등의 유틸리티 함수 제공
* events - 이벤트 관련 함수 제공
* buffers - 바이너리 테이터의 octet stream을 다루는 모듈
* crypto - 암호화에 대한 함수 제공
* TLS/SSL - 공개키, 개인키 기반인 TLS/SSL에 대한 함수 제공
* tty - 터미널이나 콘솔 관련 기능을 제공

## 전역 객체
* 별도의 모듈 로딩없이 사용
* global 모듈
  * global.console.log() - global 생략 가능
* 주요 전역 객체
  * `process` - 현재 동작중인 프로세스의 정보
  * `console` - 콘솔 출력
  * `Buffer(클래스)` - 이진 데이터를 다루는 버퍼 클래스
  * `require` - 모듈 로딩
  * `__filename`, `__dirname` - 현재 폴더 경로와 파일 경로
  * module, exports - 로딩된 모듈 정보와 모듈로 타입, 객체 노출시키기
  * Timeout() - 타이머와 반복용 함수

### process
* 애플리케이션 프로세스 실행 정보
  * process.env - 애플리케이션 실행 환경
  * process.version - Node.js 버전
  * process.arch, process.platform - CPU와 플랫폼 정보
  * process.stdout, stderr, stdin - 표준 입출력 스트림
  * process.argv - 실행 명령 파라미터
    * 노드 앱으로 넘어온 명령행 인자는 process.argv 배열에서 얻을 수 있다.
    * process.argv[2]부터 시작
    ```JavaScript
        process.argv.forEach(function(value, index, args){
            console.log('process.argv[' + '] = ' + value);
        });
    ```
* 이벤트
  * exit - 애플리케이션 종료 이벤트
  * beforeExit - 종료되기 전에 발생하는 이벤트
  * uncaughtException - 예외 처리되지 않은 예외발생 이벤트
* 함수
  * exit - 애플리케이션 종료
  ```JavaScript
  process.exit([code]);
  ```
  * nextTick - Event Loop내 동작을 모두 실행 후 콜백 실행
  ```JavaScript
  process.nextTick(callback[, arg][, ...])
  ```

### Timer
* setTimeout(callback, delay, arg, ...) - 지연 동작(일정 시간 뒤 호출)
  * callback - 함수 형태
  * delay - milli second
  * arg - callback함수의 파라미터
  * ckearTimeout() - 타이머 동작 취소
  ```JavaScript
  function sayHello(){
      console.log('Hello World');
  }
  //3초뒤 실행
  var t = setTimeout(sayHello, 3*1000);
  //타이머 취소
  clearTimeout(t);
  ```
* setInterval(callback, delay, arg, ...) - 반복 동작
  * callback - 함수 형태
  * delay - milli second
  * arg - callback함수의 파라미터
  * clearInterval() - 취소
  ```JavaScript
  function sayGoodbye(who){
      console.log('Good bye', who);
  }
  setInterval(sayGoodbye, 1*1000, 'Friend');
  ```

### 콘솔
* 전역 객체
* 로그 남기기
* 실행 시간 측정

#### 로그 남기기
* `console.info()`
* `console.log()`
* `console.warn()`
* `console.error()`
```JavaScript
//값 출력
var intValue = 3;
console.log('int Value' + 3);
//객체형 출력
var obj = {
    name: 'dong',
    job: 'student'
};
console.log('obj: ', obj);
```

#### 커스텀 콘솔
```JavaScript
//콘솔 타입 로딩
var Console = require('console').Console;
//콘솔 객체 생성
//stdout - info(), log()
//stderr - warn(), error()
new Console(stdout[, stderr]);
```
* 파일로 로그 남기는 커스텀 콘솔
```JavaScript
var output = fs.createWriteStream('./stdout.log');
var errorOutput = fs.createWriteStream('./stderr.log');
var logger = new Console(output, errorOutput);

//출력
logger.info('stdout.log에 출력');
logger.warn('stderr.log에 출력');
```

#### 실행 시간 측정
* `console.time(TIMER_NAME)` - 시작 시점 설정
* `console.timeEnd(TIMER_NAME)` - 종료 시점. 걸린시간 계산해서 출력
```JavaScript
//시간 측정 시작
console.time('SUM');
var sum = 0;
for(var i=1; i<10000; i++){
    sum += i;
}
//시간 측정 끝
console.timeEnd('SUM');
```

### 유틸리티
* 모듈 로딩
```JavaScript
var util = require('util');
```
* 주요 기능
  * 문자열 포맷
    * `util.format(format[, ...]);`
    * %s - String
    * %d - Number
    * %j - JSON
  ```JavaScript
  var str1 = util.format('%d %s', 2, 'hello');
  ```
  * 상속
    * `util.inherits(ChildClassFunction, ParentClassFunction);`
  ```JavaScript
  //Parent 생성자
  function Parent(){
  }
  Parent.prototype.sayHello = function(){
      console.log('Hello. from Parent Class');
  }

  //Child 생성자
  function Child(){
  }

  //상속
  util.inherits(Child, Parent);

  var child = new Child();
  child.sayHello();
  ```

### 이벤트
* EventEmitter(설명 위에 있음)
  * 이벤트를 다루는 기능 제공
  * 이벤트를 발생시키고, 반응하는 이벤트 핸들러를 설정
  * Node.js의 많은 타입들은 EventEmitter이므로 이벤트를 다룰 수 있다.
* 이벤트의 예
  * 클라이언트의 접속 요청
  * 소켓에 데이터 도착
  * 파일 열기/읽기 완료
* 이벤트 처리
  * 비동기 처리
  * 리스너 함수 - EventEmitter에 등록
* Readline 모듈
  * Class: interface
    * rl.close()
    * rl.pause()
  * Events
    * Event: 'close'
    * Event: 'line'
    * Event: 'pause'
    * Event: 'resume'
    * Event: 'SIGCONT'
    * Event: 'SIGINT'

### 경로 다루기
* path
  * 경로 정규화
  * 경로 생성
  * 디렉토리/파일 이름 추출
  * 파일 확장자 추출
```JavaScript
var pathUtil = require('path')
```

#### 경로 정보
* 전역 객체
  * `__filename` - 애플리케이션 실행 파일 경로
  * `__dirname` - 애플리케이션 파일이 있는 디렉토리 경로
* 같은 폴더 내 이미지 경로
```JavaScript
var path = __dirname + '/image.png';
```

#### 경로 정규화
* `path.normalize()`
```JavaScript
pathUtil.normalize('/user/tmp/../local///bin/');
//return - /user/local/bin/
```

#### 경로 구성 요소
* path.basename() - 파일 이름, 경로 중 마지막 요소
* path.dirname() - 파일이 포함된 폴더 경로
* path.extname() - 확장자
```JavaScript
var path = '/foo/bar/baz/asdf.html';

// /foo/bar/baz
pathUtil.dirname(path);

// asdf.html
pathUtil.basename(path);

// .html
pathUtil.extname(path);
```

* 경로 구성 객체
  * 경로의 구성 요소를 여러개 얻으려면 path모듈의 함수를 여러번 호출해야 한다.
  * `parse()`는 경로를 분석해서 객체 형태로 제공
```JavaScript
var info = path.parse('/home/user/dir/file.txt')
{
    root: "/",
    dir: "/home/user/dir",
    base: "file.txt",
    ext: ".txt",
    name: "file"
}
//구성 요소 얻기
info.base
info.name
```

#### 경로 만들기
* 경로 연산
  * `__dirname + pathUtil.sep + 'image.png';` - 현재 폴더 내 image.png
  * `pathUtil.sep` - `\`, `/`같은 구분자 얻기
* 경로 붙이기
  * `pathUtil.join()` - 파라미터를 조합해 하나의 경로 생성
  ```JavaScript
  pathUtil.join('/foo', 'bar', 'baz/ddd');
  //return - /foo/bar/baz/ddd
  ```
  * `pathUtil.format()` - 파라미터를 객체로 입력해 경로 생성
  ```JavaScript
  var path = pathUtil.format({
      root: "/",
      dir: "/home/user/dir",
      base: "file.txt",
      ext: ".txt",
      name: "file"
      });
// /home/user/dir/file.txt
  ```

### 파일시스템 작업
* `var fs = require('fs')`
* 주요 기능
  * 파일 생성/읽기/쓰기/삭제
  * 파일 접근성/속성
  * 디렉토리 생성/읽기/삭제
  * 파일 스트림
> 모든 플랫폼에 100% 호환되지 않음

* 동기, 비동기 방식 함수 모두 제공
  * 동기
    * 이름규칙: +Sync `readFileSync()`
    * block 방식 - 성능상 주의
    * 반환값 이용
    * 에러 처리: `try~catch` 사용
  * 비동기
    * callback 사용
    * Non-block 방식
    * 에러 처리: callback함수의 에러 파라미터 사용

#### 파일 다루기
**fs모듈**을 이용해서 파일을 다루려면 파일에 접근할 수 있는 정보를 제공해야 한다.
* 파일 디스크립터
  * `fs.read(fd, buffer, offset, length, position, callback)`
  * `fs.readSync(fd, buffer, offset, length, position)`
  * FileDescription 얻기
    * `fs.open()`
    * `fs.openSync()`
  ```JavaScript
  var fd = fs.openSync(path, flags[, mode])
  // flag - r(읽기), w(쓰기), a(추가)
  fs.open(path, flags[,mode], function(err, fd){
  });
  ```
  * 파일 닫기
    * `fs.close(fd, callback)`
    * `fs.closeSync(fs)`
* 파일 경로
  * `fs.readFile(filename[, options], callback)`
  * `fs.readFileSync(filename[, options])`

```JavaScript
console.log('Current file ' + __filename);  //실행한 파일 이름
console.log('located in ' + __dirname);  //그 파일의 디렉토리

console.log('Starting in ' + process.cwd());  //현재 작업 디렉토리

try{
    process.chdir('/');  //작업 디렉토리 변경
}catch(exception){
    console.error('chdir: ' + exception.message);
}
```

#### 파일 읽기
* 파일 내용 읽기
  * `fs.read(fd, buffer, offset, length, position, callback)`
  * `fs.readFile(filename[, options], callback)`
  * `fs.readFileSync(filename[, options])`
* 파일 종류
  * 문자열 읽기: 인코딩
  * 바이너리 읽기: buffer(인코딩 설정 안하면)

```JavaScript
var fs = require('fs');

// 파일 디스크립터, 동기
var fd = fs.openSync(file, 'r');
var buffer = new Buffer(10);  //10크기의 버퍼 생성

var byte = fs.readSync(fd, buffer, 0, buffer.length, 0);
console.log('File Content: ', buffer.toString('utf-8'));

fs.closeSync(fd);  //파일 디스크립터 닫기

// 파일 디스크립터, 비동기
fs.open(file, 'r', function(err, fd){
    var buffer = new Buffer(20);
    fs.read(fd, buffer, 0, buffer.length, 10, function(err, byteRead, buffer){
        console.log('File Read: ', byteRead, 'bytes');
        console.log('File Content: ', buffer.toString('utf-8'));

        fs.close(fd, function(err){});
    });
});

//동기
try{
    var data = fs.readFileSync(__filename);  //바이너리
    //var data = fs.readFileSync(__filename, 'utf-8');  //인코딩
    console.log(data);
}catch(exception){
    console.error(exception.message);
}

//비동기
//fs.readFile(__filename, 'utf-8', function(err, data){}
fs.readFile(__filename, {
    encoding: 'utf-8'  //인코딩 방식 설정
}, function(err, data){
    if(err){
        return console.error(err.message);
    }

    console.log(data);
});
```

#### 파일 상태 확인
파일 다루기: 파일 상태에 따라 에러 발생, 파일 다루기 전에 **파일 상태 확인**
* 파일 존재 확인하기
  * `fs.access()`
  * `fs.stat()`
* 파일 접근 가능 확인
  * `fs.access(path[, mode], callback)`
  * `fs.accessSync(path[, mode])` - 접근 불가능하면 예외 발생 -> `try-catch 사용`
  * 접근 모드
    * fs.F_OK - 존재 확인
    * fs.R_OK, W_OK, X_OK - 읽기/쓰기/실행 여부 확인
```JavaScript
//파일 접근 여부 확인 후 읽기 - 동기
try{
    fs.accessSync(file, fs.F_OK);
    console.log('파일 접근 가능');
    var data = fs.readFileSync('file', 'utf-8');
    console.log('파일 내용: ', data);
}catch(exception){
    //파일이 없을 때 동작할 코드 작성
    console.log('파일 없음: ', exception);
}

//파일 접근 여부 확인 후 읽기 - 비동기
fs.access(file, fs.F_OK | fs.R_OK, function(err){  //파일 존재 여부 확인
    if(err){  //파일X
        //에러 처리
    }
    fs.readFile(file, 'utf8', function(err, data){
        if(err){
            //에러처리
        }
        console.log(data);
    });
});
```
* 파일 상태 얻기
  * `fs.stat(path, callback)`
  * `fs.statSync(path)`
```JavaScript
//파일 상태 확인 - 동기
try{
    var stats = fs.statSync(file);  //파일 상태 얻기
    console.log('Create: ', stats.birthtime);  //생성일
    console.log('Access: ', stats.atime);  //접근일
    console.log('Modify: ', stats.mtime);  //수정일
    console.log('size: ', stats.size);  //크기
    console.log('isFile: ', stats.isFile());  //파일 여부
    console.log('isDirectory: ', stats.isDirectory());  //디렉토리 여부
}catch(exception){
    console.error('파일 접근 에러: ', exception);
}

//파일 상태 확인 - 비동기
fs.stat(file, function(err, stats){
    if(err){
        console.error('File Stats Error', err);
        return;
    }

    //파일 상태 확인 후 읽기
    if(stats.isFile()){
        fs.readFile(path, 'utf-8', function(err, data){
            console.log('파일 읽기: ', data);
        });
    }
});
```

#### 파일 쓰기
* 파일에 저장
  * `fs.write(fd, data[, position][, encoding], callback)`
  * `fs.writeFile(filename, data[, options], callback)`
  * `fs.writeFileSync(filename, data[, options])`
  * 같은 파일 이름? - **덮어쓰기**
```JavaScript
var fs = require('fs');
var data = 'some file data';

//utf-8이 기본 인코딩
//기본적으로 파일 생성 or 덮어쓰기 -> flag로 조정
//wx - 파일이 존재할 경우 오류 던짐
//a - 기존 파일 뒤에 덧붙이기
fs.writeFile(__dirname + '/foo.txt', data, {
    flag: 'wx'   //
}, function(err){
    if(err){
        return console.error(err.message);
    }

    console.log('파일 저장 성공');
});
```
* 파일에 추가
  * `fs.appendFile(file, data[, options], callback)`
  * `fs.appendFileSync(file, data[, options])`
  * 파일이 없으면? - **새 파일 생성**
```JavaScript
fs.appendFile(path, 'Additional data', function(err){
    if(err){
        console.error('파일 내용 추가 실패: ', err);
    }
    console.log('파일 내용 추가 성공');
});
```

#### 파일 삭제
* `fs.unlink(path, callback)`
* `fs.unlinkSync(path)`
* 파일 없으면? - **error**
```JavaScript
//동기
try{
    fs.unlinkSync('./data.txt');
}catch(exception){
    console.log('삭제하려는 파일 없음');
}

//비동기
fs.unlink('./data.txt', function(err){
    if(err){
        console.error('delete error: ', err);
    }
});
```

#### 파일 이름 변경/이동
* `fs.rename(oldPath, newPath, callback)`
* `fs.renameSync(oldPath, newPath)`

#### 디렉토리 다루기
* 생성
  * 같은 이름의 디렉토리가 있으면 실패
  * `fs.mkdir(path[, mode], callback)`
  * `fs.mkdirSync(path[, mode])`
* 삭제
  * 디렉토기가 비어있지 않으면 실패
  * `fs.rmdir(path, callback)`
  * `fs.rmdir(path)`
```JavaScript
//디렉토리 생성 - 비동기
fs.mkdir('test', function(err){
    if(err){
        return console.error('mkdir error: ',err);
    }
});

//디렉토리 삭제 - 동기
try{
    fs.rmdirSync('test');  //삭제 대상 없으면 에러
}catch(exception){
    console.log('디렉토리 삭제 에러');
}
```
* 디렉토리 내 파일 목록
  * 파일 목록을 문자열 배열로 얻는다.
  * `fs.readdir(path, callback)`
  * `fs.readdirSync(path)`
  * 디렉토리가 없으면 에러
* 디렉토리 내용 읽기
```JavaScript
fs.readdir(path, function(err, files){
    if(err){
        return console.error('read directory error');
    }
    console.log('디렉토리 내 파일 목록(Async)\n', files);
});
```

### 버퍼
* JavaScript는 문자열 다루는 기능 제공, **바이너리 데이터를 다루는 기능이 없음**
* `Buffer모듈` - 바이너리 데이터를 다루는 모듈
* 글로벌이므로 로딩(require) 불필요

#### 버퍼 얻기
* 파일
```JavaScript
var fileBuffer = fs.readFileSync('image.jpg');
```
* 네트워크
```JavaScript
socket.on('data', function(data){
    //data - buffer
});
```

#### 버퍼 만들기
* 생성 후 크기 변경불가
  * `new Buffer(size)`
  * `new Buffer(array)`
  * `new Buffer(str[, encoding])`

#### 버퍼 다루기
* 모듈 함수
  * 바이트 길이 - `Buffer.byteLength(string[, encoding])`
  * 비교 - `Buffer.compare(buf1, buf2)`
  * 붙이기 - `Buffer.concat(list[, totalLength])`
  * 버퍼 확인 - `Buffer.isBuffer(obj)`
  * 인코딩 - `Buffer.isEncoding(encoding)`
* 객체 메소드
  * 길이 - `buffer.length`
  * 채우기 - `buf.fill(value[, offset][, end])`
  * 자르기 - `buf.slice([start[, end]])`
  * 비교하기 - `buf.compare(otherBuffer)`
  * 복사하기 - `buf.copy(targetBuffer[, targetStart][, sourceStart][, sourceEnd])`

#### 문자열과 버퍼
* 문자열 - 바이너리 데이터로 다루기
* 문자열에서 버퍼 생성
  * `new Buffer(str[, encoding])`
* 문자열 인코딩 필요
  * ascii, utf8, ...
  * 잘못된 인코딩 -> 에러
* 버퍼에 문자열 쓰기
  * `buf.write(string[, offset][, length][, encoding])`
* 변환
  * `buf.toString([encoding][, start][, end])`
```JavaScript
//문자열에서 버퍼 생성
var strBuffer = new Buffer('Hello World');
strBuffer.toString('utf-8');
strBuffer.toString('base64');

//버퍼에 문자열 쓰기
var buffer = new Buffer(10);
buffer.write('Hello World');
buffer.toString();
```
* 문자열의 바이트 길이
  * `Buffer.byteLength(string[, encoding])`
```JavaScript
var str1 = 'Hello World';
str1.length;  //11
Buffer.byteLength(str1);  //11
```
* 데이터 읽기/쓰기
  * 8비트 정수형
    * `buf.readInt8(offset[, noAssert])`
    * `buf.writeInt8(value, offset[, noAssert])`
  * 16비트 정수형
    * `buf.readUInt16LE(offset[, noAssert])`
    * `buf.writeUInt16LE(value, offset[, noAssert])`
  * 실수형
    * `buf.writeFloatLE(value, offset[, noAssert])`
    * `buf.writeFloatBE(value, offset[, noAssert])`
    * `buf.readFloatLE(offset[, noAssert])`
    * `buf.readFloatBE(offset[, noAssert])`
  * 2바이트이상일 경우 바이트를 버퍼에 쓰는 방식에 따라 `Big Endian`, `Little Endian` 방식의 함수 제공
    * `require('os').endianness()`
```JavaScript
var buffer = new Buffer(6);
// 0으로 채우기
buffer.fill(0);

buffer.writeInt8(1, 0);  // 01
buffer.writeUInt8(0xFF, 1);  // FF
buffer.writeUInt16LE(0xFF, 2);  // FF 00
buffer.writeUInt16BE(0xFF, 4);  // 00 FF
console.log(buffer.toString('hex'));  // 01 FF FF 00 00 FF

//버퍼 읽기
buffer.readInt8(0);  // 1(01)
buffer.readUInt8(1);  // 255(FF)
buffer.readUInt16LE(2);  // 255(FF)
buffer.readUInt16BE(4);  // 255(FF)
```

### 스트림
* 두 지점 사이에서 데이터를 옮기는 메커니즘
* **데이터의 전송 흐름**
* 콘솔 입력/출력
* 파일 읽기/쓰기
* 서버/클라이언트 - 데이터 전송
* 스트림 모듈
  * 스트림을 다루기 위한 추상 인터페이스
  * 다양한 스트림을 같은 인터페이스로 다룰 수 있다.
* 스트림 종류
  * 읽기 스트림 - `Readable Stream`
  * 쓰기 스트림 - `Writable Stream`
  * 읽기/쓰기 - `Duplex`
  * 변환(압축, 암호화) - `Transform`

#### 읽기 가능 스트림(Readable Stream)
* 데이터의 출발지
* 모드
  * flowing mode
    * 데이터를 자동으로 읽는 모드
    * 이벤트를 이용해서 데이터를 다룸
    * 전달되는 데이터를 다루지 않으면 데이터 유실
    * `data 이벤트` 핸들러 등록, `pipe()`를 이용해 출력 스트림과 연결, `paused`상태에서 `resume()` 호출할 시 `flowing mode`로 동작
  * paused mode
    * 데이터가 도착하면 대기
    * read()를 이용해 수동으로 데이터 읽기
* Readable 메소드
  * 읽기
    * `readable.read([size])` - `pause mode`에서 사용
    * `readable.setEncoding(encoding)` - 인코딩 설정
  * 중지/재개
    * `readable.pause()` - `flowing mode`에서 사용하면 `paused mode`가 된다.
    * `readable.resume()` - 중단된 상태를 읽기 상태로 변환, `flowing mode`모드로 변환
  * 파이프
    * `readable.pipe(destination[, options])` - ReadableStream에서 읽는 데이터를 바로 WriteableStream으로 바로 전달
    * `readable.unpipe([destination])`
* Readable 이벤트
  * readable - 읽기 가능한 상태
  * data - 읽을 수 있는 데이터가 도착
    * `Chunk`로 알려진 데이터 조각이 준비되면 스트림은 `Buffer`형태의 실제 데이터와 함께 이벤트 전송
  * end - 더 이상 읽을 데이터가 없는 상태
  * close - 스트림이 닫힌 상태
  * error - 에러

```JavaScript
// 파일 스트림에서 읽기 - flowing mode
var fs = require('fs');
//읽기가능 스트림 열기, fs.createReadStream(path[, options])
var is = fs.createReadStream(file);  

is.on('readable', function(){
    console.log('== READABLE EVENT');
});

is.on('data', function(data){  //데이터 전송
    console.log('== DATA EVENT');
    var chunk = data.toString();
    process.stdout.write(chunk);  //프로세스 표준출력 스트림
});

is.on('end', function(){
    console.log('== END EVENT');
});

is.on('error', function(error){
    console.error(error.message);
});

//파일 스트림에서 읽기 - paused mode
var is = fs.createReadStream(file);

// 'data'이벤트가 없으면 paused mode
is.on('readable', function(){
    log.('== READABLE EVENT');

    //10바이트씩 읽기
    while(chunk = is.read(10)){  //읽을 데이터 없으면 null반환
        console.log('chunk: ', chunk.toString());
    }
});
```

#### 쓰기 가능 스트림(Writable Stream)
* 데이터의 목적지
* Writeable Stream: 데이터 출력
  * http 클라이언트의 요청
  * http 서버의 응답
  * 파일 쓰기 스트림
  * tcp 소켓
* 데이터 쓰기, 인코딩
  * `writable.setDefaultEncoding(encoding)`
  * `Writeable.write(chunk[, encoding][, callback])` - 쓰기 가능 스트림으로 전송, 입력 데이터를 모두 처리하면 true를 반환
* 스트림 닫기
  * `writable.end([chunk][, encoding][, callback])` - 스트림이 끝났음을 알린다.
  * `process.stdout.write()`
* 버퍼
  * `writable.cork()` - 출력 스트림에 바로 쓰지 않고 버퍼링
  * `writable.uncork()` - 버퍼링된 데이터를 출력 스트림으로 모두 쓴다.
* 이벤트
  * drain - 출력 스트림에 남은 데이터를 모두 보낸 이벤트
  * error - 에러
  * finish - 모든 데이터를 쓴 이벤트
  * pipe - 읽기 스트림과 연결(pipe)된 이벤트
  * unpipe - 연결(pipe) 해제 이벤트
* 배압(back pressure) 처리
  * 하부 버퍼의 크기제한으로 문제를 일으킬 때 전송중단을 출발지에 요청
  * write()의 `boolean 반환값`으로 구현
  * `false`면 스트림에 더이상 데이터를 쓰면 안된다.
  * 스트림이 추가 데이터를 받을 준비가 되었다면 `drain 이벤트` 전송
```JavaScript
var fs = require('fs');
var readStream = fs.createReadStream('foo.txt');  //읽기가능 스트림 열기
// fs.createWriteStream(path[, options])
var writeStream = fs.createWriteStream('bar.txt');  //쓰기가능 스트림 열기

writeStream.on('finish', function(){
    console.log('== FINISH EVENT');
});

writeStream.write('1234\n');
writeStream.end('9\n');  //finish event
```

#### 표준 스트림
* process.stdin - 콘솔 입력
* process.stdout - 콘솔 출력
* process.stderr - 콘솔 에러출력

#### 스트림 연결
* 스트림 연결과 해제
  * `readable.pipe(destination[, options])`
  * `readable.unpipe([destination])`
* 연결 이벤트
  * pipe
  * unpipe
* 스트림 연결
  * 입력 스트림 - stdin
  * 출력 스트림 - 파일

```JavaScript
process.stdin.once('data', function(data){  //stdin은 pause상태로 시작. data이벤트로 읽는다.
    process.stdout.write('Hello ' + data.toString());  
    process.stdin.pause();
});

process.stdout.write('What is your name? ');
process.stdin.resume();  //stdin 재개
```

```JavaScript
var readStream = process.stdin;
var writeStream = fs.createWriteStream('output.txt');

writeStream.on('pipe', function(src){  //연결 이벤트
    console.log('pipe event');
});

//exit입력이 오면 파이프 연결 해제
readStream.on('data', function(data){
    if(data.trim() == 'exit'){
        readStream.unpipe(writeStream);
    }
});

readStream.pipe(writeStream);  //Stream 연결. 읽은 데이터가 자동으로 쓰여진다.
```

### URL(Uniform Resource Locator) 다루기
* 네트워킹의 시작
  * 서버 주소
  * 서버에서 요청 위치
  * 서버에서 리소스 위치
* URL 구성 요소
  * 프로토콜(Protocol)
  * 호스트(Host)
  * 포트번호(Port)
  * 경로(Path)
  * 쿼리(Query)
  * 프래그먼트(Fragment)

#### URL 모듈
```JavaScript
var url = require('url');
```
* URL 구성요소 분석
  * `url.parse(urlStr[, parseQueryString][, slashesDenoteHost])`
    * urlStr - URL문자열
    * parseQueryString - 쿼리 문자열 파싱(default, false)
    * slashesDenoteHost - //로 시작하는 주소의 경우, 호스트 인식 여부(default, false)
```JavaScript
var urlStr = 'http://naver.com/q?name=ddd&search=hhh';
var parsed = url.parse(urlStr);
/*
host - 'naver.com'
search - '?name=ddd&search=hhh'
query - 'name=ddd&search=hhh'
pathname - '/q'
path - '/q?name=ddd&search=hhh'
*/

var parsed = url.parse(urlStr, true);  //쿼리 문자열 객체로 분석
var query = parsed.query;
/*
query.name  //ddd
query.search  //hhh
*/
```
* URL 만들기
  * `url.format(urlObj)`
```JavaScript
var urlObj = {
    protocol: 'http'  //프로토콜
    host: 'idols.com'  //서버 호스트 주소
    pathname: 'schedule/radio'  //경로
    search: 'time=9pm&day=monday'  //쿼리 스트링
    //auth: // 인증 정보
}

var urlStr = url.format(urlObj);
// http://idols.com/schedule/radio?time=9pm&day=monday
```  
* URL 변환
  * `url.resolve(from, to)`
* URL 인코딩
  * URL에 허용되는 문자 - 알파벳, 숫자, 하이픈, 언더스코어, 점, 틸트
  * `urlencode모듈` 사용

### 쿼리 스트링
* `name1=value&name2=value2`
* 쿼리 스트링 배열
  * **lang**=C&**lang**=Python&**lang**=JavaScript
* URL외에도 사용
* HTTP body로 정보 전달 등
* `querystring`모듈
  * URL의 쿼리스트링은 `URL`모듈만으로도 분석 가능하지만 **http body**의 쿼리 스트링을 파싱할 때 필요
  * `var querystring = require('querystring')`
  * querystring.parse(str[, sep][, eq][, options])
    * sep - 쿼리 구분자(default, &)
    * ep - 기호(default, =)
```JavaScript
var querystring = require('querystring');
var str = 'group=eee&name=Alice&since=';

var parsed = querystring.parse(str);

parsed.group  //eee
parsed.name  //Alice
parsed.since  //''
parsed.last  //undefined - 정의되지 않음 값
```
* 쿼리 문자열 만들기
  * `querystring.stringfy(obj[, sep][, eq][, options])`
    * sep - 쿼리 구분자(default, &)
    * ep - 기호(default, =)
    * 인코딩 자동
```JavaScript
var queryObj = {
    name: 'IU',
    best: '좋은날'
};

var queryStr = querystring.stringfy(queryObj);  //name=IU&best=%EC%A2%8B
```

---

### 클러스터(Cluster)
* 여러 시스템을 하나로 묶어서 사용하는 기술
* 개별 시스템 내에서 클러스터
  * 멀티 프로세스
  * 멀티 코어
* Node.js 애플리케이션 - 1개의 Single Thread
  * 멀티 코어 환경의 장점을 살리기 힘들다.
  * 멀티 코어 시스템의 장점 살리기 - **Cluster**
* Node.js 클러스터  
  * 클러스터 사용시 포트 공유 - 서버 작성 편리
  * 코어(프로세서)의 개수 만큼 사용

#### Clustering - Master와 Worker 프로세스
* Master
  * 메인 프로세스
  * Worker 생성
* Worker
  * 보조 프로세스
  * Master가 생성
  * **동시에 동작**하는 Worker의 갯수는 **CPU의 코어 갯수보다 많지 않도록** 작성하는게 좋다.

#### Cluster모듈 - 기본모듈
* `var cluster = require('cluster')`
* 클러스터 생성(Master)
  * `cluster.fork()`
* 구분하기
  * `cluster.isMaster`
  * `cluster.isWorker`

#### Cluster 이벤트
* Cluster의 이벤트
  * fork - Worker 생성 이벤트
  * online - Worker 생성 후 동작하는 이벤트
  * listening - Worker에 작성한 서버의 listen 이벤트
  * disconnect - Worker 연결 종료
  * exit - Worker 프로세스 종료
* Worker의 이벤트
  * message - 메세지 이벤트
  * disconnect - Worker 연결 종료
> 더 많은 이벤트가 있으니 [Document](https://nodejs.org/dist/latest-v4.x/docs/api/cluster.html) 확인

#### Worker
* Worker 접근
  * `cluster.worker` - 현재 동작중인 Worker프로세스를 얻는다.
  * `cluster.workers` - 모든 Worker 프로세스들의 객체를 얻는다. 개별 Worker는 **id**로 접근
* Worker 식별자
  * `worker.id`
* Worker 종료
  * `worker.kill([signal='SIGTERM'])` - 프로세스 종료 코드 입력(0이면 정상 종료)
  * Worker 프로세스가 종료되면 Cluster에 `disconnect 이벤트` 발생

#### 클러스터 생성과 동작
```JavaScript
//Mater - Worker생성 대략적인 구조
if(cluster.isMaster){  //구분
    //Master code
    cluster.fork();
    cluster.on('online', function(worker){
        //Worker 생성 후 시행
        console.log('Worker #' + worker.id + 'is. Online');
    });
    cluster.on('exit', function(worker, code, signal){
        //Worker 종료 이벤트
        console.log('Worker #' + worker.id + ' exit');
    });
}else{
    //Worker code
    var worker = cluster.worker;

    //Worker 종료
    worker.kill();
}
```

#### 서버 Cluster
* 서버에 Cluster 적용
  * 서버의 성능 향상
  * Master 프로세스에서 Worker 프로세스 생성, Worker 클래스에서 서버를 생성하고 요청 처리
```JavaScript
 if(cluster.isMaster){
     cluster.fork();
 }else{
     http.createServer(function(req, res){
         //Server code
     }).listen(8000);
 }
```
* Clustering 기능 지원 프로세스 모듈
  * pm2

#### 데이터 전달
* Master가 Worker에게 데이터 전달
  * `worker.send(data)` - `message 이벤트` 발생
* Worker의 데이터 이벤트
  ```JavaScript
  worker.on('message', function(data){
    //code
  });
  ```
* Worker가 Master에게 데이터 전달
  * `process.send(data)` - `message 이벤트` 발생
* Master에서의 데이터 이벤트
  ```JavaScript
  //Worker를 생성하면서 핸들러 등록하여 데이터 수신
  var worker = cluster.fork();
  worker.on('message', function(data){
    //code
  });
  ```
```JavaScript
if(cluster.isMaster){
    var worker = cluster.fork();
    worker.on('message', function(message){  //worker가 발행한 message이벤트 받기
        console.log('Master received: ', message);
    });

    cluster.on('online', function(worker){  //worker생성 후  
        worker.send({message: 'Hello Worker'});  //worker로 데이터 전달
    });
}else{
    var worker = cluster.worker;  //현재 동작중인 worker 얻기

    worker.on('message', function(message){  //message 이벤트 핸들러
        process.send({message: 'Fine thank you!'});  //cluser로 데이터 전달
    });
}
```

#### Master와 Worker 분리
* 별도의 파일로 분리
  * `cluser.setupMaster([settings])`
    * exec - 워커 파일
    * args - 실행 파라미터
* 마스터 - fork
```JavaScript
cluser.setupMaster({
    exec: 'worker.js'  //Worker 프로세스로 worker.js가 동작
});
cluser.fork();
```

---

## 확장 모듈

### nodemon
* 소스코드 수정 후 재시작
  * 동작 멈추기, 다시 시작
* 수정 후 자동 재시작
  * `nodemon source.js`
* 글로벌로 설치
  * `npm install -g nodemon`

---

## HTTP 통신
* 특징
  * 요청(Request)
  * 응답(Respone)
* 과정
  * 웹 브라우저 -> 주소 입력 -> 요청 -> 웹 서버 -> 응답 -> 웹 브라우저

### HTTP 요청
* 요청 메시지 구조
  * 요청 라인
  * 요청 헤더
  * 요청 바디(엔티티)

#### 요청 라인
GET http://www.naver.com HTTP/1.1
* HTTP 메소드 - 리소스를 다루는 행위
  * GET - 리소스를 얻어오는 요청
  * POST - 리소스 전송 요청
  * PUT - 저장 요청(수정)
  * DELETE - 삭제
  * ...
* URL
* 버전

#### 요청 헤더
* key : value 구조
* 주요 헤더 필드
  * Accept - 클라이언트가 받을 수 있는 컨텐츠
  * Cookie - 쿠키
  * Content-Type - 메시지 바디(엔티티)의 종류
  * Content-Length - 메시지 바디의 길이
  * If-Modified-Since - 특정 날짜 이후에 변경됐을 때만

### 요청 정보 전달

#### URL을 이용
* GET, TRACE
* 경로와 쿼리 스트링 사용
* 메시지 바디를 사용하지 않는다.

#### URLEncoded
* 메시지 헤더
  * Content-Type : application/x-www-form-urlencoded
* 메시지 바디
  * 쿼리 문자열
```
//example
//querystring모듈로 바디 분석
Content-Type : application/x-www-form-urlencoded
title=MAdmax&Director=fdfda
```

#### JSON/XML
* 메시지 헤더
  * Content-Type : application/json
  ```
  //example
  Content-Type : application/json
  {
      "name": "aaa",
      "age" : "11"
  }
  ```

#### Multipart
* 바이너리 파일 업로드에 주로 사용
* 하나의 메시지 바디에 파트를 나눠서 작성
* 메시지 헤더
  * Content-Type : multipart/form-data;boundary=XXYYZZ(각 파트 구분자)

### HTTP 응답
* 응답 메시지 구조
  * 응답 라인
  * 응답 헤더
  * 응답 바디(엔티티)


#### 응답 라인
HTTP/1.1 200 OK
* 버전
* 상태 코드 - 서버의 응답 코드
  * 1xx - 정보
  * 2xx - 성공
    * 200 - OK, 요청 성공
    * 201 - Created, 생성 요청 성공
    * 202 - Accepted, 요청 수락, 요청 처리는 보장 안됨
    * 203 - Non-authoritavive Information
    * 204 - Non Content
  * 3xx - 리다이렉션
    * 300 - Multiple choices, 여러 리소스에 대한 요청 결과 목록
    * 301, 302, 303 - Redirect, 리소스 위치가 변경된 상태
    * 304 - Not Motified, 리소스가 수정되지 않았음(캐시된 항목으로 처리)
  * 4xx - 오류
    * 400 - Bad Request, 요청 오류
    * 401 - Unauthorized, 권한 없는 상태
    * 403 - Forbidden, 요청 거부 상태
    * 404 - Not Found, 리소스가 없는 상태
  * 5xx - 오류
    * 500 - Internal Server Error, 서버가 요청 처리를 못하는 상태
    * 501 - Not Implemented, 서버가 지원하지 않는 요청(ex. 지원하는 않는 메소드 사용)
    * 503 - Service Unavailable, 과부하 등으로 당장 서비스가 불가능 상태(클라이언트는 나중에 다시 시도)
* 상태 메시지

#### 응답 메시지 헤더
* 주요 헤더 필드
  * Content-Type, Content-Length - 바디 데이터의 타입과 크기
  * Set-Cookie - 쿠키 설정(클라이언트에게 쿠키 저장하라는)
  * ETag - 엔티티 태그(리소스 캐시)

#### 응답 메시지 바디
* 바디 데이터
  * HTML
  * XML/JSON
  * Octet Stream 등
* 바디 기록 방식 - Content-Type 헤더 필드
  * 대분류/소분류
  * text/plain(문자/평문), text/html(문자/html)
  * application/xml, application/json
  * image/png, image/jpg
  * audio/mp3, video/mp4

---

### HTTP 모듈, 기본 모듈
* `var http = require('http')`
* HTTP 서버
  * 클라이언트의 요청 메시지 수신
  * 클라이언트의 응답 메시지 전송
* HTTP 클라이언트
  * 서버로 요청 메시지 전송
  * 서버의 응답 메시지 수신

#### HTTP 모듈 클래스
* 서버용
  * http.Server - HTTP 서버
  * http.IncomingMessage - HTTP 서버의 요청 메시지, Readable Stream
  * http.ServerResponse - HTTP 서버의 응답 클래스
* 클라이언트용
  * http.Client - HTTP 클라이언트
  * http.ClientRequest - HTTP 클라이언트 요청 메시지
  * http.IncomingMessage - HTTP 서버의 응답 메시지, Readable Stream

---

### HTTP 서버
* 서버 생성
  * `var server = http.createServer([requestListener])`
* 주요 이벤트
  * request - 클라이언트의 요청 메시지 도착
  * connection - 소켓 연결
  * close - 서버 연결 종료
* 메소드
  * server.listen()
    * 서버의 네트워크 포트와 결합해 해당 포트로 전달되는 요청에 반응
  * server.close()
    * 서버 연결을 종료시켜 추가적인 클라이언트 요청을 더 이상 받지 않게 한다.
  * server.setTimeout()
    * 요청 처리 제한시간 설정
* 포트
  * 0 ~ 1023 - well-known port, 미리 정의된 포트, 관리자 권한 필요
  * 1024 ~ 49151 - registered port
  * 49152 ~ 65535 - dynamic port
  * 포트 바인딩 실패
    * 이미 사용 중
    * 권한 없음
```JavaScript
var http = require('http');
var server = http.createServer();

server.on('request', function(req, res){
    res.end('Hello World');  //응답
});

server.on('connection', function(socket){
    console.log('connection event');
});

server.on('close', function(){
    console.log('close');
});
server.listen(3000);  //클라이언트 접속 대기, 3000번 포트 사용
```

#### HTTP 요청
* 클라이언트 요청 분석
  * `var server = http.createServer(function(req, res))`
  * request이벤트 리스너의 파라미터
  * req : IncomingMessage 타입
  * IncomingMessage
    * message.url - 요청 url, 경로와 쿼리스트링
    * message.method - 요청 메소드
    * message.headers - 요청 메시지 헤더
    * message(streamable) - 요청 메시지 바디
* url 경로와 쿼리스트링 분석
```JavaScript
var url = require('url');
url.parse(req.url, true);
```
* 헤더 분석
  * 노드는 헤더 이름 소문자로 취급
```JavaScript
var headers = request.headers;
headers.host;
headers.content-type;
headers.user-agent;  // or hearders['user-agent'];
header.cookie;
```
* 바디 분석
  * IncomingMessage의 data이벤트 사용

#### HTTP 응답
* 응답 메시지 - `http.ServerResponse`
  * 상태 코드와 상태 메시지
    * `response.statusCode`
    * `response.statusMessage`
  ```JavaScript
  //200 OK
  response.statusCode = 200;
  response.statusMessage = 'OK';

  //404 Error
  response.statusCode = 404;
  response.statusMessage = 'Not Found';
  ```
  * 헤더
    * `response.writeHead(statusCode[, statusMessage][, headers])`
    * `response.removeHeader(name)`
    * `response.getHeader(name)`
    * `response.setHeader(name, value)`
  ```JavaScript
  //응답 코드, 헤더 작성
  res.writeHead(200, {'Content-Length': body.length,
                      'Content-Type': 'text/plain'});
  //헤더 작성
  res.setHeader('Content-Type', 'text/html');
  ```
  * 바디
    * `response.end([data][, encoding][, callback])` - 응답 종료
    * `response.write(chunk[, encoding][, callback])` - 계속 쓸수 있다.
  * 주의 사항
    * timeout!
      * 응답 메시지는 `end()`를 이용해 작성을 끝내야 한다.
      * `write()`로 작성하고 `end()`를 호출하지 않으면 **timeout**이 발생.
    ```JavaScript
    http.createServer(function(req, res){
        res.write('Hello');  
        //res.end();  //주석을 지우기 전까진 timeout 발행
    });
    ```
    * 헤더는 바디 작성 전에 작성!
    ```JavaScript
    res.write('Hello');
    //바디를 작성한 이후에 헤더를 작성하면 에러 발생
    res.setHeader('Content-Type', 'text/plain');
    ```

#### 정적 파일 요청
* 정적 컨텐츠(이미지, html, 음악 등) 요청
  * 미리 작성된 파일로 응답(ex.`http://server.com/image/cat.jpg`)
* 요청 경로
  * `req.url`
  * 요청 경로 분석 - 정적 리소스에 대한 요청은 요청 url분석만으로 해결되는 경우가 많다.
    * `path모듈`
* 정적 리소스 요청에 대한 응답
  * 정적 리소스 체크
    * 정적 파일 찾기
    * 파일 로딩, 응답
    * 정적 리소스의 위치와 접근 방법 분석, 파일의 존재 여부와 접근 가능한지 확인. 접근할 수 없으면 그에 해당하는 응답(권한X, 클라이언트에 캐시된 리소스를 그대로 사용 가능)
  * 상태 코드
  * 컨텐츠 타입
```JavaScript
fs.access(path, fs.R_OK, function(err){  //파일 존재 확인
    //파일이 없으면? -> 접근 불가능 404 에러
    if(err){
        res.statusCode = 404;
        res.end('Not Found');
        return;
    }

    //있으면 읽어서 응답
    fs.readFile(path, function(err, data){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/jpg');
        res.end(data);
    });
});
```
* `스트림 파이프`를 이용해 응답 메시지 작성
  * 스트림 방식으로 응답하면 서버의 반응성이 좀 더 좋아지는 장점이 있다.
  * `fs.createReadStream(path).pipe(res)`
    * 입력 스트림 - `fs.createReadStream()`
    * 출력 스트림 - `res`
* 파비콘 - 웹사이트의 아이콘 이미지
  * 요청 - `GET/favicon.ico`
  * 응답
  ```JavaScript
  if(req.url == '/favicon.ico'){
      //파비콘파일을 찾아서 응답
      return;
  }
  ```
* 컨텐츠 타입
```JavaScript
var server = http.createServer(function(req, res){
    if(req.url == '/favicon.ico'){  //파비콘 처리

    }else if(req.url == '/'){  //기본 페이지: index.html
        fs.createReadStream('./public/index.html').pipe(res);
    }else{  //정적 리소스
        var path = __dirname + req.url;

        if(req.url == '/image.png'){
            res.writeHead(200, {'Content-Type': 'image/png'});
            fs.read...
        }else if(req. url == '/music.mp3'){
            res.writeHead(200, {'Content-Type': 'audio/mp3'});
            fs.createReadStream..
        }else if(req.url == 'movie.mp4'){
            res.writeHead(200, {'Content-Type': 'video/mp4'});
            fs.createReadStream...
        }
    }
});
```

#### 정적 파일 서비스
* 요청 url의 경로를 실제 파일 경로 매핑
  * 다양한 리소스 요청이 오면, 요청의 경로와 실제 파일이 위치한 디렉토리 구조를 일치시켜 놓으면 편리
  * `server.com/image/cat.png` -> `./image/cat.png`
* 요청 url에서 경로 생성
```JavaScript
var pathUtil = require('path');
var path = __dirname + pathUtil.sep + 'image' + req.url;
```

### HTTP POST 요청
* Get 요청
  * url로 요청 정보 전달, url만 분석
  * 길이 제한, 암호화 불리
  * 바디 분석을 안해도되서 빠르게 응답을 얻을 수 있다.
* Post 요청
  * 메시지 바디(entity)로 요청 정보 전달
  * 바디 분석 필요 - 요청 처리 속도가 느리다
  * 길이 제한 X, 암호화 적용이 쉽다.
  * 이미지 업로드, 글을 쓰는 요청에 해당

#### Post 요청 처리
* 요청 메시지: request.IncomingMessage
* Readable Stream
  * 이벤트: data, end
```JavaScript
var body = '';
req.on('data', function(chunk){  //바디를 모두 읽을때까지 계속 동작
    //전달되는 데이터 조각들을 모두 모으는 일종의 버퍼링 동작 수헹
    console.log('get $d bytes of data', chunk.length);
    body += chunk;
});

req.on('end', function(){  //바디를 모두 읽었을 때
    var parsed = querystring.parse(body);
    console.log('name: ' + parsed.name);
    console.log('there will be no more data');
    console.log('end: ' + body);
});
```

* Post 요청 후 Refresh -> 중복 Post 요청
  * 여러번 결제 요청 등 문제 발생 -> PRG 패턴

#### PRG 패턴
* 중복 POST 요청 방지
  * POST 요청 처리 후 redirect응답
  * PRG(Post-Redirect-Get) 패턴
  * 리프레쉬 - Get 요청 중복(OK)
> * Redirection : 클라이언트 주소 옮기기
>   * 상태 코드: 302
>   * 헤더 필드 : Location
>     * `res.writeHead(302, {'Location': 'http://google.com'})`

```JavaScript
//PRG패턴 적용
var buffer = '';
req.on('data', function(chunk){
    buffer += chunk;
});
req.on('end ', function(){
    //POST 요청 메시지 바디 분석/처리
    //바디 파싱
    var data = query.parse(buffer);
    var title = data.title;
    var director = data.director;

    if(에러 체크){

    }
    //목록 저장
    movieList.push({ title: data.title, director: data.director});

    //Redirect
    res.statusCode = 302;
    res.setHeader('Location', '.');
    res.end();
});
```

#### Multipart
* 사진 올리기, 글과 사진 올리기
* 메시지 바디 기록 방식
  * `multipart/form-data`
* 파트 구분 정보
  * `Content-Type: multipart/form-data; boundary=XXXYYYZZZ`
* 메시지 바디 내 파트 구성
  * 파트 구분자(--XXXYYYZZZ)
  * 파트 인코딩
  * 파트 내 정보

##### 메시지 바디 분석
* 각 파트 구분
* 파트별 구분

##### 컨텐츠 타입 분석 코드  
```JavaScript
// multipart/form-data; boundary=XXXYYYZZZ
var contentType = req.headers['content-type'];
var elements = contentType.split(',');
var firstElem = elements[0];  // multipart/form-data
var mainContentType = firstElem.split('/')[0];  //multipart

var secondElem = elements[1].trim();  // boundary=XXXYYYZZZ
var boundary = secondElem.split('=')[1];  // XXXYYYZZZ
```

##### 바디 분석
```JavaScript
var buffer = '';
req.on('data', function(chunk){
    buffer += chunk.toString();
});
req.on('end', function(){
    // boundary로 각 파트 구분
    var parts = buffer.split('--' + boundary);

    for(var i=0; i<parts.length; i++){
        //각 파트별 분석
    }

    res.end('Multipart EncType message');
});
```

##### Multipart 분석 모듈
* [formidable](https://github.com/felixge/node-formidable)
  * `npm install formidable`
* multer

##### formidable
* Formidable.IncomingForm - 요청 분석 클래스
  * 이벤트
    * field - 이름/값 도착 이벤트
    * file - 파일 도착 이벤트
    * aborted - 요청 중지(클라이언트)
    * end - 종료
  * 프로퍼티
    * form.uploadDir - 이름/값 도착 이벤트
    * form.keepExtension - 확장자 보존
    * form.multiples - 다중 파일 업로드
  * `form.parse(req, function(err, fields, files){})`
    * fields: 이름-값 데이터
    * files: 업로드 파일 정보
* Formidable.File - 업로드된 파일 정보
  * file.size - 업로드 된 파일의 크기(바이트)
  * file.path - 파일 경로
  * file.name - 파일 이름
  * file.type - 파일 타입
  * file.lastModifiedDate - 최종 변경일
  * file.hash - 해쉬값

#### 파일 업로드 서비스
* 파일 업로드(formidable) - 임시폴더
* 파일 업로드 후
  * 파일을 임시 폴더 -> 리소스 저장소로 이동
    * 파일 저장 비용이 싼곳, 빠르게 서비스가 가능한 CDN같은 곳
  * 리소스 저장소에서 이름이 충돌되지 않도록 이름 변경
    * 날짜, 일련번호, 사용자 계정, ...
```JavaScript
//업로드 파일 다루기
var image = files.image;
//확장자
var ext = pathUtil.parse(image.name).ext;
//확장자
var newImageName = 'image_' + RANDOM_STR;
//이미지 저장 경로로 이동
var newPath = __dirname + 'image/' + newImageName + ext;
fs.renameSync(image.path, newPath);
//이미지 경로 저장
var url = 'image/' + newImageName + ext;
//Todo: 경로 DB에 저장
```

---

## 모바일 서버
* 서버 구분
  * 웹 기반 서비스 서버
    * 웹 브라우저
    * 모바일 웹 브라우저
    * `www.server.com`
  * 모바일 앱을 위한 서버 - api 서버
    * 네이티브 앱
    * `api.server.com`
  * 차이
    * 화면 작성 방법
      * 웹 브라우저 - 서버가 제공한 HTML과 CSS이용해 화면을 렌더링한 결과
      * 모바일 앱 - 자체 UI

### 모바일 서버
* 자체 UI 구성
  * 문서구조와 렌더링 정보를 포함하는 HTML 불필요
* 데이터 표현 포맷
  * XML
  * JSON
* 화면 이동(내비게이션)은 모바일 앱(클라이언트)에서 담당
  * PRG패턴 불필요

### JSON(JavaScript Object Notification)
* 초기 JavaScript에서 사용하던 포맷
  * 프로퍼티 - 이름: 값 쌍으로 구성
  * `"greeting": "Dong"`
* 문서 크기가 작아 네트워크를 이용해 주고 받기 편함
* 데이터 타입
  * 숫자 - `3`
  * 문자열 - `"hello"`
  * 부울 - `true/false`
  * null - `null`
  * 배열 - `{}`
  * 객체 - `[]`
```JSON
//JSON객체
{
    "name": "Hello",
    "age": 11
    "arrayVal": [1, 2, 3]
    "nullVal": null
}

//JSON객체 내 객체
{
    "person": {
        "name": "hello"
    }
}
```

#### JSON 다루기
* `JSON모듈`
  * V8 내장 클래스, 모듈 로딩 불필요
* JSON 생성
  * `JSON.stringfy()`
* JSON 파싱
  * `JSON.parse()`
```JavaScript
var entry = {
    profile:{
        name: "dong",
        age: "std"
    }
};

var jsonStr = JSON.stringfy(entry);  //JSON 생성
console.log('stringfy ', jsonStr);
var parsed = JSON.parse(jsonStr);  //JSON 파싱
var profile = parsed.profile;
console.log('name ', profile.name);
console.log('age ', profile.age);
```

#### JSON요청과 응답
* JSON 요청
  * 요청 메시지의 바디에 기록된 JSON
  * 요청 객체(req)에서 바디 메시지 분석
  * `JSON.parse()`
* JSON 응답
  * 응답 메시지(res) 바디에 JSON 기록
  * 응답 데이터에서 JSON 생성
  * `JSON.stringfy()`
  * `Content-Type: application/json`
```JavaScript
//JSON 요청
function(req, res){
    var buffer = '';
    req.on('data', function(chunk){
        buffer += chunk;
    });
    req.on('data', function(){
        //JSON요청 바디 분석
        var parsed = JSON.parse(buffer);  //파싱
        res.end('JSON Request: ', parsed);
    });
}

//JSON 응답
function(req, res){
    var data = {
        name: "dong",
        age: 11
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringfy(data));
}
```

---

### XML(eXtensible Markup Language)
* markup언어: 메타 데이터로 문서구조 표현
  * 기계 해석 가능
  * HTML, XML
* 구성요소
  * tag
    * 시작 태그(start-tag) - <section>
    * 끝 태그(end-tag) - </section>
  * element - 논리 단위
  * attribute
    * 태그 내 key=value 형식
    * <step number="3">Connect</step>
  * 마크업, 내용

#### XML요청과 응답
* XML요청
  * XML에서 데이터 분석
  * XML 파싱
* XML분석
  * 데이터에서 XML만들기
* XML 파서 모듈
  * libxmljs
  * xml-stream
  * xmldoc
* XML파서 방식
  * DOM(Document Object Model) 파서
    * XML문서를 DOM구조로 변환, DOM구조를 이용해 내용에 접근
    * 각 분서의 요소를 객체화
      * 부모 노드
      * 자식 노드
      * 형제 노드
  ```JavaScript
  var libxmljs = require('libxmljs');

  //Dom Parsing
  var xmlDoc = libxmljs.parseXml(xml);

  var childern = xmlDoc.root().childNodes();
  var child = childern[0];
  console.log(child.attr('foo').value());
  ```
  * SAX 파서
  * PULL 파서
* XML응답
  * XML생성 모듈 - [data2xml](https://www.npmjs.com/package/data2xml)
    * `npm install data2xml`
  * 컨텐츠 타입
    * `application/xml`

---

## REST(Representational State Transfer) 서비스

### REST 아키텍처의 제한조건
* Client/Server 구조
  * 클라이언트의 요청과 서버의 응답 기반
  * REST 서버는 API 제공, 클라이언트는 사용자 인증, 컨텍스트(세션, 로그인정보)등을 직접 관리하는 구조로 구분하기 때문에 서로간의 의존성 감소
* Stateless
  * 클라이언트의 상태와 관계없이 요청만으로만 응답
  * 세션, 쿠키를 별도로 저장하고 관리X
  * 서버에서 불필요한 정보를 관리하지 않아 구현이 단순화
* Cacheable
  * 클라이언트는 서버의 응답을 캐시, 네트워크 비용 절감
* 계층화 시스템
  * 서버는 다양한 형태의 중간계층을 이용해 확장(ex. 로드 밸런싱, 프록시, 암호화 계층)
  * 클라이언트는 서버의 계층에 무관하게 통신
* Code on Demand
  * 리소스를 다룰 수 있는 코드 전송(ex. JavaScript)
* Uniform Interface(인터페이스 일관성)
  * 시스템 구조를 단순화시키고 작은 단위로 분리해서 독립적으로 개선하고 확장
* Self-descriptiveness(자체 표현 구조)
  * REST API메시지만 보고도 이해할 수 있어야 한다.

### 인터페이스 설계
* 간단하고 직관적인 API
  * 구성
    * 리소스에 접근하는 인터페이스 - URI
    * 리소스를 다루는 행위 - HTTP 메소드 사용
      * GET - 리소스 조회, 상세정보
      * POST - 리소스 생성
      * PUT - 리소스 수정
      * DELETE - 리소스 삭제
* API 버전
  * api.server.com/v1/items
* 명사용 단어 사용 권장
  * 목록 형태의 리소스를 다루는 API는 복수형 명사
* 목록에서 특정 조건으로 필터링 - 쿼리스트링
  * api.server.com/v1/items?year=2016&category=food

### 요청과 응답 메시지 설계
* 프로퍼티의 이름
  * 의미를 충분히 반영
  * 카멜 케이스
  * 예약어 사용하지 말것
* 요청 메시지 구조
* 응답 메시지 구조
  * 데이터와 보조 데이터 활용
  * 에러 발생시 에러 정보 제공
```JSON
//페이지네이션 사용, api.server.com/v1/items?start=10
{
    "totalItems": 100,
    "startIndex": 10,
    "itemsPerPage": 10,
    "data": [
        //데이터
    ]
}
```

---

### HTTP 클라이언트
* 클라이언트 요청
  * `http.request(options[, callback])`
  * `http.get(options[, callback])` - 바디없이 요청

---

### 웹 프로그래밍
* HTTP서버 기능은 `http`, `https` 모듈이 담당
* TCP/IP 기능은 `net` 모듈

#### 단순한 웹 서버 코드
```JavaScript
var http = require('http');

http.createServer(function(req, res){  //요청받을 때마다 실행되는 callback
    res.writeHead(200, {'Content-Type': 'text/plain'});  //상태코드, 응답 헤더 쓰기. 여러번 써서 헤더를 완성
    res.end('Hello World\n');  //모든 데이터를 쓰고나서 의무적으로 호출해 연결을 완료
}).listen(3000, '127.0.0.1');  //port listening

console.log('Server runnung at http://127.0.0.1:3000/');
```

#### 라우트
* `HTTP 동사`와 `URL`의 조합
```JavaScript
var http = require('http');

http.createServer(function(req, res){
    if(req.url == '/' && req.method == 'GET'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h2>index</h2>');
    }else if(req.url == '/login' && req.method == 'GET'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h2>login</h2>');
    }else{
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
    }
}).listen(3000);
```
