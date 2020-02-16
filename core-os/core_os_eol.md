# [CoreOS] End-of-life CoreOS Container Linux
> date - 2020.02.16  
> keyword - CoreOS, CoreOS Container Linux  
> CoreOS의 EOL에 대해 [End-of-life announcement for CoreOS Container Linux](https://coreos.com/os/eol/)를 정리  


<br>

## CoreOS Container Linux EOL(End-of-life)
* 2020.05.26 CoreOS EOL
  * 이후에 발견된 bug, security vulnerability patch X
  * AWS marketplace에서 신규 가입자에게 노출 X
  * `AMI ID`를 사용한 download에는 영향 X
* 2020.09.01 이후 
  * CoreOS Container Linux와 관련된 리소스는 **제거되거나 read-only가 된다**
    * AWS, Azure 등 cloud의 OS image download 제거
      * 신규 CoreOS Container Linux 시스템은 사전 준비없이 시작할 수 없다
      * 미리 custom image를 만들어서 사용할 수는 있지만 장기적으로 좋은 선택은 아니므로 OS migration 필요
    * CoreUpdate 서버 종료
* 다른 OS로 마이그레이션 권장
  * [Fedora CoreOS](https://getfedora.org/coreos/)
  * [Flatcar Container Linux](https://www.flatcar-linux.org/)
    * CoreOS Container Linux Fork
* Fedora CoreOS는 현재 **모든 use case에서 Container Linux를 대체할 수 없다**
* CoreOS Container Linux의 fork인 `Flatcar Container Linux`도 고려의 대상이 될 수 있다


<br>

## [Fedora CoreOS](https://getfedora.org/coreos/) - Automatically updating Linux OS for containerized workloads
* containerized workload를 안전하게 확장할 수 있는 minumal operating system으로 automatically-updating 지원
* CoreOS Container Linux의 **official successor**
* Container Linux의 provisioning tool, automatic update model과 Atmoic Host의 packaging technology, OCI support, SELinux security 결합
  * 자세한 사항은 [Introducing Fedora CoreOS](https://fedoramagazine.org/introducing-fedora-coreos/), [Fedora CoreOS Documentation](https://docs.fedoraproject.org/en-US/fedora-coreos/) 참고

<br>

### CoreOS Container Linux와의 차이
* update engine이 다르다
* package manager가 있다
* cloudinit이 다르다
* torcx 사라짐
* rkt가 사리지고, podman이 있다


<br><br>

> #### Reference
> * [End-of-life announcement for CoreOS Container Linux](https://coreos.com/os/eol/)
> * [Introducing Fedora CoreOS](https://fedoramagazine.org/introducing-fedora-coreos/)
> * [Fedora CoreOS Documentation](https://docs.fedoraproject.org/en-US/fedora-coreos/)
