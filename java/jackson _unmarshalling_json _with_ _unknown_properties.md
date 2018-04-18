# [Java] Jackson Unmarshalling JSON with Unknown Properties
> jackson으로 Unmarshalling시 겪은 이슈를 정리


## 이슈1. Object를 objectMapper.readValue()로 deserialize 할 수 없다
```java
@Getter
@Setter
class ProductSrc {

    private String name;

    private double price;
}

@Getter
@Setter
class ProductDest {
    private String name;

    private double price;
}

private ObjectMapper objectMapper = new ObjectMapper();

public void test () throws Exception {
    
        ProductSrc product = new ProductSrc();
        product.setName("test");
        product.setPrice(10.0);

        objectMapper.readValue(product, ProductDest.class);  // objectMapper.readValue(Object.class, Class<T>) -> Object는 지원안함
}
```

### 해결
* Object를 변환하려면 `objectMapper.convertValue()` 사용
```java
objectMapper.convertValue(product, ProductDest.class);
```

## 이슈2. Deseriazable할 떄 Class의 필드가 더 적을 때
```java
@Data
class Product {

    private String name;

    private double price;

    private int count;
}

private ObjectMapper objectMapper = new ObjectMapper();

@Test
public void test () throws Exception {
    String json = "{\"count\":4,\"price\":10.0, \"value1\":\"val1\",\"value2\":\"val2\"}";

    objectMapper.readValue(json, Product.class);
}
```
* Seriazable할 때 4개의 필드를 했는데, Deseriazable할 때 3개의 필드를 가지는 Object로 하면 아래의 exception 발생!
   * 모르는 필드를 Deseriazable하려고 했기 때문

```java
com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field "value1" (class io.tbal.promotion.Product), not marked as ignorable (3 known properties: "price", "name", "count"])
 at [Source: {"count":4,"price":10.0, "value1":"val1","value2":"val2"}; line: 1, column: 36] (through reference chain: io.tbal.promotion.Product["value1"])
	at com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException.from(UnrecognizedPropertyException.java:62)
	at com.fasterxml.jackson.databind.DeserializationContext.handleUnknownProperty(DeserializationContext.java:834)
	at com.fasterxml.jackson.databind.deser.std.StdDeserializer.handleUnknownProperty(StdDeserializer.java:1093)
	at com.fasterxml.jackson.databind.deser.BeanDeserializerBase.handleUnknownProperty(BeanDeserializerBase.java:1489)
	at com.fasterxml.jackson.databind.deser.BeanDeserializerBase.handleUnknownVanilla(BeanDeserializerBase.java:1467)
	at com.fasterxml.jackson.databind.deser.BeanDeserializer.vanillaDeserialize(BeanDeserializer.java:282)
	at com.fasterxml.jackson.databind.deser.BeanDeserializer.deserialize(BeanDeserializer.java:140)
	at com.fasterxml.jackson.databind.ObjectMapper._readMapAndClose(ObjectMapper.java:3814)
	at com.fasterxml.jackson.databind.ObjectMapper.readValue(ObjectMapper.java:2858)
	...
```

### 해결
* 아래 2가지 방법 중 하나로 해결할 수 있다

#### 1. deserialize하는 Domain 객체에 @JsonIgnoreProperties(ignoreUnknow = true)로 설정
```java
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
class Product {

    private String name;

    private double price;

    private int count;
}
```

#### 2. ObjectMapper에 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES - false` 설정 추가
```java
private ObjectMapper objectMapper = new ObjectMapper()
		.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```


> #### 참고
> * [Ignoring new fields on JSON objects using Jackson](https://stackoverflow.com/questions/5455014/ignoring-new-fields-on-json-objects-using-jackson)
> * [Jackson Unmarshalling JSON with Unknown Properties](http://www.baeldung.com/jackson-deserialize-json-unknown-properties)
