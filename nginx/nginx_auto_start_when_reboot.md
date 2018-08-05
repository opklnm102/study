# [Nginx] Nginx auto start when reboot
> date - 2018.08.02    
> keyword - amazon linux ami, nginx, chkconfig
> Amazon Linux AMI에서 instance reboot시 service로 등록된 nginx가 재시작되지 않아서 instance 재시작시 자동 시작 시키는 법을 정리

<br>

## Issue
* Amazon Linux AMI가 설치된 instance에 nginx 설치 후에 rebooting 한적이 없었는데, memory 문제로 rebooting 후 Nginx가 자동으로 재시작되지 않음을 발견

---

<br>

## Resolve 
* [nginx auto-restart EC2](https://stackoverflow.com/questions/18688767/nginx-auto-restart-ec2)에서 `chkconfig`를 사용하면 된다고 한다

```sh
$ chkconfig nginx --list
nginx          	0:해제	1:해제	2:해제	3:해제	4:해제	5:해제	6:해제

# required root permission
$ sudo chkconfig nginx on

$ chkconfig nginx --list
nginx          	0:해제	1:해제	2:활성	3:활성	4:활성	5:활성	6:해제
```
* 2~5까지 활성화되었다
   * 이게 무슨뜻일까...? -> [service와 chkconfig](../linux/service_and_chkconfig.md)에 정리되어 있다
* `chkconfig nginx on`을 적용하고 instance rebooting 후 확인해보니 정상적으로 nginx가 자동 시작됨을 확인...!

---

<br>

> #### 참고
> * [nginx auto-restart EC2](https://stackoverflow.com/questions/18688767/nginx-auto-restart-ec2)
> * [nginx service won't start after reboot AWS Linux server](https://stackoverflow.com/questions/38325313/nginx-service-wont-start-after-reboot-aws-linux-server/38325509)
