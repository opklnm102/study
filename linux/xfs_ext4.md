# [Linux] xfs & ext4
> date - 2022.03.29  
> keyworkd - linux, filesystem, xfs, ext4  
> AL(Amazon Linux)의 root filesystem으로 ext4를 사용했는데 AL 2에서는 xfs를 사용하고, MongoDB의 [WiredTiger storage engine](https://www.mongodb.com/docs/manual/core/wiredtiger/#storage-wiredtiger)에서도 언급되어 xfs와 ext4에 대해 정리

<br>

## xfs
* 확장성이 뛰어난 고성능 64bit journaling file system
* Parallelized access via allocation groups
  * multi threads가 동일한 volume에 동시에 I/O를 수행
* Extent based allocation
  * fragmentation, metadata size를 줄이고, 더 적은 수의 큰 I/O 작업을 허용하여 I/O 성능을 향상
* Delayed allocation
  * 데이터 연속성과 성능을 향상
  * 쓰기를 결합하고 extent를 large chunk로 할당하여 fragmentation을 줄이고 random write를 연속적으로 할당
* server, storage가 큰 경우 xfs 사용하는게 좋으며, 크기가 작은 storage일 경우 평균 파일 크기가 수백 MB일 때도 좋다
* ext4와 비교하여 CPU 당 2배의 작업을 사용
  * CPU binding workload에 약간의 동시성이 있는 경우 ext4가 더 빠르다


<br>

## ext4
* ext3의 확장판으로 대용량 파일 시스템 지원을 제공하며 fragmentation, 성능, timestamp 개선
* I/O 기능이 제한된 시스템에서 잘 작동


<br>

## Recommended file system by case
| Use case | Recommended |
|:--|:--|
| general purpose | xfs |
| large scale server | xfs |
| large scale storage | xfs |
| large file | xfs |
| multi thread I/O | xfs |
| single thread I/O | ext4 |
| Limited I/O(1,000 IOPS 미만) | ext4 |
| Limited bandwidth(200MB/s 미만) | ext4 |
| CPU binding workload | ext4 |
| Offline shrink support | ext4 |


<br><br>

> #### Reference
> * [https://repost.aws/questions/QUv5Lq5XuaRR-ahmWdfgbY3w/amazon-linux-2-default-filesystem-has-switched-to-xfs](https://repost.aws/questions/QUv5Lq5XuaRR-ahmWdfgbY3w/amazon-linux-2-default-filesystem-has-switched-to-xfs)
> * [XFS vs EXT4 – Comparing MongoDB Performance on AWS EC2](https://scalegrid.io/blog/xfs-vs-ext4-comparing-mongodb-performance-on-aws-ec2/)
> * [리눅스 파일 시스템 이해하기 : ext4](https://tech.osci.kr/2018/07/31/%EB%A6%AC%EB%88%85%EC%8A%A4-%ED%8C%8C%EC%9D%BC-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-ext4/)
> * [XFS 및 ext4 비교](https://access.redhat.com/documentation/ko-kr/red_hat_enterprise_linux/9/html/managing_file_systems/comparison-of-xfs-and-ext4_assembly_overview-of-available-file-systems)
