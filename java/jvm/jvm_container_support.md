# [Java] JVM container support
> date - 2019.07.13  
> keyword - java, jdk, jvm, container, docker  
> JDK의 container support에 대해 정리  

<br>

* JVM은 **cgroup**이 존재하기 전에 구현되었기 때문에 container에 대해 최적화되지 않았기 때문에 예상대로 동작하지 않는다
* Java SE 8u131, JDK 9부터 container에 대한 최적화 시작


<br>

## Java SE 8u121 이전 - Host의 CPU, memory가 적용되어 container의 limit 무시

### CPU limit
* GC Threads 및 JIT compiler threads는 **available processors에 따라 설정**된다
* GC threads, JIT compiler threads를 설정하기 위해 `-XX:ParallelGCThreads`, `-XX:CICompilerCount` 명시적 설정 필요

### Memory Limit
* -Xmx 명시적 설정 필요
```sh
-Xmx2g or -Xmx2G
-Xmx1024m or -Xmx1024M
```


<br>

## Java SE 8u131, JDK 9 - container limit 인식을 위한 option 추가

### CPU limit
* `-XX:ParallelGCThreads`, `-XX:CICompilerCount`를 명시적으로 설정하면 해당 설정을 따라간다
* 설정하지 않으면 container의 CPU limit에 맞춰서 설정됨

### Memory limit
* `-Xmx`가 설정되어 있으면 따라간다
* `-Xmx`가 없는 경우, 자동으로 인식하여 heap size 할당하기 위해서 아래 옵션 사용
```
-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap
```

<br>

> #### -XX:+UnlockExperimentalVMOptions
> * JDK의 experimental flag unlock을 위해 사용
> * experimental flag 수정을 위해서 unlock 필요
> * JDK 버전마다 수정할 수 있는 flag가 달라짐
>   * OpenJDK 11에서는 ZGC 관련 옵션이 있음

<br>

> #### -XX:+UseCGroupMemoryLimitForHeap
> * JDK 10 - deprecated
> * JDK 11 - remove
> * https://bugs.openjdk.java.net/browse/JDK-8194086


<br>

## JDK 10 - 자동으로 container support
* Container support feature를 끄려면 아래 option 사용
```
-XX:-UseContainerSupport
```


<br>

## Memory & CPU 확인
* JDK version 마다 비교해보자


### JShell로 확인

#### OpenJDK 11.0.3
* CPU 2, Memory 4GB
```sh
$ docker container run -it -m=4g --cpus=2 --entrypoint bash openjdk:11

## in container
$ jshell

jshell> Runtime.getRuntime().availableProcessors();
$1 ==> 2

jshell> Runtime.getRuntime().maxMemory() / 1024 / 1024;
$3 ==> 1024
```

* CPU 0.5, Memory 4GB
```sh
$ docker container run -it -m=4g --cpus=0.5 --entrypoint bash openjdk:11

## in container
$ jshell

jshell> Runtime.getRuntime().availableProcessors();
$1 ==> 1

jshell> Runtime.getRuntime().maxMemory() / 1024 / 1024;
$3 ==> 989
```
> 인식이 되고 있는걸 확인할 수 있다


<br>

### Java Option으로 확인
* `-XshowSettings:vm`, `-XX:+PrintFlagsFinal` 사용


#### OpenJDK 11.0.3
* CPU 2, Memory 4GB
```sh
$ docker run -it -m=4g --cpus=2 opklnm102/jdk11-test

## in container
$ java -XshowSettings:vm -version

VM settings:
    Max. Heap Size (Estimated): 1.00G
...

$ java -XX:+PrintFlagsFinal -version | grep ParallelGCThreads
     uint ParallelGCThreads                        = 2                                         {product} {default}
...
```

* CPU 4, Memory 2GB
```sh
$ docker run -it -m=2g --cpus=4 opklnm102/jdk11-test

## in container
$ java -XshowSettings:vm -version

VM settings:
    Max. Heap Size (Estimated): 512.00M
...

$ java -XX:+PrintFlagsFinal -version | grep ParallelGCThreads
     uint ParallelGCThreads                        = 4                                         {product} {default}
...
```
> 인식이 되고 있는걸 확인할 수 있다

