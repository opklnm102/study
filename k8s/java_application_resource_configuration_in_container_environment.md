# [k8s] Java application resource configuration in container environment
> date - 2022.11.29  
> keyworkd - java, jvm, container  
> container 환경에서 JVM 기반 application 실행시 리소스 설정에 대한 내용 정리 

<br>

## TL;DR
* memory request와 limit는 같게 설정하고 cpu request는 container의 평균 사용률만큼 설정, cpu limit는 설정하지 않는다
* `JAVA_TOOL_OPTIONS` 환경 변수로 `-XX:InitialRAMPercentage=N -XX:MinRAMPercentage=N -XX:MaxRAMPercentage=N ActiveProcessorCount=N`을 설정해준다

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: my-app
          env:
            - name: JAVA_TOOL_OPTIONS
              value: |
                -XX:InitialRAMPercentage=70
                -XX:MaxRAMPercentage=70
                -XX:ActiveProcessorCount=2
          resources:
            limits:
              memory: 4Gi
            requests:
              cpu: "2"
              memory: 4Gi
```


<br>

## Requirement

### Dependency
* [openjdk 11.0.16](https://hub.docker.com/layers/library/openjdk/11.0.16/images/sha256-e81b7f317654b0f26d3993e014b04bcb29250339b11b9de41e130feecd4cd43c?context=explore) 사용
* Kubernetes


<br>

## cpu, memory 사용에 대한 이해
* [Understanding resource limit in kubernetes](./understanding_resource_limit_in_kubernetes.md), [About Kubernetes OOM and CPU Throttle](./basic/about_kubernetes_oom_and_cpu_throttle.md)를 읽어보자


<br>

## Memory 설정
* JVM이 container에 할당된 memory 이상을 사용하려고해서 OOMKilled가 발생하는 경우가 있다
* `container memory >= heap memory + non-heap memory + system memory`여야하므로 적절한 heap memory 설정 필요
  * `-XX:MaxRAMFraction=1`로 설정하면 container memory를 100% 사용하므로 OOMKilled 발생 가능성이 있다
* Java 10부터는 container memory를 인식해서 25% 비율로 heap 설정(-XX:MaxRAMPercentage default)

<br>

### -XX:MaxRAMFraction
* 비율로 설정가능하나 정교하게 설정 불가능 -> `-XX:InitialRAMPercentage`, `-XX:MinRAMPercentage`, `-XX:MaxRAMPercentage`를 사용

| -XX:MaxRAMFraction | Heap memory |
|:--|:--|
| 1 | memory의 100% | 
| 2 | memory의 50% |
| 3 | memory의 33% |

<br>

### -XX:InitialRAMPercentage
* initial heap size를 비율로 지정
* default
> `-XX:+PrintFlagsFinal`로 기본 값 확인 가능
```sh
$ docker run -m 4GB openjdk:11 java -XX:+PrintFlagsFinal -version | grep InitialRAMPercentage
   double InitialRAMPercentage                     = 1.562500                                  {product} {default}
openjdk version "11.0.16" 2022-07-19
OpenJDK Runtime Environment 18.9 (build 11.0.16+8)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.16+8, mixed mode, sharing)
```

* 50% 지정
```sh
$ docker run -m 4GB openjdk:11 java -XX:InitialRAMPercentage=50.0 -XX:+PrintFlagsFinal -version | grep InitialRAMPercentage

   double InitialRAMPercentage                     = 50.000000                                 {product} {command line}
openjdk version "11.0.16" 2022-07-19
OpenJDK Runtime Environment 18.9 (build 11.0.16+8)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.16+8, mixed mode, sharing)
```

<br>

### -XX:MinRAMPercentage
* 이름과 달리 200MB 미만 memory로 실행 중인 JVM의 maximum heap size를 비율로 지정
* default
```sh
$ docker run openjdk:11 java -XX:+PrintFlagsFinal -version | grep -E "MinRAMPercentage"
   double MinRAMPercentage                         = 50.000000                                 {product} {default}
openjdk version "11.0.16" 2022-07-19
OpenJDK Runtime Environment 18.9 (build 11.0.16+8)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.16+8, mixed mode, sharing)

$ docker run -m 100MB openjdk:11 java -XshowSettings:VM -version 
VM settings:
    Max. Heap Size (Estimated): 48.38M
    Using VM: OpenJDK 64-Bit Server VM
...
```

* 70% 지정
```sh
$ docker run -m 100MB openjdk:11 java -XX:MinRAMPercentage=70.0 -XshowSettings:VM -version
VM settings:
    Max. Heap Size (Estimated): 67.69M
    Using VM: OpenJDK 64-Bit Server VM
...
```

<br>

### -XX:MaxRAMPercentage
* 200MB 초과 memory로 실행 중인 JVM의 maximum heap size를 비율로 지정
* default
```sh
$ docker run openjdk:11 java -XX:+PrintFlagsFinal -version | grep -E "MaxRAMPercentage"
   double MaxRAMPercentage                         = 25.000000                                 {product} {default}
openjdk version "11.0.16" 2022-07-19
OpenJDK Runtime Environment 18.9 (build 11.0.16+8)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.16+8, mixed mode, sharing)

$ docker run -m 4GB openjdk:11 java -XshowSettings:VM -version 
VM settings:
    Max. Heap Size (Estimated): 1.00G
    Using VM: OpenJDK 64-Bit Server VM
...
```

* 70% 지정
```sh
$ docker run -m 4GB openjdk:11 java -XX:MaxRAMPercentage=70.0 -XshowSettings:VM -version
VM settings:
    Max. Heap Size (Estimated): 2.80G
    Using VM: OpenJDK 64-Bit Server VM
