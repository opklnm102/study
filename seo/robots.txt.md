# [SEO] About robots.txt
> date - 2019.05.26  
> keyword - seo, robots.txt  
> seo의 방법 중 하나인 robots.txt에 대해 알아보자  

<br>

* 검색 엔진은 자신의 사이트를 사람들에게 알릴 수 있는 가장 좋은 방법 중 하나
* 활용시 고려해야할 점 중 하나는 사이트에 있는 정보를 얼마 만큼 외부에 제공할 것인지 설정하는 것
* 검색 엔진 크롤러는 **robots.txt 파일을 통해 사이트에 대한 정보를 수집**


<br>

## robots.txt??
* 검색 엔진 크롤러에서 사이트에 **요청할 수 있거나 요청할 수 없는 페이지 또는 파일을 크롤러에 지시**하는 파일
* 요청으로 인해 사이트가 오버로드되지 않도록 하는데 주로 사용
* 웹페이지를 숨기는데 사용하는 메커니즘이 아니다
  * 웹페이지를 숨기려면 **비밀번호 보호**나 **NOINDEX 메타 태그 또는 응답 헤더** 사용
* 도메인 root에 `robots.txt`로 저장
  * root의 robots.txt만 체크하기 때문에 하위 경로는 무의미
  * e.g. my.com/robots.txt
* `robots.txt`에 의한 리소스 차단은 [robots.txt 분석 도구](https://support.google.com/webmasters/answer/6062598)로 결과를 확인할 수 있다

<br>

### Google에서는 다음과 같은 형식에 따라 페이지를 숨기는데 사용

| 페이지 유형 | 트래픽 관리 | Google에서 숨김 | 설명 |
|:--|:--|:--|:--|
| 웹 페이지 | O | X | HTML, PDF, Google에서 읽을 수 있는 미디어가 아닌 형식인 경우<br>서버의 부하가 크거나, 중요하지 않거나, 비슷한 페이지가 크롤링되지 않도록 하는 경우 사용<br>페이지를 숨기려면 **비밀번호 보호**나 **NOINDEX 메타 태그 또는 응답 헤더** 사용<br>robots.txt로 차단된 경우 [이와 같이](https://support.google.com/webmasters/answer/7489871) 표시 |
| 미디어 파일 | O | O | 이미지, 동영상 및 오디오 파일 관리 가능<br>다른 페이지에서 미디어 파일로 연결은 가능 |
| 리소스 파일 | O | O | 중요하지 않은 image, script, style sheet 등 리소스 파일 관리 가능 |


<br>

## 제한사항
* robots.txt의 제한 사항을 이해하고 경우에 따라 다른 메커니즘을 고려

### robots.txt는 지침일 뿐
* 잘 제작된 web crawler는 `robots.txt`를 준수하지만 아닌 것도 있다
* 안전하게 보호하려면 **비밀번호 보호**나 **NOINDEX 메타 태그 또는 응답 헤더** 사용

### crawler마다 다르게 인식
* 잘 제작된 web crawler는 `robots.txt`를 준수하지만 아닌 것도 있다

### 다른 사이트에서 연결된 경우 색인이 생성될 수 있다
* 허용되지 않은 URL이 웹상의 다른 곳에 연결된 경우 관련 정보를 찾아 색인을 생성할 수 있다
* URL뿐만 아니라 페이지 링크의 앵커 텍스트 등 기타 정보가 표시될 수 있다
* URL을 숨기려면 **비밀번호 보호**나 **NOINDEX 메타 태그 또는 응답 헤더** 사용



<br>

## Usage

### 사용하는 키워드
* `User-agent` - rule이 적용되는 agent name
* `Disallow` - 차단할 URI
* `Allow` - 허용할 URI

### 모든 crawler의 / 이하 리소스의 접근 차단
```
User-agent: *
Disallow: /
```

### 모든 crawler의 / 이하 리소스의 접근 허용
```
User-agent: *
Allow: /
```

### 모든 crawler의 특정 경로 이하 리소스 접근 차단
* `/users/`, `/tmp/` 이하 리소스의 접근 차단
```
User-agent: *
Disallow: /tmp/
Disallow: /users/
```

### 특정 crawler의 접근 차단
* Yeti bot의 `/` 이하 리소스의 접근 차단
```
User-agent: Yeti
Disallow: /
```

### 특정 형식의 파일 차단
* 모든 gif 차단
```
User-agent: *
Disallow: /*.gif$
```


<br><br>

> #### Reference
> * [robots.txt를 현명하게 사용하는 방법](https://korea.googleblog.com/2008/04/robotstxt.html)
