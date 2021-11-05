# [k8s] Helm Diff plugin
> date - 2021.11.05  
> keyworkd - kubernetes, k8s, helm  
> helm upgrade시 release 들의 차이를 쉽게 확인할 수 있는 helm-diff plugin에 대해 알아보자

<br>

## Helm Diff
* helm upgrade가 변경될 사항에 대한 preview 제공
* `latest deployed version`과 `helm upgrade --debug --dry-run`의 차이를 생성
* upgrade뿐만 아니라 생성된 revision에 대한 변경 사항을 확인하기에도 편하다


<br>

## Install
```sh
$ helm plugin install https://github.com/databus23/helm-diff

## check install
$ helm plugin list
NAME	VERSION	DESCRIPTION
diff	3.1.3  	Preview helm upgrade changes as a diff
```


<br>

## Usage
```sh
$ helm diff [command] [flags]
```

<br>

### upgrade
* help
```sh
$ helm diff upgrade -h
```

* diff upgrade
```sh
$ helm diff upgrade [release] [chart]

## example
$ helm diff upgrade my-release stable/my-app -f values.yaml

default, my-app, Deployment (apps) has changed:
...
- checksum/xxx_token: 29055b76ed43ab8c24a5567fdedad5f566651491de42a9cbc6ba9bfce90269a2
+ checksum/xxx_token: acd6229fcd3b78c574910fe2dda705bec698fc4ebbdfb7d315bd0f10c6204fff
```

<br>

### release
* help
```sh
$ helm diff release -h
```

* diff release1 with release2
```sh
$ helm diff release [release1] [release2]

## example
$ helm diff release my-prod my-stage
```

<br>

### revision
* help
```sh
$ helm diff revision -h
```

* diff latest revision with specified revision
```sh
$ helm diff revision [release] [revision]

## example
$ helm diff revision my-release 2
```

* diff revision1 with revision2
```sh
$ helm diff revision [release] [revision1] [revision2]

## example
$ helm diff revision my-release 2 3
```


<br>

### rollback
* help
```sh
$ helm diff rollback -h
```

* diff rollback
```sh
$ helm diff rollback [release] [previous revision]

## example
$ helm diff rollback my-release 2
```


<br>

## Conclusion
* helm upgrade 전에 helm-diff plugin으로 변경 사항을 편하게 확인할 수 있다
* CI에서 `helm diff`의 결과를 reporting하면 더 편하게 사용할 수 있다
  * GitOps repository에 Pull Request 생성 -> CI에서 helm diff 실행 -> helm diff 결과 Pull Request에 reporting -> 확인 후 approve


<br><br>

> #### Reference
> * [How to see what has changed in new helm chart relase](https://stackoverflow.com/questions/62770290/how-to-see-what-has-changed-in-new-helm-chart-relase)
> * [Helm Plugins - Helm Docs](https://helm.sh/docs/community/related/#helm-plugins)
> * [databus23/helm-diff - Github](https://github.com/databus23/helm-diff)
