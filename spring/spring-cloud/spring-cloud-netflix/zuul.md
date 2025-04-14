# [Spring Cloud Netflix] Zuul


아래 이슈에 대해서 정리를 해보자







zuul filter랑 인터셉터랑 같이 먹는건가요
줄에 exclude했더니 저장은잘되나 not supported app version으로 응답떨어지길래 인터셉터도 exclude path 넣었더니 404가 떨어지는데. zuul filter vs 기존 interceptor vs 기존 filter들 어느 순서대로 뭐부터 적용되는지 아시는분

luke [6:09 PM]
404면 필터랑 인터셉터는 통과되었는데 그다음 못찾았나보네요

chris [6:16 PM]
zuul 로만 설정해놓으면 줄만 먹는데 interceptor에도 설정하는순간 줄안타고 인터셉터 타서 404나네

chris [6:37 PM]
zuul filter에서 run메소드내에서 return null로 해버리면 bypass 해버리네요.. 기존에 필터 다 안먹히고있었네… 결과는 에러로 내려줘도 백단에선 다 처리되었는듯….
에단 어떻게 된겁니까 당당하게 줄필터걸어놨다더니

ethan [6:54 PM]
https://github.com/spring-cloud/spring-cloud-netflix/issues/541
```RequestContext.getCurrentContext().setSendZuulResponse(false);```
이렇게하면 filter chain을 끊어버린다는데
GitHub
Ability to stop filter chain on condition · Issue #541 · spring-cloud/spring-cloud-netflix
I want to add custom authorization to my zuul based app. I wrote a ZuulFilter that can evaluate the condition but the API design of Zuul does not seem to allow me to get control over the filter cha...

chris [7:10 PM]
library 소스들은 ZuulRuntimeException 식으로 다 던져서 끊고 있는듯 그럼 filter chain부분에서 잡아서 안돌리나봄…



