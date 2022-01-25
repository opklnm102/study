# [Java] About CPU utilization of Java applications
> date - 2022.01.25  
> keyworkd - java, cpu  
> CPU cycle은 host의 모든 process에서 공유되며, 부족하면 queue가 사용되어 slowness가 발생한다  
> 높은 CPU utilization은 코드, 환경에 문제가 있다는 것을 의미할 수 있으므로 관련 내용을 정리


<br>

## CPU utilization이 높은 이유
* 과도한 GC(Garbage Collection) 발생
* 과도한 active thread 발생
* infinite loops 같은 코드 문제
* application spec에 비해 host CPU spec 부족
  * scale up을 통해 해결


<br><br>

> #### Reference
> * [4 things you need to know about CPU utilization of your Java application](http://karunsubramanian.com/java/4-things-you-need-to-know-about-cpu-utilization-of-your-java-application/)
