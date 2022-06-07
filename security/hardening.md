# [Security] Hardening
> date - 2022.06.08  
> keyworkd - security, hardening  
> hardening에 대해 정리  

<br>

## Hardening이란?
* 시스템의 취약점을 줄여 보안을 강화하는 프로세스
* 일반적으로 가진 것이 적어질수록 보안이 견고해진다
  * 보안성은 단일 목적 시스템 > 다목적 시스템

<br>

### Use case
* 외부에 공개된 port 최소화
* 시스템을 유추할 수 있는 상세한 에러 페이지 제거
* 신속한 취약점 패치
* 방화벽을 도입하여 network 통신 제어
* 불필요한 프로그램 제거하여 최소화한다
  * 위와 같은 일련의 작업들은 init script로 실행시킬 수 있다
* 불필요한 권한 제거
* 공용 계정 미사용
* IDS(Intrusion Detection System), IPS(Intrusion Prevention System) 도입
  * IDS - 침입을 탐지
  * IPS - 침입을 탐지하고 차단(IDS + 차단)


<br>

## Conclusion
* 가진 것이 없으면 약점이 없는..? 요즘 느끼는건 아무것도 없는게 보안성이 높은 것 같다


<br><br>

> #### Reference
> * [Hardening (computing)](https://en.wikipedia.org/wiki/Hardening_(computing))
