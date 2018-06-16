# [Nginx] Proxy Pass
> date - 2018.05.06  
> keyword - nginx, proxy pass  
> nginx proxy pass 설정 때문에 `/`가 하나 더 남아(index// 같이..) 삽질했던 경험이 있어서 proxy_pass 설정에 대해 정리


## proxy_pass 설정
* 특정 URI의 요청을 넘기는(pass) 설정
* 뒷단에 backend server(WAS 등)가 존재하는 경우 사용

```sh
http {
    ...
	sever {
        ...
		location / {
			proxy_pass http://localhost:8080;
		}
	}
}
```

## example
* request URI의 원본이 `http://test.com/some/path/page.html`일 경우
```sh
location /some/path/ {
	proxy_pass http://www.example.com/link/;
}
```
* 결과 -> `http://www.example.com/link/page.html`
 
```sh
location /some/path {
	proxy_pass http://www.example.com/link/;
}
```
* 결과 -> `http://www.example.com/link//page.html`


## 정리
* proxy_pass는 원본 URI에서 `matching된 부분을 replace`한다


> #### 참고
> * [NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
