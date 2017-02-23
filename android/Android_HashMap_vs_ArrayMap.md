[ArrayMap과 안드로이드 최적화](https://brunch.co.kr/@linterpreteur/13)를 읽고 정리

# HashMap
* 내부 클래스인 `HashMap.Entry`객체의 배열
* Entry의 인스턴스 변수
   * premitive type이 아닌 Key
   * premitive type이 아닌 Value
   * 객체의 hashcode
   * 다음 객체로의 포인터
* Key-Value 추가 과정
   1. Key의 hash code가 계산되어 Entry 객체의 hash code에 할당
   2. hash code를 이용해 bucket의 index 계산
   3. bucket에 이미 원소가 있을 경우 마지막 원소가 새 원소를 가리킴으로서 연결 리스트 구조 형성
* Key를 통해 Value를 요청할 경우 O(1)시간에 얻지만, 공간(메모리)측면에서 비용이 크다
* AutoBoxing이 일어나므로 메모리 사용뿐만 아니라 GC에도 영향
* Entry 객체 자체가 별도의 객체이므로 객체 생성과 GC에 영향
* HashMap에 변경이 있을 때마다 bucket이 재정렬되어 객체 수에 따라 성능 급하락

# ArrayMap
* HashMap보다 메모리 효율적이도록 설계된 Key-Value 자료구조
* Mapping구조를 2개의 배열로 구성
   1. 각 항목의 hash code를 저장하는 int[] mHashes
   2. Key-Value 쌍의 객체를 저장하는 Object[] mArray
* 항목마다 잉여 객체를 생성할 필요가 없다
* 크기를 늘릴 때 HashMap을 재구성하지 않고 배열을 복사
* 이진탐색으로 객체를 찾는다
   * HashMap보다는 속도가 느림
* 추가, 삭제는 배열 항목의 추가, 삭제로 구현
* Key-Value 추가 과정
   1. Key-Value의 AutoBoxing
   2. Key가 mArray의 사용가능한 다음 위치에 추가
   3. Value가 mArray의 다음 위치에 추가
   4. Key의 hash code가 계산되어 mHashes의 다음 위치에 추가
* Key로 Value를 찾는 과정
   1. Key의 hash code 계산
   2. mHashes에서 hash code를 이진탐색으로 검색, 시간복잡도는 O(logN)으로 증가
   3. hash code의 index를 찾으면 mArray에서 Key는 `2 * index`에 위치, Value는 `2 * index + 1`에 위치
   4. 시간복잡도는 증가하지만 메모리 효율적이며 100개 정도의 데이터를 다룰경우 성능차이는 미미하여 메모리 측면에서 이점을 가져갈 수 있다

# 권장 자료구조
```java
HashMap<K, V> -> ArrayMap<K, V>
HashSet<K, V> -> ArraySet<K, V>
HashMap<Integer, V> -> SparseArray<V>
HashMap<Integer, Boolean> -> SparseBooleanArray
HashMap<Integer, Integer> -> SparseIntArray
HashMap<Integer, Long> -> SparseLongArray
HashMap<Long, V> -> LongSparseArray<V>
```