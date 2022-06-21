# [Server] Failover & Failback
> date - 2022.06.22  
> keyword - server, failover, failback  
> failover와 failback에 대해 정리  

<br>

<div align="center">
  <img src="./images/failover_failback.png" alt="failover failback" width="70%" height="70%" />
</div>

<br>

## Failover
* 시스템에 서버, network 등에 장애 발생시 예비 시스템으로 전환되는 기능
* 가용성을 위해 필수
* A 시스템 failover -> A 시스템에 이상이 발생하여 standby로 전환되었다


<br>

## Failback
* failover에 따라 전환된 시스템을 failover 이전으로 돌리는 처리


<br><br>

> #### Reference
> [페일오버(failover)](https://www.ibm.com/docs/ko/i/7.1?topic=events-failover)
