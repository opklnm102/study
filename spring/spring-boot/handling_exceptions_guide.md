# [Spring Boot] Handling Exceptions Guide
> date - 2024.08.04  
> keyworkd - spring boot, exception  
> spring에서 exception 처리에 대한 내용 정리  

<br>

## Exception 3원칙
* Be Specific
* Throw early
* Catch lately

<br>

### Be Specific
* 구체적인 exception을 발생시켜야한다
* `throw new Exception("error message")` 보다는 직접 정의한 exception으로 분류하여 발생시키는 것이 좋다
* exception hierarchy를 구성해두면 catch or exception handler를 구현할 때 편리

<br>

### Throw early
* exception은 발생한 시점에 context를 저장할 수 있다
* context를 저장하는 것은 troubleshooting시 중요한 요소이므로 exception 생성시 반드시 context를 저장해야한다
* context를 저장하기 위해 custom exception을 사용

<br>

### Catch lately
* exception을 처리할 수 있는 곳에서 catch해야한다. 즉 무분별한 `try-catch` 금지
* `checked exception`은 호출한 곳에서 바로 catch or throw 해야하하기 때문에 실패한 model이라고 말한다
* catch & rethrow or method throws에 많은 exception으로 도배하는 원인이므로 catch lately를 위해 catch & rethrow하여 context를 담아 **custom runtime exception으로 변환**하는 것을 추천


<br>

## Anti pattern
* exception을 잘 다루는 방법은 매우 많다. 그러나 대부분 그렇게 하지 않는다. 그렇다면 anti pattern만이라도 잘 피해가자
* best practice 보다 anti pattern만 피해도 90%는 먹고 들어갈 수 있다

<br>

### Never swallow the exception in catch block
* catch block에서 exception을 값으로 반환하면 error context를 찾을 수 없게 된다
```java
catch(CustomException e) {
  return null;
}
```

<br>

### Do not catch the Exception class rather catch specific sub classes
* `Exception`, `RuntimeException` 같은 최상위 exception으로 catch하지 말고 구체적인 exception으로 catch하는 것이 좋다
* 대신 비슷한 exception들은 hierarchy로 묶어주어 세분화된 catch를 하지 않아도 되어서 편리
```java
catch(Exception e) {
  log.error("error message", e);
  throw new CustomException("error message", e);
}
```

<br>

### Always correctly wrap the exceptions in custom exceptions so that stack trace is not lost
* 어디서 발생했는지 알아야 원인도 알 수 있으니 stacktrace를 무시하게 Exception으로 감싸거나 log로 남기지 말자
```java
catch(IllegalArgumentException e) {
  throw new CustomException("error message" + e);
}

catch(IllegalArgumentException e) {
  log.error("error message {}", e);
}
```

<br>

### Log & rethrow
* log가 너무 많아지며 log를 빼면 catch lately 원칙에 따라 왜 catch 했는지를 생각해보자
* checked exception이면 변환하면 되지만, runtime exception이면 잡지 않아도 된다
```java
catch(IllegalArgumentException e) {
  log.error("error message", e);
  throw e;
}
```

<br>

### Never throw any exception from finally block
* `finally`에서 exception이 발생하면 try에서 발생한 exception은 무시된다
```java
try {
   ...
} finally {
  input.close();  // exception이 발생할 수 있음
}
```


<br>

## Exception handling
* spring에서는 exception handling을 위해 다양한 기능을 제공

<br>

### method 별로 exception 처리하기
* method가 많아질수록 `try-catch`로 인한 boilerplate code가 생산되어 좋지 않다
```java
public class MemberController {
  
  @GetMapping("/test")
  public ApiResponse test() {
    try {
      ...
    } catch (Exception e) {
      return ApiResponse.error();
    }
  }

  @GetMapping("/test2")
  public ApiResponse test2() {
    try {
      ...
    } catch (Exception e) {
      return ApiResponse.error();
    }
  }
  ...
}
```

<br>

### controller 별로 exception 처리하기
* controller layer에서 `@ExceptionHandler`을 이용해 exception을 처리할 수 있다
```java
@RestController
public class MemberController {
  ...

  @ExceptionHandler(IllegalArgumentException.class)
  public ApiResponse handleException() {
    ...
  }

  @ExceptionHandler(NullPointerException.class)
  public ApiResponse handleException() {
    ...
  }
}
```

<br>

