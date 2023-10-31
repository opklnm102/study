# [Spring Cloud Data Flow] Alternative to Spring Cloud Data Flow
> date - 2023.10.06  
> keyworkd - spring, cloud, dataflow  
> Spring Cloud Dataflow의 대안에 대해 정리  

<br>

## Background
* Amazon EKS 1.24 → 1.27 업그레이드시 Spring Cloud Data Flow에서 사용하는 v1beta1/batch API에서 호환성 이슈 발생
* 관련 이슈인 [Upgrade cronjobs from batch/v1beta to batch/v1 #529](https://github.com/spring-cloud/spring-cloud-deployer-kubernetes/issues/529)를 정리해보면 아래와 같음
  * dataflow에서 spring boot 2 -> 3, spring cloud task 2 -> 3, spring batch 4 -> 5를 대응해야해서 오랜 시간 소요
  * deployer, dataflow가 종속적이라 지속적인 release 딜레이 발생
  * 추후 deployer, dataflow를 분리하거나 등 조치할 것이라고 함
  * 2023-09-06 기준 [2.11.0 release 2023-09-14 예정](https://github.com/spring-cloud/spring-cloud-dataflow/milestone/159)
* Spring Cloud Data Flow는 Spring Boot/Batch/Task 등에 종속적이라 대안에 대한 니즈 발생

<br>

## As-is
* Spring Cloud Stream을 사용하지 않고, Spring Cloud Task/Batch만 사용 중
  * Task/Batch만 사용하기 때문에 Spring Cloud Skipper가 구성되어 있지 않음
* Task/Batch app은 container image 사용


<br>

## To-be
* Task/Batch를 실행/스케쥴링할 수 있고, UI를 제공하면 됨

<br>

### Spring Cloud Data Flow vs Airflow vs Argo Workflows
| | [Spring Cloud Data Flow](https://spring.io/projects/spring-cloud-dataflow) | [Apache Airflow](https://airflow.apache.org) | [Argo Workflows](https://argoproj.github.io/argo-workflows) |
|:--|:--|:--|:--|
| 설명 | Spring 기반의 MSA를 사용하여 데이터 처리 workflow를 구성하고 관리하기 위한 플랫폼 | workflow 플랫폼 | Kubernetes 환경에서 workflow 관리를 위한 도구 |
| Stream | O | X | X(deprecated) |
| Batch | O | O | O |
| 언어 | Java | Python | Yaml |
| 작업 단위 | Spring Boot, Spring Cloud 기반 Application | - Python<br>- Container with [KubernetesPodOperator](https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/operators.html) | Container |


<br><br>

> #### Reference
> * [Upgrade cronjobs from batch/v1beta to batch/v1 #529](https://github.com/spring-cloud/spring-cloud-deployer-kubernetes/issues/529)
> * [spring-cloud-dataflow 2.11.0 milestones](https://github.com/spring-cloud/spring-cloud-dataflow/milestone/159)
> * [Spring Cloud Data Flow](https://spring.io/projects/spring-cloud-dataflow)
> * [Apache Airflow](https://airflow.apache.org)
> * [Argo Workflows](https://argoproj.github.io/argo-workflows)
