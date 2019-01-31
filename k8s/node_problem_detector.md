# [k8s] Node Problem Detector(NPD)
> date - 2019.01.31  
> keyword - kubernetes, k8s  
> kubernetes의 addon component 중 하나인 NPD(Node Problem Detector)에 대해 정리  

<br>

## 용도
* k8s Cluster의 Node에서 다양히게 발생하는 문제 탐지기
* Node의 다양한 daemon으로 부터 문제를 수집 후 NodeCondition, Event를 사용해 api server로 report
* `DaemonSet` or standalone로 실행 가능
* 현재 k8s는 node problem detector로부터 생성된 NodeCondition, Event에 대해 아무런 처리를 하지 않지만, [Remedy Systems](https://github.com/kubernetes/node-problem-detector/tree/master#remedy-systems)에 대해 논의 중
  * POC로 [Draino](https://github.com/planetlabs/draino)가 있다


<br>

## Background
* Node에서 실행되는 Pod에 영향을 줄 수 있는 Node의 문제는 다양하게 발생한다
  * HardWare issue - Bad cpu, bad memory, bad disk
  * Kernel issue - Kernel deadlock, corrupted file system
  * Container runtime issue - unresponsive runtime daemon
  * etc...
* cluster management stack의 upstream layer에서 볼 수 없기 때문에 k8s는 bad node에 계속 pod을 scheduling 한다
  * cluster management stack - self-hosted k8s, AWS EKS, Google GKE 등
* upstream layer에서 이런 문제를 볼 수 있으면 해결 방법을 찾을 수 있다


<br>

## Limitations
* kernel issue detection은 journald 같은 tool은 사용 못하고 `file based kernel log에 의존`
* kernel issue detection은 kernel log 형식에만 동작
  * ubuntu, debian 계열에서만 동작
  * Kernel monitor는 [Translator](https://github.com/kubernetes/node-problem-detector/blob/v0.1/pkg/kernelmonitor/translator/translator.go) plugin을 사용해 kernel log를 사용하므로 새로운 format으로 쉽게 확장 가능


<br>

## Problem API
* Event, NodeCondition를 사용해 `apiserver로 report`
* NodeCondition
  * Pod이 Node를 사용할 수 없는 영구적인 문제는 NodeCondition으로 reporting
* Event
  * Pod에 영향이 제한적이지만 유익한 일시적인 문제는 Event로 reporting


<br>

## Problem Daemon
* node-problem-detector의 sub daemon
* 특정 종류의 문제를 node-problem-detector로 reporting

* k8s 전용 sub daemon
* 존재하는 node health monitoring daemon과 node-problem-detector를 통합
* 현재 node-problem-binary에 goroutine으로 동작
  * 다른 container로 분리하고 pod specification으로 구성 예정

### Kernel Monitor
* NodeCondition - KernelDeadlock
* kernel monitoring
* kernel log를 읽어 정의된 조건에 따라 문제를 reporting

### AbrtAdaptor
* NodeCondition - None
* Monitor ABRT(Automatic Bug Report Tool) log Monitoring, reporting
* ABRT
  * host에서 발생한 application crash와 kernel 문제를 파악할 수 있는 health monitoring daemon
  * [abrd - GitHub](https://github.com/abrt)

### CustomPluginMonitor
* NodeCondition - On-demand(According to users configuration)
* 유저가 정의한 check script로 monitoring


<br>

## Kernel Monitor
* node problem detector의 problem daemon
* kernel log를 모니터링하고 미리 정의된 규칙에 따라 kernel problem을 감지
  * `config/kernel-monitor.json`에 정의
  * overwirte 가능
* OS마다 kernel log path가 다르기 때문에 OS에 맞게 수정



* NodeCondition은 `conditions`에 추가
```json
{
	"type": "NodeCondtionType",
	"reason": "CamelCaseDefaultNodeConditionReason",
	"message": "arbitrary default node condition message"
}
```

* New Problem 추가
* 감지할 new problem은 `rules`에 추가
```json
{
	"type": "temporary/permanent",
	"condition": "NodeConditionOfPermanentIssue",
	"reason": "CamelCaseShortReason",
	"message": "regexp matching the issue in the kernel log",
}
```
* Node의 상태를 monitoring하기 위해 Node마다 resource overhead가 발생하지만 node-problem-detector를 실행하는걸 추천
  * kernel log는 비교적 느리게 생성되서 괜찮다
* node-problem-detector에 resource limit이 설정되어 있다
  * [benchmark result](https://github.com/kubernetes/node-problem-detector/issues/2#issuecomment-220255629)를 보면 고부하에서도 리소스 사용은 허용된다


<br>

### 설정 파일
```json
{
	"logPath": "/log/kern.log",
	"bufferSize": 10,
	"source": "kernel-monitor",
	"conditions": [
		{
			"type": "KernelDeadlock",
			"reason": "KernelHasNoDeadlock",
			"message": "kernel has no deadlock"
		}
	],
	"rules": [
		{
			"type": "temporary",
			"reason": "OOMKilling",
			"pattern": "Kill process \\d+ (.+) score \\d+ or sacrifice child\\nKilled process \\d+ (.+) total-vm:\\d+kB, anon-rss:\\d+kB, file-rss:\\d+kB"
		},
		{
			"type": "temporary",
			"reason": "TaskHung",
			"pattern": "task \\S+:\\w+ blocked for more than \\w+ seconds\\."
		},
		{
			"type": "permanent",
			"condition": "KernelDeadlock",
			"reason": "AUFSUmountHung",
			"pattern": "task umount\\.aufs:\\w+ blocked for more than \\w+ seconds\\."
		},
		{
			"type": "permanent",
			"condition": "KernelDeadlock",
			"reason": "DockerHung",
			"pattern": "task docker:\\w+ blocked for more than \\w+ seconds\\."
		},
		{
			"type": "permanent",
			"condition": "KernelDeadlock",
			"reason": "UnregisterNetDeviceIssue",
			"pattern": "unregister_netdevice: waiting for \\w+ to become free. Usage count = \\d+"
		}
	]
}
```


<br>

### Node Conditions
```
Conditions:
  Type             Status  LastHeartbeatTime                 LastTransitionTime                Reason                       Message
  KernelDeadlock   False   Fri, 11 Jan 2019 11:23:21 +0900   Fri, 30 Nov 2018 16:46:58 +0900   KernelHasNoDeadlock          kernel has no deadlock
  OutOfDisk        False   Fri, 11 Jan 2019 11:23:46 +0900   Fri, 25 May 2018 23:30:47 +0900   KubeletHasSufficientDisk     kubelet has sufficient disk space available
  MemoryPressure   False   Fri, 11 Jan 2019 11:23:46 +0900   Tue, 04 Sep 2018 17:31:41 +0900   KubeletHasSufficientMemory   kubelet has sufficient memory available
  DiskPressure     False   Fri, 11 Jan 2019 11:23:46 +0900   Tue, 04 Sep 2018 17:31:41 +0900   KubeletHasNoDiskPressure     kubelet has no disk pressure
  Ready            True    Fri, 11 Jan 2019 11:23:46 +0900   Sun, 02 Dec 2018 20:19:23 +0900   KubeletReady                 kubelet is posting ready status
```


<br>

### kernel log
* ubuntu - `/var/log/kern.log`
```
Jan  2 06:37:55 ip-172-31-2-181 kernel: [511445.830812] kauditd_printk_skb: 12 callbacks suppressed
Jan  2 06:37:55 ip-172-31-2-181 kernel: [511445.830813] audit: type=1326 audit(1546411075.464:62): auid=4294967295 uid=109 gid=65534 ses=4294967295 pid=6865 comm="sshd" exe="/usr/sbin/sshd" sig=31 arch=c000003e syscall=13 compat=0 ip=0x7f1684e90fed code=0x0
Jan  2 07:11:22 ip-172-31-2-181 kernel: [513453.242166] aufs 4.15-20180219
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.542320] audit: type=1400 audit(1546413086.180:63): apparmor="STATUS" operation="profile_load" profile="unconfined" name="docker-default" pid=11793 comm="apparmor_parser"
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.602657] bridge: filtering via arp/ip/ip6tables is no longer available by default. Update your scripts to load br_netfilter if you need this.
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.607093] Bridge firewalling registered
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.614466] nf_conntrack version 0.5.0 (16384 buckets, 65536 max)
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.705134] Initializing XFRM netlink socket
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.710534] Netfilter messages via NETLINK v0.30.
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.713693] ctnetlink v0.93: registering with nfnetlink.
Jan  2 07:11:26 ip-172-31-2-181 kernel: [513456.762629] IPv6: ADDRCONF(NETDEV_UP): docker0: link is not ready
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185808.618886] docker0: port 1(veth0f14da1) entered blocking state
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185808.618889] docker0: port 1(veth0f14da1) entered disabled state
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185808.619136] device veth0f14da1 entered promiscuous mode
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185808.619714] IPv6: ADDRCONF(NETDEV_UP): veth0f14da1: link is not ready
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185809.244446] eth0: renamed from vethcc87280
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185809.245486] IPv6: ADDRCONF(NETDEV_CHANGE): veth0f14da1: link becomes ready
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185809.245512] docker0: port 1(veth0f14da1) entered blocking state
Jan 10 01:57:19 ip-172-31-2-181 kernel: [1185809.245514] docker0: port 1(veth0f14da1) entered forwarding state
```


* CoreOS - `/var/log/journal`의 log
```
�S�/(���N�/4���Jߜ��S�hW�MESSAGE=E0114 02:23:34.019712   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.���%�E�a�[/�=��=Ik���`ǟ�%�gr�-�`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
0V����Jߜ�4��kR]Mo0V�0Z�MESSAGE=E0114 02:23:36.029093   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.����kd�a��y/�=��=Ik���`ǟ�Sw�j1�?`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�X���kR]Mo�TV��v1�X��\�MESSAGE=E0114 02:23:37.038936   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs�����s�a6"�/�=��=Ik���`ǟ��ϴSN]�F`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�0S�[��^�MESSAGE=E0114 02:23:37.523988   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs���k;{�a�/�=��=Ik���`ǟ�\�bz<\�S`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�0S4��R�vJ�^��a�MESSAGE=E0114 02:23:38.029890   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.���n�a�@�/�=��=Ik���`ǟ�|[:uNl��`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
``���R�vJ��;�#ٲ��``��c�MESSAGE=E0114 02:23:39.865164   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs�����aB�/�=��=Ik���`ǟ��������`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
(c�;�#ٲ��4��p�3�~(c��f�MESSAGE=E0114 02:23:40.020258   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.���RR��aܟ�/�=��=Ik���`ǟ�,~z�_ .`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
xe���p�3�~��eT�9��xe�i�MESSAGE=E0114 02:23:40.028201   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs���gq��a�/�=��=Ik���`ǟ�H�iÌU	�`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
@h��eT�9���Z��9ż�7@h�Pk�MESSAGE=E0114 02:23:40.999874   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs���
�j�Z��9ż�74A��G�,X�j�n�MESSAGE=E0114 02:23:42.030176   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.�����a K�/�=��=Ik���`ǟ����`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�l�A��G�,X�v��Ϥr��l�hp�MESSAGE=E0114 02:23:42.462208   30343 helpers.go:468] PercpuUsage had 0 cpus, but the actual number is 4; ignoring extra CPUs���8�ƻa���/�=��=Ik���`ǟ��z�X�C�`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�o�v��Ϥr�����d���o��r�MESSAGE=W0114 02:23:42.860835   30343 helpers.go:847] eviction manager: no observation found for eviction signal allocatableNodeFs.available����̻a?��/�=��=Ik���`ǟ���4�`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
�q����d��4Uu����q��u�MESSAGE=E0114 02:23:44.020223   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.��+[޻a���/�=��=Ik���`ǟ���jⲙ;�`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
Xt�Uu���4�������Xt�Xx�MESSAGE=E0114 02:23:46.029110   30343 kubelet_volumes.go:129] Orphaned pod "86cb197f-f9e1-11e8-8881-0a7fd5463858" found, but volume paths are still present on disk : There were a total of 1 errors similar to this. Turn up verbosity to see them.��a�a�O0�=��=Ik���`ǟ�4gԁ���`�8��!:��A��8�������8�&�����8�Y��)���8>q�b~����8t����a
```

* `/dev/kmsg log`
```sh
6,127032,6394954187325,-;IPv6: ADDRCONF(NETDEV_UP): vethded8edbb: link is not ready
6,127033,6394954191114,-;IPv6: ADDRCONF(NETDEV_CHANGE): vethded8edbb: link becomes ready
6,127034,6394954194960,-;cni0: port 8(vethded8edbb) entered blocking state
6,127035,6394954198723,-;cni0: port 8(vethded8edbb) entered disabled state
6,127036,6394954202522,-;device vethded8edbb entered promiscuous mode
6,127037,6394954206047,-;cni0: port 8(vethded8edbb) entered blocking state
6,127038,6394954209367,-;cni0: port 8(vethded8edbb) entered forwarding state
6,127039,6394955231157,-;cni0: port 8(vethded8edbb) entered disabled state
6,127040,6394955234719,-;device vethded8edbb left promiscuous mode
6,127041,6394955237288,-;cni0: port 8(vethded8edbb) entered disabled state

5279763301329,-;overlayfs: workdir is in-use by another mount, accessing files from both mounts will result in undefined behavior.
4,33459,15279764010592,-;overlayfs: upperdir is in-use by another mount, accessing files from both mounts will result in undefined behavior.
4,33460,15279764017304,-;overlayfs: workdir is in-use by another mount, accessing files from both mounts will result in undefined behavior.

6,33477,15280275549642,-;cni0: port 5(veth46847955) entered disabled state
6,33478,15280275553486,-;device veth46847955 left promiscuous mode
6,33479,15280275553489,-;cni0: port 5(veth46847955) entered disabled state
6,33484,15280563645164,-;cni0: port 5(veth91a23bd5) entered blocking state
6,33486,15280563652207,-;device veth91a23bd5 entered promiscuous mode
6,33488,15280563658505,-;cni0: port 5(veth91a23bd5) entered forwarding state
```


<br>

## Issue
```
E0123 10:18:09.509620       1 manager.go:160] failed to update node conditions: Operation cannot be fulfilled on nodes "ip-10-0-0-55.ap-northeast-1.compute.internal": there is a meaningful conflict (firstResourceVersion: "138965559", currentResourceVersion: "138965626"):
 diff1={"metadata":{"resourceVersion":"138965626"},"status":{"$setElementOrder/conditions":[{"type":"KernelDeadlock"},{"type":"ReadonlyFilesystem"},{"type":"OutOfDisk"},{"type":"MemoryPressure"},{"type":"DiskPressure"},{"type":"Ready"}],"conditions":[{"lastHeartbeatTime":"2019-01-23T10:18:09Z","type":"OutOfDisk"},{"lastHeartbeatTime":"2019-01-23T10:18:09Z","type":"MemoryPressure"},{"lastHeartbeatTime":"2019-01-23T10:18:09Z","type":"DiskPressure"},{"lastHeartbeatTime":"2019-01-23T10:18:09Z","type":"Ready"}]}}
, diff2={"status":{"conditions":[{"lastHeartbeatTime":"2019-01-23T10:18:09Z","lastTransitionTime":"2019-01-23T10:07:01Z","message":"kernel has no deadlock","reason":"KernelHasNoDeadlock","status":"False","type":"KernelDeadlock"},{"lastHeartbeatTime":"2019-01-23T10:18:09Z","lastTransitionTime":"2019-01-23T10:07:01Z","message":"Filesystem is read-only","reason":"FilesystemIsReadOnly","status":"False","type":"ReadonlyFilesystem"}]}}
E0123 15:43:34.506270       1 manager.go:160] failed to update node conditions: Operation cannot be fulfilled on nodes "ip-10-0-0-55.ap-northeast-1.compute.internal": there is a meaningful conflict (firstResourceVersion: "139078050", currentResourceVersion: "139078106"):
 diff1={"metadata":{"resourceVersion":"139078106"},"status":{"$setElementOrder/conditions":[{"type":"KernelDeadlock"},{"type":"ReadonlyFilesystem"},{"type":"OutOfDisk"},{"type":"MemoryPressure"},{"type":"DiskPressure"},{"type":"Ready"}],"conditions":[{"lastHeartbeatTime":"2019-01-23T15:43:34Z","type":"OutOfDisk"},{"lastHeartbeatTime":"2019-01-23T15:43:34Z","type":"MemoryPressure"},{"lastHeartbeatTime":"2019-01-23T15:43:34Z","type":"DiskPressure"},{"lastHeartbeatTime":"2019-01-23T15:43:34Z","type":"Ready"}]}}
, diff2={"status":{"conditions":[{"lastHeartbeatTime":"2019-01-23T15:43:34Z","lastTransitionTime":"2019-01-23T10:07:01Z","message":"kernel has no deadlock","reason":"KernelHasNoDeadlock","status":"False","type":"KernelDeadlock"},{"lastHeartbeatTime":"2019-01-23T15:43:34Z","lastTransitionTime":"2019-01-23T10:07:01Z","message":"Filesystem is read-only","reason":"FilesystemIsReadOnly","status":"False","type":"ReadonlyFilesystem"}]}}
```
* 간간히 보이는 위의 error log는 [can't update node condition #108](https://github.com/kubernetes/node-problem-detector/issues/108)에서 보면 
정상적인 상황이고, 같은 Node의 여러 component(kubelet, node problem detector, node controller...)가 업데이트할 때 race condition 때문에 발생하지만 NPD는 conflict 발생시 retry하기 때문에 드물게 발생하면 괜찮은거라고 한다


<br>

## node problem detector 구성하기

### kubectl
* 설정을 자유롭게 수정할 수 있는 장점이 있다
* 설정 파일은 [node-problem-detector.yaml](https://github.com/kubernetes/node-problem-detector/blob/master/deployment/node-problem-detector.yaml) 참고

```sh
$ kubectl create -f https://github.com/kubernetes/node-problem-detector/blob/master/deployment/node-problem-detector.yaml
```


<br>

### Addon Pod
* cluster bootstrap solution을 가지고 있고 default configuration을 overwrite할 필요 없는 사용자를 위한 것
* 배포를 자동화할 수 있다
* `/etc/kubernetes/addons/node-problem-detector`에 node-problem-detector.yaml을 위치 시킨다


<br>

### overwirte the Configuration
* default configuration은 docker `image에 내장`되어 있다
* ConfigMap을 사용해 overwrite할 수 있다
  * addon manager가 ConfigMap을 지원하지 않으므로 kubectl만 가능

1. `config/`에 설정 파일 저장
2. command 실행 
```sh
$ kubectl create configmap node-problem-detector-config --from-file=config/
```
3. node-problem-detector.yaml에 ConfigMap 설정 추가

```yaml
apiVersion: apps/v1
kind: DaemonSet
...
spec:
  template:
	spec:
	  containers:
		volumeMounts:
		  - name: config  # Overwirte the config/ directory with ConfigMap volume
			mountPath: /config
			readOnly: true
	  volumes:
	  - name: config  # Define ConfigMap volume
		configMap:
		  name: node-problem-detector-config
```

4. re-create the node problem detector
```sh
$ kubectl delete -f node-problem-detector.yaml  # 이전에 deploy한 object 제거
$ kubectl create -f node-problem-detector-configmap.yaml
```


<br>

## Remedy Systems
* node-problem-detector에 `탐지된 문제를 해결하기 위한 process`
* event, node condition에 따라 k8s cluster를 정상으로 돌리기 위한 조치를 취한다
* [draino](https://github.com/planetlabs/draino)는 labels, node condition에 따라 자동으로 drains 한다
  * 모든 labels이 일치하고, Node condition 중 하나만 일치하면 즉시 새로운 Pod은 배치가 안돼고, 설정된 시간 후 [drained](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/) 된다
  * draino는 drain된 Node를 자동으로 종료하기 위해 [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)와 함께 사용할 수 있다
  * draino 사용 사례는 [FYI - Simple remedy system designed for use with NPD](https://github.com/kubernetes/node-problem-detector/issues/199) 참고


<br><br>

> #### Reference
> * [Monitor Node Health - k8s docs](https://kubernetes.io/docs/tasks/debug-application-cluster/monitor-node-health/)
> * [node-problem-detector - GitHub](https://github.com/kubernetes/node-problem-detector)
> * [node-problem-detector - Google Cloud Registry](https://console.cloud.google.com/gcr/images/google-containers/GLOBAL/node-problem-detector)
