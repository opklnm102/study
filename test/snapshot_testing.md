


https://repo.yona.io/doortts/blog/issue/5


Snapshot 테스팅이라는 것도 있는데 보통 equals(expected) 나 toEqual(expected) 같은 assert구분을 쓸때 expected 를 일일히 다 미리 표현하기 어려운 경우 최초 실행시 result를 expected로 저장(실제로 파일등으로 저장)해 놓고 다음 실행시부터는 이전 snapshot과 동일한지 비교하는 방식의 테스팅입니다.
참고: https://jestjs.io/docs/en/snapshot-testing



