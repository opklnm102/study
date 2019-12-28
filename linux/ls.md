# [Linux] ls - list directory contents
> date - 2019.12.28  
> keyworkd - linux, shell, ls  
> File에 대한 정보를 나열하는 ls command에 대해 정리

<br>

## 파일, 디렉토리 보기
* 기본적으로 알파벳 순으로 정렬되어 출력
```sh
$ ls
README.md              culture                git
...
```


<br>

## 상세 보기
* `-l`로 파일 상세 정보 출력
```sh
$ ls -l
total 16
-rw-r--r--   1 huekim  staff    11 10 15  2018 README.md
-rw-r--r--@  1 huekim  staff    40 10 15  2018 SUMMARY.md
drwxr-xr-x   4 huekim  staff   128 10 15  2018 ad
drwxr-xr-x   3 huekim  staff    96 10 15  2018 agile
...
```


<br>

## 숨김 파일 보기
* `-a`, `--all`로 모든 숨긴 파일 출력
```sh
$ ls -a
.                      cloud                  fluentd                python
..                     core-os                functional-programming reactive
...
```

<br>

* `-A`, `--almost-all`로 `.`, `..`을 제외한 숨김 파일 출력
```sh
$ ls -A
.git                   culture                go                     security
...
```


<br>

## 파일과 디렉토리 구분
* `-F`, `--classify`로 구분자와 함께 출력
  * `*` - executable
  * `/` - directory
  * `=` - socket
  * `>` - door
  * `@` - symbolic link
  * `|` - FIFO(named pipe)

```sh
$ ls -F
README.md               culture/                test1.sh@               test.sh*
...
```


<br>

## 파일 크기 단위 확인
* `-h`, `--human-readable`를 `-l`과 함께 사용하여 사람이 읽기 쉬운 단위(1K, 234M, 2G)로 출력
```sh
# without -h
$ ls -l
total 16
drwxr-xr-x  43 huekim  staff  1376 10 18  2018 java
drwxr-xr-x   9 huekim  staff   288 10 31  2018 js
...

## with -h
$ ls -lh
total 16
drwxr-xr-x  43 huekim  staff   1.3K 10 18  2018 java
drwxr-xr-x   9 huekim  staff   288B 10 31  2018 js
...
```


<br>

## 시간순 정렬
* `-t`로 최근 수정 시간순으로 정렬하고, `-r`, `--reverse`과 함께 사용하여 시간 역순으로 정렬
```sh
## sort to time
$ ls -lt
total 16
drwxr-xr-x  13 huekim  staff   416 11 22 17:02 aws
drwxr-xr-x  46 huekim  staff  1472 11 20 21:46 linux
drwxr-xr-x  23 huekim  staff   736 11 17 13:27 k8s

## sort in reverse to time
$ ls -ltr
total 16
-rw-r--r--   1 huekim  staff    11 10 15  2018 README.md
-rw-r--r--@  1 huekim  staff    40 10 15  2018 SUMMARY.md
...
```


<br>

## 크기순 정렬
* `-S`로 file size가 큰순으로 정렬
```sh
## sort to file size
$ ls -lS
total 16
drwxr-xr-x  69 huekim  staff  2208  8  4 21:41 spring
drwxr-xr-x  46 huekim  staff  1472 11 20 21:46 linux
...

## sort in reverse to file size
$ ls -lSr
total 16
-rw-r--r--   1 huekim  staff    11 10 15  2018 README.md
-rw-r--r--@  1 huekim  staff    40 10 15  2018 SUMMARY.md
...
```


<br>

## Options
| Option | Description | Usage |
|:--|:--|:--|
| -l | use a long listing format | 상세 보기 |
| -a, --all | do not ignore entries starting with `.` | `.`로 시작하는 숨김 파일 보기 |
| -A, --almost-all | do not list implied `.` and `..` | `.`, `..`를 제외한 숨김 파일 보기 |
| -F, --classify | append indicator(one of `*`, `/`, `=`, `>`, `@`, `|`) to enries | 파일 구분자와 함께 출력 |
| -h, --human-readable | with -l, print sizes in human readable format(e.g. 1L,234M, 2G) | 파일 크기 단위 확인 |
| -t | sort by modification time | 시간순 정렬 |
| -r, --reverse | reverse order while sorting | 역순 정렬 |
| -S | sort by file size | 파일 크기순 정렬 |


<br><br>

> #### Reference
> * [ls - Linux man page](https://linux.die.net/man/1/ls)
