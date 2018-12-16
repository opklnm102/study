# [Tip] Semantic Versioning
> date - 2018.12.16  
> keyword - development  
> open source project에서 versioning시 사용하는 Semantic Versioning에 대해 정리  

<br>

## Semantic Versioning이란?
* 버전 번호를 `어떻게 정하고 올려야하는지 명시`하는 규칙과 요구사항 제안
* 의존성 지옥 문제를 해결하기 위한 방법
  * 의존성 높은 시스템에서 사용하던 패키지의 버전업 시도가 매우 어려운 문제가 있다
* `x.y.z`를 자연수로 표현
  * x - Major
  * y - Minor
  * z - Patch
* 기존 버전과 호환되지 않게 API가 변경되면 Major를 올리고
* 기존 버전과 호환되면서 새로운 기능 추가시에는 Minor를 올리고
* 기존 버전과 호환되면서 버그를 수정한 것이라면 Patch를 올린다
* x.y.z 뒤에 pre-release 등의 build metadata를 위한 label을 붙이는 방법도 있다
  * 2.0.6.RELEASE
  * 2.0.6.RC1
  * 2.1.0.M4
  * 1.0.0-alpha
  * 1.0.0-alpha+exp.sha.5114f85
* Major가 0인 `0.y.z`는 초기 개발을 위해서 사용
  * 아무 때나 마음대로 바뀔 수 있다


<br><br>

> #### Reference
> * [Semantic Versioning 2.0.0](https://semver.org/)
> * [spring-projects/spring-boot GitHub Release Note](https://github.com/spring-projects/spring-boot/releases)
