# [Server] Regions, Availability Zones, Edge Locations

## 1. Geographical Regions

<div align="center">
<img src="https://github.com/opklnm102/study/blob/master/server/images/region1.png" alt="region1" width="350" height="350"/>
<img src="https://github.com/opklnm102/study/blob/master/server/images/region2.png" alt="region2" width="350" height="350"/>  
</div>

* 서비스가 위치하고 있는 물리적인 장소
* 전 세계 주요 지역에 위치하고 있으며 리전 안에는 가용 영역(AZ, Availability Zone)이 여러 개 있다


### Regions이 여러개인 이유

#### 1. 네트워크 속도
* 아무리 네트워크 기술이 발전하고 전 세계가 광케이블로 연결되어 있다 하더라도, 멀리 떨어진 서버에 접속하면 그 만큼 `경유하는 라우터 개수가 많아지므로` 느려질 수밖에 없다 
* 가까운 Region에 접속하게 하여 빠른 속도 제공

#### 2. 재해 대비
* 지진 같은 재해로 인해 한 Region이 작동불능이 된다 하더라도 다른 Region에 데이터가 backup되어 있다면 정상적으로 서비스 제공 가능


> #### AWS Service Health Dashboard
> [AWS Service Health Dashboard](http://status.aws.amazon.com)에 접속하면 대륙별로 AWS 리소스의 동작 현황이 표시됩니다. 장애가 발생한 AWS 리소스가 표시되고, 장애가 해결된 기록을 시간별로 볼 수 있습니다.



## 2. Availability Zones(AZ)

![availability zones](https://github.com/opklnm102/study/blob/master/server/images/availability_zones.png)

* 하나 이상의 개별 데이터 센터(IDC)로 구성
* 각 데이터 센터는 `분리된 시설`에 구축되고 중복 전력, 네트워킹 및 연결 제공
* 단일 데이터 센터를 사용하는 것보다 더 높은 `가용성, 내결함성 및 확장성`을 보장
   * 재해, 정전, 테러, 화재 등 다양한 이유로 작동불능이 되더라도 다른 가용 영역에서 서비스를 재개할 수 있다
* AWS의 경우 `ELB(ELBElastic Load Balancing)`를 이용해서 서로 다른 AZ에서도 같은 서비스를 사용가능하게끔 트래픽을 분배 시켜준다
   * AZ 하나가 작동불능이 되더라도 무중단 서비스를 제공할 수 있다

> #### 가용성
> * 서버, 네트워크, 프로그램 등이 정상적으로 사용 가능한 정도
> * 가동률과 비슷한 의미



## 3. Edge Locations

![edge_location](https://github.com/opklnm102/study/blob/master/server/images/edge_location.png)

* CDN 서비스를 위한 `캐시 서버`
* 인터넷 트래픽을 효과적으로 처리할 수 있는 지역에 POP(Point-of-Presence)를 구축
* CDN 서비스와 사용자가 직접 만나는 곳이라 Edge라고 부른다

### CDN(Content Delivery Network)
* 콘텐츠(HTML, 이미지, 동영상, 기타 파일)를 사용자들이 빠르게 받을 수 있도록 전 세계 곳곳에 위치한 캐시 서버에 복제해주는 서비스
* 멀리 떨어진 서버보다 가까운 서버에 접속하는 것이 전송 속도가 훨씬 빠르기 때문에 CDN 서비스는 전 세계 주요 도시에 캐시 서버를 구축해 놓는다
* 중간에 원본의 콘텐츠들을 가진 스토리지가 존재
* 스토리지에 존재하는 콘텐츠들을 해당하는 지역에 가까운 곳에 복사하는 Edge Locations이라는 캐시 서버의 스토리지에 복사해 두었다가 해당하는 콘텐츠를 불러들이면 가장 가까운 곳에서 헤당하는 콘텐츠들을 제공한다
* ex. AWS CloudFront

