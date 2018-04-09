# [MySQL] Optimization Overview
> MySQL Reference에 있는 Optimization Overview를 정리 


* DB 성능은 table, query, configuration setting 같은 `DB 수준의 여러 요소`에 의해 달라진다
* SW 수준에서 CPU 및 I/O 작업이 발생하므로 `가능한 최소화하고 최대한 효율적`으로 만들어야 한다
* SW 측면에서 high-level rule 및 guideline을 학습 후 성능을 측정하는 것으로 시작
* 전문가는 내부에서 일어나는 일에 대해 더 많이 배우고 CPU cycle 및 I/O 등을 측정한다
* 일반 사용자는 `기존 SW 및 HW 구성에서 최상의 DB 성능`을 얻으려 한다
* 고급 사용자는 `MySQL을 개선`하거나, `자체 storage engine 및 HW appliane를 개발`하여 MySQL ecosystem에 기여한다


## Optimizing at the Database Level
* DB Application을 빠르게 만드는 가장 중요한 요소는 다음과 같은 기본 디자인

### 1. table이 제대로 구조화되어 있습니까?
* column에 올바른 data type 사용
* table 목적에 적합한 column 사용
   * ex. 자주 update하는 application 에서는 column이 적은 table이 많으며, 대용량 data를 분석하는 application에는 column이 많은 table이 적다

### 2. Query를 효율적으로 만들 수 있는 올바른 index가 존재하는가?

### 3. 각 table에 적절한 storage engine을 사용하고 있으며 사용 중인 각 storage engine의 장점과 기능을 활용하고 있는가?
* storage engine의 선택은 `성능과 확장성`의 중요 요소
* InnoDB 같은 transactional storage engine 
* MyISAM 같은 nontransactional storage engine

### 4. 각 table이 적절한 row 형식을 사용하는가?
* table에 사용되는 storage engine에 따라 다르다
* compressed table은 disk 공간을 적게 사용하므로 data read, write에 필요한 `disk I/O가 적게 든다`
* Compression - `InnoDB table을 가진 모든 종류의 workload`와 `read-only MyISAM table`에서 가능

### 5. Application 이 적절한 locking strategy를 사용하는가?
* shared access를 허용하여 DB 작업이 동시에 실행될 수 있도록하고, 필요한 경우 독점적인 access를 요청하여 중요한 작업에 최우선 순위를 부여
* storage engine 선택이 중요
   * InnoDB storage engine
      * 사용자의 개입없이 대부분의 locking issue를 처리
      * DB의 concurrency 향상
      * 사용자의 test 및 tuning을 줄인다

### 6. Caching에 사용되는 모든 memory area의 size가 올바르게 조정되었나?
* 자주 access하는 data를 저장할 수 있을 만큼 충분한 size
* physical memory의 과부하로 인해 paging을 유발할 정도로 크지 않은 size
* 설정할 주요 memory area
   * InnoDB buffer pool
   * MyISAM key cache
   * MySQL query cache

> #### InnoDB는 새로운 table을 위한 default storage engine 
> * InnoDB table이 MyISAM table 보다 성능이 뛰어나다
>    * 바쁜 DB에서 더욱..


## Optimizing at the Hardware Level
* 모든 DB Application은 결국 DB가 더 많이 사용되면서 HW 제한을 초과
* DBA는 `Application을 tuning`하거나 bottleneck을 피하기 위해 `서버 재구성 여부` 또는 더 많은 `HW 자원 필요 여부`를 평가해야 한다
* System bottleneck은 아래와 같은 point에서 발생
   * 대부분의 System bottleneck지만 알고 있어야 한다

### Disk Seeks
* disk가 data를 찾는 시간
* 현대 disk의 경우 평균 시간이 10ms보다 짧기 때문에 이론적으로 초당 100회 탐색 가능
* Disk Seeks Time은 새로운 disk 출시로 성능 향상
   * disk의 출시는 오래 걸린다...
* single table에 대해 최적화하기 매우 어렵다
* 최적화하는 방법은 `2개 이상의 disk에 data를 분산`시키는 것

### Disk reading and writing
* data를 disk에서 read/write할 때
* 최신 disk의 경우 10 ~ 20MB/s의 throughput 제공
* `multiple disk에서 병렬로 읽을 수 있기` 때문에 최적화가 쉽다

### CPU cycles
* main memory에 data가 있으면 결과를 얻기 위해 data를 처리해야 한다
* memory보다 큰 table을 갖는 것이 일반적인 제한 요소
   * 작은 table의 경우 일반적으로 속도가 문제되지 않는다

### Memory bandwidth
* CPU가 CPU cahce에 들어갈 수 있는 것보다 더 많은 data를 필요로 할 때 main memory bandwidth에 bottleneck


## Balancing Portability and Performance
* portable MySQL 프로그램에서 성능 중심의 SQL extension을 사용하기 위해 MySQL 전용 키워드를 `/* */`주석으로 감쌀 수 있다
* 다른 SQL 서버는 주석처리된 키워드를 무시한다


> #### 참고
> * [Overview](https://dev.mysql.com/doc/refman/5.7/en/optimize-overview.html)
