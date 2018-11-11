# [k8s] kubectl copy
> date - 2018.11.12  
> keyword - kubernetes, k8s, cp  
> scp와 비슷한 기능을 `kubectl cp`가 있다

<br>

## Syntax
```sh
$ kubectl cp <src file path> <dest file path>

# example
$ kubectl cp /tmp/foo /tmp/bar
```

<br>

## Pod의 특정 conatiner로 복사
* `-c <specific container name>`
  * 생략시 pod의 1번째 container로 복사

```sh
$ kubectl cp <src file path> <dest file path> -c <specific container name>

# example
$ kubectl cp /tmp/foo /tmp/bar -c 2002382vdfd32d
```


<br>

## local -> pod 
```sh
$ kubectl cp <src file path> <namespace>/<specific pod>:<dest file path>

# example
## /tmp/foo directory를 worker-pod1(default namespace)의 /tmp/bar/로 복사
$ kubectl cp /tmp/foo default/worker-pod1:/tmp/bar/

## /tmp/foo/test.sh file을 worker-pod1(default namespace)의 /tmp/bar/로 복사
$ kubectl cp /tmp/foo/test.sh default/worker-pod1:/tmp/bar/
```
> 특정 파일들을 이름 변경 못하고 그대로 dest path에 복사한다


<br>

## pod -> local
```sh
$ kubectl cp <namespace>/<specific pod>:<src file path> <dest file path>

# example
## worker-pod1(default namespace)의 ~/tmp/foo.txt file을 /tmp/bar/로 복사
$ kubectl cp default/worker-pod1:tmp/foo.txt /tmp/bar/

## container의 root부터 시작하면 아래의 warn message가 나오지만 복사는 된다
$ kubectl cp default/worker-pod1:/app/tmp/foo.txt /tmp/bar/
tar: Removing leading `/' from member names
```


<br>

> #### Reference
> * [Copy directories and files to and from Kubernetes Container [POD]](https://medium.com/@nnilesh7756/copy-directories-and-files-to-and-from-kubernetes-container-pod-19612fa74660)
> * [kubectl command cp - kubernetes docs](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp)
