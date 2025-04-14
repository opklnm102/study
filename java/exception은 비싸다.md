

> 사내에서 pair programming 중 exception은 비싼데 왜 여기저기 사용되고 있는지에 대한 질문을 받은걸 계기로 궁금해져서 정리


과연 exception 을 사용하면 안됄까..?
exception 은 많이 비싼가
-> stacktrace를 출력하기 위해 call stack을 추적하면서 채워나가기 때문에 비싸다...

비싸서 사용하지 않아야 한다면 어떻게 해야할까....?





아래와 같은 경우 과연 어떤게 좋을까...?

```java
public class User {
    public static final User NOT_FOUND = new User();

    ...
}

User user = userRepository.findOne(userId);
if(user == null) {
    throw new NotFoundException();
}

User user = userRepository.findOne(userId);
if(user == null) {
    return null;
}

// sagan
User user = userRepository.findOne(userId);
if(user == null) {
    return User.NOT_FOUND;
}
```

Todo: petclinc 도 참고해보자






https://www.google.co.kr/search?q=java+exception+%EB%B9%84%EC%9A%A9&oq=java+exception+%EB%B9%84%EC%9A%A9&aqs=chrome..69i57.4270j0j7&sourceid=chrome&ie=UTF-8

http://www.nextree.co.kr/p3239/


https://code.i-harness.com/ko/q/8a91b

http://thswave.github.io/java/exception/2015/06/28/exceptions-are-bad.html



https://meetup.nhncloud.com/posts/47


https://jerry92k.tistory.com/42



