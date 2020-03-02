# [Linux] cURL analysis time
> date - 2018.11.12  
> keyword - curl  
> cURL로 request당 소요 시간을 알고 싶어서 알아본 내용 정리

<br>

## cURL은 output format 기능 제공
* `-w, --write-out <format>`
```sh
$ curl -w "format" example.com
```

<br>

### Available variables
* content_type
* filename_effective
* ftp_entry_path
* http_code
* http_connect
* http_version
* local_ip
* local_port
* num_connects
* num_redirects
* proxy_ssl_verify_result
* redirect_url
* remote_ip
* remote_port
* scheme
* size_download
* size_header
* size_request
* size_upload
* speed_download
* speed_upload
* ssl_verify_result
* time_appconnect
* time_connect
* time_namelookup
* time_pretransfer
* time_redirect
* time_starttransfer
* time_total
* url_effective


<br>

## 파일로 사용하기

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

   time_namelookup:  0.001
      time_connect:  0.037
   time_appconnect:  0.000
  time_pretransfer:  0.037
     time_redirect:  0.000
time_starttransfer:  0.092
                   ----------
        time_total:  0.164
```
* `-w "@curl-format.txt"` - format 파일 사용
* `-o /dev/null` - output을 /dev/null로 redirect
* `-s` - progress meter를 숨기기


<br>

## 간단하게 사용하기
```sh
$ curl -X GET -w "%{time_connect} + %{time_starttransfer} = %{time_total}\n" -o /dev/null -s "https://example.com/health"

0.521 + 0.686 = 1.290
```


<br>

## Dynamic URLs

### Use [] for range
```sh
$ curl -X GET -o /dev/null -s -A "Tutorial" \
       -w "%{time_connect} %{time_total} %{http_code}\n" \
       "https://example.com/search?q=[1985-1990]"

0.038920, 1.455014, 200
0.060511, 1.265630, 200
0.034201, 1.265591, 200
0.000021, 1.167387, 200
0.037440, 1.167555, 200
0.036251, 1.162001, 200
```

<br>

### Use {} for set
```sh
$ curl -X GET -o /dev/null -s -A "Tutorial" \
       -w "%{time_connect} %{time_total} %{http_code}\n" \
       "https://example.com/search?q={apple,banana}"

0.038075, 1.247196, 200
0.062678, 1.246283, 200
```


<br>

## Timeouts
* `curl`로 request시 timeout이 발생하면 무한정 기다리지 않게 하기 위해 사용
  * `--connect-timeout`
  * `--max-time`
  * `--expect100-timeout`
  * `--keepalive-time`
  * `--ready-delay`
  * `--retry-max-time`

```sh
$ curl -X GET -o /dev/null -s -A "Tutorial" \
       -w "%{time_connect} %{time_total} %{http_code}\n" \
       --connect-timeout 15 --max-time 30
       "https://example.com/search?q={apple,banana}"

0.038463, 0.762615, 200
```


<br>

## Parallel cURL Testing
* `xargs` 사용
  * `-P` - Parallel count
  * `-n` - 각 실행마다 전달되는 parameter count limit
  * `-c` - 각 실행에 전달될 명령
* `seq`로 sequence 생성

```sh
$ seq 1 3 | xargs -n1 -P3 bash -c 'curl example.com -o /dev/null -s -w "%{time_total}\n"'

0.026280
0.026595
0.027071
```


<br>

## Usage

### 30s 마다 cURL request time 저장
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

### cURL average request time 구하기
* sequence하게 동작하므로 횟수가 많아질수록 오래 걸린다
```sh
#!/usr/bin/env bash

function usage() {
  echo "Usage: $0 url count"
  echo "Example: $0 example.com 10"
}

if [ $# -ne 2 ]; then
  usage;
  exit;
fi

START_TIME=$SECONDS

URL=$1
COUNT=$2
TOTAL_TIME=0

let i=$COUNT-1
while [ $i -ge 0 ]; do
  RESPONSE=$(curl -w "$i: %{time_total}\n" -o /dev/null -s "${URL}")\
  RESPONSE_TIME=$(echo "${RESPONSE}" | cut -f2 -d ' ')
  TOTAL_TIME=$(echo "scale=3; ${TOTAL_TIME}+${RESPONSE_TIME}" | bc)

  let i=i-1
done

AVERAGE_TIME=$(echo "scale=3; ${TOTAL_TIME}/${COUNT}" | bc)
echo "--------------------------------"
echo "Average: ${TOTAL_TIME} / ${COUNT} = ${AVERAGE_TIME}"

ELAPSED_TIME=$(($SECONDS - $START_TIME))
echo "elapsed time: ${ELAPSED_TIME}"
```

* result
```sh
$ ./performance-analysis.sh https://cdn.dailyhotel.com/index.html 100
--------------------------------
Average: 18.146420 / 100 = .181
elapsed time: 23
```

<br>

### cURL average request time 구하기 with parallel
* paralle하게 동작하므로 빠르다
```sh
#!/usr/bin/env bash

function usage() {
  echo "Usage: $0 url count"
  echo "Example: $0 example.com 10"
}

if [ $# -ne 2 ]; then
  usage;
  exit;
fi

START_TIME=$SECONDS

export URL=$1
COUNT=$2
TOTAL_TIME=0

for RESPONSE_TIME in $(seq 1 ${COUNT} | xargs -n1 -P3 bash -c 'curl -o /dev/null -s -w "%{time_total}\n" ${URL}'); do
  TOTAL_TIME=$(echo "scale=3; ${TOTAL_TIME} + ${RESPONSE_TIME}" | bc)
done

AVERAGE_TIME=$(echo "scale=3; ${TOTAL_TIME}/${COUNT}" | bc)
echo "--------------------------------"
echo "Average: ${TOTAL_TIME} / ${COUNT} = ${AVERAGE_TIME}"

ELAPSED_TIME=$(($SECONDS - $START_TIME))
echo "elapsed time: ${ELAPSED_TIME}"
```

* result
```sh
$ ./performance-analysis-parallel.sh https://example.com 100
--------------------------------
Average: 10.642753 / 100 = .106
elapsed time: 5
```


<br><br>

> #### Reference
> * [How do I measure request and response times at once using cURL?](https://stackoverflow.com/questions/18215389/how-do-i-measure-request-and-response-times-at-once-using-curl/22625150#22625150)
> * [Timing Details With cURL](https://blog.josephscott.org/2011/10/14/timing-details-with-curl/)
> * [Performance Testing with cURL, Part 1: Basic](https://www.badunetworks.com/performance-testing-curl-part-1-basics/)
> * [Performance Testing with cURL, Part 2: Scripting](https://www.badunetworks.com/performance-testing-curl-part-2-scripting/)
