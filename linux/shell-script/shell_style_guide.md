# [Shell Script] Shell style guide
> date - 2020.05.01  
> keyworkd - shell, script, style guide  
> shell script style guide를 정리

<br>

## Background

### Which Shell to Use
* Bash는 실행 파일에 허용되는 유일한 shell scripting 언어
* `#!/bin/bash`와 최소 flag로 시작해야 한다
* `set`으로 shell option 설정

<br>

### When to use Shell
* Shell은 **small utilities나 simple wrapper script에만 사용**
  * e.g. 대부분 다른 utilities를 호출하거나 data 조작이 적은 경우
* 100 lines을 초과하는 등 script가 느려지거나 복잡해지면 다른 언어로 전환을 고려
  * e.g. Ruby, Python, Go...

<br>

## Shell Files and Interpreter Invocation

### File Extensions
* 프로그램 실행시 어떤 언어로 작성했는지 공개할 필요가 없으며 shell에는 확장명이 필요하지 않으므로 **executable에는 extensions이 없어야 한다**
* libaries는 `.sh`를 가지며 실행 가능하지 않아야 한다

<br>

### SUID/SGID
* shell의 보안 이슈로 인해 SUID, SGID를 허용하기에 충분한 보안 설정을 하는 것은 거의 불가능이라 shell script에서는 SUID, SGID 사용을 금지하고 필요한 경우 `sudo`를 사용


<br>

## Comments

### File Header
* 파일의 시작 부분에 내용에 대한 설명을 추가

```sh
#!/bin/bash
#
# Perform hot backups of Oracle databases.
```

<br>

### Function Comments
* 명백하고 짧지 않은 function에 comment 필요
* libary의 모든 function에 comment 추가
* comment를 읽고 function의 사용 방법을 배울 수 있어야 한다

```sh
#######################################
# Cleanup files from the backup directory.
# Globals:
#   BACKUP_DIR
#   ORACLE_SID
# Arguments:
#   None
#######################################
function cleanup() {
  …
}

#######################################
# Get configuration directory.
# Globals:
#   SOMEDIR
# Arguments:
#   None
# Outputs:
#   Writes location to stdout
#######################################
function get_dir() {
  echo "${SOMEDIR}"
}

#######################################
# Delete a file in a sophisticated manner.
# Arguments:
#   File to delete, a path.
# Returns:
#   0 if thing was deleted, non-zero on error.
#######################################
function del_thing() {
  rm "$1"
}
```

<br>

### Quick self-doc
* `grep`과 사전 정의된 format을 이용하여 self doc를 생성할 수 있다
```sh
func1() {  # public: Some quick introduction
  # do something
  :
}

func2() {  # public: Some other tasks
  # do something
  :
}

quick_help() {
  LANG=en_US.UTF_8
  grep -E '^[a-z].+ # public' "$0" \
  | sed -e 's|() {  # public: |☠|g' \
  | column -s"☠" -t \
  | sort
}
```

* result
```sh
func1  Some quick introduction
func2  Some other tasks
```

<br>

### Implementation Comments
* 까다롭고, 명확하지 않거나, 중요한 부분에 comment 추가
  * e.g. 복잡한 알고리즘

<br>

### TODO Comments
* temporary, short-term solution, 충분하지만 완벽하지 않은 코드에는 `TODO` comment 사용
```sh
# TODO(mrmonkey): Handle the unlikely edge cases (bug ####)
```


<br>

## Formatting

### Indentation
* **No tabs**
* 2 spaces

<br>

### Line Length and Long Strings
* 1줄에 maximum 80 charachter
* 80 charachter를 초과하는 경우에는 `here document` 또는 `embedded newlines` 사용
```sh
# Do use 'here document's
cat <<END
I am an exceptionally long
string.
END

# Embedded newlines are ok too
long_string="I am an exceptionally
long string."
```

<br>

### Pipelines
* pipeline이 너무 짧은 경우를 제외하고는 `display pipe` 사용
* `&&`, `||`에도 적용
```sh
# inline pipe
$ command1 | command2

# display pipe - 1 line, 1 command
$ command1 \
  | command2 \
  | command3 \
  | command4
```

<br>

### Loops
* indent **2 space**
* `; do`, `; then`은 `for`, `if`와 같은 라인에 있어야 한다
```sh
for dir in "${dirs_to_cleanup[@]}"; do
  if [[ -d "${dir}/${ORACLE_SID}" ]]; then
    log_date "Cleaning up old files in ${dir}/${ORACLE_SID}"
    rm "${dir}/${ORACLE_SID}"/*
    if (( $? != 0 )); then
      error_message
    fi
  else
    mkdir -p "${dir}/${ORACLE_SID}"
    if (( $? != 0 )); then
      error_message
    fi 
  fi
done
```

