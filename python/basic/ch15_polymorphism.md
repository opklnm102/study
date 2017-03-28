# 상속과 다형성

## 상속
```python
class Person:
    def __init__(self, name, phone=None):
        self.name = name
        self.phone = phone

    def __str__(self):
        return '<Person %s %s>' % (self.name, self.phone)


class Employee(Person):  # 괄호안에 쓰여진 클래스는 슈퍼클래스
    def __init__(self, name, phone, position, salary):  # overriding
        Person.__init__(self, name, phone)  # Person클래스의 생성자 호출
        self.position = position
        self.salary = salary

p1 = Person('dong', 1498)
print(p1.name)  # dong
print(p1)  # <Person dong 1498>

m1 = Employee('kim', 5432, 'publisher', 200)
m2 = Employee('hee', 3341, 'team leader', 300)
print(m1.name, m1.position)  # super class, sub class member print
print(m1)
print(m2.name, m2.position)
print(m2)
```

### constructor call
```python
# 1. 
class Super:
    def __init__(self):
        print('Super init called')

class Sub(Super):
    def __init__(self):
        print('Sub init called')

s = Sub()  # Sub init called


# 2. 
class Super:
    def __init__(self):
        print('Super init called')

class Sub(Super):
    def __init__(self):
        Super.__init__(self)
        print('Sub init called')

s = Sub()  # Super init called, Sub init called


# 3.
class Sub(Super):
    pass

s = Sub()  # Super init called
```


### method override
```python
class Person:
    def __init__(self, name, phone=None):
        self.name = name
        self.phone = phone

    def __str__(self):
        return '<Person %s %s>' % (self.name, self.phone)


class Employee(Person):  # 괄호안에 쓰여진 클래스는 슈퍼클래스
    def __init__(self, name, phone, position, salary):  # overriding
        Person.__init__(self, name, phone)  # Person클래스의 생성자 호출
        self.position = position
        self.salary = salary

    def __str__(self):  # overriding
        return '<Employee %s %s %s %s>' % (self.name, self.phone, self.position, self.salary)

p1 = Person('dong', 1465)
m1 = Employee('kim', 2343, 'publisher', 200)
print(p1)  # <Person dong 1465>
print(m1)  # <Employee kim 2343 publisher 200>
```

## polymorphism
* `method overriding`을 통해 다형성 구현
```python
class Animal:
    def cry(self):
        print('...')


class Dog(Animal):
    def cry(self):  # overriding
        print('dog dog')


class Duck(Animal):
    def cry(self):  # overriding
        print('duck duck')


class Fish(Animal):
    pass


for each in (Dog(), Duck(), Fish()):
    each.cry()
```


### 내장 자료형과 클래스의 통일
```python
class MyList(list):  # 기본 자료형: list 상속
    def __sub__(self, other):  # '-' overloading
        for x in other:
            if x in self:
                self.remove(x)
        return self


L = MyList([1, 2, 3, 'spam', 4, 5])
print(L)  # [1, 2, 3, 'spam', 4, 5]

L -= ['spam', 4]
print(L)  # ['spam', 4]
```

#### 1. Stack
```python
class Stack(list):
    push = list.append

s = Stack()
s.push(4)
s.push(5)
print(s)  # [4, 5]

s = Stack([1, 2, 3])
s.push(4)
s.push(5)
print(s)  # [1, 2, 3, 4, 5]

print(s.pop())  # 5, super class pop() called
print(s.pop())  # 4
print(s)  # [1, 2, 3]
```

#### 2. Queue
```python
class Queue(list):
    enqueue = list.append

    def dequeue(self):
        return self.pop(0)


q = Queue()
q.enqueue(1)  # data input
q.enqueue(2)
print(q)  # [1, 2]

print(q.dequeue())  # 1, data output
print(q.dequeue())  # 2
```

#### 3. Dictionary에서 Key List를 항상 일정하게 구하기
```python
class MyDict(dict):
    def keys(self):  # overriding
        key_list = list(dict.keys(self))  # unbound method call
        # key_list = list(self.keys())  # error -> recursive call
        key_list.sort()
        return key_list


# dict.keys() -> 순서가 랜덤
d = MyDict({'one': 1, 'two': 2, 'three': 3})
print(d.keys())
```

### class information get
* 객체가 어떤 `클래스에 속해 있는지` 확인

#### 객체의 자료형 비교 방법1. (전통적, 비추) 
```python
print(type(123) == type(0))
```

#### 객체의 자료형 비교 방법2. (새로운, 추천)
```python
print(isinstance(123, int))  # True

class A:
    pass

class B:
    def f(self):
        pass

class C(B):
    pass

def check(obj):
    print(obj, '=>')
    if isinstance(obj, A):
        print('A')
    if isinstance(obj, B):
        print('B')
    if isinstance(obj, C):
        print('C')


a = A()
b = B()
c = C()

check(a)
check(b)
check(c)
```

### 클래스 간의 상속 관계 확인
```python
def check(obj):
	print obj, '=>',
	if issubclass(obj, A):
		print 'A',
	if issubclass(obj, B):
		print 'B',
	if issubclass(obj, C):
		print 'C',
	print

check(A)
check(B)
check(C)
```