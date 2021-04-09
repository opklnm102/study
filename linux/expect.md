# [Linux] expect
> date - 2021.04.09  
> keyworkd - expect, automation  
> CLI에서 자동화에 사용하는 expect에 대해 정리

<br>

## expect란?
* CLI 상호 작용 자동화 프로그램
* Telnet, SSH, FTP에서 상호작용이 필요한 작업에 대해 자동화 가능
* 특정 문자열을 기다리고(expect), 정해진 문자열을 보내는(send) 등의 처리를 한다
* [pexpect](https://github.com/pexpect/pexpect)로도 유사한 작업 가능


<br>

## install
* MacOS
```sh
$ brew install expect
```

* Ununtu
```sh
$ sudo apt install expect
```


<br>

## 주요 Command
| Command | Description |
|:--|:--|
| send | 문자열을 프로세스로 보냄 |
| expect | 프로세스로부터 특정 문자열을 기다림 |
| spawn | 명령을 시작 |
| interact | expect를 종료하고 사용자와 상호 작용 시작 |
| set {variable} [lindex $argv {n}] | n번째 명령행 인자를 변수에 지정 |
| expect eof | exit expect |

<br>

### hello를 입력하면 world가 출력
```sh
#!/usr/bin/env bash

expect -c "
expect \"hello\"
send \"world\"
"
```

<br>

### 입력 대기 시간 설정
* default timeout 10s이고, `set timeout`으로 설정 가능
```sh
#!/usr/bin/env bash

expect -c "
set timeout 30
expect \"hello\"
send \"world\"
"
```


<br>

## shell script에서 expect 사용하기
* expect에서 shell script의 variable을 사용 가능하여 유연해진다

### 1. HEREDOC
* `"`를 자유롭게 사용할 수 있어서 편하다
```sh
#!/usr/bin/env bash
host=server1.opklnm102.me
user_name=$1
password=$2

expect <<EOF
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${host}
expect "pasword:"
send "${password}\r"
expect eof
EOF
```
> `<<EOF` 사용시 `stdin`이 소진되어 `interact`가 작동하지 않는다

<br>

### 2. -c option 사용
```sh
#!/usr/bin/env bash
host=server1.opklnm102.me
user_name=$1
password=$2

expect -c "
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${host}
expect \"password:\"
send \"${password}\\r\"
interact
"
```


<br>

## Use case

### SSH 접속시 password 입력 자동화
* AWS에서 Bastion Host를 통해 private subnet에 접근시 여러번의 password 입력을 자동화 
```sh
#!/usr/bin/env bash

user_name=$1
node_private_ip=$2
bastion_host=bastion.opklnm102.me

usage() {
  cat <<-EOM
Usage: ${0##*/} [user_name] [ec2_private_ip]
EOM
  exit 0
}

if [ -z "${user_name}" ]; then
  usage
fi

if [ -z "${ec2_private_ip}" ]; then
  usage
fi

echo -n "Enter password:"
read -s password
echo

expect -c "
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${bastion_host}
expect \"password:\"
send \"${password}\\r\"

expect \"${user_name}@\"
send \"ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${ec2_private_ip}\\r\"

expect \"Password:\"
send \"${password}\\r\"

interact
"
```

### Mac이라면 SSH 접속시 keychain의 password 이용
```sh
#!/usr/bin/env bash

user_name=$1
node_private_ip=$2
bastion_host=bastion.opklnm102.me

usage() {
  cat <<-EOM
Usage: ${0##*/} [user_name] [ec2_private_ip]
EOM
  exit 0
}

if [ -z "${user_name}" ]; then
  usage
fi

if [ -z "${ec2_private_ip}" ]; then
  usage
fi

password=$(security find-generic-password -a "${user_name}" -s "aws.opklnm102.me" -g 2>&1 1>/dev/null | cut -d\" -f2 | head -1 | grep -v "security:")

if [ -z "${password}" ]; then
  echo -n "Enter password:"
  read -s password
  echo
  security add-generic-password -a "${user_name}" -s "aws.opklnm102.me" -w "${password}"
fi

expect -c "
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${bastion_host}
expect \"password:\"
send \"${password}\\r\"

expect \"${user_name}@\"
send \"ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user_name}@${ec2_private_ip}\\r\"

expect \"Password:\"
send \"${password}\\r\"

interact
"
```

* keychain에 저장된 password 제거
```sh
#!/usr/bin/env bash

user_name=$1

if [ -z "${user_name}" ]; then
  echo "Usage: ${0##*/} [user_name]"
  exit 0
fi

security delete-generic-password -a "${user_name}" -s "aws.opklnm102.me"
```


<br><br>

> #### Reference
> * [6 Expect Script Examples to Expect the Unexpected (With Hello World)](https://www.thegeekstuff.com/2010/10/expect-examples/)
> * [Bash 스크립트에 expect 스크립트 넣기](https://zetawiki.com/wiki/Bash_%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%97%90_expect_%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8_%EB%84%A3%EA%B8%B0)
> * [expect - 권남](https://kwonnam.pe.kr/wiki/linux/expect)

<br>

> #### Further reading
> * [pexpect](https://github.com/pexpect/pexpect)












https://www.google.com/search?q=expect%EB%9E%80&oq=expect%EB%9E%80&aqs=chrome..69i57j0i433l2j0j0i433j0l2j69i60.1811j0j7&sourceid=chrome&ie=UTF-8

https://www.joinc.co.kr/w/Site/JPerl/expect
https://zetawiki.com/wiki/%EB%A6%AC%EB%88%85%EC%8A%A4_expect
https://ktdsoss.tistory.com/149
http://abh0518.net/tok/?p=623
http://btsweet.blogspot.com/2014/05/sftp-automation-with-expect.html

https://zetawiki.com/wiki/Bash_%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%97%90_expect_%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8_%EB%84%A3%EA%B8%B0


http://board.theko.co.kr/bbs/board.php?bo_table=B13&wr_id=37

https://ktdsoss.tistory.com/151

https://medium.com/@jyson88/linux-expect-%EC%82%AC%EC%9A%A9%EB%B2%95-43fab859d85d

https://kwonnam.pe.kr/wiki/linux/expect
https://ipex.tistory.com/entry/expect-%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-scp-%EC%9E%90%EB%8F%99-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%9E%91%EC%84%B1
https://dazemonkey.tistory.com/129
