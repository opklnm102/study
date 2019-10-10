# [Linux] Copy files using scp
> date - 2018.06.22  
> keyword - linux, scp, file copy  
> cloud에서 private subnet의 instance 간에 파일 전송을 위해 사용한 scp에 대해 정리

<br>

## scp
* `로컬 호스트와 원격 호스트` 또는 `두 원격 호스트` 간에 파일을 안전하게 전송할 수 있다
* SSH 프로토콜과 동일한 인증 및 보안을 사용
* 단순성, 보안 및 사전 설치된 가용성으로 인해 많이 사용된다

### Syntax
```sh
$ scp [-12346BCEpqrv] [-c cipher] [-F ssh_config] [-i identity_file] [-l 
limit] [-o ssh_option] [-P port] [-S program] [[user@]host1:]file1 ... [[user@]host2:]file2
```

### options
| 옵션 | 설명 |
|:--|:--|
| -r | 전체 디렉토리를 반복적으로 복사 |
| -C | 압축 가능 |
| -l | 대역폭을 Kbit/s 단위로 제한한다 |
| -o | ssh_config에 사용된 형식으로 ssh에 옵션을 전달 |
| -P | 원격 호스트에 연결할 포트를 지정 |
| -p | 원본 파일에서 수정 시간, 엑세스 시간 및 모드를 유지 |
| -q | Quiet mode <br> ssh의 경고, 진단 메시지, 진행 상태 표시를 비활성화 |
| -v | Verbose mode <br> 진행 상황에 대한 디버깅 메시지 표시 <br> 연결, 인증, 설정 문제를 디버깅하는데 유용 |


<br>

## Usage

### 다른 서버로 복사(보내기)
```sh
$ scp /path/to/source-file user@host:/path/to/destination-folder/

# example
$ scp test.txt ec2-user@172.11.2.113:/home/ec2-user/
```
* test.txt를 172.11.2.113 서버의 /home/ec2-user/ 폴더에 업로드

<br>

### 다른 서버에서 복사(가져오기)
```sh
$ scp user@host:/path/to/source-file /path/to/destination-folder/
```

<br>

### 여러 파일 보내기
```sh
$ scp /path/to/file1 /path/to/file2 user@host:/path/to/destination-folder/
```

<br>

### 특정 타입의 파일 보내기
```sh
$ scp /path/to/folder/*.txt user@host:/path/to/destination-folder/
```

<br>

### 폴더 보내기
```sh
$ scp -r user@host:/path/to/source-folder/ /path/to/destination-folder/

# example
$ scp -r ec2-user@172.11.2.113:/home/ec2-user/test/ /var/test
```

<br>

### 다른 포트 사용
```sh
$ scp -P port user@host:/path/to/source-file /path/to/destination-folder/
```

<br>

### Increase Speed
* scp는 AES-128을 사용하기 때문에 안전하지만 느리다
* 더 빠른 속도를 원한다면 `Blowfish` 또는 `RC4`를 사용
```sh
# blowfish
$ scp -c blowfish user@host:/path/to/source-file /path/to/destination-folder/

# arcfour
$ scp -c arcfour user@host:/path/to/source-file /path/to/destination-folder/
```

<br>

### Increase Security
* 속도는 더 느리지만, 보안성을 향상시키고 싶은 경우
```sh
$ scp -c 3des user@host:/path/to/source-file /path/to/destination-folder/
```

<br>

### Limit Bandwidth
* scp가 사용하는 bandwidth(대역폭)을 제한하고 싶은 경우
```sh
$ scp -l <limit> user@host:/path/to/source-file /path/to/destination-folder/

# example
$ scp -l 150 user@host:/path/to/source-file /path/to/destination-folder/
```

<br>

### Save Bandwidth
* 파일을 압축해서 bandwidth를 절약하고 싶은 경우
```sh
$ scp -C user@host:/path/to/source-file/ /path/to/destination-folder/
```

<br>

### Use IPv4 or IPv6
* IPv4 또는 IPv6를 사용할 경우
```sh
$ scp -4 user@host:/path/to/source-file/ /path/to/destination-folder/

$ scp -6 user@host:/path/to/source-file/ /path/to/destination-folder/
```

<br>

### Permission denied (publickey) 발생시
* `-i` 사용
```sh
$ scp -i [public key path] user@host:/path/to/source-file/ /path/to/destination-folder/
```


<br><br>

> #### Reference
> * [리눅스 scp 사용법](https://zetawiki.com/wiki/%EB%A6%AC%EB%88%85%EC%8A%A4_scp_%EC%82%AC%EC%9A%A9%EB%B2%95)
> * [scp command Tutorial](https://www.garron.me/en/articles/scp.html)
