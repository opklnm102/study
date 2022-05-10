# [Cloud] How to switched cloud
> date - 2022.05.10  
> keyworkd - cloud, migration  
> A Cloud -> B Cloud로 어떻게 switch할 수 있는지에 대해 정리  

<br>

## Switch Cloud 
1. 각 환경에서 [HAProxy](http://www.haproxy.org), [Nginx](https://www.nginx.com) 등의 reverse proxy로 backend와 연결
2. Cloud 간 VPN(or network config)을 구성하여 reverse proxy가 모든 Cloud의 backend에 연결 가능, backend는 모든 Cloud의 DB에 연결 가능하도록 설정
   * VPN(WireGuard, Kilo(https://kilo.squat.ai/))
3. new Cloud로 DB 복제 후 replication
4. Application이 어떤 DB를 primary로 사용할지 선택 가능하도록 구현
   * DB 접속은 [Hashicorp Consul](https://www.consul.io) 같은 솔루션을 이용해 dynamic DNS update로 backend의 변경 없이 가능하도록 한다
5. Application이 DB 오류에 대해 gracefully 처리하도록 구현
   * DB Failover로 전환 중 update가 안정적으로 실패하거나 성공하도록 해야하기 때문에 **가장 까다로운 부분**
   * Failover로 Primary 전환 후 application이 primary라고 생각하는 DB의 error를 처리하도록 구현
      * 실패한 query(update 등)에 대해 retry
      * update 동작은 `idempotent` 구현
   * promote를 충분히 빠르게 처리할 수 있다면 zero downtime migration 가능
   * 실패한 update 등의 retry로 client에서는 느려지는 현상이 발생하지만 retry가 없었다면 몇 초의 downtime이 발생했을 것
6. DNS record TTL을 짧게 설정
7. new Cloud의 backend를 reverse proxy에 연결하고 error rate 확인
   * error rate가 증가하면 rollback
8. new Cloud의 reverse proxy로 트래픽이 유입되도록 DNS record 갱신
9. new Cloud에 있는 replica DB를 primary로 promote
   * automation을 통해 human fault 방지
   * new primary에서 replica에 이슈가 없는지 확인
10. old Cloud backend의 connection draining
   * new Cloud backend에서 모든 트래픽이 처리되는지 확인
11. old Cloud reverse proxy로 트래픽이 유입되지 않도록 DNS record 갱신
   * old Cloud reverse proxy의 모든 트래픽이 제거될 때까지 대기
12. new Cloud에서 이슈가 없으면 old Cloud 제거하고 DNS record TTL 복구


<br>

## Data migration
* data migration만 필요한 경우라면 A/B deploy로 source data를 dual-write 및 switchover할 수 있도록 서비스를 설계


<br>

## Conclusion
* VPN을 사용하여 여러 환경을 하나의 대규모 환경으로 취급하여 연결하고 적절한 HA(High Availability)를 보장하는게 key point
* 위의 방법은 꼭 Cloud가 아니라 IDC, cluster 등에도 적용될 수 있다

<br><br>

> #### Reference
> * [Ask HN: Have you ever switched cloud?](https://news.ycombinator.com/item?id=30942698)
