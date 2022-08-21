# [AWS] AWS(Amazon Web Service) Infra Basic
> Amazon Cloud 서비스로 비즈니스와 개발자가 웹 서비스를 사용하여 확장 가능하고 정교한 애플리케이션을 구축하도록 지원한다  
> 서비스로는 스토리지, 데이터베이스, VPC 등이 있고, 계속해서 다양한 기능들이 빠르게 생기고 있다  

<br>

## AWS 클라우드 컴퓨팅의 6가지 장점
1. 자본 비용을 가변 비용으로 대체
2. 규모의 경제로 얻게되는 이점
3. 용량 추정 불필요
4. 속도 및 민첩성 개선
5. 데이터 센터 운영 및 유지관리에 비용 투자 불필요
6. 몇 분만에 전세계에 배포

> 이러한 이점 때문에 전세계의 많은 기업들이 사용하고 있는 서비스

* AWS의 글로벌 인프라는 전세계에 존재하는 리전과 리전에 속해있는 가용영역으로 구성된다
* 리전은 지리적 위치를 말하며, 최소 2개 이상의 가용영역으로 구성되어 있다
* 가용 영역은 데이터센터의 클러스터이며, 다른 가용 영역의 장애로부터 격리되어 있다


<br>

## EC2(Amazon Elastic Compute Cloud)
* 크기 조정 가능한 컴퓨팅 파워를 제공하는 서비스
* 컴퓨팅 리소스에 대한 완벽한 제어가 가능
* 몇 분만으로 인스턴스 확보
* 사용량만큼 지불

<br>

### EC2 인스턴스 선택시 고려 사항
1. 코어 수
2. 메모리 크기
3. 스토리지 크기 및 유형
4. 네트워크 성능
5. CPU 기술


<br>

## S3(Amazon Simple Storage Service)
* 스토리지 서비스로 웹에서 언제 어디서든 원하는 양의 데이터를 저장, 검색가능
* 고도의 확장성, 안정성, 속도 및 내구성을 가졌다
* 데이터를 버킷에 object로 저장한다
   * object - `파일`과 파일을 설명하는 `메타 데이터(optional)`
* 버킷에 저장할 수 있는 object수에는 제한이 없다

<br>

### 사용처
1. 스토리지 및 백업
2. 애플리케이션 파일 호스팅
3. 미디어 호스팅
4. SW 전송
5. AMI 및 스냅샷 저장


<br>

## EBS(Elastic Block Storage)
* 파일 시스템이 있는 블록 스토리지 서비스
* 일관적이고 짧은 지연시간을 제공하는 영구적 블록 레벨 저장장치
* 스냅샷을 S3(Amazon Simple Storage Service)에 저장


<br>

## VPC(Virtual Private Cloud)
* AWS 클라우드에서 격리된 Private Virtual Network 제공 서비스
* 가상 네트워크 환경을 완벽하게 제어할 수 있다
* public, private subnet으로 외부 네트워크의 접근 제한을 할 수 있다


<br>

## RDS(Amazon Relational Database Service)
* 관계형 데이터베이스를 제공하는 서비스
* 비용 효율적이고 크기 조절 가능한 용량을 제공
* 시간 소모적인 DB 관리작업을 지원
* 다양한 RDB(Amazon Aurora, MySQL, MariaDB, MS SQL Server, Oracle, PostgreSQL) 지원
* 간편하고 빠른 배포, 확장, 비용 효율적


<br>

## Amazon DynamoDB
* 완전관리형 NoSQL 데이터베이스 서비스
* 어떤 양의 데이터든 제한 없이 저장 가능


<br>

## Auto Scaling
* EC2 용량 및 갯수를 자동으로 조정하는 서비스
* 사용량의 변화가 많은 애플리케이션에 적합
* 내결함성 향상, 가용성 향상, 비용관리 개선등의 이점
* CloudWatch와 함께 사용하여 Auto Scaling 그룹이 언제 확장, 축소해야 하는지 정책 생성 가능


<br>

## ELB(Elastic Load Balancing) 
* 여러 인스턴스에 트래픽을 분산하는 서비스
* 비정상 EC2 인스턴스를 탐지와 `HTTP, HTTPS, TCP 트래픽 라우팅`과 `로드밸런싱` 지원


<br>

## Cloud Watch
* AWS 클라우드 리소스와 애플리케이션에 대한 모니터링 서비스
   * AWS 관리 도구 서비스 중 하나
* 리소스 사용률, 운영 성능에 대한 지표 제공


<br>

## AWS의 보안
* SSL 엔드포인트, 보안그룹, VPC, IAM으로 보안성을 향상시킬 수 있다

<br>

### SSL Endpoint
* SSL/TLS를 이용해 보안 통신 세션(HTTPS) 구축

<br>

### Security Group
* 인스턴스 방화벽
* 인스턴스에 대한 방화벽 규칙 구성

<br>

### VPC
* 네트워크 제어
* 저수준의 네트워킹 제약 조건 생성

<br>

### IAM(Identity and Access Managment)
* AWS 계정의 사용자별로 권한 관리 가능
* root 권한 노출 방지


<br>

## On-Premise - AWS resource mapping
* Data Center - AZ(Availability Zone)
* CDN(Content Delivery Network) - Amazon CloudFront
* In Memory Cache - Amazon ElastiCache
* Object Storage - Amazon S3
* OS image - AMI(Amazon Machine Image)
* Account 중앙 관리 Tool - AWS IAM(Identity and Access Management)
* API Server - Amazon API Gateway
* 인증서 CA(Certificate Authority) - ACM(AWS Certificate Manager)
* Container Orchestration - Amazon ECS(Elastic Container Service)
* 중앙 문서 관리 - Amazon WorkDocs
