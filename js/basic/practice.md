# [JavaScript] JavaScript Example

## example1
* example1.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <script type="text/JavaScript">
    document.writeln("fdfd")
  </script>

<script src="example1.js" charset="utf-8"></script>

</body>
</html>
```

* example1.js
```js
document.writeln("write test");

var add = function(op1, op2) {
    return op1 + op2;
}

document.writeln(add(3, 6);)

function sum(array, start, end) {

    if(!array) {
        array = [];
    }

    if(!start) {
        start = 0;
    }

    if(!end) {
        end = array.lenght;
    }

    if(array instanceof Array == false) {
        throw new Error('sum(): 1번째 매개변수는 배열이여야 합니다');
    }

    if((typeof start) != 'number' || (typeof end) != 'number') {
        throw new Error('sum(): 2~3번째 매개변수는 숫자여야 합니다.')
    }

    var result = 0;
    for(var i = start; i < end; i++) {
        if((typeof array[i]) != 'number') {
            throw new Error('sum(): array[' + i + ']에 저장된 값 ' + array[i] + '는 숫자가 아닙니다.');
        }
        result += array[i];
    }
    return result;
}

var arr1 = [1, 2, 3, 4, 5];
var obj = {name:'홍길동', phone: '010-2222-3333'};
var arr2 = [1, ,2 'fd', 4, 5];

document.writeln(sum(arr1, 0, arr1.length));
document.writeln(sum(arr2));
```

<br>

## 로또 번호 생성기
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Practice1 로또 번호 생성</title>
    <script type="text/javascript">

        function Lotto(numbers, balls) {
            this.numbers = numbers;
            this.balls = balls;
            this.luckNumbers = [];
        }

        Lotto.prototype.getLuckyNumbers = function() {
            while(true) {
                var ball = Math.floor(Math.random() * this.numbers) + 1;

                if(this.luckyNumbers.indexOf(ball) == -1){
                    this.luckyNumbers.push(ball);
                }

                if(this.luckyNumbers.length == this.balls){
                    break;
                }
            }
            return this.luckyNumbers;
        };

        var myLotto = new Lotto(45, 6);
        document.writeln(myLotto.getLuckyNumbers());
    </script>
</head>
<body>

</body>
</html>
```
