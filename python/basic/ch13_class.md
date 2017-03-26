# 클래스와 객체

## class
* 새로운 이름 공간을 지원하는 또 다른 단위
* 클래스 정의 구문
```python
class <class name>:  # header
    <statements>  # body
```

### 인스턴스
* 클래스로부터 만들어낸 객체

### 모듈 vs 클래스 vs 인스턴스
* 이름공간을 제공해주는 대표적인 단위
   * 모듈: `파일 단위`로 이름 공간을 구성
   * 클래스: `클래스 영역` 내에 이름공간을 구성
   * 인스턴스: `인스턴스 영역` 내에 이름공간을 구성

```python
class S1:
    a = 1

S1.b = 2  # 클래스 이름 공간에 새로운 이름 생성

print(dir(S1))  # S1에 포함된 이름들을 리스트로 반환
del S1.b  # 이름 공간 S1에서 b삭제
```

### 동적으로 인스턴스 외부에서 인스턴스 멤버를 추가할 수 있음
* 클래스와 독립적으로 각 인스턴스를 하나의 이름공간으로 취급
```python
x = S1()  # x는 S1의 인스턴스, S1() -> 생성자 호출 
print(x.a)

x.a = 10  # 인스턴스 x의 이름 공간에 이름 생성
print(x.a)

print(S1.a)  # 클래스 이름공간과 클래스 인스턴스의 이름 공간은 다르다.


class Simple():
	pass

s1 = Simple()
s2 = Simple()

s1.stack = []
s1.stack.append(1)
s1.stack.append(2)
s1.stack.append(3)

print(s1.stack)
print(s1.stack.pop())
print(s1.stack.pop())
print(s1.stack)

print(s2.stack)  # error -> s2에는 stack이 없다
```

## class method
* 클래스 내부에 메소드 선언
   * `def` 키워드 사용
* 일반 변수와 다른 점은 첫번째 인수로 `self`사용(관례적)
   * self: `인스턴스 객체 자신의 레퍼런스`를 지니고 있음
   * 각 인스턴스들은 `self를 이용하여 자신의 이름공간에 접근`
```python
class MyClass:
	def set(self, v):
		self.value = v

	def get(self):
		return self.value


# 인스턴스 객체를 통하여 메소드를 호출할 때 self인자는 없다고 생각
c = MyClass()  # 인스턴스 생성
c.set('egg')  # set() 호출
print(c.get())  # get() 호출
print(c.value)  # 인스턴스 변수에 직접 접근

# 아래코드는 위코드와 동일
c2 = MyClass()
MyClass.set(c2, 'egg')
print(MyClass.get(c2))
print(c2.value)

class Simple:
	pass

c = MyClass()
s1 = Simple()
MyClass.set(s1, 'egg')  # error -> 자신의 레퍼런스만 가질 수 있다
```

### 메소드 호출 종류
* Unbound method call: `클래스를 이용`한 메소드 호출
   * ex) Myclass.set(c, 'egg')
* Bound method call: `인스턴스를 이용`한 메소드 호출
   * self 인자는 호출받는 객체가 `자동으로 할당`
   * ex) c.set('egg')

### 클래스 내부에서의 메소드 호출
```python
class MyClass:
	def set(self, v):
		self.value = v
	
    def incr(self):
		self.set(self.value + 1)  # 내부 메소드 호출
	
    def get(self):
		return self.value


c = MyClass()
c.set(1)
print(c.get())
c.incr()
print(c.get())
```

> #### 만약 위 코드에서 self.set(self.value + 1)을 set(self.value + 1)으로 바꾸면 set()을 정적영역에서 찾는다
> * self가 없으면 메소드를 `class 밖`에서 찾음
> * 메소드에서 `내부 메소드 호출시 반드시 self` 사용
> ```python
> def set(i):
> 	print('set function - ', i)
> 
> class MyClass:
> 	def set(self, v):
> 		self.value = v
> 
> 	def incr(self):
> 		set(self.value + 1)  # 정적 영역에 존재하는 set()호출
> 	
>   def get(self):
> 		return self.value
> 
> c = MyClass()
> c.set(1)
> print(c.get())  # 1
> c.incr()  # set function -  2
> print(c.get())  # 1
> ```

### static method
* 인스턴스 객체와 무관하게 `클래스 이름공간에 존재`하는 메소드로 클래스 이름을 이용하여 직접 호출할 수 있는 메소드
* 해당 클래스의 `인스턴스를 통해서도 호출 가능`
* 장식자(Decorator) `@staticmethod`활용
```python
class D:
	@staticmethod
	def spam(x, y):  # self가 없다.
		print('static method', x, y)

D.spam(1, 2)  # 클래스를 통해 직접 호출
d = D()
d.spam(1, 2)  # 인스턴스를 통해서도 호출 가능(비추천)
```

