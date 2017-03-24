# lambda(축약 함수)
* 일반적인 함수를 `한줄의 Statement로 정의`할 수 있는 새로운 함수정의 리터럴
   * 함수몸체에는 `expression`만이 올 수 있다
* 대부분의 경우 이름을 정의하지 않으면서 `일회성으로 활용할 함수`를 정의
* 구문
```python 
lambda 인자: expression
```

## 인수가 1개 있는 람다
* `:`뒤에는 식만 온다
* 람다도 하나의 객체
```python
f = lambda x: x + 1  
f(1)  # 2
```

## 인수가 2개가 있는 람다
```python
g = lambda x, y: x + y
g(1, 2)  # 3
```

## 기본 인수를 지니는 람다
```python
incr = lambda x, inc = 1: x + inc  # inc - default parameter
incr(10)  # 11
incr(10, 5)  # 15
```

## 가변 인수를 지니는 람다함수 정의
```python
vargs = lambda x, *args: args
vargs(1, 2, 3, 4, 5)  # (2, 3, 4, 5)
```

## example
```python
# general function
def f1(x):
	return x * x + 3 * x - 10

def f2(x):
	return x * x * x

def g(func):
	return [func(x) for x in range(-2, 2)]

g(f1)  # [-12, -12, -10, -6]
g(f2)  # [-8, -1, 0, 1]

# lambda function
g(lambda x: x*x + 3*x - 10)  # [-12, -12, -10, -6]
g(lambda x: x*x*x)  # [-8, -1, 0, 1]
```

```python
# +, -, *, /에 해당하는 람다함수 리스트 정의
func = [lambda x, y: x + y, lambda x, y: x - y, lambda x, y: x * y, lambda x, y: x / y]

def menu():
	print("0. add")
	print("1. sub")
	print("2. mul")
	print("3. div")
	print("4. quit")
	return input('Select menu: ')

while 1:
	sel = int(menu())
	if sel < 0 or sel > len(func):
		continue
	if sel == len(func):
		break
	x = int(input('First operand: '))
	y = int(input('Second operand: '))
	print('Result = ', func[sel](x, y))
```

## map(function, seq)
* seq(시퀀스 자료형)가 지닌 원소들에 대해 `function에 적용`한 결과를 `동일한 시퀀스 자료형`으로 반환
* 쌍을 지어주는 것
```python
def f(x):
	return x * x

X = [1, 2, 3, 4, 5]
list(map(f, X))

Y = []
for x in X:
	y = f(x)
	Y.append(y)
print(Y)  # [1, 4, 9, 16, 25]
```

### map() + lambda -> `recommend`
```python
X = [1, 2, 3, 4, 5]
list(map(lambda x: x * x, X))  # [1, 4, 9, 16, 25]
```

### example
```python
# range(10)의 모든 값 x에 대해 f=x*x + 4*x + 5의 결과를 리스트로 구함
y = map(lambda x: x*x + 4*x + 5, range(10))
print(y)

# 각 단어들의 길이 리스트
y = map(lambda x: len(x), ["Hello", "Python", "Sing"])
print(y)
```

## filter(function, seq)
* seq(시퀀스 자료형)가 지닌 각 원소들에 대해 `function에 적용한 결과가 참인 것만` 동일 시퀀스로 반환
* 조건에 따라 `값을 걸러냄`, 함수를 충족하는 값만 반환

### filter() + lambda
```python
list(filter(lambda x: x > 2, [1, 2, 3, 34]))  # [3, 34]

# filter() + lambda을 사용하지 않을 때
y = []
for x in [1, 2, 3, 34]:
	if x > 2:
		y.append(x)
print(y)  # [3, 34]
```

### example
```python
# 주어진 시퀀스 내에 있는 정수중 홀수만 필터링
list(filter(lambda x: x % 2, [1, 2, 3, 4, 5, 6]))  # x % 2 = 1(True), = 0(False)

# 주어진 시퀀스 내에 있는 정수중 짝수만 필터링
list(filter(lambda x: x % 2 - 1, [1, 2, 3, 4, 5, 6]))

# 특정 범위에 있는 정수만 필터링
def f():
	x = 1
	return list(filter(lambda a: a > x, range(-5, 5)))

f() # [2, 3, 4]

# filter()의 결과는 주어진 seq자료형과 동일
list(filter(lambda x: x > 2, [1, 2, 3, 34]))  # [3, 34]
list(filter(lambda x: x > 2, (1, 2, 3, 34)))  # [3, 34]

# ASCII Code compare
list(filter(lambda x: x < 'a', 'abcABCdefDEF'))  
```

## reduce(function, seq[, inital])
* 시퀀스 자료형이 지닌 원소값들에 대해 `function을 적용하면서 하나의 값으로 매핑`
* function은 `2개의 인자`를 받아야한다
   * `시퀀스의 원소는 y에 순차적`으로 들어 간다
   * `함수가 수행된 값은 x에 순차적`으로 들어간다
* 3번쨰 인자인 inital은 첫번째 단계에 할당할 `초기값`으로 사용
```python
from functools import reduce

reduce(lambda x, y: x + y, [1, 2, 3, 4, 5])  # 15
reduce(lambda x, y: x + y, [1, 2, 3, 4, 5], 100)  # 115
```

### example
```python
# 1 ~ 10까지의 곱
# reduce() + lambda을 사용하지 않을 때
x = 0
for y in range(1, 11):
	x = x + y * y
x  # 385

# reduce() + lambda 
reduce(lambda x, y: x + y * y, range(1, 11), 0)  # 385

# string reverse -> lambda를 어떻게 작성하느냐에 따라 다채로운 결과가 나올 수 있다
reduce(lambda x, y: y + x, 'abcde')

# 주어진 리스트 t=[1,2,3,4,5,6,7,8,9]에 대해 홀수만 필터링하여 총합을 구해라
# lambda, filter(), reduce() 사용
t = [1, 2, 3, 4, 5, 6, 7, 8, 9]
odd_list = filter(lambda x: x % 2, t)
reduce(lambda x, y: x + y, odd_list)  # 25

reduce(lambda x, y: x + y, filter(lambda x: x % 2, t)) # 25
```
