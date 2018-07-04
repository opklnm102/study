# [Tomcat] tomcat jvm, java option setting
> date - 2018.07.04  
> keyword - tomcat, java option, jvm mode  
> tomcat setting한 것들을 정리  

<br>

## java option 설정
* `$TOMCAT_HOME/bin/setenv.sh`에 설정하면 catalina.sh에서 읽어들인다
```sh
# $TOMCAT_HOME/bin/setenv.sh

# jvm mode
CATALINA_OPTS="$CATALINA_OPTS -server"

# spring profile
JAVA_OPTS="$JAVA_OPTS -Dspring.profiles.active=development"
```

---

<br>

## tomcat이 사용할 java version setting
* instance에 여러 version의 java가 설치되어 있고, 각기 다른 java version을 사용할 경우 global JAVA_HOME을 사용할 수 없다

### war로 deploy할 경우
* `$TOMCAT_HOME/bin/setclasspath.sh`에 사용할 java를 명시

```sh 
# $TOMCAT_HOME\bin\setclasspath.sh 의 맨위에 추가
JAVA_HOME=<jdk path>
 
# Make sure prerequisite environment variables are set
if [ -z "$JAVA_HOME" -a -z "$JRE_HOME" ]; then
...
```

> #### WAR(web application archive)
> * Web application을 배포하기 위한 파일들의 압축

<br>

### jar로 deploy할 경우
* 실행시 사용하는 java 명시
```sh
$ <jdk path>/bin/java -jar xxx.jar
 ```

---

<br>
