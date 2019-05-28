# [SEO] Block access to your content
> date - 2019.05.28  
> keyword - seo  
> Google 검색엔진에서 site를 표시하지 않는 방법 정리  
> 보통의 검색엔진이라면 통용되는 방법이 아닐까 한다  

<br>

사이트에서 URL을 차단하면 Google이 웹페이지 색인 생성을 중단해 검색결과에 표시하지 않는다

<br>

## Use robots.txt
* [robots.txt](./robots.txt.md) 참고


<br>

## Use noindex meta tags
* `noindex` meta tag를 HTML이나 HTTP response header에 포함
  * 2가지 방법의 효과가 동일하므로 권한과 게시 절차에 따라 더 편리한 방법을 선택하면 된다
* 페이지를 `robots.txt`로 차단하지 않아야 않다
  * 차단하면 `noindex` meta tag를 확인할 수 없어서 다른 페이지가 이 페이지로 연결되는 등의 경우에 계속해서 표시된다
* 페이지별로 access 권한을 관리할 수 있다


<br>

### <meta> tag
```html
<head>
    <meta name="robots" content="noindex">
    ...

    <!-- Google Web Crawler만 차단 -->
    <meta name="googlebot" content="noindex">
</head>
```


<br>

### HTTP response header
* meta tag 대신 `X-Robots-Tag`에 `NOINDEX` 또는 `none`을 반환

```
HTTP/1.1 200 OK
...
R-Robots-Tag: noindex
...
```


<br>

## password protection of web server files
* 서버에서 비밀번호로 보호되는 디렉토리에 저장
* Apache Web Server면 `.htaccess` 파일을 수정


<br>

### Nginx를 사용한다면?
* ID, Password가 담긴 `.htpasswd` 파일을 생성해 `ngx_http_auth_basic_module`에서 사용한다
* Apache HTTP Server 또는 openssl passwd의 `htpasswd` utility 사용
  * MD5 기반 알고리즘 사용

```
# format
name1:password1
name2:password2:comment
name3:password3
```

#### apache2-utils
```
$ apt-get install apache2-utils
$ htpasswd -cm conf/.htpasswd <user name>
New password:
Re-type new password:
Adding password for user <user name>
```
* `-c` - 새로운 파일 생성

#### openssl passwd
```
$ openssl passwd -1
Password:
Verifying - Password:
$1$WmglBMuy$itLqqBCKbPUJnKryIhbTm/
```
* `-1` - Use MD5 based BSD password algorithm 1
* 출력된 암호를 수동으로 htpasswd 파일에 입력


#### Nginx conf
```conf
http {
    # global auth
    auth_basic "message";  # login popup message
    auth_basic_user_file /conf/.htpasswd;  # account info

    server {
        listen 80;
        ...
        # virtual host level auth
        auth_basic "message";  # login popup message
        auth_basic_user_file /conf/.htpasswd

        location /admin/ {
            # location level auth
            auth_basic "message";  # login popup message
            auth_basic_user_file /conf/.htpasswd;
        }
    }
}
```


<br><br>

> #### Reference
> * [URL 차단하는 방법 알아보기](https://support.google.com/webmasters/answer/6062602?hl=ko&ref_topic=4598466)
> * [Module ngx_http_auth_basic_module - Nginx Docs](http://nginx.org/en/docs/http/ngx_http_auth_basic_module.html)
