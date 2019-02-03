# [Shell Script] set -e and set -x
> date - 2019.02.03  
> keyword - shell script  
> shell script에서 흔히 보이던 `set -e`가 어떤걸 해주는지 궁금해서 정리  

<br>

## set -e
* 명령이나 pipeline에 오류가 있는 경우 script 실행 중지
  * script의 오류를 무시하는 기본 동작과는 반대

```sh
#!/bin/bash

set -e
```

### Example
```sh
#!/bin/bash

set -e
echo "hello"
false  # 여기서 종료
echo "world"

## result
hello
```


<br>

## set -x
* `trace`로 실행하는 모든 명령을 출력
```sh
#!/bin/bash

set -x
echo "hello"
false

## result
+ echo hello
hello
+ false
```


<br><br>

> #### Reference
> * [set -e and set -x](http://julio.meroh.net/2010/01/set-e-and-set-x.html)