### class method
* 인스턴스 객체와 무관하게 `클래스 이름공간에 존재`하는 메소드로 클래스 이름을 이용하여 호출하며 `첫 인수로 클래스 객체를 자동으로 받는 메소드`
*  해당 클래스의 `인스턴스를 통해서도 호출 가능`
* 장식자(Decorator) `@classmethod`활용
```python
class C:
    @classmethod
    def spam(cls, y):
        print(cls, '->', y)

print(C)  # <class '__main__.C'>

# 첫번째 인수로 C가 잠재적으로 전달
C.spam(5)  # <class '__main__.C'> -> 5
c = C()

# 인스턴스를 통해서도 호출 가능(비추천)
c.spam(5)  # <class '__main__.C'> -> 5
```

### subclass
```python
class C:
    @classmethod
    def spam(cls, y):
        print(cls, '->', y)

class D(C):  # 상속
	pass

D.spam(3)  # 첫번째 인수로 서브클래스가 전달

d = D()
d.spam(3)  # 인스턴스를 통해서도 호출 가능(비추천)
```

### class member vs instance member
* class member
   * 클래스 이름공간에 생성
   * 모든 인스턴스들에 의해 공유
* instance member
   * 인스턴스 이름공간에 생성
   * 각각의 인스턴스마다 독립성 보장
```python
class Var:
	c_mem = 100  # class member

	def f(self):
		self.i_mem = 200  # instance member
	
    def g(self):
		print(self.i_mem)
		print(self.c_mem)

# 클래스 객체를 통하여 클래스 멤버 접근
print(Var.c_mem)  # 100

# 인스턴스를 통하여 클래스 멤버 접근
v1 = Var()  # 인스턴스 생성
print(v1.c_mem)  # 100

# 인스턴스를 통하여 인스턴스 멤버 접근
v1.f()  # 인스턴스 멤버 생성
print(v1.i_mem)  # 200

v2 = Var()
print(v2.i_mem)  # error -> 인스턴스 v2에는 아직 i_mem이 없다
```

### instanceName.memberName으로 멤버를 참조할 때 순서
1. instance member
2. instance member가 없다면 class member
```python
class Var:
	c_mem = 100  # class member

	def f(self):
		self.i_mem = 200  # instance member
	
    def g(self):
		print(self.i_mem)
		print(self.c_mem)

v1 = Var()  
v2 = Var()

print(v1.c_mem)  # 100, 인스턴스 v1를 통해 클래스 맴버 참조
print(v2.c_mem)  # 100, 인스턴스 v2를 통해 클래스 맴버 참조

v1.c_mem = 50  # 인스턴스 이름 공간에 c_mem생성
print(v1.c_mem)  # 50, 인스턴스 v1를 통해 인스턴스 맴버 참조
print(v2.c_mem)  # 100, 인스턴스 v2를 통해 클래스 맴버 참조

print(Var.c_mem)  # 100, 클래스 맴버 참조
```

### constructor, destructor
* `__init__` - 생성자
   * 객체가 생성될 떄 자동으로 호출
   * self인자가 정의되어야함
* `__del__` - 소멸자
   * 객체가 소멸(메모리에서 해제)될떄 자동으로 호출
   * self인자가 정의되어야함
   * 개발자가 특별히 작성하지 않아도될 메소드
      * 파이썬에서는 메모리나 기타 자원들의 해제가 자동으로 되기 때문
   
> #### '__'의 의미
> * 예약된 이름

```python
from time import ctime, sleep


class Life:
    def __init__(self):  # constructor
        self.birth = ctime()  # current time
        print('Birthday', self.birth)

    def __del__(self):  # destructor
        print('Deathday', ctime())


def test():
    my_life = Life()
    print('Sleeping for 3 sec')
    sleep(3)


test()
```

#### 인자를 받는 생성자 호출가능
```python
class MyInteger:
    def __init__(self, num):
        self.num = num

    def __str__(self):  # print나 str() 호출에 대응되는 메소드
        return '--- ' + str(self.num) + ' ---'

    def increment(self, num):
        self.num += num
        return self

    def sub(self, num):
        self.num -= num
        return self


i = MyInteger(10)
print(i)  # --- 10 ---
print(str(i))  # --- 10 ---

k = MyInteger(10)
print(k)  # --- 10 ---

k = k.increment(5)
print(k)  # --- 15 ---

k = k.sub(10)
print(k)  # --- 5 ---
```
