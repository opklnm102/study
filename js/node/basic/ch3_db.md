# Ch3. DB

## [MongoDB](https://www.mongodb.com/)
* NoSQL DB
* 도큐먼트 기반의 데이터

```sh
$ mongo  #mongoDb shell open

> db  #현재 DB이름 출력

> use <db name>  #DB 전환

> show dbs  #사용 가능한 모든 DB 출력

> show collections  #사용 가능한 컬렉션 출력
```

### 데이터 삽입
```sh
> db.people.insert({name: 'Mark'})  #people 컬랙션에 데이터 추가
```

### 데이터 검색
```sh
> db.people.find()  #people 컬랙션의 모든 항목 검색

> db.people.find({name: {$regex: '^Bill'}})  #find()에 검색 기준 적용

> db.people.findOne({name: {$regex: '^Georeg'}})  #결과 1개 반환

> db.people.find().limit(2)  #결과집합 크기 2로 제한
```

### 데이터 갱신
* update(질의 객체, 갱신되어야하는 값, 옵션객체)
* 옵션 객체
  * upsert - 질의 기준에 맞는 기존 항목없을 경우 새로운 문서 생성(default. false)
  * multi - 질의 기준과 일치하는 모든 문서 변경(default. false)
  * writeConcern - 갱신의 쓰기 동작 정의.

```sh
# update()를 사용해 기존 데이터 변경
> db.people.update({name: 'Bill'}, {$set: {name: 'Will', terms: 2}})
# WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
# 일치 문서 1개, 갱신되었지만, 갱신할 대상을 찾지 못해 새로 삽입된 문서는 없다.
```

### 데이터 삭제
* remove(질의 객체, 옵션객체)
* 옵션 객체
  * justOne - 삭제가 하나의 문서로 제한
  * writeConcern - update()의 옵션과 같다.

```sh
> db.people.remove({name: {$regex: 'Mark$'}}, {justOne: ture})
```

### 컬렉션 삭제
```sh
> db.people.drop()
```

### DB 삭제
```sh
## use 명령으로 올바른 DB를 사용하고 있는지 확인
> db.dropDatabase()
```

### MongoDB 모듈
* mongodb - MongoDB Nodejs Driver
* Mongoose - ODM

## MonngoDB Driver
* mongo 콘솔 클라이언트 명령과 동일하게 조작
* https://docs.mongodb.com/ecosystem/drivers/node-js/#rd-party-drivers
* 설치
  * `npm install mongodb`

### DB 얻기와 연결
```JavaScript
var MongoClient = require('mongodb').MongoClient;  //DB얻기
var url = 'mongodb://127.0.0.1:27017/DATABASE';

MongoClient.connect(url, options, function(err, database){  //연결
    console.log('MongoDB 연결 성공');
});
```

### 콜렉션
* MongoDB에서 데이터 다루기 - 콜렉션 기반
  * `db.COLLECTION.insert`
  * `db.COLLECTION.find...`
* 콜렉션 얻기
  * `db.collection(name, options, callback) -> Collection`
```JavaScript
db.collection('movie').find(...);

var movies = db.collection('movies');
movies.insert(....);
```

### 도큐먼트 추가
* 콜렉션에 도큐먼트 추가
  * `insert(docs, options, callback)`
  * `insertMany(docs, options, callback)`
  * `insertOne(doc, options, callback)`
* 결과 처리
  * callback으로 결과 얻기
  * Promise기반, 반환값이 Promise. callback 사용 X
```JavaScript
// callback기반
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/DATABASE';

MongoClient.connect(url, function(err, db){
    var movies = db.collection('movies');
    movies.insert(
        {title: '인터스텔라', director: '크리스', year: 2014},
        function(err, result){
            //에러처리
            var result = {
                result: 'success',
                newId: result.insertedIds[0]
            };
            res.json(result);
            db.close();
        }
    );
});

// Promise기반
MongoClient.connect(url, function(err, db){
    var movies = db.collection('movies');
    movies.insert({title: '인터스텔라', director: '크리스', year: 2014}).then(
    function(result){
        console.log(result);
    }, function(err){
        console.log(err);
    });
});
```
* 결과
  * result - MongoDB의 insert결과
  * ops - `_id`를 포함한 새로 추가된 도큐먼트 정보
  * connection - insert()가 동작한 연결정보
```JSON
{ result: {ok: 1, n: 1},
    ops:[{ title: 'movie title', director: 'dddfd',
        _id: 5454444444454cce2f3ggd}],
    insertedCount: 1,
insertedIds: [343453j4343434j3434n3434]
}
```

