# [Web] favicon.ico
> android WebViewClient의 onReceivedHttpError()에서 발생한 http 404로 인해 겪은 삽질로 favicon에 대해 정리해보고자 함

## 이슈
```java
// android WebViewClient
WebViewClient webViewClient = new WebViewClient() {
    @Override
    public void onPageStarted(final WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        // hide progress and view page
    }

    @Override
    public void onPageFinished(final WebView view, String url) {
        super.onPageFinished(view, url);
        // hide progress and view page
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        // hide progress and view error page
    }

    @RequiresApi(21)
    @Override
    public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
        super.onReceivedHttpError(view, request, errorResponse);
        Log.d(TAG, "[onReceivedHttpError] errorResponse : " + errorResponse.getStatusCode());

        // hide progress and view error page
    }
};
```
* 위 코드에서 web view 로딩 후 onPageFinished()가 호출되어 정상 page가 보인 후, 404로 인해 onReceivedHttpError()에서 error page가 보인다
* 브라우저에서 요청한 favicon에 대해 HTTP 404로 응답이 왔기 때문


## 해결
* 아래 방법 중 하나로 해결
   * root에 favicon.ico 파일 생성
   * Nginx에서 설정 변경
   
### Nginx 설정 변경
* favicon 요청에 항상 HTTP 204로 응답
```sh
...

location = /favicon.ico {
    return 204;

    // disable logging
    access_log off;
    log_not_found off;
}
```

> * favicon location 변경하기
> ```sh
> location = /favicon.ico {
>     alias /image/something.ico
> }
> ```


## favicon이란?
* tab, bookmark를 위해 브라우저에서 사용되는 아이콘
* 웹사이트를 구분하는데 도움을 주고, 사이트 유일한 표식
   * logo 개념
* 브라우저마다 요청하는 시점이 다르다
   * Mozilla Firefox는 페이지가 요청되는 동일한 시점에 요청
   * Internet Explorer는 page가 bookmark로 설정된 경우에만 요청
* 일반적으로 ico 파일 형태로 domain의 root directory에 위치
   * `website.com/favicon.ico`
   * cross browsing 염두한다면 어떠한 HTML 코드도 작성하지 않고, 웹계정 root에 16x16 size의 favicon.ico를 둔다
   * 16x16 ICO 파일 - 모든 브라우저에서 지원하는 표준
* 서로 다른 사이트를 탐색할 때 브라우저에서 favicon을 자동으로 요청
   * 유효한 favicon.ico 파일이 브라우저에 전달되면 아이콘이 표시
   * 위치에 파일이 없으면 HTTP 404로 오며, 아이콘이 표시되지 않는다
   * favicon이 없어도 웹페이지에 영향은 없다


> #### 참고
> * [Mozilla Firefox로 favicon.ico 파일 처리](https://www.ibm.com/support/knowledgecenter/ko/SSELE6_8.0.1.2/com.ibm.isam.doc_8.0.1.2/wrp_config/task/tsk_handl_favicon.html)
> * [파비콘(Favicon)의 모든 것](http://webdir.tistory.com/337)
> * [Nginx rewrite rule for favicon.ico files](https://forum.nginx.org/read.php?2,230375,230401#msg-230401)
