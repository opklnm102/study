


https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/reference_policies_multi-value-conditions.html


ForAllValues

전체 요청 값 집합이 전체 조건 키 값 집합과 일치하는지 테스트
요청에 지정된 키 값이 정책 값 1개 이상과 일치하면 true 반환
요청에 일치하는 key가 없거나, empty value일 경우 true 반환


ForAnyValues

요청 값 집합에서 1개 이상의 숫자가 조건 키 값 집합에서 멤버 1개 이상과 일치하는지 테스트
요청의 키 값 중 하나가 정책의 조건 값 중 하나와 일치하면 true 반환
요청에 일치하는 key가 없거나, empty value일 경우 false 반환






