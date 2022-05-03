# [AWS] Your current user or role does not have access to Kubernetes objects on this EKS cluster error
> date - 2022.05.03  
> keyworkd - aws, eks, kubernetes  
> Amazon EKS console dashboard에서 data를 확인하기 위한 troubleshooting을 정리  

<br>

## Requirement

### Dependency
* Amazon EKS

<br>

## Issue
* 특정 IAM Role에서 EKS console dashboard에서 workload 등의 data를 확인할 수 없음


<br>

## Why?
* kubectl에서 사용하는 IAM Role과 AWS Web Console에서 사용하는 IAM Role을 분리해서 사용 중이여서 Web Console에서 사용하는 IAM Role에는 Kubernetes cluster에 대한 권한이 없어서 Kubernetes API에 access할 수 없는게 원인
* aws-auth ConfigMap을 확인해보면 IAM Role에 대한 Kubernetes RBAC 설정이 없다

```sh
$ kubectl -n kube-system describe cm aws-auth
Name:         aws-auth
Namespace:    kube-system
Labels:       <none>
Annotations:
Data
====
mapRoles:
----
- groups:
  - system:bootstrappers
  - system:nodes
  rolearn: arn:aws:iam:xxxxxxx:role/xxxxxxxx-iam-role
  username: system:node:{{EC2PrivateDNSName}}
```


<br>

## Resolve
* Web Console에서 사용하는 IAM Role에 Kubernetes RBAC 설정을 추가하고, IAM Policy에도 Kubernetes API access 권한을 추가해준다

### aws-auth에 IAM Role과 Kubernetes RBAC mapping 설정 추가
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    - rolearn: arn:aws:iam:xxxxxxx:role/xxxxxxxx-iam-role
      username: system:node:{{EC2PrivateDNSName}}
      groups:
      - system:bootstrappers
      - system:nodes
    - rolearn: arn:aws:iam::xxxxxxx:role/xxxxxxxx-console-iam-role  # here
      groups:
      - eks-console-dashboard-full-access-group
```


### IAM Role에 권한 추가
* Managed IAM Policy인 `ReadOnlyAccess`에는 `eks:Describe*`, `eks:List*`로 정의되어 있어서 `eks:AccessKubernetesApi`가 없기 때문에 eks console에서 data를 확인할 수 없어서 추가해줘야 한다
```json
// EKS Console Dashboard 사용을 위한 IAM Policy
{
  "Effect": "Allow",
  "Action": [
    "eks:DescribeNodegroup",
    "eks:ListNodegroups",
    "eks:DescribeCluster",
    "eks:ListClusters",
    "eks:AccessKubernetesApi",
    "ssm:GetParameter",
    "eks:ListUpdates",
    "eks:ListFargateProfiles"
  ],
  "Resource": "*"
}
```

### Kubernetes RBAC 설정 추가
* cluster full access
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: eks-console-dashboard-full-access-clusterrole
rules:
- apiGroups:
  - ""
  resources:
  - nodes
  - namespaces
  - pods
  verbs:
  - get
  - list
- apiGroups:
  - apps
  resources:
  - deployments
  - daemonsets
  - statefulsets
  - replicasets
  verbs:
  - get
  - list
- apiGroups:
  - batch
  resources:
  - jobs
  verbs:
  - get
  - list
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: eks-console-dashboard-full-access-binding
subjects:
- kind: Group
  name: eks-console-dashboard-full-access-group
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: eks-console-dashboard-full-access-clusterrole
  apiGroup: rbac.authorization.k8s.io
```

* 특정 namespace restricted access
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: eks-console-dashboard-restricted-access-clusterrole
rules:
- apiGroups:
  - ""
  resources:
  - nodes
  - namespaces
  verbs:
  - get
  - list
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: eks-console-dashboard-restricted-access-clusterrole-binding
subjects:
- kind: Group
  name: eks-console-dashboard-restricted-access-group
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: eks-console-dashboard-restricted-access-clusterrole
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: eks-console-dashboard-restricted-access-role
rules:
- apiGroups:
  - ""
  resources: 
  - pods
  verbs:
  - get
  - list
- apiGroups:
  - apps
  resources:
  - deployments
  - daemonsets
  - statefulsets
  - replicasets
  verbs:
  - get
  - list
- apiGroups:
  - batch
  resources:
  - jobs
  verbs:
  - get
  - list
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: eks-console-dashboard-restricted-access-role-binding
  namespace: default
subjects:
- kind: Group
  name: eks-console-dashboard-restricted-access-group
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: eks-console-dashboard-restricted-access-role
  apiGroup: rbac.authorization.k8s.io
```


<br>

## Conclusion
* Amazon EKS의 인증, 인가 시스템은 Kubernetes RBAC + AWS IAM으로 구성되어 있기 때문에 권한 문제가 발생하면 AWS IAM Policy, Kubernetes RBAC 그리고 이 2가지를 mapping하는 aws-auth ConfigMap도 함께 확인해야 한다


<br><br>

> #### Reference
> * [Amazon EKS의 “현재 사용자 또는 역할이 이 EKS 클러스터의 Kubernetes 객체에 액세스할 수 없습니다.”라는 오류를 해결하려면 어떻게 해야 합니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/eks-kubernetes-object-access-error/)
> * [Enabling IAM user and role access to your cluster - Amazon EKS Docs](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)
> * [Amazon EKS identity-based policy examples](https://docs.aws.amazon.com/eks/latest/userguide/security_iam_id-based-policy-examples.html)
