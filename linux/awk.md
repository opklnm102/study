# [Linux] awk - pattern-directed scanning and processing language
> date - 2020.01.03  
> keyword - linux, awk
> 파일에서 패턴 검색에 주로 사용하는 awk에 대해 정리

<br>

## awk란?
* text processing & generating report를 할 수 있는 scripting language
  * variables, numeric functions, string function, logical operators 사용
* 주로 pattern scanning and processing에 사용
  * 하나 이상의 파일을 검색해 지정된 패턴과 일치하는 행을 조작한다


<br>

## Usage
```sh
$ awk [] [-V] [-d[n]] [-F fs] [-v var=value] [prog | -f progfile] file ...

$ awk [options] [program] [input file]
```

<br>

### Options
* `-d[n]`
  * debug mode
  * 1보다 크면 awk가 fatal error시 core를 dump
* `-F fs`
  * file separator 지정
* `-f progfile`
  * awk script 파일을 사용
* `-v var=value`
  * variable를 선언

<br>

### Built in variables in awk
* field variables
  * line을 개별 단어로 분리하여 순서대로 매칭 - $1, $2, $3...
  * entire line - $0
* NR
  * input record(line)의 현재 수를 유지
* NF
  * input record(line)의 field 수를 유지
* FS
  * field separator(default. white space)
* RS
  * record separator(default. newline)
* OFS
  * output field separator(default. white space)
  * output print시 각 field사이에 OFS를 print
* ORS
  * output record separator(default. newline)
  * output print시 각 record 끝에 ORS를 print


<br>

### Example
```sh
## example.txt
$ cat example.txt
ajay manager account 45000
sunil clerk account 25000
varun manager sales 50000
amit manager account 47000
tarun peon sales 15000
deepak clerk sales 23000
sunil peon sales 13000
satvik director purchase 80000
```

<br>

### Default behavior
```sh
$ awk '{print}' example.txt

ajay manager account 45000
sunil clerk account 25000
varun manager sales 50000
amit manager account 47000
tarun peon sales 15000
deepak clerk sales 23000
sunil peon sales 13000
satvik director purchase 80000 
```

<br>

### Print the lines which matches with the given pattern
```sh
$ awk '/manager/ {print}' example.txt

ajay manager account 45000
varun manager sales 50000
amit manager account 47000
```

<br>

### Print the lines which start with the given pattern
```sh
$ awk '/^sunil/' example.txt
sunil clerk account 25000
sunil peon sales 13000
```

<br>

### Splitting a Line into fields
```sh
$ awk '{print $1, $4}' example.txt

ajay 45000
sunil 25000
varun 50000
amit 47000
tarun 15000
deepak 23000
sunil 13000
satvik 80000
```

<br>

### Display line number
```sh
$ awk '{print NR,$0}' example.txt 
1 ajay manager account 45000
2 sunil clerk account 25000
3 varun manager sales 50000
4 amit manager account 47000
5 tarun peon sales 15000
6 deepak clerk sales 23000
7 sunil peon sales 13000
8 satvik director purchase 80000
```

<br>

### Display last field
```sh
$ awk '{print $1,$NF}' example.txt 
ajay 45000
sunil 25000
varun 50000
amit 47000
tarun 15000
deepak 23000
sunil 13000
satvik 80000
```

<br>

### Display line from 3 to 6
```sh
$ awk 'NR==3, NR==6 {print NR,$0}' example.txt 
3 varun manager sales 50000
4 amit manager account 47000
5 tarun peon sales 15000
6 deepak clerk sales 23000
```

<br>

### line number를 separated `-`
```sh
$ awk '{print NR " - " $1}' example.txt
1 - ajay
2 - sunil
3 - varun
4 - amit
5 - tarun
6 - deepak
7 - sunil
8 - satvik
```

<br>

### To print any non empty line if present
```sh
$ awk 'NF > 0' example.txt 
ajay manager account 45000
sunil clerk account 25000
varun manager sales 50000
amit manager account 47000
tarun peon sales 15000
deepak clerk sales 23000
sunil peon sales 13000
satvik director purchase 80000 
```

<br>

### To find the length of the longest line present in the file
```sh
$ awk '{if (length($0) > max) max = length($0)} END {print max}' example.txt 
31
```

