# [DevOps] Orchestration
> date - 2019.01.28  
> keyword - devops, cloud, orchestration, automation  
> k8s를 배우며 orchestration에 대한 개념이 부족해 공부한걸 정리  

<br>

## Orchestration vs Automation
* orchestration은 `Automation의 subcategory`
  * 여러 컴포넌트로 이루어진 `자동화 작업을 컨트롤하고 조정`하는 작업


<br>

## Cloud vs DevOps
* DevOps
  * 개발 생명주기를 보다 더 빠르게 관리하는 것을 가능하게 하는 개발(Dev) ~ 운영(Ops) 팀 사이의 `기술적 협력 문화`


<br>

### DevOps Automation
* Build, CI(Continuous Integration), SW Configuration Management Tool로 각각 구성


<br>

## Cloud Automation이란?
* Cloud 자원을 배치/배포하는데 있어서 필요로 하는 개별적인 작업 자동화
* Bare-metal 서버를 사용 -> OS Image 제작 -> VM 생성 -> application deploy -> 네트워크 기능 제공을 위한 작업
* 각종 자동화 도구로 가능
  * 자동화 스크립트, Configuration Management Tool(Ansible, CFEngine...)을 통해 수행


<br>

## Cloud Orchestration이란?
* SDI(software defined infrastructure)로 옮겨가고 있는 Cloud infrastructure의 자동화
* 서비스를 위해 여러개의 low-level 자동화를 조합한 workflow/process
  * 구성, 용량, 계측 및 청구 관리
  * 성능 및 가용성 Monitoring, Reporting
  * System Status
  * 시스템 위협 Monitoring & security policy 준수
  * 잠재적인 문제 조기 예측
* CMP(Cloud Management Platform)에 의해 제공
  * API 제공
  * 서비스 관리층에서는 사용자에게 허용된 서비스 제공 규칙 또는 자동화 프로세스를 이용해 실시간으로 자원을 배포하는 기능을 제공
    * 사용자 서비스 카탈로그와 다양한 서비스 디자인, 모델링 등을 통해 제공
* Orchestration Layer에서는 컨트롤, 관리 정책, 조합 등을 배포 프로세스 서비스로 제공
* 추상화되어 사전정의된 형태로 서비스
* Resource Management Layer에서는 생성된 Resource간 상호연계, 상호작용을 관리
  * 관리 대상은 Bare metal 서버, 네트워크, 가상화 서비스, 애플리케이션 등


<br>

## Container Orchestration이란?
* application은 각자의 역할을 가지고, 수십 ~ 수백개의 느슨하게 결합된 application들이 모여 시스템을 이룬다

<br>

### container
* VM(Virtual Machine)보다 훨씬 더 적은 리소스를 사용
  * VM은 OS만 구동하는게 아니라 `OS가 구동하기 위해 필요한 HW에 대한 VC(Virtual Copy)`도 구동
* VM을 사용할 때 보다 `최대 4 ~ 10배나 많은 instance` 구동 가능
* 즉각적인 application 이식성 제공
  * application을 쉽게 배포 가능


<br>

### container는 관리가 필요
* cloud infrastructure의 다른 요소와 마찬가지로 container도 관리되어야 무엇이 구동되는지 알 수 있다
* Puppet, Chef, Ansible를 사용할 수 있지만 `container에 최적화된 tool이 아니다`
* `짧은 lifecycle`과 `밀집도`가 모니터링의 중요 지표


<br>

### 목적
* container의 시작 ~ 종료까지의 lifecycle 제어
  * cluster로 grouping
* application을 구성하는 모든 process 관리
* container의 deploy process 최적화
  * container가 많아질수록 가치가 생긴다


<br>

### 기능
* 자동 배치, 복제
* group에 대한 Load balancing
* 장애 복구 
* cluster 외부에 서비스 노출
* scale in/out
* container service간의 interface를 통한 networking


#### Provisioning
* container cluster 내부에서 container를 provisioning
* resource, region 등 요구사항에 따라 최적의 instance에 provisioning

#### Configuration Scripting
* Juju Charms, Puppet Manifest, Chef Recipe같이 application configuration을 container에 로드할 수 있다
  * YAML, JSON으로 작성

#### Monitoring
* container의 상태와 cluster의 host에 대한 특이점 reporting
* monitoring을 통해 container에 downtime 발생시 새로운 container provisioning을 통해 대응

#### Rolling Upgrade & Rollback
* Cluster 전체를 대상으로 container를 배포하고, 문제 발생시 rollback

#### Service Discovery
* Service를 직접 관리할 필요 X

#### Container Policy Management
* 어디에 배치될지, CPU를 얼마나 할당할지 관리


<br><br>

> #### Kubernetes
> * container rolling upgrade 지원
> * self healing 때문에 어떤 장애가 있었는지 모를 수 있다
>   * Centralised Logging System 구축 필요
> #### Docker Swarm
> * 여러개의 Docker host를 함께 클러스터링하여 단일 Virtual Docker host 생성
> * Docker 호스트 클러스터를 조정하기 가장 쉬운 방법을 제공


<br>


<br><br>

> #### Reference
> * [Cloud Orchestration과 DevOps Automation](http://blog.bizmerce.com/?p=2533)
