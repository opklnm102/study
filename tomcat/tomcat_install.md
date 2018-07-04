# [Tomcat] tomcat install
> date - 2018.06.25  
> keyword - tomcat, install  
> Amazon AMI linux에서 tomcat 설치하는 과정을 정리

<br>

## 1. Tomcat download
```sh
# 임시로 다운받기 좋은 폴더
$ cd /tmp

# wget <uri>
$ wget http://apache.mirror.cdnetworks.com/tomcat/tomcat-8/v8.5.31/bin/apache-tomcat-8.5.31.tar.gz
```
* Binary Distributions에서 Core의 tar.gz 버전을 다운로드
* 다른 버전은 [여기](https://tomcat.apache.org/whichversion.html)에서 찾기

<br>

## 2. unzip tar
* 압축 풀기
```sh

# tar xzvf <xxx.tar.gz>
$ sudo tar xzvf apache-tomcat-8.5.31.tar.gz

# move dir
$ mv apache-tomcat-8.5.31 /opt
```

<br>

## 3. symbolic link
* 관리를 위해 symbolic link 생성
* Library update시 다른 변경사항 없이 symbolic link만 변경하면 적용되는 장점
   * Library를 사용하는 곳의 이름을 하나하나 바꿔야하는 귀찮음 해소

```sh
# ln -s <source file> <symbolic link file>
$ sudo ln -s apache-tomcat-8.5.31 tomcat-test
```

<br>

## 4. Create Tomcat User
* tomcat은 보안을 위해 root가 아닌 사용자로 실행
* tomcat을 실행할 새로운 사용자와 그룹을 생성한다
```sh
# create tomcat group
$ sudo groupadd tomcat

# /opt/tomcat가 home이고 /bin/false shell(아무도 로그인할 수 없음)인 tomcat 그룹의 구성원
# useradd <user name> -s <shell> -g <group> -d <dir path>
$ sudo useradd tomcat -s /bin/false -g tomcat -d /opt/tomcat-test
```

<br>

## 5. 권한 부여
```sh
# group 권한 부여
$ sudo chgrp -R tomcat /opt/tomcat-test

# group에 conf dir의 read 권한 부여
$ sudo chmod -R g+r conf

# group에 conf의 실행 권한 부여
$ sudo chmod g+x conf

# 소유주 변경
$ sudo chown -R tomcat webapps/ work/ temp/ logs/

# shell 실행 권한 부여
$ chmod -x /opt/tomcat-test/bin/*.sh
```

<br>

## 6. .bash_profile에 path 지정
```sh
$ vi ~/.bash_profile

# ~/.bash_profile에 아래 내용 추가(java는 미리 설치되어 있다)
export JAVA_HOME=/home/ec2-user/java
export TOMCAT_HOME=/opt/tomcat-test
export PATH=$PATH:$JAVA_HOME/bin:$TOMCAT_HOME/bin

# .bash_profile 적용
$ source ~/.bash_profile
```

<br>

## 7. Usage

### Tomcat 실행
```sh
$ $TOMCAT_HOME/bin/startup.sh

# 위에서 path를 지정했기 때문에 shell script 바로 실행 가능
$ startup.sh
```

### tomcat 중지
```sh
$ $TOMCAT_HOME/bin/shutdown.sh

$ shutdown.sh
```

---

<br>

## tomcat service 등록하기
* EC2를 다시 시작할 때마다 tomcat이 자동으로 시작되도록 service로 등록

* systemd 파일 생성
```sh
$ sudo vi /etc/systemd/system/tomcat.service

# 아래 내용 등록
[Unit]
Description=Apache Tomcat
After=network.target

[Service]
Type=forking

Environment=CATALINA_PID=/opt/tomcat-9/temp/tomcat9.pid
Environment=JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-amd64
Environment=CATALINA_HOME=/opt/tomcat-9
Environment=CATALINA_BASE=/opt/tomcat-9
Environment="CATALINA_OPTS=-Xms512m -Xmx1G"
Environment="JAVA_OPTS=-Dfile.encoding=UTF-8 -Djava.awt.headless=true"

ExecStart=/opt/tomcat-9/bin/startup.sh
ExecStop=/opt/tomcat-9/bin/shutdown.sh

User=tomcat
Group=tomcat

[Install]
WantedBy=multi-user.target
```

* tomcat service 실행
```sh
$ sudo systemctl daemon-reload
$ sudo systemctl start tomcat
$ sudo systemctl enable tomcat
```

* tomcat 실행
```sh
$ sudo service tomcat start
```

---

<br>

> #### 참고
> [How To Install Apache Tomcat 8 on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-apache-tomcat-8-on-ubuntu-16-04)
> [HOW TO INSTALL TOMCAT ON EC2 INSTANCE](http://techkube.com/article/how-install-tomcat-ec2-instance)
