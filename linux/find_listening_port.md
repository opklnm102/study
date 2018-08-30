# [Linux] Find listening Port
> date - 2018.08.30  
> keyword - linux, find port, lsof, netstat, nmap  
> Amazon Linux AMI에서 Listen 중인 port 찾는 법 정리

<br>

## 1. netstat
```sh
$ netstat -tnlp

(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name   
tcp        0      0 127.0.0.1:25                0.0.0.0:*                   LISTEN      -                   
tcp        0      0 0.0.0.0:46297               0.0.0.0:*                   LISTEN      -                   
tcp        0      0 0.0.0.0:443                 0.0.0.0:*                   LISTEN      22791/nginx         
tcp        0      0 0.0.0.0:111                 0.0.0.0:*                   LISTEN      -                   
tcp        0      0 0.0.0.0:80                  0.0.0.0:*                   LISTEN      22791/nginx         
tcp        0      0 0.0.0.0:22                  0.0.0.0:*                   LISTEN      -                           
tcp        0      0 :::111                      :::*                        LISTEN      -                   
tcp        0      0 :::22                       :::*                        LISTEN      -                   
```

<br>

## 2. lsof
```sh
$ lsof -i -nP   
COMMAND   PID      USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Google    321 ethan.kim  412u  IPv4 0x84124666458493c9      0t0  TCP 172.30.1.30:49438->198.252.206.25:443 (ESTABLISHED)
com.docke 808 ethan.kim   19u  IPv4 0x84124666442013c9      0t0  TCP *:11211 (LISTEN)
com.docke 808 ethan.kim   20u  IPv6 0x841246663dd59339      0t0  TCP [::1]:11211 (LISTEN)
com.docke 808 ethan.kim   25u  IPv4 0x841246663bcee6f9      0t0  UDP *:58396
com.docke 808 ethan.kim   26u  IPv4 0x841246663bdef3f9      0t0  UDP *:51897
...

$ lsof -i -nP | grep LISTEN | awk '{print $(NF-1)" "$1" "$2}' | sort -u
:11211 com.docke 808
*:3306 com.docke 808
*:42235 NTSMagicL 474
*:6379 com.docke 808
[::1]:11211 com.docke 808
[::1]:3306 com.docke 808
[::1]:6379 com.docke 808
```


---

<br>

> #### Reference
> * [리눅스 로컬서버 열린 포트 확인](https://zetawiki.com/wiki/%EB%A6%AC%EB%88%85%EC%8A%A4_%EB%A1%9C%EC%BB%AC%EC%84%9C%EB%B2%84_%EC%97%B4%EB%A6%B0_%ED%8F%AC%ED%8A%B8_%ED%99%95%EC%9D%B8)
