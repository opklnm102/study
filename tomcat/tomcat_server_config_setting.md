# [Tomcat] tomcat server config setting
> date - 2018.07.04  
> keyword - tomcat, context setting  
> tomcat context 설정한것들을 정리  

<br>

## $TOMCAT_HOME/conf/server.xml
* port 및 application 설정
* 해당 파일을 기반으로 tomcat 동작

```xml
... 
<Service name="Catalina">
 
    <!-- port 8080으로 설정  -->
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
 
    <Engine name="Catalina" defaultHost="localhost">
 
    ...
 
    <!-- appBase, unpackWARs, autoDeploy 설정   -->
      <Host name="localhost"  appBase="/home/ec2-user/application/test"
            unpackWARs="false" autoDeploy="false">
     
        <!-- Context path, docBase 설정 -->
        <!-- http://localhost:8080/ 면 docBase에 설정된 경로에서 찾는다 -->
        <Context path="/" docBase="/home/ec2-user/application/test" reloadable="false"/>
 
      </Host>
    </Engine>
  </Service>
</Server>
```

### Host
* host에 대한 설정
* appBase
  * application root 설정
  * 상대 경로로 되어 있으면 `$CATALINA_HOME`부터 시작
  * 다른 경로를 사용하고 싶으면 절대 경로로 설정
  * 보통 appBase에 docBase 이름을 가진 war를 두고 tomcat을 실행하면 war의 압축이 풀리면서 deploy 진행
* unpackWARs
  * war의 압축 해제 여부
* autoDeploy
  * 새로운 war가 생겼을 경우 자동 deploy 여부

### Context
* appBase에 ROOT Web Application이 deploy 되고, 추가적으로 deploy하는 경우에 사용
* path
  * context에 대한 path 설정
  * host 뒤에 정의되는 prefix
    * ex. path="/test"는 localhost:8080/test를 의미
* docBase
  * path에 설정한 경로로 들어온 요청을 처리할 application 경로 설정
  * 보통 appBase 하위의 폴더나 war로 설정
  * appBase 외부 경로 설정 가능
* reloadable
  * WEB-INF/classses, WEB-INF/lib 의 내용이 변경되었을 때 자동 reload 여부

* Context 설정하는 곳
* `server.xml`
  * 권장하지 않는 방법
* `CATALINA_HOME/conf/ENGINE_NAME/HOST_NAME/CONTEXT_PATH.xml`
  * 가장 일반적인 방법
  * ex. Engine name = Catalina, Host = localhost, CONTEXT_PATH = testApp이면 CATALINA_HOME/conf/Catalina/localhost/testApp.xml
* `/META_INF/context.xml`
* `CATALINA_HOME/conf/context.xml`
  * 다른 context 설정이 없는 경우 적용

<br>

> ```sh
> ...
>   <Context path="/" docBase="/home/ec2-user/application/test-api"/>
> ...
> ```
> * 위처럼 설정했을 경우 `http://localhost/index.html`를 요청하면 `{docBase}/index.html`을 찾는다

---

<br>

## ROOT context 를 임의의 webapp 로 변경하기
* testApp.war를 배포할 경우 hostname:8080/testApp으로 접근 가능
* `hostname:8080/`으로 연결을 해보자


### 1. war rename
* testApp.war를 ROOT.war로 rename해서 deploy
* 적용하기 쉽다
* build나 deploy 절차를 변경해야 할 수도 있다

<br>

### 2. server.xml 변경
```xml
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="false">
  <Context path="" docBase="testApp" reloadable="false"/>
</Host>
```
* ROOT와 testApp 2개의 Context가 생기는 문제가 있다
  * 2번 deploy 된다..

<br>

### 3. app을 webapps 외부에 위치
* app을 webapps 밖에 설정하고 context에 해당 path 지정
```xml
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="false">
  <Context path="" docBase="${catalina.home}/testApp" reloadable="false"/>
</Host>
```
* appBase 외부에 있어서 unpack되지 않으므로 수동으로 해야 한다

---

<br>

## 상황 - docBase를 ROOT application으로 사용하고 싶다
* host-name:port/test 로 사용하고 싶다

```sh
// before
application
  └── test-api
        └── test-api.war
```
* 위의 폴더 구조를 가지고
 
```xml
server.xml
<!-- server.xml -->
<Host name="localhost"  appBase="/home/ec2-user/application/test-api" unpackWARs="true" autoDeploy="false”>
 
    <Context path="/" docBase="/home/ec2-user/application/test-api/test-api" reloadable="false"/>
  ...
```
* /로 request가 오면 application/test-api/test-api.war가 unpacking된 application/test-api/test-api가 처리하게끔 설정

* $TOMCAT_HOME/bin/startup.sh 후
```sh
// after
application
  └── balance-api
        ├── ROOT
        ├── balance-api.war
        └── balance-api
```

<br>

### issue. 2번 deploy 된다..
* test-api.war를 ROOT web application으로 인식하고 최초에는 ROOT로 deploy하고 그 후 1번더 deploy 총 2번 deploy...

<br>

### 방안
* appBase만 설정하고 ROOT.war로 deploy
* 압축을 풀고 수동 deploy
> 그래서 .war 파일을 appBase에서 수동으로 압축 해제 후 .war를 제거한 뒤 tomcat start

```sh
#!bin/bash
APP_BASE=/home/ec2-user/application/test-api

$TOMCAT_HOME/bin/shutdown.sh
sleep 10s

rm -r $APP_BASE/*
cp $WORKSPACE/test-api/build/libs/*.war $APP_BASE
unzip $APP_BASE/test-api.war -d $APP_BASE
rm $APP_BASE/*.war

$TOMCAT_HOME/bin/startup.sh
```

---

<br>

> #### 참고
> * [tomcat 7 의 ROOT context 를 임의의 webapp 로 변경하기](https://www.lesstif.com/pages/viewpage.action?pageId=14745616)
