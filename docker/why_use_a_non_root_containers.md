# [Docker] Why use a non-root containers
> date - 2020.11.08  
> keyworkd - container, docker, kubernetes, non-root container, rootless container  
> non-root containerr가 무엇인지, 왜 사용해야하는지, 어떻게 사용하는지에 관련된 내용을 정리  

<br>

## TL;DR
* container의 process를 root로 실행하거나, root로 가정하면 안된다
* security를 위해 known UID, GID를 사용하여 container를 사용해야 한다
  * `Dockerfile`에서 user 생성하여 사용 or 실행시 user 지정

<br>

## Introduce non-root conaitner
* non-root container는 security layer가 추가되고, production에 권장
* non-root는 permission으로 인해 작업의 제한이 있다
* security 관점에서 root로 container process를 실행하는 것은 host의 root로 process를 실행하는 것만큼 좋지 않다
  * container에서 벗어나면 root로 host에 access할 수 있어서 위험

<br>

### 기본적으로 `Docker`는 container를 `root privileges`로 실행
* 기능 access에 제약이 없다
  * install system packages
  * edit configuration files
  * bind privileged port
* development에는 유용 production에서는 보안에 취약
  * root로 실행된 container에 access하여 공격할 수 있으므로
  * system을 수정하여 오동작, 권한 있는 process 중지 등 system에 혼란을 야기
* non-root로 실행하면 container 내부에서 실행할 수 있는 process와 user가 제한되어 security layer가 추가된다

<br>

