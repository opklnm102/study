# [Linux] systemctl
> date - 2018.08.06    
> keyword - linux, systemctl
> chkconfig에 대해 정리하다가 알게된 systemctl에 정리

<br>

```sh
# Amazon Linix 2 AMI
$ sudo chkconfig nginx on
알림: 'systemctl enable nginx.service'에 요청을 전송하고 있습니다.
Created symlink from
/etc/systemd/system/multi-user.target.wants/nginx.service to /usr/lib/systemd/system/nginx.service.
```
* Amazon Linix 2 AMI에서는 chkconfig 사용시 `systemctl`로 전송해준다

<br>

## systemctl이란?
* 오랫동안 daemon이라는 background 프로그램은 inits cript를 사용해 구동했다
  * init script는 읽고 해석, 변경에 어려움이 있다
* RHEL 7/CentOS 7에 도입된 `Systemd`라는 서비스 관리 애플리케이션이 init script를 대체
  * 최신 리눅스 배포판에서는 필요한 서비스를 시작하는 역할은 systemd가 맡고 있을 가능성이 높다
* systemd를 관리하는 명령어가 `systemctl`
 

### Linux의 기본 뼈대 프로세스
* Linux는 OS라서 부팅되는 과정에서 리눅스 커널이 부팅된 후 `시스템을 초기화`하고 기타 서비스들을 위한 `환경을 조성하고, 시작`시켜주는 일을 하는 process가 필요
* CentOS 6까지는 SysV라고 해서 init process가 담당
  * 커널이 메모리에 로딩되면 가장 먼저 실행되는 process로 init process를 실행
  * init process는 init script, init 설정 등을 기반으로 RunLevel이나 각 서비스별 실행 스크립트를 실행
* RHEL 7/CentOS 7에서부터 SysV의 init 프로세스를 버리고 systemd로 변경


### Systemd가 제공하는 기능
* 시스템 부팅 프로세스
* Service Management
* cgroup을 이용한 프로세스 자원관리
* 서비스 프로세스 관리
* Performance Management
  * profiles
  * tuning
  * optimized

> daemon 프로그램들을 위한 로깅, 자원할당, 부팅관리 등 Systemd로 모두 할 수 있디

<br>

> #### Systemd의 가장 큰 불만 중 하나는..?
> * 할 수 있는 일이 너무 많다는 것
> * 보통 유닉스 프로그램은 보통 1가지 일을 하되, 아주 잘하는 것을 목표로 만들어진다

---

<br>

## Service Management

### Unit
* `systemd`에서 작업 대상
* systemd가 관리하는 방법을 알고 있는 리소스
* 나타내는 리소스 유형으로 분류되며 단위 파일로 알려진 파일로 정의
* 유형은 파일 끝에 있는 접미어에서 유추할 수 있다
  * 서비스 관리 작업의 경우 `.service`
* 서비스 관리 명령을 사용할 때 `.service` 생략 가능

```sh
$ systemctl start nginx.service
$ systemctl start nginx
```

### 주요 명령어
* systemctl
* systemd-analyze
* systemd-cgls
* systemd-cgtop
* systemd-loginctl

### 실행중인 서비스 조회하기
```sh
$ systemctl list-units --type=service  # or $ systemctl

# example
$ systemctl list-units --type=service
TODO: 실행해보고 결과 추가
```

### TODO: 위와 차이가 뭔지 알아보기.. 서비스 리스트 조회
```sh
$ systemctl list-units
```

### systemd 모든 서비스 조회하기
```sh
$ systemctl list-unit-files

# example
$ systemctl list-unit-files
nginx.service                                 disabled
...
```

### 서비스 의존성 확인
* 각 서비스들은 서로간의 의존관계를 가지고 있다 
```sh
$ systemctl list-dependencies

TODO: 실행해보고 결과 추가
```

### 특정 서비스의 의존성 확인
* 특정 서비스에 대해 활성화된 서비스
```sh
$ systemctl list-dependencies <target>

# example
$ systemctl list-dependencies nginx
TODO: 실행해보고 결과 추가
```

### 구동에 실패한 서비스
```sh
$ systemctl list-units --state=failed
TODO: 결과...
```

### 모든 active 리스트
```sh
$ systemctl list-units --state=active
TODO: 결과...
```

### 상태가 inactive인 리스트
```sh
$ systemctl list-units --all --state=inactive
TODO: 결과...
```

