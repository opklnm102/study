
sptring aop

http://jojoldu.tistory.com/72?category=635883


http://heowc.tistory.com/14


http://yookeun.github.io/java/2014/10/01/spring-aop/


https://blog.outsider.ne.kr/843


http://www.baeldung.com/spring-aop


http://ooz.co.kr/193


+ 특정 exception handling 하기


https://stackoverflow.com/a/29575335



aop는 private method에서 동작하지 않는다
https://stackoverflow.com/questions/35299844/how-can-i-log-private-methods-via-spring-aop



http://www.captaindebug.com/2011/09/using-aspectjs-afterthrowing-advice-in.html#.WmcZuJOFgXo


https://www.google.co.kr/search?q=spring+aspect+test&newwindow=1&safe=off&source=lnt&tbs=lr:lang_1ko&lr=lang_ko&sa=X&ved=0ahUKEwjWnZ34zvPYAhUGwbwKHR90DVMQpwUIHQ&biw=1440&bih=826

http://expert0226.tistory.com/203


pointcut 표현식
http://blog.naver.com/PostView.nhn?blogId=chocolleto&logNo=30086024618&categoryNo=29&viewDate=&currentPage=1&listtype=0




AOP 
종단 관심 : 객체란 관련된 정보를 가지고 있다
횡단 관심 : 모든 메소드 호출 전,후에 로그 처리를 하고 싶다

AOP는 횡단관심을 처리해준다

- join point
적용할 위치(횡단 관심)
메소드 시작, 끝
Exception
메소드를 감싸서

- advice
join point에서 실행할 코드

- pointcut
어떤 Advice를 어떤 joinPoint에 적용할지 설정

- Aspect
joinPoint + advice + pointcut(위빙)

- target

### Etc. Argumentresolver
interceptor 다음에 실행된다
메소드 안에 있는 파라미터의 타입을 지원해주는지 확인하여 값을 알아서 넣어주는 기능
Handlermethodargumentresolver를 implements하면 메소드 2개를 오버라이딩 한다
    Handlermethodargumentresolver를 구현하는 클래스를 생성 후 설정에서 Argumentresolver를 추가

```java
public class LoginUserInfoArgumentResolver implements HandlerMethodArgumentResolver {

    // 지원 여부 check
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        Class clazz = parameter.getParameterType();

        // class 정보는 메모리에 1번만 올라가기 때문에 == 으로 비교
        if(clazz == LoginUserInfo.class) {
            return true;
        }
        return false;
    }

    @Override
    public Object resolverArgument(MethodParameter parameter, ModelAndViewContainer, ...) {
        return SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}



```



aspect
여러 클래스에 걸친 관심사의 모듈화
트랜잭션, 로깅 등




join point
메소드의 실행이나 예외처리 같은 프로그램이 실행되는 중이 어떤 지점
spring aop에서는 항상 메소드의 실행



advice
join point에서 aspect가 취하는 행동
around, before, after 등
aop framework는 join point 주위에 interceptor chin을 유지


pointcut
join point를 매칭하는 것(predicate)
advice는 pointcut 표현식과 연결되고
pointcut이 매치한 join point에서 실행된다
ex. 특정 이름의 메소드 실행처럼

pointcut 표현식과 일치하는 join point의 개념은 AOP의 핵심이고, Spring은 기본적으로 AspectJ point cut 표현식 언어를 사용한다




https://heowc.github.io/2018/02/07/spring-boot-aop/



https://sarc.io/index.php/development/1267-aop
https://sarc.io/index.php/development/1265-aop-aspect-oriented-programming-concept




aop test


Aspect에 대한 테스트 방법
일반적으로 하나의 Aspect는 한 영역의 비지니스 로직에서만 국한되어 사용되는 것이 아니라 여러 영역에 걸쳐서 사용된다. AOP에서 말하는 Crosscutting Concern 영역에 대하여 하나의 Aspect로 추출할 경우 그 효과를 극대화할 수 있기 때문이다.
이 같은 이유 때문에 하나의 Aspect를 테스트하는 것은 특정 비지니스 API에 국한되어서 테스트를 진행할 필요는 없을 것으로 생각한다.
이 문서에서는 Aspect를 테스트하기 위한 별도의 인터페이스와 Spring 설정파일을 이용하여 Aspect에 대한 테스트를 진행하는 방법에 대하여 살펴본다.
이 문서에 다루고 있는 대부분의 내용은 Spring 프레임워크가 Spring AOP를 테스트하기 위하여 포함하고 있는 소스 코드를 기반으로 하고 있다. Spring 프레임워크 AOP 소스를 분석하면서 얻게된 지식을 공유하는 수준일 것이다. 나 또한 향후 Aspect에 대한 테스트가 필요할 때 이 문서를 참고하여 테스트를 진행할 생각이다.

[Spring Aspect의 효율적인 테스트 방법](http://www.javajigi.net/pages/viewpage.action?pageId=36208650)





