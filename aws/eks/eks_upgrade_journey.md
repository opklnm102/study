# [AWS] Amazon EKS Upgrade Journey
> date - 2022.05.23  
> keyworkd - aws, eks, kubernetes  
> Amazon EKS cluster를 upgrade하는 과정을 정리  

<br>

## API 변경에 따른 영향도 파악
* next version에서 application runtime에 영향을 줄 수 있는 API 변경이 발생할 수도 있어서 [Deprecated API Migration Guide](https://kubernetes.io/docs/reference/using-api/deprecation-guide/)에서 확인 필요

<br>

### next version testing 
* API 중단 확인을 확인할 수 있는 kubernetes cluster 생성
```sh
## with kind
$ kind create cluster --name k122 --image kindest/node:v1.22.0@sha256:b8bda84bb3a190e6e028b1760d277454a72267a5454b57db34437c34a588d047 

$ helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --version 4.0.17 --namespace ingress-nginx --create-namespace
```
* new kubernetes version으로 migration하기 전에 CI/CD workflow를 구축하여 application 동작 testing 수행

<br>

### [pluto](https://github.com/FairwindsOps/pluto)를 사용해 검증
* [FairwindsOps/pluto](https://github.com/FairwindsOps/pluto) - deprecated kubernetes api를 찾는 tool
* helm release 및 k8s object가 더 이상 API를 사용하지 않는지 검증


#### Install
```sh
$ brew install FairwindsOps/tap/pluto
```

#### Usage
```sh
$ pluto detect-files -d [directory]
```

* Helm detection
```sh
$ pluto detect-helm -owide
```

* target version
```sh
$ pluto detect-files -t k8s=v1.22.2  -d .

NAME                                     KIND                      VERSION                          REPLACEMENT                 REMOVED   DEPRECATED
kafka-pdb                                PodDisruptionBudget       policy/v1beta1                   policy/v1                   false     true
...
```

<br>

### kubectl convert를 사용해 API 변환
* [Migrate to non-deprecated APIs](https://kubernetes.io/docs/reference/using-api/deprecation-guide/#migrate-to-non-deprecated-apis)에 나오는 방법으로 `kubectl convert`를 사용해 manifest를 자동으로 변환 가능

#### [Install](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/#install-kubectl-convert-plugin)
```sh
$ curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl-convert"
$ chmod +x ./kubectl-convert
$ sudo mv ./kubectl-convert /usr/local/bin/kubectl-convert
$ sudo chown root: /usr/local/bin/kubectl-convert
$ kubectl convert --help
```

#### Usage
```sh
$ kubectl convert -f <file> --output-version <group>/<version>
```

* before
```yaml
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  maxReplicas: 2
  minReplicas: 1
  metrics:
    - type: Resource
      resource:
        name: cpu
        targetAverageUtilization: 80
```

* kubectl convert로 변환
```sh
$ kubectl convert -f ./app-hpa.yaml --output-version autoscaling/v2
```

* after
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  maxReplicas: 2
  minReplicas: 1
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 80
        type: Utilization
```

#### pluto + kubectl-convert를 이용한 manifest 변환 자동화
* script를 `migrate-deprecated-api`로 저장
```sh
#!/usr/bin/env bash

usage() {
  cat <<-EOM
Usage: ${0##*/} [kubernetes version] [manifest path]
e.g. ${0##*/} v1.24.7 .
EOM
  exit 0
}

if [[ $# != 2 ]]; then
  usage
fi

command -v jq >/dev/null || fail "jq is not installed!"

k8s_version=${1}
manifest_path=$(cd "${2}" && pwd)
cd "${manifest_path}"

pluto_result=$(pluto detect-files -o json -t k8s=${k8s_version} -d . | jq '[.items[] | select(.api."replacement-api" != "") | {replacement_api: .api."replacement-api", file_path: .filePath}]')

for row in $(echo "${pluto_result}" | jq -r '.[] | @base64'); do
  _jq() {
    echo ${row} | base64 --decode | jq -r ${1}
  }
  file_path=$(_jq '.file_path')
  kubectl convert -f ${file_path} --output-version $(_jq '.replacement_api') | kubectl create -f - --dry-run=client
  kubectl convert -f ${file_path} --output-version $(_jq '.replacement_api') > ${file_path}.new
  sed -i '' '/creationTimestamp/d' ${file_path}.new
  sed -i '' '/status/q' ${file_path}.new
  sed -i '' '/status/d' ${file_path}.new
  mv ${file_path}.new ${file_path}
done
```

* usage
```sh
$ ./migrate-deprecated-api [kubernetes version] [manifest path]

$ ./migrate-deprecated-api v1.24.7 .
```


<br>

## Upgrade Amazon EKS(Elastic Kubernetes Service)
* Amazon EKS는 HA(Highly Available) cluster로 control plane을 new kubernetes version으로 대체
  * 실행 중인 application은 영향을 받지 않으며, cluster가 복구 불가능한 상태로 남아 있는 일은 없다
* Amazon EKS cluster에서 사용할 subnet의 IP 2~3개 필요
  * 부족하면 upgrade가 실패 할 수 있다
  * subnet, security group이 없어도 실패할 수 있다
* [Supported version skew](https://kubernetes.io/releases/version-skew-policy/#kube-apiserver)에 따르면 kube-apiserver는 minor version 1개 차이 허용, kubelet은 kube-apiserver와 minor version 2개 차이 허용
  * 1.21 -> 1.23으로 2단계 upgrade하려면? 1단계씩 2번 진행 필요
```
1. control plane 1.21 -> 1.22 
2. data plane 1.21 -> 1.22 
3. control plane 1.22 -> 1.23
4. data plane 1.22 -> 1.23
```

<br>

### Upgrade Process
#### Control plane
* Upgrade Amazon EKS 
* Upgrade CoreDNS 
* Upgrade kube-proxy
* Upgrade Amazon VPC CNI
* Upgrade 3rd-party add-on
  * [kube-state-metrics(KSM)](https://github.com/kubernetes/kube-state-metrics#compatibility-matrix)
  * [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller)
  * [Cluster Autoscaler(CA)](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#releases)
  * [Kubernetes Metrics Server](https://github.com/kubernetes-sigs/metrics-server#compatibility-matrix)
  * [AWS Node Termination Handler(NTH)](https://github.com/aws/aws-node-termination-handler)
  * [ExternalDNS](https://github.com/kubernetes-sigs/external-dns#kubernetes-version-compatibility)
  * ...

#### Node group
* Create new version node group
* Migrate to new version node group

<br>

### 1. Upgrade control plane
* upgrade
```sh
$ aws eks update-cluster-version \
  --region [region code] \
  --name [cluster name] \
  --kubernetes-version [version]

## example
$ aws eks update-cluster-version \
  --region ap-northeast-2 \
  --name development \
  --kubernetes-version 1.22
```

* eks upgrade 확인
```sh
$ aws eks describe-update \
  --region [region code] \
  --name [cluster name] \
  --update-id [update id]

## or
$ kubectl version --short
```

<br>

### 2. Upgrade Cluster Autoscaler
* [Cluster Autoscaler Releases](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#releases)에서 권장하는 버전을 찾아서 upgrade

<br>

### 3. Upgrade Node Group
* [Amazon EKS 최적화 Amazon Linux AMI 버전](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/eks-linux-ami-versions.html)에서
EKS와 동일한 kubernetes version의 Amazon EKS optimized AMI를 찾는다
  * custom AMI를 사용하려면 [Amazon EKS 최적화 Amazon Linux AMI 빌드 스크립](https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/eks-ami-build-scripts.html) 참고
  * Amazon EKS optimized AMI release시 최신 AMI로 교체하는 것을 고려

```sh
$ aws ssm get-parameter --name /aws/service/eks/optimized-ami/1.22/amazon-linux-2/recommended/image_id | jq .
{
  "Parameter": {
    "Name": "/aws/service/eks/optimized-ami/1.22/amazon-linux-2/recommended/image_id",
    "Type": "String",
    "Value": "ami-07bc1db81a5580466",
    "Version": 5,
    "LastModifiedDate": "2022-05-03T07:40:06.561000+09:00",
    "ARN": "arn:aws:ssm:ap-northeast-2::parameter/aws/service/eks/optimized-ami/1.22/amazon-linux-2/recommended/image_id",
    "DataType": "text"
  }
}

$ aws ssm get-parameter --name /aws/service/eks/optimized-ami/1.22/amazon-linux-2/recommended/image_id --region ap-northeast-2 --query "Parameter.Value" --output text
ami-07bc1db81a5580466
```
* node group upgrade는 2가지 방법 중 선택할 수 있다
   1. 기존 node group의 AMI 변경
      * CloudFormation stack에서 node group의 AMI를 변경하면 CloudFormation에 의해 rolling upgrade 수행
   2. new version node group 생성 후 migration
      * 1번 보다 권장하는 방법
      * Create new version node group -> old version node group `NoSchedule로 taint` -> old version node group drain

* new version node group 생성 후 migration
```sh
## node group의 label 확인
$ kubectl get no --show-labels | grep "node-group"

...
node-group=group1, version=v1
...
node-group=group1, version=v2

## 이전 버전의 node group cordon
$ kubectl get no -l node-group=group1,version=v1 | grep -v "NAME" | awk '{print $1}' | xargs -I {} kubectl cordon {}

## 이전 버전의 node group drain으로 pod migration
$ kubectl get no -l node-group=group1,version=v1 | grep -v "NAME" | awk '{print $1}' | xargs -I {} kubectl drain --delete-emptydir-data --ignore-daemonsets --skip-wait-for-delete-timeout=0 {}
```

#### script 발췌
```sh
#!/usr/bin/env bash

## add label old
nodes=$(kubectl get nodes --no-headers -o custom-columns=":metadata.name")
for node_name in "${nodes[@]}"; do
 echo "$node_name"
 kubectl label node $node_name version=old
done

## create new version node group
...

## cordon old version node
nodes=$(kubectl get nodes -l version=old --no-headers -o custom-columns=":metadata.name")
for node_name in "${nodes[@]}"; do
  echo "$node_name"
  kubectl cordon $node_name
done
```

#### evict시 `PodDisruptionBudget`에 영향을 받아 안전하게 진행된다
```sh
...
evicting pod default/kafka-2
error when evicting pods/"kafka-2" -n "default" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.
pod/kafka-2 evicted
```


<br>

### 4. Upgrade Add-on Node Group
* [Amazon VPC CNI](https://github.com/aws/amazon-vpc-cni-k8s), [CoreDNS](https://coredns.io/), [kube-proxy](https://kubernetes.io/ko/docs/reference/command-line-tools-reference/kube-proxy/) 등 add-on upgrade

#### Amazon VPC CNI
* [Managing the Amazon VPC CNI add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-vpc-cni.html)에서 권장 버전을 찾아서 upgrade
  * e.g. Amazon EKS 1.20 cluster에 권장 버전 - latest version 권장
* 호환성을 위해 minor version 1단계씩 upgrade 필요
  * e.g. upgrade 1.7.5-eksbuild.1 -> 1.11.0-eksbuild.1
    * 1.7 -> 1.8 -> 1.9 -> 1.10 -> 1.11
* Amazon VPC CNI version 확인
```sh
$ kubectl describe daemonset aws-node --namespace kube-system | grep Image | cut -d "/" -f 2

amazon-k8s-cni-init:v1.7.5-eksbuild.1
amazon-k8s-cni:v1.7.5-eksbuild.1
```

* upgrade manifest
```sh
## backup
$ kubectl get daemonset aws-node -n kube-system -o yaml > aws-k8s-cni-old.yaml

## upgrade 1.8
$ mkdir 1-8  && cd 1-8
$ curl -o aws-k8s-cni.yaml https://raw.githubusercontent.com/aws/amazon-vpc-cni-k8s/v1.8.0/config/v1.8/aws-k8s-cni.yaml
$ sed -i.bak -e 's/us-west-2/ap-northeast-2/' aws-k8s-cni.yaml
$ kubectl apply -f  aws-k8s-cni.yaml

## upgrade 1.9
$ mkdir 1-9 && cd 1-9
$ curl -o aws-k8s-cni.yaml https://raw.githubusercontent.com/aws/amazon-vpc-cni-k8s/release-1.9/config/v1.9/aws-k8s-cni.yaml
$ sed -i.bak -e 's/us-west-2/ap-northeast-2/' aws-k8s-cni.yaml
$ kubectl apply -f  aws-k8s-cni.yaml

## upgrade 1.10
$ mkdir 1-10  && cd 1-10
$ curl -o aws-k8s-cni.yaml https://raw.githubusercontent.com/aws/amazon-vpc-cni-k8s/release-1.10/config/master/aws-k8s-cni.yaml
$ sed -i.bak -e 's/us-west-2/ap-northeast-2/' aws-k8s-cni.yaml
$ kubectl apply -f  aws-k8s-cni.yaml
```

* [AWS VPC CNI helm chart](https://github.com/aws/eks-charts/tree/master/stable/aws-vpc-cni)으로 upgrade
```sh
$ helm repo add eks https://aws.github.io/eks-charts

$ helm install --name aws-vpc-cni --namespace kube-system eks/aws-vpc-cni
```

#### CoreDNS
* [Managing the CoreDNS add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)의 Updating the CoreDNS self-managed add-on으로 진행
* [Managing the CoreDNS add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)에서 권장 버전을 찾아서 upgrade
  * e.g. Amazon EKS 1.20 cluster에 권장 버전 - CoreDNS 1.8.3
* check version
```sh
$ kubectl describe deployment coredns \
    --namespace kube-system \
    | grep Image \
    | cut -d "/" -f 3

coredns:v1.8.0-eksbuild.1
```

* upgrade manifest
```sh
$ kubectl set image -n kube-system deployment.apps/coredns coredns=602401143452.dkr.ecr.ap-northeast-2.amazonaws.com/eks/coredns:v1.8.3-eksbuild.1
```

#### kube-proxy
* [Managing the kube-proxy add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html)의 Updating the kube-proxy self-managed add-on으로 진행
* [Managing the kube-proxy add-on](https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html)에서 권장 버전을 찾아서 upgrade
  * e.g. Amazon EKS 1.22 cluster에 권장 버전 - kube-proxy 1.22.6-eksbuild.1
* check version
```sh
$ kubectl get daemonset kube-proxy \
    -n kube-system \
    -o=jsonpath='{$.spec.template.spec.containers[:1].image}'

602401143452.dkr.ecr.ap-northeast-2.amazonaws.com/eks/kube-proxy:v1.21.2-eksbuild.2
```

* upgrade manifest
```sh
$ kubectl set image -n kube-system daemonset.apps/kube-proxy kube-proxy=602401143452.dkr.ecr.ap-northeast-2.amazonaws.com/eks/kube-proxy:v1.22.6-eksbuild.1
```


<br>

## Troubleshooting
* [노드 상태를 NotReady 또는 Unknown에서 Ready 상태로 변경하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/eks-node-status-ready/) 참고하여 node에 접속하여 kubelet log 확인
```sh
$ suto systemctl kubelet status
```

<br><br>

> #### Reference
> * [Updating a cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
> * [Amazon EKS Upgrade Journey From 1.19 to 1.20](https://marcincuber.medium.com/amazon-eks-upgrade-journey-from-1-19-to-1-20-78c9a7edddb5)