<br>

### Case statement
* indent **2 space**
* `)` 뒤와 `;;`앞에 공백 필요

#### 길거나 multi-command는 `;`로 multipe line으로 분할
```sh
case "${expression}" in
  a)
    variable="..."
    some_command "${variable}" "${other_expr}" ...
    ;;
  absolute)
    actions="relative"
    another_command "${actions}" "${other_expr}" ...
    ;;
  *)
    error "Unexpected expression '${expression}'"
    ;;
esac
```

#### 간단한 command는 one line으로 사용
* 단일 문자 option 처리에 적합
```sh
verbose='false'
aflag=''
bflag=''
files=''
while getopts 'abf:v' flag; do
  case "${flag}" in
    a) aflag='true' ;;
    b) bflag='true' ;;
    f) files="${OPTARG}" ;;
    v) verbose='true' ;;
    *) error "Unexpected option ${flag}" ;;
  esac
done
```

<br>

### Variable expansion
* `"$var"`보다는 `"${var}"` 사용
* single character, positional parameter는 `{}`를 사용하지 않고, 다른 variable에는 `{}`를 사용

```sh
# Preferred style for 'special' variables
echo "Positional: $1" "$5" "$3"
echo "Specials: !=$!, -=$-, _=$_, ?=$?, #=$# *=$* @=$@ \$=$$ ..."

# Braces necessary
echo "many parameters: ${10}"

# races avoiding confusion
# Output is a0b0c0
set -- a b c
echo "${1}0${2}0${3}0"

# Preferred style for other variables
echo "PATH=${PATH}, PWD=${PWD}, mine=${some_var}"
while read -r f; do
  echo "file=${f}"
done <<(find /tmp)
```

<br>

### Quoting
* shell-internal variable이 아닌 한 `""` 사용
  * list, command-line flag 등을 안전하게 사용하려면 `Array` 사용
  * `$?`, `$#`, `$$`, `$!` 등 shell-internal, readonly special variables
  * 일관성을 위한 `PPID` 등 named internal integer variable
  * `[[]]`, `[]`
* literal integer에는 사용 X
* `$*`를 사용할 특별한 이유가 없다면 `$@` 사용
  * e.g. message나 log의 문자열에 argument를 추가
* `$*` - 공백으로 구분된 하나의 argument로 합쳐지고, argument가 없다면 공백이 전달된다
* `$@` - argument를 그대로 유지하므로 argument가 없다면 전달하지 않는다
* `'` - 치환되지 않는다
* `"` - 치환될 수 있다
```sh
flag="$(some_command and its args "$@" 'quoted separately')"

# quote variables
echo "${flag}"

# Use arrays with quoted expansion for lists
declare -a FLAGS
FLAGS=( --foo --bar='baz')
readonly FLAGS
mybinary "${FLAGS[@]}"

# It's ok to not quote internal integer variables
if (( $# > 3 )); then
  echo "ppid=${PPID}"
fi

# never quote literal integers
value=32
# integer가 예상되도, command는 " 사용
number="$(generate_number)"

readonly USE_INTEGER='true'

echo 'Hello stranger, and well met. Earn lots of $$$'
echo "Process $$: Done making \$\$\$."

grep -li Hugo /dev/null "$1"

git send-email --to "${reviewers}" ${ccs:+"--cc" "${ccs}"}

# regex는 ' 사용
grep -cP '([Ss]pecial|\|?characters*)$' ${1:+"$1"}

(set -- 1 "2 two" "3 three tres"; echo $#; set -- "$*"; echo "$#, $@")
(set -- 1 "2 two" "3 three tres"; echo $#; set -- "$@"; echo "$#, $@")
```


<br>

## Features and Bugs