### 상태가 running인 리스트
```sh
$ systemctl list-units --type=service --state=running
TODO: 결과...
```

### 서비스 상태 확인하기
```sh
$ systemctl status <service name>

# example
$ systemctl status nginx.service
TODO: 결과...
```

### 부팅시 서비스 활성화(자동 실행)
```sh
$ systemctl enable <service name>

# example
$ systemctl enable nginx.service
TODO: 결과...
```
* 자동 시작을 위한 심볼링 링크가 생성된다
  * `/lib/systemd/system <- /etc/systemd/system`

### 부팅시 서비스 비활성화(자동 실행 안하기)
```sh
$ systemctl disable <service name>

# example
$ systemctl disable nginx.service
TODO: 결과...
```

### 서비스 시작하기
```sh
$ systemctl start <service name>

# example
$ systemctl start nginx.service
TODO: 결과...
```

### 서비스 중지하기
```sh
$ systemctl stop <service name>

# example
$ systemctl stop nginx.service
TODO: 결과...
```

### 서비스 재시작하기
```sh
$ systemctl restart <service name>

# example
$ systemctl restart nginx.service
TODO: 결과...
```

### 서비스 리로드
```sh
$ systemctl reload <service name>

# example
$ systemctl reload nginx.service
TODO: 결과...
```

### 서비스 리로드 or 재시작
* reload 기능이 있는지 확실하지 않으면 사용
* 가능한 경우 reload, 아니면 restart
```sh
$ systemctl reload-or-restart <service name>

# example
$ systemctl reload-or-restart nginx.service
TODO: 결과...
```

### 서비스 활성화 여부 조회
```sh
$ systemctl is-enabled <service name>

# example
$ systemctl is-enabled nginx.service
TODO: 결과...
```

### 서비스 실행 여부 조회
```sh
$ systemctl is-active <service name>

# example
$ systemctl is-active nginx.service
TODO: 결과...
```

### 서비스 실패 여부 확인
```sh
$ systemctl is-failed <service name>

# example
$ systemctl is-failed nginx.service
TODO: 결과...
```

### 서비스의 systemd 정보 확인

```sh
$ systemctl show <service name>

# example
$ systemctl show nginx.service
TODO: 결과...
```

### systemd 재시작
```sh
$ systemctl damon-reload
TODO: 결과...
```

---

<br>

## journalctl
* Query the systemd journal log

### 자세한 systemctl error log 조회
```sh
$ joirnalctl -xn

TODO: 결과..
```

### 마지막 error log line 보기
```sh
$ journalctl -xe

TODO: 결과..
```

### 짤리는 페이지 개행하기
```sh
$ journalctl -xn --no-pager | less

TODO: 결과..
```



## System State Overview
* 현재 시스템 상태를 알 수 있는 명령어

### Listing Current Units
* active unit 조회
```sh
$ systemctl list-units

TODO: 결과 추가..
# list-units은 active unit만 표시하므로 전부 loaded, active
```

* UNIT
  * `systemd` unit name
* LOAD
  * unit의 설정이 systemd에 의해 파생되었는지 여부
  * 로드된 unit 구성은 메모리에 유지
* ACTIVE
  * 활성 상태 여부
* SUB
  * 자세한 정보를 나타내는 하위 레벨 상태
  * unit type, state, unit이 실행되는 실제 방법에 따라 다르다
* DESCRIPTION
  * 짧은 설명




### 현재 systemd가 로드한 모든 unit 조회
* 일부 장치는 실행 후 비활성화 상태가 되고 시스템에서 로드하려고 시도한 일부 장치는 발견되지 않을 수 있다
```sh
systemctl list-units --all
```

### systemd에서 사용 가능한 모든 unit file 조회
* list-units은 systemd가 메모리로 로드한 unit만 표시
```sh
$ systemctl list-unit-files
```

* unit
  * systemd가 알고 있는 resource의 표현
* STATE
  * enabled
  * disabled
  * static - unit을 enable시키는데 사용되는 install section이 없다
  * masked


---

<br>

## Unit Management

### unit file 내용 확인
```sh
$ systemctl cat <service name>

# example
$ systemctl cat nginx.service
```

###
$ systemctl list-dependencies nginx.service


$ systemctl list-dependencies --all nginx.service
모든 종속성 unit 조회

