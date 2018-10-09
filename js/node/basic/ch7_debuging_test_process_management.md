# Ch7. Debuging, Test, Process Management

## Debuging

### 로그 메시지 출력
* 콜솔
  * `console.log('일반 로그')`
  * `console.info('정보성 로그')`
  * `console.warn('경고용 로그')`
  * `console.error('에러 로그')`

### 로그 외 디버깅
* 코드 단계 별 동작 확인
* 실행 멈춤 - 브레이크 포인트
* 특정 시점에서의 스택 상황
* 스코프 내 변수의 값 확인

### 디버깅 모드로 동작
* `node --debug`
* `node --debug-brk`
  * 소스코드 처음부분에 자동으로 브레이크 포인트가 걸림
```sh
$ node --debug server.js
```

### [Node-Inspector](https://github.com/node-inspector/node-inspector)
* Webkit 기반으로 Node.js App 동작 디버깅
```sh
$ npm install -g node-inspector
```
* 디버깅 시작하기
  * `node --debug[-brk] app.js`
  * node-inspector 실행, url 복사
  * 브라우저로 url 열기
* 실행정보
  * CallStack
  * Variables
  * Breakpoints

---

## Test
* 테스트 코드 작성
  * 코드로 테스트하기
  * 테스팅 자동화
* 테스트 모듈
  * assert
  * should
  * mocha

### assert 모듈
* 기본 모듈. 별도 설치X
* `var assert = require('assert')`

#### 테스트하기
* 참 테스트
  * `assert.ok(value[, message])`
```JavaScript
// 값이 0인경우 false 취급되니, assert(value == 0)으로 테스트
var trueValue = true;
assert(trueValue);
assert.ok(trueValue, '참 판단');
```
* 동등 테스트
  * `assert.equal(actual, expected [, message])` - 같은 객체 비교
  * `assert.deepEqual(actual, expected [, message])` - 내용(==) 비교
  * `assert.strictEqual(actual, expected [, message])` - 객체 타입 + 내용(===) 비교.
```JavaScript
var intVal = 9;
assert.equal(intVal, 9, 'equal 9');
assert.equal(intVal, '9', 'equal 9');
assert.deepEqual(intVal, '9', 'deepEqual 9');
assert.strictEqual(intVal, '9', 'strictEqual 9');  //AssertionFail

```
* 에러 발생
  * `assert.throws(block[, error][, message])`
  * AssertionError 발생
  * 실행 멈추고 실패 메시지 출력

### [should](https://www.npmjs.com/package/should)
* `npm install should`
* BDD(Bahavior Driven Development) 방식의 assert 작성
```JavaScript
var intVal = 5;
intVal.should.ASSERT

//assert 함수
.eql(otherValue);  // ==
.equal(otherValue);  // ===
.startWith(str);
.endWith(str);

//체인방식
.be.ok
.be.type(str);
.have.properties(propName1, propName2);
var strVal = 'Hello';
strVal.should.startWith('H').and.endWith('o');

//값 비교
var intVal = 5;
intVal.should.equal(5);
intVal.should.equal(4);  //실패
var strVal = 'Hello';
strVal.should.equal('Hello');
```

### [mocha](https://mochajs.org/)
* `npm install -g mocha`
* 테스트 자동화와 리포팅
* TDD, BDD
* 다른 Assert 라이브러리와 결합 사용
* 테스트 동작
  * `$ mocha test.js`
  * 테스트 코드 폴더 -> `/test`
  * `$ mocha` - test폴더 내 모든 테스트 동작

#### BDD 테스트 작성
```JavaScript
describe('Calculator', function(){
    it('should add', function(){
        //assertion
        assert.equal(value, expected);  //assert와 사용
    });
    it('should minus', function(){
        //assertion
        value.should.equal(expected);  //should와 사용
    });
});

//비동기 함수 테스트
it('async task spec3', function(done){
    asyncApi(value, function(){
        value.should.equal(expected);
        done();  //test 종료
    });
});
```

* hook
  * 모든 테스트 시작 전, 테스트 종료 후
    * `before(function(){})`
    * `after(function(){})`
  * 개별 테스트 시작 전, 개별 테스트 종료 후
    * `beforeEach(function(){})`
    * `afterEach(function(){})`
* BDD 인터페이스
```JavaScript
describe('Calculator', function(){
    var calculator;

    before(function(){
        calculator = new Calculator();
    });

    after(function(){});
    beforeEach(function(){});
    afterEach(function(){});

    //tests
    it('should add two value', function(){});
});
```

#### TDD 기반
* suite, test
```JavaScript
suite('SUITE NAME', function(){
    test('UNIT TEST', function(){
        assert.equal(...);
    });
});
```
* hook
  * suiteSetup, setup - 전
  * suiteTeardown, teardown - 후
* 테스트 동작
  * `$ mocha -u tdd TESTCODE.js`

* TDD 인터페이스
```JavaScript
suite('Calculator', function(){
    var calculator;

    suiteSetup(function(){
        calculator = new Calculator();
    });

    suiteTeardown(function(){});
    setup(function(){});
    teardown(function(){});

    test('Add', function(){
        var value = calculator.add(1, 2);
        assert.equal(value, 3, '1 + 2 = 3');
    });

    test('Minus', function(){

    });
});
```

---

## Process Management
* 콘솔로 서비스 실행
  * 콘솔 종료하면 애플리케이션 종료

### forever
* 콘솔 종료와 관계없이 애플리케이션 계속 실행
* 크래쉬 -> 자동 재실행
* `npm install -g forever`
```sh
$ forever start server.js  //시작
$ forever stop [uid]  //개별 종료
$ forever stopall  //모두 종료
$ forever list  //동작중인 앱 리스트
```

---
