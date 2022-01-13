# [Python] [Poetry](https://python-poetry.org/)
> date - 2022.01.12  
> keyworkd - python, poetry  
> pip + virtualenv로 사용할 수 있는 poetry에 대해 정리  

<br>

## About poetry
* **Python packaging and dependency management made easy**
* `pyproject.toml`, `poetry.lock`을 사용해 pip의 dependency 관리 이슈를 해결
* [Pipenv](https://pipenv.pypa.io/en/latest/)와 유사
* Python 3.6+를 지원


<br>

## Install
```sh
$ curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -

$ echo "source ${HOME}/.poetry/env" >> $HOME/.zshrc
$ source $HOME/.zshrc

$ poetry --version  # install check

$ mkdir $ZSH_CUSTOM/plugins/poetry
$ poetry completions zsh > $ZSH_CUSTOM/plugins/poetry/_poetry

## ~/.zshrc에 아래 내용 추가
plugins(
  poetry
  ...
)
```

<br>

## Update
```sh
$ poetry self update
```

### specific version
```sh
$ poetry self update [version]
## example
$ poetry self update 1.1.12
```


<br>

## Usage

### Project setup
* new project
```sh
$ project new poetry-demo
```

* pre-existing project
```sh
$ cd pre-exsiting-project
$ poetry init
```

<br>

### poetry run
* poetry virtualenv에서 script 실행
```sh
$ poetry run [command]

## example
$ poetry run python -m pytest
```

<br>

### poetry virtualenv 실행
```sh
$ poetry shell

$ exit
```

<br>

### install dependencies
```sh
$ poetry add [package]

## example
$ poetry add flask

### install dev package
$ poetry add --dev pytest
```

#### specifying dependencies
* `pyproject.toml`의 `tool.poetry.dependencies`에 정의
```sh
[tool.poetry.dependencies]
pendulum = "^1.4"
```

<br>

### update dependencies
* `pyproject.toml`을 기반으로 `poetry.lock`의 dependency를 update
```sh
$ poetry update
```

<br>

### dependency 확인
* `Pipenv`보다 더 많은 정보를 확인할 수 있다
```sh
$ poetry show

## example
$ poetry show --tree

$ poetry show --latest
```


### packaging
* library publish 전에 packaging
```sh
$ poetry build
```

<br>

### publish
* PyPI로 publishing
```sh
$ poetry publish
```


<br><br>

> #### Reference
> * [Poetry](https://python-poetry.org/)
> * [python-poetry/poetry - GitHub](https://github.com/python-poetry/poetry)
