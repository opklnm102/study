# [Java] MessageFormat.format(), String.format() single quote escaping
> MessageFormat.format()을 사용하여 string pattern에 값을 랜더링하던 중 '의 유무에 따라 다른 결과가 나타나 정리해보고자함

## MessageFormat.format()
```java
// ' 가 없는 경우
System.out.println(MessageFormat.format("{0} {1} {2}", "A", "B", "C"));  // A B C

// ' 가 있는 경우 - 뒤에 있는 {0}에 랜더링이 안된다
System.out.println(MessageFormat.format("{0} ' {1} {2}", "A", "B", "C"));  // A  {1} {2}

// '' 가 있는 경우 - 뒤에 있는 {0}에 랜더링이 된다
System.out.println(MessageFormat.format("{0} '' {1} {2}", "A", "B", "C"));  // A ' B C

// '' 로 감싸져 있는 경우 - {0}에 랜더링이 된다
System.out.println(MessageFormat.format("{0} ' {1} ' {2}", "A", "B", "C"));  // A  {1}  C
```

## String.format()
```java
// ' 가 없는 경우
System.out.println(String.format("%s %s %s", "A", "B", "C"));  // A B C

// ' 가 있는 경우
System.out.println(String.format("%s ' %s %s", "A", "B", "C"));  // A ' B C

// '' 가 있는 경우
System.out.println(String.format("%s '' %s %s", "A", "B", "C"));  // A '' B C

// '' 로 감싸져 있는 경우
System.out.println(String.format("%s ' %s ' %s", "A", "B", "C"));  // A ' B ' C
```


> #### 참고
> * [Single quote escaping in Java resource bundles](https://www.mscharhag.com/java/resource-bundle-single-quote-escaping)
