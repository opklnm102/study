# [Shell Script] How to pass and parse arguments
> date - 2019.03.31  
> keyword - shell script  
> shell script에서 arguments passing 방법에 대해 정리  

<br>

## Assign provided arguments to bash variable
* 필요한 argument를 순서대로 전달해서 사용한다
* UX와 Code 관점에서 좋은 방법은 아니지만 **간단하게** 사용하기 좋다
```sh
#!/usr/bin/env bash

count=$1
word=$2

echo ${count} ${word}
```

* usage
```sh
$ myscript.sh 10 "Hello World"
```


<br>

## Read Multiple Arguments with Loop
* Loop를 사용해 위 방법보단 parsing 측면에선 더 좋을지도..?
```sh
#!/usr/bin/env bash

for var in "$@"
do
  echo ${var}
done
```

* usage
```sh
$ ./read-arguments-with-loop.sh 1 2 "Hello"
1
2
Hello
```
> #### `$@`
> * 제공된 전체 arguments

<br>

## Read named arguments

### 1. space-separated(e.g. --option argument)
```sh
#!/usr/bin/env bash

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

  case ${key} in
    -e|--extension)
      EXTENSION="$2"
      shift  # past argument
      shift  # past value
      ;;
    -s|--searchpath)
      SEARCH_PATH="$2"
      shift  # past argument
      shift  # past value
      ;;
    *)
      POSITIONAL+=("$1")  # save it in an array for later
      shift  # past argument
      ;;
  esac
done
set -- "${POSITIONAL[@]}"  # restore positional parameters

echo "FILE EXTENSION = ${EXTENSION}"
echo "SEARCH PATH = ${SEARCH_PATH}"
echo "Number files in SEARCH PATH with EXTENSION:" $(ls -l ${SEARCH_PATH}/*.${EXTENSION} | wc -l)

if [[ -n $1 ]]; then
  echo "Last line of file specified as non-opt/last argument:"
  tail -1 "$1"
fi
```

* usage
```sh
$ ./passing-named-argument.sh -e log -s /var/log
FILE EXTENSION = log
SEARCH PATH = /var/log/
Number files in SEARCH PATH with EXTENSION: 2
```

> #### `$#`
> * 인자의 갯수가 저장
>
> #### `shift`
> * $1 인자를 없애고 하나씩 땡긴다(e.g. $2 -> $1, $3 -> $2)


<br>

### 2. equals-separated(e.g. --option=argument)
```sh
#!/usr/bin/env bash

for key in "$@"
do
  case ${key} in
    -e=*|--extension=*)
      EXTENSION="${key#*=}"
      shift  # past argument=value
      ;;
    -s=*|--searchpath)
      SEARCH_PATH="${key#*=}"
      shift  # past argument=value
      ;;
    *)
       # unknown option
    ;;
  esac
done

echo "FILE EXTENSION = ${EXTENSION}"
echo "SEARCH PATH = ${SEARCH_PATH}"
echo "Number files in SEARCH PATH with EXTENSION:" $(ls -l ${SEARCH_PATH}/*.${EXTENSION} | wc -l)

if [[ -n $1 ]]; then
  echo "Last line of file specified as non-opt/last argument:"
  tail -1 "$1"
fi
```

* usage
```sh
$ ./passing-named-argument.sh -e=log -s=/var/log
FILE EXTENSION = log
SEARCH PATH = /var/log
Number files in SEARCH PATH with EXTENSION: 2
```

> #### `${key#*=}`
> * ${string#substring}
> * key가 -e=log라면 =뒤의 argument를 substring해서 추출
> * -e=log -> log


<br>

#### More succinct way
```sh
#!/usr/bin/env bash

CLEAR='\033[0m'
RED='\033[0;31m'

function show_help() {
  if [[ -n "$1" ]]; then
    echo -e "${RED}👉 $1${CLEAR}\n";
  fi

  echo "Usage: $0 [-o --output] [-v --verbose]"
  echo " -o --output       Output file"
  echo " -v --verbose      Enable verbose mode"
  echo ""
  echo "Example: $0 --output result.log --verbose"
}

VERBOSE=0

while [[ "$#" -gt 0 ]]; do case $1 in
  -o|--output) OUTPUT="$2"; shift;;
  -v|--verbose) VERBOSE=1; shift;;
  *) show_help "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

## verify params
if [[ -z "$OUTPUT" ]]; then show_help "output is not set"; fi;
```

* usage
```sh
$ ./short-passing.sh -f
👉 Unknown argument passed: -f

Usage: ./short-passing.sh [-o --output] [-v --verbose]
 -o --output       output file
 -v --verbose      verbose mode

Example: ./short-passing.sh --output result.log --verbose
```


<br>

### 3. Using getopts
* 장점
  * more portable
    * dash 같은 다른 shell에서도 사용
  * -vf filename과 같이 **여러 단일 옵션을 자동으로 처리**할 수 있다
* 단점
  * **짧은 옵션만 처리**할 수 있다
    * -h (O)
    * -help (X)

```sh
#!/usr/bin/env bash

OPTIND=1  # reset in case getopts has been used previously in the shell

output_file=""
verbose=0

function show_help() {
  echo "help..."
}

while getopts "h?vf:" opt; do
  case "${opt}" in
  h|\?)
    show_help
    exit 0
    ;;
  v)
    verbose=1
    ;;
  f)
    output_file=${OPTARG}
    ;;
  esac
done

shift $((OPTIND-1))

[[ "${1:-}" = "--" ]] && shift

echo "verbose=$verbose, output_file=$output_file, Leftovers: $@"
```

* usage
```sh
$ ./passing-named-argument-with-getopts.sh -v -f result.log
verbose=1, output_file=result.log, Leftovers: 
```


<br>

#### More succinct way
```sh
#!/usr/bin/env bash

while getopts vo: opt; do
  case ${opt} in
    v) VERBOSE=1;;
    o) OUTPUT_FILE=${OPTARG};;
  esac
done

echo "$VERBOSE"
echo "$OUTPUT_FILE"
```

* usage
```sh
$ ./short-passing-named-arguments.sh -o result.log -v
1
result.log
```


<br><br>

> #### Reference
> * [How do I parse command line arguments in Bash?](https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash)
> * [How To Pass and Parse Linux Bash Script Arguments and Parameters](https://www.poftut.com/how-to-pass-and-parse-linux-bash-script-arguments-and-parameters/)
