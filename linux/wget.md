# [Linux] wget
> date - 2020.04.18  
> keyworkd - linux, wget  
> wget에 대해서 알아본다  

<br>

## What is wget?
* HTTP, HTTPS, FTP, FTPS를 사용해 파일을 검색할 수 있는 CLI Tool로 단순히 URL을 download 한다
* non-interactive기 때문에 background 작업 가능
* 재시도 및 중단된 부분부터 다시 download하는 등의 느리거나 불안정한 network에서도 동작하도록 설계되었다
```sh
$ wget [options] [url]
```


<br>

## Example

### Simple 
```sh
$ wget https://website.com/files/file.zip
```

<br>

### Download Rename
```sh
$ wget -O download-file.zip https://website.com/files/file.zip
```

<br>

### Limit bandwidth usage
* download bandwidth 제한
```sh
$ wget --limit-rate=200k https://website.com/files/file.zip
```

<br>

### Background working
```sh
$ wget -b https://website.com/files/file.zip
```

<br>

### 5MB download 완료 후 중지 후 다시 시작
```sh
## 5MB만 다운로드
$ wget -Q5m https://website.com/files/file.zip

## continue
$ wget -c https://website.com/files/file.zip
```

<br>

### Usage User Agent
```sh
$ wget --user-agent="Mozilla/x.x...." https://website.com/files/file.zip
```

<br>

### Check remote file
* `spider mode` 사용
```sh
$ wget --spider https://website.com/files/file.ico

Spider mode enabled. Check if remote file exists.
...
HTTP request sent, awaiting response... 200 OK
Length: 6252 (6.1K) [image/x-icon]
Remote file exists.

## file not exist
...
HTTP request sent, awaiting response... 404 Not Found
Remote file does not exist -- broken link!!!
```

<br>

### 재시도 횟수 지정
* `-t`, `--tries` 사용
* default retry는 20
```sh
$ wget --tries=30 https://website.com/files/file.zip
```

<br>

### ftp 계정 정보 사용
```sh
$ wget --ftp-user=[guest] --ftp-password=[password] ftp://ftp.example/file.zip
```

<br>

### log file 남기기
* `-o`, `--output-file` 사용
```sh
$ wget -o download.log https://website.com/files/file.zip
```

<br>

### 특정 파일 타입 제외
* `-R`, `--reject` 사용
```sh
$ wget --reject=gif https://website.com/files/file.zip
```

<br><br>

> #### Reference
> * [Linux wget command](https://www.computerhope.com/unix/wget.htm)
> * [GNU Wget 1.20 Manual](https://www.gnu.org/software/wget/manual/wget.html)
