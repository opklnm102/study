# [DevOps] Automation Script
> date - 2019.01.30  
> keyword - devops, automation
> automation script에 대해 정리해보자함

<br>

## Automation Script란?
* 사람과 시스템의 상호작용을 대체하거나 줄일 수 있는 프로세스가 정의된 script
* 인적 자원의 개입을 거의 또는 전혀 필요로 하지 않고 task 수행
* 수동으로 반복되는 process를 대체함으로써 생산성을 높이고, 오류를 줄인다
* infra, cloud provisioning, deploy, 환경 구성 등 다양한 곳에 적용 가능


<br>

## Prerequisite skills
* script 언어에 대한 지식
* workflow process, escalations, action로 정의할 수 있는 task
* application data models & relationships


<br>

## 자동화 스크립트 구성요소
* script의 context를 정의하는 launch point
  * 필드에 값이 입력되는 경우 launch context를 정의
* 변수, 바인딩된 값
* Source Code


## Example
* 사실 거창한게 아니다 그저 편하면 충분하다
* 다양한 버전의 Java를 jenv를 통해 사용하는데, version upgrade시 자동으로 인식을 못해서 수동으로 해줘야하는 불편함이 있었다

```sh
# Java upgrade 후 실행
# jenv add <JAVA_HOME>을 여러번 해줘야하는걸 알아서 해준다

# add java for jenv
JVM_HOME_PATH=/Library/Java/JavaVirtualMachines/*

for java in $JVM_HOME_PATH
do
    echo add jenv $java
    jenv add $java/Contents/Home
done

echo "Finished...! java lookup managed by jenv..."
jenv versions
```
* 여기에 Java install script도 넣고...이런식으로 점진적으로 추가해나아가면 된다


<br><br>

> #### Reference
> * [Automation script](https://www.ibm.com/support/knowledgecenter/SSLLAM_7.6.0/com.ibm.mbs.doc/autoscript/c_automation_scripts.html)
