

http://yookeun.github.io/java/2015/02/09/java-gradle/



위 내용 읽고 정리




maven vs gradle
https://gradle.org/maven-vs-gradle/





implementions vs compile
https://docs.gradle.org/current/userguide/java_library_plugin.html?_ga=2.70120921.831969029.1529374458-1549447478.1527654076
https://guides.gradle.org/building-java-9-modules/

https://www.google.co.kr/search?q=gradle&oq=gradle+&aqs=chrome..69i57j69i65j69i60j69i59l3.5200j0j7&sourceid=chrome&ie=UTF-8





java plugin
http://kwonnam.pe.kr/wiki/gradle/java

java compile encoding 설정
```gradle
// 1
[compileJava, compileTestJava]*.options*.encoding = "UTF-8"

// 2
tasks.withType(JavaCompile) {
    options.encoding = 'UTF-8'
}
```


source file encoding with gradle
http://blog.ehrnhoefer.com/2015-02-28-gradle-sourcefile-encoding/
http://kwonnam.pe.kr/wiki/gradle







# gradlew -> gradle wrapper는 어떻게 동작할 수 있을까...??
gradlew
/gradle/wrapper/gradle-wrapper.jar
/gradle/wrapper/gradle-wrapper.properties


이렇게 3개가 있어야 동작할 수 있다

gradle-wrapper.jar 가 gradle packaging 파일인듯...??
gradlew 는 script고?






gradle tip
https://www.theteams.kr/teams/859/post/64923





# Gradle

#### Gradle Wrapper를 사용하는 목적
- 이미 존재하는 프로젝트를 새로운 환경에 설치할때 별도의 설치나 설정과정없이 곧 바로 빌드할 수 있게 하기 위함(Java나 Gradle도 설치할 필요가 없음. 또한 로컬에 설치된 Gradle 또는 Java의 버전도 신경쓸 필요가 없음. 따라서 항상 Wrapper를 사용할 것을 권장.)

#### gradlew 파일
- 유닉스용 실행 스크립트.
- Gradle로 컴파일이나 빌드 등을 할때, 아래와 같이 하면 로컬에 설치된 gradle을 사용.
```
> gradle build
```
- 이 경우 Java나 Gradle이 설치되어 있어야 하고, 새로받은 프로젝트의 Gradle 버전과 로컬에 설치된 Gradle 버전이 호환되지 않으면 문제가 발생할 수 있음. 따라서 Wrapper를 사용하면 아래와 같이 실행.
```
> ./gradlew build
```

#### gradle.bat 파일
- 원도우용 실행 배치 스크립트.
- 원도우에서 실행 가능하다는 점만 제외하면 gradlew와 동일.

#### gradle/wrapper/gradle-wrapper.jar 파일
- Wrapper 파일.
- gradlew나 gradlew.bat 파일이 프로젝트 내에 설치하는 이 파일을 사용하여 gradle task를 실행하기 때문에 로컬 환경의 영향을 받지 않음.**(실제로는 Wrapper 버전에 맞는 구성들을 로컬 캐시에 다운로드 받음)**

#### gradle/wrapper/gradle-wrapper.properties 파일
- Gradle Wrapper 설정 파일.
- 이 파일의 wrapper 버전 등을 변경하면 task 실행시, 자동으로 새로운 Wrapper 파일을 로컬 캐시에 다운로드 받음.

#### build.gradle 파일
- 의존성이나 플러그인 설정 등을 위한 스크립트 파일.

#### settings.gradle 파일
- 프로젝트의 구성 정보를 기록하는 파일.
- 어떤 하위프로젝트들이 어떤 관계로 구성되어 있는지를 기술.
- Gradle은 이 파일에 기술된대로 프로젝트를 구성함.

#### 의존성 관리
- repositories를 사용해서 의존성을 가져올 주소를 설정.
- dependencies를 사용해서 설정된 Repository에서 가져올 아티팩트를 설정.
```
allprojects {
    repositories {
        mavenCentral()
        jcenter()
        maven {
            url "http://repo.mycompany.com/maven2"
        }
        ivy {
            url "../local-repo"
        }
    }

    dependencies {
        // 로컬 jar 파일의 의존성 설정
        compile fileTree(dir: 'libs', include: '*.jar')
        // 로컬 프로젝트간 의존성 설정
        compile project(':shared')
        // 컴파일 타임에 의존성을 받아옴
        compile 'com.google.guava', name: 'guava:23.0'
        // 테스트시만 의존성을 받아옴
        // 마이너 버전을 '+'로 설정해서 항상 4점대 최신 버전을 사용
        testCompile group: 'junit', name: 'junit', version: '4.+'
        // 컴파일할때는 사용하고, 아티팩트를 만들때는 포함하지 않음
        compileOnly 'org.projectlombok:lombok:1.16.18'
        // 실행할때 의존성을 받아옴(기본적으로 컴파일을 모두 포함)
        runtime('org.hibernate:hibernate:3.0.5')
    }
}
```
- uploadArchives를 사용해서 생성된 아티팩트를 배포하기 위한 주소를 설정.
```
uploadArchives {
    repositories {
        ivy {
            credentials {
                username "username"
                password "pw"
            }
            url "http://repo.mycompany.com"
        }
    }
}
```

#### Gradle 스크립트의 이해
- Gradle 스크립트는 groovy를 사용해서 만든 DSL. (DSL이란 특정 도메인에 특화된 언어를 말함)
- 모든 Gradle 스크립트는 두 가지 개념(projects와 tasks)으로 구성.
  - 모든 Gradle 빌드는 하나 이상의 projects로 구성.
  - 각 project는 하나 이상의 task들로 구성.
    - task는 어떤 클래스를 컴파일하거나 JAR를 생성하거나 javadoc을 만드는 작업들을 의미.
```
task squid {
  doLast {
    println 'Hello!! Codingsquid'
  }
}
```
- 간단한 squid task를 위와 같이 직접 만들 수 있음. gradle -q squid로 해당 task만 실행해 볼 수 있음.
- Gradle 스크립트는 DSL이지만, 몇가지 약속을 제외하면 groovy라는 언어가 지닌 강점을 모두 이용할 수 있음.
```
task squid {
    doLast {
        println 'Hello!! Codingsquid'
    }
}
task octopus(dependsOn: squid) {
    doLast {
        println "I'm Octopus"
    }
}
```
- dependsOn을 사용해서 task간의 의존성을 만들 수 있음. 위 예제의 경우, octopus task를 실행하면 먼저 squid가 실행되고 octopus가 실행됨.