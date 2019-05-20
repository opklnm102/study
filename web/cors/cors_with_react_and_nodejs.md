# [Web] CORS with React and Node.js
> date - 2019.05.20  
> keyword - web, cors, react, node.js  
> 이론은 [Cross-Origin Resource Sharing](./cors.md)을 참고  
> 여기서는 Node.js에서의 방법만 정리  

<br>

## CORS header
* Express로 resource server를 구현했다면...?

```sh
$ npm install cors
```

* 모든 origin 허용
```js
var express = require('express');
var cors = require('cors');  // import cors library

var app = express();
app.use(cors());  // allow requests from any origin
```

* whitelist 허용
```js
var whitelist = ['http://a.com', 'http://bb.com'];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}

app.use(cors(corsOptions));
```


<br>

## 2. Proxy Server
* server를 수정할 수 없을 때 사용
```json
// package.json
{
  "proxy": "http://proxy-server.com"
  ...
}
```

* server run
```sh
$ npm run start
```


<br><br>

#### Reference
> * [Access-Control-Allow-Origin: Dealing with CORS Errors in React and Express](https://daveceddia.com/access-control-allow-origin-cors-errors-in-react-express/)
> * [Proxying API Requests in Development](https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development)
