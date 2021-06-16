# [Nginx] Disable access logging for requests from AWS ELB
> date - 2021.06.16  
> keyworkd - nginx, aws elb  
> AWS ELB의 target group health check traffic을 Nginx가 받을 때 Nginx에서 access logging을 하지 않는 법을 정리  

<br>

## Requirement

### Dependency
* AWS ELB
* Nginx

<br>

## Issue
* Nginx에서 ELB health check traffic에 대한 불필요한 access log가 발생
```sh
10.0.0.xxx - - [06/Nov/2020:15:25:09] "GET / HTTP/1.1" 302 5 "-" "ELB-HealthChecker/1.0" "-"
```

<br>

## Resolve
* 아래의 2가지 방법으로 해결 가능

### 1. User-Agent header를 이용해 ELB를 판단하여 disable access logging
```conf
server {
  ...
  access_log /dev/stdout;

  location = /health {
    if ($http_user_agent ~* '^ELB-HealthChecker\/.*$') {
      access_log off;
    }      

    return 200;
  }
  ...
}
```

<br>

### 2. 모든 health check traffic을 disable access logging
```conf
server {
  ...
  access_log /dev/stdout;

  location = /health {
    access_log off;
    return 200;
  }
  ...
}
```

<br><br>

> #### Reference
> * [AWS ELB Target Group Health Check with nginix](https://sheamunion.com/aws-elb-target-group-health-check-nginx)
