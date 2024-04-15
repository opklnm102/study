# [HTTP] Transfer-Encoding
> date - 2024.04.15  
> keyword - http, transfer encoding  
> Transfer-Encoding http header에 대해 정리  

<br>

## Content-Length
* server는 Content-Length header로 전달하고자하는 data size를 알려준다

<br>

### Flow
1. client는 server에 data를 요청
2. server는 응답할 data size 계산
3. server는 client에 data size와 함께 data 전달


<br>

## Transfer-Encoding
* 효율적으로 client에게 data를 전달하기 위해 encoding 형식을 지정
* [hop-by-hop header](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers#hbh)로 data 자체가 아닌 node 사이의 메시지에 적용
* 전체 연결에 있어서 data를 압축하고자 한다면 end-to-end header인 Content-Encoding 사용

| Directives | Description |
|:--|:--|
| chunked | data를 chunk 단위로 나누어 전달<br>streaming 방식의 data 전송<br>Content-Length 없이 전달하므로 large scale data 전달시 효율적<br>16진수의 chunk size가 오고 그 뒤에 `/r/n`가 오고 다음에 chunk data가 오며 그 뒤에 다시 `/r/n`이 온다<br>마지막 chunk는 길이가 0
| compress | LZW(Lempel-Ziv-Welch) 알고리즘을 사용하여 전달 |
| deflate | deflate([RFC 1951](https://datatracker.ietf.org/doc/html/rfc1952)에 정의) 알고리즘을 사용하여 전달 |
| gzip | gzip 형태로 전달 |
| identity | 압축 없이 전달 |

<br>

### Example
* Chunked encoding
```
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

7\r\n
Mozilla\r\n
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n
\r\n
```

<br>

### 압축하여 전송하는 경우
* 압축 및 chunk encoding이 모두 활성화된 경우
```
Content-Encoding: gzip
Transfer-Encoding: chunked
```
* 압축 후 chunk로 나누어 전달 -> chunk를 모두 받은 후 연결 -> 압축 해제하여 stream을 decoding


<br><br>

> #### Reference
> * [Transfer-Encoding](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Transfer-Encoding)
> * [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)
