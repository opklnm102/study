# [Architecture] ETL(Extract, Transform, Load)
> date - 2021.05.30  
> keyworkd - data engineering, data pipeline, etl  
> data engineering에 사용되는 ETL이란 용어에 대해 알아보고 정리  

<br>

## ETL(Extract, Transform, Load)
<div align="center">
  <img src="./images/etl.png" alt="etl" width="80%" height="80%" />
</div>

<br>

* `Extract`, `Transform`, `Load`의 앞글자를 딴 용어로 data를 추출, 변환, 적재한다는 의미
* 다양한 형식으로 수집되는 원본 data를 요구 사항에 맞게 변환하여 하나 이상의 data storage로 이동시키는데 사용되는 data pipeline
  * 동일한 유형의 data storage가 아니거나, data 형식이 다를 수 있기 때문에 변환이 필요할 수 있고, 이러한 복잡한 문제를 해결하기 위해 다양한 tool, service, process가 개발되었다
* `Transform`
  * 특수한 엔진에서 진행
  * 변환 중인 data가 임시 저장소에 보관될 수 있다
  * 작업 종류
    * 필터링(filtering)
    * 정렬(sorting)
    * 집계(aggregating)
    * 데이터 조인(joining data)
    * 데이터 정리(cleaning data)
    * 중복 제거(deduplicating)
    * 데이터 유효성 검사(validating data)
    * etc...
* 시간 절약을 위해 ETL의 3가지 단계가 동시에 실행될 수 있다
  * data의 전체 추출을 기다리지 않고, 추출되는 동안 변환되면서 로드된다


<br>

## ELT(Extract, Load, Transform)
* target data storage에서 `Transform`을 진행한다는 점이 `ETL`과의 차이점
* 별도의 transform engine을 사용하는 대신 **target data storage의 기능 사용하여 변환**
  * pipeline에서 transform engine이 제거되므로 **architecture가 단순해진다**
  * pipeline의 성능이 target data stroage의 scale을 따라간다
* 원본 data와 변환 data가 target data storage에서 사용되어 large dataset에서 시간이 많이 소요되는 ETL의 data copy가 불필요하기 때문에 big data 영역에서 사용된다
  * MPP(Massively Parallel Processing)도 필요
* target data stroage
  * `ELT` pipeline이 효과적이려면 data를 효율적으로 변환할 수 있을만큼 target data storage가 강력해야한다
  * data schema만 관리하고, schema는 읽기(query time)에 사용
    * data가 확장 가능한 external storage(data storage 자체에서 관리 X)에 있어서 external table이라고 부른다
  * Hadoop cluster(Hive, Spark 사용)를 사용하는 data warehouse가 될 수 있다
    * 모든 원본 data를 HDFS(Hadoop Distributed File System)같은 확장 가능한 storage로 추출한 뒤 Spark, Hive 등의 기술을 사용하여 data를 사용
    * Hive를 사용하는 Hadoop cluster에서 data 원본은 결과적으로 HDFS의 파일 집합에 대한 경로가 되는 Hive table을 의미
* ELT pipeline의 최종 단계에서는 일반적으로 지원해야하는 query format에 효율적인 형식으로 원본 data 변환 필요
  * partition
  * `Parquet` 같은 optimized storage format으로 저장


<br>

## Data flow and control flow
<div align="center">
  <img src="./images/control-flow-data-flow.png" alt="etl" width="80%" height="80%" />
</div>

<br>

### Control flow
* data pipeline context에서 task 집합이 순서대로 처리되도록 한다
* task의 올바른 처리 순서를 적용하기 위해 `precedence constraints`를 사용
  * `precedence constraints`는 workflow diagram에서 연결선으로 표현
* 각 task의 완료 결과(성공, 실패)에 따라 후속 task를 시작
* `Control flow`는 data flow를 하나의 task로 실행

<br>

### Data flow
* **원본에서 추출, 변형, 저장소에 로드**하는 task
* data flow task의 output은 다른 data flow task의 input이 될 수 있다
* data flow task는 parallel 실행 가능
* control flow와 달리 data flow의 task간에는 제약 조건을 추가할 수 없다
* data viewer를 추가하여 task에서 처리되는 data를 관찰할 수 있다

<br>

### Container
* task에 구조를 제공하는데 사용
* collection 내의 element를 반복 처리할 task를 제공시 사용


<br><br>

> #### Reference
> * [ETL - Azure Data Architecture Guide](https://docs.microsoft.com/ko-kr/azure/architecture/data-guide/relational-data/etl)
