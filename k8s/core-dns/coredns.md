coredns.md


Waht is CoreDNS





https://coredns.io

https://kubernetes.io/docs/tasks/administer-cluster/coredns

https://jonnung.dev/kubernetes/2020/05/11/kubernetes-dns-about-coredns/#gsc.tab=0


https://malwareanalysis.tistory.com/267


https://www.google.com/search?q=core+dns&oq=core+dns&aqs=chrome..69i57j0i10i512j0i512j0i10i512l2j69i60j69i61l2.2081j0j7&sourceid=chrome&ie=UTF-8





https://confluence.yanolja.in/display/system/0003.+CoreDNS







https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#coredns-configmap-options
의 ConfigMap의 설명 추가







## CoreDNS?
* [CoreDNS](https://coredns.io)는 DNS server로 k8s cluster 내의 DNS와 Service Discovery를 담당
* CoreDNS로 DNS query를 하여 k8s cluster 내의 Pod를 찾을 수 있으며, forward lookup(A, AAA record), port lookup(SRV record), reverse IP address lookup(PTR record) 지원
* Service에는 다음과 같은 format으로 A record 할당
```
<service name>.<namespace>.svc.cluster.local
```
```
redis-1.redis.svc.cluster.local
------- -----
   |      |
   |      +—–> namespace
   +—–—–—–—–—–—––> service name
```







——————————————————————
CoreDNS 내용 정리

https://jonnung.dev/kubernetes/2020/05/11/kubernetes-dns-about-coredns/#gsc.tab=0

> https://iamitcohen.medium.com/dns-in-kubernetes-how-does-it-work-7c4690fd813e

https://yanolja.atlassian.net/wiki/x/UzMkBw

https://pracucci.com/kubernetes-dns-resolution-ndots-options-and-why-it-may-affect-application-performances.html






