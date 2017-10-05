# for와 for-each 의 차이
> for와 for-each문을 사용하다가 for는 비교문을 매번 호출하는데 for-each도 매번 호출하는지 궁금해서 테스트한 결과를 기록한다

## Test
```java
public class MyTest {

    @Test
    public void testForAndForEach() {

        for (Integer i : getList()) {
            System.out.println("for-each " + i);
        }

        for (int i = 0; i < getList().size(); i++) {
            System.out.println("for " + i);
        }
    }

    private List<Integer> getList() {
        System.out.println("getList()");

        Integer[] nums = {1, 2, 3, 4};

        return Arrays.asList(nums);
    }
}
```

## 실행 결과
```sh
getList()
for-each 1
for-each 2
for-each 3
for-each 4

getList()
for 0
getList()
for 1
getList()
for 2
getList()
for 3
getList()
```
* for 의 조건문은 매번 실행
* for-each의 …은 1번만 실행
   * for-each는 내부적으로 iterator를 받아서 사용하니까?

