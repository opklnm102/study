# [Docker] Docker image tag and git flow
> date - 2019.08.04  
> keyworkd - docker image tag, git flow  
> git flow에서 Docker image tag를 어떻게 사용하면 좋을지에 대해 정리

<br>

## image의 tag는 항상 같은 image를 의미하지 않는다
* 이미 존재하는 tag로 image를 build하면 **새로운 image를 reference**하기 때문
* `example-image:1.0`처럼 image tag를 사용하면?
  * 장점으로는 동일한 버전에서의 **수정 사항을 암시적으로 배포**할 수 있다는 것
  * 단점으로는 **암시적 배포로 인해 예상치 못한 에러가 발생**할 수 있다는 것

<br>

### immutable image reference concept
* Docker는 **immutable image reference concept**을 가지고 있다
* **digest**를 사용해 특정 image만 사용할 수 있다
```sh
$ docker pull example-image:1.0@sha256:immutabledigest123
```


<br>

## Each commit is a deployment candidate
* Continuous Delivery에서 모든 commit은 deploy될 수 있다는 원칙에 기반하여 생각해봤을 때, commit 전에 배포될 것인지 결정되지 않고, 몇 가지 단계를 거친 후 배포될지 말지 결정된다
  * compile
  * unit tests
  * static code analysis
  * isolated application tests
  * deployment on staging environments
  * integration tests
  * customer acceptance tests 
  * ...

<br>

### git flow의 branch 정보를 사용해 build pipeline에서 각 단계를 의미하는 tag를 생성
| git branch / tag | image tag |
|:--|:-- |
| tag x.y.z | example-image:x.y.z |
| master | example-image:latest |
| develop | example-image:develop |
| release/x.x | example-image:release-1.4 |
| feature/xxx | example-image:feature-xxx |
| always | example-image:git-commit-revision-digest |

* `commit revision digest`를 tag에 사용 했을 때 너무 많은 image가 생성되는게 아닐까? 라는 의문이 들겠지만 실제로는 **서로 다른 tag가 동일한 image를 reference**하기 때문에 disk space 등의 문제는 없다
* git flow를 따라 일정한 lifecycle을 가지게 되므로 build pipeline을 통해 rollback process를 정의하기 편하다


<br><br>

> #### Reference
> * [Docker & git flow - A symbiosis](https://medium.com/faun/docker-git-flow-a-symbiosis-a9cfa4658162)
