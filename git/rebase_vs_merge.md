# rebase와 merge

## rebase
* chery-pick과 유사하지만 여러개의 commit을 동시에 다룰 수 있다

### target branch의 변경사항을 모두 가져와 현재 branch에 반영
```sh
$ git rebase <branch name>
```
* 여러개의 commit을 순서대로 가져온다
* 공통 조상부터 target branch의 마지막 commit까지 순서대로 하나씩 가져와 현재 branch에 덧붙인다
* 현재 branch에만 새로운 commit이 생성

### commit의 순서를 재정렬하고 첨삭 
* `-i(interactive)`
   * commit들의 순서를 바꾸고 첨삭하거나 몇개의 commit을 하나로 합치는 등의 작업을 수행한 뒤 가져온다
* 현재 branch에서 작업한 몇개의 commit들을 편집할 때도 유용
```sh
$ git rebase -i HEAD~3  # 현재 branch의 HEAD로부터 3개의 commit 편집
```

## merge
* 현재 branch에 다른 branch를 합치는 작업

### Commit Merge
![commit merge](http://www.deferredprocrastination.co.uk/blog/uploads/2012/05/commit-merge.png)
```sh
$ git merge --n <branch name>
```
* merge commit이 1개 생긴다
* 취소하려면 merge commit만 삭제하면 된다

### Fast-forward Merge
![fast-forward mrege](http://www.deferredprocrastination.co.uk/blog/uploads/2012/05/ff-merge.png)]
```sh
$ git merge <branch name>
```
* 합칠 branch가 분기된 후, 현재 branch에 추가된 commit이 없을 경우 사용
* 현재 branch를 가리키는 HEAD를 합칠 branch의 마지막 commit으로 옮긴다

### No Fast-forward Merge
![no fast-forward merge](http://www.deferredprocrastination.co.uk/blog/uploads/2012/05/no-ff-merge.png)
```sh
$ git merge --no-ff <branch name>
```
* fast forward가 가능한 생태지만 merge commit을 남긴다


## rebase vs merge
* merge
   * commit id가 보존
   * 장기적으로 추가적인 작업이 필요할 경우
      * 큰 규모의 topic
* rebase
   * 새로운 commit이 생겨 commit id가 바뀜 
   * local 개인 branch에서 작업 후 main stream에 반영하기 위해
   * 단기간에 끝나는 경우
      * hotfix


> #### 참고
> [Git Un-Merge](http://www.deferredprocrastination.co.uk/blog/2012/git-un-merge/)
