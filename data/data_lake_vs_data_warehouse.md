# [Data] Data Lake vs Data Warehouse
> date - 2022.11.23  
> keyword - data lake, data warehouse  
> Data Lake와 Data Warehouse에 대해 정리

<br>

## Data Platform
* 정형, 비정형, 반정형의 다양한 형태의 데이터를 가능한 많이 저장할 수 있고, 가능한 빨리 조회 가능하며, 시각화할 수 있어야 한다

<br>

### Keyword
* Distributed Storage
* Distributed Query Engine
* Visualization
* Discovery
* Security, Governance
* (Near) Realtime Data Pipeline, CDC
* Data Type, Compression, Tiering, Cache, Partitioning

<br>

### 왜 필요할까?
* 매출, MAU 등의 데이터를 통해 서비스의 과거, 현재, 미래를 파악
* 검색, 추천, 랭킹, 정산, A/B 테스트, 예측 등 데이터 기반 서비스


<br>

## Data Warehouse
* 데이터 분석을 위해 정제된 데이터를 저장
* 수많은 데이터 중 필요한 것만 선별해서 분석하기 좋게 가공하여 저장
* e.g. [Amazon Redshift](https://aws.amazon.com/ko/redshift), [Google Cloud BigQuery](https://cloud.google.com/bigquery)
* DB, Distributed Storage, Query Engine

<br>

### Pros
* ingestion 후 Data Warehouse가 알아서 해주거나 유저가 Data Warehouse의 기능을 이용해 customize하면 되므로 비교적 간단하다
* internal metadata(schema-on-write)로 schema evolution 등이 자유롭다
* CDC, SQL 등 query engine 이상의 기능을 제공하기도 한다
* component가 적어 유지보수가 Lake 보다 작을 수 있다
* SQL native로 데이터를 관리할 수 있다

<br>

### Cons
* ingestion 과정이 있다
* Data Warehouse에서 지원하지 않는 기능은 사용할 수 없다
* Lake보다 비쌀 가능성이 높다
* 한번 들어간 데이터를 꺼내는데 비용 문제가 있다
* component 별로 데이터 파편화가 발생할 수 있다
  * read-time BI serving을 위해 BigQuery 만으로는 부족

<br>

## Data Lake
* 데이터 분석을 위해 정제되지 않은 데이터(raw data)를 저장
* 가공해서 저장하기 보다는 데이터가 생성되면 일단 모두 저장하고 필요할 때 가공해서 사용
* e.g. Amazon S3 + Spark/Hive 등 호환 포맷 서비스, 
* Distributed Storage, Distributed Query Engine, Metastore

<br>

### Pros
* storage에 저장하기만 하면 되므로 ingestion이 필요 없다
* cloud에서 storage가 제일 저렴하고, tiering 가능
* storage가 SSOT(Single Source Of Truth)가 되므로, 다양한 storage 기능 및 query engine(SQL, API) 사용 가능
* Hive, Glue 등 external, schema-on-read 방식의 유연하고 API를 제공하는 metadata system 사용

<br>

### Cons
* underlying storage의 제약을 적용 받는다
* data type, format, compression, directory structure, block size 등 storage 사용 방법에 따라 성능이 달라진다
* storage, query engine, metastore 등 component가 많다
* 데이터 관리가 상대적으로 어렵다
* file format/store/query engine 마다 external schema 관리가 복잡
* SQL만으로 데이터를 관리할 수 없다

<br>

## Data Lakehouse
* Data Warehouse + Data Lake
* e.g. [Snowflake](https://www.snowflake.com), [Databricks](https://www.databricks.com), [BigLake](https://cloud.google.com/biglake)


<br><br>

> #### Reference
> * [클라우드 데이터 플랫폼을 구성하는 최신 기술 알아보기](https://speakerdeck.com/woongseok/09-balpyo-keulraudeu-deiteo-peulraespomeul-guseonghaneun-coesin-gisul-alabogi)
