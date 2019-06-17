# [kube-aws] Cluster upgrade causes entire cluster to relaunch
> date - 2019.06.18  
> keyword - kubernetes, k8s, kube-aws, kms  
> kube-aws에서 아무런 변경사항 없이 *.enc, *.fingerprint만 재생성하여 cluster update하면서 겪은 이슈 정리  

<br>

## Issue
* 아무런 변경사항 없이 cluster update를 했는데, cluster full update 발생


<br>

## WHy?
* kube-aws의 cluster update는 AWS Cloud Formation에 위임
* Cloud Formation은 stack의 **현재 template과 update template의 차이**에 따라 리소스를 업데이트한다
  * 차이가 없으면 update target이 아님
  * [스택 리소스 업데이트 동작 - AWS](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html) 참고

<br>

* 그래서 Cloud Formation stack의 내용을 확인
```
# before
- path: /etc/kubernetes/ssl/etcd-client.pem
  encoding: gzip+base64
  content: aabbccddeeffgg

- path: /etc/kubernetes/ssl/etcd-client-key.pem.enc
  encoding: gzip+base64
  content: ppooiiuuyyttrreewwqq
...

# after
- path: /etc/kubernetes/ssl/etcd-client.pem
  encoding: gzip+base64
  content: aabbccddeeffgg

- path: /etc/kubernetes/ssl/etcd-client-key.pem.enc
  encoding: gzip+base64
  content: qqwweerrttyyuuiioopp  # here: content 다름
...
```
* 결과적으로 Cloud Formation stack 내용에 변경이 생겨 update된 것... 왜 바뀐거지...?

<br>

* AWS KMS encryption의 **동일한 plain text에 대해 다른 cipher text를 생성**하는 특징이 있다
```sh
$ aws kms encrypt --key-id "arn:aws:kms:region:yourkey" --plaintext <plain text>
```

* kube-aws에서는 AWS KMS로 인한 cluster full roll out을 방지하기 위해 `credentials/*.pem.enc‌`를 cache로 사용
* `credentials/*.pem.enc‌`를 제거하면 다른 내용으로 재생성되어 *.pem의 변경 여부와 상관 없이 cluster full roll out이 발생한다


<br>

> #### credentials 종류
> * credentials/*.pem - certificate
> * credentials/*.pem.fingerprint - .pem의 sha-256 hash sum
> * credentials/*.pem.enc - .pem encrypted with AWS KMS


<br>

## Resolve
* cluster full roll out을 방지하기 위해 `credentials/*.pem.fingerprint`, `credentials/*.pem.enc`를 유지할 필요가 있다
* kops처럼 state를 S3에서 관리하면 어떠냐는 이슈도 나왔지만 close


<br>

### assets을 S3에서 관리하려면 wrapper script 작성 권장
1. download encrypted kube-aws assets from S3
2. decrypt them
3. 자동/수동으로 cluster.yaml, stack-template.json, userdata/, cloud-config-*를 수정
4. kube-aws <command> 실행
5. re-encrypt all the assets
6. upload the latest, encrypted assets to S3 and remove the working directory


<br><br>

> #### Reference
> * [스택 리소스 업데이트 동작 - AWS](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html)
> * [Persist encrypted credentials under the `credentials/` directory](https://github.com/mumoshu/kube-aws/commit/194ff1019b8c0fb06cdfca9721b574375c6c0423)
> * [Cluster upgrade causes entire cluster to relaunch #825](https://github.com/kubernetes-incubator/kube-aws/issues/825)
> * [KMS encrypt of private keys causes unnecessary CloudFormation replacements #107](https://github.com/kubernetes-incubator/kube-aws/issues/107)
