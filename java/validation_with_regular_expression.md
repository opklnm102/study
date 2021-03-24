# [Java] Validation with regular expression
> date - 2021.03.24  
> keyworkd - regular pression  
> 모든 input에는 의도되지 않은 input에 대한 오류를 방지하기 위해 적절한 유효성 검사가 필요하고, 의도되지 않은 input이라면 alert을 통해 의도된 input으로 유도해야 한다  
> 다양한 패턴의 input data에 대한 유효성 검사에 유용한 정규식을 Java로 정리해본다  

<br>

## Regular Expression이란?
* 주어진 문자열에서 발견할 수 있는 글자 패턴을 표현한 식
* `검색`과 `치환`을 통한 문자열 처리 가능

<br>

### Usecase
* 각각 다른 포맷으로 저장된 전화번호 데이터를 추출할 때
* email, 휴대폰 번호, IP 등의 input data를 검증할 때
* etc...

<br>

### Escape
정규식은 몇몇 특수 문자를 예약어로 사용
특수 문자를 그대로 사용하고 싶다면 `\`를 사용
```
/\*/
/\?/
/\./
/\\/
```

<br>

### Flags

#### g(global)
* 모든 것을 검색한다
* `g`가 없다면 1번째 결과에만 적용
```
/$/g
/a/g
```

#### m(multiline)
* 각 줄별로 검색
```
/$/gm
/a/m
```

#### i(case insensitive)
* 대소문자 구분하지 않음
```
/a/gi
```

<br>

### Meta Character

#### []
* 긍정 문자 그룹(character set)
* 내부의 문자열 중 하나라도 일치하는 경우
```
/[?!.]/g
/[a]/g
```

* 연속된 문자열에는 `-`를 사용
```
/[0-9]/  # == /[0123456789]/
/[A-Z]/  # == /[ABCDEFGHIJKLNMOPQRSTUVWXYZ]/
/[a-z]/  # == /[abcdefghijklnmopqrstuvwxyz]/
/[A-Za-z0-9]/
```

#### [^]
* 부정 문자 그룹(character set)
* `[]`의 반대
```
/[^A-Z]/  # A ~ Z를 제외
```

##### \d
* 10진수(digit character)
* `[0-9]`와 동일한 의미
```
/\d/g
```

#### \w
* 단어 문자(word character)
* `[0-9a-zA-Z_]`와 동일한 의미
* `\W`는 `\w`의 반대
```
/w/g
```

#### \s
* 공백 문자(whitespace character)
* `\S`는 `\s`의 반대
```
/\s/g
```

#### .
* 임의의 문자(any character)
* 개행 문자를 제외한 모든 단일 문자를 의미
```
/./g
```

#### ^, $
* 앵커(Anchor)
* 어떤 위치에서 동작할지 제한하는 의미
* `^`
  * 패턴 시작 앵커
  * 해당 정규식이 줄의 시작
  * 보통 가장 앞에 붙여서 사용
* `$`
  * 패턴 종료 앵커
  * 해당 정규식이 줄의 마지막
  * 보통 마지막에 붙여서 사용

```
/^W/
/w$/
```

#### \b
* 단어 경계(word boundaries)
* `\w`가 앞, 뒤에 등장하지 않는 위치를 의미
```
/\bapple\b/g  # apple 좌우로 단어가 없는 것
/apple\b/g  # apple 우측에 단어가 없는 것
```

#### |
* 교체 구문(Alternation)
* or를 의미
```
/red|blue/g
```

<br>

### Quantifier
* meta character들이 N회 반복됨을 나타내는 의미

#### {n}
* 정확히 n번
```
/a{1}b/  # ab, abc
```

#### {n,m}, {n,m}?
* n번 이상 n번 이하
```
/a{1,3}/
/a{1,3}?/
```

#### {n,}, {n,}?
* 최소 n번 일치
```
/a{1,}/
/a{1,}?/
``` 
#### ?, ??
* 0 또는 1번 반복
```
/aa?/
/aa??/
``` 
#### +
* 1번 이상 반복
```
/a+/
/a+?/
``` 

#### *
* 0번 이상 반복
```
/a*/
/a*?/
``` 

#### (x)
* Grouping
* 특정 부분을 그룹화
```
/ab+/g  # ab, abb, abbb
/(ab)+/g  # ab, abab, ababc
```

#### (x), \n
* Captureing
* `()`로 grouping된 정규식이 `\1`, `\2` 같은 임시 변수에 저장되어 참조
```
/(a)(b)\1\2/  # == /abab/
```

#### (?:x)
* captureing하지 않고 grouping
```
/(?:ab)+/g
```


<br>

## How to use regular expressions in Java
* `java.util.regex.Pattern` 사용
```java
import java.util.regex.Pattern;

    ...
    public boolean validate(String input) {
        return Pattern.matches("^[0-9]*$", input);
    }
```

* `String.matches()` 사용
```java
public boolean validate(String input) {
    if(input == null || input.isEmpty()){
        return false;
    }

    return input.matches("\\d{2,3}-?\\d{3,4}-?\\d{4}");
}

// String.matches()는 java.util.regex.Pattern을 wrapping한 것
public boolean matches(String regex) {
    return Pattern.matches(regex, this);
}
```

<br>

### Example
```java
// 숫자 검사
public boolean validateNumeric(String input) {
    return Pattern.matches("^[0-9]*$", input);
}

// 영어
public boolean validateAlphabet(String input) {
    return Pattern.matches("^[a-zA-Z]*$", input);
}

// 영어, 숫자
public boolean validateAlphabetNumeric(String input) {
    return Pattern.matches("^[a-zA-Z0-9]*$", input);
}

// 대문자
public boolean validateUppercase(String input) {
    return Pattern.matches("^[A-Z]*$", input);
}

// 소문자
public boolean validateLowercase(String input) {
    return Pattern.matches("^[a-z]*$", input);
}

// -없는 phone number
public boolean validatePhoneNumber(String input) {
    if(input == null || input.isEmpty()){
        return false;
    }
    return Pattern.matches("^\\d{2,3}\\d{3,4}\\d{4}$", input);
}

// - 여부 상관 없는 phone number
public boolean validatePhoneNumberHyphen(String input) {
    return Pattern.matches("^(01[016789]|02|0[3-9][0-9])-?\\d{3,4}-?\\d{4}$", input);
}
```


<br>

## Conclusion
* 복잡한 문자열 검색시에 regular expression을 유용하게 사용할 수 있다
* regular expression은 성능상 이슈가 있기 때문에 적절하게 사용해야 한다


<br><br>

> #### Reference
> * [정규 표현식 - MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Regular_Expressions)
> * [Regex tutorial — A quick cheatsheet by examples](https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285)
