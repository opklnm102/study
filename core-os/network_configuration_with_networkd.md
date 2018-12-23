# [CoreOS] Network configuration with networkd
> date - 2018.12.23  
> keyword - CoreOS, network  
> VirtualBox에 CoreOS와 kubeadm을 사용해 K8S cluster를 구성하던 중 static IP 설정을 해야했는데 그때 알아본 내용을 정리  

<br>

* Container Linux는 각 플랫폼에 맞게 customizing할 수 있다
* 기존에 설정된 unit을 대체하거나 무시
* networkd의 기능 사용

<br>

## network 설정하는 방법
1. `/etc/systemd/network`에 unit 작성
  * `/etc/systemd/network`에 unit 작성 후 `sudo systemctl restart systemd-networkd` 필요
2. Container Linux Config를 통해 booting시 설정
  * networkd가 시작되기 전에 설정되므로 networkd restart 불필요


<br>

## systemd-networkd란?
* virtual network device 설정을 찾아 구성하는 System Network Manager
* `/usr/lib/systemd/systemd-networkd`
* systemd.netdev의 구성을 기반으로 `[Match]` section이 있는 `.network` 파일에 따라 network device를 구성
  * address, route
* `.network` 파일 위치
  * system networkd - `/usr/lib/systemd/network`
  * volatile runtime network - `/run/systemd/network`
  * local administration network - `/etc/systemd/network`
* systemd-networkd가 종료되도 network 구성은 유지된다
  * initramfs에서 연결을 끊지 않고 서비스를 재시작 가능
  * network 구성을 업데이트하고 재시작시 제거된 구성
  * network 설정 제거시 netdev interface는 수동으로 삭제 필요


<br>

## Static networking
* enp2s0 NIC에 static IP 설정
  * enp2s0는 기존에 사용하던 NIC

### Manually
```sh
$ sudo vi /etc/systemd/network/static.network

[Match]
Name=enp2s0

[Network]
Address=192.168.0.15/24
Gateway=192.168.0.1
DNS=1.2.3.4

$ sudo systemctl restart systemd-networkd
```

<br>

### Container Linux Config
```
# cloud-config
networkd:
  units:
    - name: 00-enp2s0.network
      contents: |
        [Match]
        Name=enp2s0

        [Network]
        DNS=1.2.3.4
        Address=192.168.0.15/24
        Gateway=192.168.0.1

# ignition config - recommend
{
  "ignition": {
    "config": {},
    "timeouts": {},
    "version": "2.1.0"
  },
  "networkd": {
    "units": [
      {
        "contents": "[Match]\nName=enp2s0\n\n[Network]\nDNS=1.2.3.4\nAddress=192.168.0.15/24\nGateway=192.168.0.1",
        "name": "00-enp2s0.network"
      }
    ]
  },
  "passwd": {},
  "storage": {},
  "systemd": {}
}
```


<br>

## Turn off DHCP on specific interface
* enp2s0를 제외한 interface에서 DHCP를 사용하려면 2개의 파일 생성
* ordering 순서대로 읽는다

```sh
$ sudo vi /etc/systemd/network/10-static.network

[Match]
Name=enp2s0

[Network]
Address=192.168.0.15/24
Gateway=192.168.0.1
DNS=1.2.3.4

$ sudo vi /etc/systemd/network/20-dhcp.network

[Match]
Name=en*

[Network]
DHCP=yes

$ sudo systemctl restart systemd-networkd
```


<br>

## Turn off IPv6 on specific interfaces
* booting시 kernel command `ipv6.disable=1`를 사용해 전역 설정을 할 수 있지만 networkd는 interface별로 IPv6를 비활성화 할 수 있다

```sh
[Network]
LinkLocalAddressing=no
IPv6AcceptRA=no
```
* IPv6AcceptRA
  * Ipv6 트래픽이 interface에서 수신되지 않을 때 network 구성 완료를 기다리는 서비스의 시간 초과 발생을 피하기 위해 설정


<br>

## Configure static routes
* 특정 route를 사용하도록 지정

### Manually
```
[Route]
Gateway=192.168.122.1
Destination=172.16.0.0/24
```

<br>

### Container Linux Config
```
# cloud-config
networkd:
  units:
    - name: 10-static.network
      contents: |
        [Route]
        Gateway=192.168.122.1
        Destination=172.16.0.0/24

# ignition config - recommend
{
  "ignition": {
    "config": {},
    "timeouts": {},
    "version": "2.1.0"
  },
  "networkd": {
    "units": [
      {
        "contents": "[Route]\nGateway=192.168.122.1\nDestination=172.16.0.0/24",
        "name": "10-static.network"
      }
    ]
  },
  "passwd": {},
  "storage": {},
  "systemd": {}
}
```


<br>

## Configure multiple IP address
* 1개의 interface에 여러 IP 주소 구성

<br>

### Manually
```
[Match]
Name=eth0

[Network]
DNS=8.8.8.8
Address=10.0.0.101/24
Gateway=10.0.0.1
Address=10.0.0.101/24
Gateway=10.0.1.1  # 다른 gateway 지정
```

<br>

### Container Linux Config
```
# cloud-config
networkd:
  units:
    - name: 20-multi_ip.network
      contents: |
        [Match]
        Name=eth0

        [Network]
        DNS=8.8.8.8
        Address=10.0.0.101/24
        Gateway=10.0.0.1
        Address=10.0.0.101/24
        Gateway=10.0.1.1

# ignition config - recommend
{
  "ignition": {
    "config": {},
    "timeouts": {},
    "version": "2.1.0"
  },
  "networkd": {
    "units": [
      {
        "contents": "[Match]\nName=eth0\n[Network]\nDNS=8.8.8.8\nAddress=10.0.0.101/24\nGateway=10.0.0.1\nAddress=10.0.0.101/24\nGateway=10.0.1.1",
        "name": "20-multi_ip.network"
      }
    ]
  },
  "passwd": {},
  "storage": {},
  "systemd": {}
}
```

<br>

## Debugging networkd

### Manually
```sh
$ mkdir -p /etc/systemd/system/systemd-networkd.service.d

$ sudo vi /etc/systemd/system/systemd-networkd.service.d/10-debug.conf

[Service]
Environment=SYSTEMD_LOG_LEVEL=debug

$ sudo systemctl daemon-reload
$ sudo systemctl restart systemd-networkd
$ journalctl -b -u systemd-networkd
```

<br>

### Container Linux Config
```
# cloud-config
systemd:
  units:
  - name: systemd-networkd.service
    dropins:
      - name: 10-debug.conf
        contents: |
        [Service]
        Environment=SYSTEMD_LOG_LEVEL=debug

# ignition config - recommend
{
  "ignition": {
    "config": {},
    "timeouts": {},
    "version": "2.1.0"
  },
  "networkd": {},
  "passwd": {},
  "storage": {},
  "systemd": {
    "units": [
      {
        "dropins": [
          {
            "contents": "[Service]\nEnvironment=SYSTEMD_LOG_LEVEL=debug",
            "name": "10-debug.conf"
          }
        ],
        "name": "systemd-networkd.service"
      }
    ]
  }
}
```

<br><br>

> #### Reference
> * [Network configuration with networkd](https://coreos.com/os/docs/latest/network-config-with-networkd.html)
> * [systemd-networkd docs](https://www.freedesktop.org/software/systemd/man/systemd-networkd.service.html)
