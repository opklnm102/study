# [Java] About static in java
> date - 2018.09.26  
> keyword - java, static  
> java의 static 사용에 대한 포스팅을 보고 정리

<br>

## 공용자원에 대한 접근을 위한 singleton
* 네트워크, DB, 외부 파일 등 프로그램 내부 여기저기에서 참조가 필요한 경우 사용
* 1번 만들어진 객체를 계속 유지할 수 있기 때문에 효율적

```java
public class Game {

    private int score;
    private static Game game;

    private Game(int score) {
        this.score = score;
    }

    public static Game getInstance() {
        if (Game.game == null) {
            game = new Game(10);
        }
        return game;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public static void main(String[] args) {
        Game game = Game.getInstance();
        game.setScore(50);

        Game game2 = Game.getInstance();
        game2.setScore(100);
    }
}
```
* 위처럼 static으로 접근하는 객체가 `상태를 가지게 될 경우` 상태가 계속 유지된다
* 언제, 어디서, 어떻게 접근이 일어날 지 예측할 수 없는 static이기 때문에 현태 상태를 가정할 수 없다
* TDD에서도 static method, static variable을 테스트하기 어렵다고 한다
  * TDD는 기본적으로 상태에 기반한 행위의 결과를 비교하는 경우가 많다

```java
// example - 객체, 메소드 내에서 `현재 시간을 기반`으로 뭔가를 하는 경우
public class ZonedDateTimeUtils {

    public static boolean isAfterDays(ZonedDateTime standardDateTime, long days) {
        ZonedDateTime utcNow = ZonedDateTime.now(ZoneOffset.UTC);
        return standardDateTime.isAfter(utcNow.plusDays(days));
    }
}
```
* 위와 같이 시시때때로 변하는 현재시간이라는 환경은 TDD를 어렵게 만들고, 계속 실패하는 Test는 신뢰할 수 없는 요인이 된다

<br>

## 정리
* static은 최대한 안 쓰는 게 좋다
* static 사용시 상태를 `저장, 혹은 변경하지 않는` 방식으로 사용
  * Math.PI - static final로 상태 변경 불가
  * System.out.println() - 상태를 저장하지 않는다
  * immutable 객체
    * String
    * setter를 지원하지 않고, field 값이 setting되면 변하지 않는다 

---

<br>

> #### Reference
> * [Java의 static, 득과 실, 어떻게 사용할 것인가?](http://blog.doortts.com/119)
