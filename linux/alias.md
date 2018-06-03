# [Linux] alias
> linux에서 자주 사용하는 긴 명령어 조합을 간단하게 alias로 등록하여 사용하면 매번 입력하는 귀찮음을 해소할 수 있다  
> 기억하기 어려운 명령어도 사용하기 편해질 수 있다  

<br>

## alias 설정된 내용 조회
```sh
[ec2-user@ip-172-31-7-72 ~]$ alias
alias dev-ubuntu='ssh -i ubuntu@171.31.1.248 xxx.pem'
alias ll='ls -l --color=auto'
alias ls='ls --color=auto'
alias vi='vim'
...
```

<br>

---

## alias 추가하기

### 1. 파일로 추가
* `/home/{user name}/.bash_profile` or `.bashrc` - 현재 사용자에게만 적용
* `/etc/bashrc` - 모든 사용자에게 적용
```sh
# .bash_profile에 아래 형식으로 내용 기술
alias <alias name>='<command>'

# ex
alias dev-ubuntu='ssh -i ubuntu@171.31.1.248 xxx.pem'  # ssh 접속
alias psa='ps aux'
alias rm='rm -i'  # 삭제시 comfirm message 출력
```

* 수정한 .bash_profile 적용
   * 방금 수정한 사항이 다음번 로그인시 적용되기 때문에 바로 적용하기 위해서는 해당 명령어를 실행
```sh
$ source .bash_profile
```

### 2. 명령어로 추가
```sh
$ alias <alias name>='<command>'

# ex. ssh 접속
alias dev-ubuntu='ssh -i ubuntu@171.31.1.248 xxx.pem'

# 추가한 alias 조회
[ec2-user@ip-172-31-7-72 ~]$ alias
alias dev-ubuntu='ssh -i ubuntu@171.31.1.248 xxx.pem'
...
```

<br>

---

## alias 삭제
### 1. .bash_profile에 기술한 내용 삭제
### 2. unalias 사용
```sh
$ unalias <alias name>

# ex. ssh 접속 alias 삭제
$ unalias dev-ubuntu
```

