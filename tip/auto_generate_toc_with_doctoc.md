# [Tip] Auto generate toc with doctoc
> date - 2021.12.12  
> keyworkd - readme  
> README.md의 toc를 자동생성해주는 doctoc 사용하는 법을 정리  

<br>

## As-is
```
# 1
## 1-1
## 1-2
```

<br>

## doctoc를 docker image를 사용해 실행하기 위해 alias 선언
```sh
alias doctoc="docker run --rm -it --entrypoint doctoc -v ${PWD:-.}:/usr/src jorgeandrada/doctoc --github --no"
```

<br>

## 실행
```sh
$ doctoc README.md
```

```
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [1](#-1)
  - [1-1](#-1-1)
  - [1-2](#-1-2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 1
## 1-1
## 1-2
```

<br><br>

> #### Reference
> * [thlorenz/doctoc - GitHub](https://github.com/thlorenz/doctoc)
> * [jorgeandrada/doctoc - DockerHub](https://hub.docker.com/r/jorgeandrada/doctoc)
> * [Docker $(pwd) and bash aliases](https://stackoverflow.com/questions/44259515/docker-pwd-and-bash-aliases/44259597)
