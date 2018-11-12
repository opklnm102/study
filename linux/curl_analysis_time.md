# [Linux] cURL analysis time
> date - 2018.11.12  
> keyword - curl  
> cURL로 request당 소요 시간을 알고 싶어서 알아본 내용 정리

<br>

## cURL은 output format 기능 제공
* `-w, -write-out <format>`

### 1. format으로 사용할 파일 생성
```
// curl-format.txt
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

### 2. Usage
```sh
$ curl -w "@curl-format.txt" -o /dev/null -s "https://example.com/health"
```
* `-w "@curl-format.txt"` - format 파일 사용
* `-o /dev/null` - output을 /dev/null로 redirect
* `-s` - progress meter를 숨기기

### 3. Result
```
   time_namelookup:  0.001
      time_connect:  0.037
   time_appconnect:  0.000
  time_pretransfer:  0.037
     time_redirect:  0.000
time_starttransfer:  0.092
                   ----------
        time_total:  0.164
```


<br>

## 간단하게 사용하기
```sh
$ curl -X GET -w "%{time_connect} + %{time_starttransfer} = %{time_total}\n" -o /dev/null "https://example.com/health"

0.521 + 0.686 = 1.290
```


<br>

## 30s 간격으로 cURL request time을 저장하는 shell script
* 간단하게 request의 소요시간을 파악할 때 사용할 수 있다
```sh
#!/bin/bash

echo 'start time analysis'
echo 'time_connect | time start transfer | time total |\n' >> ./analysis_health_check.txt

count=0

while [ ${count} -le 30 ]; do
    echo ${count}

    curl -X GET -w "%{time_connect} + %{time_starttransfer} = %{time_total}\n" -o /dev/null https://example.com/health >> ./analysis_health_check.txt

    count=$(( ${count}+1 ))

    sleep 30s
done

echo "done"
```


<br>

> #### Reference
> * [How do I measure request and response times at once using cURL?](https://stackoverflow.com/questions/18215389/how-do-i-measure-request-and-response-times-at-once-using-curl/22625150#22625150)
> * [Timing Details With cURL](https://blog.josephscott.org/2011/10/14/timing-details-with-curl/)
