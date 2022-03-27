# [Java] About retry
> date - 2022.03.26  
> keyworkd - retry, java  
> 간단한 retry에 대해 알아본다

<br>

## retry가 왜 필요할까?
* 하나의 request는 다양한 network 구성 요소(DNS server, Switch, Load Balancer 등)로 이루어지고 각 단계에서 오류가 발생할 수 있다
* network 환경에서 발생할 수 있는 일시적인 오류로 실패하는 경우의 대응 방법으로 client의 retry가 가장 많이 사용되고 있다
  * application의 안정성을 높이는 효과
  * 개발자의 운영 비용 절감 효과
* 5xx(server error) or bottleneck error가 수신된 최초의 request를 재시도해야 한다


<br>

### exponential backoff retry
* 오류가 연이어 발생할 때마다 재시도 대기 시간을 점진적으로 늘리는 재시도 알고리즘
* 최대 지연 간격, 최대 재시도 횟수 구현 필요
* 대부분 jitter(randomized delay)를 사용해 successive collisions을 방지
  * [Exponential Backoff And Jitter](https://aws.amazon.com/ko/blogs/architecture/exponential-backoff-and-jitter/)를 보면 concurrent client를 사용하는 경우 빠른 성공에 jitter가 도움이 될 수 있다
  * Optimistic concurrency control(OOC)에서 jitter를 이용하면 round마다 경합 가능성이 낮아질 수 있으므로 성능이 좋아질 수 있다
 

<br>

## Implementation with java
* 아래는 `exponential backoff retry`를 간단하게 구현한 것이다
```java
public enum Results {
    SUCCESS,
    NOT_READY,
    THROTTLED,
    SERVER_ERROR
}

...
    public static final int MAX_WAIT_INTERVAL = 10_000;
    public static final int MAX_RETRIES = 10;

    public static void doOperationAndWaitForResult() {
        long token = asyncOperation();

        int retries = 0;
        boolean retry = false;

        do {
            long waitTime = Math.min(getWaitTimeExp(retries), MAX_WAIT_INTERVAL);
            System.out.println("waitTime " + waitTime);

            try {
                Thread.sleep(waitTime);
                Results result = getAsyncOperationResult(token);

                if (result == Results.SUCCESS) {
                    retry = false;
                } else if (result == Results.NOT_READY) {
                    retry = true;
                } else if (result == Results.THROTTLED) {
                    retry = true;
                } else if (result == Results.SERVER_ERROR) {
                    retry = true;
                } else {
                    retry = false;
                }
            } catch (IllegalArgumentException | InterruptedException e) {
                System.out.println("Error sleeping thread: " + e.getMessage());
            } catch (IOException e) {
                System.out.println("Error retrieving result " + e.getMessage());
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
            }
        } while (retry && (retries++ < MAX_RETRIES));
    }

    public static long getWaitTimeExp(int retryCount) {
        if (retryCount == 0) {
            return 0;
        }

        return ((long) Math.pow(2, retryCount) * 100L);
    }
```
* retry는 [Spring Retry](./../spring/spring-retry/spring_retry_basic.md), [Resilience4j](https://github.com/resilience4j/resilience4j)를 이용하면 쉽게 구현할 수 있다


<br><br>

> #### Reference
> * [AWS의 오류 재시도 횟수 및 지수 백오프](https://docs.aws.amazon.com/ko_kr/general/latest/gr/api-retries.html)
> * [Exponential Backoff And Jitter - AWS Architecture Blog](https://aws.amazon.com/ko/blogs/architecture/exponential-backoff-and-jitter/)
