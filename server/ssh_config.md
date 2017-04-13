# ssh config를 사용해 ec2 접속

> aws ec2 인스턴스에 접속할 때 ssh 명령어를 반복적으로 입력한다  
> ```sh
> $ ssh -i xxx.pem ec2-user@<ec2-ip>
> ```
> ssh config를 사용해 살짝 편해져보자


## 1. config파일 작성
```sh
# ~/.ssh/config
Host ec2-dev
     Hostname <ec2-ip>  # host(ip, url)
     User ec2-user      # login id
     Port 22            
     IdentityFile <xxx.pem path>
```

## 2. 권한 설정
```sh
$ chmod 440 ~/.ssh/config
```

## 3. 접속
```sh
$ ssh ec2-dev
```
