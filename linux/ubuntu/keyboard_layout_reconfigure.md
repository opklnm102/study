# [Ubuntu] Keyboard layout reconfigure
> ubuntu 16.04 server라 GUI가 아닌 환경에서 keyboard layout을 변경해야 했다. 그 과정을 정리


### console-common install
* 설치하면 keyboard layout 설정 메뉴가 등장
```sh
$ sudo apt-get install console-common
```

* keyboard layout 설정이 안나오면 아래 명령어 실행
```sh
$ sudo dpkg-reconfigure console-data
```

<br>

---

> #### 참고
> * [change console keyboard layout](https://ubuntuforums.org/showthread.php?t=1758915)