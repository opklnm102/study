





CGLib
CGLIB는 코드 생성 라이브러리로서(Code Generator Library) 런타임에 동적으로 자바 클래스의 프록시를 생성해주는 기능을 제공한다. CGLIB를 사용하면 매우 쉽게 프록시 객체를 생성할 수 있으며, 성능 또한 우수하다. 더불어, 인터페이스가 아닌 클래스에 대해서 동적 프록시를 생성할 수 있기 때문에 다양한 프로젝트에서 널리 사용되고 있다. 예를 들어, Hibernate는 자바빈 객체에 대한 프록시를 생성할 때 CGLIB를 사용하며, Spring은 프록시 기반의 AOP를 구현할 때 CGLIB를 사용하고 있다.



spring aop proxy
http://wonwoo.ml/index.php/post/1576










JDK Dynamic Proxy & CGLIB

Aspect 프레임워크와는 달리 스프링에서는 간단한 설정만으로 JDK Dynamic Proxy와 CGLIB 방식을 사용할 수 있도록 되어 있습니다. 
두 방식의 차이는 인터페이스의 유무로서, AOP의 타깃이 되는 클래스가 인터페이스를 구현했다면 JDK Dynamic Proxy를 사용하고, 구현하지 않았다면 CGLIB 방식을 사용합니다. 
기본적인 방침은 이러하나 사용자가 어떻게 설정하느냐에 따라서 인터페이스를 구현했다 하더라도 CGLIB방식을 강제하거나 AspectJ를 사용할 수 있습니다.






cglib proxy
subcalss based proxies

jdk proxy
interface based proxies

targetproxy = true -> cglib 사용
indicate whether subclass-based (CGLIB) proxies are to be created as opposed to standard Java interface-based proxies.






jdk proxy 쓰다가(interface로 쓰다가) cglib proxy를 사용하게 했을 경우
기존에 interface 기반으로 호출하여 proxy 걸리던것들도 제대로 동작하는가...??