$ systemctl list-dependencies --reverse nginx.service
역방향 모든 종속성 unit 조회

$ systemctl list-dependencies --before nginx.service
앞에 시작하는 종속된 unit 조회

$ systemctl list-dependencies --after nginx.service
뒤에 시작하는 종속된 unit 조회


### low-level properties 조회
```sh
$ systemctl show <service name>

# example
$ systemctl show nginx.service

TODO: 결과
```

* 단일 property 표시
```sh
$ systemctl show <service name> -p <property name>

# example
$ systemctl show nginx.service -p Conflicts

TODO: 결과
```


### unit masking
* /dev/null에 링크하여 완전히 자동/수동으로 완전히 시작 불가능한 상태로 표시

```sh
$ systemctl mask <service name>

# example
$ systemctl mask nginx.service

$ systemctl list-unit-files
TODO: 결과 추가
kmod-static-nodes.service              static  
ldconfig.service                       static  
mandb.service                          static  
messagebus.service                     static  
nginx.service                          `masked`
quotaon.service                        static  
rc-local.service                       static  
rdisc.service                          disabled
rescue.service                         static
. . .

# 시작하려고 하면
$ sudo systemctl start nginx.service
Failed to start nginx.service: Unit nginx.service is masked. 
```

### unit unmasking
```sh
$ systemctl unmask <service name>

# example
$ systemctl unmask nginx.service
```

---

<br>

## Unit File 편집
* Systemd는 `/usr/lib/system`에 Unit File 보관
* 커스터마이징을 위해 해당 파일을 직접 수정하지 말고, `/etc/systemd/system/nginx.service.d`에 .conf로 끝나는 설정파일을 만들면 된다
* 이런 과정은 번거롭고, 실수도 많기 때문에 systemd에서 제공하는 기능을 사용하자

```sh
$ systemctl edit <service name>

# example
$ systemctl edit nginx.service
```
* 위 명령어는 다음을 수행
  1. `/etc/systemd/system/nginx.service.d` 생성
  2. 시스템에 등록된 편집기 오픈
  3. 내용을 입력하고 저장하면 1에서 생성한 디렉토리에 override.conf를 생성하고 내용을 읽는다
    * systemctl daemon-reload는 불필요
* /usr/lib/system/nginx.service Unit File 자체를 편집하고 싶다면 `-full`을 사용

```sh
$ systemctl edit <service name> --full

# example
$ systemctl edit nginx.service --full
```

### 편집한 내용 제거
```sh
$ sudo rm -r /etc/systemd/system/nginx.servicd.d

# --full mode 내용 지우기
$ sudo rm /etc/systemd/system/nginx.service

# reload 필요
$ systemctl damon-reload
```

---

<br>

## target 으로 System State(Runlevel) 조정하기

### target
* 시스템 상태, 동기화 지점을 설명하는 특수 unit file
* 동시에 서비스들을 시작하는 걸 허용하기 위한 그룹 메커니즘
  * unit을 grouping
* 접미사 `.target` 사용
* 기존 SysV init의 run level과 같은 개념
* systemd의 default target은 `default.target`
  * 실제로는 다중 사용자 모드인 `multi-user.target`
* init system이 runlevel을 사용하는 것처럼 시스템을 특정 상태로 가져오기 위해 사용
* 특정 기능을 사용할 수 있는 경우 해당 상태를 생성하는데 필요한 unut 대신 원하는 상태 지정
  * ex) swap을 사용할 준비가 되었음을 나타내기 위해 사용하는 swap.target
    * 이 프로세스의 일부인 unit은 `WantedBy=`, `RequiredBy=swap.target`로 동기화 할수 있다
    * swap을 사용할 수 있어야 하는 unit은 `Wants=`, `Requires=`, `After=`로 조건을 지정해 관계를 나타낼 수 있다

### default target 조회
```sh
$ systemctl get-default
```

### target list 조회
```sh
$ systemctl list-units --type=target
```
-> 활성화 된것만 나오는듯...?

### 활성화 되지 않은 target(rescue, emergency 등) 리스트 조회
```sh
$ systemctl list-units --type=target --all
```

### default target 변경
```sh
$ systemctl set-default <target name>

# example
# 설치시 default target은 multi-user.target이며 부팅시 X-Windows로 로그인 하려면 graphical.target으로 설정
$ systemctl set-default graphical.target

$ systemctl get-default
```

