# [Spring] AntPathMatcher
> org.springframework.util.AntPathMatcher 사용법 정리  
> Ant Style Pattern은 [여기](https://github.com/opklnm102/study/blob/master/build/ant/ant_style_pattern.md) 참고

## isPattern()
* `*`, `?`(패턴) 포함 여부
```java
public class AntPatternTest {

    private AntPathMatcher pathMatcher = new AntPathMatcher();

    // *, ?(패턴) 포함 여부
    public void isPattern() throws Exception {
        String a = "/products/*";
        String b = "/products";

        assertThat(pathMatcher.isPattern(a)).isEqualTo(true);
        assertThat(pathMatcher.isPattern(b)).isEqualTo(false);
    }
}
```

## extractUriTemplateVariables()
* `@PathVariable`과 비슷
```java
public void extractUriTemplateVariables() throws Exception {
    String a = "/products/5";
    String b = "/{resource}/{id}";

    Map<String, String> map = pathMatcher.extractUriTemplateVariables(b, a);
    assertThat(map.get("resource")).isEqualTo("products");
    assertThat(map.get("id")).isEqualTo("5");
}
```

## extractPathWithinPattern()
* 패턴과 일치하는 부분 추출
* 일치하는 패턴 이후 문자열은 제거되지 않는다
```java
public void extractPathWithinPattern() throws Exception {
    String source = "/products/5/order";
    String pattern1 = "/products/5/order";
    String pattern2 = "/products/*/order";
    String pattern3 = "/products/5/?rder";
    String pattern4 = "/products/**";

    assertThat(pathMatcher.extractPathWithinPattern(pattern1, source)).isEqualTo("");
    assertThat(pathMatcher.extractPathWithinPattern(pattern2, source)).isEqualTo("5/order");
    assertThat(pathMatcher.extractPathWithinPattern(pattern3, source)).isEqualTo("order");
    assertThat(pathMatcher.extractPathWithinPattern(pattern4, source)).isEqualTo("5/order");

    String pattern = "/a/**/b";
    String source1 = "/a/1/2/b";
    String source2 = "/a/1/2/3/b";
    String source3 = "/a/1/2/3/4/b";

    assertThat(pathMatcher.extractPathWithinPattern(pattern, source1)).isEqualTo("1/2/b");
    assertThat(pathMatcher.extractPathWithinPattern(pattern, source2)).isEqualTo("1/2/3/b");
    assertThat(pathMatcher.extractPathWithinPattern(pattern, source3)).isEqualTo("1/2/3/4/b");
}
```

## combine()
* 패턴 합치기
* `*`은 사라진다
```java
public void combine() throws Exception {
    String str1 = "/test";
    String str2 = "/test2";
    String str3 = "/test3/*";
    String str4 = "/test3/?";
    String str5 = "/test3/**";

    assertThat(pathMatcher.combine(str1, str2)).isEqualTo("/test/test2");
    assertThat(pathMatcher.combine(str3, str1)).isEqualTo("/test3/test");
    assertThat(pathMatcher.combine(str4, str1)).isEqualTo("/test3/?/test");
    assertThat(pathMatcher.combine(str5, str1)).isEqualTo("/test3/**/test");
}
```

## match()
* 패턴과 일치하는지 여부
```java
public void match() throws Exception {
    String pattern = "/products/**/order";
    String source1 = "/products/5/order";
    String source2 = "/products/5/order";
    String source3 = "/products/5/validate/order";

    assertThat(pathMatcher.match(pattern, source1)).isEqualTo(true);
    assertThat(pathMatcher.match(pattern, source2)).isEqualTo(true);
    assertThat(pathMatcher.match(pattern, source3)).isEqualTo(true);
}
```


> #### 참고
> * [[팁] 스프링 AntPathMatcher 사용하기](http://javacan.tistory.com/entry/Tip-Using-Spring-AntPathMatcher)
> * [Spring AntPathMatcher 사용법](http://syaku.tistory.com/297)
