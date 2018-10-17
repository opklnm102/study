# [Java] Managing multiple Java version with jenv
> date - 2018.10.18  
> keyword - java, jenv  
> 새로운 개발 환경 셋팅중 Java11이 설치되어 nvm처럼 여러 버전을 사용할 수 없을까 해서 찾아본 내용 정리  

<br>

## jEnv - Manage your Java environment
* CLI에서 `JAVA_HOME` 환경 변수를 간단하게 설정할 수 있는 tool
* `JAVA_HOME`을 설정해주기 때문에 nvm처럼 여러 Java version을 사용할 수 있다


## Installation

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
```


## Usage
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

> #### Reference
> * [Mac OS X and multiple Java versions](https://stackoverflow.com/questions/26252591/mac-os-x-and-multiple-java-versions)
> * [jEnv - Manage your Java environment](http://www.jenv.be/)
> * [Mac에 Java 여러 버전 설치 & 사용하기](https://jojoldu.tistory.com/329)
> * [Installing Java 8 and Managing Multiple Java Versions on OSX](http://hanxue-it.blogspot.com/2014/05/installing-java-8-managing-multiple.html)
