# [Container] Image publisher with Kaniko
> date - 2021.12.21  
> keyworkd - container, image build, kaniko  
> kaniko를 사용해 build pod를 생성하는 법을 정리

<br>

## TL;DR
* Kaniko context를 통해 git repository의 Dockerfile로 build할 수 있다


<br>

## Secret 생성
* dockerhub, git credentials 생성
```sh
$ kubectl create secret docker-registry regcred \
          --docker-server=https://index.docker.io/v1/ 
          --docker-username=<user> \
          --docker-password=<password> \
          --docker-email=<user@mail.com>

## 기존에 생성된 ssh key를 사용
$ kubectl create secret generic ssh-key-secret 
          --from-file=ssh-privatekey=.ssh/id_rsa \
          --from-file=ssh-publickey=.ssh/id_rsa.pub \
          --from-file=known_hosts=.ssh/known_hosts
```


<br>

## Kaniko Pod
* initContainer
  * kaniko context에 대한 workspace를 생성
  * Dockerfile이 있는 git repository clone
* kaniko container
  * image build
  * container registry로 image push

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kaniko
spec:
  initContainers:
  - name: git-clone
    image: alpine
    command: ["sh", "-c"]
    args: 
    - |
      apk add --no-cache git openssh 
      mkdir ~/.ssh/
      cp .ssh-src/* ~/.ssh/
      mv ~/.ssh/ssh-privatekey ~/.ssh/id_rsa
      mv ~/.ssh/ssh-privatekey ~/.ssh/id_rsa.pub

      eval `ssh-agent -s`
      ssh-add ~/.ssh/id_rsa
      ssh -v git@github.com
      git clone git@github.com:<user>/dummy-repo-kaniko-build.git /workspace
    volumeMounts:
    - name: docker-volume
      mountPath: /workspace
    - name: ssh-key-volume
      mountPath: ".ssh-src/"
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    args:
      - "--dockerfile=/workspace/Dockerfile"
      - "--context=dir:///workspace"
      - "--destination=<user>/myimage:1.0.0"
    volumeMounts:
      - name: kaniko-secret
        mountPath: /kaniko/.docker/
      - name: docker-volume
        mountPath: /workspace
  restartPolicy: Never
  volumes:
    - name: kaniko-secret
      secret:
        secretName: regcred
        items:
          - key: .dockerconfigjson
            path: config.json
    - name: ssh-key-volume
      secret:
        secretName: ssh-key-secret
        defaultMode: 0400
    - name: docker-volume
      emptyDir: {}
```

<br><br>

> #### Reference
> * [Kaniko는 프라이빗 리포지토리로 구축](https://ichi.pro/ko/kanikoneun-peulaibis-lipojitolilo-guchug-109183949055141)
