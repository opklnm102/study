# Identifying Relationship, Non Identifying Relationship
> ERD를 그리다가 식별, 비식별 관계가 모호해서 알아보다가 정리!

## Relationship
* Entity간의 연관성

## Identifying Relationship(식별 관계)
* 부모 테이블의 PK가 자식 테이블의 PK의 구성원으로 전이되는 식별관계(부모가 자식의 모든 정보를 저장하게 됨)
* 부모 없이는 자식이 존재할 수 없는 경우

## Non Identifying Relationship(비식별 관계)
* 자식 테이블의 Attribute 그룹의 구성원으로 전이되는 비식별관계(부모는 자식의 부분적인 정보를 표현)
* 부모 없이 자식이 존재할 수 있는 경우

## 단점
* PK의 영역이 점점 비대해지며(전파되기 때문), 결과적으로 무의미한 FK들이 PK로 된다
