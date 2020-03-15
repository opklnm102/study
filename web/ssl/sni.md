# [SSL] SNI(Server Name Indication)
> date - 2020.03.15  
> keyword - ssl, tls, sni  
> Nginx에서 HTTPS를 사용하는 backend로 reverse proxy setting시 겪은 SNI error로 인해 SNI에 대하여 정리  

<br>

## SNI(Server Name Indication)
```
Server Name Indication extension
  Server Name list length: 27
  Server Name Type: host_name(0)
  Server Name length: 11
  Server Name: example.com
```
* **TLS(Transport Layer Security) networking protocol extension**
* SSL/TLS handshaking 초기에 client가 **어떤 host name에 접속하려는지 server에 알리는 역할**을 한다
  * client와 server간 암호화 연결을 만들기 전에 **SSL/TLS handshaking** 수행
  * client가 server에 **이것이 내가 certificate를 원하는 도메인입니다**라고 지정할 수 있도록 도와주는 것, 그러면 server가 올바른 certificate를 선택하여 응답
* 같은 IP address, TCP port를 가진 서버로 여러개의 certificate를 사용할 수 있게 된다
  * 같은 certificate를 사용하지 않아도 동일한 IP에 여러 TLS 상의 서비스(e.g. HTTPS Web Site)를 운영 가능
  * 하나의 IP에 하나의 certificate만 사용해야 한다는 제약을 SNI로 해결
* 개념적으로 HTTPS 통신에 쓰인다는 것을 제외하고는 **HTTP/1.1의 named base virtual host와 동일**
* host name은 암호화되지 않기 때문에 사용자가 어디에 접속하는지 감청할 수 있다
  * TLS 1.2 handshaking 시 public key shared 전부터 전송되므로...
  * TLS 1.3부터 SNI 암호화 지원
    * [Encrypted Server Name Indication for TLS 1.3](https://tools.ietf.org/html/draft-rescorla-tls-esni-00)
* 최신 web browser는 SNI extension을 지원


<br><br>

> #### Reference
> * [Server Name Indication - Wikipedia](https://en.wikipedia.org/wiki/Server_Name_Indication)
