# cherry-pick을 사용하여 특정 commit 반영하기
> 작업을 하던 도중 베이스 브렌치를 잘못 선택했다는 것을 알게됨
> release를 베이스로 해야하지만 develop을 베이스로 했다...
> 작업 내역을 버리지 않고, 베이스 브렌치를 변경해야 한다!

## cherry-pick
* `cherry-pick은 commit을 새로 하는것과 같다`
* 다른 브렌치에 있는 특정 커밋을 현재 브렌치에 반영
* 특정 commit과 같은 commit을 새로 만들어서 현재 branch에 붙이는 작업
* 복수의 commit을 가져올 경우 오래된 시간순으로 하나씩 해야함

```sh
$ git checkout <branch name>
$ git cherry-pick <commit hash>
```

브렌치를 다시 만들고 cherry-pick으로 작업했던 커밋들을 가져오자
```sh
$ git checkout release  # base branch로 이동
$ git checkout -b fix-bug  # create branch
$ git cherry-pick <commit hash>  # 특정 commit을 가져온다
```
이런 뒤 충돌을 해결하면 끝
