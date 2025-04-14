# [k8s] Ingress Nginx Controller
> date - 2023.09.28  
> keyworkd - Kubernetes, nginx, ingress controller  
> Community version의 Ingress Nginx Controller에 대해 정리  

<br>

## Ingress 를 사용하는 이유?
* `Service` 마다 ELB가 생성되면 비용이 발생하므로 비용 효율적으로 다양한 `Service`를 expose하기 위해서


<br>

## [ingress-nginx](https://kubernetes.github.io/ingress-nginx)
* Ingress Nginx Controller
* Community version
* controller 설정을 위해 ConfigMap, Ingress를 사용




Nginx configuration





## Install
* Helm

* kubectl apply











traffic flow
```
ELB -> nginx-ingress-controller -> workload
```


CrossPlane으로 AWS ELB 자동으로 생성하여 ingress controller에 연결

ELB -> ingress controller -> workload 로 접근

ingress controller를 배포할 때 Service Type을 특정 NodePort에 지정/오픈하여 endpoint를 알아야한다
> https://devocean.sk.com/blog/techBoardDetail.do?ID=163593


ingress-nginx-controller Service로 생성된 ELB
ingress의 address는  ELB의 ip로 변경된다











AWS LBC로 NLB 생성 + ingress-nginx 사용
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  labels:
    helm.sh/chart: ingress-nginx-4.8.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: "1.9.0"
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
    service.beta.kubernetes.io/aws-load-balancer-scheme: internal
    service.beta.kubernetes.io/aws-load-balancer-security-groups: sg-0fc1f3c77e0e0a21a
    service.beta.kubernetes.io/aws-load-balancer-additional-resource-tags: |-
      Team=dh,
      Service=nginx,
      Server=etc,
      Environment=dev
    service.beta.kubernetes.io/aws-load-balancer-attributes: |-
      access_logs.s3.enabled=false,
      load_balancing.cross_zone.enabled=true
spec:
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
  ports:
    - port: 80
      name: http
      protocol: TCP
      targetPort: http
    - port: 443
      name: https
      protocol: TCP
      targetPort: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
---

controller:
  extraArgs:
    publish-service: $(POD_NAMESPACE)/ingress-nginx-controller

  service:
    enabled: true
    # -- If enabled is adding an appProtocol option for Kubernetes service. An appProtocol field replacing annotations that were
    # using for setting a backend protocol. Here is an example for AWS: service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
    # It allows choosing the protocol for each backend specified in the Kubernetes service.
    # See the following GitHub issue for more details about the purpose: https://github.com/kubernetes/kubernetes/issues/40244
    # Will be ignored for Kubernetes versions older than 1.20
    ##
    appProtocol: true
    # -- Annotations are mandatory for the load balancer to come up. Varies with the cloud service. Values passed through helm tpl engine.
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-type: nlb
      service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
      service.beta.kubernetes.io/aws-load-balancer-internal: true
      service.beta.kubernetes.io/aws-load-balancer-security-groups: sg-0fc1f3c77e0e0a21a
      service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: true
      service.beta.kubernetes.io/aws-load-balancer-additional-resource-tags: |-
        Team=dh,
        Service=nginx,
        Server=etc,
        Environment=dev
      #service.beta.kubernetes.io/aws-load-balancer-attributes: |-
      #  access_logs.s3.enabled=false,
      #  load_balancing.cross_zone.enabled=true

    labels: {}
    # clusterIP: ""

    # -- List of IP addresses at which the controller services are available
    ## Ref: https://kubernetes.io/docs/concepts/services-networking/service/#external-ips
    ##
    externalIPs: []
    # -- Used by cloud providers to connect the resulting `LoadBalancer` to a pre-existing static IP according to https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer
    loadBalancerIP: ""
    loadBalancerSourceRanges: []
    # -- Used by cloud providers to select a load balancer implementation other than the cloud provider default. https://kubernetes.io/docs/concepts/services-networking/service/#load-balancer-class
    loadBalancerClass: ""
    enableHttp: true
    enableHttps: true
    ## Set external traffic policy to: "Local" to preserve source IP on providers supporting it.
    ## Ref: https://kubernetes.io/docs/tutorials/services/source-ip/#source-ip-for-services-with-typeloadbalancer
    # externalTrafficPolicy: ""

    ## Must be either "None" or "ClientIP" if set. Kubernetes will default to "None".
    ## Ref: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
    # sessionAffinity: ""

    ## Specifies the health check node port (numeric port number) for the service. If healthCheckNodePort isn’t specified,
    ## the service controller allocates a port from your cluster’s NodePort range.
    ## Ref: https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/#preserving-the-client-source-ip
    # healthCheckNodePort: 0

    # -- Represents the dual-stack-ness requested or required by this Service. Possible values are
    # SingleStack, PreferDualStack or RequireDualStack.
    # The ipFamilies and clusterIPs fields depend on the value of this field.
    ## Ref: https://kubernetes.io/docs/concepts/services-networking/dual-stack/
    ipFamilyPolicy: "SingleStack"
    # -- List of IP families (e.g. IPv4, IPv6) assigned to the service. This field is usually assigned automatically
    # based on cluster configuration and the ipFamilyPolicy field.
    ## Ref: https://kubernetes.io/docs/concepts/services-networking/dual-stack/
    ipFamilies:
      - IPv4
    ports:
      http: 80
      https: 443
    targetPorts:
      http: http
      https: https
    type: LoadBalancer
    ## type: NodePort
    ## nodePorts:
    ##   http: 32080
    ##   https: 32443
    ##   tcp:
    ##     8080: 32808
    nodePorts:
      http: ""
      https: ""
      tcp: {}
      udp: {}
    external:
      enabled: false
    internal:
      enabled: false
