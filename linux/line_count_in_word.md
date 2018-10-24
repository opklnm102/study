# [Linux] Line count 구하기
> date - 2018.10.24  
> keyword - wc, grep  
> 특정 단어가 들어간 라인 수를 구하고 싶을 때 사용할 수 있는 방법 정리  

<br>

* sample data
```
kubernetes
apple banana
banana
a
b
c
d
e
f
g
```

<br>

## wc
```sh
$ wc -l <file name>

# example
$ wc -l test.txt
    9 test.txt

$ wc -l < test.txt
    9
```

<br>

## grep

### match count
```sh
$ grep -w <pattern> -c <file name>

# example
$ grep "a" test.txt
apple banana
banana
a

$ grep "a" -c test.txt
3
```


### invert match count
* `-v` - invert
```sh
$ grep -w <pattern> -c -v <file name>

# example
$ grep "a" -v test.txt
kubernetes
b
c
d
e
f
g

$ grep "a" -c -v test.txt
7
```
