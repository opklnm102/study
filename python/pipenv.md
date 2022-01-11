# [Python] [Pipenv](https://pipenv.pypa.io/en/latest/)
> date - 2022.01.11  
> keyworkd - python, pipenv  
> pip + virtualenv로 사용할 수 있는 pipenv에 대해 정리  

<br>

## Abount Pipenv
* Python Dev Workflow for Humans
* `Pipfile`, `Pipfile.lock`을 사용해 pip의 `requirements.txt`로 인한 dependency 관리 이슈를 해결
* `pip` + `virtualenv`로 이해하면 된다


<br>

## Install
```sh
$ pip install --user pipenv

$ pipenv --version
pipenv, version 2022.1.8
```
* `brew install`은 현재 환경의 모든 python virtual environments에 dependency가 생기므로 권장하지 않는다

<br>

## Usage

### pipenv로 python interpreter 실행
* 최초 진입시 `requirements.txt`를 `Pipfile`로 변환
```sh
$ pipenv run python --version

requirements.txt found, instead of Pipfile! Converting...
✔ Success! 
```

<br>

### pipenv virtualenv 실행
* 기존에 생성된 virtualenv가 있다면 실행하고, 없다면 생성해준다
```
$ pipenv shell
```

<br>

### create new project
```sh
$ pipenv --python 3.8.8
```

<br>

### install dependency

#### Pipfile, Pipfile.lock 기반으로 설치
```sh
$ pipenv install
```

#### `dev-packages`를 포함한 모든 dependency 설치
```sh
$ pipenv install --dev
```

#### pipenv로 dependency 설치
* dependency가 설치되고, Pipfile, Pipfile.lock에 추가된다
```sh
$ pipenv install [package]


## example - for packages
$ pipenv install requests

## example - for dev-packages
$ pipenv install pytest --dev
```

### `pre-releases`를 포함하는 Pipfile.lock 생성
```sh
$ pipenv lock --pre
```

<br>

### dependency graph 확인
```sh
$ pipenv graph
```

<br>

### dependency vulnerability 확인
```sh
$ pipenv check
```


<br><br>

> #### Reference
> * [Pipenv](https://pipenv.pypa.io/en/latest/)
