# [DevOps] Stateful service migration strategy
> date - 2021.03.05  
> keyworkd - migration, stateful  
> stateful service는 stateless service보다 migration하기 어렵다  
> stateful service에 대한 migration strategy를 정리  

<br>

## Dual Write
* Write를 일정 기간동안 두 군데로 유지
* Write 로직 변경 필요

## Snapshot And Move
* Snapshot을 생성하고, Snapshot을 이용해 migration
* 도메인 기반으로 접근하도록 변경하고, migration 후 기존 서버에 대한 access를 차단한다(방화벽, server restart/stop..)
* 순단이 발생할 수 있다

## Cluster Move
* Cluster의 Replication Factor를 3 이상으로 유지하고 1개씩 migration
* 진행은 느리지만 안전하다

<br>

## Conclusion
* 각 strategy 마다 장단점을 고려하여 상황에 맞는 선택할 필요가 있다
