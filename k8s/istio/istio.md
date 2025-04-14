[istio](https://istio.io)




![istio overview](./images/istio_overview.png)

* Service Mesh
* cluster의 Container들의 network는 monitoring, managed, control되어야 한다
* istio는 Sidecar Pattern을 통해 Connect, secure, control, observe services 기능 제공


```sh
$ kubectl apply -f <(istioctl kube-inject -f samples/sleep/sleep.yaml)
```


> #### [Sidecar Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar)
> * Application의 변경 없이 별도의 process/container에 배포해 특정 기능을 제공하는 패턴
> * Traffic Management
>   * Service Discovery, Load balancing, Circuit Breaker, Monitoring, Service-to-service authentication...




