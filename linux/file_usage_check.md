# file usage check

> 우분투에 application server를 배포해서 사용하던 도중 `cannot create temp file for here-document: No space left on device`라는 메시지를 만났다.  
> log 파일이 쌓여서 용량부족으로 생기는 문제였다. 이 문제를 해결했던 과정을 통해 배운 명령어들을 기록해보려고 한다


### 디스크 사용량 확인
```sh
$ df

Filesystem         1K-blocks    Used     Available Use% Mounted on
udev                  487284       0        487284   0% /dev
tmpfs                 101436   12104         89332  12% /run
/dev/xvda1           8117828 6751140        931412  88% /
tmpfs                 507164       0        507164   0% /dev/shm
tmpfs                   5120       0          5120   0% /run/lock
tmpfs                 507164       0        507164   0% /sys/fs/cgroup
tmpfs                 101440       0        101440   0% /run/user/1000
9tique         1099511627776       0 1099511627776   0% /home/ubuntu/storage


# 간략하게 출력된다
$ df -h

Filesystem      Size  Used Avail Use% Mounted on
udev            476M     0  476M   0% /dev
tmpfs           100M   12M   88M  12% /run
/dev/xvda1      7.8G  6.5G  910M  88% /
tmpfs           496M     0  496M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           496M     0  496M   0% /sys/fs/cgroup
tmpfs           100M     0  100M   0% /run/user/1000
9tique          1.0P     0  1.0P   0% /home/ubuntu/storage
```

### 어디가 용량이 많은지 확인
```sh
# root에서 각 디렉토리의 용량을 확인
$ sudo du -hs /*  

116M    /home/ubuntu/9tique-backend
4.0K    /home/ubuntu/application-deploy.properties
4.0K    /home/ubuntu/deploy-9tique.sh
4.0K    /home/ubuntu/deploy.sh
16K     /home/ubuntu/index.html
4.0K    /home/ubuntu/nine_tique_db_url
3.5M    /home/ubuntu/storage
127M    /home/ubuntu/work


# 특정 파일도 확인할 수 있다
$ sudo du -hs /var 

424M    /var
```

> #### 참고
> [bash: cannot create temp file for here-document: No space left on device](https://unix.stackexchange.com/questions/277387/bash-cannot-create-temp-file-for-here-document-no-space-left-on-device)  
