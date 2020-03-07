# [Linux] grep - print lines matching a pattern
> date - 2020.03.07  
> keyword - linux, grep, egrep, fgrep  
> pattern matching에 사용하는 grep에 대해 정리

<br>

## grep이란?
* 주로 입력으로 전달된 내용에서 특정 pattern의 문자열을 찾을 때 사용하는 명령어
* Regular Expression 방식으로 Pattern Matching 수행


<br>

### Syntax
```sh
$ grep [options] [pattern] [input]

## example
$ grep -A 3 'example' example.log

## using pipe
$ cat example.log | grep -A 3 'example'
```

### Regular Expression Meta Character
| Meta Character | Description | Example | Example Description |
|:--|:--|:--|
| . | 1개의 문자 일치 | 'a...e' | a 다음에 2개의 문자 마지막에 e |
| * | 앞 문자가 0회 이상 일치 | '*apple' | 0 or n개의 공백 문자 후 apple |
| {n} | 앞 문자가 n회 일치 | 'a{5}' | a가 5회 반복 |
| {n,m} | 앞 문자가 n회 이상, m회 이하 일치 | 'a{2,4}' | a가 2회 이상, 4회 이하 반복 |
| [] | [] 안에 포함된 문자 중 1개와 일치 | '[Aa]pple' | Apple or apple과 일치 |
| [^ ] | [] 안 ^ 뒤에 있는 문자 제외 | '[^A]pple' | apple과 일치 |
| [ - ] | [] 안 문자 범위에 있는 문자와 일치 | '[A-K]pple' | A ~ K와 pple면 일치 |
| ^ | 문자열 라인의 처음 | '^apple' | apple로 시작하면 일치 |
| $ | 문자열 라인의 마지막 | 'apple$' | apple로 끝나면 일치 |


<br>

### Usage

#### 앞, 뒤 라인 더 출력하기
* `-B`, `--before-context` - 앞 라인 더 출력
```sh
$ grep -B [line count]
```

* `-A`, `after-context` - 뒤 라인 더 출력
```sh
$ grep -A [line count]
```

* `-C`, `--context` - 주변 라인 출력하기
```sh
$ grep -C [line count]

## equivalent
$ grep -B [line count] -A [line count]
```

<br>

#### Pattern에 맞지 않는 라인 출력
* `-v`, `--invert-match`
```sh
$ grep -v [pattern]

## example
$ grep -v 'example' example.txt
```

* 여러 패턴 제외
```sh
$ grep -Ev [pattern]

## example
$ grep -Ev 'example|sample' example.txt

## -v 여러번 쓰는 것과 같다
$ grep -v 'example' example.txt | grep -v 'sample'
```

<br>

#### Print line number
* `-n`, `--line-number`
```sh
$ grep -n [pattern]

## example
$ grep -n 'sunil' example.txt

2:sunil clerk account 25000
7:sunil peon sales 13000
```

<br>

#### Ignore case
* `-i`, `--ignore-case` - Perform case insensitive matching(default, grep is case sensitive)
```sh
$ grep -i [pattern]
```

<br>

#### Recursively search subdirectories
* `-R`, `-r`, `--recursive`
```sh
$ grep -r [pattern] [directory]

## example
$ grep -r 'kubeadm' go/src
src/k8s.io/kube-state-metrics/vendor/k8s.io/api/core/v1/types.go:	// implemented by kubeadm). It stores tokens that are used to sign well known

## with linu number
$ grep -rn 'kubeadm' go/src
src/k8s.io/kube-state-metrics/vendor/k8s.io/api/core/v1/types.go:5081:	// implemented by kubeadm). It stores tokens that are used to sign well known
```

<br>

#### Pattern이 아닌 fixed string 사용
* `-F`, `--fixed-strings`
```sh
$ grep -F [fixed string]
```

<br>

#### 한 단어에 맞는 라인 출력
```sh
$ grep -w [word]

```

<br>

#### Multiple condition
* OR
```sh
$ grep 'pattern1\|pattern2' somefile

## using grep -E
$ grep -E 'pattern1|pattern2' somefile

## using egrep
$ egrep 'pattern1|pattern2' somefile

## using -e
$ grep -e 'pattern1' -e 'pattern2' somefile
```

* AND
```sh
$ grep 'pattern1' somefile | grep 'pattern2'

## using -E
$ grep -E 'pattern1.*pattern2' somefile

## pattern1과 pattern2가 포함된 라인을 순서에 상관없이 matching
$ grep -E 'pattern1.*pattern2|pattern2.*pattern1' somefile
```


<br>

## egrep
* `grep`의 확장 명령어
* `grep -E` == `egrep`
* **여러개의 문자열을 동시에** 찾을 수 있고, `grep`보다 추가로 Regular Expression Meta Character 사용 가능

<br>

### Syntax
```sh
$ egrep [regular expression pattern] [input]
```

<br>

### grep보다 추가로 지원하는 Regular Expression Meta Character
| Meta Character | Description | Example | Example Description |
|:--|:--|:--|:--|
| + | 1회 이상 일치 | 'a+' | a가 1번 이상 |
| ? | 0 또는 1회 일치 | 'a?' | a가 0 or 1번 |
| \| | or condition | 'a|b' | a or b |
| () | 그룹화 | '(app)+' | app가 1번 이상 |


<br>

### Usage

#### string1이나 string2가 포함된 라인 출력
```sh
$ egrep 'string1|string2' somefile
```

#### 2가 1개 이상 포함된 라인 출력
```sh
$ egrep '2+' somefile
```

#### 2가 없거나 1개만 포함되고, 다음에 숫자가 있는 라인 출력
```sh
$ egrep '2?[0-9]' somefile
```

#### string이 1개 이상 포함된 라인 출력
```sh
$ egrep '(string)+' somefile
```

#### A 다음에 p나 l이 포함된 라인 출력
```sh
$ egrep 'A(p|l)' somefile
```


<br>

## fgrep
* `grep`의 확장 명령어
* **Regular Expression이 아닌 일반 문자로만 검색**하기 때문에 속도가 빠르다
  * `Regular Expression Meta Character`도 일반 문자로 취급


<br><br>

> #### Reference
> * [grep(1) - Linux man page](https://linux.die.net/man/1/grep)
> * [7 Linux Grep OR, Grep AND, Grep NOT Operator Examples](https://www.thegeekstuff.com/2011/10/grep-or-and-not-operators/)