### 도큐먼트 찾기
* 찾기
  * `find(query) -> Cursor`
  * `findOne(query, options, callback)`
* find()의 결과 - Cursor
  * `each()`, `forEach()` - 결과 도큐먼트를 순회
  ```JavaScript
  var cursor = collection.find(...);
  cursor.forEach(function(doc){
      //도큐먼트 다루기
  }, function(err){
  });
  ```
  * `toArray()` - 도큐먼트의 배열 변환

```JavaScript
MongoClient.connect(url, function(err, db){
    //Todo: 커넥션 에러 처리

    //콜렉션 얻기
    var movies = db.collection('movies');

    //2000년 이후 영화 검색
    movies.find({ year: {$gt:2000}}).toArray(function(err, docs){
        for(var i=0; i<docs.length; i++){
            var doc = docs[i];
            console.log('title: ', doc['title'], 'director: ', doc['director']);
    });
});
```

### Projection, 도큐먼트 갯수
* Projection
  * 출력 필드 필터링
  * 1 - 출력, 0 - 출력 안함
  * `collection.find({ type: 'food'}, {item: 1, qty: 1, _id: 0}).toArray(...)`
* 도큐먼트 갯수
  * `db.collection.count(query, options, callback)`

### ID 다루기
* 도큐먼트 id - MongoDB의 도큐먼트 식별 정보
  * 문자열과는 다르다.
  * ObjectID 객체를 사용해야 한다.
```JavaScript
//문자열 타입 -> 실패
movies.findOne({_id: '563545j45jk4jk5454545j54j4j5'});

//_id -> ObjectID 타입으로 다루기
var ObjectID = require('mongodb').ObjectID;
movies.findOne({_id: new ObjectID(objectIDstr)});
```

### 수정
* `update(selector, document, options, callback)`
* `updateMany(filter, update, options, callback)`
* `updateOne(filter, update, options, callback)`
* 옵션
  * multiple - update()의 경우 1개만 수정. 다중변경 옵션: {multiple: true}
  * upsert - insert or update 동작
* 결과
  * callback 사용
  * Promise로 사용. 반환값 Promise. callback 사용 안함
```JavaScript
var movies = db.collection('movies');
movies.updateOne(
    { title: '스타워즈'},
    { $set: { title: 'StarWars'}}, function(err, result){
        //결과 처리
});

//Update Multi Option, Promise Based
movies.update(
    { director: '크리스'},
    { $set: { director: 'Chris'}}, { multi: true}).then(
    function resolved(results){
        console.log('Update Success. ', results);
    },
    function rejected(err){
        console.error('Update Error. ', err);
    });
```

### 삭제
* `deleteMany(filter, options, callback)`
* `deleteOne(filter, options, callback)`
```JavaScript
var movies = db.collection('movies');
movies.deleteOne({ title: '스타워즈'}, function(err, result){
    //결과 처리
});

//Promise 기반
movies.deleteMany({ director: '크리스'}).then(resolved, rejected);
```

---

## Mongoose 모듈
* ODM - Object Document Mapper
* 스키마 기반

### Install
```sh
$ npm install --save mongose
```

### 고려 사항
* DB 연결
* 스키마 정의
* 스키마에서 모델
* 모델을 이용해서 데이터 다루기

### 연결
```JavaScript
var mongoose = require('mongoose');
var url = 'mongodb://127.0.0.1:2701/Moviest';
var db = mongoose.connect(url);

db.on('error', function(err){});
db.once('open', function(){});
```

### 스키마
* 문서, 컬랙션으로 매핑하기 위한 토대
  * RDBMS의 테이블 구조 정의와 비슷
* 모델을 생성하기 위한 규칙과 명령의 집합
* key-value 쌍
  * key - 속성 이름
  * value - Mongoose SchemaType
* 문서를 DB에서 검색시, Mongoose는 값을 연관된 SchemaType으로 변환해 모델객체로 반환
* 스키마 정의 소스는 별도의 모듈로 분리해서 작성할 수 있다.
* SchemaType
  * String(문자열)
  * Number(숫자)
  * Date(날짜)
  * Buffer(버퍼)
  * Boolean(부울)
  * Mixed(혼합)
    * 와일드카드
    * Mixed로 열거된 SchemaType을 사용하면 어떤 값도 연관지을 수 있다.
    * 대신 유지보수가 어렵다.
  * ObjectId(객체 식별자)
    * 유일한 식별자를 메모리에 저장하게 허용
  * Array(배열)