### container를 사용하면서부터 permission 분리 더욱 간단
* 대부분의 container runtime은 host와 container 사이에 root를 공유
* container는 **namespace(PID, net, mount, IPC)와 dropped set of capabilities로 isolated(sandbox)**
* container에서 root를 사용하는 것은 안전하여 application은 root로 실행되는 것이 일반적
* 그럼에도 불구하고 non-root container를 사용하여 container 내부의 중요한 파일에 대한 access를 제한
  * container에 침입하여 공격 받을 때의 피해 범위를 최소화한다
  * 좋은 design 중 하나로 [Jenkins](https://github.com/jenkinsci/docker/blob/master/README.md)가 있다
* kernel에서 host와 container의 UID, GID를 구분하지 않으면 container process로 모든 것을 노출하는 container runtime 취약점은 위험
  * root container라면 container breakout에 성공할 가능성이 훨씬 높다
  * privileged escalation 없이 system의 모든 파일 수정 가능
* 일부 container escape vulnerabilities는 root privileges 필요
  * CVE-2016-9962
    * runc의 취약점
    * container process가 capabilities가 제거되기 전에 host에서 file-descriptors를 잡아서 container를 탈출할 수 있도록 한다
  * CVE-2019-5736
  * CVE-2019-11245
    * 2019-05-31 Kubernetes에서 발견
    * non-root container가 reuse or restart시 root container로 시작하는 취약점
    * Kubernetes component 중 dockershim 관련 이슈

<br>

## Differences/Advantages/Disadvantages between root and non-root containers

### Differences
* Docker로 container를 실행하려면 Docker daemon 실행이 필요하고, **Docker daemon은 root privileges 필요**
  * Docker daemon은 host filesystem을 수정할 수 있는 권한이 필요하기 때문
  * 자세한 것은 [Docker security docs](https://docs.docker.com/engine/security/) 참고
* **대부분의 containerized process는 root privileged가 필요하지 않다**
  * applications, databases, load balancers 등을 root로 실행해서는 안된다

#### 처음부터 container를 non-root로 실행하여 보안을 제공하지 않는 이유는?
* [Principle of Least Privilege(PoLP)](https://en.wikipedia.org/wiki/Principle_of_least_privilege)에 따라 root container와 non-root container의 주요 차이점은 **필요한 최소한의 권한을 보장하는데 초점을 맞추고 있다는 것**
  * secure system design시 중요
  * root access를 제한함으로써 보안을 강화
* root container는 다음과 같은 작업이 가능
  * container system을 수정하기 위한 host filesystem 편집, runtime에서 system packages 설치 등 작업 가능
  * well-known port(1024 미만) binding 가능
* non-root container은 `namespace`로 인해 아래와 같은 제한이 있다
  * 특정 process를 실행할 수 있는 user 제한
  * accessable volume 제한
  * accessable port(not well-known port) 제한

<br>

### Advantages of non-root containers
* Security
  * non-root container에서는 **privilege escalation이 불가능**하여 host filesystem의 권한을 획득할 수 없으므로 root container보다 안전
* Avoid Platform restrictions
  * 일부 Kubernetes distributions(OpenShift 등)는 random UUID를 사용하여 container 실행
  * root-only container와는 호환되지 않는다

<br>

### Disadvantages of non-root containers
* Failed writes on mounted volumes
  * Docker는 host UUID, GUID를 유지하면서 host volume을 mount
  * container를 실행하는 user에게 host volume에 대한 권한이 없을 경우 이슈 발생
* Failed writes on persistent volumes in Kubernetes
  * Kubernetes의 persistent volume은 root로 mount되므로 root가 아닌 container에는 write 권한이 없다
* Issues with specific utilities or services
  * Git, PostgreSQL 등에서는 사전 검사로 `/etc/passwd`에서 user를 찾는데, non-root container에서는 실패한다


<br>

## User namespaces and rootless containers
* [user namespace](https://man7.org/linux/man-pages/man7/user_namespaces.7.html)
* container의 root 문제를 해결하기 위해 design된 Linux kernel development로써 **container의 UID, GID isolated 가능**
  * kernel이 container 내부에서 process를 생성하면 user namespace는 container 내부의 process의 uid를 container outside의 uid에 mapping하여 **host와 container의 user, group 구분**
  * container 내부에서 root(UID 0)로 실행되는 process가 host에서 다른 UID로 될 수 있다
  * process가 container를 벗어나면 kernel은 유효한 user를 매핑된 non-root UID로 취급하여 해당 process는 host의 root privileged를 가지지 않는다
* main container runtime은 user namespace가 default가 아니다
  * Linux 3.8의 kernel에 추가
  * 2015년 Docker에 통합되었으나 몇가지 제한 때문에 default mode가 아니다
    * external volume or storage driver mapping을 인식 불가
    * host의 file mount시 file permissions 이슈 등

<br>

### rootless container
* host에서 unprivileged user가 사용할 수 있는 container
* user namespcae를 이용
  * user namespcae가 없으면 rootless container여도 privileged escalation 취약점이 존재
  * `setuid` 취약점은 container의 root가 host의 root로 mapping되지 않으면 불가능
* docker 등의 runtime에는 root로 실행된 daemon이 필요하지만 rootless container는 additional capabilities 없이 모든 user가 실행 가능
* container runtime의 vulnerabilities로 인해 designed
* major container tool은 rootless mode released
  * runc, docker 등
  * PodMan(daemonless) - native rootless container engine
* rootless를 이해하려면 -> container internal root 이해와 container external root 이해 필요

| | Root Outside | User Outside |
|:--|:--|:--|
| Root Inside | # whoami <br> root <br><br> # podman run -it ubi8 bash <br> # whoami <br> root | $ whoami <br> fatherlinux <br><br> $ podman run -it ubi8 bash <br> # whoami <br> root |
| User Inside | # whoami <br> root <br><br> # podman run -itu sync ubi8 bash <br> $ whoami <br> sync | $ whoami <br> fatherlinux <br><br> $ podman run -itu sync ubi8 bash <br> $ whoami <br> sync |

<br>

#### Advantages
* host의 non-privileged user가 container를 실행할 수 있다
* nested container 실행 가능


<br>

## Building a non-root containers

### Docker
#### 1. Dockerfile에서 `USER` instruction 사용 
* 후속 명령 및 실행시 원하는 UID 사용 가능
* 많은 image가 마지막에 `USER` instruction 사용
* original image를 `FROM` layer로 사용 후 known UID로 user 추가 후 `ENTRYPOINT`, `CMD` instruction을 지정
* 최소한의 권한으로 user/group의 context에서 container를 쉽게 실행할 수 있다
* base image 변경시 rebuild가 필요한 번거로움이 있다
```dockerfile
FROM [base image]

# Set the home directory to our app user's home
ENV HOME=/home/app
ENV APP_HOME=${HOME}/my-project

# Create an app user and home directory so our program doesn't run as root
RUN groupadd -r app \
  && useradd -r -g app -d ${HOME} -m -s /usr/sbin/nologin -c "container user" app

# SETTING UP THE APP
WORKDIR $APP_HOME

# Copy in the application code and chown all files to the app user
COPY --chown=app:app . $APP_HOME

# Change to the app user
USER app
...
```

<br>

> * user, group의 다른 방법
> ```dockerfile
> RUN groupadd --gid 5000 [group] \
>   && useradd --home-dir /home/[user] --create-home --uid 5000 \
>              --gid 5000 --shell /usr/sbin/nologin --comment "container user" [user]
> 
> ## or
> RUN groupadd -g 5000 [group] \
>   && useradd -d /home/[user] -m -u 5000 -g [group] -s /usr/sbin/nologin -c "container user" [user]
> ```

<br>

#### 2. Specify a `uid` when starting the container
* `--user` flag를 사용하여 사용자가 어떤 user로 동작시킬지 선택할 수 있다
```sh
$ docker run --user [uid]]:[gid] [image]

## or current user
$ docker run --user $(id -u):$(id -g) [image]
```

<br>

### Docker compose
```yaml
version: "3.7"
services:
  app:
    user: ${CURRENT_USER}  # here
    ...
    volumes:
      - .:/app
```
```sh
$ CURRENT_USER=$(id -u):$(id -g) docker-compose up
```

<br>

### Volumes in Kubernetes
* Data persistence는 persistent volumes을 사용하여 설정
* kubernetes에서 root로 mount하기 때문에 non-root container에서는 write할 수 없다
* `Security Context`
  * `runAsUser`로 특정 UID로 실행
* `Pod Security Policy`
  * `MustRunAs`로 지정한 range의 UID로 실행되도록 제한
  * `MustRunAsNonRoot`로 non-root로 실행되도록 제한

#### 1. non-root container에 mount하기 전에 **init-container**를 사용
```yaml
spec:
  initContainers:
  - name: volume-permissions
    image: busybox 
    command: ["sh", "-c", "chmod -R g+rwX /home/nginx"]  # here
    volumeMounts:
    - mountPath: /home/nginx
      name: nginx-data
  containers:
  - image: nginx:1.19
    name: nginx
    volumeMounts:
    - mountPath: /home/nginx
      name: nginx-data
```

#### 2. Pod Security Policies를 사용해 Pod volume을 소유할 UID, fsGroup 설정(권장)
```yaml
spec:
  securityContext:  # here
    runAsUser: 101
    fsGroup: 101
  containers:
  - image: nginx:1.19
    name: nginx
    volumeMounts:
    - mountPath: /home/nginx
      name: nginx-data
```

#### 3. ConfigMap in Kubernetes
* configmap을 non-root container에 mount하면 root permission이 설정되므로 `Pod Security Policies`를 사용하여 permission 수정

<br>

> #### [Paly With Docker(PWD)](https://labs.play-with-docker.com/)
> * Docker 기능 testing에 유용한 서비스

<br>

> [Bitnami GitHub repository](https://github.com/search?q=org%3Abitnami+non-root&unscoped_q=non-root)에서 다양한 non-root container image 지원

<br>

## Conclusion
* container에서 root를 사용하는 것에는 문제가 없으나 security를 위해서는 container에서도 root를 사용하지 않는게 좋다
* non-root or rootless container 사용 권장


<br><br>

> #### Reference
> * [Why non-root containers are important for security](https://engineering.bitnami.com/articles/why-non-root-containers-are-important-for-security.html)
> * [Docker security docs](https://docs.docker.com/engine/security/)
> * [Principle of Least Privilege(PoLP)](https://en.wikipedia.org/wiki/Principle_of_least_privilege)
> * [Bitnami GitHub repository](https://github.com/search?q=org%3Abitnami+non-root&unscoped_q=non-root)
> * [Work With Non-Root Containers for Bitnami Applications](https://docs.bitnami.com/tutorials/work-with-non-root-containers/)
> * [Non-Root Containers, Kubernetes CVE-2019-11245 and Why You Should Care](https://unit42.paloaltonetworks.com/non-root-containers-kubernetes-cve-2019-11245-care)
> * [Processes In Containers Should Not Run As Root](https://medium.com/@mccode/processes-in-containers-should-not-run-as-root-2feae3f0df3b)
> * [Running a Docker container as a non-root user - Lucas Willson-Richter](https://medium.com/redbubble/running-a-docker-container-as-a-non-root-user-7d2e00f8ee15)
> * [Understanding root inside and outside a container](https://www.redhat.com/en/blog/understanding-root-inside-and-outside-container)
> * [Running a docker container as a non-root user](https://gist.github.com/alkrauss48/2dd9f9d84ed6ebff9240ccfa49a80662)

<br>

> #### Further reading
> * [Understanding how uid and gid work in Docker containers - Marc Campbell](https://medium.com/@mccode/understanding-how-uid-and-gid-work-in-docker-containers-c37a01d01cf)
> * [Just say no to root (containers) - Daniel J. Walsh](https://opensource.com/article/18/3/just-say-no-root-containers)
> * [Docker security](https://docs.docker.com/engine/security/)
