# [Tips] About CDR(Call Detail Record)
> date - 2020.04.05  
> keyword - cdr, call  
> 최근 업무에서 cdr이란 용어를 보았는데, 어떤걸 뜻하는지 궁금해서 정리  

<br>

## Call Detail Record?
* 과금할 목적으로 특정 내선번호나 가입자 그룹에 대한 통화 세부 내역 데이터(발신 번호, 착신 번호, 통화량, 통화 시간 등)를 수집하고 기록하는 서비스 기능
* 사후 처리에 사용할 용도로 저장


<br>

## Use case
* 통화 비용을 각 부서별로 청구하는 기업
* 호텔, 병원 등 고객들에게 사용한 통화 비용을 각각 청구해야 하는 경우


<br>

## Sample Database
* 필수 필드
  * 발신 번호
  * 착신 번호
  * 시작 시각
  * 응답 시각
  * 종료 시각
  * 통화 시간

<br>

* Sample DDL
```sql
CREATE TABLE `SAMPLE`.`cdr_sample` (
  `call_id` BIGINT NOT NULL AUTO_INCREMENT,
  `calling_number` VARCHAR(24) NOT NULL COMMENT '발신 번호',
  `called_number` VARCHAR(24) NOT NULL COMMENT '착신 번호',
  `call_start_time` DATETIME NOT NULL COMMENT '호 시작 시각',
  `call_response_time` DATETIME NOT NULL COMMENT '호 응답 시각',
  `call_end_time` DATETIME NOT NULL COMMENT '호 종료 시각',
  `call_time` INT NOT NULL DEFAULT 0 COMMENT '통화 시간',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));
```

<br>

| call_id | calling_number | called_number | call_start_time | call_response_time | call_end_time | call_time | created_at | updated_at |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| 101 | 02123456 | 031123456 | 2020-04-05 11:35:32 | 2020-04-05 11:35:40 | 2020-04-05 11:36:32 | 60 | 2020-04-05 11:40:00 | 2020-04-05 11:40:00 |
| ... | | | | | | | | |
| 3033232 | 031123456 | 02123456 | 2038-04-05 11:35:32 | 2038-04-05 11:35:40 | 2038-04-05 11:36:32 | 60 | 2038-04-05 11:40:00 | 2038-04-05 11:40:00 |


<br><br>

> #### Reference
> * [CDR Call Detail Reporting, Call Detail Recodring 호 상세 기록](http://www.ktword.co.kr/abbr_view.php?m_temp1=2567)
