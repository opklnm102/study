# [Shell Script] Best Pratice Shell Scripting
> date - 2019.08.03  
> keyword - shell script  
> shell script 사용시 주의할 점에 대해 정리  

<br>

## 어느 위치에서 실행하든지 script가 실행되도록 작성하자
* 의외로 path 문제로 error가 많이 발생하므로 다양한 case에 대한 test 필요

### script와 같은 위치에서 test
```sh
$ ./script.sh arg1
```

<br>

### script와 다른 위치에서 절대 경로로 test
```sh
$ /home/user/test/script.sh arg1
```

<br>

### script와 다른 위치에서 상대 경로로 test
```sh
$ ../test/script.sh arg1
```

<br>

### 절대 경로를 기반으로 작성하는 방법 추천
```sh
$(cd "$(dirname ${0})" && pwd)
```

<br><br>

> #### Reference
> nothing
