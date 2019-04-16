# [Shell Script] About getopts
> date - 2019.04.16  
> keyword - shell script, getopts  
> named argument를 위해 사용하던 getopts에 대해 정리

<br>

## getopts란?
* script 실행시 옵션으로 -a, -b 등을 사용하는데 이런 옵션 처리를 쉽게할 수 있다
  * GNU-style(e.g. --myoption), XF86-style(e.g. -myoption)에는 사용하지 못한다
* shell builtin command
  * parsing에 shell variable 사용 가능
  * positional parameter를 external program에 전달할 필요가 없다
* `-`으로 시작하면 option
  * 영어 대소문자, 숫자 사용
  * `-`로 option과 parameter를 구분
  * option이 아닌 parameter를 parsing하고 option의 끝인 `--`에서 중지
* multiple option 가능
  * e.g. -ab => -a, -b
  * `getopts`를 여러번 호출해서 다음 parameter를 읽는다
* potional parameter를 수정하지 않기 때문에 수동으로 이동해야 한다
```sh
shift $((OPTIND-1))
# now do something with $@
```

* parsing할 parameter가 없을 때 false가 되기 때문에 while-loop에서 사용하기 쉽다
```sh
while getopts ...; do
  ...
done
```


<br>

## Variables
* `OPTIND`
  * 처리할 다음 parameter로 index를 보유
  * getopts가 call사이에 status를 기억하는 방법
  * getopts로 처리 후 option 이동시 유용
  * 초기값은 1이며 다시 parsing할 경우 1로 reset 필요
* `OPTARG`
  * getopts에서 찾은 option에 대한 parameter로 설정된다
  * unknown option의 flag도 포함
* `OPTERR`
  * bash가 getopts builtin으로 인한 error 표시 여부
    * bash에서만 유효
  * shell 시작시 항상 1
    * 보고 싶지 않으면 0으로 set


<br>

## Specify what you want
* syntax
```sh
getopts OPTSTRING VARNAME [ARGS...]
```
* OPTSTRING
    * 추출할 option
* VARNAME
    * option reporting에 사용할 변수
* ARGS
    * positional parameter 대신 선택적 단어를 구문 분석

<br>

* example
```sh
getopts fAx VARNAME

## usage
./test.sh -f -A -x
```


<br>

### `:`가 붙으면 parameter가 필요한 option
```sh
getopts fA:x VARNAME

## usage
./test.sh -f -A something -x
```

<br>

> #### 1번째 option이 `:`인 경우 **silent error reporting mode**
> 성가신 메시지에 방해받지 않고, 직접 오류를 처리할 수 있기 때문에 사용
> e.g. getopts :fA:x


<br>

## Custom arguments to parse
* 기본적으로 **current shell** 또는 **function의 positional parameter**를 parsing
  * $@를 parsing
* 원하는 배열을 분석할 수 있다
```sh
while getopts :f:h opt "${MY_OWN_SET[@]}"; do
  ...
done
```
* 이러한 추가 인수 없이 getopts를 호출하면 명시적으로 $@를 호출하는것과 같다


<br>

## Example
```sh
#!/bin/bash

while getopts ":a" opt; do
  case $opt in
    a)  
      echo "-a was triggered!" >&2 
      ;;
    \?) 
      echo "Invalid option: -$OPTARG" >&2 
      ;;
    esac
done
```

* usage
```sh
## without any arguments
$ ./test.sh
$

## non-option arguments
$ ./test.sh /etc/passwd
$

## invalid arguments
$ ./test.sh -b
Invalid option: -b

## valid arguments
$ ./test.sh -a
-a was triggered!

## multiple arguments
$ ./test.sh -a -x -a -c
-a was triggered!
Invalid option: -x
-a was triggered!
Invalid option: -c
```


<br>

### Invalid argument라도 processing stop되지 않기 때문에 `exit`를 사용해야 한다
```sh
#!/bin/bash

while getopts ":a:" opt; do
  case $opt in
    a)
      echo "-a was triggered, Parameter: $OPTARG" >&2
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument" >&2
      exit 1
      ;;
  esac
done
```

* usage
```sh
## without any arguments
$ ./test.sh
$

## non-option arguments
$ ./test.sh /etc/passwd
$

## invalid arguments
$ ./test.sh -b
Invalid option: -b

## valid option with argument
$ ./test.sh -a hello
-a was triggered, Parameter: hello

## valid option without argument
$ ./test.sh -a
Option -a requires an argument
```


<br><br>

> #### Reference
> * [Small getopts tutorial](https://wiki.bash-hackers.org/howto/getopts_tutorial)
