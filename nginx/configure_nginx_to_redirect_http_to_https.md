# [Nginx] Configure nginx to redirect HTTP to HTTPS
> date - 2020.03.23  
> keyword - nginx, redirection  
> 요즘 자주하는 nginx에서 https로 redirection하는 설정에 대해 정리  

<br>

## HTTP request를 HTTPS로 redirection하는 법
```sh
http {
  ...
  server {
    listen 80;
    server_name example.com;

    return 301 https://$host$reqiest_uri;
  }

  server {
    listen 443 ssl;
    server_name example.com;

    ...
  }
}
```

<br>

* 앞단에 AWS ELB(Classic)가 있다면 아래처럼도 할 수 있다
```sh
http {
  ...
  server {
    ...
    if ($http_x_forwarded_proto = 'http') {
      return 301 https://$host$request_uri;
    }
  }
}
```

<br>

## Conclusion
* 앞단에 AWS ALB(Application Load Balancer)를 사용하고 있다면 ALB의 rule set으로 HTTPS로 redirection할 수 있지만 ALB를 사용하지 못한다면 뒷단에 nginx에서 위와 같이 설정하면 HTTPS로 redirection할 수 있다


<br><br>

> #### Reference
> * [Configure nginx to redirect HTTP to HTTPS](https://sheamunion.com/configure-nginx-conf-to-redirect-http-to-https)
