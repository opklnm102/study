# [Build] asdf
> date - 2023.04.06  
> keyword - asdf, version management  
> 다양한 언어의 버전을 쉽게 관리하기 위한 도구인 asdf에 대해 정리  

<br>

## [asdf](https://asdf-vm.com)
* 다양한 언어의 버전을 쉽게 관리하기 위한 tool
* node.js의 [nvm](https://github.com/nvm-sh/nvm), ruby의 [rbenv](https://github.com/rbenv/rbenv) 대체 가능
* 동일한 방식으로 여러 언어를 관리할 수 있어서 편함


<br>

## Installation
```sh
$ brew install asdf
```

* `.zshrc`에 asdf 초기화 명령어 설정
```sh
$ echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

* Delete
```sh
$ brew uninstall asdf
```


<br>

## Usage
* asdf는 asdf core를 설치한 후 언어별 plugin을 이용

| Command | Description |
|:--|:--|
| asdf plugin list | 설치된 plugin 리스트 조회 |
| asdf plugin list all | 설치 가능한 plugin 리스트 조회 |
| asdf plugin add <plugin name> [<git-url>] | plugin 설치 |
| asdf plugin update --all | 모든 plugin 업데이트 |
| asdf plugin update <plugin name> | 특정 plugin 업데이트 |
| asdf plugin remove <plugin name> | plugin 제거 |
| asdf list all <plugin name> | plugin에서 설치 가능한 버전 확인 |
| asdf install <plugin name> <version> | 버전 설치 |
| asdf latest <name> | 최신 버전 확인 |
| asdf latest <name> <version> | 특정 버전의 최신 버전 확인 |
| asdf uninstall <name> <version> | 버전 제거 |
| asdf local <plugin name> <version> | 현재 경로의 사용 설정<br>현재 경로의 `.tools-version`으로 관리 |
| asdf global <plugin name> <version> | 전역 설정<br>Home의 `.tools-version`으로 관리 |

<br>

### Plugin
| Tool | Plugin |
|:--|:--|
| Go | [asdf-golang](https://github.com/kennyp/asdf-golang) |
| Java | [asdf-java](https://github.com/halcyon/asdf-java) |
| Node.js | [asdf-nodejs](https://github.com/asdf-vm/asdf-nodejs) |
| Yarn | [asdf-yarn](https://github.com/twuni/asdf-yarn) |
| Python | [asdf-python](https://github.com/asdf-community/asdf-python) |
| Ruby | [asdf-ruby](https://github.com/asdf-vm/asdf-ruby) |
| HashiCorp tool | [asdf-hashicorp](https://github.com/asdf-community/asdf-hashicorp) |
| direnv | [asdf-direnv](https://github.com/asdf-community/asdf-direnv) |
| kubectl | [asdf-kubectl](https://github.com/asdf-community/asdf-kubectl) |
| Helm | [asdf-helm](https://github.com/Antiarchitect/asdf-helm) |

<br>

### Node.js & yarn
```sh
$ asdf plugin add nodejs
$ asdf plugin add yarn

## 설치 가능한 버전 조회
$ asdf list-all nodejs
$ asdf list-all yarn

## 원하는 버전 설치
$ asdf install nodejs 18.15.0
$ asdf install yarn 1.22.19

## 설치한 버전 확인
$ asdf list nodejs
$ asdf list yarn

## project 설정
$ asdf local nodejs 18.15.0
$ asdf local yarn 1.22.19

## 현재 사용 중인 버전 확인
$ asdf current

## 설치한 버전 제거
$ asdf uninstall nodejs 18.15.0
$ asdf uninstall yarn 1.22.19
```

<br>

### Java
```sh
## plugin 설치 or asdf plugin add java https://github.com/halcyon/asdf-java.git
$ asdf plugin add java

## JAVA_HOME 설정
$ echo -e "\n. $HOME/.asdf/plugins/java/set-java-home.zsh" >> ${ZDOTDIR:-~}/.zshrc

## 설치 가능한 버전 조회
$ asdf list-all java

## 원하는 버전 설치
$ asdf install java temurin-11.0.17+8

## 설치한 버전 확인
$ asdf list java

## project 설정
$ asdf local java temurin-11.0.17+8

## 현재 사용 중인 버전 확인
$ asdf current

## 설치한 버전 제거
$ asdf uninstall java temurin-11.0.17+8
```

<br>

### kubectl
* asdf로 kubectl 관리
```sh
# install kubectl plugin for asdf
$ asdf plugin-add kubectl https://github.com/asdf-community/asdf-kubectl.git

# fetch latest kubectl 
$ asdf install kubectl latest
$ asdf global kubectl latest

# test results of latest kubectl 
$ kubectl version --short --client 2> /dev/null
```

* cluster version과 동일한 kubectl 사용
```sh
# fetch exact version of Kubernetes server
KUBECTL_VER=$(kubectl version --short 2> /dev/null \
  | awk '/Server Version/ {sub(/^v/, "", $3); gsub(/-eks-.*/, "", $3); print $3}'
  ## or | grep "Server Version" | sed -n 's/Server Version: v\([0-9.]*\)-.*/\1/p'
  ## or | grep -o 'Server Version: v[^-]*' | sed 's/Server Version: v//'
)

# setup kubectl tool
asdf install kubectl $KUBECTL_VER
asdf global kubectl $KUBECTL_VER
```

<br><br>

> #### Reference
> * [asdf - Manage multiple runtime versions with a single CLI tool](https://asdf-vm.com)