#### Schema 예제
```JavaScript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;  

//Schema는 스키마를 기술하는 key-value 쌍 객체를 받는 생성자
var TeamSchema = new Schema({  //team이름만 저장하기 위해 정의
    name: {
        type: String,
        required: true  //필수
    }
});

var EmployeeSchema = new Schema({
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    team: {  //다른 문서/스키마에 대한 참조를 생성하는 수단
        type: Schema.Types.ObjectId,  //유일한 식별자
        ref: 'Team'  //DB에서 채워질 때 사용할 모델
    },
    image: {
        type: String,
        default: 'images/user.png'
    },
    address: {
        lines: {
            type: [String]  //문자열 배열
        },
        postal: {
            type: String
        }
    }
});
```

### Mongoose 모델
* MongoDB에서 문서를 표현
* 질의를 수행하면 결과 문서는 적절한 스키마를 통해 주입되며 모델이 반환되어 사용준비가 끝난다.
* Mongoose로 작업할 경우 대다수 시간을 스키마 대신 모델과 상호작용

### 모델에서 도큐먼트 생성
* Model의 create() - 모델에서 객체 생성 없이 사용
* save() 사용 불필요
* 결과 - callback, Promise

### 도큐먼트 추가
* 모델에서 도큐먼트 생성
```JavaScript
var avata = new Movie({ title: '인터스텔라', director: '크리스', year: 2014});
```
* DB에 반영
```JavaScript
Model#save([options] [, options.safe] [, options.validateBeforeSave] [,fn]);
```
* callback
  * `avata.save(function(err, product){})`
```JavaScript
var movie = new Movie({ title: '인터스텔라', director: '크리스', year: 2014});
movie.save(function(err, priduct, numAffected){
    //에러 처리
    console.log('Document Save success: ', product, numAffected);
});
```
* Promise
  * `avata.save().then(resolved, rejected)`
```JavaScript
var movie = new Movie({ title: '인터스텔라', director: '크리스', year: 2014});
movie.save().then(function(product){
    //결과 처리
}, rejected(err){
    //에러 처리
});
```

### 찾기
* `Model.find(conditions, [projection], [option], [callback])`
* `Model.findById(id, [projection], [option], [callback])`
* `Model.findOne([conditions], [option], [callback])`
* 결과
  * callback
  * Promise
```JavaScript
//callback
Movie.find({ year: {$gt: 2010}},
function(err, docs){
    console.log(docs);
});

//promise
Movie.findOne({ title: '인터스텔라'}).then(
    function(doc){
        console.log(doc);
    },
    rejected
);
```

### 수정
* 모델의 update()
* 결과 - callback, promise
```JavaScript
//promise
Movie.update({ director: '크리스'}, {$set: {director: 'Chris'}}).then(resolved, rejected);
```
* 개별 도큐먼트 객체에서 수정 후 저장
```JavaScript
Movie.findOne({ title: '아바타'}).exec(function(err, doc){
    doc.title = 'Avata';
    //callback
    doc.save(function(err, project){});
});
```

### 삭제
* 모델
```JavaScript
//promise
Movie.remove({ director: '크리스'}).then(resolved, rejected);
```
* 개별 도큐먼트에서 삭제
```JavaScript
Movie.findOne({ title: '아바타'}).exec(function(err, doc){
    doc.title = 'Avata';
    //callback
    doc.remove(function(err, product){
        console.log('Find and Remove: ', err, product);
    });
});
```

