# [Node.js] About nvm(node version manager)
> date - 2018.10.31  
> keyword - node.js, node version management  
> 다양한 node version을 사용할 때 유용한 nvm 설치 및 사용법에 대해 정리(macOS 기준)

<br>

## Install 
* brew에서 nvm을 공식적으로 지원하지 않으므로 살짝 추가 작업 필요
```sh
$ brew install nvm

$ mkdir ~/.nvm

$ vi .zshrc
# 아래 내용 추가
export NVM_DIR="$HOME/.nvm"
. "$(brew --prefix nvm)/nvm.sh"

$ source ./zshrc

$ nvm --version
0.33.11
```

<br>

## Usage

* 현재 설치된 node version 조회
```sh
$ nvm ls

        v8.12.0
->      v11.0.0
default -> node (-> v11.0.0)
nvmnode -> stable (-> v11.0.0) (default)
nvstable -> 11.0 (-> v11.0.0) (default)
iojs -> N/A (default)
lts/* -> lts/carbon (-> v8.12.0)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.14.4 (-> N/A)
lts/carbon -> v8.12.0
```
<br>

* 설치할 수 있는 node version 조회
```sh
$ nvm ls-remote

        v0.1.14
        v0.1.15
        ...

```
<br>

* LTS version 설치
```sh
$ nvm install --lts
```
<br>

* 사용가능한 LTS version 조회 
```sh
$ nvm ls-remote --lts

...
v8.12.0   (Latest LTS: Carbon)
v10.13.0   (Latest LTS: Dubnium)
```
<br>

* 사용할 node version 지정
```sh
$ nvm use <version>

## example
$ nvm use v10.13.0
```
<br>

* 설치된 위치 조회
```sh
$ nvm which <version>

## example
$ nvm which v10.13.0
/Users/huekim/.nvm/versions/node/v10.13.0/bin/node
```
<br>

* 삭제하기
```sh
$ nvm uninstall <version>

## example
$ nvm uninstall v10.13.0
```
<br>

* 특정 버전으로 실행하기
```sh
$ nvm run <version> <path>

## example
$ nvm run v10.13.0 app.js
```

<br>

> #### Reference
> * [How to install NVM (Node Version Manager) with Homebrew](https://www.wdiaz.org/how-to-install-nvm-with-homebrew/)
> * [Node Version Manager - GitHub](https://github.com/creationix/nvm)
