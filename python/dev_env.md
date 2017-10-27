# [Python] 개발 환경 구축하기

## pyenv
* `Simple Python Version Management: pyenv`, 다양한 파이썬 버전을 설치하고 사용, 버전에 대한 의존성을 해결할 수 있다

### 설치하기
1. install
```sh
# ubuntu 16.04
# 의존성 패키지 설치
$ sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils

# installer로 설치
$ curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | bash

# osx - brew
$ brew install pyenv
```

2. path 등록
```sh
# ~/.bash_profile에 다음 내용 추가 -> ubuntu는 ~/.profile
$ echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
$ echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
```

3. pyenv init
```sh
$ echo 'eval "$(pyenv init -)"' >> ~/.bashrc
```

4. 바뀐 path가 적용된 shell을 재시작
```sh
# .bashrc에 넣었을 경우 유효
$ exec $SHELL

# .profile에 넣었을 경우 재로그인하거나 아래 명령 실행
$ source .profile
```
> [pyenv github](https://github.com/yyuu/pyenv)에 경고  
`BASH_ENV`변수가 `.bashrc`를 가리키는 일부 시스템의 경우 pyenv가 무한루프에 들어가는 이상동작을 보이므로 `pyenv init`을 `.bashrc`가 아닌 `.bash_profile`에 넣어야 한다  

</br>

> .bashrc와 .profile의 차이  
.bashrc - 터미널을 실행할 때 마다 읽는다   
.profile - 로그인할 때 1번만 읽는다

### pyenv 제거
1. pyenv 폴더 제거
```sh
$ rm -fr ~/.pyenv
```
2. `~/.bashrc`에 install 때 추가했던 3줄을 지워준다 

### 사용하기

#### update
```sh
$ pyenv update
```
> 설치 후 업데이트 1번 진행해준다.

#### 특정 버전의 python 설치
```sh
$ pyenv install <version>
```

#### 특정 버전의 python 제거
```sh
$ pyenv uninstall <version>
```

#### 설치 가능한 python 리스트
```sh
$ pyenv install --list
```

#### 설치된 python 리스트
```sh
$ pyenv versions
```
#### 현재 사용중인 python 버전
```sh
$ pyenv version
```
#### 현재 사용자의 전역 python 버전 설정
```sh
$ pyenv global <version>
```

#### 특정 디렉토리에 python 버전 지정
```sh
mkdir newdir
cd newdir
pyenv local 3.5.3  # .python-version이 생기며, 안에 버전이 명시됨
pyenv local --unset  # .pyton-version 제거
```

#### 설치한 python shell로 사용하기
```sh
$ pyenv shell <version>
$ python -version  # version 확인
```

## virtualenv
* `Virtual Python Environment builder` , 가상환경을 구축해 다양한 파이썬 개발환경을 설정할 수 있다

### 설치
* `pyenv installer`로 설치했으면 자동으로 `pyenv-virtualenv`설치 완료
```sh
# osx - brew
$ brew install pyenv-virtualenv
```

* init 설정 추가
```sh
$ echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
$ exec $SHELL
```

### 사용하기

#### 가상환경 생성
```sh
$ pyenv virtualenv <version> <virtualenv name>  # 특정 버전 지정
$ pyenv virtualenv <virtualenv name>  # 현재 환경으로 생성
```

#### 생성한 가상환경 리스트
```sh
$ pyenv virtualenvs
```

#### 가상환경 사용
```sh
$ pyenv activate <virtualenv name>
```

#### 가상환경에 패키지 설치
```sh
$ pyenv activate <virtualenv name>
$ pip install django
$ pip list > requirements.txt
```
> `requirements.txt`를 이용해 다른 환경에서도 동일한 패키지를 사용할 수 있다  
```sh
$ pip install -r requirements.txt
```

#### 가상환경 나오기
```sh
$ pyenv deactivate
```

#### 가상환경 삭제
```sh
$ pyenv uninstall <virtualenv name>
```

## autoenv
* 디렉토리 집입시마다 .env 파일을 읽어서 해당 스크립트를 자동으로 실행
* 프로젝트 디렉토리에서 프로젝트 환경을 자동으로 셋팅할 수 있다.

### 설치하기
* pip를 사용할 수 있는게 아니므로 git을 사용!
```sh
# ubuntu 16.04
$ git clone git://github.com/kennethreitz/autoenv.git ~/.autoenv
# bashrc 세션마다 autoenv실행
$ echo 'source ~/.autoenv/activate.sh' >> ~/.bashrc

# osx
$ brew install autoenv
$ echo 'source /usr/local/opt/autoenv/activate.sh' >> ~/.bashrc
```

### 사용하기
* `.env`에 실행할 스크립트를 명시
```sh
# 출력
$ echo "echo 'whoa'" > project/.env
$ cd project
whoa

# 가상환경 실행
$ echo 'pyenv activate <virtualenv name>' >> project/.env
$ cd projdct
```
> `.env`는 git에 올필 필요없으니 ignore한다

<br/> 

> 참고
[pyenv wiki - Common build problems](https://github.com/yyuu/pyenv/wiki/Common-build-problems)  
[pyenv Command Reference](https://github.com/yyuu/pyenv/blob/master/COMMANDS.md)  
[pyenv installer](https://github.com/yyuu/pyenv-installer)  
[pyenv-virtualenv](https://github.com/yyuu/pyenv-virtualenv)  
[autoenv](https://github.com/kennethreitz/autoenv)  
[권남 - PyEnv](http://kwonnam.pe.kr/wiki/python/pyenv)  
[권남 - VirtualEnv](http://kwonnam.pe.kr/wiki/python/virtualenv)  
[권남 - autoenv](http://kwonnam.pe.kr/wiki/linux/autoenv)  
[pyenv + virtualenv + autoenv 를 통한 Python 개발 환경 구축하기](https://dobest.io/how-to-set-python-dev-env/)  
https://milooy.wordpress.com/2015/07/31/python-set-environments/
