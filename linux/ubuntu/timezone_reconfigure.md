# [Ubuntu] Timezone reconfigure
> ubuntu 16.04에서 timezone을 변경하는 법을 정리


### timezone 확인
```sh
$ date

Sun Jun 10 18:19:12 KST 2018  # 현재 KST
```

### timezone 변경하기
```sh
$ dpkg-reconfigure tzdata
```
* 위 명령어 실행 후 나타나는 매뉴를 따라 원하는 timezone으로 변경


### 결과
```sh
$ date

Sun Jun 10 09:19:12 UTC 2018
```

<br>

---

> #### 참고
> * [How to change the timezone on ubuntu 14](https://www.digitalocean.com/community/questions/how-to-change-the-timezone-on-ubuntu-14)
