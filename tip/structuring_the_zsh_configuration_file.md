# [Tip] Structuring the zsh configuration file
> date - 2022.11.28  
> keyworkd - zsh  
> iTerm2 + zsh + on my zsh를 사용할 때 zsh에서 사용할 설정들을 .zshrc에 다 넣어서 사용하는 것을 보았다  
> 환경 변수는 `.zshenv`에 설정하게되어 `.zshrc`, `.zshenv`가 큰 파일이 되어 가독성이 떨어질 수 있으므로 구조적으로 분리하는 법을 정리  

<br>

## 1. .zshrc, .zshenv 파일 내용 용도별로 분리
* .zsh/zsh.d에 `.zsh`를 확장자로 용도별로 분리한다
```sh
$ mkdir -p .zsh/zsh.d
```

```sh
tree $HOME/.zsh/zsh.d
.
├── 1-oh-my-zsh.zsh
├── aws.zsh
├── git.zsh
├── java.zsh
├── k8s.zsh
├── node.zsh
├── python.zsh
└── util.zsh
```

* k8s.zsh
```sh
## krew
export PATH="${PATH}:${HOME}/.krew/bin"

## kube-ps1
source "/usr/local/opt/kube-ps1/share/kube-ps1.sh"
PS1='$(kube_ps1)'$PS1

## kubectl_aliases
[ -f ~/.kubectl_aliases ] && source ~/.kubectl_aliases

## kubeswitch
INSTALLATION_PATH=$(brew --prefix switch) && source $INSTALLATION_PATH/switch.sh
```

## 2. .zshrc에서 읽어오기
* `.zshrc`에 아래 내용 추가
```zsh
for config_file ($HOME/.zsh/zsh.d/*.zsh) source $config_file
```
