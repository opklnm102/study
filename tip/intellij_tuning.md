# [Tip] IntelliJ Tuning 
> date - 2018.10.24  
> keyword - IntelliJ, jvm  
> macOS에서 IntelliJ tuning 하는 법 정리  

<br>

## JVM options 설정
* IntelliJ가 느릴 때 heap memory를 늘려주면 훨씬 자연스럽게 사용할 수 있다

```sh
$ vi /Applications/IntelliJ\ IDEA.app/Contents/bin/idea.vmoptions

# 기존에 있던 내용에 다음 항목들을 수정해준다
-Xms1024m  # 초기 메모리 할당(보통 Xmx의 절반으로 설정)
-Xmx2048m  # 최대 메모리 할당
-XX:NewRatio=2  # young, old generation size 조절(2 ~ 4 권장. young generation size가 1/2 ~ 1/4로 설정. 한 프로젝트에서 자주 작업할 때 좋다)
```

<br>

> #### Reference
> * [Tuning IntelliJ IDEA](https://www.jetbrains.com/help/idea/tuning-the-ide.html)
> * [Configuring JVM options and platform properties](https://intellij-support.jetbrains.com/hc/en-us/articles/206544869-Configuring-JVM-options-and-platform-properties)
