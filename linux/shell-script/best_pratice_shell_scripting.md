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

| Command | Shortcut | Description |
|:--|:--|:--|
| set -o errexit | -e | 명령어가 실패하면 즉시 종료 |
| set -o nounset | -u | 선언되지 않은 변수를 사용하면 오류 |
| set -o pipefail | - | pipeline에서 어느 하나라도 실패하면 전체 실패로 간주 |

<br>

### set -e
shell script는 python 같은 프로그래밍 언어들과 다르게 error가 발생해도 계속 수행되기 때문에 `-e`를 사용하여 error 발생시 control flow를 중단해야 side effect를 방지할 수 있다

* bad
```sh
#!/usr/bin/env bash
touch newfile
cp newfil newfile2
echo "Success"
```

* good
```sh
#!/usr/bin/env bash
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
#!/usr/bin/env bash
set -e
export PATH="venv/bin:$PTH"
ls
```

* good
```sh
#!/usr/bin/env bash
set -eu
export PATH="venv/bin:$PTH"
ls
```

<br>

### set -o pipefail
`-e`로는 pipe에서 error 발생시 control flow을 중단하지 않기 때문에 `-o pipefail`을 사용해 side effect를 방지한다

* bad
```sh
#!/usr/bin/env bash
set -eu
nonexistenprogram | echo
echo "Success"
```

* good
```sh
#!/usr/bin/env bash
set -euo pipefail
nonexistenprogram | echo
echo "Success"
```

<br>

## Subshells are weird
`$()`로 subshell을 실행하는데 subshell의 error가 variable의 일부인 경우 error로 처리되지 않아서 subshell 실행과 export를 분리하면 error로 처리될 수 있다

* bad
```sh
#!/usr/bin/env bash
set -euo pipefail
export VAR=$(echo hello | nonexistentprogram)
echo "Success"
```

* good
```sh
#!/usr/bin/env bash
set -euo pipefail
VAR=$(echo hello | nonexistentprogram)  # here
export VAR
echo "Success"
```

<br>

## `#!/usr/bin/env bash` 사용
* shebang으로 이식성과 유연성이 좋은 `#!/usr/bin/env bash`를 사용

| Use case | recommand shebang |
|:--|:--|
| OSS, cross platform 등 다양한 OS, 환경에서 실행 | `#!/usr/bin/env bash` |
| `/etc.init.d`, container, CI/CD 등 환경에서 고정된 경로 사용 | `#!/bin/bash` |

<br>

### `#!/bin/bash`
* `/bin/bash`가 존재한다는 전제하에 bash를 실행
* `env`를 거치지 않고 bash를 호출하므로 명확하고, process가 하나 덜 생성되어 성능이 미세하게 좋다
* 대부분의 linux에는 존재하지만 일부 OS는 bash의 경로가 다를 수 있어 하드코딩으로 이식성에 제한

<br>

### `#!/usr/bin/env bash`
* 유저의 `$PATH` 환경 변수에서 bash를 찾아 실행
  * `$PATH`가 잘못 설정되어 있으면 예상한 bash가 실행되지 않을 수 있다
* 일반적으로 `/usr/bin/env`는 거의 모든 unix-like 시스템에 존재하므로 bash가 다른 경로에 있을 때에도 동작하므로 이식성이 높다
* 가상 환경이나 다른 shell을 사용하는 경우에도 bash 경로를 자동으로 추적 가능
`env`를 통해 bash를 호출하므로 process가 하나 더 생성되어 성능이 미세한 차이가 있으나 일반적으로 무시해도 될 정도

<br>

## Conclusion
* shell script는 수동으로 실행하는 1회성에는 적합하나 장기적으로 유지보수해야 하는 작업에는 부적합
  * 매우 조심하지 않는한 복잡도가 올라감에 따라 bug가 보장되고, 수정 난이도 또한 올라가기 때문
* shell script 최초 작성시 `set -euo pipefail`을 사용하자


<br><br>

> #### Reference
> * [Please stop writing shell scripts](https://pythonspeed.com/articles/shell-scripts/)
