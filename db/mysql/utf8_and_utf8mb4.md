# [MySQL] utf8 and utf8mb4
> 사내 Infra migration 후 MySQL의 default chatacter set이 utf-8에서 utf8mb4로 변경되었는데 무슨 차이가 있을까 궁금해서 찾아봄  
> DB는 저장공간을 효율적으로 활용하고, 더 빠르게 처리하기 위해 데이터 자료형 사용  


## utf-8
* 가변 3Byte
   * 1 ~ 3Byte까지 저장 가능
* Basic Plane

> utf-8(다국어 언어셋)로 작성된 문서는 `한국어 언어셋`으로 작성된 문서보다 용량이 크다


## utf8mb4
* Basic Plane + Supplementary Plane
* 가변 4Byte
   * 1 ~ 4Byte까지 저장 가능
* Emoji같은 SMP(Supplementary Multilingual Plane)를 처리할 때 사용
* 실생활의 대부분 데이터는 text 기반
   * 모든 데이터를 저장할 수 있는 자료형 필요 => utf-8 등장
   * 전세계 모든 언어가 21bit(1Byte = 8bit)에 저장되기 때문에 MySQL에서 utf8을 3Byte 가변 자료형으로 설계
   * 그렇기 때문에 4Byte 문자열을(Emoji 등)을 utf8에 저장하면 값 손실 현상 발생 => utf8mb4 등장


## 정리
* 새로 추가되는 문자들이 4Byte 영역을 사용하기도 하므로 `utf8mb4(charset), utf8mb4_unicode_ci(collation)`를 권장



> #### 출처
> * [utf8mb4 언어셋 소개 및 표현범위](https://blog.lael.be/post/917)
