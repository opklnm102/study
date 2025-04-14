


https://stackoverflow.com/questions/12113725/how-do-i-tell-spring-cache-not-to-cache-null-value-in-cacheable-annotation

https://jistol.github.io/java/2017/02/09/springboot-cache-key/


이거 cache key관련 내용 정리...??

```java
// method result가 null이면 cache 사용안한다.. 
@Cacheable(cacheNames = "code", cacheManager = "cacheManager", unless = "#result == null")
@Override
public Object getCodes(Map<String, String> params) {

    Object key = SimpleKeyGenerator.generateKey(params);
    log.error("ethan test {}", key);

    return null;
}
```

method param이 Map이어도 
key 가

{codeType=self_pid_ovd_cd} 
{codeType=self_pid_ovd_cd, aaa=add} 
{codeType=self_pid_ovd_cd, aaa=add, cc=ddd} 

이런식으로 잡히기 때문에...! 적용된다



