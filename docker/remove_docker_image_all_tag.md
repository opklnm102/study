# [Docker] Remove docker images all tag
> date - 2018.10.12  
> keyword - docker  
> docker image 삭제하는 법을 정리

<br>

## 이미지 삭제하기
```sh
$ docker rmi <repository name>/<image name>:<tag>

# example
$ docker rmi fnproject/fn-java-fdk
```
* tag 생략 가능 - latest가 삭제된다


<br>

## 특정 이미지의 모든 tag 삭제하기
* tag별로 일일이 삭제하기는 불편하니...
```sh
$ docker image ls <repository name>/<image name> | tr -s ' ' | cut -d ' ' -f 2 | xargs -I {} docker rmi <repository name>/<image name>:{}

# example
$ docker images ls fnproject/fn-java-fdk | tr -s ' ' | cut -d ' ' -f 2 | xargs -I {} docker rmi fnproject/fn-java-fdk:{}
```


<br>

## 존재하는 모든 이미지 삭제하기
```sh
$ docker rmi `docker images -aq`

$ docker rmi $(docker images -aq)
```
* 사용중인 image(container로 실행중인)는 삭제되지 않는다
  * `Error response from daemon: conflict: unable to delete xxx (cannot be forced) - image is being used by running container xxx`


<br>

> #### Reference
> * [Delete docker image with all tags](https://medium.com/@itseranga/delete-docker-image-with-all-tags-c631f6049530)
> * [가장 빨리 만나는 Docker 20장 - 27. rmi](http://pyrasis.com/book/DockerForTheReallyImpatient/Chapter20/27)
