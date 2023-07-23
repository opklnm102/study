# [Spring Boot] Reuse inputstream in HttpServletRequest
> date - 2023.07.23  
> keyworkd - spring boot, request, input stream  
> HttpServletRequest는 body를 읽기 위해 getInputStream()을 제공하는 interface로 InputStream은 1번만 읽을 수 있다  
> logging을 위해 filter에서 body를 읽을 경우 filter chain의 이후 filter에서 더 이상 사용할 수 없기 때문에 request body의 InputStream을 여러번 사용할 수 있는 방법을 알아본다  

<br>

## ContentCachingRequestWrapper
* Spring에서는 body를 여러번 읽을 수 있는 `getContentAsByteArray()`를 구현한 `ContentCachingRequestWrapper`, `ContentCachingResponseWrapper`를 제공
```java
public class ContentCachingRequestWrapper extends HttpServletRequestWrapper {

  private final ByteArrayOutputStream cachedContent;
  private final Integer contentCacheLimit;
  ...
  
  public ContentCachingRequestWrapper(HttpServletRequest request) {
    super(request);
	int contentLength = request.getContentLength();
	this.cachedContent = new ByteArrayOutputStream(contentLength >= 0 ? contentLength : 1024);
	this.contentCacheLimit = null;
  }
  ...
  public byte[] getContentAsByteArray() {
    return this.cachedContent.toByteArray();
  }
}
```

* Usage
```java
@Slf4j
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

  public RequestResponseLoggingFilter() {
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    long startTime = System.currentTimeMillis();

    var wrappedRequest = new ContentCachingRequestWrapper(request);
    var wrappedResponse = new ContentCachingResponseWrapper(response);

    filterChain.doFilter(wrappedRequest, wrappedResponse);
    long duration = System.currentTimeMillis() - startTime;

    byte[] requestBody = wrappedRequest.getContentAsByteArray();
    byte[] responseBody = wrappedResponse.getContentAsByteArray();

    log.debug("duration : {}ms, requestBody : {}, responseBody : {}", duration, new String(requestBody, StandardCharsets.UTF_8), new String(responseBody, StandardCharsets.UTF_8));
    wrappedResponse.copyBodyToResponse();
  }
}
```


<br>

## CachedBodyHttpServletRequest
* `ContentCachingRequestWrapper`는 `getInputStream()`, `getReader()`를 사용해 body를 여러번 읽을 수 없으므로 어딘가에서 InputStream을 읽으면 이후 코드에서는 더 이상 읽을 수 없다
* 그렇다고 모든 구현체를 `getContentAsByteArray()`를 사용하도록 수정할 수는 없으므로 HttpServletRequest의 모든 method를 override할 필요 없는 `HttpServletRequestWrapper`을 확장하여 InputStream을 재사용한다
```java
final public class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {

  @NotNull
  private final byte[] cachedBody;

  public CachedBodyHttpServletRequest(@NotNull HttpServletRequest request) throws IOException {
    super(request);
    this.cachedBody = StreamUtils.copyToByteArray(request.getInputStream());
  }

  @Override
  public @NotNull ServletInputStream getInputStream() {
    return new CachedBodyServletInputStream(this.cachedBody);
  }

  @Override
  public @NotNull BufferedReader getReader() {
    return new BufferedReader(new InputStreamReader(new ByteArrayInputStream(this.cachedBody), StandardCharsets.UTF_8));
  }
}

final class CachedBodyServletInputStream extends ServletInputStream {

  @NotNull
  private final InputStream cachedBodyInputStream;

  public CachedBodyServletInputStream(@NotNull final byte[] cachedBody) {
    this.cachedBodyInputStream = new ByteArrayInputStream(cachedBody);
  }

  @Override
  @SuppressWarnings("EmptyCatch")
  public boolean isFinished() {
    try {
      return cachedBodyInputStream.available() == 0;
    } catch (IOException e) {
    }
    return false;
  }

  @Override
  public boolean isReady() {
    return true;
  }

  @Override
  public void setReadListener(@Nullable final ReadListener readListener) {
    throw new UnsupportedOperationException();
  }

  @Override
  public int read() throws IOException {
    return cachedBodyInputStream.read();
  }

  @Override
  public int read(@NotNull byte[] b, int off, int len) throws IOException {
    return cachedBodyInputStream.read(b, off, len);
  }
}
```

* Usage
```java
var wrappedRequest = new CachedBodyHttpServletRequest(request);
filterChain.doFilter(wrappedRequest, response);
```


<br>

## request.getParameter()
* POST로 `application/x-www-form-urlencoded` content type을 사용하면 request.getParameter()로 binding한다
* tomcat의 request.getParameter()는 request의 raw data를 파싱하는데 InputStream을 비워버리면 이후에는 읽을 수 없게되어 `@ModelAttribute`로 바인딩하지 못한다
* body의 raw data를 들고 있다가 lazy loading으로 parameter를 파싱하므로 getParameter()를 위해 override 필요
```java
final public class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {

  private final byte[] cachedBody;
  private final Map<String, String[]> copiedParameters;

  public CachedBodyHttpServletRequest(@NotNull HttpServletRequest request) throws IOException {
    super(request);
    this.cachedBody = StreamUtils.copyToByteArray(request.getInputStream());
    this.copiedParameters = new HashMap<>(request.getParameterMap());
  }

  @Override
  public @NotNull ServletInputStream getInputStream() {
    return new CachedBodyServletInputStream(this.cachedBody);
  }

  @Override
  public @NotNull BufferedReader getReader() {
    return new BufferedReader(new InputStreamReader(new ByteArrayInputStream(this.cachedBody), StandardCharsets.UTF_8));
  }

  @Override
  public String getParameter(String name) {
    String[] values = copiedParameters.get(name);
    if (values != null && values.length > 0) {
      return values[0];
    }
    return null;
  }

  @Override
  public Map<String, String[]> getParameterMap() {
    return Collections.unmodifiableMap(copiedParameters);
  }

  @Override
  public Enumeration<String> getParameterNames() {
    return Collections.enumeration(copiedParameters.keySet());
  }

  @Override
  public String[] getParameterValues(String name) {
    return copiedParameters.get(name);
  }
}
```

<br><br>

> #### Reference
> * [Reading HttpServletRequest Multiple Times in Spring](https://www.baeldung.com/spring-reading-httpservletrequest-multiple-times)