### Isolating Target
* 관련된 모든 unit을 시작하고, 종속성 트리의 일부가 아닌 모든 unit을 중지할 수 있다
* 필요한 명령을 적절하게 분리하여 호출
* runleve을 변경하는 것과 유사

```sh
$ systemctl isolate <target name>

# example
$ systemctl isolate runlevel3.target # or multi-user.target

$ systemctl isolate graphical.target
```

---

<br>

## 부팅 상태 분석
* systmed의 주요 기능 중 하나는 부팅 과정을 관리하고 정보를 제공하는 것

### 부팅 시간 정보
```sh
$ systemd-analyze
```

### 부팅 과정에 각 서비스별 초기화하는데 걸린 시간
* 소요시간순으로 정렬해서 보여준다
```sh
$ systemd-analyze blame
```

### 부팅 과정 분석 html 파일로 덤프
* 부팅시 시간이 많이 걸리는 서비스들은 빨강색으로 표시
* 부팅 과정에서 소비되는 시간을 측정해 개선점을 찾게 해준다
```sh
$ systemd-analyze plot > plot.html
```
      
### 시간을 많이 잡아먹는 서비스들을 트리 형태로 조회
```sh
$ systemd-analyze critical-chain
```

#### 특정 서비스
```sh
$ systemd-analyze critical-chain <service naem>

# example
$ systemd-analyze critical-chain nginx.service
```

### 서비스 실행 실패 서비스 확인
```sh
$ systemctl --failed
```

---

<br>

## Using Shortcuts for Important Events

### rescue
* 시스템 복구 등의 이유로 single user mode로 진입할 필요가 있을 경우
```sh
$ systemctl rescue
```

### emergency
* 파일 시스템이 깨졌다 등의 이유로 single user mode로 진입할 수 없을 떄
* emergency로 들어가면 부팅시 최소의 기능으로만 부팅(root 파일 시스템은 read only로 마운트, 다른 파일 시스템은 마운트를 안하는 등)하므로 응급 복구 가능
```sh
$ systemctl emergency
```

### 시스템 정지
```sh
$ systemctl halt
```

### 시스템 종료
```sh
$ systemctl poweroff
```

### 시스템 재시작
```sh
$ systemctl reboot 
# or 
$ reboot
```

---

<br>

### service와 systemctl 비교

| service | systemctl | 설명 |
|:--|:--|:--|
| service <service name> start | systemctl start <service name>.service | 서비스 시작 |
| service <service name> stop | systemctl stop <service name>.service | 서비스 중지 |
| service <service name> restart | systemctl restart <service name>.service | 서비스 재시작 |
| service <service name> condrestart | systemctl try-restart <service name>.service | 서비스가 구동중일 경우 재시작 |
| service <service name> reload | systemctl reload <service name>.service | 설정 재구동 |
| service <service name> status | systemctl status <service name>.service <br> systemctl is-active <service name>.service | 서비스 구동 여부 조회 |
| service --status-all | systemctl list-units --type service --all | 모든 서비스의 상태 조회 |

### chkconfig와 systemctl 비교
| chkconfig | systemctl | 설명 |
|:--|:--|:--|
| chkconfig <service name> on | systemctl enable <service name>.service | 서비스 활성화(부팅시 자동 구동) |
| chkconfig <service name> off | systemctl disable <service name>.service | 서비스 비활성화 |
| chkconfig --list <service name> | systemctl status <service name>.service <br> systemctl is-enabled <service name>.service | 서비스의 활성화 여부 조회 |
| chkconfig --list | systemctl list-unit-files --type service | 모든 서비스의 현재 활성화 여부 조회 |
| chkconfig --list | systemctl list-dependencies --after | 지정한 target 이후에 시작하는 서비스 조회 |
| chkconfig --list | systemctl list-dependencies --before | 지정한 target 이전에 시작하는 서비스 조회 |

---

<br>

> #### 참고
> * [How To Use Systemctl to Manage Systemd Services and Units](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)
> * [CENTOS 7 SYSTEMD 이해하기](http://linux.systemv.pe.kr/centos-7-systemd-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0/)
> * [red hat doc - systemd service](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-services)
> * [RHEL/CentOS 7 systemctl 사용법](https://www.lesstif.com/pages/viewpage.action?pageId=24445064)