### ShellCheck
* [ShellCheck project](https://www.shellcheck.net/)는 shell script에 대한 일반적인 bug, warning을 식별하므로 모든 script에 사용 권장


### Command Substitution
* nested시 backticks은 `\`를 사용하여 읽기 어렵기 때문에 **backticks보다 `$(command)` 사용**
```sh
# This is preferred
var="$(command "$(command1)")"

# This is not
var="`command \`command1\``"
```

<br>

### Test, `[ ... ]`, and `[[ ... ]]`
* `[ ... ]`, `test`, `/usr/bin/[`보다 **`[[ ... ]]` 사용**
  * pathname expansion, work splitting이 발생하지 않으므로 error 감소
  * regular expression 허용

```sh
if [[ "filename" =~ ^[[:alnum:]]+name ]]; then
  echo "Match"
fi

if [[ "filename" == "f*" ]]; then
  echo "Match"
fi

# f*가 current directory가 되면 too many argument error 발생
if [ "filename" == f* ]; then
  echo "Match"
fi
```

<br>

### Testing Strings
* filler character보다 가능한 `"` 사용 
```sh
if [[ "${my_var}" == "some_string" ]]; then
  do_something
fi

# -z - string length 0, -n - string length 0이 아님이 empty string보다 선호
if [[ -z "${my_var}" ]]; then
  do_something
fi

# 아래 방법도 괜찮지만 선호하지 않는다
if [[ "${my_var}" == "" ]]; then
  do_something
fi
```

* test 대상에 대한 혼동을 피하려면 `-z`, `-n`을 명시적으로 사용
```sh
# Good
if [[ -n "${my_var}" ]]; then
  do_something
fi

# Bad
if [[ "${my_var}" ]]; then
  do_something
fi
```

* 비교시 `=` 대신 `==` 사용하고, 숫자 비교에는 `(( ... ))` 또는 `-lt`, `-gt` 사용
```sh
if [[ "${my_var}" == "val" ]]; then
  do_something
fi

if (( my_var > 3 )); then
  do_something
fi

if [[ "${my_var}" -gt 3 ]]; then
  do_something
fi 
```

<br>

### Wildcard Expansion of Filenames
* filename에 `* `사용시 `*` 대신 `./*`처럼 **명시적 경로**를 사용하는게 훨씬 안전
```sh
$ rm -v ./*
```

<br>

### Eval
* `eval`은 입력 값을 조정하거나, 값의 검증 없이 변수에 할당이 가능하므로 사용하지 말 것
```sh
# Dit it succeed? In part or whole?
eval $(set_my_variables)

# What happens if one of the returned values has a space in it?
variable="$(eval some_function)"
```

<br>

### Arrays
* **quoting complications**를 피하기 위해 복잡한 data structure가 아닌 argument list 저장시 사용
* 임의의 문자열(공백 문자열 포함) sequences/list를 안전하게 생성하고 전달 가능하지만 script가 복잡해질 수 있다
* command argument에 단일 문자 사용 지양
  * eval을 사용하거나 문자열 내에 `"` 추가시 불필요하게 복잡해진다
* `()`로 할당하며 `+=()`로 추가 가능
* array에 접근시 `"${array[@]}"` 사용
```sh
# Good
declare -a flags
flags=(--foo --bar='baz')
flags+=(--greeting="Hello ${name}")
mybinary "${flags[@]}"

# Bad
flags='--foo --bar=baz'
flags+=' --greeting="Hello world"'
mybinary ${flags}
```

* Command expansions은 array가 아닌 단일 문자열 반환하므로 command의 output에 특수문자가 포함되어 있으면 배열 할당에서 ''가 없는 확장은 올바르게 동작하지 않으므로 피해라
```sh
declare -a files=($(ls /directory))
mybinary $(get_arguments)
```

<br>

### Pipes to While
* piping to while보다 `readarray` 사용
* pipe는 subshell을 작성하므로 파이프 라인 내에서 수정된 변수는 parent shell로 전파되지 않는다
* pipe의 implicit subshell은 tracking 하기 어려운 버그를 유발할 수 있다
```sh
last_line='NULL'
your_command | while read -r line; do
  if [[ -n "${line}" ]]; then
    last_line="${line}"
  fi
done

echo "${last_line}"
```

* process substitution을 사용하면 subshell 생성
```sh
last_line='NULL'
while read line; do
  if [[ -n "${line}" ]]; then
    last_line="${line}"
  fi
done < <(your_command)

echo "${last_line}"
```

* builtin `readarray`로 process substitution를 사용하여 input을 loop 앞에 생성
```sh
last_line='NULL'
readarray -t lines < <(your_command)
for line in "${lines[@]}"; do
  if [[ -n "${line}" ]]; then
    last_line="${line}"
  fi
done
echo "${last_line}"
```
* `for var in $(command)` 같이 loop를 사용하는 것보다 `while read loop` 또는 `readarray`를 사용하는게 안전하고 명확하므로 권장
  * `for var in $(command)`의 command가 길어질 수 있기 때문에

<br>

### Arithmetic
* `let`, `$[ ... ]`, `expr`보다 `(( ... ))`, `$(( ... ))` 사용
* `<`, `>`가 `[]`에서 숫자 비교를 수행하지 않으므로 숫자 비교시 `(( ... ))` 사용
* `set -e`가 활성화된 경우 `(( ... ))`가 0으로 끝나지 않게 주의
  * `set -e; i=0; (( i++ ))`는 shell을 종료시킨다
* `$(( ... ))`내에서 변수 사용시 `${}` 생략 가능

```sh
echo "$(( 2 + 2 )) is 4!?"

# When performing arithmetic comparisions for testing
if (( a < b )); then
  ...
fi

# Some calculation assigned to a variable
(( i = 10 * j + 400 ))
```


<br>

## Naming Conventions

### Function Names
* **snake case** 사용
* libary or package에 `::` 사용
* `function` keyword는 optional
  * function name 뒤에 `()`가 있는 경우 필요 없지만 빠른 식별을 도와준다
  * project에서 일관성 있게 사용

```sh
# Single function
my_func() {
  ...
}

# Part of a package
mypackage::my_func() {
  ...
}
```

<br>

### Variable Names
* loop의 variable은 반복하는 variable name과 비슷하게 지정
```sh
for zone in "${zone[@]}"; do
  something_with "${zone}"
done
```

<br>

### Constants and Environment Variable Names
* `_`로 구분된 모든 대문자는 파일 맨 위에 선언
* Constants, Environment Variable은 대문자 사용

```sh
# Constant
readonly PATH_TO_FILES='/some/path'

# Both constant and environment
declare -xr ORACLE_SID='PROD'
```

* `getopts` 또는 condition에 따라 상수를 설정하는 경우 바로 readonly로 만들어야 한다
* 명확성을 위해 `declare`보다 `readonly` or `export` 사용 권장
```sh
VERBOSE='false'
while getopts 'v' flag; do
  case "${flag}" in
    v) VERBOSE='true' ;;
  esac
done
readonly VERBOSE
```

<br>

### Source Filenames
* **snake case** 사용
* e.g. maketemplate or make_template

<br>

### Read-only Variables
* `readonly` or `declare -r` 사용
* global variable의 경우 error를 빠르게 발견하는게 중요하므로 readonly를 명시적으로 선언
```sh
zip_version="$(dpkg --status zip | grep Version: | cut -d ' ' -f 2)"
if [[ -z "${zip_version}" ]]; then
  error_message
else
  readonly zip_version
fi
```

<br>

### Use Local Variables
* function의 variable에 `local` 사용
* declaration과 assignment는 다른 라인에 있어야 한다
* `local`은 command substitution에서 exit code를 전파하지 않는다

```sh
my_func2() {
  local name="$1"

  # Separate lines for declaration and assignment
  local my_var
  my_var="$(my_func)"
  (( $? == 0 )) || return
  ...
}
```

<br>

### Function Location
* `include`, `set`, 상수 선언 바로 아래에 모든 `function`을 정의

<br>

### main
* 최소 1개 이상의 다른 `function`을 포함할 수 있도록 파일 가장 마지막에 `main function` 정의
* script가 짧다면 `main`은 불필요
```sh
...
main "$@"
```

<br>


## Calling Commands

### Checking Return Values
* 항상 return value를 확인
* unpiped command는 `$?` or `if`로 확인
```sh
if ! mv "${file_list[@]}" "${dest_dir}/"; then
  echo 
fi

# or
mv "${file_list[@]}" "${dest_dir}/"
if (( $? != 0 )); then
  echo "Unable to move ${file_list[*]} to ${dest_dir}" >&2
  exit 1
fi
```

#### Pipe의 성공 여부 확인
* pipe의 모든 부분에서 return code를 확인할 수 있는 `PIPESTATUS` variable 제공
```sh
tar -cf - ./* | ( cd "${DIR}" && tar -xf - )
if (( PIPESTATUS[0] != 0 || PIPESTATUS[1] != 0 )); then
  echo "Unable to tar files to "${dir}" >&2
fi
```

* `PIPESTATUS`는 다른 명령 실행시 overwrite되므로 다른 variable에 할당 필요
```sh
tar -cf - ./* | ( cd "${DIR}" && tar -xf - )
return_codes=( "PIPESTATUS[@]" )  # assignment 때문에 PIPESTATUS에 0이 할당
if (( return_codes[0] != 0 )); then
  do_something
fi
if (( return_codes[1] != 0 )); then
  do_something_else
fi
```

* 아래와 같은 `function` 정의하여 사용
```sh
is_good_pipe() {
  echo "${PIPESTATUS[@]}" | grep -qE "^[0 ]+$"
}

do_something | fail_command | something_else
is_good_pipe \
|| {
  echo >&2 ":: Unable to do something"
}
```

<br>

### Builtin Commands vs External Commands
* external command 보다는 shell builtin 선호
  * `sed`와 비교 했을 때 parameter expansion function이 더 강력하기 때문

```sh
# prefer this
addition=$(( ${X} + ${Y} ))
substitution="${string/#foo/bar}"

# instead of this
addition="$(expr ${X} + ${Y})"
substitution="$(echo "${string}" | sed -e 's/^foo/bar/')"
```

<br>

## Error handling

### STDOUT vs STDERR
* 모든 error/warning은 `STDOUT`이 아닌 `STDERR`로 보낸다
* wrapper를 사용하여 다른 status message와 error message를 함께 출력하는 것을 권장
```sh
err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $*" >&2
}

if ! do_something; then
  err "Unable to do_something"
  exit 1
fi
```

<br>

### function 외부에서 error를 처리하지 않고, function 내부에서 처리
* bad
```sh
my_def() {
  foobar_call

  if [[ $? -ge 1 ]]; then
    echo >&2 "foobar_call has some error"
    error "foobar_call has some error"
    return 1
  fi
}
```

* good
```sh
foobar_call() {
  # do something

  if [[ $? -ge 1 ]]; then
    error "$FUNCNAME has some internal error"
  fi
}

my_def() {
  foobar_call || return 1
}
```

<br>

### Catch up with $?
* **`$?`로 last statement의 return code**를 얻을 수 있고, `$?`의 값이 중간에 변경될 수 있기 때문에 **local variable에 저장해서 사용**하는 것을 권장
* `$?`는 유용하나 `set -e`와 함께 사용하지 마라
```sh
do_something_critical
local ret="$?"
# latest statement가 assignment기 때문에 $?는 항상 0이다
if [[ ${ret} -ge 1 ]]; then
  # do something
fi

do_something_terrible
echo "done"
if [[ $? -ge 1 ]]; then
  # echo가 0을 return하기 때문에 실행되지 않는다
fi
```

<br>

### Set -u
* undeclared variable 사용 방지
* script 실행 전에 변수를 선언하도록 변수 미선언시 script exit
```sh
: a lot of method definitions

set -u
: "${SOME_VARIABLE}"
: "${OTHER_VARIABLE}"

: your main routine
```

<br>

### Set -e
* do_something 실패시 `set -e`로 인해 바로 종료되므로 원하는 처리를 할 수 없다
```sh
set -e
do_something

if [[ $? -ge 1 ]]; then
  # not working
fi
```

* `if`로 인해 `set -e`가 동작하지 않는다
```sh
set -e
if do_something; then
  # working
fi
```
* `set -e`에 의존하지 않고, 적절한 error handling 권장


<br>

## Techniques

### A little tracing
* `LINENO`, `FUNCNAME` 사용
```sh
log() {
  echo "(LOGGING) ${FUNCNAME[1]:-unknown}: $*"
}

funcA() {
  log "This is A"
}

funcB() {
  log "This is B"
  funcA
}

funcC() {
  log "This is C"
  funcB
}

: Now, we call funcC
funcC
```

* result
```sh
(LOGGING) funcC: This is C
(LOGGING) funcB: This is B
(LOGGING) funcA: This is A
```

<br>

### Making your script a library
* 어떤 작업을 직접 수행하지 않고, 가능한 `function`과 wrapper를 사용

<br>

* Bad
```sh
# do something 1
# do something 2
```

* Good
```sh
default_task() {
  # do something
}

case "${@:-}" in
  ":") echo "File included" ;;
  "") default_task ;;
esac
```

```sh
# from other script
source "/path/to_the_previous_script.sh" ":"
```
* 위의 테크닉을 발전시키면 script를 debugging하거나 동작을 변경시킬 수 있다

<br>

### No execuse
* empty argument list 등 기본 조건이 설정되지 않은 경우 즉시 exit

<br>

### Meta programming
* function 정의를 얻는 것은 매우 쉬워서 아래와 같이 local function을 remote server에서 실행할 수 있다
```sh
my_func() {
  echo "This is my function"
}

{
  declare -f my_func
  echo "my_func"
} \
| ssh some_server
```

<br>

### Removing with care
* 파일과 디렉토리를 올바르게 제거하는 것은 어려우니 `backup` option과 `rm`을 함께 사용
```sh
export temporary_file=/path/to/some/file
readonly temporary_file

rm -fv "$temporary_file"
```


<br>

## Conclusion
* Use common sense and **BE CONSISTENT**


<br><br>

> #### Reference
> * [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html#s7.4-source-filenames)
> * [A Bash coding style https://github.com/icy/bash-coding-style](https://github.com/icy/bash-coding-style)

<br>

> #### Further reading
> * [Scripting Standards](http://ronaldbradford.com/blog/scripting-standards/)
