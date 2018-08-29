# [Java] installing jdk8 on Amazon Linux 2 AMI
> date - 2018.08.30  
> keyword - java, jdk  
> Amazon Linux 2 AMI에서 java-1.8.0 설치과정에서 겪은 이슈를 정리

<br>


## Issue
* Amazon Linux 2 AMI에서 아래 명령어로 java 설치
```sh
$ sudo yum install java-1.8.0
```

* 설치 후 gradle wrapper로 build했지만 실패...
```sh
$ ./gradlew build

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':compileJava'.
> Could not find tools.jar. Please check that /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.181-3.b13.amzn2.x86_64/jre contains a valid JDK installation.

* Try:
Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output. Run with --scan to get full insights.

* Get more help at https://help.gradle.org

BUILD FAILED in 2s
```


## Resolve
* [How can I upgrade to Java 1.8 on an Amazon Linux Server?](https://serverfault.com/questions/664643/how-can-i-upgrade-to-java-1-8-on-an-amazon-linux-server)를 보니 위처럼 하면 jre만 설치된다고...

* jdk를 설치한다
```sh
sudo yum install java-1.8.0-openjdk-devel.x86_64
```

* gradle build success를 확인..!
```sh
$ ./gradlew build
...

BUILD SUCCESSFUL in 46s
```

---

<br>

> #### Reference
> * [How can I upgrade to Java 1.8 on an Amazon Linux Server?](https://serverfault.com/questions/664643/how-can-i-upgrade-to-java-1-8-on-an-amazon-linux-server)
