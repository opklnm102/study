# [k8s] Kubernetes Addons
> date - 2022.03.02  
> keyworkd - kubernetes, addon  
> k8s addon에 대해 정리  

<br>


## Network
| Name | Description |
|:--|:--|
| [kube-proxy](https://kubernetes.io/ko/docs/reference/command-line-tools-reference/kube-proxy) | Node의 트래픽을 Pod로 proxy |
| [amazon-vpc-cni](https://github.com/aws/amazon-vpc-cni-k8s) | VPC IP를 Pod에 할당해주는 CNI |
| [CoreDNS](https://coredns.io) | cluster의 container에게 DNS service와 service discovery 제공 |
| [ExternalDNS](https://github.com/kubernetes-sigs/external-dns) | Route53 같은 외부 DNS와 cluster DNS 연동<br>CSP의 DNS 서비스(e.g. Route53) 권한 필요 |
| [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller) | AWS ELB 연동 |
| [Calico](https://www.tigera.io/project-calico) | Network Policy | 
| [Istio](https://istio.io) | service mesh |


<br>

## Observability
| Name | Description |
|:--|:--|
| [Kiali](https://kiali.io) |Istio service mesh console로 설정, traffic visualize 등 가능<br>Datadog로 대체 |
| [Jaeger](https://www.jaegertracing.io) |distributed tracing<br>Datadog, tempo로 대체 |
| [Kubernetes Metrics Server](https://github.com/kubernetes-sigs/metrics-server) |k8s resource metrics 수집 |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) |k8s cluster 상태 metrics 수집<br>Datadog KSM(Kubernetes State Metrics) Core로 대체 |
| [Prometheus](https://prometheus.io) |metrics 수집, alert<br>Datadog로 대체 |
| [Grafana](https://grafana.com/oss/grafana) |dashboard, alert<br>Datadog, Elasticsearch로 대체 |
| [Promtail](https://grafana.com/docs/loki/latest/clients/promtail) |Loki 통합<br>Datadog, Fluent Bit, Fluentd로 대체 |
| [Grafana Loki](https://grafana.com/oss/loki) |Log aggregation system으로 object storage에 장기 저장 가능<br>Datadog, Elasticsearch로 대체 |
| [Grafana Tempo](https://grafana.com/oss/tempo) |distributed tracing <br>Datadog, Jaeger로 대체 |
| [Fluent Bit](https://fluentbit.io) |log, metrics forwarder<br>Datadog, Promtail로 대체 |
| [Fluentd](https://www.fluentd.org) |log forwarder<br>Fluentd Bit로 대체 |
| [Datadog](https://www.datadoghq.com) |Modern monitoring & security |
| [Kubernetes Dashboard](https://github.com/kubernetes/dashboard) |cluster web console |
| [kubecost](https://www.kubecost.com) |k8s 리소스 사용을 계산하여 비용 추정 |


<br>

## Storage
| Name | Description |
|:--|:--|
| [Amazon EBS(Elastic Block Store) CSI driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) | Pod에 EBS volume을 PersistentVolume으로 제공<br>cross AZ 불가능 |
| [Amazon EFS(Elastic File System) CSI Driver](https://github.com/kubernetes-sigs/aws-efs-csi-driver) | Pod에 EFS를 PersistentVolume으로 제공<br>cross AZ 가능 |


<br>

## Availability
| Name | Description |
|:--|:--|
| [Cluster Autoscaler(CA)](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler) | cluster node auto scaling<br>Karpenter로 대체 |
| [AWS Node Termination Handler(NTH)](https://github.com/aws/aws-node-termination-handler) | EC2 lifecycle(e.g. Spot)에 따른 node termination 처리<br>Karpenter로 대체 |
| [Karpenter](https://karpenter.sh) | cluster node auto scaling<br>node 관리를 위한 EC2, SQS 권한 필요 |
| [cluster-overprovisioner](https://github.com/codecentric/cluster-overprovisioner) | 빠른 Pod 배포를 위한 여유 리소스 확보 |
| [Descheduler](https://github.com/kubernetes-sigs/descheduler) | 잘못 schedule된 Pod 정리 |


<br>

## Deployment
| Name | Description |
|:--|:--|
| [ArgoCD](https://argoproj.github.io/cd) | Git 기반 배포 | Deployment
| [ArgoRollout](https://argoproj.github.io/rollouts) | ArgoCD 기반 배포 전략 제공 | Deployment


<br>

## Security
| Name | Description |
|:--|:--|
| [cert-manager](https://cert-manager.io) | 인증서 관리<br>ACM 사용시 불필요 |
| [External Secrets](https://external-secrets.io) | 외부 secret serivce 연동<br>ArgoCD vault plugin, Sealed Secrets, Secrets Store CSI Driver로 대체 |
| [Sealed Secrets](https://sealed-secrets.netlify.app) | 외부 secret serivce 연동 |
| [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io) | 외부 secret serivce 연동 |
| [Gatekeeper](https://open-policy-agent.github.io/gatekeeper) | k8s policy management | 
| [Kyverno](https://kyverno.io) | k8s policy management |
