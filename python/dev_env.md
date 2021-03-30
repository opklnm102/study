# [Python] 개발 환경 구축하기
> date - 2017.02.26  
> keyworkd - python, pyenv, virtualenv, autoenv, venv  
> project마다 다양한 python과 library version 사용으로 인한 호환성 문제를 가상 환경을 통한 격리로 해결할 수 있다  
> python 가상 환경을 사용하여 개발 환경을 구성하는 방법을 정리  


<br>

## pyenv
* `Simple Python Version Management: pyenv`, 다양한 파이썬 버전을 설치하고 사용, 버전에 대한 의존성을 해결할 수 있다

<br>

### 설치하기
1. install
```sh
# ubuntu 16.04
# 의존성 패키지 설치
$ sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils

# installer로 설치
$ curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash

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

#### install script
* 아래 내용을 파일로 저장하여 실행하면 위 과정을 1번에 진행할 수 있다
```sh
!/bin/bash

curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer | bash

## setting pyenv
SHELL_CONFIG=~/.zshrc
echo 'export PATH="${HOME}/.pyenv/bin:${PATH}"' >> ${SHELL_CONFIG}
echo 'if which pyenv > /dev/null; then eval "$(pyenv init -)"; fi'  >> ${SHELL_CONFIG}
echo 'if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi' >> ${SHELL_CONFIG}
source ${SHELL_CONFIG}
```

<br>

> #### [pyenv github](https://github.com/yyuu/pyenv)에 경고
> `BASH_ENV`변수가 `.bashrc`를 가리키는 일부 시스템의 경우 pyenv가 무한루프에 들어가는 이상동작을 보이므로 `pyenv init`을 `.bashrc`가 아닌 `.bash_profile`에 넣어야 한다  

</br>

> #### .bashrc와 .profile의 차이  
> * .bashrc - 터미널을 실행할 때 마다 읽는다
> * .profile - 로그인할 때 1번만 읽는다

<br>

### pyenv 제거
1. pyenv 폴더 제거
```sh
$ rm -fr ~/.pyenv
```
2. `~/.bashrc`에 install 때 추가했던 3줄을 지워준다 

<br>

### 사용하기

#### update
```sh
$ pyenv update
```
> 설치 후 업데이트 1번 진행해준다

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
$ mkdir newdir
$ cd newdir
$ pyenv local 3.5.3  # .python-version이 생기며, 안에 버전이 명시됨
$ pyenv local --unset  # .pyton-version 제거
```

#### 설치한 python shell로 사용하기
```sh
$ pyenv shell <version>
$ python -version  # version 확인
```


<br>

## virtualenv
* `Virtual Python Environment builder` , 가상 환경을 구축해 다양한 파이썬 개발 환경을 설정할 수 있다

<br>

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

<br>

### 사용하기

#### 가상 환경 생성
```sh
$ pyenv virtualenv <version> <virtualenv name>  # 특정 버전 지정
$ pyenv virtualenv <virtualenv name>  # 현재 환경으로 생성
```

#### 생성한 가상 환경 리스트
```sh
$ pyenv virtualenvs
```

#### 가상 환경 활성화
```sh
$ pyenv activate <virtualenv name>
```

#### 가상 환경에 패키지 설치
```sh
$ pyenv activate <virtualenv name>
$ pip install django
$ pip list > requirements.txt
```
> `requirements.txt`를 이용해 다른 환경에서도 동일한 패키지를 사용할 수 있다  
```sh
$ pip install -r requirements.txt
```

#### 가상 환경 비활성화
```sh
$ pyenv deactivate
```

#### 가상 환경 삭제
```sh
$ pyenv uninstall <virtualenv name>
```


<br>

## venv
* 가상 환경을 만들고 관리할 때 [venv](https://docs.python.org/3/library/venv.html) 모듈을 사용
* python 3.3부터 내장

<br>

### 사용하기

#### 가상 환경 생성
```sh
$ python -m venv </path/to/venv>

## example
$ python -m venv .venv
```
* 가상 환경에는 일반적으로 `.venv`를 사용
  * `.env`와 충돌 방지
  * shell에서 숨겨져있어 방해받지 않는다

#### 가상 환경 활성화
```sh
$ source .venv/bin/activate

## or
$ . .venv/bin/activate

(.venv) $
```

#### 가상 환경 비활성화
```sh
(.venv) $ deactivate 
```


<br>

## autoenv
* 디렉토리 집입시마다 .env 파일을 읽어서 해당 스크립트를 자동으로 실행
* 프로젝트 디렉토리에서 프로젝트 환경을 자동으로 셋팅할 수 있다.

<br>

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

<br>

### 사용하기
* `.env`에 실행할 스크립트를 명시
```sh
# 출력
$ echo "echo 'whoa'" > project/.env
$ cd project
whoa

# 가상 환경 실행
$ echo 'pyenv activate <virtualenv name>' >> project/.env
$ cd projdct
```
> `.env`는 git에 올필 필요없으니 gitignore에 추가한다


<br>

## pip
* python에서 사용하는 package manager로 package install, upgrade, remove에 사용
* 기본적으로 Python Package Index(https://pypi.org)에서 package를 설치한다

<br>

### Usage

#### search package
```sh
$ pip search <package name>

## example
$ pip search requests
```

#### install package
```sh
$ pip install <package name>

## example
$ pip install requests

### 특정 버전 package install
$ pip install requests==2.6.0
```

#### upgrade package
```sh
$ pip install --upgrade <package name>

## example
$ pip install --upgrade requests

### upgrade pip
$ pip install --upgrade pip
```

#### remove package
```sh
$ pip uninstall <package name>

## example
$ pip uninstall requests
```


<br><br>

> #### Reference
> * [pyenv wiki - Common build problems](https://github.com/yyuu/pyenv/wiki/Common-build-problems)  
> * [pyenv Command Reference](https://github.com/yyuu/pyenv/blob/master/COMMANDS.md)  
> * [pyenv installer](https://github.com/yyuu/pyenv-installer)  
> * [pyenv-virtualenv](https://github.com/yyuu/pyenv-virtualenv)  
> * [autoenv](https://github.com/kennethreitz/autoenv)  
> * [권남 - PyEnv](http://kwonnam.pe.kr/wiki/python/pyenv)  
> * [권남 - VirtualEnv](http://kwonnam.pe.kr/wiki/python/virtualenv)  
> * [권남 - autoenv](http://kwonnam.pe.kr/wiki/linux/autoenv)  
> * [pyenv + virtualenv + autoenv 를 통한 Python 개발 환경 구축하기](https://dobest.io/how-to-set-python-dev-env/)  
https://milooy.wordpress.com/2015/07/31/python-set-environments/
> * [venv](https://docs.python.org/3/library/venv.html)
> * [12. 가상 환경 및 패키지 - Python Docs](https://docs.python.org/ko/3/tutorial/venv.html)
