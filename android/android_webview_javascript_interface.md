# [Android] WebView JavaScript interface
> date - 2018.07.23  
> keyword - android, webview, js interface  
> android webview에서 사용하는 js에서 알 수 없는 window.xxxx.method()를 보고 난 후 이게 어디서 뭐하는건지 궁금해져서 찾아보다 정리

<br>

### 안드로이드 앱의 WebView에서 네이티브 기능이 필요한 경우 사용
* 서버에서 시간이 오래 걸리는 작업을 WebView에서 호출시 화면을 가만히 내버려 두면 UX에 좋지 않기 때문에 네이티브로 ProgressBar정도를 띄우면 좋다
* WebView의 JavascriptInterface Class를 구현하면 된다

 
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    
    mWebView = findViewById(R.id.webview);
    mWebView.loadUrl("example.com");
    mWebView.getSettings().setJavaScriptEnabled(true);  // js 기능 활성화
    mWebView.addJavascriptInterface(new JavaScriptInterface(this), "App");  // App이라는 이름을 통해 js interface 호출할 수 있다
}

// 각각 필요한 기능의 메소드 구현
class JavaScriptInterface {
    private Context mContext;

    JavaScriptInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }
}
```

* js에서 App이라는 js interface를 통해 네이티브 기능 사용 가능
  * WebView에서 네이티브 기능을 사용할 수 있기 때문에 다양한 기능 개발 가능

```javascript
js에서 js interface 호출 코드 추가
function = showToast() {
    window.App.showToast('show toast');
}
```

---

<br>

> #### 참고
> * [안드로이드 웹뷰에서 안드로이드 네이티브 코드 액세스](http://www.kmshack.kr/2013/12/%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EC%9B%B9%EB%B7%B0%EC%97%90%EC%84%9C-%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EB%84%A4%EC%9D%B4%ED%8B%B0%EB%B8%8C-%EC%BD%94%EB%93%9C-%EC%95%A1/)
