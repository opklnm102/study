# [k8s] Pod initial jitter
> date - 2022.05.23  
> keyworkd - kubernetes, init container, jitter  
> lock을 사용하는 application에서 replicas 2 이상을 사용할 때 사용할 수 있는 initial jitter에 대해 정리

<br>

## initial jitter란?
* lock을 사용하는 application에서 startup시 동일한 요청을 방지하기 위해 [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers)를 활용해 startup time을 조절하는 기법
* init container에 random sleep을 사용하여 initial 지연을 주는 방식으로 동작한다
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
  ...
    spec:
      initContainers:
        - name: init-jitter
          image: busybox:1.34.1
          command:
            - /bin/sh
            - -c
            - JITTER=$((RANDOM % 10))s; echo "Sleeping for $JITTER"; sleep $JITTER
...
```


<br>

## Conclusion
* init container는 이외에도 git clone, config mount 등 다양한 use case가 있으니 적절하게 사용해보면 된다


<br><br>

> #### Reference
> * [Setting up ExternalDNS for Services on AWS](https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md)
