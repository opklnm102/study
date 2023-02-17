# [Data] What is batch & streaming processing
> date - 2023.01.04  
> keyword - batch, streaming  
> batch와 streaming에 대해 정리

<br>

## batch processing vs streaming processing
| batch processing | stream processing |
|:--|:--|
| 특정 시간 범위 내에서 대량의 데이터를 일괄 처리 | 데이터가 생성되는 즉시 데이터 스트림(연속적인 데이터의 흐름)을 처리하는 것 |
| 대량의 데이터를 한번에 처리 | 스트리밍 데이터를 실시간 처리 |
| 데이터 크기가 정해져있고, 유한한 경우에 사용 | 데이터 크기를 알 수 없고 무한하며 연속적인 경우에 사용 |
| 데이터를 처리하는데 많은 시간이 걸린다 | 데이터를 처리하는데 몇 초/밀리초가 걸린다 |
| 유휴 리소스가 많은 시간대에 실행하여, 리소스 효율적으로 실행될 수 있다 | 지속적으로 리소스를 사용 |
| 주간/월간 보고서 생성, 재고 처리 등 | IoT, 실시간 추천, 미디어, 게임 |
| MapReduce, Spark | Spark Streaming, Kafka |

* 많은 조직에서 batch processing과 streaming processing을 결합한 하이브리드 모델인 [Lambda Architecture](https://www.databricks.com/glossary/lambda-architecture)를 구축하여 실시간 계층과 배치 계층을 유지 관리
* [Amazon Kinesis](https://aws.amazon.com/ko/kinesis) 같은 스트리밍 데이터 플랫폼에서 데이터를 처리하여 실시간 인사이트 추출하여 [Amazon S3(Simple Storage Service)](https://aws.amazon.com/ko/s3) 같은 저장소에 저장한 후  다양한 배치 처리를 위해 변환 및 로드


<br>

## batch? job? task? scheduler?
| Term | Description |
|:--|:--|
| batch | 일괄 처리하는 것<br>1개 이상의 task로 구성된다 |
| job | task의 모음<br>batch 작업의 단위 |
| task | 일련의 작업 단위 |
| scheduler | 주기적으로 특정 기능을 실행시켜주는 역할로 batch를 주기적으로 실행시켜준다<br>CronTab, Spring Scheduler 등 |


<br><br>

> #### Reference
> * [The Big Data Debate: Batch Versus Stream Processing](https://thenewstack.io/the-big-data-debate-batch-processing-vs-streaming-processing/)
> * [배치 처리란 무엇인가요?](https://aws.amazon.com/ko/what-is/batch-processing)
> * [스트리밍 데이터란 무엇입니까?](https://aws.amazon.com/ko/what-is/streaming-data)
> * [Describe a task](https://cloud.google.com/batch/docs/samples/batch-get-task)
> * [Lambda Architecture](https://www.databricks.com/glossary/lambda-architecture)
