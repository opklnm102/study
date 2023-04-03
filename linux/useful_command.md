# [Linux] Useful command
> date - 2023.03.04  
> keyword - linux, tip  
> 유용한 명령어 모음  

<br>

## zsh r command
```sh
$ r
```
* `!!`, `fc -e -`와 동일한 명령어로 마지막 명령어를 실행


<br>

## tail -f *.log
```sh
$ tail -f *.log
```
* 해당 경로에 있는 모든 로그 파일을 파일명으로 구분해서 추적하므로 여러 창에서 각 파일을 추적할 필요가 없다


<br>

## fd + as-tree
* `find` 대체제인 `fd`로 파일을 찾고, `as-tree`로 tree 형식으로 출력

### Install
```sh
$ brew install fd as-tree
```

<br>

### Usage
```sh
$ fd <pattern> <path> | as-tree

## example - fd -e (or --extension), find pdf files
$ fd -e pdf | as-tree
```


<br><br>

> #### Reference
> * [fc 명령어](https://johngrib.github.io/wiki/cmd/fc)
> * [A simple, fast and user-friendly alternative to 'find'](https://github.com/sharkdp/fd)
> * [Print a list of paths as a tree of paths](https://github.com/jez/as-tree)
