# [Web] CORS with Nginx
> date - 2020.03.10  
> keyword - web, cors, nginx  
> 이론은 [Cross-Origin Resource Sharing](./cors.md)을 참고  
> 여기서는 Nginx에서의 방법만 정리  

<br>

## CORS header
```nginx
http {
  ...
  server {
    ...
    location /my-static-content {
      ...
      
      # Simple requests
      if ($request_method ~* '(GET|POST|HEAD)') {
        add_header 'Access-Control-Allow-Origin' 'https://example.com';  # or '*'
      }

      # Preflighted requests
      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://example.com';  # or '*'
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, HEAD';
        add_header 'Access-Control-Allow-Headers' 'pragma';
        add_header 'Access-Control-Max-Age' 172800;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;

        return 204;
      }
      
      # else...
      try_files $uri =404;
    }
  }
}
```

<br>

* 모든 브라우저에서 `Access-Control-Allow-Origin: *`를 지원하지 않으므로 다중 origin을 지원하려면 origin을 동적으로 생성해야 한다
```nginx
http {
  ...

  # regex와 일치하는 $http_origin을 $cors_allowed_origin로 반환
  map $http_origin $cors_allowed_origin {
    default '';
    ~^http(s)?://(www|www2|cdn|dev)\.example\.com$ $http_origin;
  }

  server {
    ...
    location /my-static-content {
      ...
        
      if ($request_method = 'GET') {
        add_header 'Access-Control-Allow-Origin' $cors_allowed_origin;
      }

      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_allowed_origin;
        add_header 'Access-Control-Allow-Methods' 'GET';
        add_header 'Access-Control-Allow-Headers' 'pragma';
        add_header 'Access-Control-Max-Age' 172800;

        return 204;
      }
      
      # else...
      try_files $uri =404;
    }
  }
}
```


<br><br>

#### Reference
> * [CDN을 통한 CORS 및 CORS 요청 - IBM Cloud 문서](https://cloud.ibm.com/docs/CDN?topic=CDN-cors-and-cors-requests-through-your-cdn&locale=ko)
> * [CORS on Nginx](https://enable-cors.org/server_nginx.html)
