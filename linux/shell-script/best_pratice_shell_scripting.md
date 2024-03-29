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


<br>

## set -euo pipefail 사용

### set -e
shell script는 python 같은 프로그래밍 언어들과 다르게 error가 발생해도 계속 수행되기 때문에 `-e`를 사용하여 error 발생시 control flow를 중단해야 side effect를 방지할 수 있다

* bad
```sh
#!/bin/bash
touch newfile
cp newfil newfile2
echo "Success"
```

* good
```sh
#!/bin/bash
set -e
touch newfile
cp newfil newfile2
echo "Success"
```

<br>

### set -u
unknown variable에 대해 python에서는 NameError가 발생하지만 shell script에서는 발생하지 않기 때문에 `-u`를 사용해 side effect를 방지한다

* bad
```sh
#!/bin/bash
set -e
export PATH="venv/bin:$PTH"
ls
```

* good
```sh
#!/bin/bash
set -eu
export PATH="venv/bin:$PTH"
ls
```

<br>

### set -o pipefail
`-e`로는 pipe에서 error 발생시 control flow을 중단하지 않기 때문에 `-o pipefail`을 사용해 side effect를 방지한다

* bad
```sh
#!/bin/bash
set -eu
nonexistenprogram | echo
echo "Success"
```

* good
```sh
#!/bin/bash
set -euo pipefail
nonexistenprogram | echo
echo "Success"
```

<br>

### Subshells are weird
`$()`로 subshell을 실행하는데 subshell의 error가 variable의 일부인 경우 error로 처리되지 않아서 subshell 실행과 export를 분리하면 error로 처리될 수 있다

* bad
```sh
#!/bin/bash
set -euo pipefail
export VAR=$(echo hello | nonexistentprogram)
echo "Success"
```

* good
```sh
#!/bin/bash
set -euo pipefail
VAR=$(echo hello | nonexistentprogram)  # here
export VAR
echo "Success"
```

<br>

## Conclusion
* shell script는 수동으로 실행하는 1회성에는 적합하나 장기적으로 유지보수해야 하는 작업에는 부적합
  * 매우 조심하지 않는한 복잡도가 올라감에 따라 bug가 보장되고, 수정 난이도 또한 올라가기 때문
* shell script 최초 작성시 `set -euo pipefail`을 사용하자


<br><br>

> #### Reference
> * [Please stop writing shell scripts](https://pythonspeed.com/articles/shell-scripts/)
