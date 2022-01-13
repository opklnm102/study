# [Observability] What is observability
> date - 2022.01.13  
> keyworkd - observability  
> observability에 대해 정리

<br>

## Observability?
* the ability to understand the current state of system using only its external outputs
* 시스템에서 이전에 없었던(한 번도 겪어보지 못한) 현상이 생기더라도 이를 이해라고 설명할 수 있는 척도
* MSA로 분산 처리가 기본이 된 Cloud Native Application에서 root cause를 효율적으로 찾아가기 위한 모니터링 방법론
* root cause(원인 파악, What & Why)에 초점
* metrics, traces, logs을 기반으로 전체적인 상황 제공
  * metrics
    * 주기적으로 특정 값을 측정한 데이터
    * e.g. 매 10초마다 CPU 사용률을 측정해서 기록
  * traces(distributed traces)
    * application에서 일어나는 활동을 기록한 데이터
    * 각 트랜잭션 마다 관련된 모든 서비스와 세부 실행 시간을 추적
  * logs(access Logs)
    * 특정 이벤트가 발생할 때마다 생성되는 데이터
    * 각 로그는 **어떤일**이 일어났는지 기록

<br>

### observability를 가지기 위한 조건
* 시스템 내부의 동작을 이해함
* 시스템의 모든 상태를 이해함
* 외부 툴을 이용한 관측만으로 system의 내부 동작과 상태를 이해함
* 시스템 상태가 극단적이든 비정상이든 상관없이 이해함

<br>

## Monitoring vs Observability
### Monitoring
* 어떤 것이 문제라는 기준을 기반으로 수행 
* metrics 수집, 분석
* metrics의 조합으로 트렌드를 개략적으로 보기 위해 dashboard 생성
* 문제의 기준으로 alert 생성

<br>

### Observability
* 숨겨진 이슈를 찾아내는게 중요
* log, metrics, event, trace 등 흩어진 서로 다른 정보들을 한곳으로 모아 연관성을 파악할 수 있어야 한다
* 시스템을 한눈에 파악할 수 있는 능력을 갖추어 visibility 확보
* MSA로 복잡성이 증가한 시스템을 위해 visibility 필요
  * 단일 트랜잭션 처리를 위해 여러 개의 서비스를 경유
  * 트랜잭션이 처리되는 일련의 과정을 볼 수 있어야 어디서부터 잘못된 건지, 무엇을 개선해야 할지 파악할 수 있다
  * 잠재된 위험 요소가 어디에 있든지 간에 신속하게 감지하고 실시간으로 대응할 수 있어야 한다


<br><br>

> #### Reference
> * [Observability - Istio Docs](https://istio.io/latest/docs/concepts/observability/)
