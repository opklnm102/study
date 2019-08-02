# [Docker] Using the Git commit hash as a tag in the Docker Hub automated builds
> date - 2019.08.02  
> keyword - docker hub, image tag, build hooks  
> Docker Hub의 Automated Builds에서 commit hash를 tag로 사용하기 위한 방법을 정리

<br>

## Issue
* image tag에 commit hash를 사용해 commit마다 image build를 하고 싶었다
* [Docker Hub의 Automated Builds](https://docs.docker.com/docker-hub/builds/) 사용시 `{sourceref}`로 build를 trigger한 branch나 tag 정보를 가져올 수 있으나
commit hash는 가져올 수 없더라...


<br>

## Resolve
* **Custom build phase hooks** 중 `hooks/post_push`에서 build시 제공되는 환경 변수인 `SOURCE_BRANCH`, `SOURCE_COMMIT`를 사용하면 가능하다
* `hooks/xxx`는 build context 경로에 있으면 자동으로 사용된다
  * post_checkout
  * pre_build
  * post_build
  * pre_test
  * post_test
  * pre_push
  * post_push


<br>

### Basic
* `hooks/post_push` script 작성
* 간단히 commit hash를 image tag로 사용
```sh
#!/bin/bash
# hooks/post_push
# https://docs.docker.com/docker-hub/builds/advanced/

docker tag $IMAGE_NAME $DOCKER_REPO:$SOURCE_COMMIT
docker push $DOCKER_REPO:$SOURCE_COMMIT
```


<br>

### Git flow의 feature branch에서만 commit hash를 사용
```sh
#!/bin/bash
# hooks/post_push
# https://docs.docker.com/docker-hub/builds/advanced/

function add_tag() {
  echo "Adding tag ${1}"
  docker tag $IMAGE_NAME $DOCKER_REPO:${1}
  docker push $DOCKER_REPO:${1}
}

# feature/add-post-push-hooks 인 경우 image tag로 '/'를 사용하면 docker hub에서 parsing error가 발생하므로 '/' 제거해준다
if [[ "${SOURCE_BRANCH}" == "feature"* ]]; then
  TAG=$(echo ${SOURCE_BRANCH} | cut -d '/' -f 2)-${SOURCE_COMMIT}
  add_tag ${TAG}
fi
```


<br><br>

> #### Reference
> * [Set up Automated builds - Docker Docs](https://docs.docker.com/docker-hub/builds/)
> * [Advanced options for Autobuild and Autotest - Docker Docs](https://docs.docker.com/docker-hub/builds/advanced/)
> * [Docker Parameterized Builds Using Git Tags, Part 1 of 2](https://objectpartners.com/2017/09/20/docker-parameterized-builds-using-git-tags-part-1-of-2/)