```






```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kuard
spec:
  selector:
    matchLabels:
      app: kuard
  replicas: 1
  template:
    metadata:
      labels:
        app: kuard
    spec:
      containers:
        - image: gcr.io/kuar-demo/kuard-amd64:1
          imagePullPolicy: Always
          name: kuard
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: kuard
spec:
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  selector:
    app: kuard
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kuard
  annotations: {}
  # 아래꺼 추가하고 apply
  #cert-manager.io/issuer: "letsencrypt-staging"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - hue-nginx.dev.dailyhotel.in
      secretName: quickstart-example-tls
  rules:
    - host: hue-nginx.dev.dailyhotel.in
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kuard
                port:
                  number: 80
```





internal ELB - https://stackoverflow.com/questions/67203957/how-to-create-only-internal-load-balancer-with-ingress-nginx-chart
```yaml
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-internal: 0.0.0.0/0

    ## access log
    service.beta.kubernetes.io/aws-load-balancer-access-log-enabled: true
    # The interval for publishing the access logs (can be 5 or 60 minutes).
    service.beta.kubernetes.io/aws-load-balancer-access-log-emit-interval: 60
    service.beta.kubernetes.io/aws-load-balancer-access-log-s3-bucket-name: my-logs-bucket
    service.beta.kubernetes.io/aws-load-balancer-access-log-s3-bucket-prefix: logs/prod
