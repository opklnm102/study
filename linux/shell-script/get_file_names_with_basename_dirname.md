# [Shell Script] Get file names with basename, dirname
> date - 2019.07.30  
> keyword - shell script, basename, dirname  
> shell script에서 자주 사용하는 file name 찾기 등 정리  

<br>

## basename
* 파일명 추출 명령어
* file path에서 **file name + extension** 추출
* GNU core util

```sh
$ basename /etc/conf
conf

$ basename /etc/conf/nginx.conf
nginx.conf
```


<br>

## dirname
* 입력된 path에서 directory를 추출하는 명령어
* 실제 file, directory 존재 유무는 무관

```sh
$ basename /etc/conf
/etc/conf

$ dirname /etc/conf/nginx.conf
/etc/conf
```


<br>

## Get absolute path
```sh
#!/usr/bin/env bash

SRC="$(cd "$(dirname "${0}")" ; pwd )"

# origin path of symbolic link
SRC_OF_SYMBOLIC_LINK="$(cd "$(dirname "${0}")" ; pwd -P)"
```


<br>

## Get relative path
```sh
#!/usr/bin/env bash

RELATIVE_PATH="$(dirname ${0})"
```


<br>

## Get directory name
* absolute path를 얻은 후 맨 뒷부분인 directory name(basename)을 얻는다
```sh
#!/usr/bin/env bash

DIR_NAME="$(basename "$(cd $(dirname "${0}"); pwd -P)")"
```


<br>

## Move to directory of shell script
```sh
#!/usr/bin/env bash

cd $(dirname "${0}")
```


<br>

## Get file name without path
```sh
#!/usr/bin/env bash

# /usr/local/test.sh -> test.sh
FILE_NAME="$(basename ${0})"
```


<br>

## Get file name without extension
```sh
#!/usr/bin/env bash

# /usr/local/test.sh -> test.sh
FILE_NAME_WITH_EXT="$(basename ${0})"

# test.sh -> test
FILE_NAME_WITHOUT_EXT="${FILE_NAME_WITH_EXT%.*}"                                          
```


<br>

## Get extension without filename
```sh
#!/usr/bin/env bash

# /usr/local/test.sh -> test.sh
FILE_NAME_WITH_EXT="$(basename ${0})"

# test.sh -> sh
EXT="${FILE_NAME_WITH_EXT##*.}"
```


<br><br>

> #### Reference
> * [Bash 쉘스크립트 절대경로 얻기](https://zetawiki.com/wiki/Bash_%EC%89%98%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8_%EC%A0%88%EB%8C%80%EA%B2%BD%EB%A1%9C_%EC%96%BB%EA%B8%B0)
> * [How to Extract filename & Extension in Shell Script](https://tecadmin.net/how-to-extract-filename-extension-in-shell-script/)
