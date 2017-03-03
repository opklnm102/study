# ip에 이름 부여하기

> ssh접속시 매번 ip를 입력하는 귀찮음들 해소할 수 있다

```sh
$ sudo vi /etc/hosts

# /etc/hosts에 다음 형식으로 입력
127.0.0.1    localhost
<ip>         <name>

# 접속
ssh -i host_name@<ip name>
```
