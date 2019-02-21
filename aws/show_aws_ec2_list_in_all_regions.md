# [AWS] Show AWS EC2 list in all regions
> date - 2019.02.21  
> keyword - aws, awscli, ec2  
> AWS Console에서는 각 region 별로 EC2 instance만 확인할 수 있는데 모든 region에 있는걸 1번에 보기에는 불편함이 있어서 정리  

<br>


## 1. EC2에서 지원하는 region 조회
* AWS CLI에서 region list를 조회할 수 있다
```sh
$ aws ec2 describe-regions --output text

REGIONS	ec2.eu-north-1.amazonaws.com	eu-north-1
REGIONS	ec2.ap-south-1.amazonaws.com	ap-south-1
REGIONS	ec2.eu-west-3.amazonaws.com	eu-west-3
REGIONS	ec2.eu-west-2.amazonaws.com	eu-west-2
REGIONS	ec2.eu-west-1.amazonaws.com	eu-west-1
REGIONS	ec2.ap-northeast-2.amazonaws.com	ap-northeast-2
REGIONS	ec2.ap-northeast-1.amazonaws.com	ap-northeast-1
REGIONS	ec2.sa-east-1.amazonaws.com	sa-east-1
REGIONS	ec2.ca-central-1.amazonaws.com	ca-central-1
REGIONS	ec2.ap-southeast-1.amazonaws.com	ap-southeast-1
REGIONS	ec2.ap-southeast-2.amazonaws.com	ap-southeast-2
REGIONS	ec2.eu-central-1.amazonaws.com	eu-central-1
REGIONS	ec2.us-east-1.amazonaws.com	us-east-1
REGIONS	ec2.us-east-2.amazonaws.com	us-east-2
REGIONS	ec2.us-west-1.amazonaws.com	us-west-1
REGIONS	ec2.us-west-2.amazonaws.com	us-west-2
```

* 원하는 부분만 추출
```sh
## using cut
$ aws ec2 describe-regions --output text | cut -f3
eu-north-1
ap-south-1
...

## using awk
aws ec2 describe-regions --output text | awk '{print $3}'
eu-north-1
ap-south-1
...

## using query option
$ aws ec2 describe-regions --query Regions[*].[RegionName] --output text
eu-north-1
ap-south-1
...
```


<br>

## 2. 모든 region을 돌면서 ec2 instance 조회
```sh
#!/usr/bin/env bash

# show all aws ec2 list

for region in $(aws ec2 describe-regions --query Regions[*].[RegionName] --output text)
do
  echo -e "\nListing Instances in region: ${region}..."
  aws ec2 describe-instances --region ${region}
done
```


<br>

## 3. 원하는 필드만 추출
* jq 사용해 json을 파싱해 원하는 필드만 추출
```sh
#!/usr/bin/env bash

# show all aws ec2 list

for region in $(aws ec2 describe-regions --query Regions[*].[RegionName] --output text)
do
  echo -e "\nListing Instances in region: ${region}..."
  aws ec2 describe-instances --region ${region} | jq ".Reservations[].Instances[] | {type: .InstanceType, state: .State.Name, tags: .Tags, zone: .Placement.AvailabilityZone, privateIpAddress: .PrivateIpAddress, publicIpAddress: .PublicIpAddress }"
done

```


<br><br>

> ##### Reference
> * [How to see all running Amazon EC2 instances across all regions?](https://stackoverflow.com/questions/42086712/how-to-see-all-running-amazon-ec2-instances-across-all-regions)