### Example
#### 팀을 DB에 추가
```JavaScript
var db = mongoose.connection;
var dbUrl = 'mongodb://127.0.0.1:27017/db';

var TeamSchema = new Schema({  //team이름만 저장하기 위해 정의
    name: {
        type: String,
        required: true  //필수
    }
});
var EmployeeSchema = new Schema({
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    team: {  //다른 문서/스키마에 대한 참조를 생성하는 수단
        type: Schema.Types.ObjectId,  //유일한 식별자
        ref: 'Team'  //DB에서 채워질 때 사용할 모델
    },
    image: {
        type: String,
        default: 'images/user.png'
    },
    address: {
        lines: {
            type: [String]  //문자열 배열
        },
        postal: {
            type: String
        }
    }
});

var Team = mongoose.model('Team', TeamSchema);  //Team 모델을 생성시 TeamSchema를 따른다.
var Employee = mongoose.model('Employee', EmployeeSchema);

//팀 추가
function insertTeams(callback){

    //team 하나를 추가
    var team = new Team({
        name: 'Dev A'
    });

    team.save(function(error, data){
        if(error){
            console.log(error);
        }else{
            console.dir(data);
        }
        db.close();
        process.exit();
    });

    //여러 팀 추가
    Team.create({  //단일 명령으로 여러 문서를 새롭게 생성하게 도와준다.
        name: 'Dev B'
    }, {
        name: 'Dev C'
    }, function(error, devB, devC){
        if(error){
            return callback(error);
        }else{
            console.info('teams successfully added');
            callback(null, devB, devC);
        }
    });
}

function insertEmployees(devB, devC, callback){
    Employee.create({
        name: {
            first: 'Jhon',
            last: 'Adams'
        },
        team: devB._id,
        address: {
            lines: ['2 aaa bbb'],
            postal: '12143'
        }
    },{
        name: {
            first: 'Mark',
            last: 'Adams'
        },
        team: devC._id,
        address: {
            lines: ['3 aaa bbb'],
            postal: '32143'
        }
    }, function(error, john){
        if(error){
            return callback(error);
        }else{
            console.info('Employees successfully added');
            callback(null, {
                team: devB,
                Employee: john
            });
        }
    });
}

db.on('error', function(){
    console.log('there was an error communicating with the database');
});

mongoose.connect(dbUrl, function(err){
    if(err){
        return console.log('there was a problem connecting to the database ' + err);
    }

    console.log('connected!');

    insertTeams(function(err, devB, devC){
        if(err){
            return console,log(err);
        }
        insertEmployees(devB, devC, function(err, result){
            if(err){
                console.error(err);
            }else{
                console.info('database activity complete');
            }

            db.close();
            process.exit();
        });
    });
});
```

#### 단순 질의
```JavaScript
//id로 검색
function findEmployee(data, callback){
    Employee.findOne({
        _id: data.employee._id  //_id가 동일한 하나만 찾기
    }).populate('team')  //채워넣기 원하는 추가 문서 기술
    .exec(function(error, result){
        if(error){
            return callback(error);
        }else{
            console.log('*** single Employee Result ***');
            console.dir(result);
            callback(null, data);
        }
    });
}

//이름으로 검색
function findEmployeeWithName(data, callback){
    Employee.find({
        'name.first': /J/i  //J로 시작하는 모든 데이터 찾기
    }, function(error, results){
        if(error){
            return callback(error);
        }else{
            console.log('*** Multiple Employees Result ***');
            console.dir(results);
            callback(null, data);
        }
    });
}

insertEmployees(devB, devC, function(err, result){

    findEmployee(result, function(err, result){
        if(err){
            console.error(err);
        }else{
            console.info('database activity complete');
        }

        db.close();
        process.exit();
    });
});
```

#### 갱신
```JavaScript
function updateEmployee(first, last, data, callback){
    console.log('*** Changing names ***');
    console.dir(data.employee);

    var employee = data.employee;
    employee.name.first = first;
    employee.name.last = last;

    employee.save(function(error, result){
        if(error){
            return callback(error);
        }else{
            console.log('*** Changed name to xxx ***');
            console.log(result);
            callback(null, data);
        }
    });
}

findEmployee(result, function(err, result){
    updateEmployee('Andrew', 'Jackson', result, function(err, result){
        if(err){
            console.error(err);
        }else{
            cnosole.info('database activity complete');
        }

        db.close();
        process.exit();
    });
});
```

---

## mysql 모듈 - [node-mysql](https://github.com/mysqljs/mysql)
```sh
$ npm install mysql
```

### MySQL에 연결
```JavaScript
var mysql = require('mysql');
var connection = mysql.createConnection('mysql://user:secret@localhost:3306/dbname');

var dbConfig = {
    host: '',  //주소
    port: 3306,  //포트
    user: 'user',  
    password: 'secret',
    database: 'dbname',
    multipleStatements: false,  //동시에 여러 SQL실행, 보안에 주의
    connectTimeout: ''  //DBMS연결 타임아웃 시간(default, 10,000ms)
}
var connection = mysql.createConnection(dbConfig);

connection.connect(function(err){  //연결
    if(err){
        return console.error(err.message);
    }

    console.log('successfully connected!');
    connection.end();  //연결 종료
});
```

---

