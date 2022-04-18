# [AWS] ECR image scanning
> date - 2022.04.18  
> keyworkd - aws, ecr, container image, vulnerability  
> Amazon ECR에서 image scanning에 대해 정리

<br>

## Amazon ECR image scan
* container image의 vulnerability를 식별하는데 사용
* Basic scanning
  * Clair의 CVE(Common Vulnerabilities and Exposures) DB 사용하여 scan
  * 수동이나 image push시 scan하고 결과 제공
* Enhanced scanning
  * OS, programming language package의 vulnerability를 Amazon Inspector와 통합되어 자동 scanning
  * 새로운 vulnerability 발생시 scan 결과가 업데이트되고, Amazon Inspector가 event를 EventBridge에 전송하여 사용자에게 알린다
* [Amazon Inspector 요금](https://aws.amazon.com/ko/inspector/pricing/)에 따른 비용 발생
* `*`를 사용한 filter를 통해 scan할 repository를 지정할 수 있다

<br>

## Conclusion
* Amazon ECR image scan을 통해 vulnerability 식별을 손쉽게 통합할 수 있다
* 비용이 부담된다면 CI/CD pipeline에 Amazon ECR image scan 대신 [quay/clair](https://github.com/quay/clair)를 고려해볼 수 있다

<br><br>

> #### Reference
> * [image scan - Amazon ECR Docs](https://docs.aws.amazon.com/ko_kr/AmazonECR/latest/userguide/image-scanning.html)
> * [Amazon Inspector 요금](https://aws.amazon.com/ko/inspector/pricing/)
