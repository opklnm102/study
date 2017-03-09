# 리눅스에서 백그라운드로 돌리기

> Spring Boot Web Application을 AWS EC2에 배포작업을 하던 도중 터미널이 종료되도 Process가 종료되지 않는 방법이 필요했다.</br>
> 그래서 찾은 방법이 프로세스를 백그라운드 작업으로 실행하는 것이었다
  

## & - 프로세스 백그라운드로 실행
* 사용자가 로그아웃시 프로그램 종료됨
```sh
$ java -jar <my.jar> &
``` 

## nohup - 사용자가 로그아웃해도 백그라운드로 실행 시키기
```sh
$ nohup java -jar <xxx.jar> &
```

## 프로세스 종료
1. 찾기
   ```sh
   $ ps -ef | grep <process name>
   ```

2. 종료
   ```sh
   $ kill -9 <pid>
   ```
  
## 로그
* `nohup`로 실행된 쉘 스크립트는 자동으로`nohup.out`이라는 로그파일을 실행한 위치에 생성시킨다.
* 로그 파일 생성막기
```sh
# 1(stdout), 2(stderr). stdout을 /dev/null로 stderr를 stdout으로 리다이렉션시키므로 파일 생성이 안된다.
$ nohup `java -jar <xxx.jar>` 1 > /dev/null 2 > &1 &
```
  

> ### 참고
> [Spring Boot Linux에서 실행하기](http://forgiveall.tistory.com/292)  
> [1%의 기억공간](http://yoongi.tistory.com/67)  
