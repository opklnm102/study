# [k8s] kind(Kubernetes in Docker)
> date - 2021.04.18  
> keyworkd - kubernetes, k8s, docker, kind  
> docker로 kubernetes cluster를 구성할 수 있는 kind에 대해 정리  
> 아래 과정은 [hello-kind](https://github.com/opklnm102/hello-kind)에서 진행  

<br>

## kind란?
* Docker container node를 사용하여 local kubernetes cluster를 실행하기 위한 tool


<br>

## Install
```sh
## go module에서는 go get이 다르게 동작하므로 $HOME에서 진행
$ cd $HOME

$ GO111MODULE="on" go get sigs.k8s.io/kind@v0.10.0 && kind create cluster
```

* Mac
```sh
$ brew install kind

## or 
$ curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.10.0/kind-darwin-amd64
```


<br>

## Creating a Cluster
* `kind create cluster`로 간단하게 cluster 생성 가능
```sh
$ kind create cluster

## example
$ kind create cluster
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.20.2) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Not sure what to do next? 😅  Check out https://kind.sigs.k8s.io/docs/user/quick-start/
```

<br>

### cluster 생성시 원하는 [kindest/node](https://hub.docker.com/r/kindest/node) image 사용
```sh
$ kind create cluster --image=[tag]
```

<br>

### cluster에 이름 부여
```sh
$ kind create cluster --name [cluster name]

## example
$ kind create cluster --name kind-cluster-2
```


<br>

## Get clusters
* `kind`로 생성한 cluster 조회
```sh
$ kind get clusters
kind

$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED         STATUS         PORTS                       NAMES
489da664bbd0   kindest/node:v1.20.2   "/usr/local/bin/entr…"   4 minutes ago   Up 4 minutes   127.0.0.1:54305->6443/tcp   kind-control-plane
```


<br>

## Access clusters
* `kubectl`을 사용해 cluster에 access
  * `${HOME}/.kube/config` 또는 `$KUBECONFIG` environment variable에 설정된 configuration file 사용
 
```sh
$ kubectl cluster-info --context kind-kind
Kubernetes control plane is running at https://127.0.0.1:54305
KubeDNS is running at https://127.0.0.1:54305/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```


<br>

## Deleting a Cluster
* `kind` cluster 제거
```sh
$ kind delete cluster
```

<br>

### 특정 cluster 제거
```sh
$ kind delete cluster --name kind-cluster-2
```


<br>

## Loading an Image into your cluster
* load image into cluster
```sh
$ kind load docker-image [image]

## example
$ kind load docker-image my-custom-image-0 my-custom-image-1
```

* load image archive into cluster
```sh
$ kind load image-archive [image archive]

## example
$ kind load image-archive /my-image-archive.tar
```

* cluster node의 image 조회
```sh
$ docker exec -it [node name] crictl images

## example
$ docker exec -it kind-control-plane crictl images
IMAGE                                      TAG                  IMAGE ID            SIZE
docker.io/kindest/kindnetd                 v20210119-d5ef916d   6b17089e24fdb       122MB
...
```

<br>

### Usage
* Workflow
```sh
$ docker build -t my-custom-image:unique-tag ./my-image-dir

$ kind load docker-image my-custom-image:unique-tag

$ kubectl apply -f my-manifest-using-my-image:unique-tag
```

* load nginx image
```sh
$ docker exec -it kind-control-plane crictl images
IMAGE                                      TAG                  IMAGE ID            SIZE
docker.io/kindest/kindnetd                 v20210119-d5ef916d   6b17089e24fdb       122MB
...

$ kind load docker-image nginx:1.19.9-alpine
Image: "nginx:1.19.9-alpine" with ID "sha256:72ab4137bd85aae7970407cbf4ba98ec0a7cb9d302e93a38bb665ba5fddf6f5d" not yet present on node "kind-control-plane", loading...

$ docker exec -it kind-control-plane crictl images
IMAGE                                      TAG                  IMAGE ID            SIZE
docker.io/kindest/kindnetd                 v20210119-d5ef916d   6b17089e24fdb       122MB
docker.io/library/nginx                    1.19.9-alpine        72ab4137bd85a       24.1MB
...
```


<br>

## Configuring Your kind cluster
* cluster 생성시 configuration
```sh
$ kind create cluster --config [config file]

## example
$ kind create cluster --config kind-example-config.yaml
```

* kind-example-config.yaml
```yaml
# this config file contains all config fields with comments
# NOTE: this is not a particularly useful config file
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
# patch the generated kubeadm config with some extra settings
kubeadmConfigPatches:
- |
  apiVersion: kubelet.config.k8s.io/v1beta1
  kind: KubeletConfiguration
  evictionHard:
    nodefs.available: "0%"
# patch it further using a JSON 6902 patch
kubeadmConfigPatchesJSON6902:
- group: kubeadm.k8s.io
  version: v1beta2
  kind: ClusterConfiguration
  patch: |
    - op: add
      path: /apiServer/certSANs/-
      value: my-hostname
# 1 control plane node and 3 workers
nodes:
# the control plane node config
- role: control-plane
# the three workers
- role: worker
- role: worker
- role: worker
```

<br>

### Multi-node clusters
* multi-node.yaml
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
```

```sh
$ kind create cluster --config multi-node-cluster.yaml --name multi-node

$ kubectl get nodes
NAME                       STATUS   ROLES                  AGE     VERSION
multi-node-control-plane   Ready    control-plane,master   2m18s   v1.20.2
multi-node-worker          Ready    <none>                 105s    v1.20.2
multi-node-worker2         Ready    <none>                 105s    v1.20.2
```

<br>

### Control-plane HA
* control-plane-ha.yaml
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: control-plane
- role: control-plane
- role: worker
- role: worker
- role: worker
```

```sh
$ kind create cluster --config control-plane-ha.yaml --name control-plane-ha

$ docker ps
CONTAINER ID   IMAGE                                COMMAND                  CREATED          STATUS          PORTS                       NAMES
de0da214e520   kindest/haproxy:v20200708-548e36db   "/docker-entrypoint.…"   3 minutes ago    Up 3 minutes    127.0.0.1:56933->6443/tcp   control-plane-ha-external-load-balancer
6c18626f5d96   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes    127.0.0.1:56934->6443/tcp   control-plane-ha-control-plane3
4980ec47355c   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes    127.0.0.1:56932->6443/tcp   control-plane-ha-control-plane2
ac469f68db21   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes                                control-plane-ha-worker
7bc19478dce4   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes                                control-plane-ha-worker2
5353afd95d0d   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes                                control-plane-ha-worker3
685083ce6e54   kindest/node:v1.20.2                 "/usr/local/bin/entr…"   4 minutes ago    Up 3 minutes    127.0.0.1:56931->6443/tcp   control-plane-ha-control-plane
```


<br>

## Mapping ports to the host machine
* `extraPortMappings`로 node에서 host system으로 port mapping 가능
* `NodePort` Service, `Daemonsets`의 port 노출시 유용
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    listenAddress: "0.0.0.0" # Optional, defaults to "0.0.0.0"
    protocol: udp # Optional, defaults to tcp
```


<br>

## Setting Kubernetes version
* [releases page](https://github.com/kubernetes-sigs/kind/releases)에서 원하는 Kubernetes version의 `kindest/node`를 사용
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: kindest/node:v1.16.4@sha256:b91a2c2317a000f3a783489dfb755064177dbc3a0b2f4147d50f04825d016f55
- role: worker
  image: kindest/node:v1.16.4@sha256:b91a2c2317a000f3a783489dfb755064177dbc3a0b2f4147d50f04825d016f55
```


<br>

## Enable Feature gates
아래와 같이 설정하여 `kubeadm` 설정 필요
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
featureGates:
  FeatureGateName: true
```


<br>

## Exporting Cluster Logs
* Docker host, container, kubernetes cluser에 대한 정보가 포함된 log 추출
```sh
$ kind export logs [path] [--name xxx]

## example
$ kind export logs ./ --name mult-node
Exported logs for cluster "multi-node" to:
./

$ tree -L 2 .
.
├── docker-info.txt
├── multi-node-control-plane
│   ├── alternatives.log
│   ├── containerd.log
│   ├── containers
│   ├── inspect.json
│   ├── journal.log
│   ├── kind-version.txt
│   ├── kubelet.log
│   ├── kubernetes-version.txt
│   ├── pods
│   └── serial.log
├── multi-node-worker
...

9 directories, 25 files
```


TODO: ingress, LoadBalancer 추가
https://kind.sigs.k8s.io/docs/user/ingress
https://kind.sigs.k8s.io/docs/user/loadbalancer


<br><br>

> #### Reference
> * [kubernetes-sigs/kind](https://github.com/kubernetes-sigs/kind)
> * [Quick Start - kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