### ControllerAdvice 사용
* 모든 controller에서 각기 처리할 수 없으니 `@ControllerAdvice` or `@RestControllerAdvice`를 사용하여 공통으로 처리하도록한다
* `ExceptionHandlerExceptionResolver`에 의해 `controller의 @ExceptionHander` -> `ControllerAdvice의 @ExceptionHander`의 우선 순위를 가지게된다
```java
@RestControllerAdvice
public class SimpleExceptionHandler {

  // MethodArgumentNotValidException - @Valid, @Validated로 binding error, @RequestBody, @RequestPart에서 HttpMessageConverter binding 실패시 발생
  // BindException - ModelAttribute로 binding error시 발생
  @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
  public ApiResponse handleException() {
    return ApiResponse.error(e.getBindingResult());
    ...
  }

  // MethodArgumentTypeMismatchException - @RequestParam에서 enum type이 일치하지 않아 binding 실패시 발생
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ApiResponse handleException() {
    ...
  }

  @ExceptionHandler(BaseException.class)
  public ApiResponse handleBaseException() {
    ...
  }
}
```

<br>

### 통일된 error response 사용
* client에서 error 처리를 쉽게하기 위해 항상 동일한 response 사용
```java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {
  private String code;
  private String message;
  private List<FieldError> errors;

  @Getter
  @NoArgsConstructor(access = AccessLevel.PROTECTED)
  public static class FieldError {
    private String field;
    private String value;
    private String reason;
    ...
  }
}

@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
  log.error("handleMethodArgumentNotValidException", e);
  return new ResponseEntity<>(ErrorResponse.of(ErrorCode.INVALI_INPUT_VALUE, e.getBindingResult()), HttpStatus.BAD_REQUEST);
}
```
```json
{
  "code": "C001",  // error에 해당하는 unique code
  "message": " Invalid Input Value",
  "errors": [  // "errors":[], 비어있을 경우 null이 아닌 empty array 사용
    {
      "field": "name.last",
      "value": "",
      "reason": "must not be empty"
    },
    {
      "field": "name.first",
      "value": "",
      "reason": "must not be empty"
    }
  ]
}
```

* ControllerAdvice에서 정의되지 않은 exception이 발생하면 API response의 일관성이 깨지게되므로 `ResponseEntityExceptionHandler`를 상속하거나 `Exception.class`을 잡는 hander 정의하여 해결할 수 있다
```java
public abstract class ResponseEntityExceptionHandler implements MessageSourceAware {
  ...

  @ExceptionHandler({HttpRequestMethodNotSupportedException.class, HttpMediaTypeNotSupportedException.class, HttpMediaTypeNotAcceptableException.class, MissingPathVariableException.class, MissingServletRequestParameterException.class, MissingServletRequestPartException.class, ServletRequestBindingException.class, MethodArgumentNotValidException.class, NoHandlerFoundException.class, AsyncRequestTimeoutException.class, ErrorResponseException.class, ConversionNotSupportedException.class, TypeMismatchException.class, HttpMessageNotReadableException.class, HttpMessageNotWritableException.class, BindException.class})
  @Nullable
  public final ResponseEntity<Object> handleException(Exception ex, WebRequest request) throws Exception {
    if (ex instanceof HttpRequestMethodNotSupportedException subEx) {
      return this.handleHttpRequestMethodNotSupported(subEx, subEx.getHeaders(), subEx.getStatusCode(), request);
    } else if (ex instanceof HttpMediaTypeNotSupportedException subEx) 
    ...
}
```
```java
@RestControllerAdvice
public class SimpleExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ApiResponse handleException() {
    ...
  }

  @Override
  protected ResponseEntity<Object> handleExceptionInternal(Exception exception, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
    return ResponseEntity.internalServerError()
                .body(ApiResponse.error());
  }

  @Override
  protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    return ResponseEntity.badRequest()
                .body(ApiResponse.error()));
  }
}
```

* `Exception.class`을 잡는 hander 정의
```java
@RestControllerAdvice
public class SimpleExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ApiResponse handleExceptionAll() {
    ...
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
    return new ResponseEntity<>(ApiResponse.error());
  }
}
```

