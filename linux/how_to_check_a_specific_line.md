# [Linux] How to check a specific line
> date - 2019.09.02  
> keyworkd - less, head, tail, sed  
> 수백만 줄의 파일이 있을 때 특정 라인부터 보고 싶은 경우가 있을 때 사용할 수 있는 방법 정리  

<br>

## less

### Using g/G command
* `ng` - n번째 행으로 이동(default. 처음 행)
* `nG` - n번째 행으로 이동(default. 마지막 행)

```sh
$ less [file or stdin]

2101g  # move to 2101 line
```

<br>

### Using + option
* n번째 행부터 출력
```sh
$ less +n -N [file or stdin]

## example
$ less +10 -N test.log
10 
11 ll
12 
...

$ less +10 test.log

ll

...
```
* `-N` - enable show line number


<br>

## head & tail
```sh
$ head -n [end line] [file or stdin] | tail -n [start line]

## example - 10 ~ 20번째 행 출력
$ head -20 test.log | tail -10
```
* head로 처음 ~ 20행 출력 후 tail로 20행부터 마지막 10행 출력


<br>

## sed

### 100번째 행 출력
```sh
$ sed -n '100'p [file or stdin]
```

<br>

### 100 ~ 200번째 행 출력
```sh
$ sed -n '100,200'p [file or stdin]
```

<br>

### 100 ~ 마지막 행까지 출력
```sh
$ sed -n '100,$'p [file or stdin]
```

<br>

### 특정 문자열 처음 등장부터 마지막 행 출력
```sh
$ sed -n '/keyword/,$p' [file or stdin]

## example
$ sed -n '/apple/,$p' test.log
```
> `$` 인식 error 발생시 `$` 앞에 `\` 추가

<br>

### 특정 라인 제외하고 출력
```sh
$ sed -e 'n,nd' [file or stdin]

## example
$ sed -e '1,4d' test.log  # exclude 1 ~ 4 line

$ sed -e '1,4d;10,$d' test.log  # exclude 1 ~ 4, 10 ~ last line
```


<br>

## grep

### 2개의 단어 사이의 라인 출력
```sh
$ grep -A[n] 'first word' | grep -B[n] 'last word'

## example
$ cat test.txt
testing


test1

aaa
bbb
ccc

test2

$ cat test.txt | grep -A100 'test1' | grep -B100 'test2'
test1

aaa
bbb
ccc

test2
```


<br>

## awk

### 2개의 단어 사이의 라인 출력
* trigger lines **included**
```sh
## 1
$ awk '/first word/{f=1} /last word/{f=0;print} f'

## 2
$ awk '/first word/{f=1} f; /last word/{f=0}'

## 3
$ awk '/first word/,/last word/'

## example
$ cat test.txt
testing


test1

aaa
bbb
ccc

test2

## 1
$ cat test.txt | awk '/test1/{f=1} /test2/{f=0;print} f'
test1

aaa
bbb
ccc

test2

## 2
$ cat test.txt | awk '/test1/{f=1} f; /test2/{f=0}'
test1

aaa
bbb
ccc

test2

## 3
$ cat test.txt | awk '/test1/,/test2/'
test1

aaa
bbb
ccc

test2
```

<br>

* trigger lines **excluded**
```sh
## 1
$ awk '/first word/{f=1;next} /last word/{f=0} f'

## 2
$ awk '/last word/{f=0} f; /first word/{f=1}'

## example
$ cat test.txt
testing


test1

aaa
bbb
ccc

test2

## 1
$ cat test.txt | awk '/test1/{f=1;next} /test2/{f=0} f'

aaa
bbb
ccc

## 2
$ cat test.txt | awk '/test2/{f=0} f; /test1/{f=1}'

aaa
bbb
ccc

```


<br>

## Conclusion
* 특정 라인만 보고 싶은 경우는 의외로 많고, 여러가지 방법이 있다
* `head` + `tail` 조합보다는 `sed`를 사용하는게 더 간단하고 이해하기 쉽다
* 두 단어 사이의 라인을 구할 때는 `grep`보다는 `awk`가 더 간단하다


<br><br>

> #### Reference
> * [shell last Going to a specific line number using Less in Unix](https://code-examples.net/en/q/830598)
> * [Bash, grep between two lines with specified string](https://stackoverflow.com/questions/22221277/bash-grep-between-two-lines-with-specified-string/22222219)