<br>

### To count the lines in a file
```sh
$ awk 'END {print NR}' example.txt 
8
```

<br>

### printing lines with more than 30 characters
```sh
$ awk 'length($0) > 30' example.txt
satvik director purchase 80000 
```

<br>

### To find/check for any string in any columns
```sh
$ awk '{ if($3 == "account") print $0;}' example.txt 
ajay manager account 45000
sunil clerk account 25000
amit manager account 47000
```

<br>

### To print the squares of first numbers from 1 to n say 6
```sh
$ awk 'BEGIN { for(i=1; i<=6; i++) print "square of", i, "is",i*i; }'
square of 1 is 1
square of 2 is 4
square of 3 is 9
square of 4 is 16
square of 5 is 25
```

<br>

### Replace field
```sh
$ awk '{$3="account"; print $0}' example.txt 
ajay manager account 45000
sunil clerk account 25000
varun manager account 50000
amit manager account 47000
tarun peon account 15000
deepak clerk account 23000
sunil peon account 13000
satvik director account 80000
```

<br>

### awk preprocessing
```sh
$ awk 'BEGIN {print "The File Contents:"} {print $0}' example.txt 
The File Contents:
ajay manager account 45000
sunil clerk account 25000
varun manager sales 50000
amit manager account 47000
tarun peon sales 15000
deepak clerk sales 23000
sunil peon sales 13000
satvik director purchase 80000 
```

<br>

### awk postprocessing
```sh
$ awk 'BEGIN {print "The file contents:"} {print $0} END {print "File footer"}' exa
mple.txt 
The file contents:
ajay manager account 45000
sunil clerk account 25000
varun manager sales 50000
amit manager account 47000
tarun peon sales 15000
deepak clerk sales 23000
sunil peon sales 13000
satvik director purchase 80000 
File footer
```

<br>

### Use 'or' condition
```sh
$ awk '/^(sunil|amit)/' example.txt 
sunil clerk account 25000
amit manager account 47000
sunil peon sales 13000
```

<br>

### Display white space
```sh
## before
$ awk '{print $2 $3}' example.txt 
manageraccount
clerkaccount
...

## after
$ awk '{print $3, $2}' example.txt
manager account
clerk account
...
```

<br>

### Display number of fields in each line
```sh
$ awk '{print "Number of fields: " NF}' example.txt 
Number of fields: 4
Number of fields: 4
...
```

<br>

### Display line containing specific words in nth field
```sh
$ awk '$3 ~ /acc/ {print $1, $3}' example.txt 
ajay account
sunil account
amit account
```

<br>

### Display line not containing specific words in nth field
```sh
$ awk '$3 !~ /acc/ {print $1, $3}' example.txt
varun sales
tarun sales
deepak sales
sunil sales
satvik purchase
```

<br>

### 1번째 필드가 sunil로 시작하면 is a nice와 함께 출력
```sh
$ awk '$1 ~ /^sunil/ {print $1 " is a nice"}' example.txt
sunil is a nice
sunil is a nice
```

<br>

### 입력 필드를 white space와 :로 구별
```sh
$ awk -F "[ :]" '{print $1,$2}' example.txt
ajay manager
sunil clerk
varun manager
amit manager
tarun peon
deepak clerk
sunil peon
satvik director
```

<br>

### 1번째 필드가 sunil과 같다면 출력
```sh
$ awk '$1 == "sunil"' example.txt
sunil clerk account 25000
sunil peon sales 13000
```

<br>

### 4번째 필드가 45000보다 크면 출력
```sh
$ awk '$4 > 45000 {print $0}' example.txt
varun manager sales 50000
amit manager account 47000
satvik director purchase 80000
```

<br>

### 4번째 필드가 50000보다 크거나 20000보다 작으면 출력
```sh
$ awk '$4 > 50000 || $4 < 20000' example.txt
tarun peon sales 15000
sunil peon sales 13000
satvik director purchase 80000
```


<br><br>

> #### Reference
> * [awk(1) - Linux man page](https://linux.die.net/man/1/awk)
> * [30 Examples For Awk Command In Text Processing](https://likegeeks.com/awk-command/)
