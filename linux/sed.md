# [Linux] Sed
> date - 2019.02.02  
> keyword - linux, sed  
> 파일의 특정 문자열을 치환할 때 자주 사용하는 sed 명령어에 대해 정리  

<br>

## Sed(Stream EDitor)란?
* 대화형 기능이 없는 stream editor
* 원본 변화 없이 결과를 출력
  * 결과를 저장하려면 리다이렉션을 이용해 저장해야 한다
* 라인들을 하나씩 읽고 출력하기 때문에 버퍼를 사용하지 않아 `파일 크기에 제한없이` 작업 가능


<br>

## Usage
```sh
$ sed '<command>' <source file>

$ echo "1234567" | sed '<command>'
```

### p
* 출력

#### 파일의 특정 라인만 출력
* 숫자 사용
```sh
## 1 ~ 3 라인 출력
$ sed -n '1,3p' <source file>
```

* 정규식 사용
```sh
## Apple, apple을 포함하는 라인 출력
$ sed -n '/[Aa]pple/p' <source file>
```

* 범위를 지정하지 않은 경우, 전체 대상
```sh
sed 'p' <source file>
```


<br>

### d
* 삭제

#### text를 포함하는 라인 삭제
```sh
$ sed '/hello/d' <source file>
```
* `grep -v text <source file>`과 같은 의미

#### 라인 전부 삭제하지 않고 문자열만 삭제하기
* 공백으로 치환하는 방식
```sh
$ sed 's/text//' <source file>
```


<br>

### s
* substitute(치환)

#### 각 라인의 1번째 등장하는 old-text를 new-text로 치환
```sh
$ sed 's/old-text/new-text/' <source file>
```

#### 각 라인의 모든 old-text를 new-text로 치환
* `g`(Global) 옵션 사용
```sh
$ sed 's/old-text/new-text/g' <source file>
```


<br>

### 원본 파일을 수정하려면?
* `-i`(realtime works with file inplace) 사용
```sh
$ sed -i 's/old-text/new-text/g' <source file>

## Mac OS
$ sed -i '' 's/old-text/new-text/g' <source file>
```

* temp file 사용
```sh
#!/bin/bash
# script <source> <old text> <new text>

source=$1
temp_file=${source}.tmp
old_text=$2
new_text=$3

mv ${source} ${temp_file}
cat ${temp_file} | sed 's/${old_text}/${new_text}/' > ${source}
rm ${temp_file}
```


<br>

## Delimiter
* `\`, `newline`을 제외하고 사용 가능하므로 `/var/log` 같은 path를 치환할 때 다음과 같이 사용할 수 있다
```sh
$ sed 's|/var/log|/var/log2|g' <source file>
```

<br><br>

> #### Reference
> * [SED 명령어 사용법](http://stone.backrush.com/sunfaq/ljs007.html)
> * [sed: -i may not be used with stdin on Mac OS X](https://stackoverflow.com/questions/21242932/sed-i-may-not-be-used-with-stdin-on-mac-os-x)