### Connection Pool
* 다수의 커넥션 관리 기법
* 풀에서 커넥션 얻어서 사용하고 반납
```JavaScript
var mysql = require('mysql');

var pool = mysql.createPool({  //풀 생성
    host: 'localhost',
    user: 'username',
    password: 'secret',
    database: 'dbname',
    connectionLimit: 20,  //풀의 최대 크기. default: 10
    queueLimit: 100,  //연결 백로그 큐의 최대크기. default: 무제한
    waitForConnections: true  //사용 가능한 연결이 없을 경우 요청은 큐에 추가
});

pool.getConnection(function(err, connection){  //풀에서 커넥션 얻기
    if(err){
        return console.error(err.message);
    }

    console.log('successfully obtained connection!');

    //풀을 사용할 경우
    connection.release();  //연결을 풀에 반환
    connection.destroy();  //연결을 끊고 풀에서 제거

    //풀을 사용하지 않을 경우
    end();  //큐에 쌓인 질의가 수행될 수 있도록 연결을 닫는다.
    destroy();  //기반 소켓을 즉시 내려 현재 진행 중인 모든 작업 중단
});
```

---

### 커넥션 모듈 분리
* DB 커넥션 모듈
```JavaScript
// dbConnection.js
var mysql = require('mysql');
var dbPool = mysql.createPool(dbConfig);
module.exports = dbPool;
```
* 사용
```JavaScript
// app.js
var pool = require('./dbConnection');
pool.getConnection(function(err, conn){});
```

---

### 질의 수행
* sql 실행
  * `connection.query(sql, callback)`
* callback 형태
  * `function(error, results, fields)`

```JavaScript
var mysql = require('mysql');
var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'sample'
 });

pool.getConnection(function(err, connection) {
  if (err) {
    return console.error(err.message);
  }

  var insertSql = 'INSERT INTO Presidents (Name, Terms) VALUES' +
                '(\'Bill Clinton\', 2),' +
                '(\'George W Bush\', 2);';

  connection.query(insertSql, function(err, results) {
    if (err) {
      connection.release();
      return console.error(err.message);
    }

    var selectSql = 'SELECT * FROM Presidents';

    connection.query(selectSql, function(err, results) {
      if (err) {
        connection.release();
        return console.error(err.message);
      }

      console.log('results of SELECT:');
      console.log(JSON.stringify(results, null, 2));

      var dropSql = 'DROP TABLE IF EXISTS Presidents';

      connection.query(dropSql, function(err, results) {
        connection.release();

        if (err) {
          return console.error(err.message)
        }

        console.log('table dropped!');
      });
    });
  });
});
```

#### PlaceHolder
```JavaScript
var insertSql = 'INSERT INTO Presidents (Name, Terms) VALUES (?, ?, ?);';
connection.query(insertSql, ['dong', 'a'], function(err, results){
    //에러, 결과 처리
    connection.release();
});

var data = {
    name: 'dong',
    terms: 'a'
};
var insertSql = 'INSERT INTO Presidents SET ?';
connection.query(insertSql, data, function(err, results){
    //에러, 결과 처리
    connection.release();
});
```

---

### 실행 결과
* affectedRow - 영향을 받은 열의 갯수
* insertID - 새로 추가한 경우 Primary Key
* changedRow - 변경된 열의 수

---

### SQL Injection
* 입력
  * 1";drop table user; #
* 실행되는 SQL
  * OTHER SQL;drop table user; #"
* 단순 문자열 덧붙이기와 다중 SQL구문 실행 환경이라는 조건이 맞으면, 테이블 삭제 현상 발생

#### SQL Injection 방지
* `mysql.escape()` - SQL관련 문자 변경
* PlaceHolder 사용

### 실행과 커넥션 닫기
* query는 비동기 동작
* 커넥션 닫기(반환)은 query의 콜백 함수 내부에
```JavaScript
pool.getConnection(function(err, conn){
    conn.query('SELECT...', function(err, rows){
        //결과 사용
        conn.release();
    });
});
```

### 트랜잭션
* `conn.beginTransaction(callback(err){})`
* `conn.commit()` - 트랜잭션 내 변경 확정
* `conn.rollback()` - 트랜잭션 내 변경 되돌리기
* 사용
```JavaScript
//callback 중복이 많아져 복잡하므로 흐름제어 모듈을 적절히 사용!!
conn.beginTransaction(function(err){
    conn.query(sql1, function(err, result){
        if(err){
            //에러
            conn.rollback();
            return;
        }
        conn.query(sql2, function(err, result){
            if(err){
                //에러
                conn.rollback();
                return;
            }
            //성공
            conn.commit();
        });
    });
});
```

---

