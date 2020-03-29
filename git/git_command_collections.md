# [Git] Git command collections
> date - 2020.03.27  
> keyword - git  
> 유용한 git 명령어 사용법에 대해 정리  

<br>

## 기본 명령어
TBD


<br>

## 여러 git repository에 1번에 git 명령어 적용하기
* 아래와 같이 git repository가 여러개인 경우 일괄적으로 reset, merge, checkout 등의 명령어를 일괄적으로 적용하고 싶은 경우 사용
```
├── user-api
├── order-api
├── common-api
├── payment-api
└── delivery-api
```

<br>

### 병렬로 특정 branch checkout
```sh
$ ls | xargs -P10 -I{} git -C {} checkout [branch name]

## e.g. 병렬로 develop branch를 checkout
$ ls | xargs -P10 -I{} git -C {} checkout develop
```

* 위 명령어를 통해 아래의 명령어가 순차적으로 실행된다
```sh
$ git -C [repository path] checkout develop
```

<br>

> #### git 명령어는 `.git`이 존재하는 경로에서 사용해야 동작하기 때문에 `-C`를 사용
> * `-C`를 사용하면 현재 위치가 어디든 원하는 git repository에 명령을 내릴 수 있다
> ```sh
> $ git -C [path] [command]
> ```

<br>

* `xargs` 사용시 아래와 같이 repository가 맨 뒤로 오므로 syntax error
```sh
$ ls | xargs git -C {} checkout develop  # error

git -C checkout develop user-api
...
```

* `-I{}`를 사용하면 원하는 곳에 위치시킬 수 있다
```sh
$ ls | xargs -I{} git -C {} checkout develop
```

<br>

> * `-IR` 공백을 넣을 수 있다
> ```sh
> $ ls | xargs -IR git -C R checkout develop
> ```

<br>

### Usage
* 자주쓰는 명령의 경우 `alias`를 걸어두면 유용하게 활용할 수 있다

#### checkout 
```sh
$ ls | xargs -I{} -P10 git -C {} checkout develop
```

#### 현재 branch pull
```sh
$ ls | xargs -I{} -P10 git -C {} pull
```

#### 현재 branch hard reset
```sh
$ ls | xargs -I{} -P10 git -C {} reset --hard HEAD
```

#### merge
```sh
$ ls | xargs -P10 -I{} git -C {} checkout release
$ ls | xargs -I{} git -C {} merge develop  # merge시 conflict 확인을 위해 -P를 사용하지 않음
```

#### merge 1줄 버전
```sh
$ ls | xargs -I{} sh -c 'echo --{}--; git -C {} checkout release; git -C {} merge develop;'
```

#### remote URL 얻기
```sh
$ ls | xargs -I{} git -C {} remote -v | grep fetch
```

#### remote url 기반으로 clone - clone은 뒤에 url이 붙으므로 -I 필요 X
```sh
$ cat url_list.txt | xargs -P10 git clone
```

#### 각 repository의 마지막 tag 확인
```sh
$ ls | xargs -I{} sh -c 'echo --{}--; git -C {} describe --abbrev=0 --tag;'
```

#### stash 목록 확인
```sh
$ ls | xargs -I{} sh -c 'echo --{}--; git -C {} stash list;'
```

#### develop, release, master 전체 pull
```sh
$ ls | xargs -I{} -P10 sh -c 'git -C {} checkout master; git -C {} pull; git -C {} checkout release; git -C {} pull; git -C {} checkout develop; git -C {} pull;'
```

<br>

## 파일 하나의 변경 이력 확인
```sh
$ git log [file]
```

<br>

### 라인별 변경 이력 확인
* `diff`처럼 라인별 변경 이력 확인
```sh
$ git log -p [file]

commit 18c55bbbc17a4f70064d79c8d6de8c3f7071a8c4
...
-* 접속시 `Welcome to nginx on the Amazon Linux AMI!`라는 화면이 보이는 Amazon Linux AMI의 nginx가 설치된다
+* 접속시 `Welcome to nginx on the Amazon Linux AMI!`라는 글자가 보이는 OS
...
```

<br>

* 너무 많으면 `-[number]`로 출력 수 지정
```sh
$ git log -p -5 [file]
```

<br>

### 단어별 변경 이력 확인
```sh
$ git log -p --word-diff [file]

# e.g.
commit 18c55bbbc17a4f70064d79c8d6de8c3f7071a8c4
...
* 접속시 `Welcome to nginx on the Amazon Linux AMI!`라는 [-화면이-]{+글자가+} 보이는 [-Amazon Linux AMI의 nginx가 설치된다-]{+OS+}
...
```


<br><br>

> #### Reference
> * [여러 git 리파지토리 한꺼번에 git 명령어 적용하기](http://tech.javacafe.io/2018/12/15/%EC%97%AC%EB%9F%AC_git_%EB%A6%AC%ED%8C%8C%EC%A7%80%ED%86%A0%EB%A6%AC_%ED%95%9C%EA%BA%BC%EB%B2%88%EC%97%90_git_%EB%AA%85%EB%A0%B9%EC%96%B4_%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0/)
> * [Pro Git 2dn Edtion](https://git-scm.com/book/ko/v2)