<br>

#### OpenJDK 1.8.0_151
* CPU 2, Memory 4GB
```sh
$ docker run -it -m=4g --cpus=2 opklnm102/jdk8-test

## in container
root@fff04959a0d6:/home/app# java -XshowSettings:vm -version
VM settings:
    Max. Heap Size (Estimated): 444.50M
...

$ java -XX:+PrintFlagsFinal -version | grep ParallelGCThreads
    uintx ParallelGCThreads                         = 4                                   {product}
...
```

* CPU 2, Memory 8GB
```sh
$ docker run -it -m=8g --cpus=2 opklnm102/jdk8-test

## in container
root@277b468f915f:/home/app# java -XshowSettings:vm -version
VM settings:
    Max. Heap Size (Estimated): 444.50M
...

$ java -XX:+PrintFlagsFinal -version | grep ParallelGCThreads
    uintx ParallelGCThreads                         = 4                                   {product}
...
```
> 인식이 안되고 있는걸 확인할 수 있다


<br>

### Code로 화인
```java
public class JDKChecker {

    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();

        int cpus = runtime.availableProcessors();
        long maxMemory = runtime.maxMemory() / 1024 / 1024;

        System.out.println("Cores : " + cpus);
        System.out.println("Memory : " + maxMemory);
    }
}
```

<br>

#### OpenJDK 11.0.3
* CPU 2, Memory 4GB
```sh
$ docker run -it -m=4g --cpus=2 opklnm102/jdk11-test

## in container
$ java -jar app.jar
Cores : 2
Memory : 1024

# -XX:-UseContainerSupport로 contaienr support의 차이를 확인할 수 있다
$ java -XX:-UseContainerSupport -jar app.jar
Cores : 4
Memory : 500
```

* CPU 4, Memory 2GB
```sh
$ docker run -it -m=2g --cpus=4 opklnm102/jdk11-test

## in container
$ java -jar app.jar
Cores : 4
Memory : 512

# -Xmx2g로 heap size가 늘어나는걸 확인할 수 있다
$ java -Xmx2g -jar app.jar
Cores : 4
Memory : 2048
```

<br>

#### OpenJDK 1.8.0_212
* CPU 2, Memory 4GB
```sh
$ docker run -it -m=4g --cpus=2 opklnm102/jdk8-test

## in container
$ java -jar app.jar
Cores : 2
Memory : 910
```

* CPU 2, Memory 2GB
```sh
$ docker run -it -m=2g --cpus=2 opklnm102/jdk8-test

## in container
$ java -jar app.jar
Cores : 2
Memory : 455
```

<br>

#### OpenJDK 1.8.0_151
* CPU 2, Memory 2GB
```sh
$ docker run -it -m=2g --cpus=2 opklnm102/jdk8-test

## in container
$ java -jar app.jar
Cores : 4
Memory : 444
```

* CPU 3, Memory 4GB
```sh
$ docker run -it -m=4g --cpus=3 opklnm102/jdk8-test

## in container
$ java -jar app.jar
Cores : 4
Memory : 444
```


<br>

## Conclusion
* JDK version에 따라 container support가 완벽하지 않을 수 있고, 그럴 경우 `-Xmx`, `-XX:ParallelGCThreads`, `-XX:CICompilerCount`option을 사용하자
* OpenJDK 10부터 container support가 자동으로 된다
  * 현재 OpenJDK 8 최신 버전인 OpenJDK 1.8.0_212에서도 자동으로 container support가 된다


<br><br>

> #### Reference
> * [Java SE support for Docker CPU and memory limits](https://blogs.oracle.com/java-platform-group/java-se-support-for-docker-cpu-and-memory-limits)
> * [Improved Docker Container Integration with Java 10](https://blog.docker.com/2018/04/improved-docker-container-integration-with-java-10/)
> * [Java & Docker: Java 10 improvements strengthen the friendship!](https://aboullaite.me/docker-java-10/)
> * [Show the default value chosen for XX:ParallelGCThreads](https://stackoverflow.com/a/46178337/6389139)
