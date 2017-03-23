# Function
* 여러 개의 Statement들을 `하나로 묶은` 단위
* 함수 이름 자체는 `함수 객체의 레퍼런스`를 지닌다
* 함수는 `객체`
* 장점
   * 반복적인 수행이 가능
   * 코드를 논리적으로 이해하는데 도움
   * 코드의 일정부분을 별도의 논리적 개념으로 독립화

## Function Define
```python
def add(a, b):
	return a + b

add(1, 2)  # 3
```

### 레퍼런스를 다른 변수에 할당해 호출 가능
```python
f = add  
f(4, 5)  # 9
f is add  # True
```

### 함수의 몸체에는 최소 1개 이상의 statement가 존재
* 아무런 내용이 없는 몸체를 지닌 함수를 만들 때는 `pass`키워드를 적는다.
```python
# empty function
def simple_function():  
	pass  # 아무것도 수행하지 않고 지나가겠다는 의미
```

### example
```python
def myabs(x):
	if x < 0:
		x = -x
	return x

abs(-4)  # 4 
myabs(-4)  # 4


def addmember(members, newmember):
	if newmember not in members:  # 기존 멤버가 아니면
		members.append(newmember)  # 추가

members = ['hwang', 'lee', 'park']
addmember(members, 'jo')
addmember(members, 'lee')
print(members)
```

## 함수 인수 전달방법
* 기본적으로 `call by value`
   * 하지만 `변수에 저장된 값이 reference`이므로 실제로는 `call by reference`로 실행
* 인자에 `Immutable`객체인 숫자값 전달
   * 함수 내에서 다른 숫자값으로 치환 -> 의미없는 인자 전달
* 함수의 레퍼런스와 실행문의 레퍼런스가 따로
```python
def f1(b):
	print(b)
	b = 100
	print(b)

a = 200  # a는 200의 레퍼런스값을 가진다
# 호출시 레퍼런스가 b에 복사
f1(a)  # 200, 100
print(a)  # 200


def f2(b):
	b = "abc"
	#b[0] = 's'  # error
	print(b[0])

a = "def"
f2(a)  # a
print(a)  # def


def f3(b):
	b = (1, 2, 3)
	print(b)

a = (4, 5, 6)
f3(a)  # (1, 2, 3)
print(a)  # (4, 5, 6)
```

## 인자에 리스트(Mmutable) 전달 및 내용 수정
* 전형적인 인자 전달 및 활용
```python
def f4(b):
	b[1] = 10

a = [4, 5, 6]
f4(a)
print(a)  # [1, 10, 3]

def f5(b):
	b['a'] = 10

a = {'a': 1, 'b': 2}
f5(a)
print(a)  # {'a': 10, 'b': 2}
```

## return statement
### None return
```python
# 인수 없이 리턴하면 None객체 리턴
def nothing():
	return  

print(nothing())  # None


# return문이 없는 함수라도 실제로는 None객체 리턴
def print_menu():
	print('1. Snack')
	print('2. Snake')
	print('3. Snick')

a = print_menu()  
print(a)  # None
```

### single return
```python
def myabs(x):
	if x < 0:
		return -x
	return x

myabs(-10)  # 10
```

### multiple return
```python
def swap(x, y):
	return y, x  # ',' (=(y,x)) single tuple return

a = 10
b = 20
print(a, b)  # 10 20

a, b = swap(a, b)
print(a, b)  # 20 10

t = swap(a, b)
print(t)  # (10, 20)
print(t[0], t[1])  # 10 20


def length_list(l):
	res = []
	for el in l:
		res.append(len(el))
	return res

l = ['python', 'pyson', 'pythong', 'pydon']
print(length_list(l))  # [6, 5, 7, 5]
print([len(s) for s in l])  # [6, 5, 7, 5]
```

## dynamic typing
* 모든 객체는 `동적으로(실행시간에) 타입이 결정`
* 함수 `호출시에 객체 타입에 맞게 실행`됨
```python
def add(a, b):
	return a + b

c = add(1, 3.4)  # 4.4
d = add('dynamic', 'typing')  # dynamictyping
e = add(['list'], ['and', 'list'])  # ['list', 'and', 'list']
```

## function parameter

### 1. default parameter - 인수를 넘겨주지 않아도 `기본적으로 가지는 값`
* default paremeter는 `맨 뒤`에 와야한다
```python
def incr(a, step=1):
	return a + step

b = 1
b = incr(b)  # 1 increment
print(b)  # 2

b = incr(b, 10)  # 10 increment
print(b)  # 12


# 여러개의 기본 인수 정의 가능
def incr(a, step=1, step2=10):
	return a + step + step2

print(incr(10))  # 21
```

### 2. keyword parameter
```python
def area(height, width):
	return height * width

# 순서가 아닌 이름으로 값이 전달
a = area(height='height string ' ,width=3)
print(a)  # 'height string height string height string`

b = area(width=20, height=10)
print(b)  # 200
```

#### keyword paremeter는 맨뒤에 위치
```python
print(area(20, width=5))
print area(width=20, 5)  # error
```

#### default + keyword parameter
```python
def incr(a, step1=1, step2=10, step3=100):
	return a + step1 + step2 + step3

print incr(10, 2, step2=100)
print incr(10, 2, step2=100, 200)  # error
print incr(10, 2, step2=100, step3=200)
```

## 가변 인수 리스트
* 함수 정의시 `*var`형식의 인수로 가변 인수를 선언
* 호출시 일반 `인수에 할당되는 값을 제외한 나머지 값들을 지닌 튜플`객체 생성
```python
def varg(a, *arg):  # *arg -> tuple type
	print(a, arg)  # 2 (3, 4, 5, 6)  
	print(arg[0], arg[1])  # 3 4

varg(2, 3, 4, 5, 6)  


# C language printf: 가변인수를 사용
def printf(format, *args):
	print(format % args)

printf("I've spent %d days and %d night to do this %d", 6, 5, 100)  # I've spent 6 days and 5 night to do this 100
```

## tuple, dictionary parameter
* 함수 `정의`시 `*` 사용: `가변인수`
* 함수 `호출`시 `*` 사용: `튜플 전체` 호출 가능
* 함수 호출시 `**` 사용: `사전 전체` 호출 가능
```python
def h(a, b, c):
	print(a, b, c)

args = (1, 2, 3)
h(args[0], args[1], args[2])  # 1 2 3
h(*args)  # 1 2 3

dargs = {'a': 1, 'b': 2, 'c': 3}  # 인자의 이름과 동일한 키값을 가져야 한다.
h(**dargs)  # 1 2 3
```

## example
```python
# 임의의 문자열로 이루어진 리스트를 받아서 각 문자열 마지막에 '!'를 덧붙인 새로운 리스트를 반환하는 함수 myfunc(t)를 정의하고 테스트
def myfunc(t):
	res = []
	for el in t:
		res.append(el + '!')
	return res

l = ["Hello", "Python", "Programming", "Language"]
print(myfunc(l))  # ['python!', 'pyson!', 'pythong!', 'pydon!']
```
