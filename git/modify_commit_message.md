# [git] push한 commit message 수정하기
> push까지 한 commit message를 수정하는 과정을 정리

## 1. rebase -i
```sh
# commit 1개 되돌리기
$ git rebase -i HEAD^

# commit 2개
$ git rebase -i HEAD~2                                           
```

## 2. 수정 대상 선택
* 수정할 commit을 pick 대신 edit으로 수정
```sh
# pick -> edit
pick a263cc0 Add: [Java] effective java 규칙 27. 제네릭 메소드를 애용하자 내용 정리 추가
pick 717262e Add: [Java] BigDecimal을 사용한 부동소수점 연산 정리 추가

# Rebase 2c97794..717262e onto 2c97794 (2 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

## 3. edit으로 지정한 commit 수만큼 git commit --amend 반복
```sh
$ git commit --amend

# commit mssage 수정 후 저장 -> 반복
```

## 4. 수정 작업 완료
```sh
$ git rebase --continue
```

> ### 작업을 중도에 취소하고 싶다면
> ```sh
> $ git rebase --abort
> ```

## 5. remote에 반영하기
```sh
$ git push origin master
To git@github.com:keesun/telepathy.git
! [rejected] master -> master (non-fast-forward)
error: failed to push some refs to ‘git@github.com:keesun/telepathy.git’
To prevent you from losing history, non-fast-forward updates were rejected
Merge the remote changes (e.g. ‘git pull’) before pushing again. See the
‘Note about fast-forwards’ section of ‘git push –help’ for details.
```
* remote 저장소에 데이터 손실을 불러올 수 있어서 reject

### remote에 데이터가 손실되도 push하기
```sh
$ git push origin +master
```

## 6. remote와 동기화
```sh
$ git pull
```


> #### 참고자료
> * [커밋 로그 조작](https://backlogtool.com/git-tutorial/kr/reference/log.html)

