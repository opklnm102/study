# 약한 참조, 반복자, 발생자

## Weak Reference
* 캐싱에 효과적
* Weak Reference만 가지고 있으면 GC가 메모리에서 제거한다

### 1. weakref.ref(obj)
* WeakReference 생성
```python
import sys, weakref

class C:
    pass

c = C()
c.a = 1
print('refcount', sys.getrefcount(c))  # refcount 2

d = c
print('refcount', sys.getrefcount(c))  # refcount 3

r = weakref.ref(c)
print('refcount', sys.getrefcount(c))  # refcount 3

print(r)  # weakref object
print(r())  # weakref object return

print(c)  # object
print(r().a)  # 1

# 모든 reference가 사라져 weakref도 사라짐
del c
del d
print(r())  # None

# dict는 weakref X
d = {'one': 1, 'two': 2}
wd = weakref.ref(d)  # error
```

### 2. weakref.proxy(obj)
* 생성된 WeakReference 전달받기
```python
import sys, weakref

class C:
    pass

c = C()
c.a = 2
print('refcount ', sys.getrefcount(c))  # 2

p = weakref.proxy(c)
print('refcount ', sys.getrefcount(c))  # 2

# p랑 c는 같은 객체의 레퍼런스를 지닌다
print(p)  # <__main__.C object at 0x7fa3b8db81d0>
print(c)  # <__main__.C object at 0x7fa3b8db81d0>
print(p.a)  # 2

c = C()
r = weakref.ref(c)
p = weakref.proxy(c)
print(weakref.getweakrefcount(c))  # 2
print(weakref.getweakrefs(c))  
```

### weak dictionary
```python
c = C()
c.a = 4
d = weakref.WeakValueDictionary()
print(d)  # WeakValueDictionary

d[1] = c
print(d.items())  # generator object WeakValueDictionary.items
print(d[1].a)  # 4

del c
print(d.items())
```

### iterator
* iterable 객체
  * `List`, `Set`, `Dictionary`, `문자열` 등과 같이 `for`문을 사용해서 하나씩 데이터 처리 가능한 객체
* `iterable.__next__()`으로 데이터를 꺼내온다
```python
Iter = iter([1, 2, 3])

print(Iter.__next__())  # 1
print(Iter.__next__())  # 2
print(Iter.__next__())  # 3

# list for-in
def f(x):
    print(x + 1)


for x in [1, 2, 3]:
    f(x)

for x in iter((1, 2, 3)):
    f(x)

# list iterator
t = iter([1, 2, 3])
while True:
    try:
        x = t.__next__()
    except StopIteration:
        break
    f(x)
```

### class iterator
* class를 `iterable`하게 하려면 `iter()`를 작성
```python
class Seq:
    def __init__(self, fname):
        self.file = open(fname)

    def __iter__(self):  # iter() matching
        return self

    def __next__(self):
        line = self.file.readline()
        if not line:
            raise StopIteration
        return line


s = Seq('removeme.txt')
for line in s:
    print(line)

print(list(Seq('removeme.txt')))  # list로 변형
print(tuple(Seq('removeme.txt')))  # tuple로 변형
```

### dictionary iterator
```python
d = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5}

for key in d:
    print(key, d[key])

for key in iter(d):
    print(key, d[key])

for key in d.__iter__():  # key iterator
    print(key)

for key in d.items():  # (key, value) iterator
    print(key)
```

### file iterator
```python
f = open('removeme.txt')
print(f.__next__())  # first line

for line in f:
    print(line)
```

## Generator
* Iterator의 특수한 형태
* 처음으로 만나는 `yield`에서 값을 리턴
* Generator가 다시 호출되면, 직전에 실행되었던 `yield`부터 다음 `yield`까지 실행
* List, Set과 같은 컬렉션은 이미 가지고 있는 값을 리턴, Generator는 데이터를 갖지 않은 상태에서 `yield`를 사용해 데이터를 `하나씩 리턴`하는 함수
* 사용하면 좋은 경우
   * 데이터가 무제한이여서 모든 데이터를 리턴할 수 없는 경우
   * 데이터가 대량이라 일부씩 처리하는 것이 필요한 경우
   * 모든 데이터를 미리 계산하면 속도가 느려서 그때 그때 처리해야하는 경우 등
```python
def generate_ints(N):
    for i in range(N):
        yield i

gen = generate_ints(3)
print(gen.__next__())  # 0
print(gen.__next__())  # 1
print(gen.__next__())  # 2

# 0 1 2 3 4
for x in generate_ints(5):
    print(x)
```

### Generator Expression
* list comprehension과 달리 표현식을 갖는 Generator객체만 리턴
   * 실행은 하지 않고, 표현식만 가지고 `yield방식으로 Lazy Operation`실행
```python
# list comprehension
print([k for k in range(100) if k % 5 == 0])  # [0, 5, ... , 95]

# generator expression
g = (k for k in range(100) if k % 5 == 0)
print(a.__next__())  # 0
print(a.__next__())  # 5

for x in g:
    print(x)
```

### example
#### sum
```python
print(sum(k for k in range(100) if k % 5 == 0))  # 950
```

#### fibonacci
```python
def fibonacci(a=1, b=1):
    while True:
        yield a
        a, b = b, a + b

for k in fibonacci():
    if k > 100:
        break
    print(k, end=' ')
```

```python
# iterator
class Odds:
    def __init__(self, limit=None):
        self.data = -1
        self.limit = limit

    def __iter__(self):
        return self

    def __next__(self):
        self.data += 2
        if self.limit and self.limit <= self.data:
            raise StopIteration
        return self.data

# 1 3 5 7 9 11 13 15 17 19
for k in Odds(20):
    print(k, end=' ')
print()
print(list(Odds(20)))  # [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]


# generator
def odds(limit=None):
    k = 1
    while not limit or limit >= k:
        yield k
        k += 2

# 1 3 5 7 9 11 13 15 17 19
for k in odds(20):
    print(k, end=' ')
print()
print(list(odds(20)))  # [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
```

```python
# getOddSquare()함수 호출과 함께 인자에 값을 주면 해당 값보다 작은 홀수들에 대해 제곱값을 반복적으로 출력

def getOddSquare(limit):
    n = 1
    while n <= limit:
        yield n * n
        n += 2

for k in getOddSquare(10):
    print(k, end=' ')
```