## Sequelize
* ORM - 객체와 모델의 매핑
  * SQL 직접 다루기 - SQL 작성 실행
  * ORM - 모델을 이용한 값 저장과 변경
* 자원 DB - PostgreSQL, MySQL, MariaDB, SQLite, MSSQL
* Promise 기반
* 설치
  * `npm install sequelize`

---

### Sequelize 사용하기
* DB 연결 설정
* 모델 설정
* 모델을 이용해서 데이터 저장
* 모델에서 데이터 얻어오기
* 모델을 이용해서 데이터 수정/삭제

---

### DB 연결 설정
* `new Sequelize(uri[, options={}])`
* `new Sequelize(database [, username=null] [, password=null] [, options={}])`
* 옵션
  * dialect - DB종류(ex. dialect='mysql')
  * host, port - DB서버 주소, 포트
  * pool - 커넥션 풀 설정
```JavaScript
var Sequelize = require('sequelize');
//var sequelize = new Sequelize('dbname', 'user', 'password');  //local

var sequelize = new Sequelize('dbname', 'user', 'password', {  //remote
    dialect: 'mysql',
    host: 'xxxxxx.com',
    port: 3306,

    pool: {  //connection pool config
        max: 10,
        min: 0,
        idle: 10000
    },
});
```

---

### 모델
* SQL 구문 작성 대신 모델을 이용
* 정의
  * `sequelize.define('name', {attributes}, {options})`
  * 정의된 모델은 DB의 테이블
* 모델에서 실제 DB의 테이블 생성/삭제
  * sync() -> Promise.<this>
  * drop([options]) -> Promise
* 동작 결과 - Promise 반환
  * `Promise.then(resolved, rejected)`
* 데이터 타입
  * Sequelize.STRING  // VARCHAR(255)
  * Sequelize.STRING(1234)  // VARCHAR(1234)
  * Sequelize.TEXT  // TEXT
  * Sequelize.INTEGER  
  * Sequelize.FLOAT  
  * Sequelize.DATE  // DATETIME for ymsql
  * Sequelize.BOOLEAN

---

### 모델 정의, 테이블 생성
* 테이블 - movie
```JavaScript
//모델 정의
var Movie = sequelize.define('movie', {
    title: { type: Sequelize.STRING },
    director: { type: Sequelize.STRING },
    year: { type: Sequelize.INTEGER },
    synopsis: { type: Sequelize.STRING(1024) }
});

Movie.sync().then(resolved, rejected);  //생성
```

---

### 데이터 저장
* `create(values [, options]) -> Promise.<instance>`
  * SQL의 INSERT에 해당
```JavaScript
Movie.create({
    title: '아바타',
    director: '제임스 카메론',
    year: 2010
}).then(resolved, rejected);
```

---

### 데이터 찾기
* 찾기
  * `findAll([options]) -> Promise.<Array.<instance>>`
  * `findById([options]) -> Promise.<instance>`
  * `findOne([options]) -> Promise.<instance>`
  * `findAndCount([findOptions]) -> Promise.<Object>`
* 갯수
  * `count([options]) -> Promise.<integer>`
* 필드 - attribute
* 조건 - where
```JavaScript
Model.findAll({
    attribute: [attr1, attr2, attr3],  //결과로 얻어올 attribute
    where: {  //조건
        attr1: value1,  // attr1 = value1
        attr2: value2
    }
});
```
* 오퍼레이터
  * $gte, $gt, $lte, $lt
  * $ne, $in, $not
  * $and, $or ...
```JavaScript
// 모든 영화 정보 중에서 title, director만 조회
Movie.findAll({
    attributes: ['title', 'director']
});

// director는 제임스 카메론, year>2000에 해당하는 정보 조회
Movie.findAll({
    where:{
        director: '제임스 카메론',
        year: {$gt: 2000}
    }
}).then(function(results){
    for(var i=0; i<results.length, i++){
        var item = results[i];
        console.log('id: ', item.id);
        console.log('title: ', item.title);
    }
}, rejected);
```

---

### 데이터 수정
* update - Options의 where는 필수
  * `update(values, options) -> Promise.<Array.<affectedCount, affectedRows>>`
* upsert - insert or update
  * `upsert(values [, options]) -> Promise.<created>`
```JavaScript
Movie.update({
    synopsis: '시놉시스'
}, {
    where: {}
}).then(resolved, rejected);
```

---

### 데이터 삭제
* `destroy(options) -> Promise.<Integer>`
```JavaScript
Movie.destroy({
    where:{}
}).then(resolved, rejected);
```