```




type instance
- NLB-Instance 의 경우 Kubernetes 로드 밸런서 컨트롤러를 사용하므로 AWS  LoadBalancer 컨트롤러 설치 필요없음
- nginx ingress 설정 시 Node SG에  lb subent 의 rule추가 (health 관련.. 룰 자동 삭제 X) - TAG설정으로 Rule 자동삭제 가능(최종확인) 
- DSR(Direct Server Return) 방식으로 동작하여 Response 시에 EC2 Instance는 직접 Client에게 패킷을 전달한다. 따라서 EC2 인스턴스는 IGW, NAT 등을 통해 아웃바운드(Outbound) 통신이 가능해야 하는 제약 조건이 있다.
- Target Group에 Node의 Instance가 추가됨
- worker node장애 발생시 ingress에 이슈가 발생할수있어 daemonset 설정 등이 필요


type ip 

- AWS 클러스터에서 NLB-IP를 사용하용할 경우 AWS LoadBalancer 컨트롤러 설치 필요.
- Node SG에 lb subent 의 rule 추가 (elbv2.k8s.aws/targetGroupBinding=shared) ingress 삭제 시 자동 삭제
- Request/Response가 모두 LB를 경유하기 때문에 아웃바운드 통신이 되지 않는 Private 구간에서도 NLB를 이용하여 서비스가 가능
- Target Group에 Node의 ip가 추가됨 (default로 nginx pod가 떠있는 node의 ip가 하나 추가됨)
- worker node장애 발생시 ingress에 이슈가 발생할수있어 daemonset 설정 등이 필요



Nginx Controller Ingress 사용할 경우 필요한 config(values.yaml)
```yaml
controller:
  kind: DaemonSet #선택 사항
  externalTrafficPolicy: "Local" # 클라이언트 소스 IP를 유지하도록 설정할 수있는 Kubernetes 서비스 리소스의 주석입니다. 이 값이 설정되면 클라이언트 (예 : 브라우저 또는 모바일 애플리케이션)의 실제 IP 주소가 노드의 IP 주소 대신 Kubernetes 서비스로 전파됩니다
  config:
    use-proxy-protocol: "true"
    real-ip-header: "proxy_protocol"
    log-format-escape-json: "true"
    log-format-upstream: >-
      {"namespace": "$namespace",
      "ingressName": "$ingress_name",
      "serviceName": "$service_name",
      "servicePort": "$service_port",
      "timestamp": "$time_iso8601",
      "requestID": "$req_id",
      "proxyUpstreamName": "$proxy_upstream_name",
      "proxyAlternativeUpstreamName": "$proxy_alternative_upstream_name",
      "upstreamStatus": "$upstream_status",
      "upstreamAddr": "$upstream_addr",
      "requestMethod": "$request_method",
      "requestUrl": "$host$request_uri",
      "status": $status,
      "requestSize": "$request_length",
      "responseSize": "$upstream_response_length",
      "userAgent": "$http_user_agent",
      "remoteIp": "$remote_addr",
      "referer": "$http_referer",
      "latency": "$upstream_response_time s",
      "protocol": "$server_protocol"}
  service:
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
      service.beta.kubernetes.io/aws-load-balancer-ssl-ports: https
      service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
      service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "{{ certificate_arn }}"
      service.beta.kubernetes.io/aws-load-balancer-type: nlb-ip  # FIXME lagecy value
      service.beta.kubernetes.io/aws-load-balancer-target-group-attributes: proxy_protocol_v2.enabled=true
      service.beta.kubernetes.io/aws-load-balancer-internal: "true"
      service.beta.kubernetes.io/aws-load-balancer-additional-resource-tags: "Name=nginx-ingress,Team=tc,Server=etc,Service=nginx-ingress,Security_level=moderate,Environment={{ env }}"
    targetPorts:
      https: http
```

new
```yaml
apiVersion: v1
kind: Service
metadata:
  name: echoserver
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: instance
spec:
  selector:
    app: echoserver
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
Example: ip mode


apiVersion: v1
kind: Service
metadata:
  name: echoserver
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: ip
spec:
  selector:
    app: echoserver
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  type: LoadBalancer
  loadBalancerClass: service.k8s.aws/nlb
```





조직별 또는 서비스별 별도의 ingress-nginx controller 를 구성해야 할 경우
[](https://kubernetes.github.io/ingress-nginx/user-guide/multiple-ingress/#multiple-ingress-nginx-controllers)

nginx ingress controller 사용시 internal/external 각각 1개씩 사용




<br><br>

> #### Reference
> * [kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx)
> * [ingress-nginx Docs](https://kubernetes.github.io/ingress-nginx)
