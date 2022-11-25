# [Java] Managing multiple Java version
> date - 2018.10.18  
> keyword - java, jenv, sdkman  
> 새로운 개발 환경 셋팅중 Java11이 설치되어 nvm처럼 여러 버전을 사용할 수 없을까 해서 찾아본 내용 정리  

<br>

## TL;DR
* [jEnv](#jenv---manage-your-java-environment), [SDK Man](#sdkmnm)를 이용한다


<br>

## [jEnv - Manage your Java environment](http://www.jenv.be)
* CLI에서 `JAVA_HOME` 환경 변수를 간단하게 설정할 수 있는 tool
* `JAVA_HOME`을 설정해주기 때문에 nvm처럼 여러 Java version을 사용할 수 있다
* JDK는 별도로 설치해야한다

<br>

### Installation
```sh
$ brew update

$ brew cleanup

## cask cleanup은 안해도 되는듯
$ brew cask cleanup
Error: Calling `brew cask cleanup` is disabled! Use `brew cleanup` instead.

$ brew cask upgrade
```

* 최신 Java 설치
```sh
## 설치할 Java 정보 확인
$ brew cask info java
java: 11,28
https://jdk.java.net/
Not installed
From: https://github.com/Homebrew/homebrew-cask/blob/master/Casks/java.rb
==> Name
OpenJDK

## Java 설치
$ brew cask install java
```

* Java8 설치
```sh
$ brew cask info java8
Error: Cask 'java8' is unavailable: No Cask with this name exists.

$ brew tap homebrew/cask-versions
==> Tapping homebrew/cask-versions
Cloning into '/usr/local/Homebrew/Library/Taps/homebrew/homebrew-cask-versions'...
remote: Enumerating objects: 223, done.
remote: Counting objects: 100% (223/223), done.
remote: Compressing objects: 100% (214/214), done.
remote: Total 223 (delta 15), reused 47 (delta 8), pack-reused 0
Receiving objects: 100% (223/223), 90.69 KiB | 3.49 MiB/s, done.
Resolving deltas: 100% (15/15), done.
Tapped 203 casks (243 files, 343.7KB).

## 어떤걸 설치할 수 있는지 검색
$ brew search java
==> Formulae
app-engine-java            javarepl                   libreadline-java
google-java-format         jslint4java

==> Casks
charles-applejava          java-beta                  netbeans-java-se
eclipse-java               java6                      oracle-jdk-javadoc
eclipse-javascript         java8                      yourkit-java-profiler
java ✔                     netbeans-java-ee

## Java8 설치
$ brew cask install java8
```

* jEnv 설치
```sh
$ brew install jenv

## zsh 사용 중이므로
$ echo 'export PATH="$PATH:$HOME/.jenv/bin"' >> ~/.zshrc
$ echo 'eval "($jenv init -)"' >> ~/.zshrc
$ echo 'export JAVA_HOME="$(jenv prefix)"' >> ~/.zshrc  # 어느날 갑자기.. IntelliJ terminal에서 Java 버전 mismatch가 일어나서..
```

<br>

### Usage
* Java 추가
```sh
## 위에서 설치한 Java를 추가
$ jenv add /Library/Java/JavaVirtualMachines/jdk1.8.0_192.jdk/Contents/Home
$ jenv add  /Library/Java/JavaVirtualMachines/openjdk-11.jdk/Contents/Home
```

* 설정된 version 확인
```sh
$ jenv versions
* system (set by /Users/huekim/.jenv/version)
  11
  openjdk64-11
```

* global version 설정
```sh
$ jenv global 1.8.0.192
```

* 디렉토리별 version 설정
```sh
$ jenv local 1.8.0.192
```


<br>

## [SDKMNM!](https://sdkman.io)
* 다양한 SDK(Software Development Kits)를 관리하기 위한 tool
* [jEnv](#jenv---manage-your-java-environment)와 다르게 JDK도 설치할 수 있다

### Installation
```sh
$ curl -s "https://get.sdkman.io" | bash
```
* `.zshrc`, `.bash_profile`에 아래 내용이 자동으로 추가됨
```sh
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
```

* Delete
```sh
$ rm -rf ~/.sdkman
```

* Update
```sh
$ sdk selfupdate
```


<br>

### Usage
* Java 버전 조회
```sh
$ sdk list(or l) java

================================================================================
Available Java Versions for macOS 64bit
================================================================================
 Vendor        | Use | Version      | Dist    | Status     | Identifier
--------------------------------------------------------------------------------
 Corretto      |     | 19           | amzn    |            | 19-amzn
               |     | 19.0.1       | amzn    |            | 19.0.1-amzn
               |     | 17.0.5       | amzn    |            | 17.0.5-amzn
               |     | 17.0.4       | amzn    |            | 17.0.4-amzn
               |     | 11.0.17      | amzn    |            | 11.0.17-amzn
               |     | 11.0.16      | amzn    |            | 11.0.16-amzn
               |     | 8.0.352      | amzn    |            | 8.0.352-amzn
               |     | 8.0.342      | amzn    |            | 8.0.342-amzn
 Gluon         |     | 22.1.0.1.r17 | gln     |            | 22.1.0.1.r17-gln
               |     | 22.1.0.1.r11 | gln     |            | 22.1.0.1.r11-gln
...
```

* Java 설치
```sh
$ sdk install(or i) java [version]

## example
$ sdk i java 11.0.17-tem
```

* Java 제거
```sh
$ sdk uninstall java [version]
```

* Java 버전 변경
```sh
## current shell
$ sdk use java [version]

## default로 지정
$ sdk default java [version]
```

* 현재 사용 중인 버전 확인
```sh
$ sdk current
```

<br><br>

> #### Reference
> * [Mac OS X and multiple Java versions](https://stackoverflow.com/questions/26252591/mac-os-x-and-multiple-java-versions)
> * [jEnv - Manage your Java environment](http://www.jenv.be/)
> * [Mac에 Java 여러 버전 설치 & 사용하기](https://jojoldu.tistory.com/329)
> * [Installing Java 8 and Managing Multiple Java Versions on OSX](http://hanxue-it.blogspot.com/2014/05/installing-java-8-managing-multiple.html)
> * [Jenv not setting JAVA_HOME](https://github.com/gcuisinier/jenv/issues/44)
> * [SDK Man](https://sdkman.io)
