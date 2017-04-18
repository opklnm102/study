# SSH Tunneling(= SSH Forwarding)
* ssh접속을 이용해 다른 프로그램이 안전하게 사용할 수 있도록 port forwarding을 해주는 것
* ssh를 이용하여 암호화 접속을 조금 더 안전하게 접속할 수 있다

## SSH(Secure Shell)
* 네트워크 보안에 있어 대중적이고 강력한 접근 방식을 제공하기 위해 만들어진 프로토콜

### 제공하는 기능
1. 인증(Authentication)
   * 사용자와 서버를 인증
   * 사용자는 SSH서버에 접속할 때 신분 증명 -> PW인증, RSA, DSA등의 공개키 인증
   * SSH Client는 처음 접속한 서버의 키를 저장함으로써 서버가 변경되었을 경우를 판별 가능
2. 암호화(Encryption)
   * 네트워크를 통해 전달되는 데이터를 암호화
   * 3DES, blowfish등의 대칭키 방식 제공
   * 새로운 암호화 기법 추가할 수 있게 설계
3. 무결성(Integrity)
   * 네트워크를 통한 데이터가 변경되지 않았음을 보장
   * MAC(Message Authentication Code)를 통해 구현
4. 압축(Compression)
   * SSH연결을 통해 데이터를 보내기전에 압축, 암호화하여 전송
   * 받는쪽에서 복호화, 압축 해제

## 원격 접속 방법

### 일반적
* Host A의 Application Client가 Host B의 Application Server로 접속할 때에 `직접 접속`

### 터널링
1. Application Client가 SSH Client에 접속
2. SSH Server를 통해 Application Server로 전달
   * 즉, Forwarded Connection하게 됨
* SSH Client가 SSH Server에 접속되어 있을 때만 유효, `연결시에만 설정 가능`
* 크게 Local port forwarding, Remote port forwarding로 이루어짐

## Local port forwarding
```sh
$ ssh -L <local port>:<dest ip>:<dest port> <ssh server ip>
```

* local port(1024 ~ 65535 사이의 임의 값)
   * SSH Client가 listen
   * SSH Client가 listen하고 있을 때 포트번호 지정
   
* dest ip
   * SSH Server입장에서 호스트명

```
Application Client(Host A) -> SSH Client(Host A) -> SSH Server(Host B) -> Application Server(Host B)
```
1. local port로 데이터가 왔을 때 SSH Client가 SSH Server로 데이터 전송
2. SSH Server는 데이터를 다시 dest ip의 dest port로 데이터를 보내준다


## Remote port forwarding
```sh
$ ssh -R <포트번호1>:<호스트명>:<포트번호2> <서버명>
```
* 포트번호 1
   * SSH Server가 listen
* 호스트명
   * SSH Client입장에서 호스트명

```
Application Client(Host B) -> SSH Server(Host B) -> SSH Client(Host A) -> Application Server(Host A)
```

## 사용하는 예시
* 80포트가 막혀 있고 22번만 열려있을 때 터널링을 사용하여 방화벽을 우회

### example. public ec2를 통해 private rds에 접속
1. 터널링
```sh
$ ssh -N -L <local port>:<dest ip>:<dest port> <ssh server ip> [-i xxx.pem]
# -N -> 원격 쉘을 실행시키지 않고 접속만 유지
# -L -> 로컬 포워딩
# -i -> 키 파일

# local port 33060을 ec2를 통해 rds의 3306 port에 연결
$ ssh -N -L 33060:rds-ip:3306 ec2-user@ec2-ip -i xxx.pem
```
2. 접속
```sh
$ mysql -p 33060
```

> #### 참고
> [SSH Tunneling 사용하기](http://www.hanbit.co.kr/network/category/category_view.html?cms_code=CMS5064906327)  
> [How do I configure redis to allow me to connect through a SOCKS proxy?](http://serverfault.com/questions/445169/how-do-i-configure-redis-to-allow-me-to-connect-through-a-socks-proxy)
