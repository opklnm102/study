# [CoreOS] CoreOS toolbox
> date - 2018.11.20  
> keyword - CoreOS, toolbox  
> CoreOS로 구성된 k8s Node에서 disk I/O issue 파악을 위해 tool을 사용해야 했는데 기본적으로 tool이 제공되지 않기 때문에 toolbox를 사용해야 한다

<br>


## toolbox
* CoreOS는 yum, dnf, apt 등과 같은 package manager를 제공하지 않고 `/usr`은 read only기 때문에 built-in이 아닌 tool을 설치하기 어렵다
  * toolbox 사용을 권장
* toolbox는 file system의 system PID, network interface 및 기타 global 정보에 엑세스할 수 있는 권한을 가진 계정(root)으로 container가 시작
* toolbox 내부의 file system은 /media/root에 마운트
* tcpdump 같은 debugging tool 사용 가능
* 기본적으로 Fedora Docker container를 사용


<br>

## install toolbox
```sh
$ toolbox  # or /usr/bin/toolbox

Downloading sha256:d0483bd5a55 [=============================] 87.3 MB / 87.3 MB
successfully removed aci for image: "sha512-d724d2a2b4e89e773af2aea9aa0610c808c2d5d6c8975553abcc1d98c3187497"
rm: 1 image(s) successfully removed
Spawning container core-fedora-latest on /var/lib/toolbox/core-fedora-latest.
Press ^] three times within 1s to kill container.

# toolbox 진입 상태
[root@ip-15-0-0-0]#
```

* Fedora linux image download 후 `systemd-nspawn`을 호출하여 container를 실행
* image는 `/var/lib/toolbox/[user name]-[image name]-[image tag]`에 저장
  * core user가 실행하는 기본 이미지는 `/var/lib/toolbox/core-fedora-latest`
  * container file system은 disk 공간을 사용
  * container 내부에서 변경한 내용을 다른 세션에서 공유된다


<br>

## toolbox에서 I/O issue를 해결하기 위해 tool 설치
* toolbox container 실행시 fedora의 namespace에 있으며 `dnf`로 tool을 설치할 수 있다

### install ps
```sh
[root@ip-15-0-0-0]# dnf install procps -y
```

### install iotop
```sh
[root@ip-15-0-0-0]# dnf install iotop -y
```

### install iostat
```sh
[root@ip-15-0-0-0]# dnf install sysstat -y
```

### install tcpdump
```sh
[root@ip-15-0-0-0]# dnf -y install tcpdump

[root@ip-15-0-0-0]# tcpdump -i eth0
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on ens3, link-type EN10MB (Ethernet), capture size 65535 bytes
```

<br>

> #### ifconfig 없이 network interface를 찾으려면??
> `/sys/class/net`를 확인하면 된다
>
> ```sh
> $ ls /sys/class/net
> cni0  docker0  eth0 lo
> ```
>

> 해결 과정은 [[Linux] Troubleshooting High I/O Wait in Linux](https://github.com/opklnm102/study/blob/master/linux/troubleshooting_high_io_wait_in_linux.md) 참고


<br>

## toolbox에 custom docker image를 사용하려면?
* `.toolboxrc`를 만들어 원하는 image 정의

```sh
$ cat .toolboxrc
TOOLBOX_DOCKER_IMAGE=index.example.com/debug
TOOLBOX_USER=root

$ toolbox
Pulling repository index.example.com/debug
...
```


<br>

## toolbox를 SSH로 바로 사용하려면?
* `/etc/passwd`에 아래 내용 추가
```sh
$ useradd bob -m -p '*' -s /user/bin/toolbox -U -G sudo,docker,rkt
```

* usage
```sh
$ ssh bob@example.com

....
```

<br>

> #### Reference
> * [Install debugging tools - CoreOS](https://coreos.com/os/docs/latest/install-debugging-tools.html)
> * [toolbox - bring your tools with you](https://github.com/coreos/toolbox)
> * [Wheezy: "ps: command not found"](https://github.com/tianon/docker-brew-debian/issues/13)
> * [How to install and use iostat](https://www.globo.tech/learning-center/install-use-iostat/)
