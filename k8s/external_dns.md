# [k8s] External DNS
> date - 2019.02.04  
> keyword - kubernetes, DNS  
> 사내에서 사용하고 있는 External DNS에 대해 알아보자  

<br>

## External DNS란?
* Configure external DNS servers (AWS Route53, Google CloudDNS and others) for Kubernetes Ingresses and Services
* 외부로 노출된 Cluster 내부 DNS를 외부 DNS Provider(Route 53 등)와 동기화하는 역할
* K8S resource(Service, Ingress)에 따라 Public DNS Server를 구성
* KubeDNS처럼 External DNS 자체가 DNS server가 되는게 아니라 외부 DNS Provider(Route 53...)에 설정을 해준다
* DNS Provider와 무관하게 k8s resource로 DNS record를 동적으로 제어할 수 있다
* `--domain-filter`로 선택된 영역만 Ingress, Service(type=LoadBalancer)와 동기화 가능

> TODO: 어떤식으로 동작하는지 image로 설명하면 좋을듯

<br>

## Configuration

### External DNS
```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: external-dns
spec:
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: external-dns
    spec:
      containers:
      - name: external-dns
        image: registry.opensource.zalan.do/teapot/external-dns:latest
        args:
        - --source=service
        - --source=ingress
        - --domain-filter=external-dns-test.my-org.com # will make ExternalDNS see only the hosted zones matching provided domain, omit to process all available hosted zones
        - --provider=aws
        - --policy=upsert-only # would prevent ExternalDNS from deleting any records, omit to enable full synchronization
        - --aws-zone-type=public # only look at public hosted zones (valid values are public, private or no value for both)
        - --registry=txt
        - --txt-owner-id=my-identifier
```

> #### `upsert-only` policy를 사용하는 이유??
> DNS 동기화 과정에서 k8s resource로 관리되지 않고, 수동으로 관리하는 DNS가 있을 경우 삭제될 수 있기 때문

<br>

### Service
* `external-dns.alpha.kubernetes.io/hostname`으로 domain 생성
```yaml
kind: Service
  annotations:
    external-dns.alpha.kubernetes.io/hostname: xxx.com
...
```

### Ingress
* rules의 host로 domain 생성
```yaml
kind: Ingress
spec:
  rules:
  - host: xxx.me
...
```

> 자세한 내용은 [external-dns docs](https://github.com/kubernetes-incubator/external-dns/tree/master/docs)를 참고

<br>

## Usage
* Docker image is available in Zalando's Open Source Docker registry
```sh
$ docker run -it registry.opensource.zalan.do/teapot/external-dns:v0.5.9 --help
```

### external-dns log
* 1분 주기로 Domain 등록 event를 처리하는걸 확인할 수 있다
```sh
time="2019-02-03T06:18:52Z" level=info msg="config: {Master: KubeConfig: Sources:[service ingress] Namespace: AnnotationFilter: FQDNTemplate: CombineFQDNAndAnnotation:false Compatibility:molecule PublishInternal:false Provider:aws GoogleProject: DomainFilter:[] ZoneIDFilter:[] AWSZoneType: AWSAssumeRole: AzureConfigFile:/etc/kubernetes/azure.json AzureResourceGroup: CloudflareProxied:false InfobloxGridHost: InfobloxWapiPort:443 InfobloxWapiUsername:admin InfobloxWapiPassword: InfobloxWapiVersion:2.3.1 InfobloxSSLVerify:true DynCustomerName: DynUsername: DynPassword: DynMinTTLSeconds:0 InMemoryZones:[] PDNSServer:http://localhost:8081 PDNSAPIKey: Policy:upsert-only Registry:txt TXTOwnerID:dailyhotel TXTPrefix: Interval:1m0s Once:false DryRun:false LogFormat:text MetricsAddress::7979 LogLevel:info}"
time="2019-02-03T06:18:52Z" level=info msg="Connected to cluster at https://192.0.0.123:443"
time="2019-02-03T06:18:59Z" level=info msg="Desired change: CREATE test-1.opklnm102.io TXT"
time="2019-02-03T06:18:59Z" level=info msg="Desired change: CREATE test-1.opklnm102.io TXT"
time="2019-02-03T06:18:59Z" level=info msg="Desired change: UPSERT test-2.opklnm102.io A"
time="2019-02-03T06:18:59Z" level=info msg="Desired change: UPSERT test-2.opklnm102.io TXT"
time="2019-02-03T06:19:00Z" level=info msg="Record in zone opklnm102.io. were successfully updated"
time="2019-02-03T06:19:55Z" level=info msg="All records are already up to date"
```


<br><br>

> #### Reference
> * [kubernetes-incubator/external-dns - GitHub](https://github.com/kubernetes-incubator/external-dns)
