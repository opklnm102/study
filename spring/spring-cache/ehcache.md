



```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd" updateCheck="false">
    <diskStore path="java.io.tmpdir"/>

    <defaultCache eternal="false"
                  overflowToDisk="false"
                  diskPersistent="false"
                  timeToIdleSeconds="0"
                  timeToLiveSeconds="600"
                  memoryStoreEvictionPolicy="LRU" />

    <!-- TODO: tariff 수 확인해서 memory size 조절 -->
    <!--timeToIdleSeconds="300"  지정한 시간 만큼안에 사용되지 않으면 캐시에서 제거-->
    <!--timeToLiveSeconds="600"   캐시에 존재하는 시간, 시간이 지나면 캐시에서 제거-->
    <!--memoryStoreEvictionPolicy="LRU"  maxElementsInMemory 에 도달 했을 때 어떻게 제거할지 정책-->

    <cache name="tariff"
           maxEntriesLocalHeap="10000"
           maxEntriesLocalDisk="1000"
           diskSpoolBufferSizeMB="20"
           timeToIdleSeconds="20"
           timeToLiveSeconds="60"
           memoryStoreEvictionPolicy="LRU"
           transactionalMode="off">
    </cache>
</ehcache>


    <!-- TODO: tariff 수 확인해서 memory size 조절 -->
    <!--timeToIdleSeconds="300"  지정한 시간 만큼안에 사용되지 않으면 캐시에서 제거-->
    <!--timeToLiveSeconds="600"   캐시에 존재하는 시간, 시간이 지나면 캐시에서 제거-->
    <!--memoryStoreEvictionPolicy="LRU"  maxElementsInMemory 에 도달 했을 때 어떻게 제거할지 정책-->
```



```java
@Component
public class CouponPolicyCache {   
    private final Map<String, CouponPolicy> map = new ConcurrentHashMap<>();

    public void put(List<CouponPolicy> couponPolicyList) {
        couponPolicyList.forEach(policy -> map.put(policy.getNo(), policy));
    }

    public List<CouponPolicy> get(List<String> couponNoList) {
        return couponNoList.stream()
                .map(no -> map.getOrDefault(no, null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}

 @Scheduled(fixedDelay = INTERVAL_MIN * 1000 * 60, initialDelay = INTERVAL_MIN * 1000 * 60)
    public void syncCouponPolicies() {

        // ElasticSearch에서 데이터를 조회한 후 캐시에 저장한다.
        couponPolicyCache.put(couponPolicyRepository.getAllCouponPolicies());
    }
```











