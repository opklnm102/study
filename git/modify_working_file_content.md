# [Git] 작업 내용 되돌리기 및 수정하기
> date - 2018.08.30  
> keyword - git, reset, checkout  
> git을 CLI에서 git checkout, reset으로 작업중이던 내용 되돌리는 방법을 정리

<br>


## 작업중인 내용 되돌리기
* 작업중인 내용이 마음에 들지 않아서 전부 되돌리고 싶은 경우 사용

### staging 안된 내용일 경우
```sh
# repository의 내용 되돌리기
$ git checkout .

# 특정 디렉토리 내용 되돌리기
$ git checkout <dir>

# 특정 파일의 내용 되돌리기
$ git check <file name>
```


### staging 되었거나 staging 안된 내용일 경우
```sh
$ git checkout -- <file>

# example - 현재 디렉토리 내용 되돌리기
$ git checkout -- .
```


<br>

## 완료된 커밋 내용 수정하기
* push 하지 않은 커밋을 수정할 경우

```sh
$ git commit --amend
```
* staging area에 있는 파일을 이전 커밋에 함께 포함시킨다

### example
```sh
$ git commit -m "initial commit"
$ git add forgotten_file
$ git commit --amend
```


<br>

## 파일 상태를 Unstage로 변경
```sh
$ git reset HEAD <file>

# example - 현재 디렉토리 내용
$ git reset HEAD .
```

<br>

> #### HEAD란?
> * 현재 branch의 마지막 commit snapshot
> * 현재 branch의 다음 commit의 부모 commit


---

<br>

> #### Reference
> * [2.4 Git의 기초 - 되돌리기](https://git-scm.com/book/ko/v2/Git%EC%9D%98-%EA%B8%B0%EC%B4%88-%EB%90%98%EB%8F%8C%EB%A6%AC%EA%B8%B0#_unstaging)
> * [7.7 Git 도구 - Reset 명확히 알고 가기](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-Reset-%EB%AA%85%ED%99%95%ED%9E%88-%EC%95%8C%EA%B3%A0-%EA%B0%80%EA%B8%B0)
