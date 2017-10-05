# ThreadLocal
> ThreadLocal 클래스를 보고 어떤 경우에 사용하는지 궁금해서 정리

* Multi Thread 환경에서 여러 쓰레드에서 공유자원에 접근하면 `Thread-safety` 문제가 발생

* ThreadLocal을 사용하여 `각 쓰레드에서 사용할 데이터를 분리`할 수 있다
   * 현재 쓰레드 영역에 데이터를 저장

```java
package org.springframework.security.core.contex;

final class ThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {
  
  private static final ThreadLocal<SecurityContext> contextHolder = new ThreadLocal<SecurityContext>();
  
  public void clearContext() {
    contextHolder.remove();
  }
  
  public SecurityContext getContext() {
    SecurityContext ctx = contextHolder.get();
    
    if (ctx == null) {
      ctx = createEmptyContext();
      contextHolder.set(ctx);
    }
    
    return ctx;
  }
  
  public void setContext(SecurityContext context) {
    Assert.notNull(context, "Only non-null SecurityContext instances are permitted");
    contextHolder.set(context);
  }
  
  public SecurityContext createEmptyContext() {
    return new SecurityContextImpl();
  }
}
```

## 사용처
* 쓰레드에 안전해야하는 데이터 보관

* 보통 stateful singleton을 사용하기 위해서 `공유 자원의 Thread Safe를 위해서` 사용

* `Thread 단위로 Context를 관리`하고자 할 때
   * static으로 선언된 ThreadLocal에 Context를 넣어두면 Thread Safe하게 사용가능


## 주의사항
* 전역변수처럼 사용되기 때문에 `재사용성을 떨어뜨릴 수 있고`, 객체간에 `보이지 않는 관계`를 만들어내기 쉽게 때문에 조심해야 한다

* 쓰레드 풀 환경에 ThreadLocal에 보관된 데이터의 사용이 끝나면 삭제
   * 재사용되는 쓰레드가 올바르지 않은 데이터를 참조할 수 있다


> ## Thread Safe란?
> 
> ### Thread Safe
> 멀티 쓰레드 환경에서 각 쓰레드가 동일한 로직을 실행하는 경우에 각 쓰레드가 어떻게 스케쥴되든 > 추가적인 동기화 없이도 정확한 동작을 보장
> 
> ### Reentrant 
> 멀티 쓰레드가 동시에 같은 로직을 실행할 수 있도록 구현해서 Thread Safe를 보장하는 형태
>
> ### Java에서 Thread Safe를 구현하는 방법
> * Atomic 클래스 사용
> * 뮤텍스
> * 세마포어
> * Reentrant를 구현
>    * 암시적인 락 - 기본적으로 자바 객체는 모니터 락(재진입 가능한 로직의 형태로 사용 가능)
>    * ReenterantLock과 ReentrantReadWriteLock의 사용

