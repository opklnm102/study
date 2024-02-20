# [Java] String interpolation with Templates
> date - 2024.02.20  
> keyworkd - java, string, template  
> string templating하기

<br>

## String templates 미사용
string template을 사용하지 않고 string interpolation(string 연결) 방법
* [`+` operator](#1--operator)
* [StringBuffer, StringBuilder](#2-stringbuffer-stringbuilder)
* [String::format, String::formatted](#3-stringformat-stringformatted)
* [java.text.MessageFormat](#4-javatextmessageformat)

<br>

### 1. `+` operator
* 사용하기 단순하지만 `+` operator를 사용할 때마다 새로운 string이 할당된다
```java
var name = "mark";
var age = 20;

var greeting = "Hello " + name + "(" + age + ")";
```

<br>

### 2. StringBuffer, StringBuilder
* 성능이 좋은 `StringBuilder`(`StringBuffer`의 non thread safe 버전) 사용
```java
var greeting = new StringBuilder().append("Hello ")
                                  .append(name)
                                  .append("(")
                                  .append(age)
                                  .append(")")
                                  .toString();
```

<br>

### 3. String::format, String::formatted
* 재사용 가능한 template 사용이 가능하지만 변수를 올바른 순서로 제공해야한다
```java
var format = "Hello %s(%d)";
var greeting = String.format(format, name, age);

// Java 15+
var greeting = format.formatted(name, age);
```

<br>

### 4. java.text.MessageFormat
* `String::format`와 동일한 단점을 가지나 [몇가지 트릭](https://docs.oracle.com/javase/tutorial/i18n/format/choiceFormat.html)이 있다
```java
var greeting = MessageFormat.format("Hello {0}({1})", name, age);


Object[] args = {name, age};
var greeting = MessageFormat.format("Hello {0}({1})", args);
```


<br>

## String templates
```java
var greeting = STR."Hello \{name}(\{age})";

var time = STR."Today is \{java.time.LocalDate.now()}";
```

* multi-line
```java
var json = STR."""
        {
          "name":"\{name}",
          "age":\{age}
        }
        """;
```

* json processor
```java
 // create new template processor
var JSON = StringTemplate.Processor.of((StringTemplate template) -> new JSONObject(template.interpolate()));

var json = JSON."""
            {
              "name":\{name},
              "age":\{age}
           }
           """;
```


<br>

## Apache commons-text
* dependency
```gradle
implementation("org.apache.commons:commons-text:1.11.0")
```

* usage
```java
var params = Map.of("name", "mark", "age", 20);
var greeting = new StringSubstitutor(params).replace("Hello ${name}(${age})");
```

<br>

### json format으로 저장된 parameter를 이용한 templates
```java
public class JsonProcessor {
  private static final ObjectMapper objectMapper;

  static {
    objectMapper = new ObjectMapper();
  }

  private JsonProcessor(){
  }

  public static String toJson(Object object) {
    try {
      return objectMapper.writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new JsonSerializeFailureException(e.getMessage());
    }
  }

  public static <T> T fromJson(String json, Class<T> clazz) {
    try {
      return objectMapper.readValue(json, clazz);
    } catch (JsonProcessingException e) {
      throw new JsonDeserializeFailureException(e.getMessage());
    }
  }

  public static <T> T convertValue(Object object, TypeReference<T> typeRef) {
    return objectMapper.convertValue(object, typeRef);
  }

  public static class JsonDeserializeFailureException extends RuntimeException {
    public JsonDeserializeFailureException(String message) {
      super(message);
    }
  }

  public static class JsonSerializeFailureException extends RuntimeException {
    public JsonSerializeFailureException(String message) {
      super(message);
    }
  }
}
```

```java
@Getter
public enum MessageTemplate {
  HELLO("Hello ${name}", Set.of("name")),
  BYE("Bye ${name}", Set.of("name")),
  WELCOME("Welcome!!", Set.of());

  private final String message;
  private final Set<String> paramNames;

  MessageTemplate(String message, Set<String> paramNames) {
    this.message = message;
    this.paramNames = paramNames;
  }

  public String getMessage(String params) {
    if (paramNames.isEmpty()) {  // template variable 미사용
      return template;
    }
    return new StringSubstitutor(getTemplateParamsMap(params)).replace(message);
  }

  private Map<String, Object> getTemplateParamsMap(String params) {
    if (params == null) {
      throw new IllegalArgumentException("templateParams must not be null");
    }

    var paramsMap = JsonProcessor.fromJson(params, Map.class);
    if (!mustIncludeParameter(paramsMap)) {
      throw new IllegalArgumentException("params must include all paramsNames");
    }
    return paramsMap;
  }

  // 이상한 template variable 검증
  private boolean mustIncludeParameter(Map<String, Object> params) {
    return paramNames.containsAll(params.keySet())
      && paramNames.size() == params.size();
  }
}
```

* usage
```java
// create template variable
var helloParams = Map.of("name", "mark")

// templating
HELLO.getMessage(JsonProcessor.toJson(helloParams));
```

#### reflection을 이용한 template params 검증
```java
@Getter
public class HelloParams {
  private final String name;
  
  @JsonCreator
  public HelloParams(@JsonProperty("name") String name) {
    this.name = name;
  }
}

@Getter
public enum MessageTemplate {
  HELLO("Hello ${name}", HelloParams.class),
  BYE("Bye ${name}", ByeParams.class),
  WELCOME("Welcome!!", null);

  private final String message;
  private final Optional<Class<?>> paramClazz;

  MessageTemplate(String message, Class<?> paramClazz) {
    this.message = message;
    this.paramClazz = Optional.ofNullable(paramClazz);
  }

  public String getMessage(String params) {
    return templateParamClazz.map(clazz -> {
      // 이걸로 인해 필수 필드값이 보장된다.
      var paramsMap = JsonProcessor.fromJson(params, clazz);
      return new StringSubstitutor(JsonProcessor.convertValue(paramsMap, new TypeReference<Map<String, String>>() {})).replace(message);
    })
    .orElse(message);
  }
}
```

* usage
```java
// create template variable
var helloParams = HELLO.getParamClazz().map(clazz -> {
  try {
    return (HelloParams) clazz.getDeclaredConstructor(String.class).newInstance("mark");
  } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
    throw new RuntimeException(e);
  }})
  .orElseThrow(() -> new RuntimeException("paramClazz is not defined"));

// templating
HELLO.getMessage(JsonProcessor.toJson(helloParams));
```

<br><br>

> #### Reference
> * [String Interpolation in Java](https://www.baeldung.com/java-string-interpolation)
> * [String Templates in Java 21](https://www.baeldung.com/java-21-string-templates)