```

<br>

### JVM memory profiling
* `-XX:NativeMemoryTracking=summary -XX:+PrintNMTStatistic`로 memory profiling
* heap memory 확인
```sh
$ jhsdb jmap --heap --pid [pid]
```
* 종료시 memory 사용률 출력
```sh
$ java -XX:+UnlockDiagnosticVMOptions -XX:NativeMemoryTracking=summary -XX:+PrintNMTStatistics -jar target/myapp.jar
...
 Native Memory Tracking:
 Total: reserved=10376420413, committed=245521469
 -                 Java Heap (reserved=8589934592, committed=88080384)
                             (mmap: reserved=8589934592, committed=88080384)
...
 -    Native Memory Tracking (reserved=3535360, committed=3535360)
                             (malloc=6016 #84)
                             (tracking overhead=3529344)
...
```

<br>

### Result
* `Xms`, `Xmx`는 container memory 변경시 매번 적절한 절대값을 지정해줘야하므로 불편하므로 비율로 설정할 수 있는 `InitialRAMPercentage`, `MinRAMPercentage`, `MaxRAMPercentage`을 사용하자
* `JAVA_TOOL_OPTIONS` 환경 변수 사용
  * `JAVA_OPTS` 사용 X, shell script 규칙이며 JVM은 읽지 않는다
* heap memory 비율은 memory 사용률 profiling 후 50 ~ 80% 정도 추천
  *  70 ~ 80%도 괜찮았음


<br>

## CPU 설정
* Java application은 startup(thread pool 생성 등 초기화 작업)시 다양한 작업을 수행하며 정상 작동 중에 필요한 것 보다 더 많은 CPU 필요
* cpu limit 설정시 startup time이 길어지고, 초기 요청의 latency가 spike 칠 수 있다
  * GraalVM(ahead-of-time compile)에서는 이런 문제가 없다
* Java에서 parrelel, non block의 thread size는 default일 경우, cpu 기반으로 thread count가 지정된다
  * 4 core = thread 4
  * `Runtime.getRuntime().availableProcessors()`로 cpu를 읽어오는데 cpu limit가 1이면 잘못된 값을 전달해 single core처럼 동작하므로 `-XX:ActiveProcessorCount=N`를 설정한다

<br>

### Runtime.getRuntime().availableProcessors() 확인
* Kubernetes
```sh
$ kubectl exec -it <pod> -- jshell

## resources.requests.cpu: 2
jshell> Runtime.getRuntime().availableProcessors();
$1 ==> 2
```

* Docker
```sh
$ docker run -it --rm --cpus="2" openjdk:11 jshell

jshell> Runtime.getRuntime().availableProcessors();
$1 ==> 2
```

| request | limit | Runtime.getRuntime().availableProcessors() | 결과 |
|:--|:--|:--|:--|
| 1000m | 3000m | 3 | 정상 |
| 1000m | 2000m | 2 | 정상 |
| 1000m | - | node cpu | 비정상 |
| 2000m | - | 2 | 정상 |

* [OpenJDK 18](https://github.com/openjdk/jdk18u/commit/a5411119c383225e9be27311c6cb7fe5d1700b68)부터 `resources.requests.cpu`는 availableProcessors()의 반환 값에 관여하지 않게 되며, `resources.limits.cpu` or `-XX:ActiveProcessorCount`를 명시적으로 지정해야 한다s

<br>

### 16 core node 사용시
* cpu.request: 4000m인 container 1개 실행시
  * 16 core를 사용
  * 16 / 4으로 reqeust 당 4core를 가져온다
* cpu.request: 4000m인 container 2개 실행시
  * 각 8 core 사용
  * 16 / 8로 request 당 2core를 가져온다
* cpu.request: 4000m인 container 2개 + cpu.reqeust: 2000m container 실행
  * total cpu.request: 10000m
  * 4000m container는 각 6400m을 사용, 2000m container는 3200m 사용
  * 16 / 10으로 request 당 1600m을 가져온다


<br>

### Result
* JVM이 계산한 ActiveProcessorCount는 시간이 지날수록 변하므로 명시적으로 설정하는게 좋다
  * e.g. cpu.request: 4000m + -XX:ActiveProcessorCount=4 설정
* cpu 사용률 profiling 후 cpu.reqeust 설정, cpu.limit 설정 X, ActiveProcessorCount 설정


<br><br>

> #### Reference
> * [Kubernetes용 Java 애플리케이션 컨테이너화](https://learn.microsoft.com/ko-kr/azure/developer/java/containers/kubernetes)
> * [JVM + Container 환경에서 수상한 Memory 사용량 증가 현상 분석하기](https://hyperconnect.github.io/2022/07/19/suspicious-jvm-memory-in-container.html)
> * [JVM Parameters InitialRAMPercentage, MinRAMPercentage, and MaxRAMPercentage](https://www.baeldung.com/java-jvm-parameters-rampercentage)
> * [Heap size, memory usage and resource limits in Kubernetes for JVM applications](https://akobor.me/posts/heap-size-and-resource-limits-in-kubernetes-for-jvm-applications)
> * [How to Optimize Java Apps on Kubernetes ](https://thenewstack.io/how-to-optimize-java-apps-on-kubernetes)
> * [Running a JVM in a Container Without Getting Killed](https://blog.csanchez.org/2017/05/31/running-a-jvm-in-a-container-without-getting-killed)
> * [For the love of god, stop using CPU limits on Kubernetes (updated)](https://home.robusta.dev/blog/stop-using-cpu-limits)
> * [Production Considerations for Spring on Kubernetes](https://odedia.org/production-considerations-for-spring-on-kubernetes)
> * [Why you should keep using CPU limits on Kubernetes](https://dnastacio.medium.com/why-you-should-keep-using-cpu-limits-on-kubernetes-60c4e50dfc61)