* 그러나 spring boot 3.2.0 이하에서는 없는 URI를 사용하면 exception을 발생시키지 않고, 응답하기 때문에 `@ExceptionHandler`가 동작하지 않는다
```json
{
  "timestamp": "2024-08-03T00:15:14.023+09:00",
  "status": 404,
  "error": "Not Found",
  "path": "/test2"
}
```

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
  HttpServletRequest processedRequest = request;
  HandlerExecutionChain mappedHandler = null;
  boolean multipartRequestParsed = false;
  WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

  try {
    try {
      ModelAndView mv = null;
      Exception dispatchException = null;

      try {
        processedRequest = this.checkMultipart(request);
        multipartRequestParsed = processedRequest != request;
        mappedHandler = this.getHandler(processedRequest);
        if (mappedHandler == null) {
          this.noHandlerFound(processedRequest, response);
          return;
        }
        ...
    
protected void noHandlerFound(HttpServletRequest request, HttpServletResponse response) throws Exception {
  if (pageNotFoundLogger.isWarnEnabled()) {
    Log var10000 = pageNotFoundLogger;
    String var10001 = request.getMethod();
    var10000.warn("No mapping for " + var10001 + " " + getRequestUri(request));
  }

  if (this.throwExceptionIfNoHandlerFound) {
    throw new NoHandlerFoundException(request.getMethod(), getRequestUri(request), (new ServletServerHttpRequest(request)).getHeaders());
  } else {
    response.sendError(404);
  }
}
```
* application.yml에 `spring.mvc.throw-exception-if-no-handler-found=true`로 설정하여 exception이 발생하도록 수정
* 3.2.0 이상에서는 `ResourceHttpRequestHandler`가 매핑되어 URI가 매핑되지 않으면 resource를 조회하고 없으면 `NoResourceFoundException` 발생
```java
public class ResourceHttpRequestHandler extends WebContentGenerator implements HttpRequestHandler, EmbeddedValueResolverAware, InitializingBean, CorsConfigurationSource {
  ...
  public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    Resource resource = this.getResource(request);
    if (resource == null) {
      logger.debug("Resource not found");
      throw new NoResourceFoundException(HttpMethod.valueOf(request.getMethod()), getPath(request));
      ...
```
```java
@RestControllerAdvice
public class SimpleExceptionHandler {
  ...
  
  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<ApiResponse<?>> handleNoResourceFoundException(NoResourceFoundException e) {
    return new ResponseEntity<>(ApiResponse.error());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
    return new ResponseEntity<>(ApiResponse.error());
  }
}
```

<br>

### Error Type 정의
* error는 enum으로 모아서 관리하여 중복을 막고, common과 각 domain 별로 나누어 관리한다
```java
@Getter
public enum ErrorType {
  // common
  DEFAULT_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.C001, "An unexpected error has occurred", LogLevel.ERROR),
  NOT_FOUND(HttpStatus.NOT_FOUND, ErrorCode.C002, "Not found", LogLevel.WARN),
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, ErrorCode.C003, "Invalid input value", LogLevel.WARN),

  // member
  EMAIL_DUPLICATION(HttpStatus.BAD_REQUEST, ErrorCode.M001, "Email is duplication", LogLevel.WARN);

  private final HttpStatus status;
  private final ErrorCode code;
  private final String message;
  private final LogLevel logLevel;

  ErrorType(HttpStatus status, ErrorCode code, String message, LogLevel logLevel) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.logLevel = logLevel;
  }
}
```

<br>

### Exception hierarchy
* business를 위한 최상위 exception을 사용하여 hierarchy 구성
```java
RuntimeException
 └── BaseException
      ├── InvalidValueException  // 유효하지 않은 값일 때 exception
      │    ├── CouponAlreadyUseException
      │    └── CouponExpireException
      └── EntityNotFoundException  // entity가 없는 경우
           ├── MemberNotFoundException
           ├── CouponNotFoundException
           └── EmailNotFoundException

@ExceptionHandler(BaseException.class)
public ApiResponse handleException() {
  ...
}
```

<br>

### Multiple try-catch
* exception 발생시 fallback 처리 중 exception이 발생할 경우 같이 연속된 `try-catch`를 사용하게되는데 try-catch에 숨어 있는 fallback을 [vavr](https://vavr-io.github.io) Try를 사용해 `try-reocver`로 readability을 향상

#### without vavr
```java
try {
  return callApi();
} catch (BusinessException e) {
  try {
    return fallback();
  } catch (Exception e2) {
    return "fallback";
  }
} catch (Exception e) {
  return "";
}
```

#### with vavr
```java
// Java 21 이하에서 vavr 사용
return Try.of(() -> callApi())
          .recover(e -> Match(e).of(  // vavr pattern matching
                    Case($(instanceOf(BusinessException.class)), Try.of(() -> fallback())
                                                                   .recover((e1) -> "fallback")
                                                                   .get()),
                    Case($(instanceOf(Exception.class)), "")))
          .get();

// Java 21+
return Try.of(() -> callApi())
          .recover(ex -> switch (ex) {  // switch expression pattern matching
                case BusinessException e -> Try.of(() -> fallback()).recover((e1) -> "fallback").get();
                case Exception e -> "";
                default -> "";
          })
          .get();
```


<br><br>

> #### Reference
> * [Java Exception Handling: 20 Best Practices for Error-Free Code](https://howtodoinjava.com/best-practices/java-exception-handling-best-practices)
