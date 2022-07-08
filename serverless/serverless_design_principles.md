# [Serverless] Serverless design principles
> date - 2022.07.09  
> keyworkd - serverless, aws
> serverless 환경에서 고려해야할 사항 정리

<br>

## 1. Speedy, Simple, Singular
* function은 간결하고, 짧고, 단일 목적을 가지도록 작성
* function의 environment은 request lifecycle과 함께하므로 실행 시간이 오래 걸리면 안된다
* 실행 시간을 최소화하기 위해 asynchronous workflow 사용
  * SQS를 사용
  * function 내에서 function 호출 X

<br>

## 2. Think Concurrent Requests, Not Total Requests
* serverless application은 concurrency model 활용
  * degine level의 tradeoff는 concurrency를 기반으로 평가
* 적은 수의 request로 proces를 최적화하는 방법을 찾는데 시간을 소비하지 말고 auto scaling을 활용하도록 시스템을 설계
* long-running task를 여러 조각으로 나눠라
  * e.g. big, heavy task -> small, singular task


<br>

## 3. Share Nothing
* function runtime environment와 underlying infrastructure는 short-lived
* function은 stateless
* 상태는 state machine에서 조작하거나 persistent storage 사용


<br>

## 4. Assume No Hardware Affinity
* underlying infrastructure는 변경될 수 있으므로 CPU flags 같이 HW에 종속적인 기능은 사용하지 마라
* serverless에서 HW는 잊어라


<br>

## 5. Orchestrate Your Application With State Machines, Not Functions
* 1, 2에 따라 modular system을 설계하고 state machine에서 workflow를 처리
* function에서 function을 호출하면 caller가 callee가 종료될 때 까지 대기하므로 비용 발생


<br>

## 6. Use Events To Trigger Transactions
* 유저가 기다릴 필요가 없는 event driven architecture 사용
* Amazon S3에 object 생성 or DB update 같은 event를 통해 function 실행


<br>

## 7. Design for Failures and Duplicates
* event의 순서가 보장되는지, 한번만 발생하는지를 신뢰할 수 없으므로 이를 염두해두고 설계 -> `idempotency` 보장
  * 동일한 요청에 동일한 결과를 보장


<br>

## Conclusion


<br><br>

> #### Reference
> * [7 AWS Serverless Design Principles for Solutions Architects](https://betterprogramming.pub/7-aws-serverless-design-principles-for-solutions-architects-2be22717713b)
