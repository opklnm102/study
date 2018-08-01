# [Github] 좋은 Pull Request 만들기
> date - 2018.07.31  
> keyword - git, code review  
> [Anatomy of a perfect pull request](https://opensource.com/article/18/6/anatomy-perfect-pull-request?utm_medium=email&utm_source=topic+optin&utm_campaign=awareness&utm_content=20180630+prog+nl&mkt_tok=eyJpIjoiTlRWbVlUVTFPR1ppT1RrMyIsInQiOiJHRTZkZldYWkdCMXhKdWx0Sktrd0dtRWZoV3JXUDh6Zld3WTRtZDFwTU91TlwvWnNiU21oblVHMFhjdWhPOVVsTkhzXC9hMWRrOWNSMmVTYnpLaE5GQ1JjdEFpRE9CWHBtVTc0aEUydWZjXC92YmxoZllDUmJTamdqandcL05cL2F0VHdYIn0%3D)를 읽고 좋은 PR 작성법에 대해 요약

<br>

* 깨끗한 코드를 작성하는 것은 PR 작성시 주의해야할 여러가지 요소중 하나
* 큰 Pull Request는 검토 중 큰 overhead를 유발하고 bug를 그냥 넘기기 쉽다
* Pull Request 자체에 신경을 써야한다
* 짧아야하고, 명확한 제목과 설명을 가져야하며, 오직 1가지만 해야한다

<br>

## 왜 신경써야 하나?
* 좋은 PR은 빠르게 검토된다
* bug 유발이 축소된다
* 새로운 개발자가 쉽게 참여할 수 있다
* 다른 개발자의 PR을 block하지 않는다
* code review가 빨라지므로 제품 개발이 빨라진다

---

<br>

## PR의 크기
* 문제가 있는 PR을 식별하는 1번째는 `큰 차이`를 찾는것
* code review시 bug를 찾는게 더 어렵다
* 대규모 PR은 의존성있는 다른 개발자를 blocking
* 250줄 정도 가 좋다
  * [Best Practices for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)에 60 ~ 90분 동안 200 ~ 400 LOC를 검토하면 70 ~ 90%의 결함 발견이 발생하기 때문
  * review에 1시간 이상 소요


## 큰 PR은 작게 나누기
* feature breakdown을 이해하고

### example. 앱에 구독 기능 만들기
* 단지 이메일 주소를 받아들이고, 저장하는 형식일뿐
* 앱의 작동방식을 모르는채로 8가지 PR을 해결할 수 있다

* 이메일 저장 모델 만들기
* 요청 수신할 route 만들기
* 컨트롤러 만들기
* DB에 저장하는 서비스 만들기
* access control 처리를 위한 policy 만들기
* subscribe component 만들기
* subscribe component를 호출하는 UI만들기

> 기능을 여러 부분으로 나누었다  
> 대부분의 기능은 여러 개발자가 동시에 수행할 수 있다  

### SRP(Single responsibility principle)
* 모든 모듈/클래스는 단일 부분에 대한 책임을 가지고, 책임은 모듈/클래스에 캡슐화되어야 한다는 원칙
* PR도 1가지만 수행
* 여러문제를 해결하려는 코드를 수정함으로써 발생하는 오버헤드를 줄일 수 있다
* code review를 위한 PR에 SRP를 적용해보자
* 2가지 이상을 수행하는 코드라면 다른 PR로 분리

--- 

<br>

## PR 내용
* PR을 만들 때 제목과 설명에 주의
* `새로운 사람도 이해할 수` 있을만큼 명확하고 자세해야 한다
* 제목은 `무엇이 바뀌고 있는지` 명확해야 한다
  * ex) Add test case for getEventTarget
* 유용한 설명
  * PR에서 변경된 내용 설명
  * PR이 존재하는 이유
    * ex) DB column을 변경하나요? 어떻게 이뤄지나요? 이전 데이터는 어떻게 됩니까?

---

<br>

## 정리
* Pull Request 크기
  * PR당 250 LOC가 적당
* Feature breakdown
  * Pull Request를 잘게 나누어서 만들어라
* SRP
  * Pull Request는 1가지만 수행
* title
  * Pull Request에서 수행한 작업을 나타내도록 명확하게 기술
* description
  * 변경된 내용, 변경된 이유를 자세히 기술  

---

<br>

> #### 참고
> * [Anatomy of a perfect pull request](https://opensource.com/article/18/6/anatomy-perfect-pull-request?utm_medium=email&utm_source=topic+optin&utm_campaign=awareness&utm_content=20180630+prog+nl&mkt_tok=eyJpIjoiTlRWbVlUVTFPR1ppT1RrMyIsInQiOiJHRTZkZldYWkdCMXhKdWx0Sktrd0dtRWZoV3JXUDh6Zld3WTRtZDFwTU91TlwvWnNiU21oblVHMFhjdWhPOVVsTkhzXC9hMWRrOWNSMmVTYnpLaE5GQ1JjdEFpRE9CWHBtVTc0aEUydWZjXC92YmxoZllDUmJTamdqandcL05cL2F0VHdYIn0%3D)
